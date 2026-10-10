"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Download,
  Copy,
  Check,
  Sparkles,
  Eye,
  Code,
  ArrowLeft,
  Bold,
  Italic,
  Quote,
  List,
  Clock,
} from "lucide-react";

export default function GeradorMDPage() {
  const [title, setTitle] = useState("O Elogio da Insubmissão: Notas sobre a Dignidade do Não");
  const [slug, setSlug] = useState("elogio-da-insubmissao");
  const [date, setDate] = useState("2026-03-28");

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
  }, []);
  const [summary, setSummary] = useState(
    "Por que a capacidade de dizer 'não' às injustiças cotidianas é o fundamento inicial de qualquer transformação social profunda."
  );
  const [category, setCategory] = useState("Manifestos");
  const [customCategory, setCustomCategory] = useState("");
  const [tagsInput, setTagsInput] = useState("Insubmissão, Dignidade, Ética, Resistência");
  const [author, setAuthor] = useState("Maltese");
  const [epigraph, setEpigraph] = useState(
    "A desobediência é a virtude original do homem. Foi através da desobediência que o progresso foi feito. — Oscar Wilde"
  );
  const [featured, setFeatured] = useState(true);

  const [content, setContent] = useState(`## A Tirania do Consentimento Silencioso

A mais eficiente forma de tirania não é aquela que se impõe pela força bruta dos canhões, mas a que consegue colonizar o imaginário a ponto de transformar a obediência cega em virtude moral. Quando as pessoas se acostumam com o inaceitável, a injustiça ganha foro de normalidade.

Dizer **não** é o primeiro gesto de resgate da subjetividade. É a recusa em participar da engrenagem que tritura a dignidade alheia para alimentar privilégios concentrados.

### As Três Dimensões da Insubmissão Ética

1. **A recusa da resignação:** Não aceitar a miséria material e espiritual como um dado da natureza.
2. **A fidelidade à verdade:** Desmascarar o vocabulário cínico que chama exploração de 'oportunidade' e censura de 'harmonia'.
3. **A construção do comum:** A insubmissão solitária pode ser heroica, mas apenas a insubmissão organizada e fraterna é capaz de erguer novos mundos.

> "A história não é um trilho pré-determinado; ela é o barro moldado pelas mãos daqueles que ousaram não se ajoelhar."
`);

  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Helper function to slugify text
  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .trim()
      .replace(/[^a-z0-9 -]/g, "") // Remove invalid chars
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/-+/g, "-"); // Replace multiple - with single -
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setSlug(slugify(newTitle));
  };

  // Calculate estimated reading time
  const readingTime = useMemo(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min`;
  }, [content]);

  // Parse tags list
  const tagsList = useMemo(() => {
    return tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }, [tagsInput]);

  const effectiveCategory = category === "Outra" ? customCategory || "Geral" : category;

  // Build markdown string
  const markdownOutput = useMemo(() => {
    const formattedTags = JSON.stringify(tagsList);
    const escapedSummary = summary.replace(/"/g, '\\"');
    const escapedEpigraph = epigraph ? epigraph.replace(/"/g, '\\"') : "";

    let md = `---
title: "${title}"
slug: "${slug}"
date: "${date}"
summary: "${escapedSummary}"
category: "${effectiveCategory}"
tags: ${formattedTags}
readingTime: "${readingTime}"
featured: ${featured}
`;

    if (escapedEpigraph.trim()) {
      md += `epigraph: "${escapedEpigraph}"\n`;
    }

    md += `author: "${author}"
---

${content.trim()}
`;

    return md;
  }, [title, slug, date, summary, effectiveCategory, tagsList, readingTime, featured, epigraph, author, content]);

  // Insert markdown helpers
  const insertText = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("markdown-editor") as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previous = textarea.value;
    const selected = previous.substring(start, end);
    const replacement = `${prefix}${selected || "texto"}${suffix}`;

    const updated = previous.substring(0, start) + replacement + previous.substring(end);
    setContent(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 5));
    }, 50);
  };

  // Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(markdownOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Download .md file
  const handleDownload = () => {
    const filename = `${slug || "meu-texto"}.md`;
    const blob = new Blob([markdownOutput], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6" style={{ borderColor: "var(--border-color)" }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/textos"
              className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider opacity-70 hover:opacity-100 transition-opacity"
              style={{ color: "var(--accent-red)" }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar aos Textos</span>
            </Link>
          </div>
          <h1
            className="text-3xl sm:text-4xl font-extrabold font-serif tracking-tight"
            style={{ fontFamily: "var(--font-serif-title)", color: "var(--text-primary)" }}
          >
            Gerador de Arquivos Markdown (.md)
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif-body)" }}>
            Escreva ou cole seu texto, configure os metadados e baixe o arquivo formatado pronto para a pasta <code className="px-1.5 py-0.5 rounded text-xs bg-black/5 dark:bg-white/5 font-mono">content/posts/</code>.
          </p>
        </div>

        {/* Action Buttons Top */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider border shadow-xs transition-all hover:scale-102"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Copiado!" : "Copiar"}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-all hover:opacity-90 hover:scale-102"
            style={{
              backgroundColor: "var(--accent-red)",
              color: "#ffffff",
            }}
          >
            <Download className="w-4 h-4" />
            <span>Baixar .md</span>
          </button>
        </div>
      </div>

      {/* Success banner on download */}
      {downloadSuccess && (
        <div
          className="p-4 rounded-xl border flex items-center justify-between text-xs sm:text-sm animate-in slide-in-from-top-2 duration-300"
          style={{
            backgroundColor: "var(--accent-red-light)",
            borderColor: "var(--accent-red)",
            color: "var(--accent-red)",
          }}
        >
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>
              Arquivo <strong>{slug}.md</strong> baixado com sucesso! Mova-o para a pasta <code>content/posts/</code> no seu projeto para publicar.
            </span>
          </div>
          <button onClick={() => setDownloadSuccess(false)} className="text-xs font-bold underline">
            Fechar
          </button>
        </div>
      )}

      {/* Main Grid: Form on left, Output on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div
            className="p-6 rounded-2xl border space-y-4 shadow-xs"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
            }}
          >
            <h3 className="text-sm font-bold uppercase tracking-wider opacity-80 flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: "var(--accent-red)" }} />
              <span>Metadados do Escrito</span>
            </h3>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)" }}>
                Título do Texto *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ex: O Elogio da Insubmissão"
                className="w-full px-3.5 py-2 rounded-lg border text-sm font-serif font-bold transition-all focus:outline-hidden focus:ring-2"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Slug & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)" }}>
                  Nome do Arquivo (Slug) *
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    className="w-full px-3 py-2 rounded-l-lg border text-xs font-mono transition-all focus:outline-hidden"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <span
                    className="px-2.5 py-2 rounded-r-lg border-y border-r text-xs font-mono opacity-60"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      borderColor: "var(--border-color)",
                    }}
                  >
                    .md
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)" }}>
                  Data de Publicação
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-xs transition-all focus:outline-hidden"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)" }}>
                Resumo / Sinopse (1 ou 2 frases) *
              </label>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Uma síntese elegante que resume a tese principal do texto..."
                className="w-full px-3.5 py-2 rounded-lg border text-xs leading-relaxed transition-all focus:outline-hidden focus:ring-2"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Category & Author */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)" }}>
                  Categoria / Eixo
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-xs transition-all focus:outline-hidden"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="Ensaios">Ensaios</option>
                  <option value="Manifestos">Manifestos</option>
                  <option value="Crítica Social">Crítica Social</option>
                  <option value="Poesia & Fragmentos">Poesia & Fragmentos</option>
                  <option value="Filosofia & Teoria">Filosofia & Teoria</option>
                  <option value="Crônicas & Memória">Crônicas & Memória</option>
                  <option value="Outra">Outra (Personalizada)</option>
                </select>

                {category === "Outra" && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Digite o nome da categoria"
                    className="w-full mt-2 px-3 py-1.5 rounded-lg border text-xs"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)" }}>
                  Autor(a)
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-xs transition-all focus:outline-hidden"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
            </div>

            {/* Tags & Epigraph */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)" }}>
                  Temas / Tags (separados por vírgula)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Ex: Emancipação, Ética, Resistência"
                  className="w-full px-3.5 py-2 rounded-lg border text-xs transition-all focus:outline-hidden"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)" }}>
                  Epígrafe / Citação de Abertura (Opcional)
                </label>
                <input
                  type="text"
                  value={epigraph}
                  onChange={(e) => setEpigraph(e.target.value)}
                  placeholder="Ex: A desobediência é a virtude original do homem. — Oscar Wilde"
                  className="w-full px-3.5 py-2 rounded-lg border text-xs italic transition-all focus:outline-hidden"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              {/* Featured toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-[var(--accent-red)] focus:ring-[var(--accent-red)] cursor-pointer"
                />
                <label htmlFor="featured-check" className="text-xs font-medium cursor-pointer" style={{ color: "var(--text-primary)" }}>
                  Destacar este ensaio no topo da página inicial (Featured)
                </label>
              </div>
            </div>
          </div>

          {/* Markdown Content Editor */}
          <div
            className="p-6 rounded-2xl border space-y-3 shadow-xs"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
            }}
          >
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
                Corpo do Texto (Markdown)
              </label>
              <span className="text-[11px] opacity-60 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" /> ~{readingTime} de leitura
              </span>
            </div>

            {/* Formatting Toolbar */}
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-lg border bg-black/5 dark:bg-white/5" style={{ borderColor: "var(--border-color)" }}>
              <button
                type="button"
                onClick={() => insertText("## ")}
                className="px-2 py-1 rounded text-xs font-semibold hover:bg-black/10 dark:hover:bg-white/10"
                title="Título H2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => insertText("### ")}
                className="px-2 py-1 rounded text-xs font-semibold hover:bg-black/10 dark:hover:bg-white/10"
                title="Subtítulo H3"
              >
                H3
              </button>
              <button
                type="button"
                onClick={() => insertText("**", "**")}
                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                title="Negrito"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertText("*", "*")}
                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                title="Itálico"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertText('> "Citação..."\n')}
                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                title="Bloco de Citação"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertText("* Item 1\n* Item 2\n")}
                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                title="Lista"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertText("\n---\n")}
                className="px-2 py-1 rounded text-xs font-serif font-bold hover:bg-black/10 dark:hover:bg-white/10"
                title="Divisor de Seção §"
              >
                § Divisor
              </button>
            </div>

            <textarea
              id="markdown-editor"
              rows={16}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva seu ensaio ou reflexão aqui usando Markdown..."
              className="w-full p-4 rounded-xl border text-sm font-mono leading-relaxed transition-all focus:outline-hidden focus:ring-2"
              style={{
                backgroundColor: "var(--bg-primary)",
                borderColor: "var(--border-color)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        </div>

        {/* Right Column: Live Output & Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div
            className="sticky top-6 p-6 rounded-2xl border space-y-4 shadow-sm"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
            }}
          >
            {/* Tabs */}
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--border-light)" }}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("code")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "code"
                      ? "bg-[var(--accent-red)] text-white shadow-xs"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Arquivo .md</span>
                </button>

                <button
                  onClick={() => setActiveTab("preview")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "preview"
                      ? "bg-[var(--accent-red)] text-white shadow-xs"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Prévia do Card</span>
                </button>
              </div>

              <span className="text-[11px] font-mono opacity-60">
                {slug}.md
              </span>
            </div>

            {/* Tab 1: Code output */}
            {activeTab === "code" ? (
              <div className="space-y-3">
                <div className="relative">
                  <pre
                    className="p-4 rounded-xl overflow-x-auto text-xs font-mono border max-h-[560px] overflow-y-auto leading-relaxed"
                    style={{
                      backgroundColor: "var(--code-bg)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {markdownOutput}
                  </pre>
                </div>

                {/* Big download button */}
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all hover:scale-101 hover:opacity-95"
                  style={{
                    backgroundColor: "var(--accent-red)",
                    color: "#ffffff",
                  }}
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Arquivo {slug}.md</span>
                </button>

                <p className="text-[11px] text-center opacity-70 leading-relaxed">
                  Ao baixar, basta arrastar ou colar o arquivo na pasta <code className="font-mono">content/posts/</code> do projeto!
                </p>
              </div>
            ) : (
              /* Tab 2: Visual Card Preview */
              <div className="space-y-4">
                <div
                  className="p-5 rounded-xl border shadow-xs space-y-3"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className="px-2.5 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]"
                      style={{
                        backgroundColor: "var(--badge-bg)",
                        color: "var(--accent-red)",
                      }}
                    >
                      {effectiveCategory}
                    </span>
                    <span className="opacity-60 text-[11px]">{date}</span>
                  </div>

                  <h3
                    className="text-xl font-bold font-serif leading-snug"
                    style={{
                      fontFamily: "var(--font-serif-title)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {title || "Sem título"}
                  </h3>

                  <p
                    className="text-sm sm:text-base leading-relaxed opacity-90 font-normal"
                    style={{
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-serif-body)",
                    }}
                  >
                    {summary}
                  </p>

                  <div className="pt-2 border-t flex flex-wrap gap-1 text-[11px]" style={{ borderColor: "var(--border-light)" }}>
                    {tagsList.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded text-[10px]"
                        style={{
                          backgroundColor: "var(--bg-secondary)",
                          color: "var(--text-muted)",
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all hover:scale-101 hover:opacity-95"
                  style={{
                    backgroundColor: "var(--accent-red)",
                    color: "#ffffff",
                  }}
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Arquivo {slug}.md</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
