---
title: "Integração Nativa com o Git"
slug: "integracao-git"
order: 4
category: "Integrações"
summary: "Como configurar seu Personal Access Token (PAT) do GitHub para comitar posts diretamente pelo navegador sem risco de conflito."
date: "2026-10-12"
---

O Maltese dispõe de um módulo completo de integração com o GitHub REST API embutido diretamente no navegador. Isso permite que você e os membros da sua equipe redijam e publiquem posts diretamente para o repositório **sem tocar na linha de comando**.

---

## Como Gerar o Token de Acesso (PAT)

Para conectar o editor ao GitHub, você precisa gerar um token pessoal de acesso:

### Opção Recomendada: Fine-grained Token
1. Acesse: [github.com/settings/tokens?type=beta](https://github.com/settings/tokens?type=beta)
2. Clique em **Generate new token**.
3. Defina um nome descritivo (exemplo: `Maltese Editor Token`).
4. Em **Repository access**, marque **"Only select repositories"** e selecione o repositório da sua publicação.
5. Em **Permissions > Repository permissions**, encontre **`Contents`** e defina como **`Read and write`**.
6. Clique em **Generate token** e copie o token gerado (começado com `github_pat_`).

### Opção Clássica (Classic Token)
1. Acesse: [github.com/settings/tokens/new](https://github.com/settings/tokens/new)
2. Se o repositório for público, marque o escopo **`public_repo`**. Se for privado, marque **`repo`**.
3. Gere o token e copie o código (começado com `ghp_`).

---

## Conectando no Editor

1. Acesse a rota `/gerador` na sua aplicação.
2. No topo da barra de ferramentas, clique em **"Conectar Git"** (ou no indicador de branch).
3. Cole o seu token no campo indicado.
4. Clique em **"Testar Conexão"**. O sistema confirmará seu usuário e permissão de push.
5. Clique em **Salvar**. As credenciais são gravadas de forma segura e exclusiva no `localStorage` do seu navegador.

---

## Prevenção de Conflitos em Equipe

Quando múltiplos autores trabalham simultaneamente:

* Antes de cada commit, o editor consulta atômica e silenciosamente o hash **SHA** mais recente do arquivo na branch remota.
* Se o arquivo foi editado ou criado remotamente por outro autor, o sistema detecta e associa a revisão correta, prevenindo erros `409 Conflict`.
* Todos os commits gerados ficam registrados no histórico do GitHub com mensagem detalhada e identificação do autor.
