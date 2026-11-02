"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import siteConfig from "@site-config";
import {
  testGitHubConnection,
  getRepoFileContent,
  listRepoFiles,
  commitFileToGitHub,
  deleteFileFromGitHub,
  GitHubUser,
  GitHubFileItem,
} from "@/lib/github";
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  GitBranch,
  GitCommit,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  User,
  Users,
  Globe,
  Link2,
  AtSign,
  Eye,
  EyeOff,
  FolderOpen,
  FileText,
} from "lucide-react";

// ─── Storage keys ─────────────────────────────────────────────────────────────
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

interface GitAuthConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  user: GitHubUser | null;
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

function buildMarkdown(form: AuthorForm): string {
  const lines: string[] = ["---"];
  lines.push(`name: "${form.name.replace(/"/g, '\\"')}"`);
  lines.push(`slug: "${form.slug}"`);
  if (form.role) lines.push(`role: "${form.role.replace(/"/g, '\\"')}"`);
  if (form.description) lines.push(`description: "${form.description.replace(/"/g, '\\"')}"`);
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
      lines.push(`  - label: "${l.label.replace(/"/g, '\\"')}"`);
      lines.push(`    url: "${l.url}"`);
    });
  }

  lines.push("---");
  lines.push("");
  lines.push(form.bio.trim());
  lines.push("");

  return lines.join("\n");
}

function parseAuthorMd(raw: string): AuthorForm {
  const normalized = raw.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return emptyForm();
  }

  const yamlBlock = match[1];
  const bio = match[2].trim();

  // Simple line-by-line YAML parser (handles indented blocks for socials/links)
  const data: Record<string, any> = {};
  const yamlLines = yamlBlock.split("\n");
  let currentKey = "";
  let inLinks = false;
  let currentLink: { label?: string; url?: string } | null = null;

  for (const line of yamlLines) {
    // Top-level key: value
    const topMatch = line.match(/^([a-zA-Z_]+):\s*(.*)/);
    if (topMatch && !line.startsWith(" ") && !line.startsWith("\t")) {
      const key = topMatch[1];
      const val = topMatch[2].trim().replace(/^["']|["']$/g, "");
      currentKey = key;
      inLinks = key === "links";
      if (inLinks) {
        data.links = [];
        currentLink = null;
      } else if (key === "socials") {
        data.socials = {};
      } else {
        data[key] = val === "true" ? true : val === "false" ? false : val;
      }
      continue;
    }

    // Indented key: value (socials)
    const indentedMatch = line.match(/^\s{2}([a-zA-Z_]+):\s*(.*)/);
    if (indentedMatch) {
      const key = indentedMatch[1];
      const val = indentedMatch[2].trim().replace(/^["']|["']$/g, "");
      if (currentKey === "socials") {
        data.socials = data.socials || {};
        data.socials[key] = val;
      } else if (inLinks && key === "label") {
        if (currentLink) data.links.push(currentLink);
        currentLink = { label: val };
      } else if (inLinks && key === "url" && currentLink) {
        currentLink.url = val;
      }
      continue;
    }

    // List item: - label:
    const listItemMatch = line.match(/^\s{2}-\s+label:\s*(.*)/);
    if (listItemMatch) {
      if (currentLink) data.links.push(currentLink);
      currentLink = { label: listItemMatch[1].trim().replace(/^["']|["']$/g, "") };
      continue;
    }
    const listUrlMatch = line.match(/^\s{4}url:\s*(.*)/);
    if (listUrlMatch && currentLink) {
      currentLink.url = listUrlMatch[1].trim().replace(/^["']|["']$/g, "");
      continue;
    }
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
      ? data.links.filter((l: any) => l.label && l.url).map((l: any) => ({ label: l.label, url: l.url }))
      : [],
    bio,
  };
}

function emptyForm(): AuthorForm {
  return {
    name: "",
    slug: "",
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

// ─── Component ────────────────────────────────────────────────────────────────
export default function AuthorEditorPage() {
  const [form, setForm] = useState<AuthorForm>(emptyForm());
  const [remoteFileSha, setRemoteFileSha] = useState<string | null>(null);
  const [remoteFileExists, setRemoteFileExists] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // ── Git auth ──────────────────────────────────────────────────────────────
  const [gitConfig, setGitConfig] = useState<GitAuthConfig>({
    token: "",
    owner: siteConfig.git.owner || "",
    repo: siteConfig.git.repo || "",
    branch: siteConfig.git.branch || "main",
    user: null,
  });
  const [isGitModalOpen, setIsGitModalOpen] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [isTestingGit, setIsTestingGit] = useState(false);
  const [gitTestResult, setGitTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // ── Commit modal ─────────────────────────────────────────────────────────
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
  const [commitMessage, setCommitMessage] = useState("");
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitResult, setCommitResult] = useState<{ commitSha: string; commitUrl: string } | null>(null);
  const [commitError, setCommitError] = useState<string | null>(null);

  // ── List / select modal ───────────────────────────────────────────────────
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [remoteAuthors, setRemoteAuthors] = useState<GitHubFileItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  // ── Delete confirm ────────────────────────────────────────────────────────
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isGitConnected = Boolean(gitConfig.token.trim() && gitConfig.owner && gitConfig.repo);

  // ── Load git config from storage ──────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_GIT_AUTH);
      if (raw) {
        const parsed = JSON.parse(raw);
        setGitConfig({
          token: parsed.token || "",
          owner: parsed.owner || siteConfig.git.owner || "",
          repo: parsed.repo || siteConfig.git.repo || "",
          branch: parsed.branch || siteConfig.git.branch || "main",
          user: parsed.user || null,
        });
      }
    } catch {
      /* ignore */
    }
  }, []);

  // ── ESC closes modals ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsGitModalOpen(false);
        setIsCommitModalOpen(false);
        setIsListModalOpen(false);
        setIsDeleteConfirmOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  function notify(type: "success" | "error", msg: string) {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 5000);
  }

  // ── Form helpers ──────────────────────────────────────────────────────────
  function setField<K extends keyof AuthorForm>(key: K, value: AuthorForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleNameChange(name: string) {
    setForm((prev) => ({
      ...prev,
      name,
      slug: prev.slug || slugify(name),
    }));
  }

  function addLink() {
    setField("links", [...form.links, { label: "", url: "" }]);
  }

  function updateLink(i: number, key: "label" | "url", val: string) {
    const updated = form.links.map((l, idx) => (idx === i ? { ...l, [key]: val } : l));
    setField("links", updated);
  }

  function removeLink(i: number) {
    setField("links", form.links.filter((_, idx) => idx !== i));
  }

  // ── Fetch remote authors list ─────────────────────────────────────────────
  async function fetchRemoteAuthors() {
    if (!isGitConnected) {
      setIsGitModalOpen(true);
      return;
    }
    setIsLoadingList(true);
    setListError(null);
    try {
      const authorsPath = siteConfig.git.authorsPath || "content/authors";
      const res = await listRepoFiles(gitConfig.token, gitConfig.owner, gitConfig.repo, gitConfig.branch, authorsPath);
      if (res.error) setListError(res.error);
      else setRemoteAuthors(res.files);
    } catch (e: any) {
      setListError(e?.message || "Erro ao listar autores.");
    } finally {
      setIsLoadingList(false);
    }
  }

  function openListModal() {
    setIsListModalOpen(true);
    fetchRemoteAuthors();
  }

  // ── Load author file from GitHub ──────────────────────────────────────────
  async function handleSelectRemoteAuthor(file: GitHubFileItem) {
    try {
      const res = await getRepoFileContent(gitConfig.token, gitConfig.owner, gitConfig.repo, gitConfig.branch, file.path);
      if (res.exists && res.content) {
        const parsed = parseAuthorMd(res.content);
        setForm(parsed);
        setRemoteFileSha(res.sha || null);
        setRemoteFileExists(true);
        setIsListModalOpen(false);
        notify("success", `Autor "${parsed.name}" carregado do Git (SHA: ${res.sha?.slice(0, 7)}).`);
      }
    } catch (e: any) {
      setListError(e?.message || "Erro ao carregar autor.");
    }
  }

  // ── New / Reset ───────────────────────────────────────────────────────────
  function handleNew() {
    setForm(emptyForm());
    setRemoteFileSha(null);
    setRemoteFileExists(false);
    setIsListModalOpen(false);
  }

  // ── Git test & save ───────────────────────────────────────────────────────
  async function handleTestGit() {
    setIsTestingGit(true);
    setGitTestResult(null);
    const res = await testGitHubConnection(gitConfig.token, gitConfig.owner, gitConfig.repo);
    setIsTestingGit(false);
    if (res.valid && res.user) {
      const updated = { ...gitConfig, user: res.user };
      setGitConfig(updated);
      localStorage.setItem(STORAGE_GIT_AUTH, JSON.stringify(updated));
      setGitTestResult({ success: true, message: `Conectado como @${res.user.login}!` });
    } else {
      setGitTestResult({ success: false, message: res.error || "Falha na conexão." });
    }
  }

  function handleDisconnect() {
    const reset: GitAuthConfig = {
      token: "",
      owner: siteConfig.git.owner || "",
      repo: siteConfig.git.repo || "",
      branch: siteConfig.git.branch || "main",
      user: null,
    };
    setGitConfig(reset);
    localStorage.removeItem(STORAGE_GIT_AUTH);
    setGitTestResult(null);
    setIsGitModalOpen(false);
  }

  // ── Open commit modal ─────────────────────────────────────────────────────
  async function handleOpenCommit() {
    if (!form.name.trim() || !form.slug.trim()) {
      notify("error", "Preencha pelo menos o nome e o slug do autor antes de commitar.");
      return;
    }
    if (!isGitConnected) {
      setIsGitModalOpen(true);
      return;
    }
    setCommitError(null);
    setCommitResult(null);
    setCommitMessage(`feat(authors): ${remoteFileExists ? "atualiza" : "adiciona"} autor "${form.name}"`);
    setIsCommitModalOpen(true);

    // Check remote SHA
    const authorsPath = siteConfig.git.authorsPath || "content/authors";
    const filePath = `${authorsPath}/${form.slug}.md`;
    try {
      const res = await getRepoFileContent(gitConfig.token, gitConfig.owner, gitConfig.repo, gitConfig.branch, filePath);
      setRemoteFileExists(res.exists);
      setRemoteFileSha(res.exists ? res.sha || null : null);
    } catch {
      /* ignore */
    }
  }

  // ── Execute commit ────────────────────────────────────────────────────────
  async function executeCommit() {
    if (!commitMessage.trim()) {
      setCommitError("Informe uma mensagem de commit.");
      return;
    }
    setIsCommitting(true);
    setCommitError(null);

    const authorsPath = siteConfig.git.authorsPath || "content/authors";
    const filePath = `${authorsPath}/${form.slug}.md`;
    const content = buildMarkdown(form);

    try {
      const result = await commitFileToGitHub({
        token: gitConfig.token,
        owner: gitConfig.owner,
        repo: gitConfig.repo,
        branch: gitConfig.branch,
        path: filePath,
        content,
        message: commitMessage.trim(),
        sha: remoteFileSha,
      });
      setRemoteFileSha(result.contentSha);
      setRemoteFileExists(true);
      setCommitResult({ commitSha: result.commitSha, commitUrl: result.commitUrl });
    } catch (e: any) {
      setCommitError(e?.message || "Erro ao commitar.");
    } finally {
      setIsCommitting(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function executeDelete() {
    if (!remoteFileSha || !form.slug) {
      notify("error", "Nenhum arquivo remoto para deletar.");
      setIsDeleteConfirmOpen(false);
      return;
    }
    setIsDeleting(true);
    setDeleteError(null);

    const authorsPath = siteConfig.git.authorsPath || "content/authors";
    const filePath = `${authorsPath}/${form.slug}.md`;

    try {
      await deleteFileFromGitHub({
        token: gitConfig.token,
        owner: gitConfig.owner,
        repo: gitConfig.repo,
        branch: gitConfig.branch,
        path: filePath,
        sha: remoteFileSha,
        message: `chore(authors): remove autor "${form.name}"`,
      });
      setForm(emptyForm());
      setRemoteFileSha(null);
      setRemoteFileExists(false);
      setIsDeleteConfirmOpen(false);
      notify("success", `Autor "${form.name}" deletado do repositório.`);
    } catch (e: any) {
      setDeleteError(e?.message || "Erro ao deletar.");
    } finally {
      setIsDeleting(false);
    }
  }

  // ── Avatar preview ────────────────────────────────────────────────────────
  const [avatarError, setAvatarError] = useState(false);
  useEffect(() => { setAvatarError(false); }, [form.avatar]);

  const displayName = form.name || "Autor";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">

      {/* ── Notification toast ─────────────────────────────────────────────── */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-bottom-4 duration-300 max-w-sm`}
          style={{
            backgroundColor: notification.type === "success" ? "var(--bg-card)" : "var(--bg-card)",
            borderColor: notification.type === "success" ? "#22c55e" : "var(--accent-red)",
            border: "1.5px solid",
            color: "var(--text-primary)",
          }}
        >
          {notification.type === "success"
            ? <CheckCircle2 className="w-4 h-4 shrink-0 text-green-500" />
            : <AlertCircle className="w-4 h-4 shrink-0" style={{ color: "var(--accent-red)" }} />
          }
          {notification.msg}
          <button onClick={() => setNotification(null)} className="ml-auto opacity-60 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Command Bar ────────────────────────────────────────────────────── */}
      <header
        className="rounded-2xl border p-3 shadow-xs flex flex-wrap items-center justify-between gap-2.5 sticky top-3 z-20 backdrop-blur-md"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/textos"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border transition-all hover:opacity-80"
            style={{ borderColor: "var(--border-light)", color: "var(--accent-red)", backgroundColor: "var(--bg-primary)" }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Textos</span>
          </Link>

          {/* Git status badge */}
          <button
            onClick={() => setIsGitModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all hover:opacity-80"
            style={{
              borderColor: isGitConnected ? "#22c55e40" : "var(--border-light)",
              color: isGitConnected ? "#22c55e" : "var(--text-muted)",
              backgroundColor: "var(--bg-primary)",
            }}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isGitConnected ? `${gitConfig.owner}/${gitConfig.repo}` : "Conectar Git"}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* New author */}
          <button
            onClick={handleNew}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-80"
            style={{ borderColor: "var(--border-light)", color: "var(--text-secondary)", backgroundColor: "var(--bg-primary)" }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Novo</span>
          </button>

          {/* Open list */}
          <button
            onClick={openListModal}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-80"
            style={{ borderColor: "var(--border-light)", color: "var(--text-secondary)", backgroundColor: "var(--bg-primary)" }}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Autores</span>
          </button>

          {/* Delete — only when editing existing */}
          {remoteFileExists && (
            <button
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-80"
              style={{ borderColor: "#ef444440", color: "#ef4444", backgroundColor: "var(--bg-primary)" }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Deletar</span>
            </button>
          )}

          {/* Commit */}
          <button
            onClick={handleOpenCommit}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "var(--accent-red)", color: "#fff" }}
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>{remoteFileExists ? "Atualizar" : "Publicar"}</span>
          </button>
        </div>
      </header>

      {/* ── Main form grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">

        {/* LEFT: Form fields */}
        <div className="space-y-5">

          {/* Name + Slug */}
          <section
            className="rounded-2xl border p-5 space-y-4"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
          >
            <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: "var(--accent-red)" }}>
              <User className="w-4 h-4" /> Identidade
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide opacity-70" style={{ color: "var(--text-secondary)" }}>
                  Nome *
                </span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Eternauta Maltese"
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide opacity-70" style={{ color: "var(--text-secondary)" }}>
                  Slug *
                </span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setField("slug", slugify(e.target.value))}
                  placeholder="eternauta-maltese"
                  className="w-full px-3 py-2 rounded-lg border text-sm font-mono outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide opacity-70" style={{ color: "var(--text-secondary)" }}>
                Cargo / Papel
              </span>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setField("role", e.target.value)}
                placeholder="Ex: Desenvolvedor e Escritor"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide opacity-70" style={{ color: "var(--text-secondary)" }}>
                Descrição curta (metadados / SEO)
              </span>
              <textarea
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                rows={2}
                placeholder="Uma frase sobre o autor para SEO e metadados."
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 transition-all resize-none"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide opacity-70" style={{ color: "var(--text-secondary)" }}>
                URL do Avatar
              </span>
              <input
                type="url"
                value={form.avatar}
                onChange={(e) => setField("avatar", e.target.value)}
                placeholder="https://avatars.githubusercontent.com/u/..."
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
              />
            </label>
          </section>

          {/* Socials */}
          <section
            className="rounded-2xl border p-5 space-y-4"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
          >
            <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: "var(--accent-red)" }}>
              <Globe className="w-4 h-4" /> Redes Sociais
            </h2>

            {[
              { key: "websiteUrl" as const, label: "Site pessoal", icon: Globe, placeholder: "https://..." },
              { key: "githubUrl" as const, label: "GitHub", icon: Link2, placeholder: "https://github.com/..." },
              { key: "twitterUrl" as const, label: "Twitter / X", icon: AtSign, placeholder: "https://x.com/..." },
              { key: "linkedinUrl" as const, label: "LinkedIn", icon: ExternalLink, placeholder: "https://linkedin.com/in/..." },
              { key: "instagramUrl" as const, label: "Instagram", icon: ExternalLink, placeholder: "https://instagram.com/..." },
            ].map(({ key, label, icon: Icon, placeholder }) => (
              <label key={key} className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide opacity-70 flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
                  <Icon className="w-3.5 h-3.5" /> {label}
                </span>
                <input
                  type="url"
                  value={form[key]}
                  onChange={(e) => setField(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
              </label>
            ))}
          </section>

          {/* Custom links */}
          <section
            className="rounded-2xl border p-5 space-y-4"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: "var(--accent-red)" }}>
                <Link2 className="w-4 h-4" /> Links Personalizados
              </h2>
              <button
                onClick={addLink}
                className="text-xs flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all hover:opacity-80"
                style={{ borderColor: "var(--border-light)", color: "var(--text-secondary)", backgroundColor: "var(--bg-primary)" }}
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </button>
            </div>

            {form.links.length === 0 && (
              <p className="text-xs opacity-50" style={{ color: "var(--text-muted)" }}>
                Nenhum link adicionado. Clique em &quot;Adicionar&quot; para incluir.
              </p>
            )}

            {form.links.map((link, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => updateLink(i, "label", e.target.value)}
                    placeholder="Rótulo (ex: Ensaios)"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateLink(i, "url", e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <button
                  onClick={() => removeLink(i)}
                  className="mt-1.5 p-2 rounded-lg transition-all hover:opacity-80"
                  style={{ color: "#ef4444" }}
                  title="Remover link"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </section>

          {/* Bio */}
          <section
            className="rounded-2xl border p-5 space-y-4"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
          >
            <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: "var(--accent-red)" }}>
              <FileText className="w-4 h-4" /> Bio (Markdown)
            </h2>
            <textarea
              value={form.bio}
              onChange={(e) => setField("bio", e.target.value)}
              rows={6}
              placeholder="Escreva uma bio em Markdown. Aparece no rodapé dos artigos deste autor."
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 transition-all resize-y font-mono"
              style={{
                backgroundColor: "var(--bg-primary)",
                borderColor: "var(--border-color)",
                color: "var(--text-primary)",
              }}
            />
          </section>
        </div>

        {/* RIGHT: Preview card */}
        <aside className="space-y-5">
          <section
            className="rounded-2xl border p-5 space-y-4 sticky top-24"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
          >
            <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: "var(--accent-red)" }}>
              <Eye className="w-4 h-4" /> Pré-visualização
            </h2>

            {/* Header variant */}
            <div>
              <p className="text-[11px] uppercase tracking-wider opacity-50 mb-2 font-semibold" style={{ color: "var(--text-muted)" }}>
                No topo do artigo
              </p>
              <div className="flex items-center gap-3">
                {form.avatar && !avatarError ? (
                  <Image
                    src={form.avatar}
                    alt={displayName}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                    unoptimized
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-base shrink-0"
                    style={{ backgroundColor: "var(--accent-red)", color: "#fff" }}
                  >
                    {initial}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{displayName}</p>
                  <p className="text-xs opacity-60" style={{ color: "var(--text-muted)" }}>{form.role || "Caderno Maltese"}</p>
                </div>
                <div className="flex items-center gap-1 ml-auto flex-wrap">
                  {form.websiteUrl && <Globe className="w-4 h-4 opacity-60" style={{ color: "var(--text-secondary)" }} />}
                  {form.githubUrl && <Link2 className="w-4 h-4 opacity-60" style={{ color: "var(--text-secondary)" }} />}
                  {form.twitterUrl && <AtSign className="w-4 h-4 opacity-60" style={{ color: "var(--text-secondary)" }} />}
                  {form.linkedinUrl && <ExternalLink className="w-4 h-4 opacity-60" style={{ color: "var(--text-secondary)" }} />}
                  {form.instagramUrl && <ExternalLink className="w-4 h-4 opacity-60" style={{ color: "var(--text-secondary)" }} />}
                </div>
              </div>
            </div>

            <div className="border-t" style={{ borderColor: "var(--border-light)" }} />

            {/* Footer variant preview */}
            <div>
              <p className="text-[11px] uppercase tracking-wider opacity-50 mb-2 font-semibold" style={{ color: "var(--text-muted)" }}>
                No rodapé do artigo
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  {form.avatar && !avatarError ? (
                    <Image
                      src={form.avatar}
                      alt={displayName}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover shrink-0"
                      unoptimized
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shrink-0"
                      style={{ backgroundColor: "var(--accent-red)", color: "#fff" }}
                    >
                      {initial}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{displayName}</p>
                    {form.role && <p className="text-xs opacity-60 mt-0.5" style={{ color: "var(--text-muted)" }}>{form.role}</p>}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {form.websiteUrl && <Globe className="w-3.5 h-3.5 opacity-60" style={{ color: "var(--text-secondary)" }} />}
                      {form.githubUrl && <Link2 className="w-3.5 h-3.5 opacity-60" style={{ color: "var(--text-secondary)" }} />}
                      {form.twitterUrl && <AtSign className="w-3.5 h-3.5 opacity-60" style={{ color: "var(--text-secondary)" }} />}
                    </div>
                  </div>
                </div>
                {form.bio && (
                  <p className="text-xs leading-relaxed opacity-80 line-clamp-3" style={{ color: "var(--text-secondary)" }}>
                    {form.bio}
                  </p>
                )}
                {form.links.filter(l => l.label && l.url).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.links.filter(l => l.label && l.url).map((l, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs"
                        style={{ backgroundColor: "var(--badge-bg)", color: "var(--text-secondary)" }}
                      >
                        <ExternalLink className="w-3 h-3" />
                        {l.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-3 space-y-1.5" style={{ borderColor: "var(--border-light)" }}>
              <p className="text-[11px] uppercase tracking-wider opacity-50 font-semibold" style={{ color: "var(--text-muted)" }}>
                Arquivo de saída
              </p>
              <code
                className="text-xs break-all"
                style={{ color: "var(--text-secondary)" }}
              >
                content/authors/{form.slug || "slug-do-autor"}.md
              </code>
            </div>
          </section>
        </aside>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODAL: Git Config                                                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {isGitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="w-full max-w-lg rounded-2xl border shadow-2xl p-6 space-y-5"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <GitBranch className="w-4 h-4" style={{ color: "var(--accent-red)" }} />
                Configuração GitHub
              </h3>
              <button onClick={() => setIsGitModalOpen(false)} className="opacity-60 hover:opacity-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { label: "Owner (usuário ou organização)", key: "owner" as const, placeholder: "Andrezz64" },
                { label: "Repositório", key: "repo" as const, placeholder: "maltese" },
                { label: "Branch", key: "branch" as const, placeholder: "main" },
              ].map(({ label, key, placeholder }) => (
                <label key={key} className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase opacity-60" style={{ color: "var(--text-secondary)" }}>{label}</span>
                  <input
                    type="text"
                    value={gitConfig[key] as string}
                    onChange={(e) => setGitConfig((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 transition-all"
                    style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                  />
                </label>
              ))}

              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase opacity-60" style={{ color: "var(--text-secondary)" }}>Token de Acesso Pessoal</span>
                <div className="relative">
                  <input
                    type={showToken ? "text" : "password"}
                    value={gitConfig.token}
                    onChange={(e) => setGitConfig((prev) => ({ ...prev, token: e.target.value }))}
                    placeholder="ghp_..."
                    className="w-full px-3 py-2 pr-10 rounded-lg border text-sm font-mono outline-none focus:ring-2 transition-all"
                    style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </label>
            </div>

            {gitTestResult && (
              <div
                className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg`}
                style={{
                  backgroundColor: gitTestResult.success ? "#22c55e15" : "#ef444415",
                  color: gitTestResult.success ? "#22c55e" : "#ef4444",
                }}
              >
                {gitTestResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {gitTestResult.message}
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleTestGit}
                disabled={isTestingGit}
                className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border transition-all hover:opacity-80 disabled:opacity-50"
                style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)", backgroundColor: "var(--bg-primary)" }}
              >
                {isTestingGit ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {isTestingGit ? "Verificando..." : "Testar Conexão"}
              </button>

              {isGitConnected && (
                <button
                  onClick={handleDisconnect}
                  className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border transition-all hover:opacity-80"
                  style={{ borderColor: "#ef444440", color: "#ef4444", backgroundColor: "var(--bg-primary)" }}
                >
                  Desconectar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODAL: List / Select Author                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {isListModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="w-full max-w-lg rounded-2xl border shadow-2xl p-6 space-y-4 max-h-[80vh] flex flex-col"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
          >
            <div className="flex items-center justify-between shrink-0">
              <h3 className="font-bold text-base flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <Users className="w-4 h-4" style={{ color: "var(--accent-red)" }} />
                Autores no Repositório
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchRemoteAuthors}
                  disabled={isLoadingList}
                  className="p-1.5 rounded-lg border transition-all hover:opacity-80"
                  style={{ borderColor: "var(--border-light)", color: "var(--text-secondary)" }}
                  title="Atualizar lista"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingList ? "animate-spin" : ""}`} />
                </button>
                <button
                  onClick={() => setIsListModalOpen(false)}
                  className="opacity-60 hover:opacity-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 space-y-2">
              {/* New button */}
              <button
                onClick={handleNew}
                className="w-full flex items-center gap-3 p-3 rounded-xl border transition-all hover:opacity-80 text-left"
                style={{ borderColor: "var(--accent-red)", color: "var(--accent-red)", backgroundColor: "var(--bg-primary)" }}
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span className="text-sm font-semibold">Novo autor</span>
              </button>

              {isLoadingList && (
                <div className="py-8 text-center text-sm opacity-60" style={{ color: "var(--text-muted)" }}>
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                  Carregando autores...
                </div>
              )}

              {listError && (
                <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg" style={{ backgroundColor: "#ef444415", color: "#ef4444" }}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {listError}
                </div>
              )}

              {!isLoadingList && !listError && remoteAuthors.length === 0 && (
                <p className="text-sm opacity-50 text-center py-6" style={{ color: "var(--text-muted)" }}>
                  Nenhum autor encontrado em content/authors.
                </p>
              )}

              {remoteAuthors.map((file) => (
                <button
                  key={file.sha}
                  onClick={() => handleSelectRemoteAuthor(file)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border transition-all hover:opacity-80 text-left"
                  style={{ borderColor: "var(--border-light)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
                >
                  <User className="w-4 h-4 shrink-0 opacity-60" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-[11px] opacity-50 font-mono">{file.sha.slice(0, 7)}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 ml-auto shrink-0 opacity-40" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODAL: Commit                                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {isCommitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="w-full max-w-lg rounded-2xl border shadow-2xl p-6 space-y-5"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <GitCommit className="w-4 h-4" style={{ color: "var(--accent-red)" }} />
                {remoteFileExists ? "Atualizar autor no Git" : "Publicar novo autor no Git"}
              </h3>
              <button onClick={() => setIsCommitModalOpen(false)} className="opacity-60 hover:opacity-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              className="text-xs px-3 py-2 rounded-lg font-mono"
              style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-muted)" }}
            >
              {siteConfig.git.authorsPath || "content/authors"}/{form.slug}.md
            </div>

            {commitResult ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm px-3 py-3 rounded-lg" style={{ backgroundColor: "#22c55e15", color: "#22c55e" }}>
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span className="font-semibold">Commit realizado com sucesso!</span>
                </div>
                <div className="text-xs space-y-1" style={{ color: "var(--text-secondary)" }}>
                  <p>SHA: <code className="font-mono">{commitResult.commitSha.slice(0, 12)}</code></p>
                </div>
                {commitResult.commitUrl && (
                  <a
                    href={commitResult.commitUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-all hover:opacity-80"
                    style={{ backgroundColor: "var(--bg-primary)", color: "var(--accent-red)" }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ver commit no GitHub
                  </a>
                )}
                <button
                  onClick={() => setIsCommitModalOpen(false)}
                  className="w-full text-sm font-semibold px-4 py-2 rounded-lg border transition-all hover:opacity-80"
                  style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)", backgroundColor: "var(--bg-primary)" }}
                >
                  Fechar
                </button>
              </div>
            ) : (
              <>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase opacity-60" style={{ color: "var(--text-secondary)" }}>
                    Mensagem de commit
                  </span>
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 transition-all"
                    style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                  />
                </label>

                {commitError && (
                  <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg" style={{ backgroundColor: "#ef444415", color: "#ef4444" }}>
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {commitError}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsCommitModalOpen(false)}
                    className="flex-1 text-sm font-semibold px-4 py-2.5 rounded-lg border transition-all hover:opacity-80"
                    style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)", backgroundColor: "var(--bg-primary)" }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={executeCommit}
                    disabled={isCommitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-bold px-4 py-2.5 rounded-lg transition-all hover:opacity-90 disabled:opacity-60"
                    style={{ backgroundColor: "var(--accent-red)", color: "#fff" }}
                  >
                    {isCommitting
                      ? <><RefreshCw className="w-4 h-4 animate-spin" /> Commitando...</>
                      : <><GitCommit className="w-4 h-4" /> Confirmar Commit</>
                    }
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODAL: Delete Confirm                                               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="w-full max-w-sm rounded-2xl border shadow-2xl p-6 space-y-5"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#ef444415" }}>
                <Trash2 className="w-5 h-5" style={{ color: "#ef4444" }} />
              </div>
              <div>
                <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>Deletar autor</h3>
                <p className="text-sm mt-1 opacity-80" style={{ color: "var(--text-secondary)" }}>
                  O arquivo <code className="font-mono text-xs">{form.slug}.md</code> será removido do repositório com um commit de deleção. Esta ação não pode ser desfeita facilmente.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg" style={{ backgroundColor: "#ef444415", color: "#ef4444" }}>
                <AlertCircle className="w-4 h-4 shrink-0" />
                {deleteError}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 text-sm font-semibold px-4 py-2.5 rounded-lg border transition-all hover:opacity-80"
                style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)", backgroundColor: "var(--bg-primary)" }}
              >
                Cancelar
              </button>
              <button
                onClick={executeDelete}
                disabled={isDeleting}
                className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-bold px-4 py-2.5 rounded-lg transition-all disabled:opacity-60"
                style={{ backgroundColor: "#ef4444", color: "#fff" }}
              >
                {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isDeleting ? "Deletando..." : "Confirmar Deleção"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
