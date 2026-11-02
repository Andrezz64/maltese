export interface PostMeta {
  title: string;
  slug: string;
  date: string;
  summary: string;
  category: string;
  tags: string[];
  readingTime?: string;
  featured?: boolean;
  epigraph?: string;
  author?: string;
  coverImage?: string; // URL externa da imagem de capa
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface Post extends PostMeta {
  content: string;
  htmlContent: string;
  toc?: TocItem[];
}
