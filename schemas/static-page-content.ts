/**
 * Schema definitions for static page content structure
 * Defines the normalized format used by loadStaticPageContent()
 */

export interface StaticPageContentItem {
  title: string;
  description: string;
}

export interface ContentCardItem extends StaticPageContentItem {
  icon?: string;
  image?: string;
  link?: string;
  category?: string;
  tags?: string[];
}

export interface StaticPageConfig {
  /** Page title for SEO and display */
  title: string;
  /** Page description for SEO meta tag */
  description: string;
  /** Parsed content cards from markdown */
  contentCards: ContentCardItem[];
  /** Additional markdown content (only in enhanced mode) */
  markdownContent?: Record<string, string>;
}

export interface StaticPageFrontmatter {
  title: string;
  description: string;
}

export interface MarkdownContentProps {
  /** Raw markdown content to render */
  content: string;
  /** Optional title heading */
  title?: string;
  /** Optional CSS classes */
  className?: string;
  /** Optional additional children */
  children?: React.ReactNode;
}

/**
 * Schema validation for static page content structure
 */
export const StaticPageSchema = {
  properties: {
    title: {
      type: 'string',
      minLength: 1,
      description: 'Page title for SEO and display'
    },
    description: {
      type: 'string',
      minLength: 1,
      description: 'Page description for SEO meta tag'
    },
    contentCards: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            minLength: 1
          },
          description: {
            type: 'string',
            minLength: 1
          },
          icon: {
            type: 'string',
            optional: true
          },
          image: {
            type: 'string',
            optional: true
          },
          link: {
            type: 'string',
            optional: true
          },
          category: {
            type: 'string',
            optional: true
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            optional: true
          }
        },
        required: ['title', 'description']
      }
    },
    markdownContent: {
      type: 'object',
      optional: true,
      description: 'Additional markdown content (enhanced mode only)'
    }
  },
  required: ['title', 'description', 'contentCards']
} as const;

/**
 * Type guard to validate static page config structure
 */
export function isValidStaticPageConfig(obj: any): obj is StaticPageConfig {
  return (
    typeof obj === 'object' &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    Array.isArray(obj.contentCards) &&
    obj.contentCards.every((card: any) =>
      typeof card === 'object' &&
      typeof card.title === 'string' &&
      typeof card.description === 'string'
    )
  );
}

/**
 * Static page directory names that use the centralized loader
 */
export const STATIC_PAGE_DIRECTORIES = [
  'contact',
  'rental', 
  'partners',
  'equipment',
  'operations',
  'schedule', 
  'services',
  'safety',
  'about',
  'netalux'
] as const;

export type StaticPageDirectory = typeof STATIC_PAGE_DIRECTORIES[number];

/**
 * Enhanced static page directories that support additional markdown files
 */
export const ENHANCED_STATIC_PAGES = [
] as const;

export type EnhancedStaticPageDirectory = typeof ENHANCED_STATIC_PAGES[number];

/**
 * Content.md frontmatter schema
 */
export const ContentMarkdownSchema = {
  properties: {
    title: {
      type: 'string',
      minLength: 1,
      description: 'Page title'
    },
    description: {
      type: 'string', 
      minLength: 1,
      description: 'Page description for SEO'
    }
  },
  required: ['title', 'description']
} as const;