import { getAllPosts } from "@/lib/posts";
import siteConfig from "@site-config";

const base = siteConfig.url.replace(/\/$/, "");

export async function GET() {
  const posts = getAllPosts();

  const rssItems = posts
    .map((post) => {
      const postUrl = `${base}/textos/${post.slug}`;
      const coverImageTag = post.coverImage
        ? `<enclosure url="${post.coverImage}" type="image/jpeg" length="0"/>`
        : "";
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${post.summary}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <category><![CDATA[${post.category}]]></category>
      ${post.author ? `<author><![CDATA[${post.author}]]></author>` : ""}
      ${coverImageTag}
    </item>`;
    })
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title><![CDATA[${siteConfig.title} — ${siteConfig.tagline}]]></title>
    <link>${base}</link>
    <description><![CDATA[${siteConfig.description}]]></description>
    <language>${siteConfig.language}</language>
    <copyright><![CDATA[${siteConfig.title}]]></copyright>
    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
