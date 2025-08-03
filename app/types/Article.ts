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
  [key: string]: any;
}

export interface ArticleMetadata {
  keywords?: string[];
  category?: string;
  articleType?: string;
  subject?: string;
  [key: string]: any;
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
  badge?: any;
  name?: string;
  frontmatter?: ArticleFrontmatter;
  metadata?: ArticleMetadata;
  [key: string]: any;
}

export interface EnrichedArticle extends Article {
  tags: string[]; // Make tags required and non-undefined
  href: string;   // Make href required and non-undefined
  normalizedTags?: string[]; // Optional normalized tags array for search component
}