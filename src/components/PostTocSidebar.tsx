"use client";

import React, { useState, useEffect } from "react";
import { ListOrdered, ChevronRight, Menu, X, ArrowUp } from "lucide-react";
import { TocItem } from "@/types/post";

interface PostTocSidebarProps {
  toc: TocItem[];
  postTitle?: string;
}

export default function PostTocSidebar({ toc, postTitle }: PostTocSidebarProps) {
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [activeId, setActiveId] = useState<string>("");

  // Observa o scroll para destacar o tópico ativo
  useEffect(() => {
    if (!toc || toc.length === 0) return;

    const headingElements = toc
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (headingElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Encontra o primeiro título que cruzou o topo
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) {
          setActiveId(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      }
    );

    headingElements.forEach((el) => observer.observe(el));

    // Fallback de scroll para inicialização e topo
    const handleScroll = () => {
      if (window.scrollY < 200 && toc.length > 0) {
        setActiveId(toc[0].id);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [toc]);

  if (!toc || toc.length === 0) {
    return null;
  }

  const scrollToHeading = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const topOffset = 90; // espaço para a barra superior fixa
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      setActiveId(id);
      try {
        window.history.pushState(null, "", `#${id}`);
      } catch {
        // ignore
      }
    }
    setIsOpenMobile(false);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Botão de Toggle Mobile (idêntico ao da documentação) */}
      <div className="lg:hidden w-full mb-4 no-print">
        <button
          type="button"
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border text-[0.875rem] font-semibold shadow-xs transition-colors"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-color)",
            color: "var(--text-primary)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <ListOrdered className="w-4 h-4 text-[var(--accent-red)]" />
            <span>Sumário do Texto ({toc.length} seções)</span>
          </div>
          {isOpenMobile ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`no-print lg:block ${
          isOpenMobile ? "block" : "hidden"
        } w-full lg:w-80 xl:w-88 shrink-0 lg:sticky lg:top-4 lg:self-start z-30 transition-all`}
      >
        <div
          className="p-4 sm:p-5 rounded-2xl border shadow-xs space-y-4 max-h-[calc(100vh-2.5rem)] flex flex-col"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-color)",
          }}
        >
          {/* Header da Sidebar */}
          <div
            className="flex items-center justify-between pb-3 border-b shrink-0"
            style={{ borderColor: "var(--border-light)" }}
          >
            <div className="flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-[var(--accent-red)]" />
              <span
                className="text-[0.875rem] font-bold tracking-wider uppercase font-serif"
                style={{ color: "var(--text-primary)" }}
              >
                Sumário
              </span>
              <span
                className="text-[0.75rem] font-mono px-2 py-0.5 rounded font-medium"
                style={{ backgroundColor: "var(--badge-bg)", color: "var(--text-muted)" }}
              >
                {toc.length}
              </span>
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              className="text-[0.8125rem] flex items-center gap-1 opacity-70 hover:opacity-100 hover:text-[var(--accent-red)] transition-colors cursor-pointer"
              title="Voltar ao topo da leitura"
            >
              <span>Ao topo</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Lista de Tópicos (H1, H2, H3) com rolagem interna suave e fontes em rem */}
          <nav className="overflow-y-auto space-y-1.5 pr-1.5 custom-scrollbar flex-1">
            {toc.map((item, index) => {
              const isActive = activeId === item.id;

              // Estilização por nível de profundidade (H1, H2, H3) em REM
              const levelStyles = {
                1: "font-serif font-bold text-[0.9375rem] tracking-tight mt-3 pt-3 border-t first:mt-0 first:pt-0 first:border-0",
                2: "pl-3 text-[0.875rem] font-medium",
                3: "pl-6 text-[0.8125rem] opacity-85",
              }[item.level as 1 | 2 | 3] || "pl-2 text-[0.875rem]";

              return (
                <a
                  key={`${item.id}-${index}`}
                  href={`#${item.id}`}
                  onClick={(e) => scrollToHeading(e, item.id)}
                  className={`group flex items-center justify-between py-2 px-3 rounded-lg transition-all leading-snug ${levelStyles} ${
                    isActive
                      ? "font-semibold shadow-2xs"
                      : "hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100"
                  }`}
                  style={{
                    backgroundColor: isActive ? "var(--accent-red-light)" : "transparent",
                    color: isActive ? "var(--accent-red)" : "var(--text-primary)",
                    borderColor: "var(--border-light)",
                  }}
                >
                  <span className="truncate" title={item.text}>
                    {item.text}
                  </span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 ml-1.5 transition-transform ${
                      isActive
                        ? "opacity-100 text-[var(--accent-red)] translate-x-0.5"
                        : "opacity-0 group-hover:opacity-40"
                    }`}
                  />
                </a>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
