"use client";

import Link from "next/link";
import { ArrowUp, BookOpen, Heart, Shield } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      className="w-full border-t mt-auto"
      style={{
        borderColor: "var(--border-color)",
        backgroundColor: "var(--bg-secondary)",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* Upper footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b" style={{ borderColor: "var(--border-light)" }}>
          {/* Column 1: Manifesto summary */}
          <div className="space-y-3">
            <h3
              className="text-lg font-bold font-serif tracking-tight flex items-center gap-2"
              style={{ fontFamily: "var(--font-serif-title)", color: "var(--text-primary)" }}
            >
              <span>CADERNO MALTESE</span>
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Um espaço independente dedicado à reflexão crítica, à defesa intransigente da autonomia e ao resgate da palavra como força de transformação social.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--accent-red)" }}>
              Navegação do Caderno
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/" className="hover:underline transition-all" style={{ color: "var(--text-secondary)" }}>
                  Página Inicial
                </Link>
              </li>
              <li>
                <Link href="/textos" className="hover:underline transition-all" style={{ color: "var(--text-secondary)" }}>
                  Índice Geral de Ensaios
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="hover:underline transition-all" style={{ color: "var(--text-secondary)" }}>
                  Manifesto & Sobre o Autor
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Colophon & Principles */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--accent-red)" }}>
              Princípios Técnicos & Éticos
            </h4>
            <div className="space-y-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
              <p className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" style={{ color: "var(--accent-red)" }} />
                <span>Sem cookies de rastreamento ou vigilância</span>
              </p>
              <p className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" style={{ color: "var(--accent-red)" }} />
                <span>Textos armazenados em arquivos Markdown livres</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5" style={{ color: "var(--accent-red)" }} />
                <span>Hospedagem estática gratuita de alto desempenho</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs gap-4" style={{ color: "var(--text-muted)" }}>
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span>Copyleft <strong>(ɔ) 2026 Maltese</strong></span>
            <span>•</span>
            <span>Distribuição Livre & Irrestrita</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-1 rounded transition-colors hover:opacity-80"
              style={{ backgroundColor: "var(--badge-bg)", color: "var(--text-primary)" }}
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Voltar ao Topo</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
