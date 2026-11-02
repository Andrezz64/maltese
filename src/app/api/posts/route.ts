import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "@/lib/matter";

const postsDirectory = path.join(process.cwd(), "content/posts");

export async function GET() {
  try {
    if (!fs.existsSync(postsDirectory)) {
      return NextResponse.json({ posts: [] });
    }

    const fileNames = fs.readdirSync(postsDirectory);
    const posts = fileNames
      .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
      .map((fileName) => {
        const fullPath = path.join(postsDirectory, fileName);
        const raw = fs.readFileSync(fullPath, "utf8");
        const { data, content } = matter(raw);

        const words = content.trim().split(/\s+/).filter(Boolean).length;
        const readingTime = data.readingTime || `${Math.max(1, Math.ceil(words / 200))} min de leitura`;

        return {
          filename: fileName,
          slug: data.slug || fileName.replace(/\.mdx?$/, ""),
          title: data.title || "Sem título",
          date: data.date ? String(data.date) : new Date().toISOString().split("T")[0],
          summary: data.summary || "",
          category: data.category || "Geral",
          tags: Array.isArray(data.tags) ? data.tags : [],
          epigraph: data.epigraph || "",
          author: data.author || "Maltese",
          featured: Boolean(data.featured),
          readingTime,
          content: content.trim(),
          rawContent: raw,
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error reading posts from content/posts:", error);
    return NextResponse.json({ error: "Failed to read posts", posts: [] }, { status: 500 });
  }
}
