"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ChevronRight, Menu, X, FileText, Compass } from "lucide-react";
import { DocCategoryGroup } from "@/types/doc";

interface DocSidebarProps {
  groups: DocCategoryGroup[];
  currentSlug?: string;
}

export default function DocSidebar({ groups, currentSlug }: DocSidebarProps) {
  const pathname = usePathname();
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  return (
    <>
      {/* Botão de Toggle Mobile */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-semibold shadow-xs"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-color)",
            color: "var(--text-primary)",
          }}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[var(--accent-red)]" />
            <span>Navegação da Documentação</span>
          </div>
          {isOpenMobile ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`lg:block ${
          isOpenMobile ? "block" : "hidden"
        } w-full lg:w-64 shrink-0 transition-all`}
      >
        <div
          className="sticky top-6 p-4 rounded-2xl border shadow-xs space-y-6"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-color)",
          }}
        >
          {/* Header da Sidebar */}
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--border-light)" }}>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[var(--accent-red)]" />
              <span
                className="text-xs font-bold tracking-wider uppercase font-serif"
                style={{ color: "var(--text-primary)" }}
              >
                Caderno de Docs
              </span>
            </div>
            <Link
              href="/docs"
              className="text-[11px] underline opacity-70 hover:opacity-100 hover:text-[var(--accent-red)]"
            >
              Índice Geral
            </Link>
          </div>

          {/* Lista de Grupos e Links */}
          <nav className="space-y-5">
            {groups.map((group) => (
              <div key={group.category} className="space-y-1.5">
                <h4
                  className="text-[11px] font-bold uppercase tracking-wider px-2"
                  style={{ color: "var(--accent-red)" }}
                >
                  {group.category}
                </h4>

                <ul className="space-y-0.5">
                  {group.docs.map((doc) => {
                    const isActive = currentSlug === doc.slug || pathname === `/docs/${doc.slug}`;
                    return (
                      <li key={doc.slug}>
                        <Link
                          href={`/docs/${doc.slug}`}
                          onClick={() => setIsOpenMobile(false)}
                          className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                            isActive
                              ? "font-bold text-white shadow-2xs"
                              : "hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100"
                          }`}
                          style={{
                            backgroundColor: isActive ? "var(--accent-red)" : "transparent",
                            color: isActive ? "#ffffff" : "var(--text-primary)",
                          }}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isActive ? "text-white" : "opacity-60 group-hover:text-[var(--accent-red)]"
                              }`}
                            />
                            <span className="truncate">{doc.title}</span>
                          </div>
                          {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0 text-white" />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
