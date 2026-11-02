import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllDocs, getDocBySlug, getDocCategoryGroups } from "@/lib/docs";
import siteConfig from "@site-config";
import DocSidebar from "@/components/DocSidebar";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import ArticleContent from "@/components/ArticleContent";
import DocReaderControls from "@/components/DocReaderControls";
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const docs = getAllDocs();
  if (docs.length === 0) {
    return [{ slug: "introducao" }];
  }
  return docs.map((doc) => ({
    slug: doc.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const doc = await getDocBySlug(slug);

  if (!doc) {
    return {
      title: "Documento não encontrado | Documentação",
    };
  }

  return {
    title: `${doc.title} — Documentação ${siteConfig.title}`,
    description: doc.summary,
    openGraph: {
      title: `${doc.title} — Documentação ${siteConfig.title}`,
      description: doc.summary,
      type: "article",
    },
  };
}

async function DocDetailContent({ paramsPromise }: { paramsPromise: Promise<{ slug: string }> }) {
  const { slug } = await paramsPromise;
  const doc = await getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  const allDocs = getAllDocs();
  const groups = getDocCategoryGroups();

  const currentIndex = allDocs.findIndex((d) => d.slug === slug);
  const prevDoc = currentIndex > 0 ? allDocs[currentIndex - 1] : null;
  const nextDoc = currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : null;

  const githubDocUrl = `https://github.com/${siteConfig.git.owner}/${siteConfig.git.repo}/blob/${siteConfig.git.branch}/content/docs/${doc.slug}.md`;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ReadingProgressBar />

      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between text-xs pb-3 border-b" style={{ borderColor: "var(--border-light)" }}>
        <div className="flex items-center gap-2">
          <Link
            href="/docs"
            className="flex items-center gap-1 opacity-70 hover:opacity-100 hover:text-[var(--accent-red)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Documentação</span>
          </Link>
          <span className="opacity-40">/</span>
          <span className="font-semibold text-[var(--accent-red)]">{doc.category}</span>
          <span className="opacity-40 hidden sm:inline">/</span>
          <span className="opacity-70 truncate max-w-[200px] hidden sm:inline">{doc.title}</span>
        </div>

        <a
          href={githubDocUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 opacity-60 hover:opacity-100 text-[11px] underline"
          title="Ver este arquivo Markdown no GitHub"
        >
          <span>Ver no GitHub</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Main Grid: Sidebar + Doc Article */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Navigation Sidebar */}
        <DocSidebar groups={groups} currentSlug={doc.slug} />

        {/* Article Body Container */}
        <article
          className="flex-1 w-full p-6 sm:p-10 rounded-3xl border shadow-xs space-y-8"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-color)",
          }}
        >
          {/* Doc Header */}
          <header className="space-y-4 border-b pb-6" style={{ borderColor: "var(--border-light)" }}>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[var(--accent-red-light)] text-[var(--accent-red)]">
                {doc.category}
              </span>
              {doc.readingTime && (
                <span className="text-xs font-mono opacity-60 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {doc.readingTime}
                </span>
              )}
            </div>

            <h1
              className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight"
              style={{ fontFamily: "var(--font-serif-title)", color: "var(--text-primary)" }}
            >
              {doc.title}
            </h1>

            {doc.summary && (
              <p
                className="text-sm sm:text-base leading-relaxed opacity-80 italic"
                style={{ fontFamily: "var(--font-serif-body)" }}
              >
                {doc.summary}
              </p>
            )}
          </header>

          {/* Reader Controls Toolbar */}
          <DocReaderControls doc={doc} />

          {/* Main Doc Markdown Content with dynamic reader font size and rich prose */}
          <ArticleContent htmlContent={doc.htmlContent} />

          {/* Bottom Pagination Links */}
          <div
            className="pt-8 border-t grid grid-cols-1 sm:grid-cols-2 gap-4"
            style={{ borderColor: "var(--border-light)" }}
          >
            {prevDoc ? (
              <Link
                href={`/docs/${prevDoc.slug}`}
                className="group p-4 rounded-2xl border transition-all hover:border-[var(--accent-red)] flex flex-col items-start gap-1"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border-color)",
                }}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 flex items-center gap-1 group-hover:text-[var(--accent-red)]">
                  <ArrowLeft className="w-3 h-3" />
                  Anterior
                </span>
                <span
                  className="text-xs sm:text-sm font-bold font-serif group-hover:text-[var(--accent-red)] transition-colors"
                  style={{ color: "var(--text-primary)" }}
                >
                  {prevDoc.title}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {nextDoc ? (
              <Link
                href={`/docs/${nextDoc.slug}`}
                className="group p-4 rounded-2xl border transition-all hover:border-[var(--accent-red)] flex flex-col items-end text-right gap-1"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border-color)",
                }}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 flex items-center gap-1 group-hover:text-[var(--accent-red)]">
                  Próximo
                  <ArrowRight className="w-3 h-3" />
                </span>
                <span
                  className="text-xs sm:text-sm font-bold font-serif group-hover:text-[var(--accent-red)] transition-colors"
                  style={{ color: "var(--text-primary)" }}
                >
                  {nextDoc.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </article>
      </div>
    </div>
  );
}

export default function DocDetailPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto p-12 text-center text-sm opacity-60">
          Carregando documento...
        </div>
      }
    >
      <DocDetailContent paramsPromise={params} />
    </Suspense>
  );
}
