"use client";

import { useTheme } from "./ThemeProvider";

interface ArticleContentProps {
  htmlContent: string;
}

export default function ArticleContent({ htmlContent }: ArticleContentProps) {
  const { fontSize } = useTheme();

  // Explicit font size map in rem
  const sizeMap = {
    normal: { size: "1.125rem", leading: "1.85" },
    large: { size: "1.35rem", leading: "1.95" },
    larger: { size: "1.6rem", leading: "2.05" },
  };

  const current = sizeMap[fontSize] || sizeMap.normal;

  return (
    <div
      data-fontsize={fontSize}
      className="prose-content transition-all duration-150"
      style={{
        fontFamily: "var(--font-serif-body)",
        fontSize: current.size,
        lineHeight: current.leading,
      }}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
