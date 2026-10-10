import { Suspense } from "react";
import { getAllPosts, getAllCategories, getAllTags } from "@/lib/posts";
import SearchAndFilter from "@/components/SearchAndFilter";

export const metadata = {
  title: "Arquivo Geral de Escritos",
  description:
    "Explore todos os ensaios, manifestos, apontamentos e fragmentos críticos publicados no Caderno Maltese.",
};

export default function TextosPage() {
  const posts = getAllPosts();
  const categories = getAllCategories();
  const tags = getAllTags();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b pb-6" style={{ borderColor: "var(--border-color)" }}>
        <h1
          className="text-3xl sm:text-4xl font-extrabold font-serif tracking-tight"
          style={{ fontFamily: "var(--font-serif-title)", color: "var(--text-primary)" }}
        >
          Arquivo de Escritos & Reflexões
        </h1>
        <p
          className="text-sm sm:text-base leading-relaxed"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif-body)" }}
        >
          Índice cronológico e temático de todos os textos publicados. Utilize os filtros de busca para navegar por categorias, temas ou seus textos salvos localmente.
        </p>
      </div>

      {/* Interactive Search & Filter with Posts wrapped in Suspense for static prerendering */}
      <Suspense
        fallback={
          <div className="p-8 text-center text-sm opacity-60">
            Carregando catálogo de escritos...
          </div>
        }
      >
        <SearchAndFilter
          initialPosts={posts}
          categories={categories}
          tags={tags}
        />
      </Suspense>
    </div>
  );
}
