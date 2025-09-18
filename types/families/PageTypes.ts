// types/families/PageTypes.ts
// Page-related interfaces and metadata types

// Import AuthorInfo and ArticleMetadata from centralized source to avoid duplication
import type { AuthorInfo, ArticleMetadata } from '../centralized';

// Re-export for convenience
export type { AuthorInfo, ArticleMetadata };

/**
 * Next.js page props (with async params)
 */
// Import PageProps and TagPageProps from centralized types
import type { PageProps, TagPageProps } from '../centralized';

// Re-export for organized import paths
export type { PageProps, TagPageProps };

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

