/**
 * GitHub REST API Client para integração direta com o repositório Git
 * Permite commit, leitura e gerenciamento de arquivos .md diretamente no GitHub
 */

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
}

export interface GitHubRepoInfo {
  full_name: string;
  default_branch: string;
  private: boolean;
  canPush: boolean;
}

export interface GitHubFileItem {
  name: string;
  path: string;
  sha: string;
  size: number;
  html_url: string;
  download_url?: string;
}

export interface CommitResult {
  success: boolean;
  commitSha: string;
  commitUrl: string;
  contentSha: string;
  fileUrl: string;
}

// Codificação segura UTF-8 para Base64 (suporta acentos, cedilhas, emojis)
export function utf8ToBase64(str: string): string {
  if (typeof window === "undefined" && typeof Buffer !== "undefined") {
    return Buffer.from(str, "utf8").toString("base64");
  }
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Decodificação segura Base64 para UTF-8
export function base64ToUtf8(b64: string): string {
  const cleanB64 = b64.replace(/\s/g, "");
  if (typeof window === "undefined" && typeof Buffer !== "undefined") {
    return Buffer.from(cleanB64, "base64").toString("utf8");
  }
  const binary = atob(cleanB64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Valida o token e testa o acesso ao repositório
 */
export async function testGitHubConnection(
  token: string,
  owner: string,
  repo: string
): Promise<{
  valid: boolean;
  user?: GitHubUser;
  repoInfo?: GitHubRepoInfo;
  error?: string;
}> {
  if (!token.trim()) {
    return { valid: false, error: "Token de acesso do GitHub não informado." };
  }
  if (!owner.trim() || !repo.trim()) {
    return { valid: false, error: "Proprietário ou nome do repositório não informado." };
  }

  const cleanToken = token.trim();
  const headers = {
    Authorization: `Bearer ${cleanToken}`,
    Accept: "application/vnd.github.v3+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  try {
    // 1. Verificar usuário autenticado
    const userRes = await fetch("https://api.github.com/user", { headers });
    if (!userRes.ok) {
      if (userRes.status === 401) {
        return { valid: false, error: "Token do GitHub inválido ou expirado." };
      }
      return { valid: false, error: `Erro na autenticação do GitHub (HTTP ${userRes.status})` };
    }
    const userData = await userRes.json();

    // 2. Verificar acesso ao repositório
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) {
      if (repoRes.status === 404) {
        return {
          valid: false,
          error: `Repositório "${owner}/${repo}" não foi encontrado ou seu token não tem permissão de leitura nele.`,
        };
      }
      return { valid: false, error: `Erro ao consultar repositório (HTTP ${repoRes.status})` };
    }
    const repoData = await repoRes.json();

    const canPush = Boolean(repoData.permissions?.push);

    return {
      valid: true,
      user: {
        login: userData.login,
        name: userData.name,
        avatar_url: userData.avatar_url,
        html_url: userData.html_url,
      },
      repoInfo: {
        full_name: repoData.full_name,
        default_branch: repoData.default_branch,
        private: repoData.private,
        canPush,
      },
      ...(!canPush
        ? { error: "Aviso: Seu token tem acesso de leitura, mas NÃO tem permissão de push (escrita) neste repositório." }
        : {}),
    };
  } catch (err: any) {
    return { valid: false, error: err?.message || "Falha de conexão com a API do GitHub." };
  }
}

/**
 * Consulta se o arquivo já existe no repositório e obtém seu SHA e conteúdo mais recente
 */
export async function getRepoFileContent(
  token: string,
  owner: string,
  repo: string,
  branch: string,
  filePath: string
): Promise<{
  exists: boolean;
  sha?: string;
  content?: string;
  htmlUrl?: string;
  error?: string;
}> {
  const headers = {
    Authorization: `Bearer ${token.trim()}`,
    Accept: "application/vnd.github.v3+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
    const res = await fetch(url, { headers });

    if (res.status === 404) {
      return { exists: false };
    }

    if (!res.ok) {
      return { exists: false, error: `Erro ao buscar arquivo (HTTP ${res.status})` };
    }

    const data = await res.json();
    if (data.type !== "file") {
      return { exists: false, error: "O caminho especificado não é um arquivo." };
    }

    const decodedContent = data.content ? base64ToUtf8(data.content) : "";

    return {
      exists: true,
      sha: data.sha,
      content: decodedContent,
      htmlUrl: data.html_url,
    };
  } catch (err: any) {
    return { exists: false, error: err?.message || "Erro ao consultar arquivo remoto." };
  }
}

/**
 * Lista os arquivos markdown de um diretório na branch do repositório
 */
export async function listRepoFiles(
  token: string,
  owner: string,
  repo: string,
  branch: string,
  dirPath: string
): Promise<{
  files: GitHubFileItem[];
  error?: string;
}> {
  const headers = {
    Authorization: `Bearer ${token.trim()}`,
    Accept: "application/vnd.github.v3+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${dirPath}?ref=${branch}`;
    const res = await fetch(url, { headers });

    if (res.status === 404) {
      return { files: [], error: `A pasta "${dirPath}" não foi encontrada no repositório.` };
    }

    if (!res.ok) {
      return { files: [], error: `Erro ao listar pasta (HTTP ${res.status})` };
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
      return { files: [] };
    }

    const mdFiles: GitHubFileItem[] = data
      .filter((item: any) => item.type === "file" && (item.name.endsWith(".md") || item.name.endsWith(".mdx")))
      .map((item: any) => ({
        name: item.name,
        path: item.path,
        sha: item.sha,
        size: item.size,
        html_url: item.html_url,
        download_url: item.download_url,
      }));

    return { files: mdFiles };
  } catch (err: any) {
    return { files: [], error: err?.message || "Erro ao listar arquivos do repositório." };
  }
}

/**
 * Cria ou atualiza um arquivo no repositório realizando um commit via GitHub API
 */
export async function commitFileToGitHub(params: {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  path: string;
  content: string;
  message: string;
  sha?: string | null;
}): Promise<CommitResult> {
  const { token, owner, repo, branch, path, content, message } = params;

  // Se o SHA não foi fornecido, verifica se o arquivo já existe para evitar erro 422
  let targetSha = params.sha;
  if (!targetSha) {
    const existing = await getRepoFileContent(token, owner, repo, branch, path);
    if (existing.exists && existing.sha) {
      targetSha = existing.sha;
    }
  }

  const payload: Record<string, any> = {
    message,
    content: utf8ToBase64(content),
    branch,
  };

  if (targetSha) {
    payload.sha = targetSha;
  }

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token.trim()}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    if (res.status === 409) {
      throw new Error(
        "Conflito de versão no Git (409 Conflict): O arquivo foi alterado remotamente no repositório. Atualize o arquivo antes de commitar para não perder trabalho alheio."
      );
    }
    throw new Error(errBody.message || `Erro ao commitar no GitHub (HTTP ${res.status})`);
  }

  const data = await res.json();

  return {
    success: true,
    commitSha: data.commit?.sha || "",
    commitUrl: data.commit?.html_url || "",
    contentSha: data.content?.sha || "",
    fileUrl: data.content?.html_url || "",
  };
}

/**
 * Exclui um arquivo do repositório realizando um commit de deleção via GitHub API
 */
export async function deleteFileFromGitHub(params: {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  path: string;
  sha: string;
  message: string;
}): Promise<{ success: boolean; commitUrl?: string }> {
  const { token, owner, repo, branch, path, sha, message } = params;

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token.trim()}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      message,
      sha,
      branch,
    }),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || `Erro ao deletar arquivo no GitHub (HTTP ${res.status})`);
  }

  const data = await res.json();
  return { success: true, commitUrl: data.commit?.html_url };
}
