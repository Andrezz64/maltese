"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Sun, Moon, Coffee, BookmarkCheck, Download } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import HowToPublishModal from "./HowToPublishModal";

export default function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [currentDate, setCurrentDate] = useState("");
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  const rotatingWords = [
    "Ensaios",
    "Manifestos",
    "Crônicas",
    "Poemas",
    "Epístolas",
    "Sonetos",
    "Panfletos",
    "Tratados",
    "Elegias",
    "Odes",
    "Diálogos",
    "Aforismos",
    "Manuscritos",
    "Contos",
    "Narrativas",
    "Prosas",
    "Poéticas",
    "Confissões",
    "Parábolas",
    "Solilóquios",
    "Fragmentos",
    "Memórias",
    "Glosas",
    "Apólogos",
    "Discursos",
    "Teses",
    "Insubmissões",
    "Monólogos",
    "Prólogos",
    "Escritos",
  ];

  const [wordIndex, setWordIndex] = useState(0);
  const [isFade, setIsFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFade(false);
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % rotatingWords.length);
        setIsFade(true);
      }, 300);
    }, 4600);

    return () => clearInterval(interval);
  }, [rotatingWords.length]);

  useEffect(() => {
    const now = new Date();
    const formatted = new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(now);
    // Capitalize first letter
    setCurrentDate(formatted.charAt(0).toUpperCase() + formatted.slice(1));

    // Check saved bookmarks count
    try {
      const saved = JSON.parse(localStorage.getItem("salomao_saved_posts") || "[]");
      setSavedCount(Array.isArray(saved) ? saved.length : 0);
    } catch {
      setSavedCount(0);
    }
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "Caderno Principal" },
    { href: "/textos", label: "Arquivo de Textos" },
    { href: "/sobre", label: "Manifesto & Sobre" },
  ];

  return (
    <>
      <header className="w-full border-b" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)" }}>
        {/* Top bar with date and theme switchers */}
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-2 border-b flex flex-wrap items-center justify-between text-xs tracking-wider uppercase font-medium" style={{ borderColor: "var(--border-light)", color: "var(--text-muted)" }}>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: "var(--accent-red)" }}></span>
            <span>{currentDate || "Caderno de Escritos"}</span>
            <span className="hidden sm:inline opacity-40">•</span>
          </div>

          <div className="flex items-center gap-3 mt-1 sm:mt-0">
            {savedCount > 0 && (
              <Link
                href="/textos?filtro=salvos"
                className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] transition-colors hover:opacity-80"
                style={{ backgroundColor: "var(--badge-bg)", color: "var(--accent-red)" }}
                title="Ver seus textos salvos localmente"
              >
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>Salvos ({savedCount})</span>
              </Link>
            )}

            {/* Theme switcher */}
            <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-full p-0.5 border" style={{ borderColor: "var(--border-color)" }}>
              <button
                type="button"
                onClick={() => setTheme("classic")}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-all ${theme === "classic"
                  ? "bg-[#F8F4EC] text-[#1C1A17] shadow-xs"
                  : "opacity-60 hover:opacity-100"
                  }`}
                title="Tema Papel e Prensa Clássico"
              >
                <Sun className="w-3 h-3" />
                <span className="hidden md:inline">Papel</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("sepia")}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-all ${theme === "sepia"
                  ? "bg-[#EDE2CE] text-[#271E17] shadow-xs"
                  : "opacity-60 hover:opacity-100"
                  }`}
                title="Tema Sépia / Livro Antigo"
              >
                <Coffee className="w-3 h-3" />
                <span className="hidden md:inline">Sépia</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-all ${theme === "dark"
                  ? "bg-[#1D1B19] text-[#F0EBE3] shadow-xs"
                  : "opacity-60 hover:opacity-100"
                  }`}
                title="Tema Noturno / Carvão"
              >
                <Moon className="w-3 h-3" />
                <span className="hidden md:inline">Noite</span>
              </button>
            </div>
          </div>
        </div>

        {/* Masthead title */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 text-center">
          <Link href="/" className="inline-block group">
            <h1
              className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight"
              style={{ fontFamily: "var(--font-serif-title)", color: "var(--text-primary)" }}
            >
              Maltese
              <span className="inline-block transition-transform duration-300 group-hover:scale-125" style={{ color: "var(--accent-red)" }}>.</span>
            </h1>
          </Link>
          <div className="mt-2 flex items-center justify-center gap-3">
            <span className="h-[1px] w-8 sm:w-16" style={{ backgroundColor: "var(--accent-red)" }}></span>
            <p
              className="text-xs sm:text-sm font-semibold tracking-widest uppercase flex flex-wrap items-center justify-center gap-1.5"
              style={{ color: "var(--text-secondary)", letterSpacing: "0.22em" }}
            >
              <span>Caderno aberto de</span>
              <span
                className={`inline-block font-bold transition-all duration-300 transform ${isFade ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
                  }`}
                style={{ color: "var(--accent-red)" }}
              >
                {rotatingWords[wordIndex]}
              </span>
            </p>
            <span className="h-[1px] w-8 sm:w-16" style={{ backgroundColor: "var(--accent-red)" }}></span>
          </div>
        </div>

        {/* Navigation Bar */}
        <nav
          className="border-t border-b"
          style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-secondary)" }}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto py-3">
            <div className="flex items-center space-x-1 sm:space-x-6">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded text-sm sm:text-base font-serif transition-all relative whitespace-nowrap ${isActive ? "font-bold" : "font-normal opacity-80 hover:opacity-100"
                      }`}
                    style={{
                      color: isActive ? "var(--accent-red)" : "var(--text-primary)",
                      fontFamily: "var(--font-serif-body)",
                    }}
                  >
                    {link.label}
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                        style={{ backgroundColor: "var(--accent-red)" }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Gerador de MD button */}
            <Link
              href="/gerador"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all border shadow-xs hover:scale-102"
              style={{
                backgroundColor: "var(--accent-red-light)",
                borderColor: "var(--accent-red)",
                color: "var(--accent-red)",
              }}
              title="Gerador de arquivos Markdown prontos para download"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Gerador de MD</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* Modal explaining how to publish markdown posts */}
      <HowToPublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
      />
    </>
  );
}
