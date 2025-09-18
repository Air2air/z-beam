// types/families/PageTypes.ts
// Page-related interfaces and metadata types

/**
 * Author information structure - single source of truth
 * Standardized field names to eliminate redundancy
 */
export interface AuthorInfo {
  id?: number;              // Optional ID for YAML references
  name: string;             // Standardized: was author_name/name
  title?: string;           // Standardized: was credentials/title
  expertise?: string;       // Standardized: was specialties[0]/expertise
  country?: string;         // Standardized: was author_country/country
  sex?: 'f' | 'm' | 'other';// Gender for profile completeness
  image?: string;           // Standardized: was avatar/image
  bio?: string;            // Author biography
  email?: string;          // Contact email
  linkedin?: string;       // LinkedIn profile URL
  profile?: {
    description?: string;
    expertiseAreas?: string[];
    contactNote?: string;
  };
}

/**
 * Next.js page props (with async params)
 */
export interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Tag page props (with async params)
 */
export interface TagPageProps {
  params: Promise<{ tag: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Property page props (with async params)
 */
export interface PropertyPageProps {
  params: Promise<{ property: string; value: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Generic page parameters
 */
export type PageParams = Record<string, string | string[]>;

/**
 * Search parameters
 */
export type SearchParams = Record<string, string | string[] | undefined>;

/**
 * Layout component props
 */
export interface LayoutProps {
  children: React.ReactNode;
  params?: PageParams;
  metadata?: ArticleMetadata;
}

/**
 * Article metadata structure (centralized)
 */
export interface ArticleMetadata {
  // Core fields
  title?: string;
  description?: string;
  image?: string;
  thumbnail?: string;
  category?: string;
  tags?: string[];
  keywords?: string[];
  
  // Author information
  author?: string | AuthorInfo;
  authorInfo?: AuthorInfo; // YAML author data
  
  // Dates
  date?: string;
  datePublished?: string;
  dateModified?: string;
  
  // Technical metadata
  articleType?: string;
  slug?: string;
  canonical?: string;
  ogImage?: string;
  
  // Material-specific
  chemicalSymbol?: string;
  chemicalFormula?: string;
  atomicNumber?: number;
  materialType?: string;
  
  // Content metadata
  wordCount?: number;
  readingTime?: number;
  
  // SEO metadata  
  metaTitle?: string;
  metaDescription?: string;
  socialImage?: string;
}
