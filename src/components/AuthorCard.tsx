import Link from "next/link";
import Image from "next/image";
import { Globe, ExternalLink, AtSign, Link2 } from "lucide-react";
import { Author, AuthorMeta } from "@/types/author";

interface AuthorCardProps {
  /** Dados completos do autor (vindo dos arquivos MD) */
  author: Author | AuthorMeta | null;
  /** Fallback quando o autor não é encontrado nos arquivos MD */
  fallbackName?: string;
  /** Variante de exibição: "header" = compacto (antes do texto), "footer" = bio completa (depois do texto) */
  variant?: "header" | "footer";
}

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  website: Globe,
  github: Link2,
  twitter: AtSign,
  linkedin: ExternalLink,
  instagram: ExternalLink,
  mastodon: AtSign,
};

function SocialLink({ href, icon: Icon, label }: { href: string; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex items-center justify-center w-7 h-7 rounded-full transition-all hover:scale-110 hover:opacity-80"
      style={{ backgroundColor: "var(--badge-bg)", color: "var(--text-secondary)" }}
    >
      <Icon className="w-3.5 h-3.5" />
    </a>
  );
}

export default function AuthorCard({ author, fallbackName = "Maltese", variant = "header" }: AuthorCardProps) {
  const displayName = author?.name || fallbackName;
  const initial = displayName.charAt(0).toUpperCase();

  // ─── HEADER VARIANT: compacto, inline ───────────────────────────────────────
  if (variant === "header") {
    const profileHref = author?.slug ? `/autores/${author.slug}` : null;

    const avatarEl = author?.avatar ? (
      <Image
        src={author.avatar}
        alt={displayName}
        width={36}
        height={36}
        className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-[var(--border-color)]"
        unoptimized
      />
    ) : (
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center font-serif font-bold text-base shrink-0"
        style={{
          backgroundColor: "var(--accent-red)",
          color: "#ffffff",
          fontFamily: "var(--font-serif-title)",
        }}
      >
        {initial}
      </div>
    );

    return (
      <div className="flex items-center gap-3 pt-2">
        {profileHref ? (
          <Link href={profileHref} className="shrink-0 hover:opacity-80 transition-opacity">
            {avatarEl}
          </Link>
        ) : avatarEl}

        <div className="min-w-0">
          {profileHref ? (
            <Link href={profileHref} className="hover:text-[var(--accent-red)] transition-colors">
              <h4 className="font-bold text-sm leading-tight" style={{ color: "var(--text-primary)" }}>
                {displayName}
              </h4>
            </Link>
          ) : (
            <h4 className="font-bold text-sm leading-tight" style={{ color: "var(--text-primary)" }}>
              {displayName}
            </h4>
          )}
          <p className="text-xs opacity-70 leading-tight" style={{ color: "var(--text-muted)" }}>
            {author?.role || "Caderno Maltese"}
          </p>
        </div>

        {/* Social icons */}
        {author?.socials && (
          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            {Object.entries(author.socials).map(([key, url]) => {
              if (!url) return null;
              const Icon = SOCIAL_ICONS[key];
              if (!Icon) return null;
              return <SocialLink key={key} href={url} icon={Icon} label={key} />;
            })}
          </div>
        )}
      </div>
    );
  }

  // ─── FOOTER VARIANT: bio completa com links ──────────────────────────────────
  const profileHref = author?.slug ? `/autores/${author.slug}` : null;

  return (
    <div
      className="p-5 sm:p-6 rounded-xl border space-y-4"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: "var(--border-color)",
      }}
    >
      {/* Author identity row */}
      <div className="flex items-start gap-4">
        {author?.avatar ? (
          profileHref ? (
            <Link href={profileHref} className="shrink-0 hover:opacity-80 transition-opacity">
              <Image
                src={author.avatar}
                alt={displayName}
                width={56}
                height={56}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-[var(--border-color)]"
                unoptimized
              />
            </Link>
          ) : (
            <Image
              src={author.avatar}
              alt={displayName}
              width={56}
              height={56}
              className="w-14 h-14 rounded-full object-cover shrink-0 ring-2 ring-[var(--border-color)]"
              unoptimized
            />
          )
        ) : (
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center font-serif font-bold text-2xl shrink-0"
            style={{
              backgroundColor: "var(--accent-red)",
              color: "#ffffff",
              fontFamily: "var(--font-serif-title)",
            }}
          >
            {initial}
          </div>
        )}

        <div className="min-w-0 flex-1">
          {profileHref ? (
            <Link href={profileHref} className="hover:text-[var(--accent-red)] transition-colors">
              <h4 className="font-bold text-base leading-tight" style={{ color: "var(--text-primary)" }}>
                {displayName}
              </h4>
            </Link>
          ) : (
            <h4 className="font-bold text-base leading-tight" style={{ color: "var(--text-primary)" }}>
              {displayName}
            </h4>
          )}
          {author?.role && (
            <p className="text-sm opacity-70 mt-0.5" style={{ color: "var(--text-muted)" }}>
              {author.role}
            </p>
          )}

          {/* Socials */}
          {author?.socials && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {Object.entries(author.socials).map(([key, url]) => {
                if (!url) return null;
                const Icon = SOCIAL_ICONS[key];
                if (!Icon) return null;
                return <SocialLink key={key} href={url} icon={Icon} label={key} />;
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bio text */}
      {(author as Author)?.bio ? (
        <p
          className="text-sm leading-relaxed line-clamp-3"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif-body)" }}
        >
          {(author as Author).bio}
        </p>
      ) : author?.description ? (
        <p
          className="text-sm leading-relaxed line-clamp-3"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif-body)" }}
        >
          {author.description}
        </p>
      ) : (
        <p
          className="text-xs sm:text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif-body)" }}
        >
          Este texto foi publicado sob licença livre de distribuição. Todo o conteúdo é livre para
          reprodução, debate e citação com atribuição da fonte.
        </p>
      )}

      {/* Bottom row: custom links + profile link */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap gap-2">
          {author?.links && author.links.map((link, i) => (
            <Link
              key={i}
              href={link.url}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors hover:bg-[var(--accent-red)] hover:text-white"
              style={{
                backgroundColor: "var(--badge-bg)",
                color: "var(--text-secondary)",
              }}
            >
              <ExternalLink className="w-3 h-3" />
              {link.label}
            </Link>
          ))}
        </div>

        {profileHref && (
          <Link
            href={profileHref}
            className="inline-flex items-center gap-1 text-xs font-semibold transition-colors hover:text-[var(--accent-red)]"
            style={{ color: "var(--text-muted)" }}
          >
            Ver todos os textos →
          </Link>
        )}
      </div>
    </div>
  );
}
