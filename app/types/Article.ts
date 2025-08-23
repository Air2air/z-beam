export interface ArticleFrontmatter {
  title?: string;
  name?: string;
  description?: string;
  category?: string;
  subject?: string;
  article_type?: string;
  articleType?: string;
  keywords?: string[];
  tags?: string[];
  // Use specific types instead of any
  date?: string;
  author?: string;
  image?: string;
  thumbnail?: string;
  showBadge?: boolean;
  slug?: string; // Add slug property
  badge?: {
    text?: string;
    variant?: string;
    color?: string;
  };
  // Chemical properties object for materials
  chemicalProperties?: {
    symbol?: string;
    formula?: string;
    materialType?: string;
    atomicNumber?: number | string;
  };
}

export interface ArticleMetadata {
  keywords?: string[];
  category?: string;
  articleType?: string;
  subject?: string;
  // Use specific types instead of any
  date?: string;
  author?: string;
  title?: string;
  description?: string;
  image?: string;
  thumbnail?: string;
}

export interface Article {
  id?: string;
  slug?: string;
  path?: string;
  filepath?: string;
  title?: string;
  description?: string;
  tags?: string[];
  category?: string;
  href?: string;
  image?: string;
  imageAlt?: string;
  showBadge?: boolean;
  badge?: {
    text?: string;
    variant?: string;
    color?: string;
  };
  name?: string;
  frontmatter?: ArticleFrontmatter;
  metadata?: ArticleMetadata;
  // Additional specific properties
  date?: string;
  author?: string;
  content?: string;
  excerpt?: string;
}

export interface EnrichedArticle extends Article {
  tags: string[]; // Make tags required and non-undefined
  href: string;   // Make href required and non-undefined
  normalizedTags?: string[]; // Optional normalized tags array for search component
}