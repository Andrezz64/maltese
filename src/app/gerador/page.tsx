"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { marked } from "marked";
import siteConfig from "@site-config";
import {
  testGitHubConnection,
  getRepoFileContent,
  listRepoFiles,
  commitFileToGitHub,
  GitHubUser,
  GitHubFileItem,
} from "@/lib/github";
import AuthorPickerPanel from "@/components/AuthorPickerPanel";
import {
  Download,
  Copy,
  Check,
  Eye,
  Code,
  ArrowLeft,
  Bold,
  Italic,
  Quote,
  List,
  ListOrdered,
  Clock,
  SlidersHorizontal,
  X,
  AlertCircle,
  BookOpen,
  Columns,
  Edit3,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  CheckCircle2,
  Maximize2,
  Minimize2,
  FolderOpen,
  FileText,
  FileUp,
  FilePlus,
  Trash2,
  HardDrive,
  WifiOff,
  Sparkles,
  GitBranch,
  GitCommit,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";

// Configure marked options for clean parsing
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Storage keys
const STORAGE_CURRENT_DRAFT = "salomao_editor_current_draft";
const STORAGE_SAVED_DRAFTS = "salomao_editor_saved_drafts";
const STORAGE_GIT_AUTH = "salomao_editor_git_auth";

interface SavedDraftItem {
  id: string;
  title: string;
  slug: string;
  date: string;
  summary: string;
  category: string;
  customCategory: string;
  tagsInput: string;
  author: string;
  epigraph: string;
  featured: boolean;
  content: string;
  updatedAt: number;
}

interface GitAuthConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  postsPath: string;
  user: GitHubUser | null;
}

export default function GeradorMDPage() {
  // --- Post Metadata State ---
  const [title, setTitle] = useState("O Elogio da Insubmissão: Notas sobre a Dignidade do Não");
  const [slug, setSlug] = useState("elogio-da-insubmissao");
  const [date, setDate] = useState("2026-03-28");
  const [summary, setSummary] = useState(
    "Por que a capacidade de dizer 'não' às injustiças cotidianas é o fundamento inicial de qualquer transformação social profunda."
  );
  const [category, setCategory] = useState("Manifestos");
  const [customCategory, setCustomCategory] = useState("");
  const [tagsInput, setTagsInput] = useState("Insubmissão, Dignidade, Ética, Resistência");
  const [author, setAuthor] = useState(siteConfig.author || "Maltese");
  const [epigraph, setEpigraph] = useState(
    "A desobediência é a virtude original do homem. Foi através da desobediência que o progresso foi feito. — Oscar Wilde"
  );
  const [featured, setFeatured] = useState(true);

  // --- Post Content State ---
  const [content, setContent] = useState(`## A Tirania do Consentimento Silencioso

A mais eficiente forma de tirania não é aquela que se impõe pela força bruta dos canhões, mas a que consegue colonizar o imaginário a ponto de transformar a obediência cega em virtude moral. Quando as pessoas se acostumam com o inaceitável, a injustiça ganha foro de normalidade.

Dizer **não** é o primeiro gesto de resgate da subjetividade. É a recusa em participar da engrenagem que tritura a dignidade alheia para alimentar privilégios concentrados.

### As Três Dimensões da Insubmissão Ética

1. **A recusa da resignação:** Não aceitar a miséria material e espiritual como um dado da natureza.
2. **A fidelidade à verdade:** Desmascarar o vocabulário cínico que chama exploração de 'oportunidade' e censura de 'harmonia'.
3. **A construção do comum:** A insubmissão solitária pode ser heroica, mas apenas a insubmissão organizada e fraterna é capaz de erguer novos mundos.

> "A história não é um trilho pré-determinado; ela é o barro moldado pelas mãos daqueles que ousaram não se ajoelhar."
`);

  // --- View Mode & Fullscreen State ---
  const [viewMode, setViewMode] = useState<"split" | "editor" | "preview">("split");
  const [previewTab, setPreviewTab] = useState<"rendered" | "code">("rendered");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- Local Save & Offline State ---
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // --- Git Integration State ---
  const [gitConfig, setGitConfig] = useState<GitAuthConfig>({
    token: "",
    owner: siteConfig.git.owner || "",
    repo: siteConfig.git.repo || "",
    branch: siteConfig.git.branch || "main",
    postsPath: siteConfig.git.postsPath || "content/posts",
    user: null,
  });

  const [remoteFileSha, setRemoteFileSha] = useState<string | null>(null);
  const [activeGitFolder, setActiveGitFolder] = useState<"posts" | "docs">("posts");
  const [isGitModalOpen, setIsGitModalOpen] = useState(false);
  const [isTestingGit, setIsTestingGit] = useState(false);
  const [gitTestResult, setGitTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showTokenPassword, setShowTokenPassword] = useState(false);

  // Git Commit Modal State
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
  const [commitMessage, setCommitMessage] = useState("");
  const [isCheckingRemoteSha, setIsCheckingRemoteSha] = useState(false);
  const [isCommitInProgress, setIsCommitInProgress] = useState(false);
  const [commitSuccessResult, setCommitSuccessResult] = useState<{ commitSha: string; commitUrl: string } | null>(null);
  const [commitError, setCommitError] = useState<string | null>(null);
  const [remoteFileExists, setRemoteFileExists] = useState(false);

  // --- File Selection & Drafts Manager Modal ---
  const [isSelectFileModalOpen, setIsSelectFileModalOpen] = useState(false);
  const [fileModalTab, setFileModalTab] = useState<"git" | "drafts" | "import">("git");
  const [gitRepoFiles, setGitRepoFiles] = useState<GitHubFileItem[]>([]);
  const [isLoadingGitFiles, setIsLoadingGitFiles] = useState(false);
  const [gitFilesError, setGitFilesError] = useState<string | null>(null);
  const [localDrafts, setLocalDrafts] = useState<SavedDraftItem[]>([]);
  const [fileNotification, setFileNotification] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Other Modals
  const [isMetadataMenuOpen, setIsMetadataMenuOpen] = useState(false);
  const [isCardPreviewOpen, setIsCardPreviewOpen] = useState(false);
  const [cardPreviewFeatured, setCardPreviewFeatured] = useState(featured);
  const [isConfirmActionOpen, setIsConfirmActionOpen] = useState(false);
  const [confirmActionType, setConfirmActionType] = useState<"download" | "copy">("download");

  // Author picker panel
  const [isAuthorPanelOpen, setIsAuthorPanelOpen] = useState(false);

  // Feedback states
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [cardBookmarked, setCardBookmarked] = useState(false);

  const isGitConnected = Boolean(gitConfig.token.trim() && gitConfig.owner && gitConfig.repo);

  // --- 1. Load initial state from LocalStorage ---
  useEffect(() => {
    try {
      // Carregar rascunho
      const saved = localStorage.getItem(STORAGE_CURRENT_DRAFT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.slug) setSlug(parsed.slug);
        if (parsed.date) setDate(parsed.date);
        if (parsed.summary) setSummary(parsed.summary);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.customCategory) setCustomCategory(parsed.customCategory);
        if (parsed.tagsInput) setTagsInput(parsed.tagsInput);
        if (parsed.author) setAuthor(parsed.author);
        if (parsed.epigraph !== undefined) setEpigraph(parsed.epigraph);
        if (parsed.featured !== undefined) setFeatured(parsed.featured);
        if (parsed.content !== undefined) setContent(parsed.content);
        if (parsed.updatedAt) setLastSaved(parsed.updatedAt);
      } else {
        const today = new Date().toISOString().split("T")[0];
        setDate(today);
      }

      // Carregar configurações de Git do usuário
      const savedGit = localStorage.getItem(STORAGE_GIT_AUTH);
      if (savedGit) {
        const parsedGit = JSON.parse(savedGit);
        setGitConfig({
          token: parsedGit.token || "",
          owner: parsedGit.owner || siteConfig.git.owner || "Andrezz64",
          repo: parsedGit.repo || siteConfig.git.repo || "maltese",
          branch: parsedGit.branch || siteConfig.git.branch || "main",
          postsPath: parsedGit.postsPath || siteConfig.git.postsPath || "content/posts",
          user: parsedGit.user || null,
        });
      }
    } catch (e) {
      console.error("Erro ao carregar dados iniciais do localStorage:", e);
    }
    setIsInitialized(true);
  }, []);

  // --- 2. Online / Offline Listener ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  // --- 3. Auto-save current draft to LocalStorage ---
  useEffect(() => {
    if (!isInitialized) return;

    setIsSaving(true);
    const timer = setTimeout(() => {
      const now = Date.now();
      const currentDraft: SavedDraftItem = {
        id: slug || "rascunho-atual",
        title,
        slug,
        date,
        summary,
        category,
        customCategory,
        tagsInput,
        author,
        epigraph,
        featured,
        content,
        updatedAt: now,
      };

      try {
        localStorage.setItem(STORAGE_CURRENT_DRAFT, JSON.stringify(currentDraft));
        setLastSaved(now);

        // Atualizar lista indexada de rascunhos
        const rawDrafts = localStorage.getItem(STORAGE_SAVED_DRAFTS);
        let drafts: SavedDraftItem[] = rawDrafts ? JSON.parse(rawDrafts) : [];
        const existingIdx = drafts.findIndex((d) => d.slug === slug || d.id === currentDraft.id);
        if (existingIdx >= 0) {
          drafts[existingIdx] = currentDraft;
        } else {
          drafts.unshift(currentDraft);
        }
        drafts = drafts.slice(0, 20);
        localStorage.setItem(STORAGE_SAVED_DRAFTS, JSON.stringify(drafts));
      } catch (err) {
        console.error("Erro ao salvar no localStorage:", err);
      }
      setIsSaving(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [
    isInitialized,
    title,
    slug,
    date,
    summary,
    category,
    customCategory,
    tagsInput,
    author,
    epigraph,
    featured,
    content,
  ]);

  // Load saved drafts list
  const loadLocalDrafts = () => {
    try {
      const raw = localStorage.getItem(STORAGE_SAVED_DRAFTS);
      if (raw) {
        setLocalDrafts(JSON.parse(raw));
      }
    } catch {
      setLocalDrafts([]);
    }
  };

  // Fetch files directly from GitHub repository
  const fetchGitRepoFiles = async (folderOverride?: "posts" | "docs") => {
    if (!gitConfig.token.trim()) {
      setGitFilesError("Conecte um token do GitHub para listar os arquivos do repositório.");
      return;
    }
    const folderType = folderOverride || activeGitFolder;
    const targetFolder = folderType === "posts" ? gitConfig.postsPath : (siteConfig.git.docsPath || "content/docs");
    setIsLoadingGitFiles(true);
    setGitFilesError(null);
    try {
      const res = await listRepoFiles(
        gitConfig.token,
        gitConfig.owner,
        gitConfig.repo,
        gitConfig.branch,
        targetFolder
      );
      if (res.error) {
        setGitFilesError(res.error);
      } else {
        setGitRepoFiles(res.files);
      }
    } catch (e: any) {
      setGitFilesError(e?.message || "Falha ao consultar repositório no GitHub.");
    } finally {
      setIsLoadingGitFiles(false);
    }
  };

  // Update cardPreviewFeatured whenever featured changes
  useEffect(() => {
    setCardPreviewFeatured(featured);
  }, [featured]);

  // Handle body overflow in fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  // Handle ESC key for modals & fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isCommitModalOpen) setIsCommitModalOpen(false);
        else if (isGitModalOpen) setIsGitModalOpen(false);
        else if (isSelectFileModalOpen) setIsSelectFileModalOpen(false);
        else if (isConfirmActionOpen) setIsConfirmActionOpen(false);
        else if (isMetadataMenuOpen) setIsMetadataMenuOpen(false);
        else if (isCardPreviewOpen) setIsCardPreviewOpen(false);
        else if (isAuthorPanelOpen) setIsAuthorPanelOpen(false);
        else if (isFullscreen) setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isFullscreen,
    isCommitModalOpen,
    isGitModalOpen,
    isSelectFileModalOpen,
    isConfirmActionOpen,
    isMetadataMenuOpen,
    isCardPreviewOpen,
  ]);

  // Slug generator
  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setSlug(slugify(newTitle));
  };

  // Word count & reading time
  const { wordCount, characterCount, readingTime } = useMemo(() => {
    const trimmed = content.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const chars = content.length;
    const minutes = Math.max(1, Math.ceil(words / (siteConfig.editorial.wordsPerMinute || 200)));
    return {
      wordCount: words,
      characterCount: chars,
      readingTime: `${minutes} min de leitura`,
    };
  }, [content]);

  // Parse tags list
  const tagsList = useMemo(() => {
    return tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }, [tagsInput]);

  const effectiveCategory = category === "Outra" ? customCategory || siteConfig.editorial.defaultCategory : category;

  // Build output markdown text
  const markdownOutput = useMemo(() => {
    const formattedTags = JSON.stringify(tagsList);
    const escapedSummary = summary.replace(/"/g, '\\"');
    const escapedEpigraph = epigraph ? epigraph.replace(/"/g, '\\"') : "";

    let md = `---
title: "${title}"
slug: "${slug}"
date: "${date}"
summary: "${escapedSummary}"
category: "${effectiveCategory}"
tags: ${formattedTags}
readingTime: "${readingTime}"
featured: ${featured}
`;

    if (escapedEpigraph.trim()) {
      md += `epigraph: "${escapedEpigraph}"\n`;
    }

    md += `author: "${author}"
---

${content.trim()}
`;

    return md;
  }, [title, slug, date, summary, effectiveCategory, tagsList, readingTime, featured, epigraph, author, content]);

  // Render markdown to HTML live
  const [renderedHtml, setRenderedHtml] = useState("");

  useEffect(() => {
    try {
      const parsed = marked.parse(content || "");
      if (parsed instanceof Promise) {
        parsed.then((res) => setRenderedHtml(res));
      } else {
        setRenderedHtml(parsed);
      }
    } catch (e) {
      console.error("Erro ao renderizar markdown:", e);
    }
  }, [content]);

  // Insert markdown helpers into textarea
  const insertText = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("markdown-editor") as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previous = textarea.value;
    const selected = previous.substring(start, end);
    const replacement = `${prefix}${selected || "texto"}${suffix}`;

    const updated = previous.substring(0, start) + replacement + previous.substring(end);
    setContent(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 5));
    }, 50);
  };

  // Trigger Confirmation Modal for Copy or Download
  const handleOpenConfirmModal = (type: "download" | "copy") => {
    setConfirmActionType(type);
    setIsConfirmActionOpen(true);
  };

  // Perform Copy Action
  const executeCopy = () => {
    navigator.clipboard.writeText(markdownOutput);
    setCopied(true);
    setIsConfirmActionOpen(false);
    setTimeout(() => setCopied(false), 3000);
  };

  // Perform Download Action
  const executeDownload = () => {
    const filename = `${slug || "meu-texto"}.md`;
    const blob = new Blob([markdownOutput], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsConfirmActionOpen(false);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 5000);
  };

  // Format date helper for previews
  const formatPreviewDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const d = new Date(year, month - 1, day);
      return new Intl.DateTimeFormat("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  // --- Client-side Markdown File Parser ---
  const parseFrontmatterAndContent = (fileText: string) => {
    const normalized = fileText.replace(/\r\n/g, "\n");
    const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

    if (!match) {
      return {
        metadata: {} as Record<string, any>,
        content: fileText,
      };
    }

    const rawYaml = match[1];
    const markdownContent = match[2];
    const metadata: Record<string, any> = {};

    const lines = rawYaml.split("\n");
    for (const line of lines) {
      const colonIndex = line.indexOf(":");
      if (colonIndex === -1) continue;
      const key = line.slice(0, colonIndex).trim();
      let val = line.slice(colonIndex + 1).trim();

      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }

      if (val === "true") metadata[key] = true;
      else if (val === "false") metadata[key] = false;
      else if (val.startsWith("[") && val.endsWith("]")) {
        try {
          metadata[key] = JSON.parse(val);
        } catch {
          metadata[key] = val
            .slice(1, -1)
            .split(",")
            .map((s) => s.trim().replace(/^["']|["']$/g, ""))
            .filter(Boolean);
        }
      } else {
        metadata[key] = val;
      }
    }

    return { metadata, content: markdownContent };
  };

  // Load a chosen Local Draft into Editor
  const handleSelectLocalDraft = (draft: SavedDraftItem) => {
    setTitle(draft.title);
    setSlug(draft.slug);
    setDate(draft.date);
    setSummary(draft.summary);
    setCategory(draft.category);
    setCustomCategory(draft.customCategory);
    setTagsInput(draft.tagsInput);
    setAuthor(draft.author);
    setEpigraph(draft.epigraph);
    setFeatured(draft.featured);
    setContent(draft.content);

    setIsSelectFileModalOpen(false);
    setFileNotification(`Rascunho "${draft.title}" restaurado com sucesso!`);
    setTimeout(() => setFileNotification(null), 4000);
  };

  // Delete a draft from storage
  const handleDeleteDraft = (e: React.MouseEvent, draftId: string) => {
    e.stopPropagation();
    try {
      const raw = localStorage.getItem(STORAGE_SAVED_DRAFTS);
      if (raw) {
        const drafts: SavedDraftItem[] = JSON.parse(raw);
        const filtered = drafts.filter((d) => d.id !== draftId);
        localStorage.setItem(STORAGE_SAVED_DRAFTS, JSON.stringify(filtered));
        setLocalDrafts(filtered);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load a file directly from GitHub into Editor
  const handleSelectGitFile = async (file: GitHubFileItem) => {
    try {
      const res = await getRepoFileContent(
        gitConfig.token,
        gitConfig.owner,
        gitConfig.repo,
        gitConfig.branch,
        file.path
      );
      if (res.exists && res.content) {
        const { metadata, content: parsedContent } = parseFrontmatterAndContent(res.content);

        if (metadata.title) setTitle(metadata.title);
        else setTitle(file.name.replace(/\.mdx?$/, ""));

        if (metadata.slug) setSlug(metadata.slug);
        else setSlug(file.name.replace(/\.mdx?$/, ""));

        if (metadata.date) setDate(metadata.date);
        if (metadata.summary) setSummary(metadata.summary);
        if (metadata.category) setCategory(metadata.category);
        if (metadata.author) setAuthor(metadata.author);
        if (metadata.epigraph) setEpigraph(metadata.epigraph);
        if (metadata.featured !== undefined) setFeatured(Boolean(metadata.featured));
        if (metadata.tags) {
          setTagsInput(Array.isArray(metadata.tags) ? metadata.tags.join(", ") : metadata.tags);
        }

        setContent(parsedContent.trim());
        setRemoteFileSha(res.sha || null);

        setIsSelectFileModalOpen(false);
        setFileNotification(`Arquivo "${file.name}" carregado diretamente do Git (SHA: ${res.sha?.slice(0, 7)})!`);
        setTimeout(() => setFileNotification(null), 5000);
      } else {
        alert("Não foi possível carregar o conteúdo do arquivo remoto.");
      }
    } catch (err: any) {
      alert(`Erro ao abrir arquivo do Git: ${err?.message}`);
    }
  };

  // Handle uploading .md file from local machine
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const { metadata, content: parsedContent } = parseFrontmatterAndContent(text);

      if (metadata.title) setTitle(metadata.title);
      else setTitle(file.name.replace(/\.mdx?$/, ""));

      if (metadata.slug) setSlug(metadata.slug);
      else setSlug(slugify(file.name.replace(/\.mdx?$/, "")));

      if (metadata.date) setDate(metadata.date);
      if (metadata.summary) setSummary(metadata.summary);
      if (metadata.category) setCategory(metadata.category);
      if (metadata.author) setAuthor(metadata.author);
      if (metadata.epigraph) setEpigraph(metadata.epigraph);
      if (metadata.featured !== undefined) setFeatured(Boolean(metadata.featured));
      if (metadata.tags) {
        setTagsInput(Array.isArray(metadata.tags) ? metadata.tags.join(", ") : metadata.tags);
      }

      setContent(parsedContent.trim());
      setRemoteFileSha(null);
      setIsSelectFileModalOpen(false);
      setFileNotification(`Arquivo "${file.name}" importado e carregado no editor!`);
      setTimeout(() => setFileNotification(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Start fresh / blank document
  const handleNewDocument = () => {
    const today = new Date().toISOString().split("T")[0];
    setTitle("Novo Escrito");
    setSlug("novo-escrito");
    setDate(today);
    setSummary("");
    setCategory(siteConfig.editorial.defaultCategory || "Ensaios");
    setCustomCategory("");
    setTagsInput("");
    setAuthor(siteConfig.author || "Maltese");
    setEpigraph("");
    setFeatured(false);
    setContent("## Início do Texto\n\nComece a escrever sua reflexão aqui...");
    setRemoteFileSha(null);

    setIsSelectFileModalOpen(false);
    setFileNotification("Novo documento limpo criado!");
    setTimeout(() => setFileNotification(null), 4000);
  };

  // --- Git Connection Testing & Saving ---
  const handleTestAndSaveGitConnection = async () => {
    setIsTestingGit(true);
    setGitTestResult(null);

    const res = await testGitHubConnection(gitConfig.token, gitConfig.owner, gitConfig.repo);
    setIsTestingGit(false);

    if (res.valid && res.user) {
      const updated = {
        ...gitConfig,
        user: res.user,
      };
      setGitConfig(updated);
      localStorage.setItem(STORAGE_GIT_AUTH, JSON.stringify(updated));
      setGitTestResult({
        success: true,
        message: `Conectado com sucesso como @${res.user.login} (${res.repoInfo?.canPush ? "Permissão de escrita OK" : "Apenas leitura"})!`,
      });
    } else {
      setGitTestResult({
        success: false,
        message: res.error || "Falha ao validar credenciais do GitHub.",
      });
    }
  };

  const handleDisconnectGit = () => {
    const reset = {
      token: "",
      owner: siteConfig.git.owner || "Andrezz64",
      repo: siteConfig.git.repo || "maltese",
      branch: siteConfig.git.branch || "main",
      postsPath: siteConfig.git.postsPath || "content/posts",
      user: null,
    };
    setGitConfig(reset);
    localStorage.removeItem(STORAGE_GIT_AUTH);
    setGitTestResult(null);
    setIsGitModalOpen(false);
  };

  // --- Check SHA for given folder ---
  const checkRemoteShaForFolder = async (folderType: "posts" | "docs") => {
    if (!isGitConnected) return;
    setIsCheckingRemoteSha(true);
    const targetFolder = folderType === "posts" ? gitConfig.postsPath : (siteConfig.git.docsPath || "content/docs");
    try {
      const targetPath = `${targetFolder}/${slug || "novo-texto"}.md`;
      const res = await getRepoFileContent(
        gitConfig.token,
        gitConfig.owner,
        gitConfig.repo,
        gitConfig.branch,
        targetPath
      );
      setRemoteFileExists(res.exists);
      if (res.exists && res.sha) {
        setRemoteFileSha(res.sha);
      } else {
        setRemoteFileSha(null);
      }
    } catch (e: any) {
      console.warn("Aviso ao verificar SHA remoto:", e);
    } finally {
      setIsCheckingRemoteSha(false);
    }
  };

  // --- Open Commit Modal with Remote SHA verification ---
  const handleOpenCommitModal = async () => {
    if (!isGitConnected) {
      setIsGitModalOpen(true);
      return;
    }

    setCommitMessage(`feat(${activeGitFolder}): publica "${title}"`);
    setCommitError(null);
    setCommitSuccessResult(null);
    setIsCommitModalOpen(true);
    await checkRemoteShaForFolder(activeGitFolder);
  };

  // --- Execute Commit on GitHub ---
  const executeCommitToGitHub = async () => {
    if (!commitMessage.trim()) {
      setCommitError("Informe uma mensagem de commit.");
      return;
    }

    setIsCommitInProgress(true);
    setCommitError(null);

    const targetFolder = activeGitFolder === "posts" ? gitConfig.postsPath : (siteConfig.git.docsPath || "content/docs");
    const targetPath = `${targetFolder}/${slug || "novo-texto"}.md`;

    try {
      const result = await commitFileToGitHub({
        token: gitConfig.token,
        owner: gitConfig.owner,
        repo: gitConfig.repo,
        branch: gitConfig.branch,
        path: targetPath,
        content: markdownOutput,
        message: commitMessage.trim(),
        sha: remoteFileSha,
      });

      setRemoteFileSha(result.contentSha);
      setRemoteFileExists(true);
      setCommitSuccessResult({
        commitSha: result.commitSha,
        commitUrl: result.commitUrl,
      });
      setFileNotification(`Commit realizado no GitHub com sucesso (${result.commitSha.slice(0, 7)})!`);
      setTimeout(() => setFileNotification(null), 6000);
    } catch (err: any) {
      setCommitError(err?.message || "Erro ao realizar commit no GitHub.");
    } finally {
      setIsCommitInProgress(false);
    }
  };

  const isMetadataComplete = Boolean(title.trim() && summary.trim() && slug.trim());

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-50 bg-[var(--bg-primary)] p-2.5 sm:p-4 flex flex-col h-screen w-screen overflow-hidden animate-in fade-in duration-200"
          : "space-y-4 w-full animate-in fade-in duration-300"
      }
    >
      {/* Hidden file input for importing .md */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".md,.markdown,.mdx,.txt"
        className="hidden"
      />

      {/* ======================================================== */}
      {/* 1. COMPACT COMMAND BAR (SEM TÍTULO GRANDE)                */}
      {/* ======================================================== */}
      <header
        className={`rounded-2xl border p-2.5 sm:p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-2.5 shrink-0 mb-4 ${isFullscreen ? "z-10" : "sticky top-3 z-20 backdrop-blur-md"
          }`}
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-color)",
        }}
      >
        {/* Left: Navigation link, file selector & Git badge */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Link
            href="/textos"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border transition-all hover:opacity-80"
            style={{
              borderColor: "var(--border-light)",
              color: "var(--accent-red)",
              backgroundColor: "var(--bg-primary)",
            }}
            title="Voltar aos Textos"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Textos</span>
          </Link>

          <div className="h-4 w-[1px] bg-[var(--border-color)] hidden sm:block" />

          {/* Selecionar Arquivo button */}
          <button
            type="button"
            onClick={() => {
              if (isGitConnected) {
                fetchGitRepoFiles();
              }
              loadLocalDrafts();
              setIsSelectFileModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:scale-102"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
            title="Abrir arquivo do repositório Git, rascunho salvo ou importar .md"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden xs:inline">Selecionar Arquivo</span>
            <span className="xs:hidden">Arquivos</span>
          </button>

          {/* Git Connection Status Button */}
          <button
            type="button"
            onClick={() => setIsGitModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:scale-102"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: isGitConnected ? "var(--border-color)" : "var(--accent-red)",
              color: "var(--text-primary)",
            }}
            title={
              isGitConnected
                ? `Conectado ao repositório ${gitConfig.owner}/${gitConfig.repo} (${gitConfig.branch})`
                : "Configurar integração Git com o GitHub"
            }
          >
            <GitBranch
              className={`w-3.5 h-3.5 ${isGitConnected ? "text-emerald-500" : "text-amber-500"}`}
            />
            {isGitConnected ? (
              <span className="font-mono text-[11px] hidden sm:inline">
                {gitConfig.owner}/{gitConfig.repo}
              </span>
            ) : (
              <span className="text-[11px]">Conectar Git</span>
            )}
            <span
              className={`w-1.5 h-1.5 rounded-full ${isGitConnected ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`}
            />
          </button>
        </div>

        {/* Center / Right: Action Buttons */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">

          {/* View mode buttons (Split / Editor / Preview) */}
          <div
            className="hidden sm:flex items-center p-0.5 rounded-lg border text-xs mr-4"
            style={{
              borderColor: "var(--border-light)",
              backgroundColor: "var(--bg-primary)",
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`p-1.5 rounded-md flex items-center gap-1 text-[11px] font-medium transition-all ${viewMode === "split" ? "bg-[var(--bg-card)] shadow-xs font-bold" : "opacity-60 hover:opacity-100"
                }`}
              title="Exibição lado a lado (Editor + Preview)"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Dividido</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("editor")}
              className={`p-1.5 rounded-md flex items-center gap-1 text-[11px] font-medium transition-all ${viewMode === "editor" ? "bg-[var(--bg-card)] shadow-xs font-bold" : "opacity-60 hover:opacity-100"
                }`}
              title="Apenas editor de texto"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`p-1.5 rounded-md flex items-center gap-1 text-[11px] font-medium transition-all ${viewMode === "preview" ? "bg-[var(--bg-card)] shadow-xs font-bold" : "opacity-60 hover:opacity-100"
                }`}
              title="Apenas preview renderizado"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Preview</span>
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:scale-102 ${isFullscreen
              ? "bg-[var(--accent-red)] text-white border-[var(--accent-red)] shadow-xs"
              : "border-[var(--border-color)] text-[var(--text-primary)]"
              }`}
            style={{
              backgroundColor: isFullscreen ? "var(--accent-red)" : "var(--bg-primary)",
            }}
            title={isFullscreen ? "Restaurar visualização normal (ESC)" : "Expandir para tela cheia / acima do header"}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Restaurar</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline"></span>
              </>
            )}
          </button>



          {/* Prévia do Card Button (Menu / Popover) */}
          <button
            type="button"
            onClick={() => setIsCardPreviewOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:scale-102"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
            title="Ver prévia do card como aparecerá no feed"
          >
            <Eye className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden xs:inline">Card</span>
          </button>

          {/* Copiar Button */}
          <button
            type="button"
            onClick={() => handleOpenConfirmModal("copy")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider border shadow-2xs transition-all hover:scale-102"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
            title="Copiar arquivo .md (confirma metadados)"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Baixar .md Button */}
          <button
            type="button"
            onClick={() => handleOpenConfirmModal("download")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border shadow-2xs transition-all hover:opacity-90 hover:scale-102"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
            title="Baixar arquivo .md"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline"></span>
          </button>
          {/* Metadados Button (Menu) */}
          <button
            type="button"
            onClick={() => setIsMetadataMenuOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:scale-102 relative ml-5 mr-2"
            style={{
              backgroundColor: isMetadataMenuOpen ? "var(--bg-secondary)" : "var(--bg-primary)",
              borderColor: isMetadataComplete ? "var(--border-color)" : "var(--accent-red)",
              color: "var(--text-primary)",
            }}
            title="Abrir menu de metadados do texto"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" style={{ color: "var(--accent-red)" }} />
            <span>Metadados</span>
            {!isMetadataComplete ? (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Metadados pendentes" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            )}
          </button>
          {/* Autores Button */}
          <button
            type="button"
            onClick={() => setIsAuthorPanelOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:scale-102 mr-2"
            style={{
              backgroundColor: isAuthorPanelOpen ? "var(--bg-secondary)" : "var(--bg-primary)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
            title="Gerenciar autores"
          >
            <Users className="w-3.5 h-3.5" style={{ color: "var(--accent-red)" }} />
            <span className="hidden sm:inline">Autores</span>
          </button>
          {/* Commitar no Git (Ação Principal) */}
          <button
            type="button"
            onClick={handleOpenCommitModal}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-xs transition-all hover:opacity-90 hover:scale-102"
            style={{
              backgroundColor: "var(--accent-red)",
              color: "#ffffff",
            }}
            title="Fazer commit direto no repositório GitHub"
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Commitar</span>
          </button>
        </div>
      </header>

      {/* Temporary File Notification banner */}
      {fileNotification && (
        <div
          className="p-3.5 rounded-xl border flex items-center justify-between text-xs sm:text-sm animate-in slide-in-from-top-2 duration-300 shrink-0"
          style={{
            backgroundColor: "var(--badge-bg)",
            borderColor: "var(--border-color)",
            color: "var(--text-primary)",
          }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{fileNotification}</span>
          </div>
          <button onClick={() => setFileNotification(null)} className="text-xs font-bold underline ml-2">
            Fechar
          </button>
        </div>
      )}

      {/* Success banner on download */}
      {downloadSuccess && (
        <div
          className="p-3.5 rounded-xl border flex items-center justify-between text-xs sm:text-sm animate-in slide-in-from-top-2 duration-300 shrink-0"
          style={{
            backgroundColor: "var(--accent-red-light)",
            borderColor: "var(--accent-red)",
            color: "var(--accent-red)",
          }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              Arquivo <strong>{slug}.md</strong> baixado com sucesso! Mova-o para a pasta <code>{siteConfig.git.postsPath}/</code> no projeto para publicar.
            </span>
          </div>
          <button onClick={() => setDownloadSuccess(false)} className="text-xs font-bold underline ml-2">
            Fechar
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. LADO A LADO: EDITOR DE TEXTO & PREVIEW RENDERIZADO     */}
      {/* ======================================================== */}
      <div
        className={`grid gap-4 sm:gap-5 w-full ${isFullscreen ? "flex-1 min-h-0" : ""
          } ${viewMode === "split"
            ? "grid-cols-1 lg:grid-cols-2"
            : "grid-cols-1"
          }`}
      >
        {/* -------------------------------------------------------- */}
        {/* COLUNA ESQUERDA: EDITOR DE TEXTO MARKDOWN               */}
        {/* -------------------------------------------------------- */}
        {(viewMode === "split" || viewMode === "editor") && (
          <div
            className={`rounded-2xl border flex flex-col shadow-xs overflow-hidden ${isFullscreen ? "h-full" : ""
              }`}
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
            }}
          >
            {/* Editor Toolbar Header */}
            <div
              className="p-2.5 sm:p-3 border-b flex flex-wrap items-center justify-between gap-2 shrink-0"
              style={{
                borderColor: "var(--border-light)",
                backgroundColor: "var(--bg-secondary)",
              }}
            >
              {/* Active File Name & Save Status (comportamento anterior com timestamp) */}
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="font-mono text-xs font-semibold truncate max-w-[140px] sm:max-w-[220px]"
                  style={{ color: "var(--text-primary)" }}
                  title={`${slug || "novo-artigo"}.md`}
                >
                  {slug || "novo-artigo"}.md
                </span>

                {/* Local Save & Offline Indicator */}
                {isSaving ? (
                  <span className="text-[11px] font-mono opacity-60 flex items-center gap-1 animate-pulse">
                    Salvando...
                  </span>
                ) : lastSaved ? (
                  <span
                    className="text-[11px] font-mono inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400"
                    title={`Salvo localmente no navegador às ${formatTimestamp(lastSaved)}`}
                  >
                    <HardDrive className="w-3 h-3" />
                    <span>Salvo ({formatTimestamp(lastSaved)})</span>
                  </span>
                ) : null}

                {!isOnline && (
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded border border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 flex items-center gap-1"
                    title="Sem conexão à internet. Suas alterações estão 100% salvas localmente no navegador."
                  >
                    <WifiOff className="w-2.5 h-2.5" />
                    <span>Offline</span>
                  </span>
                )}
              </div>

              {/* Formatting Action Buttons */}
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertText("## ")}
                  className="px-2 py-1 rounded text-xs font-semibold border transition-all hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ borderColor: "var(--border-light)" }}
                  title="Título H2"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => insertText("### ")}
                  className="px-2 py-1 rounded text-xs font-semibold border transition-all hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ borderColor: "var(--border-light)" }}
                  title="Subtítulo H3"
                >
                  H3
                </button>
                <button
                  type="button"
                  onClick={() => insertText("**", "**")}
                  className="p-1.5 rounded border transition-all hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ borderColor: "var(--border-light)" }}
                  title="Negrito (**)"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertText("*", "*")}
                  className="p-1.5 rounded border transition-all hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ borderColor: "var(--border-light)" }}
                  title="Itálico (*)"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertText('> "Citação..."\n')}
                  className="p-1.5 rounded border transition-all hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ borderColor: "var(--border-light)" }}
                  title="Bloco de Citação (>)"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertText("* Item\n* Item\n")}
                  className="p-1.5 rounded border transition-all hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ borderColor: "var(--border-light)" }}
                  title="Lista com marcadores"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertText("1. Primeiro item\n2. Segundo item\n")}
                  className="p-1.5 rounded border transition-all hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ borderColor: "var(--border-light)" }}
                  title="Lista numerada"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertText("`", "`")}
                  className="p-1.5 rounded border transition-all hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ borderColor: "var(--border-light)" }}
                  title="Código inline (`)"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertText("\n---\n")}
                  className="px-2 py-1 rounded text-xs font-serif font-bold border transition-all hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ borderColor: "var(--border-light)" }}
                  title="Divisor de Seção §"
                >
                  §
                </button>
              </div>
            </div>

            {/* Textarea Area */}
            <div className={`relative flex-1 p-3 ${isFullscreen ? "min-h-0" : ""}`}>
              <textarea
                id="markdown-editor"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva seu texto aqui em Markdown... Use ## para seções, **negrito**, > citações, etc."
                className={`w-full p-4 rounded-xl border text-sm font-mono leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-red)] transition-all ${isFullscreen ? "h-full resize-none" : "h-[680px] min-h-[500px] resize-y"
                  }`}
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Editor Footer Stats */}
            <div
              className="p-2 sm:p-2.5 px-4 border-t flex items-center justify-between text-[11px] font-mono opacity-70 shrink-0"
              style={{
                borderColor: "var(--border-light)",
                backgroundColor: "var(--bg-secondary)",
              }}
            >
              <span>{wordCount} palavras • {characterCount} caracteres</span>
              <span>
                {remoteFileExists ? "Sincronizado com Git" : "Novo texto local"}
              </span>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/* COLUNA DIREITA: PREVIEW RENDERIZADO LADO A LADO          */}
        {/* -------------------------------------------------------- */}
        {(viewMode === "split" || viewMode === "preview") && (
          <div
            className={`rounded-2xl border flex flex-col shadow-xs overflow-hidden ${isFullscreen ? "h-full" : ""
              }`}
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
            }}
          >
            {/* Preview Header & Tabs */}
            <div
              className="p-2.5 sm:p-3 border-b flex items-center justify-between gap-2 shrink-0"
              style={{
                borderColor: "var(--border-light)",
                backgroundColor: "var(--bg-secondary)",
              }}
            >
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPreviewTab("rendered")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${previewTab === "rendered"
                    ? "bg-[var(--accent-red)] text-white shadow-2xs"
                    : "opacity-60 hover:opacity-100"
                    }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Preview Renderizado</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewTab("code")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${previewTab === "code"
                    ? "bg-[var(--accent-red)] text-white shadow-2xs"
                    : "opacity-60 hover:opacity-100"
                    }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Código .md</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono opacity-60 hidden sm:inline">
                  {previewTab === "rendered" ? "Visualização real do artigo" : "Frontmatter + Markdown"}
                </span>
                <span className="w-2 h-2 rounded-full bg-green-500" title="Renderização ao vivo" />
              </div>
            </div>

            {/* Preview Body */}
            <div
              className={`flex-1 p-4 sm:p-6 overflow-y-auto ${isFullscreen ? "min-h-0" : "max-h-[730px] min-h-[500px]"
                }`}
            >
              {previewTab === "rendered" ? (
                /* TAB 1: RENDERED ARTICLE VIEW */
                <article className="space-y-6">
                  {/* Article simulated header */}
                  <div className="space-y-3 pb-5 border-b" style={{ borderColor: "var(--border-light)" }}>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className="px-2.5 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]"
                        style={{
                          backgroundColor: "var(--badge-bg)",
                          color: "var(--accent-red)",
                        }}
                      >
                        {effectiveCategory}
                      </span>
                      <span className="opacity-40">•</span>
                      <span className="opacity-60 font-medium text-[11px]">{formatPreviewDate(date)}</span>
                      <span className="opacity-40">•</span>
                      <span className="opacity-60 font-mono text-[11px] flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {readingTime}
                      </span>
                    </div>

                    <h1
                      className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight leading-snug"
                      style={{
                        fontFamily: "var(--font-serif-title)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {title || "Título do Texto"}
                    </h1>

                    <div className="text-xs font-medium opacity-60">
                      Por <span style={{ color: "var(--accent-red)" }}>{author || siteConfig.author}</span>
                    </div>

                    {/* Summary in preview */}
                    {summary && (
                      <p
                        className="text-sm sm:text-base leading-relaxed italic opacity-90 font-serif pt-1"
                        style={{
                          color: "var(--text-secondary)",
                          fontFamily: "var(--font-serif-body)",
                        }}
                      >
                        {summary}
                      </p>
                    )}

                    {/* Epigraph in preview */}
                    {epigraph && (
                      <div
                        className="p-3 rounded-lg border text-xs italic font-serif"
                        style={{
                          backgroundColor: "var(--quote-bg)",
                          borderColor: "var(--border-light)",
                          borderLeft: "3px solid var(--accent-red)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {epigraph}
                      </div>
                    )}

                    {/* Tags preview */}
                    {tagsList.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {tagsList.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded text-[10px] font-mono"
                            style={{
                              backgroundColor: "var(--bg-secondary)",
                              color: "var(--text-muted)",
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Rendered Markdown Body using global prose-content class */}
                  <div
                    className="prose-content transition-all duration-150"
                    dangerouslySetInnerHTML={{ __html: renderedHtml }}
                  />
                </article>
              ) : (
                /* TAB 2: RAW CODE OUTPUT VIEW */
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: "var(--border-light)" }}>
                    <span className="text-xs font-mono opacity-70">Arquivo {slug}.md gerado:</span>
                    <button
                      type="button"
                      onClick={() => handleOpenConfirmModal("copy")}
                      className="px-2 py-1 rounded text-xs font-semibold border flex items-center gap-1 hover:opacity-80"
                      style={{ borderColor: "var(--border-light)" }}
                    >
                      <Copy className="w-3 h-3" /> Copiar
                    </button>
                  </div>
                  <pre
                    className="p-4 rounded-xl overflow-x-auto text-xs font-mono border max-h-[560px] overflow-y-auto leading-relaxed"
                    style={{
                      backgroundColor: "var(--code-bg)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {markdownOutput}
                  </pre>
                </div>
              )}
            </div>

            {/* Preview Footer */}
            <div
              className="p-2 sm:p-2.5 px-4 border-t flex items-center justify-between text-[11px] opacity-70 shrink-0"
              style={{
                borderColor: "var(--border-light)",
                backgroundColor: "var(--bg-secondary)",
              }}
            >
              <span>Tipografia: {siteConfig.title}</span>
              <button
                type="button"
                onClick={() => setIsCardPreviewOpen(true)}
                className="hover:underline flex items-center gap-1 text-[var(--accent-red)] font-semibold"
              >
                <Eye className="w-3 h-3" /> Abrir Prévia do Card
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 3. MODAL DE SELEÇÃO DE ARQUIVO (GIT + LOCAL + IMPORT)     */}
      {/* ======================================================== */}
      {isSelectFileModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
            }}
          >
            {/* Modal Header */}
            <div
              className="p-5 border-b flex items-center justify-between shrink-0"
              style={{
                borderColor: "var(--border-color)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[var(--accent-red-light)]">
                  <FolderOpen className="w-5 h-5" style={{ color: "var(--accent-red)" }} />
                </div>
                <div>
                  <h2 className="text-base font-bold font-serif" style={{ color: "var(--text-primary)" }}>
                    Selecionar Arquivo para Trabalhar
                  </h2>
                  <p className="text-xs opacity-70">
                    Abra um texto direto do repositório Git, retome um rascunho salvo ou importe um arquivo .md
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleNewDocument}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:opacity-80"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                  title="Criar um novo documento limpo"
                >
                  <FilePlus className="w-3.5 h-3.5 text-blue-500" />
                  <span className="hidden sm:inline">Novo Documento</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSelectFileModalOpen(false)}
                  className="p-1.5 rounded-lg border hover:opacity-80 transition-opacity"
                  style={{ borderColor: "var(--border-light)" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Tabs */}
            <div
              className="px-5 py-2.5 border-b flex items-center gap-2 text-xs shrink-0"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-light)",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setFileModalTab("git");
                  if (gitRepoFiles.length === 0 && isGitConnected) {
                    fetchGitRepoFiles();
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${fileModalTab === "git"
                  ? "bg-[var(--bg-card)] shadow-2xs text-[var(--accent-red)] font-bold"
                  : "opacity-60 hover:opacity-100"
                  }`}
              >
                <GitBranch className="w-3 h-3" />
                <span>Repositório Git ({gitConfig.owner}/{gitConfig.repo})</span>
                {gitRepoFiles.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/5 dark:bg-white/10 font-mono">
                    {gitRepoFiles.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setFileModalTab("drafts")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${fileModalTab === "drafts"
                  ? "bg-[var(--bg-card)] shadow-2xs text-[var(--accent-red)] font-bold"
                  : "opacity-60 hover:opacity-100"
                  }`}
              >
                <HardDrive className="w-3 h-3" />
                <span>Rascunhos Locais</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/5 dark:bg-white/10 font-mono">
                  {localDrafts.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFileModalTab("import")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${fileModalTab === "import"
                  ? "bg-[var(--bg-card)] shadow-2xs text-[var(--accent-red)] font-bold"
                  : "opacity-60 hover:opacity-100"
                  }`}
              >
                <FileUp className="w-3 h-3" />
                <span>Importar do Computador</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 max-h-[60vh] space-y-3">
              {/* TAB 1: REPOSITÓRIO GIT */}
              {fileModalTab === "git" && (
                <div className="space-y-3">
                  {!isGitConnected ? (
                    <div className="p-8 text-center space-y-3 border rounded-xl" style={{ borderColor: "var(--border-light)" }}>
                      <GitBranch className="w-8 h-8 text-amber-500 mx-auto" />
                      <div>
                        <h4 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                          Git ainda não conectado
                        </h4>
                        <p className="text-xs opacity-70 mt-1 max-w-md mx-auto">
                          Insira seu token do GitHub para listar e editar todos os arquivos markdown diretamente do repositório <strong>{gitConfig.owner}/{gitConfig.repo}</strong>.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSelectFileModalOpen(false);
                          setIsGitModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-[var(--accent-red)] shadow-xs"
                      >
                        Configurar Conexão Git
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Pasta Toggle (Posts vs Docs) */}
                      <div className="flex items-center gap-2 p-1 rounded-xl bg-black/5 dark:bg-white/5 border" style={{ borderColor: "var(--border-light)" }}>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveGitFolder("posts");
                            fetchGitRepoFiles("posts");
                          }}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${activeGitFolder === "posts"
                            ? "bg-[var(--bg-card)] shadow-xs font-bold text-[var(--accent-red)]"
                            : "opacity-60 hover:opacity-100"
                            }`}
                        >
                          📁 Posts ({gitConfig.postsPath})
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveGitFolder("docs");
                            fetchGitRepoFiles("docs");
                          }}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${activeGitFolder === "docs"
                            ? "bg-[var(--bg-card)] shadow-xs font-bold text-[var(--accent-red)]"
                            : "opacity-60 hover:opacity-100"
                            }`}
                        >
                          📘 Documentação ({siteConfig.git.docsPath || "content/docs"})
                        </button>
                      </div>

                      {isLoadingGitFiles ? (
                        <div className="p-8 text-center text-xs opacity-60 font-mono flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>
                            Consultando pasta {activeGitFolder === "posts" ? gitConfig.postsPath : (siteConfig.git.docsPath || "content/docs")} na branch {gitConfig.branch}...
                          </span>
                        </div>
                      ) : gitFilesError ? (
                        <div className="p-6 text-center space-y-2 border border-red-500/30 bg-red-500/10 rounded-xl text-xs text-red-600 dark:text-red-400">
                          <AlertCircle className="w-5 h-5 mx-auto" />
                          <p>{gitFilesError}</p>
                          <button
                            type="button"
                            onClick={() => fetchGitRepoFiles(activeGitFolder)}
                            className="underline font-semibold"
                          >
                            Tentar novamente
                          </button>
                        </div>
                      ) : gitRepoFiles.length === 0 ? (
                        <div className="p-8 text-center text-xs opacity-60 space-y-2">
                          <p>
                            Nenhum arquivo markdown encontrado em <code>{activeGitFolder === "posts" ? gitConfig.postsPath : (siteConfig.git.docsPath || "content/docs")}</code> na branch <code>{gitConfig.branch}</code>.
                          </p>
                          <button onClick={() => fetchGitRepoFiles(activeGitFolder)} className="underline text-[var(--accent-red)] font-semibold">
                            Atualizar lista
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between text-xs pb-2 border-b" style={{ borderColor: "var(--border-light)" }}>
                            <span className="opacity-70 font-mono text-[11px]">
                              Arquivos em {gitConfig.owner}/{gitConfig.repo}:{activeGitFolder === "posts" ? gitConfig.postsPath : (siteConfig.git.docsPath || "content/docs")}
                            </span>
                            <button
                              type="button"
                              onClick={() => fetchGitRepoFiles(activeGitFolder)}
                              className="flex items-center gap-1 text-[11px] opacity-70 hover:opacity-100 hover:text-[var(--accent-red)]"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Atualizar</span>
                            </button>
                          </div>

                          {gitRepoFiles.map((file) => (
                            <div
                              key={file.sha}
                              onClick={() => handleSelectGitFile(file)}
                              className="p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all hover:scale-[1.01] hover:shadow-sm cursor-pointer group"
                              style={{
                                backgroundColor: "var(--bg-primary)",
                                borderColor: "var(--border-color)",
                              }}
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2 text-[11px]">
                                  <span className="font-mono text-xs font-bold text-[var(--accent-red)]">
                                    {file.name}
                                  </span>
                                  <span className="opacity-40">•</span>
                                  <span className="font-mono text-[10px] opacity-60">SHA: {file.sha.slice(0, 7)}</span>
                                  <span className="opacity-40">•</span>
                                  <span className="text-[10px] opacity-50">{Math.round(file.size / 1024)} KB</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <a
                                  href={file.html_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 rounded-lg border hover:opacity-80 opacity-60"
                                  style={{ borderColor: "var(--border-light)" }}
                                  title="Ver arquivo no GitHub"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>

                                <button
                                  type="button"
                                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all group-hover:bg-[var(--accent-red)] group-hover:text-white group-hover:border-transparent"
                                  style={{
                                    borderColor: "var(--border-color)",
                                    backgroundColor: "var(--bg-card)",
                                  }}
                                >
                                  Abrir do Git
                                </button>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* TAB 2: RASCUNHOS LOCAIS SALVOS */}
              {fileModalTab === "drafts" && (
                <div className="space-y-3">
                  {localDrafts.length === 0 ? (
                    <div className="p-8 text-center space-y-2">
                      <HardDrive className="w-8 h-8 opacity-30 mx-auto" />
                      <p className="text-xs opacity-60">
                        Nenhum rascunho anterior salvo ainda. O rascunho atual é salvo automaticamente enquanto você digita!
                      </p>
                    </div>
                  ) : (
                    localDrafts.map((draft) => (
                      <div
                        key={draft.id}
                        onClick={() => handleSelectLocalDraft(draft)}
                        className="p-4 rounded-xl border flex items-center justify-between gap-4 transition-all hover:scale-[1.01] hover:shadow-sm cursor-pointer group"
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          borderColor: "var(--border-color)",
                        }}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 font-mono text-[10px]">
                              <HardDrive className="w-3 h-3" /> Salvo {formatTimestamp(draft.updatedAt)}
                            </span>
                            <span className="opacity-40">•</span>
                            <span className="opacity-60 text-[10px] font-mono">{draft.slug}.md</span>
                          </div>
                          <h4
                            className="font-serif font-bold text-sm truncate group-hover:text-[var(--accent-red)] transition-colors"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {draft.title || "Rascunho sem título"}
                          </h4>
                          <p className="text-xs line-clamp-1 opacity-70">
                            {draft.summary || draft.content.slice(0, 100)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleDeleteDraft(e, draft.id)}
                            className="p-1.5 rounded-lg border text-red-500 hover:bg-red-500/10 transition-colors"
                            style={{ borderColor: "var(--border-light)" }}
                            title="Excluir este rascunho salvo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all group-hover:bg-[var(--accent-red)] group-hover:text-white group-hover:border-transparent"
                            style={{
                              borderColor: "var(--border-color)",
                              backgroundColor: "var(--bg-card)",
                            }}
                          >
                            Restaurar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: IMPORTAR ARQUIVO DO COMPUTADOR */}
              {fileModalTab === "import" && (
                <div className="space-y-4 py-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-2xl p-8 text-center space-y-3 cursor-pointer transition-all hover:border-[var(--accent-red)] hover:bg-[var(--accent-red-light)]/20"
                    style={{
                      borderColor: "var(--border-color)",
                      backgroundColor: "var(--bg-primary)",
                    }}
                  >
                    <div className="p-3 rounded-full bg-[var(--accent-red-light)] w-12 h-12 mx-auto flex items-center justify-center">
                      <FileUp className="w-6 h-6" style={{ color: "var(--accent-red)" }} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                        Clique para carregar ou arraste um arquivo .md
                      </h4>
                      <p className="text-xs opacity-70 mt-1">
                        Formatos suportados: .md, .markdown, .mdx, .txt
                      </p>
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-xs"
                      style={{
                        backgroundColor: "var(--accent-red)",
                        color: "#ffffff",
                      }}
                    >
                      Selecionar Arquivo no Computador
                    </button>
                  </div>

                  <div className="p-4 rounded-xl border text-xs space-y-1.5 opacity-80" style={{ borderColor: "var(--border-light)" }}>
                    <div className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Reconhecimento Automático de Frontmatter YAML</span>
                    </div>
                    <p className="leading-relaxed">
                      Se o seu arquivo markdown possuir cabeçalho com <code>--- title, summary, category, tags ---</code>, todos os metadados serão preenchidos automaticamente no editor!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              className="p-4 border-t flex items-center justify-between shrink-0"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-color)",
              }}
            >
              <span className="text-xs opacity-60">
                O arquivo selecionado substituirá o texto atual do editor com auto-save imediato.
              </span>
              <button
                type="button"
                onClick={() => setIsSelectFileModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold border hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. MODAL DE CONFIGURAÇÃO DO GIT / GITHUB                 */}
      {/* ======================================================== */}
      {isGitModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
            }}
          >
            {/* Header */}
            <div
              className="p-5 border-b flex items-center justify-between shrink-0"
              style={{
                borderColor: "var(--border-color)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[var(--accent-red-light)]">
                  <GitBranch className="w-5 h-5" style={{ color: "var(--accent-red)" }} />
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif" style={{ color: "var(--text-primary)" }}>
                    Integração com o Repositório Git
                  </h3>
                  <p className="text-xs opacity-70">
                    Configure seu GitHub Token para gerenciar arquivos e publicar colaborativamente
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsGitModalOpen(false)}
                className="p-1 rounded-lg border hover:opacity-80 transition-opacity"
                style={{ borderColor: "var(--border-light)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="p-3.5 rounded-xl border bg-black/5 dark:bg-white/5 text-xs leading-relaxed space-y-1.5" style={{ borderColor: "var(--border-light)" }}>
                <p className="font-semibold flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Segurança Total & Zero Servidor</span>
                </p>
                <p className="opacity-80">
                  Seu token é salvo <strong>somente no navegador da sua máquina</strong> e usado para conversar diretamente com a API do GitHub. Ele nunca é gravado no código nem exposto para terceiros.
                </p>
              </div>

              {/* Connected User Card */}
              {gitConfig.user && (
                <div
                  className="p-3.5 rounded-xl border flex items-center justify-between gap-3"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={gitConfig.user.avatar_url}
                      alt={gitConfig.user.login}
                      className="w-10 h-10 rounded-full border"
                      style={{ borderColor: "var(--border-color)" }}
                    />
                    <div>
                      <h4 className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                        {gitConfig.user.name || `@${gitConfig.user.login}`}
                      </h4>
                      <p className="text-[11px] font-mono opacity-60">@{gitConfig.user.login}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10">
                    Conectado
                  </span>
                </div>
              )}

              {/* Owner & Repo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)" }}>
                    Proprietário (Owner) *
                  </label>
                  <input
                    type="text"
                    value={gitConfig.owner}
                    onChange={(e) => setGitConfig({ ...gitConfig, owner: e.target.value.trim() })}
                    placeholder="ex: Andrezz64"
                    className="w-full px-3 py-2 rounded-lg border text-xs font-mono transition-all focus:outline-hidden"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)" }}>
                    Repositório (Repo) *
                  </label>
                  <input
                    type="text"
                    value={gitConfig.repo}
                    onChange={(e) => setGitConfig({ ...gitConfig, repo: e.target.value.trim() })}
                    placeholder="ex: maltese"
                    className="w-full px-3 py-2 rounded-lg border text-xs font-mono transition-all focus:outline-hidden"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>

              {/* Branch & Posts Path */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)" }}>
                    Branch de Trabalho *
                  </label>
                  <input
                    type="text"
                    value={gitConfig.branch}
                    onChange={(e) => setGitConfig({ ...gitConfig, branch: e.target.value.trim() })}
                    placeholder="main"
                    className="w-full px-3 py-2 rounded-lg border text-xs font-mono transition-all focus:outline-hidden"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)" }}>
                    Pasta dos Posts
                  </label>
                  <input
                    type="text"
                    value={gitConfig.postsPath}
                    onChange={(e) => setGitConfig({ ...gitConfig, postsPath: e.target.value.trim() })}
                    placeholder="content/posts"
                    className="w-full px-3 py-2 rounded-lg border text-xs font-mono transition-all focus:outline-hidden"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>

              {/* Personal Access Token (PAT) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                    GitHub Personal Access Token (PAT) *
                  </label>
                  <a
                    href="https://github.com/settings/tokens?type=beta"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] underline flex items-center gap-1 opacity-70 hover:opacity-100 text-[var(--accent-red)]"
                  >
                    <span>Criar Token no GitHub</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                <div className="relative">
                  <input
                    type={showTokenPassword ? "text" : "password"}
                    value={gitConfig.token}
                    onChange={(e) => setGitConfig({ ...gitConfig, token: e.target.value.trim() })}
                    placeholder="ghp_... ou github_pat_..."
                    className="w-full px-3 py-2 pr-16 rounded-lg border text-xs font-mono transition-all focus:outline-hidden"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowTokenPassword(!showTokenPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold px-2 py-1 rounded opacity-60 hover:opacity-100"
                  >
                    {showTokenPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                <p className="text-[11px] opacity-60 mt-1">
                  Permissão necessária: <strong>Repository permissions &gt; Contents (Read and write)</strong>.
                </p>
              </div>

              {/* Result Feedback Banner */}
              {gitTestResult && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${gitTestResult.success
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                    : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300"
                    }`}
                >
                  {gitTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{gitTestResult.message}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="p-4 border-t flex items-center justify-between"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-color)",
              }}
            >
              {gitConfig.token ? (
                <button
                  type="button"
                  onClick={handleDisconnectGit}
                  className="text-xs text-red-500 hover:underline font-semibold"
                >
                  Desconectar
                </button>
              ) : (
                <span className="text-xs opacity-60 font-mono">Definido em site.config.ts</span>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestAndSaveGitConnection}
                  disabled={isTestingGit || !gitConfig.token.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all hover:opacity-90 disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                >
                  {isTestingGit ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}
                  <span>{isTestingGit ? "Validando..." : "Testar Conexão"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem(STORAGE_GIT_AUTH, JSON.stringify(gitConfig));
                    setIsGitModalOpen(false);
                  }}
                  className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-[var(--accent-red)] shadow-xs"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. MODAL DE CONFIRMAÇÃO DE COMMIT NO GITHUB              */}
      {/* ======================================================== */}
      {isCommitModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg rounded-2xl border shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
            }}
          >
            {/* Header */}
            <div
              className="p-5 border-b flex items-center justify-between shrink-0"
              style={{
                borderColor: "var(--border-color)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[var(--accent-red-light)]">
                  <GitCommit className="w-5 h-5" style={{ color: "var(--accent-red)" }} />
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif" style={{ color: "var(--text-primary)" }}>
                    Fazer Commit no Repositório Git
                  </h3>
                  <p className="text-xs opacity-70">
                    Gere um commit diretamente na branch <strong>{gitConfig.branch}</strong> de <strong>{gitConfig.owner}/{gitConfig.repo}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCommitModalOpen(false)}
                className="p-1 rounded-lg border hover:opacity-80 transition-opacity"
                style={{ borderColor: "var(--border-light)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Target File Info */}
              <div
                className="p-3.5 rounded-xl border text-xs space-y-3"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border-color)",
                }}
              >
                {/* Folder Selector Pills */}
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-70">
                    Destino no Repositório:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveGitFolder("posts");
                        checkRemoteShaForFolder("posts");
                      }}
                      className={`p-2 rounded-lg text-xs font-semibold border transition-all text-left flex items-center justify-between ${activeGitFolder === "posts"
                        ? "border-[var(--accent-red)] bg-[var(--accent-red-light)] text-[var(--accent-red)] font-bold shadow-2xs"
                        : "border-[var(--border-color)] opacity-70 hover:opacity-100"
                        }`}
                    >
                      <span>📁 Posts ({gitConfig.postsPath})</span>
                      {activeGitFolder === "posts" && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-red)]" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveGitFolder("docs");
                        checkRemoteShaForFolder("docs");
                      }}
                      className={`p-2 rounded-lg text-xs font-semibold border transition-all text-left flex items-center justify-between ${activeGitFolder === "docs"
                        ? "border-[var(--accent-red)] bg-[var(--accent-red-light)] text-[var(--accent-red)] font-bold shadow-2xs"
                        : "border-[var(--border-color)] opacity-70 hover:opacity-100"
                        }`}
                    >
                      <span>📘 Docs ({siteConfig.git.docsPath || "content/docs"})</span>
                      {activeGitFolder === "docs" && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-red)]" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: "var(--border-light)" }}>
                  <span className="font-semibold opacity-70">Arquivo:</span>
                  <span className="font-mono text-xs font-bold text-[var(--accent-red)]">
                    {activeGitFolder === "posts" ? gitConfig.postsPath : (siteConfig.git.docsPath || "content/docs")}/{slug || "novo-texto"}.md
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: "var(--border-light)" }}>
                  <span className="font-semibold opacity-70">Status no GitHub:</span>
                  {isCheckingRemoteSha ? (
                    <span className="font-mono text-[11px] opacity-60 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Verificando...
                    </span>
                  ) : remoteFileExists ? (
                    <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                      Atualizando arquivo existente (SHA: {remoteFileSha?.slice(0, 7)})
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      Criando novo arquivo
                    </span>
                  )}
                </div>
              </div>

              {/* Commit Message Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)" }}>
                  Mensagem do Commit *
                </label>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="ex: feat(posts): adiciona O Elogio da Insubmissão"
                  className="w-full px-3 py-2.5 rounded-lg border text-xs font-mono transition-all focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-red)]"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              {/* Author Preview */}
              <div className="flex items-center justify-between text-xs opacity-70 font-mono">
                <span>Comitando como: @{gitConfig.user?.login || gitConfig.owner}</span>
                <span>Branch: {gitConfig.branch}</span>
              </div>

              {/* Error Banner */}
              {commitError && (
                <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Erro no commit:</p>
                    <p className="leading-relaxed">{commitError}</p>
                  </div>
                </div>
              )}

              {/* Success Result Card */}
              {commitSuccessResult && (
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Commit realizado com sucesso no repositório!</span>
                  </div>
                  <p className="opacity-80 font-mono text-[11px]">
                    Hash: {commitSuccessResult.commitSha}
                  </p>
                  <a
                    href={commitSuccessResult.commitUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300 underline pt-1"
                  >
                    <span>Ver commit no GitHub</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="p-4 border-t flex items-center justify-end gap-2.5"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-color)",
              }}
            >
              <button
                type="button"
                onClick={() => setIsCommitModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold border hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
              >
                {commitSuccessResult ? "Fechar" : "Cancelar"}
              </button>

              {!commitSuccessResult && (
                <button
                  type="button"
                  onClick={executeCommitToGitHub}
                  disabled={isCommitInProgress || isCheckingRemoteSha}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-all hover:opacity-90 disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--accent-red)",
                    color: "#ffffff",
                  }}
                >
                  {isCommitInProgress ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Commitando...</span>
                    </>
                  ) : (
                    <>
                      <GitCommit className="w-3.5 h-3.5" />
                      <span>Confirmar Commit</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. MENU DE METADADOS DO ESCRITO (SLIDE-OVER / MODAL)      */}
      {/* ======================================================== */}
      {isMetadataMenuOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-xl flex flex-col animate-in zoom-in-95 duration-200"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
            }}
          >
            {/* Header */}
            <div
              className="p-5 border-b flex items-center justify-between sticky top-0 z-10"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-color)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[var(--accent-red-light)]">
                  <SlidersHorizontal className="w-5 h-5" style={{ color: "var(--accent-red)" }} />
                </div>
                <div>
                  <h2 className="text-base font-bold font-serif" style={{ color: "var(--text-primary)" }}>
                    Metadados do Escrito
                  </h2>
                  <p className="text-xs opacity-70">
                    Ajuste o título, data, resumo, taxonomia e parâmetros do arquivo.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMetadataMenuOpen(false)}
                className="p-1.5 rounded-lg border hover:opacity-80 transition-opacity"
                style={{ borderColor: "var(--border-light)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields Body */}
            <div className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)" }}>
                  Título do Texto *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Ex: O Elogio da Insubmissão"
                  className="w-full px-3.5 py-2.5 rounded-lg border text-sm font-serif font-bold transition-all focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-red)]"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              {/* Slug & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)" }}>
                    Nome do Arquivo (Slug) *
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(slugify(e.target.value))}
                      className="w-full px-3 py-2 rounded-l-lg border text-xs font-mono transition-all focus:outline-hidden"
                      style={{
                        backgroundColor: "var(--bg-primary)",
                        borderColor: "var(--border-color)",
                        color: "var(--text-primary)",
                      }}
                    />
                    <span
                      className="px-2.5 py-2 rounded-r-lg border-y border-r text-xs font-mono opacity-60"
                      style={{
                        backgroundColor: "var(--bg-secondary)",
                        borderColor: "var(--border-color)",
                      }}
                    >
                      .md
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)" }}>
                    Data de Publicação
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border text-xs transition-all focus:outline-hidden"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)" }}>
                  Resumo / Sinopse (1 ou 2 frases) *
                </label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Uma síntese elegante que resume a tese principal do texto..."
                  className="w-full px-3.5 py-2 rounded-lg border text-xs leading-relaxed transition-all focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-red)]"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              {/* Category & Author */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)" }}>
                    Categoria / Eixo
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border text-xs transition-all focus:outline-hidden"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {siteConfig.editorial.categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="Outra">Outra (Personalizada)</option>
                  </select>

                  {category === "Outra" && (
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Digite o nome da categoria"
                      className="w-full mt-2 px-3 py-1.5 rounded-lg border text-xs"
                      style={{
                        backgroundColor: "var(--bg-primary)",
                        borderColor: "var(--border-color)",
                        color: "var(--text-primary)",
                      }}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)" }}>
                    Autor(a)
                  </label>
                  {/* Author pill + picker trigger */}
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="flex-1 min-w-0 px-3 py-2 rounded-lg border text-xs transition-all focus:outline-hidden"
                      style={{
                        backgroundColor: "var(--bg-primary)",
                        borderColor: "var(--border-color)",
                        color: "var(--text-primary)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => { setIsMetadataMenuOpen(false); setIsAuthorPanelOpen(true); }}
                      className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all hover:opacity-80"
                      style={{
                        borderColor: "var(--accent-red)",
                        color: "var(--accent-red)",
                        backgroundColor: "var(--bg-primary)",
                      }}
                      title="Selecionar ou criar autor"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Gerenciar</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tags & Epigraph */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)" }}>
                    Temas / Tags (separados por vírgula)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Ex: Emancipação, Ética, Resistência"
                    className="w-full px-3.5 py-2 rounded-lg border text-xs transition-all focus:outline-hidden"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                  />
                  {tagsList.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tagsList.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded text-[10px] font-mono"
                          style={{
                            backgroundColor: "var(--bg-secondary)",
                            color: "var(--text-muted)",
                          }}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)" }}>
                    Epígrafe / Citação de Abertura (Opcional)
                  </label>
                  <input
                    type="text"
                    value={epigraph}
                    onChange={(e) => setEpigraph(e.target.value)}
                    placeholder="Ex: A desobediência é a virtude original do homem. — Oscar Wilde"
                    className="w-full px-3.5 py-2 rounded-lg border text-xs italic transition-all focus:outline-hidden"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>

                {/* Featured toggle */}
                <div
                  className="p-3 rounded-xl border flex items-center gap-3"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <input
                    type="checkbox"
                    id="featured-check"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-[var(--accent-red)] focus:ring-[var(--accent-red)] cursor-pointer"
                  />
                  <label htmlFor="featured-check" className="text-xs font-medium cursor-pointer" style={{ color: "var(--text-primary)" }}>
                    Destacar este ensaio no topo da página inicial (Featured)
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="p-4 border-t flex items-center justify-between sticky bottom-0"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-color)",
              }}
            >
              <span className="text-xs opacity-60">
                Os metadados são salvos automaticamente no arquivo .md
              </span>
              <button
                type="button"
                onClick={() => setIsMetadataMenuOpen(false)}
                className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-xs"
                style={{
                  backgroundColor: "var(--accent-red)",
                  color: "#ffffff",
                }}
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. MODAL DE CONFIRMAÇÃO DE METADADOS (AO BAIXAR / COPIAR) */}
      {/* ======================================================== */}
      {isConfirmActionOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg rounded-2xl border shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
            }}
          >
            {/* Header */}
            <div
              className="p-5 border-b flex items-center justify-between"
              style={{
                borderColor: "var(--border-color)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[var(--accent-red-light)]">
                  {confirmActionType === "download" ? (
                    <Download className="w-5 h-5" style={{ color: "var(--accent-red)" }} />
                  ) : (
                    <Copy className="w-5 h-5" style={{ color: "var(--accent-red)" }} />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif" style={{ color: "var(--text-primary)" }}>
                    {confirmActionType === "download"
                      ? "Confirmar Metadados antes de Baixar"
                      : "Confirmar Metadados antes de Copiar"}
                  </h3>
                  <p className="text-xs opacity-70">
                    Confira ou ajuste rapidamente os dados do arquivo .md
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsConfirmActionOpen(false)}
                className="p-1 rounded-lg border hover:opacity-80 transition-opacity"
                style={{ borderColor: "var(--border-light)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick check body */}
            <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
              {/* Warnings if empty */}
              {(!title.trim() || !summary.trim()) && (
                <div className="p-3 rounded-lg border bg-amber-500/10 border-amber-500/30 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Atenção: Recomendamos preencher o título e resumo antes de exportar!</span>
                </div>
              )}

              {/* Title input */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)" }}>
                  Título do Texto *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-xs font-serif font-bold transition-all focus:outline-hidden"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              {/* Slug & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)" }}>
                    Nome do Arquivo (.md)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border text-xs font-mono transition-all focus:outline-hidden"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)" }}>
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={effectiveCategory}
                    readOnly
                    className="w-full px-3 py-2 rounded-lg border text-xs opacity-80"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)" }}>
                  Resumo / Sinopse *
                </label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-xs leading-relaxed transition-all focus:outline-hidden"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              {/* Tags & Estimated reading time */}
              <div className="flex items-center justify-between text-xs pt-1 border-t" style={{ borderColor: "var(--border-light)" }}>
                <span className="opacity-70 font-mono">
                  {tagsList.length} tema(s) • ~{readingTime}
                </span>
                <span className="font-semibold text-[var(--accent-red)]">
                  {featured ? "★ Destacado na home" : "Modo padrão"}
                </span>
              </div>
            </div>

            {/* Actions Footer */}
            <div
              className="p-4 border-t flex items-center justify-end gap-2.5"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-color)",
              }}
            >
              <button
                type="button"
                onClick={() => setIsConfirmActionOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold border hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
              >
                Cancelar
              </button>

              {confirmActionType === "download" ? (
                <button
                  type="button"
                  onClick={executeDownload}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-all hover:opacity-90"
                  style={{
                    backgroundColor: "var(--accent-red)",
                    color: "#ffffff",
                  }}
                >
                  <Download className="w-4 h-4" />
                  <span>Confirmar e Baixar .md</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={executeCopy}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-all hover:opacity-90"
                  style={{
                    backgroundColor: "var(--accent-red)",
                    color: "#ffffff",
                  }}
                >
                  <Copy className="w-4 h-4" />
                  <span>Confirmar e Copiar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. PRÉVIA DO CARD (BOTÃO COM MENU / POPOVER MODAL)       */}
      {/* ======================================================== */}
      {isCardPreviewOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-xl rounded-2xl border shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
            }}
          >
            {/* Header */}
            <div
              className="p-5 border-b flex items-center justify-between"
              style={{
                borderColor: "var(--border-color)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[var(--accent-red-light)]">
                  <Eye className="w-5 h-5" style={{ color: "var(--accent-red)" }} />
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif" style={{ color: "var(--text-primary)" }}>
                    Prévia do Card de Publicação
                  </h3>
                  <p className="text-xs opacity-70">
                    Como este ensaio será exibido na listagem de textos e na página inicial
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCardPreviewOpen(false)}
                className="p-1 rounded-lg border hover:opacity-80 transition-opacity"
                style={{ borderColor: "var(--border-light)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Toggle Card Mode */}
            <div
              className="px-5 py-2.5 border-b flex items-center justify-between text-xs"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-light)",
              }}
            >
              <span className="font-semibold opacity-70">Modo de visualização:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCardPreviewFeatured(false)}
                  className={`px-2.5 py-1 rounded text-xs transition-all ${!cardPreviewFeatured
                    ? "bg-[var(--bg-card)] font-bold shadow-2xs"
                    : "opacity-60 hover:opacity-100"
                    }`}
                >
                  Padrão
                </button>
                <button
                  type="button"
                  onClick={() => setCardPreviewFeatured(true)}
                  className={`px-2.5 py-1 rounded text-xs transition-all ${cardPreviewFeatured
                    ? "bg-[var(--accent-red)] text-white font-bold shadow-2xs"
                    : "opacity-60 hover:opacity-100"
                    }`}
                >
                  ★ Destaque (Featured)
                </button>
              </div>
            </div>

            {/* Card Preview Container */}
            <div className="p-6">
              <article
                className={`group relative rounded-xl border transition-all duration-300 shadow-sm ${cardPreviewFeatured
                  ? "p-6 sm:p-8 bg-[var(--bg-card)] border-[var(--border-color)]"
                  : "p-5 sm:p-6 bg-[var(--bg-card)] border-[var(--border-color)]"
                  }`}
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-color)",
                }}
              >
                {/* Top meta bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded font-semibold uppercase tracking-wider text-[10px]"
                      style={{
                        backgroundColor: "var(--badge-bg)",
                        color: "var(--accent-red)",
                      }}
                    >
                      {effectiveCategory}
                    </span>
                    <span className="opacity-40">•</span>
                    <time className="font-medium" style={{ color: "var(--text-muted)" }}>
                      {formatPreviewDate(date)}
                    </time>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
                      <Clock className="w-3 h-3" />
                      <span>{readingTime}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setCardBookmarked(!cardBookmarked)}
                      className="p-1 rounded opacity-60 hover:opacity-100 hover:scale-110 transition-all"
                      title={cardBookmarked ? "Remover dos salvos" : "Salvar para ler depois"}
                      style={{ color: cardBookmarked ? "var(--accent-red)" : "var(--text-muted)" }}
                    >
                      {cardBookmarked ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Post Title */}
                <h2
                  className={`font-serif font-bold tracking-tight mb-2 leading-snug ${cardPreviewFeatured ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                    }`}
                  style={{
                    fontFamily: "var(--font-serif-title)",
                    color: "var(--text-primary)",
                  }}
                >
                  {title || "Sem título definido"}
                </h2>

                {/* Summary */}
                <p
                  className={`leading-relaxed mb-4 ${cardPreviewFeatured ? "text-base sm:text-lg font-normal" : "text-sm sm:text-base font-normal"
                    }`}
                  style={{
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-serif-body)",
                  }}
                >
                  {summary || "Escreva uma síntese ou resumo para exibir no card."}
                </p>

                {/* Footer: Tags & Read Link */}
                <div
                  className="pt-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs"
                  style={{ borderColor: "var(--border-light)" }}
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    {tagsList.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium"
                        style={{
                          backgroundColor: "var(--bg-secondary)",
                          color: "var(--text-muted)",
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <span
                    className="inline-flex items-center gap-1.5 font-semibold text-xs opacity-90"
                    style={{ color: "var(--accent-red)" }}
                  >
                    <span>Ler texto integral</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            </div>

            {/* Modal Actions */}
            <div
              className="p-4 border-t flex items-center justify-between"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-color)",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setIsCardPreviewOpen(false);
                  setIsMetadataMenuOpen(true);
                }}
                className="text-xs font-semibold underline flex items-center gap-1 text-[var(--accent-red)]"
              >
                <SlidersHorizontal className="w-3 h-3" /> Editar Metadados
              </button>

              <button
                type="button"
                onClick={() => setIsCardPreviewOpen(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold border hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
              >
                Fechar Prévia
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Author Picker Panel */}
      {isAuthorPanelOpen && (
        <AuthorPickerPanel
          currentAuthor={author}
          onSelect={(name) => setAuthor(name)}
          onClose={() => setIsAuthorPanelOpen(false)}
        />
      )}
    </div>
  );
}
