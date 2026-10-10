import Link from "next/link";
import { BookOpen, Feather, Flame, Compass } from "lucide-react";
import { getAllPosts, getAllCategories } from "@/lib/posts";
import PostCard from "@/components/PostCard";

export default function HomePage() {
  const posts = getAllPosts();
  const categories = getAllCategories();

  const featuredPost = posts.find((p) => p.featured) || posts[0];
  const recentPosts = posts.filter((p) => p.slug !== featuredPost?.slug);

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Manifesto Hero Section */}
      <section
        className="relative overflow-hidden rounded-2xl border p-6 sm:p-10 md:p-12 text-center sm:text-left"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full opacity-5 pointer-events-none" style={{ backgroundColor: "var(--accent-red)" }} />

        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "var(--accent-red-light)", color: "var(--accent-red)" }}>
            <Flame className="w-3.5 h-3.5" />
            <span>Tribuna Livre • Pensamento Crítico</span>
          </div>

          <h2
            className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-serif-title)", color: "var(--text-primary)" }}
          >
            A palavra como instrumento de autonomia e emancipação.
          </h2>

          <p
            className="text-base sm:text-lg leading-relaxed max-w-2xl"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif-body)" }}
          >
            Este caderno reúne ensaios, manifestos e apontamentos sobre a liberdade concreta, o combate à alienação e a construção de laços solidários. Sem algoritmos de retenção, sem publicidade intrusiva, inteiramente livre.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 justify-center sm:justify-start">
            <Link
              href="/textos"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm hover:opacity-90"
              style={{
                backgroundColor: "var(--accent-red)",
                color: "#ffffff",
              }}
            >
              <BookOpen className="w-4 h-4" />
              <span>Explorar Todos os Textos ({posts.length})</span>
            </Link>

            <Link
              href="/sobre"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border transition-all hover:bg-black/5 dark:hover:bg-white/5"
              style={{
                borderColor: "var(--border-color)",
                color: "var(--text-primary)",
              }}
            >
              <Compass className="w-4 h-4" />
              <span>Manifesto do Caderno</span>
            </Link>
          </div>
        </div>
      </section>

      {/* If no posts yet */}
      {posts.length === 0 && (
        <section
          className="p-8 sm:p-12 rounded-2xl border text-center space-y-4"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-color)",
          }}
        >
          <div className="inline-flex p-3 rounded-full" style={{ backgroundColor: "var(--accent-red-light)", color: "var(--accent-red)" }}>
            <Feather className="w-8 h-8" />
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold" style={{ fontFamily: "var(--font-serif-title)" }}>
            Nenhum texto publicado ainda
          </h3>
          <p className="text-sm max-w-md mx-auto" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif-body)" }}>
            O caderno está pronto para receber suas reflexões. Utilize o Gerador de MD para redigir e baixar seu primeiro arquivo!
          </p>
          <div className="pt-2">
            <Link
              href="/gerador"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-all hover:opacity-90 hover:scale-102"
              style={{
                backgroundColor: "var(--accent-red)",
                color: "#ffffff",
              }}
            >
              <span>Criar Primeiro Texto no Gerador</span>
            </Link>
          </div>
        </section>
      )}

      {/* Featured Post (Textos em Destaque) */}
      {featuredPost && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: "var(--border-color)" }}>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--accent-red)" }} />
              <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--text-primary)", fontFamily: "var(--font-serif-title)" }}>
                Textos em Destaque
              </h3>
            </div>
            <span className="text-xs italic opacity-70">Leitura Recomendada</span>
          </div>

          <PostCard post={featuredPost} featured={true} />
        </section>
      )}

      {/* Categories Bar */}
      {categories.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: "var(--border-color)" }}>
            <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--text-primary)", fontFamily: "var(--font-serif-title)" }}>
              Eixos Temáticos
            </h3>
            <Link href="/textos" className="text-xs hover:underline" style={{ color: "var(--accent-red)" }}>
              Ver índice completo →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/textos?categoria=${encodeURIComponent(cat.name)}`}
                className="p-4 rounded-xl border transition-all hover:scale-102 hover:shadow-sm flex flex-col justify-between"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-color)",
                }}
              >
                <span className="text-xs uppercase font-bold tracking-wider" style={{ color: "var(--accent-red)" }}>
                  {cat.name}
                </span>
                <span className="text-xs opacity-60 mt-2">
                  {cat.count} {cat.count === 1 ? "texto publicado" : "textos publicados"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent Writings (Escritos Recentes) */}
      {recentPosts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: "var(--border-color)" }}>
            <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--text-primary)", fontFamily: "var(--font-serif-title)" }}>
              Outros Escritos & Fragmentos
            </h3>
            <span className="text-xs opacity-70">Arquivo Cronológico</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Classical Philosophical Quote Banner */}
      <section
        className="text-center p-8 sm:p-12 rounded-2xl border space-y-3"
        style={{
          backgroundColor: "var(--quote-bg)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="text-2xl sm:text-3xl font-serif italic max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--text-primary)", fontFamily: "var(--font-serif-body)" }}>
          &ldquo;O único herói autêntico é o herói coletivo, nunca o homem solitário. Nenhum ser humano se salva sozinho; a coragem só ganha sentido na solidariedade.&rdquo;
        </div>
        <p className="text-xs uppercase font-bold tracking-widest opacity-70" style={{ color: "var(--accent-red)" }}>
          — Héctor Germán Oesterheld (O Eternauta)
        </p>
      </section>
    </div>
  );
}
