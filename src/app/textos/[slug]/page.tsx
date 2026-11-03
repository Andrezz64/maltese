import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, Calendar, ArrowLeft, ArrowRight, Tag, Quote } from "lucide-react";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { resolveAuthor } from "@/lib/authors";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import ArticleReaderControls from "@/components/ArticleReaderControls";
import ArticleContent from "@/components/ArticleContent";
import PostTocSidebar from "@/components/PostTocSidebar";
import AuthorCard from "@/components/AuthorCard";
import siteConfig from "@site-config";

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
    return { title: "Texto não encontrado" };
  }

  const url = `${siteConfig.url}textos/${post.slug}`;
  const ogImage = post.coverImage || null;

  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.summary,
      url,
      type: "article",
      siteName: siteConfig.title,
      locale: siteConfig.language,
      publishedTime: post.date,
      authors: [post.author || siteConfig.author],
      tags: post.tags,
      ...(ogImage && {
        images: [{ url: ogImage, width: 1200, height: 675, alt: post.title }],
      }),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: post.title,
      description: post.summary,
      ...(ogImage && { images: [ogImage] }),
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

  const hasToc = Boolean(post.toc && post.toc.length > 0);

  // Resolve author data from MD files
  const authorData = resolveAuthor(post.author);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Scroll Reading Progress Bar */}
      <ReadingProgressBar />

      {/* Top Breadcrumb / Navigation */}
      <div
        className="flex items-center justify-between text-xs pb-3 border-b no-print"
        style={{ borderColor: "var(--border-light)" }}
      >
        <div className="flex items-center gap-2">
          <Link
            href="/textos"
            className="flex items-center gap-1.5 font-semibold transition-colors hover:text-[var(--accent-red)]"
            style={{ color: "var(--accent-red)" }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Arquivo</span>
          </Link>
          <span className="opacity-40">/</span>
          <span className="font-semibold text-[var(--accent-red)]">{post.category}</span>
          <span className="opacity-40 hidden sm:inline">/</span>
          <span className="opacity-70 truncate max-w-[200px] md:max-w-[420px] hidden sm:inline">
            {post.title}
          </span>
        </div>
      </div>

      {/* Cover Image Hero */}
      {post.coverImage && (
        <div
          className={`overflow-hidden rounded-2xl w-full ${hasToc ? "max-w-5xl" : "max-w-3xl"} mx-auto`}
          style={{ aspectRatio: "16/9" }}
        >
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Header */}
      <header
        className={`space-y-4 border-b pb-8 ${hasToc ? "max-w-5xl" : "max-w-3xl"} mx-auto w-full`}
        style={{ borderColor: "var(--border-color)" }}
      >
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

        {post.summary && (
          <p
            className="text-lg sm:text-xl leading-relaxed italic"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif-body)" }}
          >
            {post.summary}
          </p>
        )}

        {/* Author Info — header variant (compact) */}
        <AuthorCard
          author={authorData}
          fallbackName={post.author || "Maltese"}
          variant="header"
        />

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

      {/* Main Grid: Sidebar TOC + Post Reader & Content */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Navigation Sidebar com H1, H2 e H3 (estilo documentação) */}
        {hasToc && <PostTocSidebar toc={post.toc!} postTitle={post.title} />}

        {/* Article Body Container */}
        <article
          className={`flex-1 w-full min-w-0 space-y-6 ${
            hasToc ? "" : "max-w-3xl mx-auto"
          }`}
        >
          {/* Reader Controls Toolbar (Sticky top-4) */}
          <ArticleReaderControls post={post} toc={post.toc} />

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

          {/* Author Bio — footer variant (full) */}
          <AuthorCard
            author={authorData}
            fallbackName={post.author || "Maltese"}
            variant="footer"
          />

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
      </div>
    </div>
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
