import fs from "fs";
import path from "path";
import matter from "@/lib/matter";
import { Author, AuthorMeta } from "@/types/author";

const authorsDirectory = path.join(process.cwd(), "content/authors");

function ensureDirectory() {
  if (!fs.existsSync(authorsDirectory)) {
    return false;
  }
  return true;
}

export function getAllAuthors(): AuthorMeta[] {
  if (!ensureDirectory()) return [];

  const fileNames = fs.readdirSync(authorsDirectory);
  return fileNames
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx?$/, "");
      const fullPath = path.join(authorsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);

      return {
        slug: data.slug || slug,
        name: data.name || slug,
        role: data.role || undefined,
        description: data.description || undefined,
        avatar: data.avatar || undefined,
        socials: data.socials || undefined,
        links: Array.isArray(data.links) ? data.links : undefined,
      } as AuthorMeta;
    });
}

export function getAuthorBySlug(slug: string): Author | null {
  if (!ensureDirectory()) return null;

  try {
    // Tenta achar por nome de arquivo
    const directPath = path.join(authorsDirectory, `${slug}.md`);
    const directPathMdx = path.join(authorsDirectory, `${slug}.mdx`);

    let fullPath = "";
    if (fs.existsSync(directPath)) {
      fullPath = directPath;
    } else if (fs.existsSync(directPathMdx)) {
      fullPath = directPathMdx;
    } else {
      // Busca pelo campo slug no frontmatter
      const files = fs.readdirSync(authorsDirectory);
      for (const file of files) {
        if (!file.endsWith(".md") && !file.endsWith(".mdx")) continue;
        const fp = path.join(authorsDirectory, file);
        const raw = fs.readFileSync(fp, "utf8");
        const { data } = matter(raw);
        if (data.slug === slug) {
          fullPath = fp;
          break;
        }
      }
    }

    if (!fullPath || !fs.existsSync(fullPath)) return null;

    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      slug: data.slug || slug,
      name: data.name || slug,
      role: data.role || undefined,
      description: data.description || undefined,
      avatar: data.avatar || undefined,
      socials: data.socials || undefined,
      links: Array.isArray(data.links) ? data.links : undefined,
      bio: content.trim(),
    };
  } catch (err) {
    console.error(`Erro ao carregar autor "${slug}":`, err);
    return null;
  }
}

/**
 * Normaliza uma string de nome: minúsculas, sem acentos,
 * colapsa múltiplos espaços em um único e faz trim.
 */
function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tenta resolver o autor de um post pelo campo author (string livre ou slug).
 * Primeiro tenta bater com slug exato, depois com name normalizado.
 */
export function resolveAuthor(authorField: string | undefined): Author | null {
  if (!authorField) return null;

  // Tenta por slug gerado a partir do nome
  const bySlug = getAuthorBySlug(
    authorField
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
  );
  if (bySlug) return bySlug;

  // Tenta por nome normalizado (tolera espaços duplos e diferenças de case/acento)
  const all = getAllAuthors();
  const match = all.find(
    (a) => normalizeName(a.name) === normalizeName(authorField)
  );
  if (match) return getAuthorBySlug(match.slug);

  return null;
}
