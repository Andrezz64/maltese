"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Plus,
  ChevronRight,
  User,
  Globe,
  Link2,
  AtSign,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  GitCommit,
  ArrowLeft,
  Trash2,
  Check,
} from "lucide-react";
import {
  getRepoFileContent,
  listRepoFiles,
  commitFileToGitHub,
  deleteFileFromGitHub,
  GitHubFileItem,
} from "@/lib/github";
import siteConfig from "@site-config";

// ─── Storage key — same as gerador ───────────────────────────────────────────
const STORAGE_GIT_AUTH = "salomao_editor_git_auth";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AuthorLink {
  label: string;
  url: string;
}

interface AuthorForm {
  name: string;
  slug: string;
  role: string;
  description: string;
  avatar: string;
  websiteUrl: string;
  githubUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
  links: AuthorLink[];
  bio: string;
}

interface GitAuth {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface AuthorPickerPanelProps {
  /** Current author name selected in the post */
  currentAuthor: string;
  /** Called when user clicks "Usar" on an author */
  onSelect: (authorName: string) => void;
  onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function emptyForm(defaultName = ""): AuthorForm {
  return {
    name: defaultName,
    slug: slugify(defaultName),
    role: "",
    description: "",
    avatar: "",
    websiteUrl: "",
    githubUrl: "",
    twitterUrl: "",
    linkedinUrl: "",
    instagramUrl: "",
    links: [],
    bio: "",
  };
}

function buildMarkdown(form: AuthorForm): string {
  const q = (s: string) => s.replace(/"/g, '\\"');
  const lines = ["---"];
  lines.push(`name: "${q(form.name)}"`);
  lines.push(`slug: "${form.slug}"`);
  if (form.role) lines.push(`role: "${q(form.role)}"`);
  if (form.description) lines.push(`description: "${q(form.description)}"`);
  if (form.avatar) lines.push(`avatar: "${form.avatar}"`);

  const hasSocials = form.websiteUrl || form.githubUrl || form.twitterUrl || form.linkedinUrl || form.instagramUrl;
  if (hasSocials) {
    lines.push("socials:");
    if (form.websiteUrl) lines.push(`  website: "${form.websiteUrl}"`);
    if (form.githubUrl) lines.push(`  github: "${form.githubUrl}"`);
    if (form.twitterUrl) lines.push(`  twitter: "${form.twitterUrl}"`);
    if (form.linkedinUrl) lines.push(`  linkedin: "${form.linkedinUrl}"`);
    if (form.instagramUrl) lines.push(`  instagram: "${form.instagramUrl}"`);
  }

  const validLinks = form.links.filter((l) => l.label && l.url);
  if (validLinks.length > 0) {
    lines.push("links:");
    validLinks.forEach((l) => {
      lines.push(`  - label: "${q(l.label)}"`);
      lines.push(`    url: "${l.url}"`);
    });
  }

  lines.push("---");
  lines.push("");
  if (form.bio.trim()) lines.push(form.bio.trim());
  lines.push("");

  return lines.join("\n");
}

function parseMd(raw: string): AuthorForm {
  const normalized = raw.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return emptyForm();

  const yamlBlock = match[1];
  const bio = match[2].trim();
  const data: Record<string, any> = {};
  const yamlLines = yamlBlock.split("\n");
  let currentKey = "";
  let inLinks = false;
  let currentLink: { label?: string; url?: string } | null = null;

  for (const line of yamlLines) {
    const topMatch = line.match(/^([a-zA-Z_]+):\s*(.*)/);
    if (topMatch && !line.startsWith(" ") && !line.startsWith("\t")) {
      const key = topMatch[1];
      const val = topMatch[2].trim().replace(/^["']|["']$/g, "");
      currentKey = key;
      inLinks = key === "links";
      if (inLinks) { data.links = []; currentLink = null; }
      else if (key === "socials") { data.socials = {}; }
      else { data[key] = val; }
      continue;
    }
    const indented = line.match(/^\s{2}([a-zA-Z_]+):\s*(.*)/);
    if (indented) {
      const key = indented[1];
      const val = indented[2].trim().replace(/^["']|["']$/g, "");
      if (currentKey === "socials") { data.socials = data.socials || {}; data.socials[key] = val; }
      else if (inLinks && key === "label") { if (currentLink) data.links.push(currentLink); currentLink = { label: val }; }
      else if (inLinks && key === "url" && currentLink) { currentLink.url = val; }
      continue;
    }
    const listLabel = line.match(/^\s{2}-\s+label:\s*(.*)/);
    if (listLabel) { if (currentLink) data.links.push(currentLink); currentLink = { label: listLabel[1].replace(/^["']|["']$/g, "") }; continue; }
    const listUrl = line.match(/^\s{4}url:\s*(.*)/);
    if (listUrl && currentLink) { currentLink.url = listUrl[1].replace(/^["']|["']$/g, ""); continue; }
  }
  if (currentLink) data.links.push(currentLink);

  return {
    name: data.name || "",
    slug: data.slug || "",
    role: data.role || "",
    description: data.description || "",
    avatar: data.avatar || "",
    websiteUrl: data.socials?.website || "",
    githubUrl: data.socials?.github || "",
    twitterUrl: data.socials?.twitter || "",
    linkedinUrl: data.socials?.linkedin || "",
    instagramUrl: data.socials?.instagram || "",
    links: Array.isArray(data.links)
      ? data.links.filter((l: any) => l.label && l.url)
      : [],
    bio,
  };
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AuthorPickerPanel({ currentAuthor, onSelect, onClose }: AuthorPickerPanelProps) {
  // ── Git auth (read-only from storage, shared with gerador) ────────────────
  const [gitAuth, setGitAuth] = useState<GitAuth | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_GIT_AUTH);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.token && p.owner && p.repo) {
          setGitAuth({ token: p.token, owner: p.owner, repo: p.repo, branch: p.branch || "main" });
        }
      }
    } catch { /* ignore */ }
  }, []);

  // ── Author list ───────────────────────────────────────────────────────────
  const [remoteFiles, setRemoteFiles] = useState<GitHubFileItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  useEffect(() => {
    if (gitAuth) loadList(gitAuth);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gitAuth]);

  async function loadList(auth: GitAuth) {
    setIsLoadingList(true);
    setListError(null);
    try {
      const authorsPath = siteConfig.git.authorsPath || "content/authors";
      const res = await listRepoFiles(auth.token, auth.owner, auth.repo, auth.branch, authorsPath);
      if (res.error) setListError(res.error);
      else setRemoteFiles(res.files);
    } catch (e: any) {
      setListError(e?.message || "Erro ao listar autores.");
    } finally {
      setIsLoadingList(false);
    }
  }

  // ── Views: "list" | "edit" ────────────────────────────────────────────────
  const [view, setView] = useState<"list" | "edit">("list");
  const [editForm, setEditForm] = useState<AuthorForm>(emptyForm());
  const [editFileSha, setEditFileSha] = useState<string | null>(null);
  const [isExistingFile, setIsExistingFile] = useState(false);

  // ── Commit state ──────────────────────────────────────────────────────────
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Delete ────────────────────────────────────────────────────────────────
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // ── Avatar error ──────────────────────────────────────────────────────────
  const [avatarErr, setAvatarErr] = useState(false);
  useEffect(() => { setAvatarErr(false); }, [editForm.avatar]);

  function setField<K extends keyof AuthorForm>(k: K, v: AuthorForm[K]) {
    setEditForm((p) => ({ ...p, [k]: v }));
  }

  function openNew() {
    setEditForm(emptyForm());
    setEditFileSha(null);
    setIsExistingFile(false);
    setSaveError(null);
    setSaveSuccess(false);
    setConfirmDelete(false);
    setView("edit");
  }

  async function openEdit(file: GitHubFileItem) {
    if (!gitAuth) return;
    setSaveError(null);
    setSaveSuccess(false);
    setConfirmDelete(false);
    try {
      const res = await getRepoFileContent(gitAuth.token, gitAuth.owner, gitAuth.repo, gitAuth.branch, file.path);
      if (res.exists && res.content) {
        setEditForm(parseMd(res.content));
        setEditFileSha(res.sha || null);
        setIsExistingFile(true);
        setView("edit");
      }
    } catch (e: any) {
      setListError(e?.message || "Erro ao carregar autor.");
    }
  }

  async function handleSave() {
    if (!gitAuth) { setSaveError("Git não configurado. Configure em Commitar > Git."); return; }
    if (!editForm.name.trim() || !editForm.slug.trim()) { setSaveError("Nome e slug são obrigatórios."); return; }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const authorsPath = siteConfig.git.authorsPath || "content/authors";
    const filePath = `${authorsPath}/${editForm.slug}.md`;
    const content = buildMarkdown(editForm);

    try {
      const result = await commitFileToGitHub({
        token: gitAuth.token,
        owner: gitAuth.owner,
        repo: gitAuth.repo,
        branch: gitAuth.branch,
        path: filePath,
        content,
        message: isExistingFile
          ? `feat(authors): atualiza autor "${editForm.name}"`
          : `feat(authors): adiciona autor "${editForm.name}"`,
        sha: editFileSha,
      });
      setEditFileSha(result.contentSha);
      setIsExistingFile(true);
      setSaveSuccess(true);
      // Refresh list
      if (gitAuth) loadList(gitAuth);
    } catch (e: any) {
      setSaveError(e?.message || "Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!gitAuth || !editFileSha || !editForm.slug) return;
    setIsDeleting(true);
    setDeleteError(null);

    const authorsPath = siteConfig.git.authorsPath || "content/authors";
    const filePath = `${authorsPath}/${editForm.slug}.md`;

    try {
      await deleteFileFromGitHub({
        token: gitAuth.token,
        owner: gitAuth.owner,
        repo: gitAuth.repo,
        branch: gitAuth.branch,
        path: filePath,
        sha: editFileSha,
        message: `chore(authors): remove autor "${editForm.name}"`,
      });
      setView("list");
      if (gitAuth) loadList(gitAuth);
    } catch (e: any) {
      setDeleteError(e?.message || "Erro ao deletar.");
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  }

  const displayName = editForm.name || "Autor";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel — slides in from right */}
      <aside
        className="absolute right-0 top-0 h-full w-full max-w-md flex flex-col shadow-2xl animate-in slide-in-from-right duration-250"
        style={{ backgroundColor: "var(--bg-card)", borderLeft: "1px solid var(--border-color)" }}
      >
        {/* ── Panel header ─────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b shrink-0"
          style={{ borderColor: "var(--border-color)" }}
        >
          {view === "edit" ? (
            <button
              onClick={() => { setView("list"); setSaveSuccess(false); setSaveError(null); }}
              className="flex items-center gap-1.5 text-xs font-semibold hover:opacity-70 transition-opacity"
              style={{ color: "var(--accent-red)" }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Autores
            </button>
          ) : (
            <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              Autores
            </span>
          )}
          <button onClick={onClose} className="p-1 rounded-lg opacity-60 hover:opacity-100 transition-opacity">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* VIEW: LIST                                                         */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {view === "list" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-2">

            {/* New author button */}
            <button
              onClick={openNew}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all hover:opacity-80 text-left"
              style={{ borderColor: "var(--accent-red)", color: "var(--accent-red)", backgroundColor: "var(--bg-primary)" }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border" style={{ borderColor: "var(--accent-red)" }}>
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold">Novo autor</span>
            </button>

            {/* No git warning */}
            {!gitAuth && (
              <div
                className="flex items-start gap-2 text-xs px-3 py-3 rounded-xl"
                style={{ backgroundColor: "var(--badge-bg)", color: "var(--text-secondary)" }}
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 opacity-60" />
                <span>Configure o Git no botão <strong>Commitar</strong> para listar e salvar autores no repositório.</span>
              </div>
            )}

            {/* Loading */}
            {isLoadingList && (
              <div className="py-8 flex flex-col items-center gap-2 opacity-50" style={{ color: "var(--text-muted)" }}>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span className="text-xs">Carregando...</span>
              </div>
            )}

            {/* Error */}
            {listError && (
              <div className="flex items-center gap-2 text-xs px-3 py-2.5 rounded-xl" style={{ backgroundColor: "#ef444415", color: "#ef4444" }}>
                <AlertCircle className="w-4 h-4 shrink-0" />
                {listError}
              </div>
            )}

            {/* Author list */}
            {!isLoadingList && remoteFiles.map((file) => {
              const name = file.name.replace(/\.mdx?$/, "");
              const isActive = currentAuthor.toLowerCase().replace(/\s+/g, "-") === name ||
                               currentAuthor === name;
              return (
                <div
                  key={file.sha}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all"
                  style={{
                    borderColor: isActive ? "var(--accent-red)" : "var(--border-light)",
                    backgroundColor: "var(--bg-primary)",
                  }}
                >
                  {/* Avatar placeholder */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                    style={{ backgroundColor: "var(--accent-red)", color: "#fff" }}
                  >
                    {name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                      {name}
                    </p>
                    {isActive && (
                      <p className="text-[11px] flex items-center gap-1" style={{ color: "var(--accent-red)" }}>
                        <Check className="w-3 h-3" /> Em uso neste texto
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Edit */}
                    <button
                      onClick={() => openEdit(file)}
                      className="p-1.5 rounded-lg border text-[11px] font-semibold transition-all hover:opacity-70"
                      style={{ borderColor: "var(--border-light)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}
                      title="Editar autor"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    {/* Use */}
                    <button
                      onClick={() => { onSelect(name); onClose(); }}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:opacity-90"
                      style={{ backgroundColor: "var(--accent-red)", color: "#fff" }}
                      title="Usar este autor no texto"
                    >
                      Usar
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Refresh */}
            {gitAuth && !isLoadingList && (
              <button
                onClick={() => loadList(gitAuth)}
                className="w-full text-xs py-2 opacity-50 hover:opacity-80 flex items-center justify-center gap-1.5 transition-opacity"
                style={{ color: "var(--text-muted)" }}
              >
                <RefreshCw className="w-3 h-3" /> Atualizar lista
              </button>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* VIEW: EDIT / CREATE                                                */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {view === "edit" && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">

              {/* Success banner */}
              {saveSuccess && (
                <div className="flex items-center gap-2 text-xs px-3 py-2.5 rounded-xl" style={{ backgroundColor: "#22c55e15", color: "#22c55e" }}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Autor salvo no repositório!
                  <button
                    onClick={() => { onSelect(editForm.name); onClose(); }}
                    className="ml-auto font-bold px-2 py-0.5 rounded underline"
                  >
                    Usar agora
                  </button>
                </div>
              )}

              {/* Error */}
              {saveError && (
                <div className="flex items-center gap-2 text-xs px-3 py-2.5 rounded-xl" style={{ backgroundColor: "#ef444415", color: "#ef4444" }}>
                  <AlertCircle className="w-4 h-4 shrink-0" /> {saveError}
                </div>
              )}

              {/* ── Avatar preview strip ──────────────────────────────────── */}
              <div className="flex items-center gap-3">
                {editForm.avatar && !avatarErr ? (
                  <Image
                    src={editForm.avatar}
                    alt={displayName}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                    unoptimized
                    onError={() => setAvatarErr(true)}
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shrink-0"
                    style={{ backgroundColor: "var(--accent-red)", color: "#fff" }}
                  >
                    {initial}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
                    {editForm.name || "Nome do autor"}
                  </p>
                  <p className="text-xs opacity-60" style={{ color: "var(--text-muted)" }}>
                    {editForm.role || "Cargo / papel"}
                  </p>
                </div>
              </div>

              {/* ── Fields ───────────────────────────────────────────────── */}
              {/* Name + Slug */}
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide opacity-60" style={{ color: "var(--text-secondary)" }}>Nome *</span>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => {
                      const n = e.target.value;
                      setEditForm((p) => ({ ...p, name: n, slug: p.slug || slugify(n) }));
                    }}
                    placeholder="Eternauta Maltese"
                    className="px-2.5 py-1.5 rounded-lg border text-xs outline-none transition-all"
                    style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide opacity-60" style={{ color: "var(--text-secondary)" }}>Slug *</span>
                  <input
                    type="text"
                    value={editForm.slug}
                    onChange={(e) => setField("slug", slugify(e.target.value))}
                    placeholder="eternauta-maltese"
                    className="px-2.5 py-1.5 rounded-lg border text-xs font-mono outline-none transition-all"
                    style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-wide opacity-60" style={{ color: "var(--text-secondary)" }}>Cargo / Papel</span>
                <input
                  type="text"
                  value={editForm.role}
                  onChange={(e) => setField("role", e.target.value)}
                  placeholder="Desenvolvedor e Escritor"
                  className="px-2.5 py-1.5 rounded-lg border text-xs outline-none transition-all"
                  style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-wide opacity-60" style={{ color: "var(--text-secondary)" }}>URL do Avatar</span>
                <input
                  type="url"
                  value={editForm.avatar}
                  onChange={(e) => setField("avatar", e.target.value)}
                  placeholder="https://avatars.githubusercontent.com/..."
                  className="px-2.5 py-1.5 rounded-lg border text-xs outline-none transition-all"
                  style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-wide opacity-60" style={{ color: "var(--text-secondary)" }}>Descrição curta</span>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setField("description", e.target.value)}
                  rows={2}
                  placeholder="Bio curta para SEO e metadados."
                  className="px-2.5 py-1.5 rounded-lg border text-xs outline-none resize-none transition-all"
                  style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                />
              </label>

              {/* Socials */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide opacity-60 block" style={{ color: "var(--text-secondary)" }}>Redes Sociais</span>
                {[
                  { key: "websiteUrl" as const, icon: Globe, placeholder: "https://... (site)" },
                  { key: "githubUrl" as const, icon: Link2, placeholder: "https://github.com/..." },
                  { key: "twitterUrl" as const, icon: AtSign, placeholder: "https://x.com/..." },
                  { key: "linkedinUrl" as const, icon: ExternalLink, placeholder: "https://linkedin.com/..." },
                  { key: "instagramUrl" as const, icon: ExternalLink, placeholder: "https://instagram.com/..." },
                ].map(({ key, icon: Icon, placeholder }) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 shrink-0 opacity-40" style={{ color: "var(--text-secondary)" }} />
                    <input
                      type="url"
                      value={editForm[key]}
                      onChange={(e) => setField(key, e.target.value)}
                      placeholder={placeholder}
                      className="flex-1 px-2.5 py-1.5 rounded-lg border text-xs outline-none transition-all"
                      style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                    />
                  </div>
                ))}
              </div>

              {/* Bio */}
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-wide opacity-60" style={{ color: "var(--text-secondary)" }}>Bio (texto livre)</span>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setField("bio", e.target.value)}
                  rows={4}
                  placeholder="Aparece no rodapé dos artigos deste autor."
                  className="px-2.5 py-1.5 rounded-lg border text-xs outline-none resize-y font-mono transition-all"
                  style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                />
              </label>

              {/* Delete zone */}
              {isExistingFile && (
                <div
                  className="rounded-xl border p-3 space-y-2"
                  style={{ borderColor: "#ef444430", backgroundColor: "#ef444408" }}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#ef4444" }}>
                    Zona de Perigo
                  </p>
                  {deleteError && (
                    <p className="text-xs" style={{ color: "#ef4444" }}>{deleteError}</p>
                  )}
                  {confirmDelete ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="flex-1 text-xs py-1.5 rounded-lg border transition-all"
                        style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex-1 text-xs py-1.5 rounded-lg font-bold transition-all"
                        style={{ backgroundColor: "#ef4444", color: "#fff" }}
                      >
                        {isDeleting ? "Deletando..." : "Confirmar deleção"}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="flex items-center gap-1.5 text-xs font-semibold transition-all hover:opacity-70"
                      style={{ color: "#ef4444" }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Deletar autor do repositório
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── Footer actions ─────────────────────────────────────────── */}
            <div
              className="px-4 py-3 border-t flex gap-2 shrink-0"
              style={{ borderColor: "var(--border-color)" }}
            >
              {/* Use without saving (if editing existing) */}
              {isExistingFile && (
                <button
                  onClick={() => { onSelect(editForm.name); onClose(); }}
                  className="flex-1 text-xs font-semibold py-2 rounded-lg border transition-all hover:opacity-80"
                  style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)", backgroundColor: "var(--bg-primary)" }}
                >
                  Usar sem salvar
                </button>
              )}

              {/* Save to git + use */}
              <button
                onClick={handleSave}
                disabled={isSaving || !gitAuth}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "var(--accent-red)", color: "#fff" }}
                title={!gitAuth ? "Configure o Git antes de salvar" : ""}
              >
                {isSaving
                  ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Salvando...</>
                  : <><GitCommit className="w-3.5 h-3.5" /> {isExistingFile ? "Salvar" : "Criar"} no Git</>
                }
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
