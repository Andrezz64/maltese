"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Clock, Bookmark, BookmarkCheck, ArrowRight } from "lucide-react";
import { PostMeta } from "@/types/post";

interface PostCardProps {
  post: PostMeta;
  featured?: boolean;
}

export default function PostCard({ post, featured = false }: PostCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("salomao_saved_posts") || "[]");
      setIsSaved(Array.isArray(saved) && saved.includes(post.slug));
    } catch {
      setIsSaved(false);
    }
  }, [post.slug]);

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved = JSON.parse(localStorage.getItem("salomao_saved_posts") || "[]");
      let updated: string[];
      if (saved.includes(post.slug)) {
        updated = saved.filter((s: string) => s !== post.slug);
        setIsSaved(false);
      } else {
        updated = [...saved, post.slug];
        setIsSaved(true);
      }
      localStorage.setItem("salomao_saved_posts", JSON.stringify(updated));
      // Dispatch custom event to notify header
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error("Error saving bookmark", err);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return new Intl.DateTimeFormat("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  return (
    <article
      className={`group relative rounded-xl border transition-all duration-300 hover:shadow-md ${
        featured
          ? "p-6 sm:p-8 bg-[var(--bg-card)] border-[var(--border-color)]"
          : "p-5 sm:p-6 bg-[var(--bg-card)] border-[var(--border-color)]"
      }`}
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: "var(--border-color)",
      }}
    >
      {/* Top meta bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span
            className="px-2.5 py-0.5 rounded font-semibold uppercase tracking-wider text-[10px]"
            style={{
              backgroundColor: "var(--badge-bg)",
              color: "var(--accent-red)",
            }}
          >
            {post.category}
          </span>
          <span className="opacity-40">•</span>
          <time className="font-medium" style={{ color: "var(--text-muted)" }}>
            {formatDate(post.date)}
          </time>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
            <Clock className="w-3 h-3" />
            <span>{post.readingTime}</span>
          </span>

          <button
            type="button"
            onClick={toggleSave}
            className="p-1 rounded opacity-60 hover:opacity-100 hover:scale-110 transition-all"
            title={isSaved ? "Remover dos salvos" : "Salvar para ler depois"}
            style={{ color: isSaved ? "var(--accent-red)" : "var(--text-muted)" }}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Post Title */}
      <Link href={`/textos/${post.slug}`} className="block">
        <h2
          className={`font-serif font-bold tracking-tight transition-colors group-hover:text-[var(--accent-red)] ${
            featured ? "text-2xl sm:text-3xl mb-3 leading-snug" : "text-xl sm:text-2xl mb-2 leading-snug"
          }`}
          style={{
            fontFamily: "var(--font-serif-title)",
            color: "var(--text-primary)",
          }}
        >
          {post.title}
        </h2>
      </Link>

      {/* Summary with larger font size */}
      <p
        className={`leading-relaxed mb-4 ${
          featured ? "text-base sm:text-lg md:text-xl font-normal" : "text-sm sm:text-base font-normal"
        }`}
        style={{
          color: "var(--text-secondary)",
          fontFamily: "var(--font-serif-body)",
        }}
      >
        {post.summary}
      </p>

      {/* Footer: Tags & Read Link */}
      <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs" style={{ borderColor: "var(--border-light)" }}>
        <div className="flex flex-wrap items-center gap-1.5">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium"
              style={{
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-muted)",
              }}
            >
              #{tag}
            </span>
          ))}
        </div>

        <Link
          href={`/textos/${post.slug}`}
          className="inline-flex items-center gap-1.5 font-semibold text-xs transition-transform group-hover:translate-x-1"
          style={{ color: "var(--accent-red)" }}
        >
          <span>Ler texto integral</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}
