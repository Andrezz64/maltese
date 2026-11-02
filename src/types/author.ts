export interface AuthorLink {
  label: string;
  url: string;
}

export interface AuthorSocials {
  website?: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  mastodon?: string;
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
