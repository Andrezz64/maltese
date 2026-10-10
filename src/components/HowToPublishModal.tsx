"use client";

import React, { useState } from "react";
import { X, Copy, Check, FileText, UploadCloud, Sparkles } from "lucide-react";

interface HowToPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowToPublishModal({ isOpen, onClose }: HowToPublishModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sampleTemplate = `---
title: "Título do Seu Novo Ensaio ou Crônica"
slug: "titulo-do-seu-novo-ensaio"
date: "${new Date().toISOString().split("T")[0]}"
summary: "Um breve resumo de uma ou duas frases que sintetiza a ideia central do texto."
category: "Ensaios" # Opções: Ensaios, Manifestos, Crítica Social, Poesia & Fragmentos, Filosofia
tags: ["Liberdade", "Crítica", "Pensamento"]
readingTime: "5 min"
featured: false
epigraph: "Uma citação inspiradora que abre o texto. — Nome do Autor"
author: "Maltese"
---

## Primeiro Subtítulo

Escreva seu texto livremente em Markdown. Você pode usar:

* **Negrito** para destacar teses fundamentais;
* *Itálico* para conceitos sutis ou estrangeirismos;
* Listas para estruturar seus argumentos;

> "Citações em destaque ganham um bloco editorial refinado com borda carmesim."

### Subseções

Adicione quantos parágrafos desejar. Todo o layout se ajusta automaticamente!
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border shadow-2xl p-6 sm:p-8"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-color)",
          color: "var(--text-primary)",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg opacity-70 hover:opacity-100 transition-opacity"
          style={{ backgroundColor: "var(--badge-bg)" }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="p-2.5 rounded-lg"
            style={{ backgroundColor: "var(--accent-red-light)", color: "var(--accent-red)" }}
          >
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif" style={{ fontFamily: "var(--font-serif-title)" }}>
              Como Adicionar Novos Textos
            </h2>
            <p className="text-xs uppercase tracking-wider font-semibold opacity-70">
              Zero Banco de Dados • 100% Gratuito no Vercel ou GitHub
            </p>
          </div>
        </div>

        <div className="space-y-6 text-sm">
          {/* Step 1 */}
          <div className="p-4 rounded-lg border" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-secondary)" }}>
            <div className="flex items-center gap-2 font-bold mb-1.5 text-base">
              <FileText className="w-4 h-4" style={{ color: "var(--accent-red)" }} />
              <span>Passo 1: Crie um arquivo <code className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-xs">.md</code></span>
            </div>
            <p className="opacity-85 text-xs sm:text-sm">
              Basta salvar um novo arquivo na pasta <strong className="font-mono text-xs">content/posts/meu-novo-texto.md</strong> dentro do projeto.
            </p>
          </div>

          {/* Template Box with Copy Button */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                Modelo de Texto (Template Markdown):
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all border shadow-xs hover:scale-102"
                style={{
                  backgroundColor: copied ? "var(--accent-red)" : "var(--badge-bg)",
                  color: copied ? "#ffffff" : "var(--text-primary)",
                  borderColor: "var(--border-color)",
                }}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copiado com Sucesso!" : "Copiar Modelo"}</span>
              </button>
            </div>
            <pre
              className="p-4 rounded-lg overflow-x-auto text-xs font-mono border leading-relaxed"
              style={{
                backgroundColor: "var(--code-bg)",
                borderColor: "var(--border-color)",
                color: "var(--text-primary)",
              }}
            >
              {sampleTemplate}
            </pre>
          </div>

          {/* Step 2: Deploy */}
          <div className="p-4 rounded-lg border" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-secondary)" }}>
            <div className="flex items-center gap-2 font-bold mb-1.5 text-base">
              <UploadCloud className="w-4 h-4" style={{ color: "var(--accent-red)" }} />
              <span>Passo 2: Hospedagem 100% Gratuita na Vercel</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 opacity-90 text-xs sm:text-sm">
              <li>Suba seu repositório no seu <strong>GitHub</strong> (ex: <code className="text-xs">git push</code>);</li>
              <li>Acesse <a href="https://vercel.com" target="_blank" rel="noreferrer" className="underline font-semibold" style={{ color: "var(--accent-red)" }}>vercel.com</a> e crie uma conta gratuita com seu GitHub;</li>
              <li>Clique em <strong>&quot;Add New Project&quot;</strong> e selecione este repositório;</li>
              <li>Clique em <strong>&quot;Deploy&quot;</strong>. Pronto! O site ficará no ar instantaneamente em um link <code className="text-xs">.vercel.app</code> ou seu domínio personalizado!</li>
            </ol>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm"
            style={{
              backgroundColor: "var(--accent-red)",
              color: "#ffffff",
            }}
          >
            Entendido, fechar guia
          </button>
        </div>
      </div>
    </div>
  );
}
