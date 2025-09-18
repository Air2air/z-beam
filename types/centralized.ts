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
  id?: string | number; // Support both string and number IDs
  slug?: string; // Added from AuthorMetadata for routing
  name: string;
  title?: string;
  expertise?: string | string[]; // Support both string and array formats
  specialties?: string[]; // Added from AuthorMetadata
  country?: string;
  image?: string;
  bio?: string;
  email?: string;
  linkedin?: string;
  publishedArticles?: string[] | number; // Support both article list and count
  education?: string[]; // Added from AuthorMetadata
  articleType?: "author"; // Added from AuthorMetadata
  profile?: {
    description?: string;
    expertiseAreas?: string[];
    contactNote?: string;
  };
}

/**
 * Article metadata (base for all content types)
 */
export interface ArticleMetadata {
  id?: string;
  title: string;
  description?: string;
  slug: string;
  category?: string;
  tags?: string[];
  authorInfo?: AuthorInfo;
  lastModified?: string;
  datePublished?: string;
  image?: string;
  excerpt?: string;
  keywords?: string[];
  materialProperties?: MaterialProperties;
  composition?: CompositionData[];
  relatedArticles?: string[];
  references?: string[];
  targetAudience?: string;
  articleType?: string;
}

// ===============================
// SPECIALIZED METADATA TYPES
// ===============================

/**
 * Material-specific metadata
 */
export interface MaterialMetadata extends ArticleMetadata {
  articleType: "material";
  nameShort: string;
  atomicNumber?: number;
  chemicalSymbol?: string;
  materialType: string;
  metalClass: string;
  crystalStructure: string;
  primaryApplication: string;
  density?: number;
  meltingPoint?: number;
  thermalConductivity?: number;
  electricalConductivity?: number;
  corrosionResistance?: string;
}

/**
 * Application-specific metadata
 */
export interface ApplicationMetadata extends ArticleMetadata {
  articleType: "application";
  industry: string;
  applicationCategory: string;
  targetMaterials: string[];
  processingParameters?: {
    laserPower?: number | string;
    scanSpeed?: number | string;
    wavelength?: number | string;
    pulseFrequency?: number | string;
    spotSize?: number | string;
  };
  regulatoryStandards?: string[];
  safetyConsiderations?: string[];
}

/**
 * Region-specific metadata
 */
export interface RegionMetadata extends ArticleMetadata {
  articleType: "region";
  regionName: string;
  countryCode?: string;
  continent?: string;
  localStandards?: string[];
  regulatoryBody?: string;
  marketSize?: string;
  keyIndustries?: string[];
  localPartners?: string[];
}

/**
 * Thesaurus-specific metadata
 */
export interface ThesaurusMetadata extends ArticleMetadata {
  articleType: "thesaurus";
  term: string;
  definition: string;
  relatedTerms?: string[];
  category?: string; // e.g., "Laser Technology", "Materials", "Process Parameters"
  abbreviation?: string;
  technicalLevel?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

/**
 * Badge configuration - unified comprehensive interface
 * Supports both UI badges (text-based) and chemical badges (symbol-based)
 */
export interface BadgeData {
  // UI Badge properties
  text?: string;
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: ComponentSize | BadgeSize;
  
  // Chemical Badge properties  
  symbol?: string;
  formula?: string;
  atomicNumber?: number | string;
  materialType?: MaterialType;
  
  // Common properties
  show?: boolean;
  description?: string;
  slug?: string;
  
  // Legacy compatibility
  [key: string]: unknown;
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
 * Hero component props
 */
export interface HeroProps {
  image?: string;
  video?: {
    vimeoId?: string;
    url?: string;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    background?: boolean;
  };
  align?: 'left' | 'center' | 'right';
  theme?: 'dark' | 'light';
  variant?: 'default' | 'fullwidth';
  children?: React.ReactNode;
  frontmatter?: ArticleMetadata;
  className?: string;
}

/**
 * Component data structure
 */
export interface ComponentData {
  type?: string; // Component type identifier
  content: string;
  config?: Record<string, unknown>;
}

// ===============================
// UI COMPONENT TYPES
// ===============================

export type ComponentVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'solid' | 'subtle';
export type ComponentSize = 'sm' | 'md' | 'lg' | 'xl';
export type BadgeVariant = 'outline' | 'subtle' | 'solid';
export type BadgeSize = 'card' | 'large' | 'small' | 'inline';
export type BadgeColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
export type MaterialType = 
  | 'element' 
  | 'compound' 
  | 'ceramic' 
  | 'polymer' 
  | 'alloy' 
  | 'composite' 
  | 'semiconductor'
  | 'other';

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
 * Search result item - unified comprehensive interface
 * Single source of truth for all search result representations
 */
export interface SearchResultItem {
  /** Unique identifier */
  id?: string;
  
  /** Content slug for routing */
  slug: string;
  
  /** Display title */
  title: string;
  
  /** Display name (alternative to title) */
  name?: string;
  
  /** Item description */
  description?: string;
  
  /** Content type */
  type: string;
  
  /** Category classification */
  category?: string;
  
  /** Associated tags */
  tags?: string[];
  
  /** Navigation href/URL */
  href: string;
  
  /** Image URL */
  image?: string;
  
  /** Image alt text */
  imageAlt?: string;
  
  /** Thumbnail URL */
  thumbnail?: string;
  
  /** Search relevance score */
  score?: number;
  
  /** Associated metadata */
  metadata?: ArticleMetadata;
  
  /** Badge data */
  badge?: BadgeData;
  
  /** Chemical properties for materials */
  chemicalProperties?: MaterialProperties;
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
 * UI Badge component props
 */
export interface UIBadgeProps {
  text: string;
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: ComponentSize;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

/**
 * Breadcrumbs component props
 */
export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
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
// API TYPES
// ===============================

/**
 * Search API response
 */
export interface SearchApiResponse extends ApiResponse {
  data?: {
    items: SearchResultItem[];
    total: number;
    page: number;
    limit: number;
  };
}

/**
 * Materials API response
 */
export interface MaterialsApiResponse extends ApiResponse {
  data?: {
    materials: MaterialItem[];
    total: number;
  };
}

/**
 * Material item from API
 */
export interface MaterialItem {
  id: string;
  name: string;
  chemicalFormula?: string;
  materialType?: string;
  properties?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Debug API response
 */
export interface DebugApiResponse extends ApiResponse {
  data?: {
    items: DebugItem[];
    timestamp: string;
    environment: string;
  };
}

/**
 * Debug item structure
 */
export interface DebugItem {
  id: string;
  type: string;
  message: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Filter parameters
 */
export interface FilterParams {
  category?: string;
  tags?: string[];
  materialType?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * API Search parameters (distinct from URL SearchParams)
 */
export interface ApiSearchParams {
  query?: string;
  filters?: FilterParams;
  pagination?: PaginationParams;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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
