// types/core/article.ts
// Consolidated article and content types

import { BadgeData } from './badge';
import { AuthorData } from '../components/author';

/**
 * Core article metadata structure
 * Standardized across all content types
 */
export interface ArticleMetadata {
  /** Primary identifier/title */
  subject?: string;
  
  /** Article title (alternative to subject) */
  title?: string;
  
  /** Headline for display */
  headline?: string;
  
  /** Article description */
  description?: string;
  
  /** Content category */
  category?: string;
  
  /** Article type classification */
  articleType?: string;
  
  /** Article type (alternative naming) */
  article_type?: string;
  
  /** Keywords for SEO */
  keywords?: string[];
  
  /** Content tags */
  tags?: string[];
  
  /** Publication date */
  date?: string;
  
  /** Publication date (alternative naming) */
  datePublished?: string;
  
  /** Last modified date */
  dateModified?: string;
  
  /** Author information */
  author?: string | AuthorData;
  
  /** Main image */
  image?: string;
  
  /** Thumbnail image */
  thumbnail?: string;
  
  /** OpenGraph image */
  ogImage?: string;
  
  /** Canonical URL */
  canonical?: string;
  
  /** Chemical symbol for materials */
  chemicalSymbol?: string;
  
  /** Chemical formula for materials */
  chemicalFormula?: string;
  
  /** Atomic number for elements */
  atomicNumber?: number;
  
  /** Material properties */
  properties?: MaterialProperties;
  
  /** Chemical composition */
  composition?: CompositionData[];
  
  /** Badge configuration */
  badge?: BadgeData;
  
  /** Whether to show badge */
  showBadge?: boolean;
  
  /** Comment metadata (legacy) */
  commentMetadata?: Record<string, unknown>;
  
  /** Flexible additional fields */
  [key: string]: unknown;
}

/**
 * Frontmatter structure for markdown files
 * Mirrors ArticleMetadata but ensures string types where needed
 */
export interface ArticleFrontmatter {
  /** Primary identifier/title */
  subject?: string;
  
  /** Article title */
  title?: string;
  
  /** Name field */
  name?: string;
  
  /** Headline for display */
  headline?: string;
  
  /** Article description */
  description?: string;
  
  /** Content category */
  category?: string;
  
  /** Article type classification */
  articleType?: string;
  
  /** Article type (alternative naming) */
  article_type?: string;
  
  /** Keywords for SEO */
  keywords?: string[];
  
  /** Content tags */
  tags?: string[];
  
  /** Publication date */
  date?: string;
  
  /** Author information */
  author?: string;
  
  /** Main image */
  image?: string;
  
  /** Thumbnail image */
  thumbnail?: string;
  
  /** Whether to show badge */
  showBadge?: boolean;
  
  /** Slug */
  slug?: string;
  
  /** Badge configuration */
  badge?: {
    text?: string;
    variant?: string;
    color?: string;
  };
  
  /** Chemical properties */
  chemicalProperties?: {
    symbol?: string;
    formula?: string;
    materialType?: string;
    atomicNumber?: number | string;
  };
  
  /** Flexible additional fields */
  [key: string]: unknown;
}

/**
 * Material properties structure
 */
export interface MaterialProperties {
  /** Chemical formula */
  chemicalFormula?: string;
  
  /** Material type */
  materialType?: string;
  
  /** Density */
  density?: string;
  
  /** Melting point */
  meltingPoint?: string;
  
  /** Thermal conductivity */
  thermalConductivity?: string;
  
  /** Laser type compatibility */
  laserType?: string;
  
  /** Wavelength specifications */
  wavelength?: string;
  
  /** Fluence range */
  fluenceRange?: string;
  
  /** Additional properties */
  [key: string]: string | number | undefined;
}

/**
 * Chemical composition data
 */
export interface CompositionData {
  /** Component name */
  component: string;
  
  /** Percentage */
  percentage: string;
  
  /** Component type */
  type: string;
  
  /** Chemical formula */
  formula?: string;
}

/**
 * Article structure
 */
export interface Article {
  /** Article metadata */
  metadata?: ArticleMetadata;
  
  /** Parsed components */
  components?: Record<string, unknown> | null;
  
  /** Raw content */
  content?: string;
  
  /** Article slug */
  slug?: string;
  
  /** Legacy compatibility fields */
  id?: string;
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
  badge?: BadgeData;
  name?: string;
  frontmatter?: ArticleFrontmatter;
  date?: string;
  author?: string;
  excerpt?: string;
  headline?: string;
  website?: string;
}

/**
 * Page properties for Next.js pages
 */
export interface PageProps {
  /** URL parameters */
  params: { [key: string]: string | string[] | undefined };
  
  /** Search parameters */
  searchParams: { [key: string]: string | string[] | undefined };
}

/**
 * Dynamic page properties
 */
export interface DynamicPageProps {
  /** Dynamic route parameters */
  params: { slug: string };
  
  /** Optional search parameters */
  searchParams?: { [key: string]: string | string[] | undefined };
}

/**
 * Static page properties  
 */
export interface StaticPageProps {
  /** Static parameters */
  params: { slug: string };
}

/**
 * Search result item
 */
export interface SearchResultItem {
  /** Unique identifier */
  id: string;
  
  /** Content slug */
  slug: string;
  
  /** Display title */
  title: string;
  
  /** Display name */
  name?: string;
  
  /** Description */
  description?: string;
  
  /** Content type */
  type: string;
  
  /** Category */
  category?: string;
  
  /** Article type */
  articleType?: string;
  
  /** Tags */
  tags?: string[];
  
  /** Associated metadata */
  metadata?: ArticleMetadata;
  
  /** Frontmatter data */
  frontmatter?: Record<string, unknown>;
  
  /** Badge data */
  badge?: BadgeData;
  
  /** Image URL */
  image?: string;
  
  /** Image alt text */
  imageAlt?: string;
  
  /** Link href */
  href: string;
}

/**
 * Search-ready article with guaranteed required fields
 * Used in search results, grids, and display components that need tags and href
 */
export interface SearchableArticle extends Article {
  /** Tags array (required for search/filtering) */
  tags: string[];
  
  /** Href is required for navigation */
  href: string;
  
  /** Normalized tags for search optimization */
  normalizedTags?: string[];
}
