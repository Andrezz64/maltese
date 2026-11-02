---
title: "Primeiros Passos"
slug: "primeiros-passos"
order: 2
category: "Começando"
summary: "Como clonar o repositório, instalar dependências e executar o projeto no seu ambiente local."
date: "2026-10-12"
---

Este guia orienta como colocar o ambiente de desenvolvimento em funcionamento na sua máquina em poucos minutos.

---

## Pré-requisitos

Antes de iniciar, certifique-se de possuir em seu sistema:

* **Node.js** na versão 18.17 ou superior (recomendado Node 20 LTS).
* **Git** instalado e configurado no terminal.
* Um gerenciador de pacotes (`npm`, `pnpm` ou `yarn`).

---

## 1. Clonando o Repositório

Abra o terminal e execute:

```bash
git clone https://github.com/Andrezz64/maltese.git
cd maltese
```

Se você já criou um *Fork* no seu próprio perfil do GitHub, substitua a URL acima pela URL do seu fork:

```bash
git clone https://github.com/SEU_USUARIO/SEU_REPO.git
cd SEU_REPO
```

---

## 2. Instalando as Dependências

Na raiz do projeto, instale os pacotes:

```bash
npm install
```

---

## 3. Iniciando o Servidor de Desenvolvimento

Execute o comando de desenvolvimento:

```bash
npm run dev
```

Abra o navegador em [http://localhost:3000](http://localhost:3000). A aplicação estará em execução com recarregamento em tempo real (Fast Refresh).

---

## Estrutura de Pastas Principais

```text
├── content/
│   ├── posts/         # Ensaios e artigos em Markdown
│   └── docs/          # Manuais e documentações em Markdown
├── src/
│   ├── app/           # Rotas do Next.js App Router
│   ├── components/    # Componentes React reutilizáveis
│   └── lib/           # Utilitários de leitura de Markdown e Git API
├── site.config.ts     # Configuração central do site
└── package.json
```
