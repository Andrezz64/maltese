"use client";

import { useEffect, useState } from "react";
import AuthorCard from "./AuthorCard";
import { Author } from "@/types/author";

interface AuthorCardClientProps {
  authorName: string;
  variant?: "header" | "footer";
}

export default function AuthorCardClient({ authorName, variant = "header" }: AuthorCardClientProps) {
  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authorName.trim()) {
      setAuthor(null);
      return;
    }
    setLoading(true);
    fetch(`/api/authors?name=${encodeURIComponent(authorName)}`)
      .then((r) => r.json())
      .then((data) => setAuthor(data.author ?? null))
      .catch(() => setAuthor(null))
      .finally(() => setLoading(false));
  }, [authorName]);

  if (!authorName.trim()) return null;

  if (loading) {
    // Skeleton matching the variant layout
    if (variant === "header") {
      return (
        <div className="flex items-center gap-3 pt-2 animate-pulse">
          <div
            className="w-9 h-9 rounded-full shrink-0"
            style={{ backgroundColor: "var(--badge-bg)" }}
          />
          <div className="space-y-1.5">
            <div className="h-3 w-28 rounded" style={{ backgroundColor: "var(--badge-bg)" }} />
            <div className="h-2.5 w-20 rounded" style={{ backgroundColor: "var(--badge-bg)" }} />
          </div>
        </div>
      );
    }
    return (
      <div
        className="mt-6 p-5 rounded-xl border animate-pulse space-y-3"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
      >
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full shrink-0" style={{ backgroundColor: "var(--badge-bg)" }} />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3.5 w-36 rounded" style={{ backgroundColor: "var(--badge-bg)" }} />
            <div className="h-3 w-24 rounded" style={{ backgroundColor: "var(--badge-bg)" }} />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="h-3 w-full rounded" style={{ backgroundColor: "var(--badge-bg)" }} />
          <div className="h-3 w-4/5 rounded" style={{ backgroundColor: "var(--badge-bg)" }} />
          <div className="h-3 w-3/5 rounded" style={{ backgroundColor: "var(--badge-bg)" }} />
        </div>
      </div>
    );
  }

  return (
    <AuthorCard
      author={author}
      fallbackName={authorName}
      variant={variant}
    />
  );
}
