/**
 * @file types/centralized.ts
 * @purpose SINGLE SOURCE OF TRUTH for all Z-Beam types - 1,830+ consolidated type definitions
 * @aiContext ALWAYS import types from '@/types' - never create local interfaces in components
 *           Key types: ArticleMetadata, CardProps, CaptionProps, AuthorInfo, CardGridProps
 * @usage import type { TypeName } from '@/types'
 * @warning Never create duplicate interfaces - add new types to this file
 * @exports 100+ interfaces covering all component props, data structures, and utilities
 */
// types/centralized.ts
// SINGLE SOURCE OF TRUTH for all Z-Beam types
// This file will replace all scattered type definitions

import { ReactNode } from 'react';

// ===============================
// CORE CONTENT TYPES
// ===============================

/**
 * Author information structure - enhanced comprehensive version
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
  
  // Enhanced author object fields
  affiliation?: string;
  credentials?: string[];
  experience_years?: number;
  verification_level?: 'verified' | 'expert' | 'industry_leader' | 'academic';
  research_focus?: string[];
  publications_count?: number;
  h_index?: number;
  industry_experience?: string[];
  certifications?: string[];
  awards?: string[];
  speaking_engagements?: string[];
  patent_count?: number;
  contact_information?: {
    phone?: string;
    website?: string;
    orcid?: string;
    google_scholar?: string;
    researchgate?: string;
  };
  professional_memberships?: string[];
  languages?: string[];
  availability?: {
    consulting?: boolean;
    speaking?: boolean;
    collaboration?: boolean;
  };
}

/**
 * Workflow/process step item for static pages
 */
/**
 * Unified content card item - supports callouts, workflow steps, and benefits
 * - If order is provided, renders as workflow step with numbered badge
 * - If category is provided, renders as benefit with category label
 * - Otherwise renders as simple callout
 */
export interface ContentCardItem {
  // Core content (required)
  heading: string;
  text: string;
  
  // Optional features
  order?: number;        // If provided, renders as numbered workflow step
  category?: string;     // If provided, renders category label above heading
  details?: string[];    // Bullet list of additional details
  
  // Visual options
  image?: {
    url: string;
    alt?: string;
  };
  imagePosition?: 'left' | 'right';
  theme?: 'body' | 'navbar';
  variant?: 'default' | 'inline';
}

/**
 * @deprecated Use ContentCardItem instead
 * Legacy WorkflowItem type for backward compatibility
 */
export interface WorkflowItem {
  stage: string;
  order: number;
  name: string;
  description: string;
  details: string[];
  image?: {
    url: string;
    alt?: string;
  };
  imagePosition?: 'left' | 'right';
}

/**
 * Benefit item for static pages
 * @deprecated Prefer ContentCardItem with category field for benefits
 * @note Field naming: 'title' (BenefitItem) maps to 'heading' (ContentCardItem) in ContentSection
 */
export interface BenefitItem {
  category: string;
  title: string;
  description: string;
}

/**
 * Equipment item for static pages
 */
export interface EquipmentItem {
  name: string;
  type: string;
  description: string;
}

/**
 * Article metadata (base for all content types) - enhanced version
 */
export interface ArticleMetadata {
  id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  slug: string;
  category?: string;
  tags?: string[];
  author?: AuthorInfo | string; // Support both object and string formats
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
  canonical?: string; // Canonical URL for SEO
  
  // Enhanced frontmatter fields
  chemicalProperties?: ChemicalProperties;
  properties?: Record<string, PropertyWithUnits>;
  
  // Image structure for hero and other images
  images?: {
    hero?: {
      url?: string;
      alt?: string;
      width?: number;
      height?: number;
    };
    micro?: {
      url?: string;
      alt?: string;
      width?: number;
      height?: number;
    };
    social?: {
      url?: string;
      alt?: string;
    };
  };
  
  // Legacy compatibility fields
  subject?: string; // Legacy field for older components
  video?: string; // For video metadata (YouTube ID)
  chemicalSymbol?: string;
  chemicalFormula?: string;
  atomicNumber?: number;
  machineSettings?: MachineSettings;
  applications?: string[];
  compatibility?: string[];
  outcomes?: string[];
  prompt_chain_verification?: VerificationSystem;
  author_object?: AuthorInfo; // Support both field names
  technical_specifications?: Record<string, PropertyWithUnits>;
  safety_considerations?: string[];
  environmental_impact?: Record<string, PropertyWithUnits>;
  cost_analysis?: Record<string, PropertyWithUnits>;
  quality_metrics?: Record<string, PropertyWithUnits>;
  
  // Caption integration - frontmatter.caption support
  caption?: CaptionDataStructure;
  
  // Unified content cards - replaces callouts and workflow
  contentCards?: ContentCardItem[];
  
  // Legacy fields for backward compatibility
  callout?: CalloutConfig;
  callouts?: CalloutConfig[];
  workflow?: WorkflowItem[];
  
  // Other structured content sections for static pages
  benefits?: BenefitItem[];
  equipment?: EquipmentItem[];
  
  // Breadcrumb navigation configuration
  breadcrumb?: BreadcrumbItem[];
  
  // Material-specific fields for auto-breadcrumb generation
  name?: string; // Material name (e.g., "Aluminum")
  subcategory?: string; // Material subcategory (e.g., "non-ferrous")
}

// ===============================
// CALLOUT TYPES
// ===============================

/**
 * Configuration for Callout component in YAML frontmatter
 */
export interface CalloutConfig {
  heading: string;
  text: string;
  image?: {
    url: string;
    alt?: string;
  };
  imagePosition?: 'left' | 'right';
  theme?: 'body' | 'navbar';
  variant?: 'default' | 'inline';
}

/**
 * Props for Callout component
 */
export interface CalloutProps {
  heading: string;
  text: string;
  image?: {
    url: string;
    alt?: string;
  };
  imagePosition?: 'left' | 'right';
  theme?: 'body' | 'navbar';
  variant?: 'default' | 'inline';
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
  category?: string; // e.g., "Technology", "Research", "Analysis", "Documentation"
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
// CAPTION & METRICS TYPES
// ===============================

/**
 * Enhanced Caption Data Structure - Complete interface for caption content
 */
/**
 * CaptionDataStructure - Before/After Caption Text
 * 
 * ⚠️ CRITICAL: This interface MUST match actual YAML caption structure
 * 
 * ONLY two fields exist in YAML:
 * - before: Description of material before laser cleaning
 * - after: Description of material after laser cleaning
 * 
 * DO NOT add fields like beforeText, afterText, material, title, etc.
 * These do NOT exist in actual YAML files.
 * 
 * Example from YAML:
 * ```yaml
 * caption:
 *   before: "Contaminated surface with..."
 *   after: "Clean surface showing..."
 * ```
 * 
 * @see frontmatter/materials/bamboo-laser-cleaning.yaml lines 52-53
 */
export interface CaptionDataStructure {
  /** Description of material BEFORE laser cleaning */
  before?: string;
  /** Description of material AFTER laser cleaning */
  after?: string;
}

/**
 * FrontmatterType - YAML Frontmatter Structure
 * 
 * ⚠️ CRITICAL: This interface MUST match actual YAML frontmatter files in /frontmatter/materials/
 * 
 * DO NOT add properties that don't exist in YAML files!
 * Before adding any property, verify it exists in actual YAML files:
 * - Check frontmatter/materials/*.yaml files
 * - Grep for the property: `grep -r "propertyName:" frontmatter/materials/`
 * 
 * Properties that DO NOT exist (DO NOT ADD):
 * ❌ applications - does not exist in YAML
 * ❌ environmentalImpact - does not exist in YAML
 * ❌ caption.beforeText/afterText - use caption.before/after instead
 * 
 * @see frontmatter/materials/alumina-laser-cleaning.yaml for reference structure
 */
export interface FrontmatterType {
  /** Page title */
  title?: string;
  /** Meta description */
  description?: string;
  /** SEO keywords array */
  keywords?: string[];
  /** Author can be string (name) or full AuthorInfo object */
  author?: string | AuthorInfo;
  /** Material name (e.g., "Alumina", "Bamboo") */
  name?: string;
  /** Material images - hero and micro views */
  images?: {
    hero?: {
      url?: string;
      alt?: string;
    };
    micro?: {
      url?: string;
      alt?: string;
    };
  };
  author_object?: {
    name: string;
    email?: string;
    affiliation?: string;
    title?: string;
    expertise?: string[];
  };
  technicalSpecifications?: {
    wavelength?: string;
    power?: string;
    pulse_duration?: string;
    scanning_speed?: string;
    material?: string;
  };
  chemicalProperties?: {
    composition?: string;
    surface_treatment?: string;
    contamination_type?: string;
    materialType?: string;
    formula?: string;
    density?: string;
    meltingPoint?: string;
    thermalConductivity?: string;
  };
  
  // Material properties from YAML frontmatter
  materialProperties?: {
    [key: string]: {
      value?: number | string;
      unit?: string;
      confidence?: number;
      description?: string;
      min?: number | null;
      max?: number | null;
    };
  } & {
    thermalDestructionPoint?: {
      value?: number;
      unit?: string;
      confidence?: number;
      description?: string;
      min?: number | null;
      max?: number | null;
    };
    thermalDestructionType?: string; // Label for thermal destruction type
  };
  
  // Caption data from frontmatter.caption
  caption?: CaptionDataStructure;
  
  /** Material category (e.g., "ceramic", "wood", "metal") */
  category?: string;
  /** Material subcategory (e.g., "oxide", "hardwood", "alloy") */
  subcategory?: string;
  
  /**
   * E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) credentials
   * Used for enhanced Schema.org structured data
   * @see frontmatter/materials/bamboo-laser-cleaning.yaml lines 273-279
   */
  eeat?: {
    /** Person or team who reviewed the content */
    reviewedBy?: string | { name: string; title?: string };
    /** Array of cited sources */
    citations?: Array<{ title: string; url?: string; author?: string }>;
    /** Primary source this content is based on */
    isBasedOn?: string | { name: string; url?: string };
  };
  
  /** Publication date in ISO format */
  datePublished?: string;
  /** Last modification date in ISO format */
  dateModified?: string;
}

/**
 * Caption component props
 */
export interface CaptionProps {
  frontmatter: FrontmatterType;
  config?: {
    className?: string;
    showTechnicalDetails?: boolean;
    showMetadata?: boolean;
  };
}

/**
 * Quality metrics interface for MetricsGrid component
 */
export interface QualityMetrics {
  contamination_removal?: string;
  surface_roughness_before?: string;
  surface_roughness_after?: string;
  thermal_damage?: string;
  processing_efficiency?: string;
  substrate_integrity?: string;
  [key: string]: string | undefined;
}

/**
 * MetricsCard component props
 */
export interface MetricsCardProps {
  key: string;
  title: string;
  value: string | number;
  unit?: string;
  color: string;
  href?: string;
  min?: number;
  max?: number;
  className?: string;
  searchable?: boolean;
  fullPropertyName?: string;
  animationDelay?: number; // Animation delay in milliseconds for staggered entrance
  
  // NEW: Category context for categorized properties
  categoryId?: string;
  categoryLabel?: string;
  confidence?: number;
  description?: string;
}

/**
 * MetricsGrid component props - Enhanced version with categorization support
 */
export interface MetricsGridProps {
  metadata: ArticleMetadata;
  dataSource?: 'materialProperties' | 'machineSettings';
  title?: string;
  description?: string;
  titleFormat?: 'default' | 'comparison';
  layout?: 'auto' | 'grid-2' | 'grid-3' | 'grid-4';
  showTitle?: boolean;
  className?: string;
  baseHref?: string;
  searchable?: boolean; // Enable search functionality for all cards
  
  // NEW: Category filtering and expansion controls
  categoryFilter?: string[]; // Filter to specific categories (e.g., ['thermal', 'mechanical'])
  defaultExpandedCategories?: string[]; // Categories expanded by default
  maxCards?: number; // Limit the number of cards displayed
  
  // Legacy compatibility (for older Caption system usage)
  qualityMetrics?: QualityMetrics;
  excludeMetrics?: string[];
}

/**
 * Parsed caption data interface for useCaptionParsing hook
 */
export interface ParsedCaptionData {
  renderedContent: string;
  beforeText?: string;
  afterText?: string;
  laserParams?: any; // CaptionYamlData['laser_parameters']
  metadata?: any; // CaptionYamlData['metadata']
  material?: string;
  // Enhanced data fields
  isEnhanced?: boolean;
  qualityMetrics?: any; // EnhancedCaptionYamlData['quality_metrics']
  authorObject?: any; // EnhancedCaptionYamlData['author_object']
  technicalSpecs?: any; // EnhancedCaptionYamlData['technical_specifications']
  materialProps?: any; // EnhancedCaptionYamlData['material_properties']
  methodology?: any; // EnhancedCaptionYamlData['analysis_methodology']
  seoMetadata?: any; // EnhancedCaptionYamlData['seo_metadata']
  accessibility?: any; // EnhancedCaptionYamlData['accessibility']
}

// ===============================
// COMPONENT TYPES
// ===============================

/**
 * Author component props
 */
export interface AuthorProps {
  frontmatter?: ArticleMetadata;
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
 * Title component props
 */
export interface TitleProps {
  title: string;
  level?: 'page' | 'section' | 'card';
  alignment?: 'left' | 'center' | 'right';
  className?: string;
  id?: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
  
  // WCAG & Accessibility Props
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
  role?: string;
  tabIndex?: number;
  
  // Search & SEO Props
  searchKeywords?: string[];
  category?: string;
  priority?: 'high' | 'medium' | 'low';
  
  // Navigation Props
  skipLink?: boolean;
  landmark?: boolean;
  nextHeaderId?: string;
  prevHeaderId?: string;
  
  // Content Props
  context?: string;
  
  // Event Handlers for Enhanced Interaction
  onFocus?: (event: React.FocusEvent<HTMLElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void;
}

/**
 * Layout component props
 */
export interface LayoutProps {
  components?: Record<string, ComponentData>;
  metadata?: ArticleMetadata;
  slug?: string;
  children?: ReactNode;
  title?: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
  description?: string;
  className?: string;
  customHeroOverlay?: boolean; // Enable custom overlay on Hero (homepage only)
}

/**
 * Search Results component props
 */
export interface SearchResultsProps {
  items: SearchableArticle[];
  initialTag?: string;
  placeholder?: string;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  showTagFilter?: boolean;
}

/**
 * Search Client component props
 */
export interface SearchClientProps {
  initialArticles: Article[];
}

/**
 * List component props
 */
export interface ListProps {
  // Add slugs as a prop alternative to items
  slugs?: string[];
  items?: Array<{
    slug: string;
    title?: string;
    description?: string;
    image?: string;
    badge?: string;
    featured?: boolean; // Add featured property
  }>;
  title?: string;
  heading?: string; // Add heading as an alias for title
  columns?: 1 | 2 | 3 | 4;
  filterBy?: string;
  className?: string;
  showHeadings?: boolean;
  itemClassName?: string;
  linkClassName?: string;
  headingClassName?: string;
  showExcerpts?: boolean;
  showImages?: boolean;
  showCategories?: boolean;
  showTags?: boolean;
  maxItems?: number;
  groupBy?: 'category' | 'tag' | 'date' | 'none';
  sortBy?: 'title' | 'date' | 'category' | 'none';
  sortOrder?: 'asc' | 'desc';
  layout?: 'list' | 'grid' | 'cards';
}

/**
 * Table component props
 */
export interface TableProps {
  content: string;
  config?: {
    showHeader?: boolean;
    caption?: string;
    className?: string;
    variant?: 'default' | 'sectioned' | 'compact';
    includedFields?: string[];
    excludedFields?: string[];
    tableType?: 'auto' | 'frontmatter' | 'legacy';
    displayMode?: 'auto' | 'content' | 'technical' | 'hybrid';
    layoutMode?: 'compact' | 'detailed' | 'cards';
  };
  data?: any[];
  columns?: string[];
  className?: string;
  striped?: boolean;
  bordered?: boolean;
  hover?: boolean;
  responsive?: boolean;
  caption?: string;
}

/**
 * Smart Table display modes
 */
export type DisplayMode = 'auto' | 'content' | 'technical' | 'hybrid';

/**
 * Smart Table data structure
 */
export interface SmartTableData {
  [key: string]: any;
}

/**
 * Smart field for intelligent table rendering
 */
export interface SmartField {
  key: string;
  label: string;
  value: any;
  type: 'text' | 'array' | 'object' | 'number' | 'boolean';
  category: 'identity' | 'content' | 'technical' | 'reference';
  confidence?: number;
  source?: string;
  description?: string;
  unit?: string;
  displayMode?: DisplayMode[];
}

/**
 * Table section for organized display
 */
export interface TableSection {
  id: string;
  title: string;
  description?: string;
  priority: number;
  fields: SmartField[];
  badge?: string;
  modes: DisplayMode[];
}

/**
 * Hero component props - Uses frontmatter as 100% data source
 */
export interface HeroProps {
  // Required data source
  frontmatter?: ArticleMetadata;
  
  // Layout and behavior only
  theme?: 'dark' | 'light';
  variant?: 'default' | 'fullwidth';
  children?: React.ReactNode;
  className?: string;
  customOverlay?: boolean; // Enable custom left-side overlay (homepage only)
}

/**
 * Component data structure
 */
export interface ComponentData {
  type?: string; // Component type identifier
  content: string;
  config?: Record<string, unknown>;
}

/**
 * Page data structure combining metadata and components
 */
export interface PageData {
  metadata: Record<string, unknown>;
  components: { [componentType: string]: ComponentData };
}

// ===============================
// UI COMPONENT TYPES
// ===============================

export type ComponentSize = 'sm' | 'md' | 'lg' | 'xl';
export type ComponentType = 'author' | 'badgesymbol' | 'caption' | 'content' | 'frontmatter' | 'jsonld' | 'metatags' | 'metricsmachinesettings' | 'metricsproperties' | 'settings' | 'table' | 'tags' | 'text';
export type BadgeVariant = 'outline' | 'subtle' | 'solid' | 'card';
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

// Grid system types
export type GridColumns = 1 | 2 | 3 | 4;
export type GridGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type GridContainer = 'standard' | 'flexible' | 'stretch';

/**
 * Standard grid component props
 */
export interface StandardGridProps {
  columns?: GridColumns;
  gap?: GridGap;
  container?: GridContainer;
  className?: string;
}

/**
 * Markdown metadata interface
 */
export interface MarkdownMetadata extends ArticleMetadata {
  frontmatter?: Record<string, unknown>;
  markdownContent?: string;
}

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
 * Base link component props
 */
export interface BaseLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  target?: '_blank' | '_self';
  rel?: string;
}

/**
 * Footer navigation item interface
 */
export interface FooterNavItem {
  name: string;
  href: string;
  external?: boolean;
  target?: '_blank' | '_self';
  rel?: string;
}

/**
 * Social link interface for footer
 */
export interface SocialLink {
  name: string;
  href: string;
  icon: ReactNode;
  target?: '_blank' | '_self';
  rel?: string;
}

/**
 * Search bar component props
 */
export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  id?: string;
  'aria-describedby'?: string;
  onSubmit?: () => void;
}

/**
 * API configuration interface
 */
export interface ApiConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  apiKey?: string;
  headers?: Record<string, string>;
}

/**
 * Cache entry interface for performance caching
 */
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl?: number;
  key?: string;
  accessCount?: number;
  lastAccessed?: number;
}

/**
 * Cache metrics interface for performance monitoring
 */
export interface CacheMetrics {
  hits: number;
  misses: number;
  size?: number;
  maxSize?: number;
  hitRate?: number;
  evictions?: number;
  totalRequests?: number;
  avgResponseTime?: number;
  memoryUsage?: number;
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
// COMPONENT PROPS INTERFACES
// ===============================

/**
 * Card item interface for grid displays
 */
export interface CardItem {
  slug: string;
  title?: string;
  description?: string;
  href?: string;
  imageUrl?: string;
  imageAlt?: string;
  image?: string;
  badge?: BadgeData;
  tags?: string[];
  category?: string;
  metadata?: Record<string, unknown>;
  article?: Article | null;
}

/**
 * Card grid component props - unified grid system
 */
export interface CardGridProps {
  // Data sources - flexible input types
  items?: CardItem[];
  slugs?: string[];
  searchResults?: SearchResultItem[];
  
  // Display configuration
  title?: string;
  heading?: string;
  columns?: GridColumns;
  gap?: GridGap;
  
  // Layout modes
  mode?: 'simple' | 'category-grouped' | 'search-results';
  
  // Category grouping options (for mode: 'category-grouped')
  showSearch?: boolean;
  showCategoryFilter?: boolean;
  maxItemsPerCategory?: number;
  categoryOrder?: string[];
  
  // Filtering
  filterBy?: string;
  
  // Badge handling
  showBadgeSymbols?: boolean;
  loadBadgeSymbolData?: boolean;
  
  // Styling
  className?: string;
}



/**
 * Button component props
 * Variants:
 * - primary: Orange background, white text (main CTA)
 * - secondary: White background, orange text (Let's Talk style)
 * - outline: Border only, no fill (Dataset downloader style)
 * - danger: Red background, white text (destructive actions)
 * - minimal: Transparent background, link style
 */
export interface ButtonProps {
  children?: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  showIcon?: boolean; // Deprecated: use iconRight instead
  iconLeft?: ReactNode; // Custom icon component positioned on the left
  iconRight?: ReactNode; // Custom icon component positioned on the right
  fullWidth?: boolean;
  'aria-label'?: string;
  href?: string; // If provided, renders as Link instead of button
}

/**
 * ContactButton component props
 */
export interface ContactButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
  fullWidth?: boolean;
  children?: ReactNode;
  'aria-label'?: string;
}

/**
 * Content component props
 */
export interface ContentProps {
  content: string;
  className?: string;
  config?: {
    wrapHeadings?: boolean;
    maxWidth?: string;
    enhanceTables?: boolean;
  };
}

/**
 * Thumbnail component props
 */
export interface ThumbnailProps {
  alt: string;
  className?: string;
  priority?: boolean;
  objectFit?: "fill" | "contain" | "cover" | "none" | "scale-down";
  width?: number;
  height?: number;
  frontmatter?: ArticleMetadata;
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
 * Property value structure for categorized frontmatter
 * Individual property with value, unit, confidence, and range
 */
export interface PropertyValue {
  value: number | string;
  unit: string;
  confidence: number;
  description: string;
  min?: number;
  max?: number;
  source?: string;
}

/**
 * Property category structure for categorized frontmatter
 * Groups related properties by scientific domain
 */
export interface PropertyCategory {
  label: string;
  description: string;
  percentage: number;
  properties: {
    [propertyName: string]: PropertyValue;
  };
}

/**
 * Material properties - NEW CATEGORIZED STRUCTURE
 * Properties organized by scientific domain (thermal, mechanical, optical, etc.)
 * Supports both new categorized structure and legacy flat structure for backward compatibility
 */
export interface MaterialProperties {
  // NEW: Categorized structure (9 scientific categories)
  thermal?: PropertyCategory;
  mechanical?: PropertyCategory;
  optical_laser?: PropertyCategory;
  surface?: PropertyCategory;
  electrical?: PropertyCategory;
  chemical?: PropertyCategory;
  environmental?: PropertyCategory;
  compositional?: PropertyCategory;
  physical_structural?: PropertyCategory;
  other?: PropertyCategory;
  
  // LEGACY: Flat structure (deprecated but supported for backward compatibility)
  chemicalFormula?: string;
  materialType?: string;
  density?: string | PropertyWithUnits;
  thermalDestructionPoint?: string | PropertyWithUnits;
  thermalDestructionType?: string;
  meltingPoint?: string | PropertyWithUnits;
  thermalConductivity?: string | PropertyWithUnits;
  laserType?: string;
  wavelength?: string | PropertyWithUnits;
  fluenceRange?: string | PropertyWithUnits;
  [key: string]: string | number | PropertyWithUnits | PropertyCategory | undefined;
}

/**
 * Property with dual value system (text + numeric + units)
 * @deprecated Legacy format - use PropertyValue for new categorized structure
 */
export interface PropertyWithUnits {
  text?: string;
  numeric?: number;
  units?: string;
  min?: number;
  max?: number;
  percentile?: number;
  range?: {
    min: number;
    max: number;
    units?: string;
  };
}

/**
 * Chemical properties structure
 */
export interface ChemicalProperties {
  formula?: string | PropertyWithUnits;
  molecularWeight?: PropertyWithUnits;
  density?: PropertyWithUnits;
  meltingPoint?: PropertyWithUnits;
  boilingPoint?: PropertyWithUnits;
  solubility?: PropertyWithUnits;
  reactivity?: PropertyWithUnits;
  toxicity?: PropertyWithUnits;
  stability?: PropertyWithUnits;
  corrosionResistance?: PropertyWithUnits;
  [key: string]: string | PropertyWithUnits | undefined;
}

/**
 * Machine settings for laser processing
 */
export interface MachineSettings {
  power?: PropertyWithUnits;
  speed?: PropertyWithUnits;
  frequency?: PropertyWithUnits;
  wavelength?: PropertyWithUnits;
  pulseWidth?: PropertyWithUnits;
  spotSize?: PropertyWithUnits;
  passes?: PropertyWithUnits;
  scanningPattern?: string;
  beamProfile?: string;
  focusPosition?: PropertyWithUnits;
  assistGas?: string;
  pressure?: PropertyWithUnits;
  [key: string]: string | PropertyWithUnits | undefined;
}

/**
 * Verification tracking system
 */
export interface VerificationSystem {
  timestamp?: string;
  verified_by?: string;
  verification_level?: 'preliminary' | 'peer_reviewed' | 'expert_validated' | 'industry_standard';
  accuracy_score?: number;
  confidence_level?: number;
  source_reliability?: number;
  last_updated?: string;
  review_notes?: string[];
  validation_criteria?: string[];
  [key: string]: unknown;
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

//===============================
// VALIDATION TYPES
// ===============================

/**
 * Validation result structure
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Content structure for validation
 */
export interface ContentStructure {
  title?: string;
  slug?: string;
  content?: string;
  [key: string]: any;
}

/**
 * Image metadata structure for validation
 */
export interface ImageMetadata {
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  
  // Google Image License Metadata
  // @see https://developers.google.com/search/docs/appearance/structured-data/image-license-metadata
  license?: string;              // URL to license page (e.g., Creative Commons, proprietary)
  acquireLicensePage?: string;   // URL where users can acquire license/permission
  creditText?: string;           // Text attribution/credit for the image
  creator?: string | {
    '@type': 'Person' | 'Organization';
    name: string;
    url?: string;
  };
  copyrightNotice?: string;      // Copyright statement
  
  [key: string]: any;
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
  href: string; // Always required for breadcrumb navigation
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
 * Material badge data for materials system
 */
export interface MaterialBadgeData extends BadgeData {
  /** Material type is required for materials */
  materialType: MaterialType;
}

/**
 * Badge symbol specific data
 * Extends BadgeData with symbol-specific properties
 */
export interface BadgeSymbolData extends BadgeData {
  /** Required symbol for badge symbol components */
  symbol: string;
}

/**
 * Breadcrumbs component props
 */
export interface BreadcrumbsProps {
  /**
   * Optional breadcrumb data from frontmatter
   * If provided, this takes priority over URL-based generation
   */
  breadcrumbData?: BreadcrumbItem[];
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

// Enhanced Article type that consolidates contentAPI requirements
export interface Article {
  slug: string;
  title: string;
  name?: string;
  headline?: string;
  description?: string;
  content?: string;
  tags?: string[];
  category?: string;
  href?: string;
  image?: string;
  imageAlt?: string;
  showBadge?: boolean;
  badge?: any;
  author?: string;
  date?: string;
  excerpt?: string;
  website?: string;
  metadata?: ArticleMetadata | Record<string, unknown>;
  frontmatter?: Record<string, unknown>;
  // Legacy compatibility
  id?: string;
  path?: string;
  filepath?: string;
  type?: string;
  // Additional fields for component compatibility
  subject?: string; // For Card component compatibility
  video?: string; // For Hero component compatibility
}

// Search-ready article with guaranteed required fields
export interface SearchableArticle extends Article {
  tags: string[];
  href: string;
}

/**
 * Tags component interfaces
 */
export interface TagsData {
  tags?: string[];
  showAll?: boolean;
  maxTags?: number;
  material?: string;
  count?: number;
  categories?: Record<string, string[]>;
  metadata?: {
    format?: string;
    version?: string;
    generated?: string;
    material?: string;
  };
}

export interface TagsProps {
  frontmatter?: ArticleMetadata;
  content?: string | TagsData;
  config?: Record<string, any>;
  tags?: string[];
  showAll?: boolean;
  maxTags?: number;
  className?: string;
}

/**
 * Contact form data interface
 */
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  company?: string;
  inquiryType: string;
}

/**
 * Processed list item for component display
 */
export interface ProcessedListItem {
  slug: string;
  title: string;
  description: string;
  badge?: any;
  imageUrl?: string;
}

// ===============================
// SEARCH & NAVIGATION TYPES
// ===============================

/**
 * Search wrapper component props
 */
export interface SearchWrapperProps {
  initialArticles: Article[];
}

/**
 * Sitemap entry structure
 */
export interface SitemapEntry {
  url: string;
  lastModified?: Date | string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

// ===============================
// CARD GRID TYPES
// ===============================

/**
 * Grid item interface for SSR components
 */
export interface GridItemSSR {
  slug: string;
  title?: string;
  name?: string;
  description?: string;
  category?: string;
  articleType?: string;
  metadata?: ArticleMetadata | Record<string, unknown>;
  badge?: BadgeData;
  imageUrl?: string;
  imageAlt?: string;
  href?: string;
  tags?: string[];
  excerpt?: string;
  article?: Article | null;
}

/**
 * CardGrid SSR-specific props interface
 */
export interface CardGridSSRProps {
  // Data sources (use one)
  items?: GridItemSSR[];
  slugs?: string[];
  
  // Display configuration
  title?: string;
  heading?: string;
  columns?: GridColumns;
  gap?: GridGap;
  
  // Layout modes
  mode?: 'simple' | 'category-grouped';
  
  // Category grouping options (for mode: 'category-grouped')
  maxItemsPerCategory?: number;
  categoryOrder?: string[];
  
  // Filtering
  filterBy?: string;
  showFilters?: boolean;
  
  // Badge handling
  showBadgeSymbols?: boolean;
  loadBadgeSymbolData?: boolean;
  
  // Styling
  className?: string;
  cardClassName?: string;
  variant?: "default" | "featured";
}

// ===============================
// SYSTEM & VALIDATION TYPES
// ===============================

/**
 * Startup validation check result
 */
export interface StartupCheckResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  validatedAt: string;
  duration?: number;
}

// ===============================
// FEATURED CONTENT TYPES
// ===============================

/**
 * Featured material category for homepage
 */
export interface FeaturedMaterialCategory {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  materialType: string;
  representativeMaterial: string;
}

/**
 * Featured section for homepage
 */
export interface FeaturedSection {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
}

// ===============================
// DEBUG & DEVELOPMENT TYPES
// ===============================

/**
 * Debug data structure for development page
 */
export interface DebugData {
  thumbnails: Array<{ url: string; alt: string; slug: string }>;
  images: Array<{ src: string; alt: string; width: number; height: number }>;
  materials: Array<{ name: string; type: string; fallback: string; status: string }>;
  cards: Array<any>;
  frontmatter: Array<any>;
}

// ===============================
// CATEGORY & METADATA TYPES
// ===============================

/**
 * Category metadata for material pages
 */
export interface CategoryMetadata {
  title: string;
  subtitle?: string;
  description: string;
  keywords: string[];
  ogImage: string;
  schema: {
    "@type": string;
    name: string;
    description: string;
    category: string;
  };
  materialData?: Article | null;
  badgeSymbolData?: any;
}

// Re-exports for backward compatibility
export type Metadata = ArticleMetadata;
export type Author = AuthorInfo;
export type Badge = BadgeData;

// Legacy type aliases
export type MaterialPost = ContentItem;
export type PageParams = { slug: string };
export type SearchParams = Record<string, string | string[] | undefined>;

// ===============================
// COMPONENT INTERFACES
// ===============================

/**
 * Form error tracking for contact forms
 */
export interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  subject?: string;
  message?: string;
  inquiryType?: string;
}

/**
 * Setting data for machine settings cards
 */
export interface SettingData {
  key: string;
  title: string;
  value: number | string;
  unit?: string;
  description: string;
  priority: number;
  colorScheme: string;
  trend?: 'up' | 'down' | 'neutral';
  minValue?: number;
  maxValue?: number;
}

/**
 * Setting card configuration
 */
export interface SettingCardConfig {
  key: keyof MachineSettings;
  title: string;
  description: string;
  priority: number;
  colorScheme: string;
  unitKey?: keyof MachineSettings;
  minKey?: keyof MachineSettings;
  maxKey?: keyof MachineSettings;
}

/**
 * Individual setting card props
 */
export interface SettingCardProps {
  setting: SettingData;
  href?: string;
}

/**
 * Card data interface for simple metrics cards
 */
export interface CardData {
  key: string;
  title: string;
  value: any;
  unit?: any;
  color?: string;
  href?: string;
}

/**
 * Generic metric configuration for flexible MetricsCard usage
 * Allows MetricsCard to work with any frontmatter keys containing numeric values
 */
export interface GenericMetricConfig {
  /** The frontmatter key to extract the value from */
  key: string;
  /** Display title for the metric card */
  title: string;
  /** Description text shown on the card */
  description?: string;
  /** Visual priority for sorting and filtering (1=highest) */
  priority?: number;
  /** Color scheme for the card styling */
  colorScheme?: 'blue' | 'indigo' | 'purple' | 'green' | 'yellow' | 'red' | 'gray';
  /** Optional unit suffix if not found in the data */
  defaultUnit?: string;
  /** Optional formatting function for the display value */
  formatter?: (value: number | string, unit?: string) => string;
  /** Custom color hex code (overrides colorScheme) */
  customColor?: string;
}

/**
 * Generic metric data extracted from frontmatter
 */
export interface GenericMetricData {
  key: string;
  title: string;
  value: number | string;
  unit?: string;
  description?: string;
  priority?: number;
  colorScheme?: string;
  customColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  minValue?: number;
  maxValue?: number;
  /** Original raw value from frontmatter (for debugging) */
  rawValue?: any;
}

/**
 * Configuration for auto-discovery of numeric frontmatter keys
 */
export interface MetricAutoDiscoveryConfig {
  /** Keys to include (if empty, includes all numeric keys) */
  includeKeys?: string[];
  /** Keys to exclude from auto-discovery */
  excludeKeys?: string[];
  /** Patterns to match for key inclusion (regex strings) */
  includePatterns?: string[];
  /** Patterns to match for key exclusion (regex strings) */  
  excludePatterns?: string[];
  /** Maximum number of metrics to auto-discover */
  maxMetrics?: number;
  /** Default priority for auto-discovered metrics */
  defaultPriority?: number;
  /** Whether to include nested object properties */
  includeNested?: boolean;
}

/**
 * Navigation item interface
 */
export interface NavItem {
  name: string;
  href: string;
  current?: boolean;
  external?: boolean;
  target?: "_blank" | "_self";
  rel?: string;
  description?: string;
  dropdown?: NavItem[];
  children?: NavItem[];
  icon?: React.ComponentType;
}

/**
 * Table row interface
 */
export interface TableRow {
  property: string;
  value: string;
  unit?: string;
  category?: string;
  min?: string;
  max?: string;
  percentile?: number;
  description?: string;
  confidence?: number;
}

/**
 * Layout props interface
 */
export interface ComponentLayoutProps {
  metadata: ArticleMetadata;
  content?: React.ReactNode;
  showDebug?: boolean;
}

/**
 * Article header props
 */
export interface ArticleHeaderProps {
  metadata: ArticleMetadata;
  slug?: string;
  title?: string;
  components?: Record<string, ComponentData>;
  showBreadcrumbs?: boolean;
}

/**
 * Debug section interface
 */
export interface DebugSection {
  id: string;
  title: string;
  data: any;
  expanded?: boolean;
}

/**
 * Debug layout props
 */
export interface DebugLayoutProps {
  sections: DebugSection[];
  title?: string;
}

/**
 * SEO caption props
 */
export interface SEOCaptionProps {
  materialName: string;
  frontmatter?: FrontmatterType;
  captionData?: ParsedCaptionData;
  imageData?: {
    beforeUrl: string;
    afterUrl: string;
    width: number;
    height: number;
  };
}

/**
 * Settings props interface
 */
export interface SettingsProps {
  metadata: ArticleMetadata;
}

/**
 * Settings parameter interface
 */
export interface SettingsParameter {
  parameter: string;
  value: string | number;
  unit?: string;
  range?: string;
  category: string;
}

/**
 * Search results grid props
 */
export interface SearchResultsGridProps {
  articles: ArticleMetadata[];
  searchQuery?: string;
}

/**
 * Caption image props
 */
export interface CaptionImageProps {
  src?: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

/**
 * FadeIn wrapper props
 */
export interface FadeInWrapperProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

/**
 * Tag debug data interface
 */
export interface TagDebugData {
  tag: string;
  count: number;
  articles: string[];
  normalized: string;
  category?: string;
}

/**
 * Header component props interface
 */
/**
 * Frontmatter item interface
 */
export interface FrontmatterItem {
  file: string;
  frontmatter: Record<string, any>;
  errors?: string[];
}

// ===============================
// TYPE ALIASES - Phase 1 (Non-breaking)
// Shorter names for commonly used types
// Original names remain valid for backward compatibility
// ===============================

/**
 * Shorter alias for BaseInteractiveProps
 * Use for interactive components (buttons, links, etc.)
 */
export type InteractiveProps = BaseInteractiveProps;

/**
 * Shorter alias for MetricAutoDiscoveryConfig
 * Use for metric configuration
 */
export type MetricDiscoveryConfig = MetricAutoDiscoveryConfig;

/**
 * Shorter alias for SearchResultsGridProps
 * Use for search result grids
 */
export type SearchGridProps = SearchResultsGridProps;

// ===============================
// TYPE ALIASES - Phase 2A (Decoration Removal)
// Remove decorative prefixes like "Generic", "Universal"
// Original names remain valid for backward compatibility
// ===============================

/**
 * Alias for GenericMetricConfig (removes "Generic" prefix)
 * Use for metric configuration of any type
 */
export type MetricConfig = GenericMetricConfig;

/**
 * Alias for GenericMetricData (removes "Generic" prefix)
 * Use for metric data of any type
 */
export type MetricData = GenericMetricData;

// ===============================
// JSON-LD SCHEMA TYPES
// ===============================

/**
 * JSON-LD component props
 */
export interface JsonLdProps {
  data: Record<string, unknown>;
}

/**
 * Person schema for JSON-LD
 */
export interface PersonSchema {
  name: string;
  url?: string;
  image?: string;
  description?: string;
  jobTitle?: string;
  worksFor?: string;
  title?: string;
  country?: string;
  [key: string]: unknown;
}

/**
 * Listing/BlogPosting schema for JSON-LD
 */
export interface ListingSchema {
  headline: string;
  description: string;
  author: string | { name: string; [key: string]: unknown };
  datePublished: string;
  dateModified?: string;
  url: string;
  image?: string;
  [key: string]: unknown;
}

/**
 * Website schema for JSON-LD
 */
export interface WebsiteSchema {
  name: string;
  description: string;
  url: string;
  author?: string;
  [key: string]: unknown;
}

/**
 * Article schema for JSON-LD
 */
export interface ArticleSchema {
  headline: string;
  description: string;
  author: string | PersonSchema;
  datePublished: string;
  dateModified?: string;
  url: string;
  image?: string;
  articleBody?: string;
  keywords?: string[];
  articleSection?: string;
  [key: string]: unknown;
}

/**
 * Breadcrumb item for JSON-LD breadcrumb lists
 */
export interface JsonLdBreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Progress bar component props
 */
export interface ProgressBarProps {
  min: number;
  max: number;
  value: number;
  color?: string;
  unit?: string;
  title: string;
  id: string;
  propertyName?: string;
  valueTextColor?: string;
}

/**
 * Card component props
 */
export interface CardProps {
  frontmatter?: ArticleMetadata;
  href: string;
  badge?: BadgeData | null;
  className?: string;
  variant?: "default" | "featured";
}

/**
 * Material dataset data structure for dataset downloads
 */
export interface MaterialDatasetData {
  name: string;
  category: string;
  subcategory?: string;
  slug: string;
  parameters?: Record<string, any>;
  materialProperties?: Record<string, any>;
  machineSettings?: Record<string, any>;
  applications?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  faq?: Array<{ question: string; answer: string }>;
  regulatoryStandards?: Array<any>;
}

/**
 * Material dataset card component props (legacy)
 * @deprecated Use DatasetCardProps instead
 */
export interface MaterialDatasetCardProps {
  material: MaterialDatasetData;
  showFullDataset?: boolean;
}

/**
 * Format badge for dataset download options
 */
export interface FormatBadge {
  format: 'JSON' | 'CSV' | 'TXT';
  url: string;
  size?: string;
}

/**
 * DatasetCard Props - extends base Card with dataset-specific features
 * Used for displaying material datasets with download options
 */
export interface DatasetCardProps {
  // Base card props
  frontmatter?: ArticleMetadata;
  href: string;
  badge?: BadgeData | null;
  className?: string;
  variant?: "default" | "featured";
  
  // Dataset-specific props
  formats?: FormatBadge[];
  dataPoints?: number;
  category?: string;
  subcategory?: string;
  onQuickDownload?: (format: string, url: string) => void;
}

/**
 * Material for dataset browser and bulk download
 */
export interface DatasetMaterial {
  name: string;
  slug: string;
  category: string;
  subcategory: string;
  downloads: {
    json: string;
    csv: string;
    txt: string;
  };
}

/**
 * MaterialBrowser component props
 */
export interface MaterialBrowserProps {
  materials: DatasetMaterial[];
}

/**
 * MaterialFilters component props
 * Used for search and filtering controls in MaterialBrowser
 */
export interface MaterialFiltersProps {
  searchTerm: string;
  selectedCategory: string;
  sortBy: 'name' | 'category';
  categories: string[];
  resultCount: number;
  totalCount: number;
  onSearchChange: (term: string) => void;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: 'name' | 'category') => void;
}

/**
 * SectionContainer component props
 * Reusable container for sections with integrated title and styling
 */
export interface SectionContainerProps {
  title: string;
  bgColor?: 'transparent' | 'navbar' | 'body' | 'gray-50' | 'gray-100';
  horizPadding?: boolean;
  radius?: boolean;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/**
 * Featured service item for ServicesSection
 */
export interface FeaturedServiceItem {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
}

/**
 * ServicesSection component props
 */
export interface ServicesSectionProps {
  items: FeaturedServiceItem[];
  title?: string;
  columns?: GridColumns;
}

/**
 * BulkDownload component props
 */
export interface BulkDownloadProps {
  materials: any[];
  categoryStats: Record<string, number>;
}

/**
 * Material info for category dataset card
 */
export interface MaterialInfo {
  name: string;
  slug: string;
  category: string;
  subcategory: string;
}

/**
 * CategoryDatasetCardWrapper component props
 */
export interface CategoryDatasetCardWrapperProps {
  category: string;
  categoryLabel: string;
  materials: MaterialInfo[];
  subcategoryCount: number;
}

/**
 * MaterialDatasetCardWrapper component props
 */
export interface MaterialDatasetCardWrapperProps {
  material: MaterialDatasetData;
  showFullDataset?: boolean;
}

/**
 * CategoryGrid component props
 */
export interface CategoryGridProps {
  categoryStats: Record<string, number>;
  materials: any[];
}

/**
 * DatasetHero component props
 */
export interface DatasetHeroProps {
  totalMaterials: number;
  categoryCount: number;
}

/**
 * DatasetDownloadControls component props
 */
export interface DatasetDownloadControlsProps {
  formats: Array<'json' | 'csv' | 'txt'>;
  selectedFormat: 'json' | 'csv' | 'txt';
  onFormatChange: (format: 'json' | 'csv' | 'txt') => void;
  onDownload: () => void;
  onCopyLink?: () => void;
  isDownloading: boolean;
  copied: boolean;
  showCopyButton: boolean;
}

/**
 * DatasetSection component props (for material and category pages)
 * Display dataset download section with stats, formats, and download controls
 */
export interface DatasetSectionProps {
  title: string;
  description: string;
  stats: Array<{
    value: string | number;
    label: string;
  }>;
  formats: Array<'json' | 'csv' | 'txt'>;
  onDownload: (format: 'json' | 'csv' | 'txt') => void | Promise<void>;
  getDirectLink?: (format: 'json' | 'csv' | 'txt') => string;
  includes?: Array<string>;
  note?: string;
  categoryLink?: {
    href: string;
    label: string;
  };
  fullDatasetLink?: boolean;
}

/**
 * Tag filter component props
 */
export interface TagFilterProps {
  tags: string[];
  selectedTag: string;
  onSelectTag?: (tag: string) => void;
  linkPrefix?: string;
  className?: string;
  tagItemCounts?: Record<string, number>;
}

// ============================================================================
// NORMALIZATION & UTILITY TYPES
// ============================================================================

/**
 * Category data structure for normalization
 */
export interface CategoryData {
  category?: string;
  subcategory?: string;
  [key: string]: unknown;
}

/**
 * Timestamp data structure for freshness normalization
 */
export interface TimestampData {
  datePublished?: string;
  dateModified?: string;
  [key: string]: unknown;
}

/**
 * Regulatory standard structure
 */
export interface RegulatoryStandard {
  name: string;
  id?: string;
  abbreviation?: string;
  description: string;
  url: string;
  image: string;
  longName: string;
  [key: string]: unknown;
}

// ============================================================================
// PERFORMANCE CACHE TYPES
// ============================================================================

/**
 * Performance logging context
 */
export interface PerformanceContext {
  cacheSize?: number;
  ttl?: number;
  operation?: string;
  entriesRemoved?: number;
  remainingEntries?: number;
  cleanupTime?: number;
  age?: number;
  materialsLoaded?: number;
  totalTime?: number;
  avgTimePerMaterial?: number;
  cleanupInterval?: string;
  totalEntriesRemoved?: number;
  [key: string]: unknown;
}

/**
 * Cache report structure
 */
export interface CacheReport {
  timestamp: string;
  caches: Array<CacheMetrics & { hitRate: number; name: string }>;
  totalMemoryUsage: number;
  recommendations: string[];
}
