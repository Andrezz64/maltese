"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { PostMeta } from "@/types/post";

interface ArticleReaderControlsProps {
  post: PostMeta;
}

export default function ArticleReaderControls({ post }: ArticleReaderControlsProps) {
  const { fontSize, setFontSize } = useTheme();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("salomao_saved_posts") || "[]");
      setIsSaved(Array.isArray(saved) && saved.includes(post.slug));
    } catch {
      setIsSaved(false);
    }
  }, [post.slug]);

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
    const citation = `MALTESE. "${post.title}". Caderno de Escritos, ${year}. Disponível em: <${window.location.href}>.`;
    navigator.clipboard.writeText(citation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const cycleFontSize = () => {
    if (fontSize === "normal") setFontSize("large");
    else if (fontSize === "large") setFontSize("larger");
    else setFontSize("normal");
  };

  const toggleFocusMode = () => {
    setIsFocusMode(!isFocusMode);
    document.body.classList.toggle("focus-reading-mode");
  };

  return (
    <div
      className="reader-toolbar sticky top-4 z-40 my-6 p-2 rounded-xl border flex flex-wrap items-center justify-between gap-2 shadow-xs transition-all no-print"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: "var(--border-color)",
      }}
    >
      <div className="flex items-center gap-1">
        {/* Font size adjuster */}
        <button
          onClick={cycleFontSize}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          style={{ color: "var(--text-primary)" }}
          title="Ajustar tamanho da tipografia (Normal / Grande / Extragrande)"
        >
          <Type className="w-3.5 h-3.5" />
          <span>
            {fontSize === "normal" && "Fonte: Padrão"}
            {fontSize === "large" && "Fonte: Grande"}
            {fontSize === "larger" && "Fonte: Extragrande"}
          </span>
        </button>

        {/* Save post */}
        <button
          onClick={toggleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          style={{ color: isSaved ? "var(--accent-red)" : "var(--text-secondary)" }}
          title={isSaved ? "Remover dos salvos" : "Salvar texto para ler depois"}
        >
          {isSaved ? <BookmarkCheck className="w-3.5 h-3.5 fill-current" /> : <Bookmark className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isSaved ? "Salvo" : "Salvar"}</span>
        </button>
      </div>

      <div className="flex items-center gap-1">
        {/* Copy citation */}
        <button
          onClick={handleCopyCitation}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          style={{ color: "var(--text-secondary)" }}
          title="Copiar citação formatada (ABNT / Referência)"
        >
          {copiedCitation ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Quote className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">{copiedCitation ? "Citação Copiada!" : "Citar"}</span>
        </button>

        {/* Share / Copy link */}
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          style={{ color: "var(--text-secondary)" }}
          title="Copiar link do texto"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Share2 className="w-3.5 h-3.5" />}
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

        {/* Focus Mode */}
        <button
          onClick={toggleFocusMode}
          className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title={isFocusMode ? "Sair do modo foco" : "Modo foco (leitura imersiva)"}
          style={{ color: isFocusMode ? "var(--accent-red)" : "var(--text-primary)" }}
        >
          {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
