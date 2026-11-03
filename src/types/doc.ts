export interface DocMeta {
  title: string;
  slug: string;
  order: number;
  category: string;
  summary: string;
  date?: string;
  readingTime?: string;
}

export interface Doc extends DocMeta {
  content: string;
  htmlContent: string;
}

export interface DocCategoryGroup {
  category: string;
  docs: DocMeta[];
}
