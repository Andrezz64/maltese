import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import { Post, PostMeta } from "@/types/post";

const postsDirectory = path.join(process.cwd(), "content/posts");

// Configure marked options
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

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith(".md") || fileName.endsWith(".mdx"))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx?$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");

      const { data, content } = matter(fileContents);

      const readingTime = data.readingTime || calculateReadingTime(content);

      return {
        slug: data.slug || slug,
        title: data.title || "Sem título",
        date: data.date ? String(data.date) : new Date().toISOString().split("T")[0],
        summary: data.summary || "",
        category: data.category || "Geral",
        tags: Array.isArray(data.tags) ? data.tags : [],
        readingTime,
        featured: Boolean(data.featured),
        epigraph: data.epigraph || undefined,
        author: data.author || "Maltese",
      } as PostMeta;
    });

  // Sort posts by date descending
  return allPostsData.sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const fullPathMd = path.join(postsDirectory, `${slug}.md`);
    const fullPathMdx = path.join(postsDirectory, `${slug}.mdx`);
    
    let fullPath = "";
    if (fs.existsSync(fullPathMd)) {
      fullPath = fullPathMd;
    } else if (fs.existsSync(fullPathMdx)) {
      fullPath = fullPathMdx;
    } else {
      // Look for slug match in frontmatters
      const allFiles = fs.readdirSync(postsDirectory);
      for (const file of allFiles) {
        if (file.endsWith(".md") || file.endsWith(".mdx")) {
          const filePath = path.join(postsDirectory, file);
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
      title: data.title || "Sem título",
      date: data.date ? String(data.date) : new Date().toISOString().split("T")[0],
      summary: data.summary || "",
      category: data.category || "Geral",
      tags: Array.isArray(data.tags) ? data.tags : [],
      readingTime,
      featured: Boolean(data.featured),
      epigraph: data.epigraph || undefined,
      author: data.author || "Maltese",
      content,
      htmlContent,
    };
  } catch (error) {
    console.error(`Error loading post ${slug}:`, error);
    return null;
  }
}

export function getAllCategories(): { name: string; count: number }[] {
  const posts = getAllPosts();
  const categoryMap = new Map<string, number>();

  posts.forEach((post) => {
    const cat = post.category || "Geral";
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
  });

  return Array.from(categoryMap.entries()).map(([name, count]) => ({
    name,
    count,
  }));
}

export function getAllTags(): { name: string; count: number }[] {
  const posts = getAllPosts();
  const tagMap = new Map<string, number>();

  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
