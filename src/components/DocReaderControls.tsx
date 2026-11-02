"use client";

import React, { useState } from "react";
import {
  Type,
  Printer,
  Share2,
  Check,
  ExternalLink,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { DocMeta } from "@/types/doc";
import siteConfig from "@site-config";

interface DocReaderControlsProps {
  doc: DocMeta;
}

export default function DocReaderControls({ doc }: DocReaderControlsProps) {
  const { fontSize, setFontSize } = useTheme();
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const githubUrl = `https://github.com/${siteConfig.git.owner}/${siteConfig.git.repo}/blob/${siteConfig.git.branch}/content/docs/${doc.slug}.md`;

  return (
    <div
      className="reader-toolbar no-print flex flex-wrap items-center justify-between gap-3 py-2.5 px-4 rounded-xl border text-xs"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-light)",
        color: "var(--text-secondary)",
      }}
    >
      {/* Font Size Adjuster */}
      <div className="flex items-center gap-2">
        <span className="opacity-70 flex items-center gap-1 font-medium text-[11px] uppercase tracking-wider">
          <Type className="w-3 h-3 text-[var(--accent-red)]" />
          <span>Tipografia</span>
        </span>
        <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-lg p-0.5 border" style={{ borderColor: "var(--border-color)" }}>
          <button
            type="button"
            onClick={() => setFontSize("normal")}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
              fontSize === "normal"
                ? "bg-[var(--accent-red)] text-white shadow-2xs font-bold"
                : "opacity-60 hover:opacity-100"
            }`}
            title="Tamanho padrão de leitura (18px)"
          >
            A
          </button>
          <button
            type="button"
            onClick={() => setFontSize("large")}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
              fontSize === "large"
                ? "bg-[var(--accent-red)] text-white shadow-2xs font-bold"
                : "opacity-60 hover:opacity-100"
            }`}
            title="Tamanho ampliado de leitura (21px)"
          >
            A+
          </button>
          <button
            type="button"
            onClick={() => setFontSize("larger")}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
              fontSize === "larger"
                ? "bg-[var(--accent-red)] text-white shadow-2xs font-bold"
                : "opacity-60 hover:opacity-100"
            }`}
            title="Tamanho conforto máximo (25px)"
          >
            A++
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all hover:opacity-80"
          style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)" }}
          title="Copiar link direto para este documento"
        >
          {copiedLink ? <Check className="w-3 h-3 text-emerald-500" /> : <Share2 className="w-3 h-3" />}
          <span>{copiedLink ? "Copiado!" : "Compartilhar"}</span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all hover:opacity-80"
          style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)" }}
          title="Imprimir documento ou salvar em PDF"
        >
          <Printer className="w-3 h-3" />
          <span className="hidden sm:inline">PDF</span>
        </button>

        <a
          href={githubUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all hover:opacity-80 text-[var(--accent-red)]"
          style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)" }}
          title="Ver este arquivo Markdown no GitHub"
        >
          <ExternalLink className="w-3 h-3" />
          <span className="hidden sm:inline">GitHub</span>
        </a>
      </div>
    </div>
  );
}
