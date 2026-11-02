---
title: "Configuração do Site"
slug: "configuracao"
order: 3
category: "Configuração"
summary: "Como personalizar as informações do blog, metadados de SEO, categorias editoriais e parâmetros do Git no site.config.ts."
date: "2026-10-12"
---

O arquivo `site.config.ts`, localizado na raiz do projeto, centraliza todas as configurações que você ou quem fizer fork do projeto podem desejar personalizar.

---

## Estrutura do Arquivo

```ts
import { SiteConfig } from "@/types/config";

export const siteConfig: SiteConfig = {
  // Dados de identidade e apresentação
  title: "Maltese",
  tagline: "Caderno de Escritos, Crítica & Liberdade",
  description: "Página autoral e coletiva dedicada a ensaios, manifestos e pensamento crítico...",
  author: "Maltese",
  url: "https://www.maltese.app.br",
  language: "pt-BR",

  // Parâmetros de sincronização com o Git
  git: {
    enabled: true,
    provider: "github",
    owner: "Andrezz64",
    repo: "maltese",
    branch: "main",
    postsPath: "content/posts",
    docsPath: "content/docs",
  },

  // Taxonomia editorial do blog
  editorial: {
    defaultCategory: "Manifestos",
    categories: [
      "Manifestos",
      "Ensaios",
      "Crítica Social",
      "Poesia & Fragmentos",
      "Filosofia & Teoria",
      "Crônicas & Memória",
    ],
    defaultAuthor: "Maltese",
    wordsPerMinute: 200,
  },
};

export default siteConfig;
```

---

## Detalhamento das Propriedades

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `title` | `string` | Nome principal da publicação exibido no cabeçalho e títulos de aba. |
| `tagline` | `string` | Subtítulo ou lema da publicação. |
| `description` | `string` | Texto para meta tags de SEO e apresentação no rodapé. |
| `author` | `string` | Nome padrão do autor ou coletivo responsável. |
| `url` | `string` | Domínio canônico de produção (utilizado para Open Graph e RSS). |
| `git.enabled` | `boolean` | Ativa a integração nativa com o GitHub no editor web. |
| `git.owner` | `string` | Usuário ou organização dona do repositório no GitHub. |
| `git.repo` | `string` | Nome do repositório no GitHub. |
| `git.branch` | `string` | Branch de trabalho para envio de commits (padrão: `main`). |
| `git.postsPath` | `string` | Caminho relativo da pasta de artigos (padrão: `content/posts`). |
| `git.docsPath` | `string` | Caminho relativo da pasta de documentação (padrão: `content/docs`). |
| `editorial.categories` | `string[]` | Lista de categorias sugeridas no formulário do editor. |
