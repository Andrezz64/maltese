---
title: "Introdução à Plataforma"
slug: "introducao"
order: 1
category: "Visão Geral"
summary: "Conheça o propósito, a arquitetura e os princípios fundamentais que regem o Caderno Maltese."
date: "2026-10-12"
---

O **Maltese** é uma plataforma editorial e literária estática de alto desempenho, projetada para a livre circulação de ideias, ensaios críticos, manifestos e reflexões independentes.

Diferente de sistemas de gerenciamento de conteúdo tradicionais (CMS) que dependem de bancos de dados pesados e servidores caros, o Maltese foi concebido com uma premissa clara: **soberania do autor e custo zero de infraestrutura.**

---

## Princípios Fundamentais

1. **Permanência & Soberania:** Todos os textos e páginas de documentação são armazenados como arquivos Markdown (`.md`) puros dentro do repositório Git. Você é dono dos seus dados.
2. **Custo Zero:** A aplicação roda 100% como site estático e pode ser hospedada gratuitamente em provedores modernos (Vercel, GitHub Pages, Cloudflare Pages, Netlify ou AWS S3).
3. **Privacidade Absoluta do Leitor:** Sem cookies invasivos de rastreamento, sem paywalls forçados e sem coleta de dados de terceiros.
4. **Colaboração Aberta:** O projeto é distribuído sob licença livre (*copyleft*), permitindo que qualquer pessoa ou coletivo faça um **Fork** do repositório para erguer sua própria publicação.

---

## Arquitetura de Conteúdo

O repositório é organizado de forma modular e transparente:

* **`content/posts/`**: Pasta destinada aos ensaios, artigos e manifestos exibidos no caderno principal e arquivo de textos.
* **`content/docs/`**: Pasta dedicada a toda a documentação técnica, manuais de usuário e guias da plataforma.
* **`site.config.ts`**: Arquivo central na raiz do projeto onde são definidas as configurações do site, autor, repositório Git e categorias.

---

## Próximos Passos

Para começar a explorar ou montar sua própria publicação, consulte o guia de [Primeiros Passos](/docs/primeiros-passos) ou veja como personalizar seu blog em [Configuração](/docs/configuracao).
