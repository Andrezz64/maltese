export interface AuthorLink {
  label: string;
  url: string;
}

export interface AuthorSocials {
  website?: string;
  github?: string;
  twitter?: string;
  bluesky?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  mastodon?: string;
  threads?: string;
  telegram?: string;
  whatsapp?: string;
  facebook?: string;
  substack?: string;
  medium?: string;
  devto?: string;
  reddit?: string;
}

export interface AuthorMeta {
  name: string;
  slug: string;
  role?: string;
  description?: string;
  avatar?: string;
  socials?: AuthorSocials;
  links?: AuthorLink[];
}

export interface Author extends AuthorMeta {
  bio: string; // corpo markdown abaixo do frontmatter
}
