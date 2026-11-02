import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Author, AuthorMeta, AuthorSocials } from "@/types/author";
import { SOCIAL_META } from "@/components/SocialIcons";

interface AuthorCardProps {
  author: Author | AuthorMeta | null;
  fallbackName?: string;
  variant?: "header" | "footer";
}

// ─── Social icon button ───────────────────────────────────────────────────────
function SocialButton({
  href,
  socialKey,
}: {
  href: string;
  socialKey: keyof AuthorSocials;
}) {
  const meta = SOCIAL_META[socialKey];
  if (!meta) return null;
  const { Icon, label } = meta;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="group/social inline-flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-150 hover:scale-110"
      style={{
        borderColor: "var(--border-color)",
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-secondary)",
      }}
    >
      <Icon className="w-4 h-4" />
    </a>
  );
}

function SocialRow({ socials }: { socials: AuthorSocials }) {
  const entries = (Object.entries(socials) as [keyof AuthorSocials, string | undefined][]).filter(
    ([, v]) => Boolean(v)
  );
  if (entries.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {entries.map(([key, url]) =>
        url ? <SocialButton key={key} href={url} socialKey={key} /> : null
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AuthorCard({
  author,
  fallbackName = "Maltese",
  variant = "header",
}: AuthorCardProps) {
  const displayName = author?.name || fallbackName;
  const initial = displayName.charAt(0).toUpperCase();
  const profileHref = author?.slug ? `/autores/${author.slug}` : null;

  // ── HEADER ───────────────────────────────────────────────────────────────────
  if (variant === "header") {
    const avatarEl = author?.avatar ? (
      <Image
        src={author.avatar}
        alt={displayName}
        width={36}
        height={36}
        className="w-[5rem] h-[5rem] rounded-full object-cover shrink-0 ring-1 ring-[var(--border-color)]"
        unoptimized
      />
    ) : (
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-base shrink-0"
        style={{
          backgroundColor: "var(--accent-red)",
          color: "#fff",
          fontFamily: "var(--font-serif-title)",
        }}
      >
        {initial}
      </div>
    );

    return (
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {profileHref ? (
          <Link href={profileHref} className="shrink-0 hover:opacity-80 transition-opacity">
            {avatarEl}
          </Link>
        ) : (
          avatarEl
        )}

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
          {author?.role && (
            <p className="text-sm leading-tight mt-0.5" style={{ color: "var(--text-muted)" }}>
              {author.role}
            </p>
          )}
        </div>

        {author?.socials && (
          <div className="ml-auto shrink-0">
            <SocialRow socials={author.socials} />
          </div>
        )}
      </div>
    );
  }

  // ── FOOTER ───────────────────────────────────────────────────────────────────
  return (
    <div
      className="p-5 sm:p-6 rounded-xl border space-y-4"
      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
    >
      {/* Identity row */}
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
            className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-2xl shrink-0"
            style={{ backgroundColor: "var(--accent-red)", color: "#fff", fontFamily: "var(--font-serif-title)" }}
          >
            {initial}
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-2">
          <div>
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
              <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
                {author.role}
              </p>
            )}
          </div>

          {author?.socials && <SocialRow socials={author.socials} />}
        </div>
      </div>

      {/* Bio */}
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
          {author?.links?.map((link, i) => (
            <Link
              key={i}
              href={link.url}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors hover:bg-[var(--accent-red)] hover:text-white"
              style={{ backgroundColor: "var(--badge-bg)", color: "var(--text-secondary)" }}
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
