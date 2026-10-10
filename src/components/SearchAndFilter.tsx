"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X, Filter, Bookmark } from "lucide-react";
import { PostMeta } from "@/types/post";
import PostCard from "./PostCard";

interface SearchAndFilterProps {
  initialPosts: PostMeta[];
  categories: { name: string; count: number }[];
  tags: { name: string; count: number }[];
}

export default function SearchAndFilter({
  initialPosts,
  categories,
  tags,
}: SearchAndFilterProps) {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("categoria");
  const urlTag = searchParams.get("tag");
  const urlFiltro = searchParams.get("filtro");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(urlCategory || "all");
  const [selectedTag, setSelectedTag] = useState<string | null>(urlTag || null);
  const [onlySaved, setOnlySaved] = useState(urlFiltro === "salvos");
  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);

  useEffect(() => {
    if (urlCategory) setSelectedCategory(urlCategory);
    if (urlTag) setSelectedTag(urlTag);
    if (urlFiltro === "salvos") setOnlySaved(true);
  }, [urlCategory, urlTag, urlFiltro]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("salomao_saved_posts") || "[]");
      if (Array.isArray(saved)) {
        setSavedSlugs(saved);
      }
    } catch {
      setSavedSlugs([]);
    }
  }, []);

  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      // Saved only filter
      if (onlySaved && !savedSlugs.includes(post.slug)) {
        return false;
      }

      // Category filter
      if (selectedCategory !== "all" && post.category !== selectedCategory) {
        return false;
      }

      // Tag filter
      if (selectedTag && !post.tags.includes(selectedTag)) {
        return false;
      }

      // Search Query filter
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(q);
        const matchesSummary = post.summary.toLowerCase().includes(q);
        const matchesTag = post.tags.some((t) => t.toLowerCase().includes(q));
        const matchesCategory = post.category.toLowerCase().includes(q);

        if (!matchesTitle && !matchesSummary && !matchesTag && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [initialPosts, searchQuery, selectedCategory, selectedTag, onlySaved, savedSlugs]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedTag(null);
    setOnlySaved(false);
  };

  const hasActiveFilters = searchQuery !== "" || selectedCategory !== "all" || selectedTag !== null || onlySaved;

  return (
    <div className="space-y-8">
      {/* Search and Quick Filters bar */}
      <div
        className="p-4 sm:p-6 rounded-xl border space-y-4"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-color)",
        }}
      >
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
          <input
            type="text"
            placeholder="Pesquisar por palavras-chave, conceitos, teses ou títulos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm transition-all focus:outline-hidden focus:ring-2"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold uppercase tracking-wider mr-1 opacity-70 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Categorias:
          </span>

          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              selectedCategory === "all"
                ? "bg-[var(--accent-red)] text-white shadow-xs"
                : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:opacity-80"
            }`}
          >
            Todos ({initialPosts.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat.name
                  ? "bg-[var(--accent-red)] text-white shadow-xs"
                  : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:opacity-80"
              }`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}

          {/* Only saved button */}
          <button
            onClick={() => setOnlySaved(!onlySaved)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
              onlySaved
                ? "bg-[var(--accent-red)] text-white shadow-xs"
                : "bg-[var(--badge-bg)] text-[var(--text-secondary)] hover:opacity-80"
            }`}
          >
            <Bookmark className="w-3 h-3" />
            <span>Salvos ({savedSlugs.length})</span>
          </button>
        </div>

        {/* Tag pills */}
        {tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="text-[11px] font-semibold opacity-60 mr-1">Temas:</span>
            {tags.slice(0, 10).map((t) => {
              const isSelected = selectedTag === t.name;
              return (
                <button
                  key={t.name}
                  onClick={() => setSelectedTag(isSelected ? null : t.name)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                    isSelected
                      ? "bg-[var(--accent-red)] text-white"
                      : "bg-[var(--badge-bg)] text-[var(--text-muted)] hover:opacity-100"
                  }`}
                >
                  #{t.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Active filter counter & reset */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t text-xs" style={{ borderColor: "var(--border-light)", color: "var(--text-muted)" }}>
            <span>
              Mostrando <strong>{filteredPosts.length}</strong> de {initialPosts.length} escritos
            </span>
            <button
              onClick={clearFilters}
              className="text-xs underline font-medium hover:text-[var(--accent-red)]"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* List of filtered posts */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPosts.map((post, idx) => (
            <PostCard key={post.slug} post={post} featured={idx === 0 && !hasActiveFilters} />
          ))}
        </div>
      ) : (
        <div
          className="text-center py-16 px-4 rounded-xl border border-dashed space-y-4"
          style={{
            borderColor: "var(--border-color)",
            backgroundColor: "var(--bg-card)",
          }}
        >
          <div className="inline-flex p-3 rounded-full bg-[var(--badge-bg)] opacity-70">
            <Search className="w-8 h-8" style={{ color: "var(--text-muted)" }} />
          </div>
          <h3 className="text-lg font-serif font-bold" style={{ fontFamily: "var(--font-serif-title)" }}>
            Nenhum escrito encontrado
          </h3>
          <p className="text-sm max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
            Nenhum texto corresponde aos critérios de busca ou filtros selecionados. Tente buscar com outros termos.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider"
            style={{
              backgroundColor: "var(--accent-red)",
              color: "#ffffff",
            }}
          >
            Limpar Busca
          </button>
        </div>
      )}
    </div>
  );
}
