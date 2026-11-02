import Link from "next/link";
import Image from "next/image";
import { getAllAuthors } from "@/lib/authors";
import { getAllPosts } from "@/lib/posts";
import { Globe, Link2, AtSign, ExternalLink, ArrowRight } from "lucide-react";
import siteConfig from "@site-config";

export const metadata = {
  title: "Autores",
  description: `Conheça os autores que contribuem com ${siteConfig.title}.`,
};

export default function AutoresPage() {
  const authors = getAllAuthors();
  const allPosts = getAllPosts();

  // Count posts per author — normalized comparison
  const normalizeName = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();

  const postCountByAuthor = (authorName: string) =>
    allPosts.filter(
      (p) => normalizeName(p.author || "") === normalizeName(authorName)
    ).length;

  return (
    <div className="space-y-10">
      {/* Page header */}
      <div className="space-y-2 border-b pb-6" style={{ borderColor: "var(--border-color)" }}>
        <h1
          className="text-3xl sm:text-4xl font-extrabold tracking-tight"
          style={{ fontFamily: "var(--font-serif-title)", color: "var(--text-primary)" }}
        >
          Autores
        </h1>
        <p
          className="text-sm sm:text-base leading-relaxed"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif-body)" }}
        >
          Vozes que compõem o Caderno Maltese — escritores, pensadores e articulistas que contribuem
          com ensaios, manifestos e reflexões.
        </p>
      </div>

      {authors.length === 0 ? (
        <div
          className="py-16 text-center space-y-3"
          style={{ color: "var(--text-muted)" }}
        >
          <p className="text-base opacity-60">Nenhum autor cadastrado ainda.</p>
          <p className="text-sm opacity-40">
            Adicione arquivos <code className="font-mono text-xs">.md</code> em{" "}
            <code className="font-mono text-xs">content/authors/</code>.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {authors.map((author) => {
            const count = postCountByAuthor(author.name);
            const initial = author.name.charAt(0).toUpperCase();

            return (
              <Link
                key={author.slug}
                href={`/autores/${author.slug}`}
                className="group flex flex-col gap-4 p-5 rounded-2xl border transition-all duration-200 hover:shadow-md hover:border-[var(--accent-red)]"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-color)",
                }}
              >
                {/* Avatar + name */}
                <div className="flex items-center gap-3">
                  {author.avatar ? (
                    <Image
                      src={author.avatar}
                      alt={author.name}
                      width={52}
                      height={52}
                      className="w-13 h-13 rounded-full object-cover shrink-0"
                      unoptimized
                    />
                  ) : (
                    <div
                      className="w-13 h-13 rounded-full flex items-center justify-center font-serif font-bold text-xl shrink-0"
                      style={{
                        backgroundColor: "var(--accent-red)",
                        color: "#fff",
                        fontFamily: "var(--font-serif-title)",
                        width: "3.25rem",
                        height: "3.25rem",
                      }}
                    >
                      {initial}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h2
                      className="font-bold text-base leading-tight group-hover:text-[var(--accent-red)] transition-colors"
                      style={{ color: "var(--text-primary)", fontFamily: "var(--font-serif-title)" }}
                    >
                      {author.name}
                    </h2>
                    {author.role && (
                      <p className="text-xs mt-0.5 opacity-70" style={{ color: "var(--text-muted)" }}>
                        {author.role}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                {author.description && (
                  <p
                    className="text-sm leading-relaxed line-clamp-2 flex-1"
                    style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif-body)" }}
                  >
                    {author.description}
                  </p>
                )}

                {/* Footer: post count + socials */}
                <div className="flex items-center justify-between pt-3 border-t text-xs" style={{ borderColor: "var(--border-light)" }}>
                  <span className="font-semibold" style={{ color: "var(--text-muted)" }}>
                    {count === 0
                      ? "Sem textos"
                      : count === 1
                      ? "1 texto"
                      : `${count} textos`}
                  </span>

                  <div className="flex items-center gap-2">
                    {author.socials?.website && <Globe className="w-3.5 h-3.5 opacity-50" style={{ color: "var(--text-secondary)" }} />}
                    {author.socials?.github && <Link2 className="w-3.5 h-3.5 opacity-50" style={{ color: "var(--text-secondary)" }} />}
                    {author.socials?.twitter && <AtSign className="w-3.5 h-3.5 opacity-50" style={{ color: "var(--text-secondary)" }} />}
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--accent-red)" }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
