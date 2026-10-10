export interface PostMeta {
  title: string;
  slug: string;
  date: string;
  summary: string;
  category: string;
  tags: string[];
  readingTime?: string;
  featured?: boolean;
  epigraph?: string; // Epígrafe ou citação inicial
  author?: string;
}

export interface Post extends PostMeta {
  content: string;
  htmlContent: string;
}
