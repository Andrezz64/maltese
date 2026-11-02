import React from "react";
import Link from "next/link";
import { getAllDocs, getDocCategoryGroups } from "@/lib/docs";
import siteConfig from "@site-config";
import {
  Compass,
  ArrowRight,
  Clock,
  BookOpen,
} from "lucide-react";

export const metadata = {
  title: "Documentação & Manuais",
  description:
    "Guias completos, manuais de configuração e documentação técnica da plataforma de publicação estática Maltese.",
};

export default function DocsPage() {
  const allDocs = getAllDocs();
  const groups = getDocCategoryGroups();
  const firstDoc = allDocs[0] || null;

  return (
    <div className="space-y-12 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Header Hero */}
      <div
        className="p-8 sm:p-12 rounded-3xl border shadow-xs relative overflow-hidden"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--accent-red-light)] text-[var(--accent-red)]">
            <Compass className="w-3.5 h-3.5" />
            <span>Documentação Oficial</span>
          </div>

          <h1
            className="text-3xl sm:text-5xl font-extrabold font-serif tracking-tight"
            style={{ fontFamily: "var(--font-serif-title)", color: "var(--text-primary)" }}
          >
            Manuais & Arquitetura do {siteConfig.title}
          </h1>

          <p
            className="text-sm sm:text-base leading-relaxed opacity-80"
            style={{ fontFamily: "var(--font-serif-body)" }}
          >
            Tudo o que você precisa para configurar seu blog via Fork, gerenciar artigos em Markdown com controle de versão e publicar de graça com zero infraestrutura.
          </p>

          {firstDoc && (
            <div className="pt-2">
              <Link
                href={`/docs/${firstDoc.slug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:opacity-90 hover:scale-102"
                style={{ backgroundColor: "var(--accent-red)" }}
              >
                <span>Começar pela Introdução</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Decorative background accent */}
        <div
          className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full opacity-5 pointer-events-none"
          style={{ backgroundColor: "var(--accent-red)" }}
        />
      </div>

      {/* Grid de Seções e Documentos */}
      <div className="space-y-10">
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--border-color)" }}>
          <h2
            className="text-xl sm:text-2xl font-bold font-serif"
            style={{ fontFamily: "var(--font-serif-title)", color: "var(--text-primary)" }}
          >
            Todos os Guias & Tópicos
          </h2>
          <span className="text-xs font-mono opacity-60">
            {allDocs.length} documentos em content/docs
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map((group) => (
            <div
              key={group.category}
              className="p-6 rounded-2xl border shadow-xs space-y-4 flex flex-col justify-between"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-color)",
              }}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-red)]" />
                  <h3
                    className="text-sm font-bold uppercase tracking-wider"
                    style={{ color: "var(--accent-red)" }}
                  >
                    {group.category}
                  </h3>
                </div>

                <div className="space-y-3">
                  {group.docs.map((doc) => (
                    <Link
                      key={doc.slug}
                      href={`/docs/${doc.slug}`}
                      className="group block p-3 rounded-xl border transition-all hover:scale-101 hover:border-[var(--accent-red)]"
                      style={{
                        backgroundColor: "var(--bg-primary)",
                        borderColor: "var(--border-light)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <h4
                            className="text-sm font-bold font-serif group-hover:text-[var(--accent-red)] transition-colors"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {doc.title}
                          </h4>
                          {doc.summary && (
                            <p className="text-xs opacity-70 line-clamp-2 leading-relaxed">
                              {doc.summary}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 shrink-0 opacity-40 group-hover:opacity-100 group-hover:text-[var(--accent-red)] group-hover:translate-x-0.5 transition-all mt-0.5" />
                      </div>

                      {doc.readingTime && (
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono opacity-50">
                          <Clock className="w-3 h-3" />
                          <span>{doc.readingTime}</span>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
