import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, Calendar, ArrowLeft, ArrowRight, Tag, Quote } from "lucide-react";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import ArticleReaderControls from "@/components/ArticleReaderControls";
import ArticleContent from "@/components/ArticleContent";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  if (posts.length === 0) {
    return [{ slug: "_inicio" }];
  }
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Texto não encontrado",
    };
  }

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: `${post.title} — Maltese`,
      description: post.summary,
      type: "article",
      publishedTime: post.date,
      authors: [post.author || "Maltese"],
      tags: post.tags,
    },
  };
}

async function PostDetailContent({ paramsPromise }: { paramsPromise: Promise<{ slug: string }> }) {
  const { slug } = await paramsPromise;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = getAllPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return new Intl.DateTimeFormat("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  return (
    <article className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Scroll Reading Progress Bar */}
      <ReadingProgressBar />

      {/* Back button */}
      <div className="no-print">
        <Link
          href="/textos"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-colors hover:opacity-75"
          style={{ color: "var(--accent-red)" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Arquivo</span>
        </Link>
      </div>

      {/* Article Header */}
      <header className="space-y-4 border-b pb-8" style={{ borderColor: "var(--border-color)" }}>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className="px-2.5 py-0.5 rounded font-bold uppercase tracking-wider text-[11px]"
            style={{
              backgroundColor: "var(--badge-bg)",
              color: "var(--accent-red)",
            }}
          >
            {post.category}
          </span>
          <span className="opacity-40">•</span>
          <time className="flex items-center gap-1 opacity-80" style={{ color: "var(--text-muted)" }}>
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(post.date)}</span>
          </time>
          <span className="opacity-40">•</span>
          <span className="flex items-center gap-1 opacity-80" style={{ color: "var(--text-muted)" }}>
            <Clock className="w-3.5 h-3.5" />
            <span>{post.readingTime}</span>
          </span>
        </div>

        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight"
          style={{ fontFamily: "var(--font-serif-title)", color: "var(--text-primary)" }}
        >
          {post.title}
        </h1>

        <p
          className="text-lg sm:text-xl leading-relaxed italic"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif-body)" }}
        >
          {post.summary}
        </p>

        {/* Epigraph / Citação de abertura */}
        {post.epigraph && (
          <div
            className="p-4 sm:p-5 rounded-lg border-l-4 text-sm sm:text-base italic leading-relaxed"
            style={{
              backgroundColor: "var(--quote-bg)",
              borderLeftColor: "var(--accent-red)",
              color: "var(--text-secondary)",
              fontFamily: "var(--font-serif-body)",
            }}
          >
            <Quote className="w-4 h-4 mb-1 opacity-60 inline-block mr-2" />
            {post.epigraph}
          </div>
        )}
      </header>

      {/* Reader Controls Toolbar */}
      <ArticleReaderControls post={post} />

      {/* Main Post Markdown Content with dynamic reader font size */}
      <ArticleContent htmlContent={post.htmlContent} />

      {/* Tags section */}
      {post.tags.length > 0 && (
        <div className="pt-6 border-t flex flex-wrap items-center gap-2" style={{ borderColor: "var(--border-color)" }}>
          <span className="text-xs font-bold uppercase tracking-wider opacity-60 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Eixos:
          </span>
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/textos?tag=${encodeURIComponent(tag)}`}
              className="px-2.5 py-1 rounded text-xs font-medium transition-colors hover:bg-[var(--accent-red)] hover:text-white"
              style={{
                backgroundColor: "var(--badge-bg)",
                color: "var(--text-secondary)",
              }}
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Colophon & Author Bio */}
      <div
        className="p-6 rounded-xl border space-y-3"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold text-lg"
            style={{
              backgroundColor: "var(--accent-red)",
              color: "#ffffff",
              fontFamily: "var(--font-serif-title)",
            }}
          >
            {(post.author || "Maltese").charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              {post.author || "Maltese"}
            </h4>
            <p className="text-xs opacity-70">Caderno Maltese</p>
          </div>
        </div>
        <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif-body)" }}>
          Este texto foi publicado sob licença livre de distribuição. Todo o conteúdo é livre para reprodução, debate e citação com atribuição da fonte.
        </p>
      </div>

      {/* Previous / Next Article Navigation */}
      <nav className="pt-6 border-t grid grid-cols-1 sm:grid-cols-2 gap-4 no-print" style={{ borderColor: "var(--border-color)" }}>
        {prevPost ? (
          <Link
            href={`/textos/${prevPost.slug}`}
            className="p-4 rounded-xl border transition-all hover:scale-102 flex flex-col justify-between"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
            }}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 opacity-70" style={{ color: "var(--accent-red)" }}>
              <ArrowLeft className="w-3 h-3" /> Texto Anterior
            </span>
            <span className="font-serif font-bold text-sm line-clamp-2 mt-1" style={{ color: "var(--text-primary)" }}>
              {prevPost.title}
            </span>
          </Link>
        ) : (
          <div />
        )}

        {nextPost && (
          <Link
            href={`/textos/${nextPost.slug}`}
            className="p-4 rounded-xl border transition-all hover:scale-102 flex flex-col justify-between text-right"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
            }}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider flex items-center justify-end gap-1 opacity-70" style={{ color: "var(--accent-red)" }}>
              Próximo Texto <ArrowRight className="w-3 h-3" />
            </span>
            <span className="font-serif font-bold text-sm line-clamp-2 mt-1" style={{ color: "var(--text-primary)" }}>
              {nextPost.title}
            </span>
          </Link>
        )}
      </nav>
    </article>
  );
}

export default function PostDetailPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto p-12 text-center text-sm opacity-60">
          Carregando texto...
        </div>
      }
    >
      <PostDetailContent paramsPromise={params} />
    </Suspense>
  );
}
