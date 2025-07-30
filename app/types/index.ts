// app/types/index.ts
// Shared TypeScript interfaces for the Z-Beam website

// Re-export all content types
export * from './content';

// Legacy export for backwards compatibility
export type { ArticleMetadata as Metadata, ArticlePost as MaterialPost } from './content';

// Base props for all interactive elements
export interface BaseInteractiveProps {
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

// Base props for components that display content
export interface BaseContentProps {
  title: string;
  description: string;
  className?: string;
}

// Base props for components that display images
export interface BaseImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}

// Base props for link components
export interface BaseLinkProps {
  href: string;
  target?: '_blank' | '_self';
  rel?: string;
}

// Base props for card components
export interface BaseCardProps extends BaseContentProps, BaseLinkProps {
  imageUrl: string;
  imageAlt: string;
  date?: string;
  tags?: string[];
}

// Extended card props for material-specific data
export interface MaterialCardProps extends BaseCardProps {
  nameShort?: string;
  atomicNumber?: number | null;
  chemicalSymbol?: string | null;
  materialType?: string;
  metalClass?: string;
  crystalStructure?: string;
  primaryApplication?: string;
}

// Hero image component props
export interface HeroImageProps extends BaseImageProps {
  imageCaption?: string;
  materialName?: string;
  primaryApplication?: string;
}

// Badge component props
export interface BadgeProps extends BaseInteractiveProps {
  text: string;
  variant?: ComponentVariant;
  size?: ComponentSize;
  bgColorClass?: string;
  textColorClass?: string;
}

// Animation component props
export interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  amount?: 'some' | 'all' | number;
  once?: boolean;
  className?: string;
}

// Navigation and layout props
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

// Page props interfaces (for Next.js 15 with async params)
export interface PageParams {
  slug?: string;
  [key: string]: string | undefined;
}

export interface PageProps {
  params: Promise<PageParams>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

// Utility type for component variants
export type ComponentVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ComponentSize = 'sm' | 'md' | 'lg' | 'xl';

// JSON-LD Schema interfaces
export interface JsonLdProps {
  data: Record<string, any>;
}

export interface PersonSchema {
  name: string;
  jobTitle?: string;
  url?: string;
  sameAs?: string[];
  image?: string;
  description?: string;
}

export interface ListingSchema {
  headline: string;
  name: string;
  description: string;
  url: string;
  image?: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
}

// MDX component interfaces
export interface TableProps {
  data: {
    headers: string[];
    rows: string[][];
  };
}

// Re-export constants from utils (avoid duplication)
export type { ANIMATION_CONFIG, COMPONENT_DEFAULTS, BREAKPOINTS, SITE_CONFIG } from '../utils/constants';
