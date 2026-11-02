import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getAllAuthors, getAuthorBySlug } from "@/lib/authors";
import { getAllPosts } from "@/lib/posts";
import { PostMeta } from "@/types/post";
import { AuthorSocials } from "@/types/author";
import { SOCIAL_META } from "@/components/SocialIcons";
import PostCard from "@/components/PostCard";
import siteConfig from "@site-config";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const authors = getAllAuthors();
  if (authors.length === 0) return [{ slug: "_inicio" }];
  return authors.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) return { title: "Autor não encontrado" };

  return {
    title: author.name,
    description: author.description || `Textos e obras de ${author.name} publicados no ${siteConfig.title}.`,
    openGraph: {
      title: `${author.name} — ${siteConfig.title}`,
      description: author.description,
      type: "profile",
    },
  };
}

// ─── Social link row ──────────────────────────────────────────────────────────
function SocialRow({ socials }: { socials: AuthorSocials }) {
  const entries = (Object.entries(socials) as [keyof AuthorSocials, string | undefined][]).filter(
    ([, v]) => Boolean(v)
  );
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(([key, url]) => {
        if (!url) return null;
        const meta = SOCIAL_META[key];
        if (!meta) return null;
        const { Icon, label } = meta;
        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:border-[var(--accent-red)] hover:text-[var(--accent-red)]"
            style={{
              borderColor: "var(--border-color)",
              color: "var(--text-secondary)",
              backgroundColor: "var(--bg-primary)",
            }}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </a>
        );
      })}
    </div>
  );
}

// ─── Main page content ────────────────────────────────────────────────────────
async function AuthorPageContent({ paramsPromise }: { paramsPromise: Promise<{ slug: string }> }) {
  const { slug } = await paramsPromise;
  const author = getAuthorBySlug(slug);

  if (!author) notFound();

  const allPosts = getAllPosts();

  // Match posts to this author — normalize to tolerate extra spaces, accents, case
  function normalizeName(s: string) {
    return s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  const authorPosts: PostMeta[] = allPosts.filter(
    (p) => normalizeName(p.author || "") === normalizeName(author.slug)
  );

  const featuredPosts = authorPosts.filter((p) => p.featured);
  const otherPosts = authorPosts.filter((p) => !p.featured);

  const initial = author.name.charAt(0).toUpperCase();

  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      return new Intl.DateTimeFormat("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(year, month - 1, day));
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
        <Link
          href="/autores"
          className="flex items-center gap-1.5 font-semibold transition-colors hover:text-[var(--accent-red)]"
          style={{ color: "var(--accent-red)" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Autores
        </Link>
        <span className="opacity-40">/</span>
        <span className="opacity-70 truncate">{author.name}</span>
      </div>

      {/* ── Profile header ─────────────────────────────────────────────────── */}
      <section
        className="rounded-2xl border p-6 sm:p-8 space-y-6"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
      >
                    {/* Post count badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                style={{ backgroundColor: "var(--badge-bg)", color: "var(--accent-red)" }}
              >
                {authorPosts.length === 0
                  ? "Nenhum publicação"
                  : authorPosts.length === 1
                  ? "Uma publicação"
                  : `${authorPosts.length} Publicações`}
              </span>
            </div>
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          {/* Avatar */}
          {author.avatar ? (
            <Image
              src={author.avatar}
              alt={author.name}
              width={88}
              height={88}
              className="rounded-full object-cover shrink-0 ring-4"
              style={{ width: 88, height: 88, outlineColor: "var(--border-color)" }}
              unoptimized
            />
          ) : (
            <div
              className="w-[88px] h-[88px] rounded-full flex items-center justify-center font-serif font-bold text-4xl shrink-0"
              style={{
                backgroundColor: "var(--accent-red)",
                color: "#fff",
                fontFamily: "var(--font-serif-title)",
              }}
            >
              {initial}
            </div>
          )}

          {/* Identity */}
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <h1
                className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight"
                style={{ fontFamily: "var(--font-serif-title)", color: "var(--text-primary)" }}
              >
                {author.name}
              </h1>
              {author.role && (
                <p className="mt-1 mb-3 text-sm font-semibold opacity-70" style={{ color: "var(--text-muted)" }}>
                  {author.role}
                </p>
              )}
            </div>



            {/* Socials */}
            {author.socials && (
              <SocialRow socials={author.socials as Record<string, string | undefined>} />
            )}
          </div>
        </div>

        {/* Bio */}
        {author.bio && (
          <div
            className="prose-content border-t pt-5 text-sm sm:text-base leading-relaxed"
            style={{
              borderColor: "var(--border-color)",
              color: "var(--text-secondary)",
              fontFamily: "var(--font-serif-body)",
              fontSize: "1.05rem",
              lineHeight: "1.8",
            }}
          >
            {author.bio.split("\n\n").map((para, i) => (
              <p key={i} className={i > 0 ? "mt-4" : ""}>
                {para.trim()}
              </p>
            ))}
          </div>
        )}

        {/* Custom links */}
        {author.links && author.links.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t pt-4" style={{ borderColor: "var(--border-light)" }}>
            {author.links.map((link, i) => (
              <Link
                key={i}
                href={link.url}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:bg-[var(--accent-red)] hover:text-white hover:border-[var(--accent-red)]"
                style={{
                  borderColor: "var(--border-color)",
                  color: "var(--text-secondary)",
                  backgroundColor: "var(--bg-primary)",
                }}
              >
                <ExternalLink className="w-3 h-3" />
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Works ─────────────────────────────────────────────────────────── */}
      {authorPosts.length === 0 ? (
        <div
          className="py-16 text-center rounded-2xl border"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-muted)" }}
        >
          <p className="text-base opacity-60">Nenhum texto publicado ainda.</p>
        </div>
      ) : (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--border-color)" }}>
            <h2
              className="text-xl sm:text-2xl font-extrabold tracking-tight"
              style={{ fontFamily: "var(--font-serif-title)", color: "var(--text-primary)" }}
            >
              Obras publicadas
            </h2>
            <span className="text-xs opacity-60 font-mono" style={{ color: "var(--text-muted)" }}>
              {authorPosts.length} {authorPosts.length === 1 ? "texto" : "textos"}
            </span>
          </div>

          {/* Featured first */}
          {featuredPosts.length > 0 && (
            <div className="space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-widest opacity-50" style={{ color: "var(--text-muted)" }}>
                Em destaque
              </p>
              {featuredPosts.map((post) => (
                <PostCard key={post.slug} post={post} featured />
              ))}
            </div>
          )}

          {/* Rest */}
          {otherPosts.length > 0 && (
            <div className="space-y-4">
              {featuredPosts.length > 0 && (
                <p className="text-[11px] font-bold uppercase tracking-widest opacity-50" style={{ color: "var(--text-muted)" }}>
                  Demais textos
                </p>
              )}
              <div className="space-y-4">
                {otherPosts.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── Back link ─────────────────────────────────────────────────────── */}
      <div className="pt-4 border-t" style={{ borderColor: "var(--border-light)" }}>
        <Link
          href="/autores"
          className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:text-[var(--accent-red)]"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Todos os autores
        </Link>
      </div>
    </div>
  );
}

export default function AuthorPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto p-12 text-center text-sm opacity-60">
          Carregando perfil do autor...
        </div>
      }
    >
      <AuthorPageContent paramsPromise={params} />
    </Suspense>
  );
}
