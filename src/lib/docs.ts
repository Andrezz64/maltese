import fs from "fs";
import path from "path";
import matter from "@/lib/matter";
import { marked } from "marked";
import { Doc, DocMeta, DocCategoryGroup } from "@/types/doc";

const docsDirectory = path.join(process.cwd(), "content/docs");

marked.setOptions({
  gfm: true,
  breaks: true,
});

function calculateReadingTime(text: string): string {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min de leitura`;
}

export function getAllDocs(): DocMeta[] {
  if (!fs.existsSync(docsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(docsDirectory);
  const allDocs = fileNames
    .filter((fileName) => fileName.endsWith(".md") || fileName.endsWith(".mdx"))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx?$/, "");
      const fullPath = path.join(docsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");

      const { data, content } = matter(fileContents);
      const readingTime = data.readingTime || calculateReadingTime(content);

      return {
        slug: data.slug || slug,
        title: data.title || "Documento sem título",
        order: typeof data.order === "number" ? data.order : 99,
        category: data.category || "Geral",
        summary: data.summary || "",
        date: data.date ? String(data.date) : undefined,
        readingTime,
      } as DocMeta;
    });

  return allDocs.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.title.localeCompare(b.title);
  });
}

export async function getDocBySlug(slug: string): Promise<Doc | null> {
  try {
    if (!fs.existsSync(docsDirectory)) {
      return null;
    }

    const fullPathMd = path.join(docsDirectory, `${slug}.md`);
    const fullPathMdx = path.join(docsDirectory, `${slug}.mdx`);

    let fullPath = "";
    if (fs.existsSync(fullPathMd)) {
      fullPath = fullPathMd;
    } else if (fs.existsSync(fullPathMdx)) {
      fullPath = fullPathMdx;
    } else {
      const allFiles = fs.readdirSync(docsDirectory);
      for (const file of allFiles) {
        if (file.endsWith(".md") || file.endsWith(".mdx")) {
          const filePath = path.join(docsDirectory, file);
          const raw = fs.readFileSync(filePath, "utf8");
          const { data } = matter(raw);
          if (data.slug === slug) {
            fullPath = filePath;
            break;
          }
        }
      }
    }

    if (!fullPath || !fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);
    const htmlContent = await marked.parse(content);
    const readingTime = data.readingTime || calculateReadingTime(content);

    return {
      slug: data.slug || slug,
      title: data.title || "Documento sem título",
      order: typeof data.order === "number" ? data.order : 99,
      category: data.category || "Geral",
      summary: data.summary || "",
      date: data.date ? String(data.date) : undefined,
      readingTime,
      content,
      htmlContent,
    };
  } catch (error) {
    console.error(`Erro ao carregar documento ${slug}:`, error);
    return null;
  }
}

export function getDocCategoryGroups(): DocCategoryGroup[] {
  const docs = getAllDocs();
  const map = new Map<string, DocMeta[]>();

  docs.forEach((doc) => {
    const cat = doc.category || "Geral";
    if (!map.has(cat)) {
      map.set(cat, []);
    }
    map.get(cat)!.push(doc);
  });

  return Array.from(map.entries()).map(([category, items]) => ({
    category,
    docs: items.sort((a, b) => a.order - b.order),
  }));
}
