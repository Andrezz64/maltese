import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { getAllAuthors } from "@/lib/authors";
import siteConfig from "@site-config";

// Remove trailing slash to avoid double slashes
const base = siteConfig.url.replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const authors = getAllAuthors();

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${base}/textos/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: post.featured ? 0.9 : 0.8,
  }));

  const authorEntries: MetadataRoute.Sitemap = authors.map((author) => ({
    url: `${base}/autores/${author.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${base}/textos`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/autores`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/sobre`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...postEntries,
    ...authorEntries,
  ];
}
