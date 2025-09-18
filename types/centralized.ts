// types/centralized.ts
// SINGLE SOURCE OF TRUTH for all Z-Beam types
// This file will replace all scattered type definitions

import { ReactNode } from 'react';

// ===============================
// CORE CONTENT TYPES
// ===============================

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
  
  // Badge configuration
  showBadge?: boolean;
  badge?: BadgeData;
  
  // Flexible additional fields
  [key: string]: unknown;
}

/**
 * Badge configuration
 */
export interface BadgeData {
  text?: string;
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: ComponentSize;
}

// ===============================
// COMPONENT TYPES
// ===============================

/**
 * Author component props
 */
export interface AuthorProps {
  author: AuthorInfo;
  showAvatar?: boolean;
  showCredentials?: boolean;
  showCountry?: boolean;
  showBio?: boolean;
  showEmail?: boolean;
  showLinkedIn?: boolean;
  showSpecialties?: boolean;
  className?: string;
}

/**
 * Layout component props
 */
export interface LayoutProps {
  components?: Record<string, ComponentData>;
  metadata?: ArticleMetadata;
  slug?: string;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

/**
 * Component data structure
 */
export interface ComponentData {
  content: string;
  config?: Record<string, unknown>;
}

// ===============================
// UI COMPONENT TYPES
// ===============================

export type ComponentVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'solid' | 'subtle';
export type ComponentSize = 'sm' | 'md' | 'lg' | 'xl';
export type BadgeVariant = 'outline' | 'subtle' | 'solid';
export type BadgeColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';

/**
 * Base interactive component props
 */
export interface BaseInteractiveProps {
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

/**
 * Base content component props
 */
export interface BaseContentProps {
  title: string;
  description: string;
  className?: string;
}

/**
 * Base image component props
 */
export interface BaseImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}

// ===============================
// PAGE & API TYPES
// ===============================

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
 * API response structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Search result item
 */
export interface SearchResultItem {
  id: string;
  slug: string;
  title: string;
  name?: string;
  description?: string;
  type: string;
  category?: string;
  tags?: string[];
  metadata?: ArticleMetadata;
  href: string;
  image?: string;
}

// ===============================
// MATERIAL & SCIENTIFIC TYPES
// ===============================

/**
 * Material properties
 */
export interface MaterialProperties {
  chemicalFormula?: string;
  materialType?: string;
  density?: string;
  meltingPoint?: string;
  thermalConductivity?: string;
  laserType?: string;
  wavelength?: string;
  fluenceRange?: string;
  [key: string]: string | number | undefined;
}

/**
 * Chemical composition
 */
export interface CompositionData {
  component: string;
  percentage: string;
  type: string;
  formula?: string;
}

// ===============================
// UTILITY TYPES
// ===============================

/**
 * Content item for lists and grids
 */
export interface ContentItem {
  id?: string;
  type?: string;
  slug?: string;
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  metadata?: ArticleMetadata;
}

/**
 * Breadcrumb navigation
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * Animation props
 */
export interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  amount?: 'some' | 'all' | number;
  once?: boolean;
  className?: string;
}

// ===============================
// LEGACY COMPATIBILITY
// ===============================

// Re-exports for backward compatibility
export type Metadata = ArticleMetadata;
export type Article = ContentItem & { metadata: ArticleMetadata };
export type Author = AuthorInfo;
export type Badge = BadgeData;

// Legacy type aliases
export type MaterialPost = ContentItem;
export type PageParams = { slug: string };
export type SearchParams = Record<string, string | string[] | undefined>;
