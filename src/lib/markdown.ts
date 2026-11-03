import { Marked } from "marked";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove pontuação e caracteres especiais
    .replace(/[\s_-]+/g, "-") // Normaliza espaços e underscores em hífen
    .replace(/^-+|-+$/g, ""); // Remove hifens nas extremidades
}

/**
 * Converte Markdown para HTML e extrai o sumário (TOC) com os títulos H1, H2 e H3.
 * Adiciona atributos `id` únicos para navegação por âncora.
 */
export async function renderMarkdownWithToc(markdown: string): Promise<{ html: string; toc: TocItem[] }> {
  const toc: TocItem[] = [];
  const slugCounts = new Map<string, number>();

  const markedInstance = new Marked({
    gfm: true,
    breaks: true,
    renderer: {
      heading(token) {
        // Renderiza o HTML interno do título preservando ênfase/itálico etc.
        const innerHtml = token.tokens ? this.parser.parseInline(token.tokens) : token.text;
        
        // Remove tags HTML e markdown para texto limpo no sumário
        const plainText = token.text
          .replace(/<[^>]*>/g, "")
          .replace(/[*_~`]/g, "")
          .trim();

        const baseSlug = slugify(plainText) || "secao";
        const count = slugCounts.get(baseSlug) || 0;
        slugCounts.set(baseSlug, count + 1);
        const id = count === 0 ? baseSlug : `${baseSlug}-${count}`;

        // Apenas H1, H2 e H3 entram no sumário lateral
        if (token.depth >= 1 && token.depth <= 3) {
          toc.push({
            id,
            text: plainText,
            level: token.depth,
          });
        }

        return `<h${token.depth} id="${id}">${innerHtml}</h${token.depth}>\n`;
      },
    },
  });

  const html = await markedInstance.parse(markdown);
  return { html, toc };
}
