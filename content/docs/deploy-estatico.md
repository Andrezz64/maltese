---
title: "Deploy & Hospedagem Gratuita"
slug: "deploy-estatico"
order: 5
category: "Publicação"
summary: "Instruções passo a passo para colocar sua publicação no ar gratuitamente na Vercel, Cloudflare Pages ou Netlify."
date: "2026-10-12"
---

Uma das maiores vantagens da arquitetura estática é a possibilidade de hospedar seu site de forma profissional com alta velocidade global e **custo zero permanente**.

---

## 1. Deploy na Vercel (Recomendado)

A Vercel é a criadora do Next.js e oferece a melhor integração para este projeto:

1. Acesse [vercel.com](https://vercel.com) e conecte sua conta do GitHub.
2. Clique em **"Add New..."** ➔ **"Project"**.
3. Importe o repositório do seu blog.
4. O framework Next.js será detectado automaticamente.
5. Clique em **"Deploy"**.
6. Em menos de 2 minutos seu site estará no ar com HTTPS automático e CDN global. A cada novo commit que você fizer pelo editor web, um novo deploy é disparado automaticamente.

---

## 2. Deploy no Cloudflare Pages

1. Acesse o painel da [Cloudflare](https://dash.cloudflare.com) ➔ **Compute (Workers & Pages)** ➔ **Pages**.
2. Conecte com o GitHub e selecione seu repositório.
3. Configure o comando de build:
   * **Build command:** `npx @cloudflare/next-on-pages` ou `npm run build`
   * **Build output directory:** `.vercel/output/static` ou `.next`
4. Clique em **Save and Deploy**.

---

## 3. Deploy no Netlify

1. Acesse [netlify.com](https://www.netlify.com) e clique em **"Import from Git"**.
2. Selecione o repositório.
3. O Netlify configurará automaticamente o Next.js Runtime.
4. Clique em **"Deploy Site"**.

---

## Domínio Próprio

Em qualquer uma das plataformas acima, você pode conectar seu domínio próprio (ex: `www.seucaderno.com.br`) gratuitamente na aba **Domains / Custom Domains** com certificado SSL automático da Let's Encrypt.
