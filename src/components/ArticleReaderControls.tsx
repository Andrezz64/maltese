"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Type,
  Printer,
  Share2,
  Bookmark,
  BookmarkCheck,
  Check,
  Quote,
  Maximize2,
  Minimize2,
  ListOrdered,
  ChevronRight,
  X,
  ArrowUp,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { PostMeta, TocItem } from "@/types/post";

interface ArticleReaderControlsProps {
  post: PostMeta;
  toc?: TocItem[];
}

export default function ArticleReaderControls({ post, toc = [] }: ArticleReaderControlsProps) {
  const { fontSize, setFontSize } = useTheme();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("");
  const tocRef = useRef<HTMLDivElement>(null);

  const hasToc = toc.length > 0;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("salomao_saved_posts") || "[]");
      setIsSaved(Array.isArray(saved) && saved.includes(post.slug));
    } catch {
      setIsSaved(false);
    }
  }, [post.slug]);

  // Highlight active heading while scrolling
  useEffect(() => {
    if (!hasToc) return;
    const headings = toc
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );
    headings.forEach((el) => observer.observe(el));

    const onScroll = () => {
      if (window.scrollY < 200 && toc.length > 0) setActiveId(toc[0].id);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [toc, hasToc]);

  // Close TOC on outside click
  useEffect(() => {
    if (!isTocOpen) return;
    const handler = (e: MouseEvent) => {
      if (tocRef.current && !tocRef.current.contains(e.target as Node)) {
        setIsTocOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isTocOpen]);

  const toggleSave = () => {
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
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error("Error saving bookmark", err);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyCitation = () => {
    const year = post.date.split("-")[0] || "2026";
    const authorName = (post.author || "MALTESE").toUpperCase();
    const citation = `${authorName}. "${post.title}". Revista aberta, ${year}. Disponível em: <${window.location.href}>.`;
    navigator.clipboard.writeText(citation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2500);
  };

  const handlePrint = () => window.print();

  const cycleFontSize = () => {
    if (fontSize === "normal") setFontSize("large");
    else if (fontSize === "large") setFontSize("larger");
    else setFontSize("normal");
  };

  const toggleFocusMode = () => {
    setIsFocusMode(!isFocusMode);
    document.body.classList.toggle("focus-reading-mode");
  };

  const scrollToHeading = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const offset = el.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: offset, behavior: "smooth" });
      setActiveId(id);
      try { window.history.pushState(null, "", `#${id}`); } catch { /* ignore */ }
    }
    setIsTocOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsTocOpen(false);
  };

  return (
    <div className="reader-toolbar sticky top-4 z-40 my-6 no-print" ref={tocRef}>
      {/* ── Main toolbar row ─────────────────────────────────────────────── */}
      <div
        className="p-2 rounded-xl border flex flex-wrap items-center justify-between gap-2 shadow-xs transition-all"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
      >
        <div className="flex items-center gap-1">
          {/* Font size */}
          <button
            onClick={cycleFontSize}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{ color: "var(--text-primary)" }}
            title="Ajustar tamanho da tipografia"
          >
            <Type className="w-3.5 h-3.5" />
            <span>
              {fontSize === "normal" && "Fonte: Padrão"}
              {fontSize === "large" && "Fonte: Grande"}
              {fontSize === "larger" && "Fonte: Extragrande"}
            </span>
          </button>

          {/* Save */}
          <button
            onClick={toggleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{ color: isSaved ? "var(--accent-red)" : "var(--text-secondary)" }}
            title={isSaved ? "Remover dos salvos" : "Salvar texto para ler depois"}
          >
            {isSaved
              ? <BookmarkCheck className="w-3.5 h-3.5 fill-current" />
              : <Bookmark className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isSaved ? "Salvo" : "Salvar"}</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          {/* Citation */}
          <button
            onClick={handleCopyCitation}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{ color: "var(--text-secondary)" }}
            title="Copiar citação formatada"
          >
            {copiedCitation
              ? <Check className="w-3.5 h-3.5 text-green-600" />
              : <Quote className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{copiedCitation ? "Citação Copiada!" : "Citar"}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{ color: "var(--text-secondary)" }}
            title="Copiar link do texto"
          >
            {copiedLink
              ? <Check className="w-3.5 h-3.5 text-green-600" />
              : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? "Link Copiado!" : "Compartilhar"}</span>
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Imprimir ou Salvar em PDF"
            style={{ color: "var(--text-primary)" }}
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Focus mode */}
          {/* <button
            onClick={toggleFocusMode}
            className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title={isFocusMode ? "Sair do modo foco" : "Modo foco"}
            style={{ color: isFocusMode ? "var(--accent-red)" : "var(--text-primary)" }}
          >
            {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button> */}

          {/* TOC toggle — mobile only */}
          {hasToc && (
            <button
              onClick={() => setIsTocOpen(!isTocOpen)}
              className="lg:hidden p-1.5 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              title="Sumário do texto"
              style={{ color: isTocOpen ? "var(--accent-red)" : "var(--text-primary)" }}
              aria-expanded={isTocOpen}
            >
              {isTocOpen ? <X className="w-4 h-4" /> : <ListOrdered className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* ── TOC dropdown — mobile only, below the toolbar ────────────────── */}
      {hasToc && isTocOpen && (
        <div
          className="lg:hidden mt-1.5 rounded-xl border shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
        >
          {/* TOC header */}
          <div
            className="flex items-center justify-between px-4 py-2.5 border-b"
            style={{ borderColor: "var(--border-light)", backgroundColor: "var(--bg-secondary)" }}
          >
            <div className="flex items-center gap-2">
              <ListOrdered className="w-4 h-4" style={{ color: "var(--accent-red)" }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
                Sumário
              </span>
              <span
                className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{ backgroundColor: "var(--badge-bg)", color: "var(--text-muted)" }}
              >
                {toc.length}
              </span>
            </div>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-xs opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: "var(--text-secondary)" }}
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Ao topo</span>
            </button>
          </div>

          {/* TOC items */}
          <nav className="px-2 py-2 max-h-64 overflow-y-auto space-y-0.5">
            {toc.map((item, index) => {
              const isActive = activeId === item.id;
              const indent = {
                1: "font-semibold",
                2: "pl-3 text-[0.8125rem]",
                3: "pl-6 text-[0.75rem] opacity-80",
              }[item.level as 1 | 2 | 3] ?? "pl-2";

              return (
                <a
                  key={`toc-mobile-${item.id}-${index}`}
                  href={`#${item.id}`}
                  onClick={(e) => scrollToHeading(e, item.id)}
                  className={`flex items-center justify-between py-2 px-3 rounded-lg text-sm leading-snug transition-all ${indent}`}
                  style={{
                    backgroundColor: isActive ? "var(--accent-red-light)" : "transparent",
                    color: isActive ? "var(--accent-red)" : "var(--text-primary)",
                  }}
                >
                  <span className="truncate">{item.text}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0 ml-1.5 opacity-70" />}
                </a>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
