---
title: "Guia do Editor de Textos"
slug: "editor-markdown"
order: 6
category: "Editor"
summary: "Recursos do editor web integrado: modo tela cheia, painel de metadados, prévia de cards e salvamento offline contínuo."
date: "2026-10-12"
---

A rota `/gerador` disponibiliza uma bancada completa de escrita e pré-visualização desenvolvida para focar na produção do conteúdo.

---

## Principais Funcionalidades

### 1. Modos de Exibição
Você pode alternar rapidamente entre três modos de trabalho:
* **Dividido (Split):** Exibe o editor de texto à esquerda e o preview renderizado ao vivo à direita.
* **Editor:** Maximiza a área de digitação de texto com contagem de palavras e caracteres.
* **Preview:** Exibe o texto renderizado ou o código Markdown completo com frontmatter.

### 2. Modo Tela Cheia
O botão **"Tela Cheia"** expande a bancada para ocupar toda a largura e altura da janela acima do cabeçalho, proporcionando um ambiente livre de distrações. Pressione `ESC` ou clique em **Restaurar** para voltar ao layout padrão.

### 3. Painel de Metadados
Ao clicar em **"Metadados"**, você pode ajustar:
* Título do texto e nome do arquivo (slug gerado automaticamente);
* Data de publicação e tempo estimado de leitura;
* Categoria e tags temáticas;
* Resumo para cards e mecanismos de busca;
* Epígrafe ou citação introdutória com autor;
* Marcador de destaque na página inicial.

### 4. Prévia do Card
O botão **"Card"** abre uma janela de simulação visual mostrando exatamente como o texto aparecerá no feed da página inicial e na listagem geral do caderno, tanto no formato padrão quanto no formato de destaque com fita carmesim.

### 5. Salvamento Offline & Rascunhos Locais
O editor realiza salvamento automático contínuo no `localStorage` do seu navegador. Mesmo se você fechar a janela acidentalmente ou ficar sem sinal de internet, seu rascunho permanecerá preservado. No menu **"Selecionar Arquivo"**, você pode salvar e gerenciar múltiplos rascunhos locais independentes.
