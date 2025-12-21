/**
 * @file types/centralized.ts
 * @purpose SINGLE SOURCE OF TRUTH for all Z-Beam types - 1,830+ consolidated type definitions
 * @aiContext ALWAYS import types from '@/types' - never create local interfaces in components
 *           Key types: ArticleMetadata, CardProps, MicroProps, Author, CardGridProps
 * @usage import type { TypeName } from '@/types'
 * @warning Never create duplicate interfaces - add new types to this file
 * @exports 100+ interfaces covering all component props, data structures, and utilities
 */
// types/centralized.ts
// SINGLE SOURCE OF TRUTH for all Z-Beam types
// This file will replace all scattered type definitions

import { ReactNode } from 'react';

// ===============================
// UNIFIED CONTENT SYSTEM TYPES
// ===============================

/**
 * Content types for the unified content management system
 * Used across materials, contaminants, compounds, and settings pages
 * @see app/config/contentTypes.ts for configuration
 */
export type ContentType = 'materials' | 'contaminants' | 'compounds' | 'settings';

/**
 * Content types for component usage (includes compounds)
 */
export type ComponentContentType = 'materials' | 'contaminants' | 'compounds' | 'settings';

/**
 * URL building content types - used for URL pattern generation
 * Separate from ContentType to avoid confusion
 * @see app/utils/urlBuilder.ts
 */
export type UrlContentType = 'material' | 'service' | 'article' | 'page' | 'product' | 'equipment' | 'custom';

// ===============================
// CORE CONTENT TYPES
// ===============================

/**
 * Author information structure - enhanced comprehensive version
 * Standardized field names to eliminate redundancy
 * 
 * @preferred Use `Author` - this is the canonical type name
 */
export interface Author {
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
  
  // Social media handles
  twitter?: string; // Twitter/X handle (without @)
  
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
  description?: string;
  contamination_description?: string;  // Added for contaminants
  // Note: All content types (materials, settings, etc.) use the 'description' field
  slug: string;
  category?: string;
  tags?: string[];
  author?: Author; // Author object from YAML
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
  video?: {
    id?: string; // YouTube video ID
    url?: string; // Legacy: direct video URL
  };
  chemicalSymbol?: string;
  chemicalFormula?: string;
  atomicNumber?: number;
  machineSettings?: MachineSettings;
  applications?: string[];
  compatibility?: string[];
  outcomes?: string[];
  prompt_chain_verification?: VerificationSystem;
  technical_specifications?: Record<string, PropertyWithUnits>;
  safety_considerations?: string[];
  environmental_impact?: Record<string, PropertyCategory>;
  cost_analysis?: Record<string, PropertyWithUnits>;
  quality_metrics?: Record<string, PropertyWithUnits>;
  
  // Micro integration - frontmatter.micro support
  micro?: MicroDataStructure;
  
  // FAQ support for material pages
  faq?: Array<{question: string; answer: string}> | { questions?: Array<{question: string; answer: string}> };
  
  // Unified help system (FAQ and troubleshooting)
  help?: HelpSection[];
  
  // Expert answers for E-E-A-T enhanced troubleshooting (settings pages)
  expertAnswers?: ExpertAnswerItem[];
  
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
 * Enhanced Micro Data Structure - Complete interface for micro content
 */
/**
 * MicroDataStructure - Before/After Micro Text
 * 
 * ⚠️ CRITICAL: This interface MUST match actual YAML micro structure
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
 * micro:
 *   before: "Contaminated surface with..."
 *   after: "Clean surface showing..."
 * ```
 * 
 * @see frontmatter/materials/bamboo-laser-cleaning.yaml lines 52-53
 */
export interface MicroDataStructure {
  /** Description of material BEFORE laser cleaning */
  before?: string;
  /** Description of material AFTER laser cleaning */
  after?: string;
  /** Page title */
  title?: string;
  /** Meta description */
  description?: string;
  /** Material name */
  material?: string;
  /** Material images */
  images?: {
    micro?: {
      url?: string;
      alt?: string;
    };
    hero?: {
      url?: string;
      alt?: string;
    };
  };
  /** Image URL (alternative format) */
  imageUrl?: {
    url?: string;
    alt?: string;
  };
  // DEPRECATED: beforeText and afterText are deprecated. Use before/after instead.
  // beforeText?: string;
  // afterText?: string;
  /** Quality metrics data */
  quality_metrics?: Record<string, string | number>;
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
 * ❌ micro.beforeText/afterText - use micro.before/after instead
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
  /** Author object from YAML */
  author?: Author;
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
  technicalSpecifications?: {
    wavelength?: string;
    power?: string;
    pulse_duration?: string;
    scanning_speed?: string;
    material?: string;
  };
  chemicalProperties?: ChemicalProperties;
  
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
  
  // Micro data from frontmatter.micro
  micro?: MicroDataStructure;
  
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
 * Micro component props
 */
export interface MicroProps {
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
  
  // Legacy compatibility (for older Micro system usage)
  qualityMetrics?: QualityMetrics;
  excludeMetrics?: string[];
}

/**
 * Parsed micro data interface for useMicroParsing hook
 */
export interface ParsedMicroData {
  renderedContent: string;
  before?: string;
  after?: string;
  // DEPRECATED: beforeText and afterText are deprecated. Use before/after instead.
  // beforeText?: string;
  // afterText?: string;
  laserParams?: any; // MicroYamlData['laser_parameters']
  metadata?: any; // MicroYamlData['metadata']
  material?: string;
  // Enhanced data fields
  isEnhanced?: boolean;
  qualityMetrics?: any; // EnhancedMicroYamlData['quality_metrics']
  authorObject?: any; // EnhancedMicroYamlData['author_object']
  technicalSpecs?: any; // EnhancedMicroYamlData['technical_specifications']
  materialProps?: any; // EnhancedMicroYamlData['material_properties']
  methodology?: any; // EnhancedMicroYamlData['analysis_methodology']
  seoMetadata?: any; // EnhancedMicroYamlData['seo_metadata']
  accessibility?: any; // EnhancedMicroYamlData['accessibility']
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
  description?: string;
  rightContent?: ReactNode;
  
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
  description?: string;
  rightContent?: ReactNode;
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
    micro?: string;
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
  micro?: string;
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
  children?: ReactNode;
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
export type ComponentType = 'author' | 'badgesymbol' | 'micro' | 'content' | 'frontmatter' | 'jsonld' | 'metatags' | 'metricsmachinesettings' | 'metricsproperties' | 'settings' | 'table' | 'text';
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
 * Base component props - minimal interface for styled components
 */
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
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
/**
 * @deprecated Use GridItem instead - CardItem merged into GridItem for consistency
 * @see GridItem
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
  metadata?: ArticleMetadata | Record<string, unknown>;
  article?: Article | null;
}

/**
 * Card grid component props - unified grid system
 */
export interface CardGridProps {
  // Data sources - flexible input types
  items?: GridItem[];
  slugs?: string[];
  searchResults?: SearchResultItem[];
  
  // Display configuration
  title?: string;
  description?: string;
  heading?: string;
  columns?: GridColumns;
  gap?: GridGap;
  
  // Layout modes
  mode?: 'simple' | 'category-grouped' | 'search-results';
  
  // Card variant
  variant?: 'default' | 'featured' | 'relationship' | 'category';
  
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
  imageUrl?: string; // Explicit URL for server-to-client serialization
}

/**
 * RelatedMaterials component props
 */
export interface RelatedMaterialsProps {
  currentSlug: string;
  category: string;
  subcategory: string;
  maxItems?: number;
}

/**
 * Unified help system types for FAQ and Troubleshooting
 */
export type HelpItemType = 'faq' | 'troubleshooting';
export type HelpContext = 'material' | 'settings' | 'general';
export type HelpSeverity = 'low' | 'medium' | 'high';

export interface HelpItem {
  question: string;
  answer: string;
  severity?: HelpSeverity;
  category?: string;
  propertyValue?: string;
  solutions?: string[];
  relatedTopics?: string[];
  keywords?: string[];
}

export interface HelpSection {
  type: HelpItemType;
  context: HelpContext;
  items: HelpItem[];
}

/**
 * Expert information for QAPage schema and ExpertAnswers component
 */
export interface ExpertInfo {
  name: string;
  title?: string;
  credentials?: string[];
  expertise?: string[];
  affiliation?: string;
  image?: string;
  email?: string;
}

/**
 * Expert answer item with E-E-A-T signals
 */
export interface ExpertAnswerItem {
  question: string;
  answer: string;
  expert?: ExpertInfo; // Optional - falls back to page author
  dateAnswered: string;
  lastReviewed?: string;
  severity?: HelpSeverity;
  category?: string;
  propertyValue?: string;
  solutions?: string[];
  sources?: string[];
  relatedTopics?: string[];
  upvoteCount?: number;
  acceptedAnswer?: boolean;
}

/**
 * ExpertAnswers component props
 */
export interface ExpertAnswersProps {
  materialName: string;
  answers: ExpertAnswerItem[];
  defaultExpert?: ExpertInfo; // Global expert for all answers
  className?: string;
}

/**
 * MaterialFAQ component props (legacy - will be replaced by BaseFAQProps)
 */
export interface MaterialFAQProps {
  materialName: string;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  className?: string;
}

/**
 * BaseFAQ component props (unified help system)
 */
export interface BaseFAQProps {
  sections: HelpSection[];
  materialName: string;
  className?: string;
}

/**
 * RegulatoryStandards component props
 */
export interface RegulatoryStandardsProps {
  standards: RegulatoryStandard[];
  className?: string;
  showTitle?: boolean;
  title?: string;
}

/**
 * ContentCard component props
 */
export interface ContentCardProps {
  // Core content
  heading: string;
  text: string;
  
  // Optional features
  order?: number;        // Workflow step number
  category?: string;     // Benefit category label
  details?: string[];    // Detail list
  
  // Visual options
  image?: {
    url: string;
    alt?: string;
  };
  imagePosition?: 'left' | 'right';
  variant?: 'default' | 'inline';
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
 * Consolidated interface supporting both laser processing and chemical safety data
 */
export interface ChemicalProperties {
  // Chemical composition (laser processing context)
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
  
  // Chemical identification (safety context)
  chemical_formula?: string;
  cas_number?: string;
  molecular_weight?: number;
  hazard_class?: string;
  state_at_room_temp?: string;
  
  // Allow additional properties
  [key: string]: string | number | PropertyWithUnits | undefined;
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
  isCrossNav?: boolean; // Optional flag for cross-navigation links (e.g., Materials → Settings)
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
  video?: {
    id?: string; // YouTube video ID
    url?: string; // Legacy: direct video URL
  };
}

// Search-ready article with guaranteed required fields
export interface SearchableArticle extends Article {
  tags: string[];
  href: string;
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
  alternates?: {
    languages?: Record<string, string>;
  };
}

// ===============================
// CARD GRID TYPES
// ===============================

/**
 * Grid item interface for SSR components
 */
/**
 * Unified grid item interface for all card/grid displays
 * Consolidates former GridItemSSR and CardItem into single source of truth
 * @usage Use for DataGrid, CardGrid, HomePageGrid, and all grid-based components
 */
export interface GridItem {
  slug: string;
  title?: string;
  name?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  articleType?: string;
  metadata?: ArticleMetadata | Record<string, unknown>;
  frontmatter?: Record<string, unknown>;
  badge?: BadgeData;
  imageUrl?: string;
  imageAlt?: string;
  href?: string;
  url?: string;
  tags?: string[];
  excerpt?: string;
  article?: Article | null;
}

/**
 * @deprecated Use GridItem instead - maintaining for backward compatibility
 * @see GridItem
 */
export type GridItemSSR = GridItem;

/**
 * CardGrid SSR-specific props interface
 */
export interface CardGridSSRProps {
  // Data sources (use one)
  items?: GridItem[];
  slugs?: string[];
  
  // Content type (for slug loading)
  contentType?: ContentType; // 'materials', 'contaminants', 'compounds', 'settings'
  
  // Display configuration
  title?: string;
  heading?: string;
  columns?: GridColumns;
  gap?: GridGap;
  
  // Layout modes
  mode?: 'simple' | 'category-grouped';
  groupByCategory?: boolean; // Alias for mode: 'category-grouped'
  
  // Category grouping options (for mode: 'category-grouped')
  maxItemsPerCategory?: number;
  categoryOrder?: string[];
  
  // Card display options
  cardMinWidth?: string;
  cardMaxWidth?: string;
  gapSize?: string;
  
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
/** @deprecated Use `Author` instead */
export type AuthorInfo = Author;
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
  content?: ReactNode;
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
 * SEO micro props
 */
export interface SEOMicroProps {
  materialName: string;
  frontmatter?: FrontmatterType;
  microData?: ParsedMicroData;
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
 * Micro image props
 */
/**
 * Micro image component props
 * Supports both simple image display (src, alt, width, height) and
 * enhanced material-specific images (imageSource, materialName, seoData)
 */
export interface MicroImageProps {
  // Simple image props
  src?: string;
  alt?: string;
  micro?: string;
  width?: number;
  height?: number;
  // Enhanced material-specific props
  imageSource?: string;
  materialName?: string;
  seoData?: {
    author?: string | { name: string };
  };
}

/**
 * FadeIn wrapper props
 */
export interface FadeInWrapperProps {
  children: ReactNode;
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
  data: Record<string, unknown> | { '@context': string; '@graph': unknown[] };
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
  variant?: "default" | "featured" | "relationship" | "category";
  imageUrl?: string; // Explicit URL for server-to-client serialization
  imageAlt?: string; // Explicit alt text
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
  bgColor?: 'transparent' | 'default' | 'body' | 'gray-50' | 'gray-100' | 'gradient-dark';
  horizPadding?: boolean;
  radius?: boolean;
  icon?: ReactNode;
  action?: ReactNode; // Optional action button/element on right side of title
  className?: string;
  children: ReactNode;
}

/**
 * Featured item for HomePageGrid
 */
export interface FeaturedItem {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
}

/**
 * HomePageGrid component props
 */
export interface HomePageGridProps {
  items: FeaturedItem[];
  title?: string;
  columns?: GridColumns;
}

// Legacy aliases for backward compatibility
export type FeaturedServiceItem = FeaturedItem;
export type ServicesSectionProps = HomePageGridProps;

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
  subcategory?: string;
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
 * MaterialDatasetDownloader component props
 */
export interface MaterialDatasetDownloaderProps {
  materialName: string;
  slug: string;
  category: string;
  subcategory: string;
  machineSettings?: Record<string, any>;
  materialProperties?: Record<string, any>;
  faq?: any[];
  regulatoryStandards?: any[];
  showFullDataset?: boolean;
}

// Legacy alias for backwards compatibility
export type MaterialDatasetCardWrapperProps = MaterialDatasetDownloaderProps;

/**
 * ContaminantDatasetDownloader component props
 */
export interface ContaminantDatasetDownloaderProps {
  contaminantName: string;
  slug: string;
  category: string;
  subcategory?: string;
  laserProperties?: any;
  visualCharacteristics?: any;
  removalByMaterial?: any;
  faq?: any[];
  regulatoryStandards?: any[];
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
// SETTINGS PAGE TYPES (Enhanced Machine Settings)
// ============================================================================

/**
 * Research citation for settings parameters
 */
export interface ResearchCitation {
  author: string;
  year: number;
  title: string;
  journal: string;
  volume?: number;
  issue?: number;
  pages?: string;
  doi: string;
  key_finding: string;
  sample_size?: number;
  confidence_level?: number;
}

/**
 * Validation metadata for research
 */
export interface ValidationMetadata {
  method: string;
  equipment: string;
  confidence: number;
  sample_size: number;
  date_verified: string;
  verified_by: string;
  revalidation_interval: string;
}

/**
 * Research basis with citations and validation
 */
export interface ResearchBasis {
  citations: ResearchCitation[];
  validation?: ValidationMetadata;
}

/**
 * Damage threshold information
 */
export interface DamageThreshold {
  too_low: string;
  too_high: string;
  warning_signs: string[];
}

/**
 * Material interaction physics
 */
export interface MaterialInteraction {
  mechanism: string;
  dominant_factor: string;
  critical_parameter: string;
  energy_coupling: number;
}

/**
 * Enhanced laser parameter (expanded from basic PropertyWithUnits)
 */
export interface EnhancedParameter {
  // Basic values (existing)
  value: number;
  unit: string;
  min: number;
  max: number;
  
  // Enhanced metadata
  optimal_range: [number, number];
  precision?: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  
  // Scientific justification
  rationale: string;
  
  // Boundary conditions
  damage_threshold?: DamageThreshold;
  
  // Material interaction
  material_interaction?: MaterialInteraction;
  
  // Research backing
  research_basis?: ResearchBasis;
}

/**
 * Material challenge with severity and solutions
 */
export interface MaterialChallenge {
  challenge: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  impact: string;
  solutions: string[];
  prevention?: string[];
}

/**
 * Categorized material challenges
 */
export interface MaterialChallenges {
  surface_characteristics: MaterialChallenge[];
  thermal_management: MaterialChallenge[];
  contamination_challenges: MaterialChallenge[];
  safety_compliance: MaterialChallenge[];
}

/**
 * Parameter Network Visualization Types
 */

/**
 * Network parameter with criticality and interaction metadata
 */
export interface NetworkParameter {
  id: string;
  name: string;
  value: number;
  unit: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  rationale?: string;
  material_interaction?: {
    mechanism?: string;
    dominant_factor?: string;
    critical_parameter?: string;
    energy_coupling?: number | string;
  };
}

/**
 * Parameter relationship types for network visualization
 */
export type RelationshipType = 'amplifies' | 'reduces' | 'constrains' | 'enables';
export type RelationshipStrength = 'strong' | 'moderate' | 'weak';

/**
 * Parameter relationship edge in network graph
 */
export interface ParameterRelationship {
  from: string;
  to: string;
  type: RelationshipType;
  strength: RelationshipStrength;
  description: string;
}

/**
 * Props for ParameterRelationships component
 */
export interface ParameterRelationshipsProps {
  parameters: NetworkParameter[];
  materialName?: string;
}

/**
 * Troubleshooting issue with diagnostic steps
 */
export interface TroubleshootingIssue {
  symptom: string;
  causes: string[];
  solutions: string[];
  verification: string;
  prevention: string[];
}

/**
 * Quality metrics for expected outcomes (detailed structure)
 */
export interface DetailedQualityMetrics {
  surface_roughness?: {
    target: string;
    tolerance: string;
    measurement_method: string;
  };
  contamination_removal?: {
    target_removal: string;
    acceptable_range: string;
    verification_method: string;
  };
  substrate_integrity?: {
    no_damage_threshold: string;
    inspection_method: string;
  };
  process_efficiency?: {
    cleaning_rate: string;
    area_coverage: string;
  };
}

/**
 * Enhanced machine settings for authority pages
 */
export interface EnhancedMachineSettings {
  essential_parameters: {
    powerRange?: EnhancedParameter;
    wavelength?: EnhancedParameter;
    spotSize?: EnhancedParameter;
    repetitionRate?: EnhancedParameter;
    energyDensity?: EnhancedParameter;
    pulseWidth?: EnhancedParameter;
    scanSpeed?: EnhancedParameter;
    passCount?: EnhancedParameter;
    overlapRatio?: EnhancedParameter;
  };
  material_challenges?: MaterialChallenges;
  expected_outcomes?: DetailedQualityMetrics;
  common_issues?: TroubleshootingIssue[];
}

/**
 * Settings page metadata (separate from ArticleMetadata to avoid conflicts)
 */
export interface SettingsMetadata {
  name: string;
  materialRef?: string; // NEW: Reference to material frontmatter for property inheritance
  category: string;
  subcategory: string;
  title: string;
  subtitle?: string;
  description: string;
  slug?: string;
  content_type?: string;
  schema_version?: string;
  active?: boolean;
  author?: Author;
  datePublished?: string;
  dateModified?: string;
  breadcrumb?: BreadcrumbItem[];
  images?: {
    hero?: {
      url: string;
      alt: string;
      width?: number;
      height?: number;
    };
    micro?: {
      url: string;
      alt: string;
    };
  };
  
  // Unified help system (FAQ and troubleshooting)
  help?: HelpSection[];
  
  // Legacy format support (machineSettings.essential_parameters)
  machineSettings?: EnhancedMachineSettings;
  
  // NEW: Hybrid approach component-specific structure
  components?: {
    parameter_relationships?: {
      parameters: Array<{
        id: string;
        name: string;
        value: number;
        unit: string;
        optimal_range: [number, number];
        criticality: 'critical' | 'high' | 'medium' | 'low';
        rationale: string;
        damage_threshold?: {
          too_low: string;
          too_high: string;
          warning_signs?: string[];
        };
        material_interaction?: {
          mechanism: string;
          dominant_factor: string;
          critical_parameter?: string;
          energy_coupling?: string;
        };
        research?: string[]; // References to research_library keys
      }>;
    };
    safety_heatmap?: {
      power_range: { min: number; max: number; current: number };
      pulse_range: { min: number; max: number; current: number };
    };
    thermal_accumulation?: {
      defaults: {
        power: number;
        rep_rate: number;
        scan_speed: number;
        pass_count: number;
      };
    };
    diagnostic_center?: {
      challenges: Record<string, Array<{
        challenge: string;
        severity: string;
        impact: string;
        solutions: string[];
        prevention: string;
      }>>;
      troubleshooting: Array<{
        symptom: string;
        causes: string[];
        solutions: string[];
        verification: string;
        prevention: string;
      }>;
    };
  };
  
  // NEW: Research citations library
  research_library?: Record<string, {
    id: string;
    author: string;
    year: number;
    title: string;
    journal: string;
    volume?: string;
    issue?: string;
    doi: string;
    url: string;
    key_finding: string;
    relevance: string;
    validation?: {
      method: string;
      equipment: string;
      confidence: string;
      sample_size: string;
    };
  }>;
  
  // NEW: Expert answers for E-E-A-T enhanced troubleshooting
  expertAnswers?: ExpertAnswerItem[];
  
  // NEW: Equipment and outcomes (settings-specific)
  equipment_requirements?: any;
  expected_outcomes?: any;
  
  // SEO (consolidated)
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  seo_settings_page?: {
    title: string;
    description: string;
    keywords: string[];
  };
  
  // E-E-A-T signals
  eeat?: {
    reviewedBy?: string;
    citations?: string[];
    isBasedOn?: {
      name: string;
      type?: string;
      url?: string;
    };
  };
  
  // Internal: Loaded material properties from materialRef
  _materialProperties?: any;
  _metadata?: {
    structure_version?: string;
    optimization_applied?: boolean;
    last_updated?: string;
    size_reduction?: string;
  };
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

// ============================================================================
// HEATMAP TYPES - For visualization components
// ============================================================================

/**
 * Material properties specific to heatmap calculations
 * Subset of MaterialProperties focused on thermal and laser interactions
 */
export interface HeatmapMaterialProperties {
  // Core thermal properties
  thermalConductivity?: number;  // W/m·K
  thermalDiffusivity?: number;    // m²/s
  heatCapacity?: number;          // J/(kg·K) or specificHeat
  specificHeat?: number;          // J/(kg·K) - alternative name
  
  // Temperature thresholds
  meltingPoint?: number;          // K
  boilingPoint?: number;          // K
  oxidationTemperature?: number;  // K
  thermalDestructionPoint?: number; // K
  
  // Laser interaction properties
  ablationThreshold?: number;     // J/cm²
  laserDamageThreshold?: number;  // J/cm²
  absorptivity?: number;          // dimensionless
  absorptionCoefficient?: number; // m^-1
  laserReflectivity?: number;     // dimensionless
  
  // Thermal dynamics
  thermalRelaxationTime?: number; // s
  thermalExpansionCoefficient?: number; // 1/K
  thermalShockResistance?: number; // K
  heatAffectedZoneDepth?: number; // μm
  
  // Material characteristics (for energy coupling analysis)
  density?: number;               // g/cm³ or kg/m³
  porosity?: number;              // % void fraction
  surfaceRoughness?: number;      // μm
  
  // Machine parameters for physics calculations
  repetitionRate?: number; // Hz (converted from kHz in settings)
  spotDiameter?: number;   // μm (from spotSize in settings)
}

/**
 * Props for heatmap visualization components
 * Used by MaterialSafetyHeatmap, ProcessEffectivenessHeatmap, DamageThresholdHeatmap
 */
export interface HeatmapProps {
  powerRange: { min: number; max: number; current: number };
  pulseRange: { min: number; max: number; current: number };
  optimalPower: [number, number];
  optimalPulse: [number, number];
  materialProperties?: HeatmapMaterialProperties;
}

/**
 * Range specification for heatmap axes
 */
export interface HeatmapRange {
  min: number;
  max: number;
  current: number;
}

/**
 * Analysis data for a heatmap cell
 */
export interface HeatmapCellAnalysis {
  level: number;
  finalScore: number;
  [key: string]: any; // Allow arbitrary analysis data
}

/**
 * Currently hovered cell in heatmap
 */
export interface HeatmapHoveredCell {
  power: number;
  pulse: number;
  analysis?: HeatmapCellAnalysis;
}

/**
 * Color anchor point for heatmap gradient
 */
export interface HeatmapColorAnchor {
  level: number;
  color: string;
}

/**
 * Legend item for heatmap
 */
export interface HeatmapLegendItem {
  color: string;
  label: string;
  range?: string;
}

/**
 * Factor card configuration for heatmap analysis panels
 * Used by BaseHeatmap to render factor analysis cards
 */
export interface HeatmapFactorCardConfig {
  id: string;
  label: string;
  weight: string;  // e.g., "50%"
  description: string;
  color: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'lime';
  getValue: (analysis: HeatmapCellAnalysis) => number;  // 0-1 score
  dataRows?: Array<{
    label: string;
    getValue: (analysis: HeatmapCellAnalysis) => string;
    getColor?: (analysis: HeatmapCellAnalysis) => string;
  }>;
  getStatus?: (analysis: HeatmapCellAnalysis) => {
    text: string;
    color: 'green' | 'yellow' | 'orange' | 'red' | 'lime';
  } | null;
}

/**
 * Base props for heatmap components
 */
export interface BaseHeatmapProps {
  powerRange: HeatmapRange;
  pulseRange: HeatmapRange;
  optimalPower: [number, number];
  optimalPulse: [number, number];
  materialProperties?: HeatmapMaterialProperties;
  title: string;
  description?: string;
  icon?: ReactNode;
  thumbnail?: string;
  materialLink?: string;
  gridRows?: number;
  gridCols?: number;
  
  // Required callback for calculating cell scores
  calculateScore: (power: number, pulse: number, materialProperties?: HeatmapMaterialProperties) => { level: number; analysis: HeatmapCellAnalysis };
  
  // Color mapping configuration (optional - uses default gradient if not provided)
  colorAnchors?: HeatmapColorAnchor[];
  
  // UI customization
  getScoreLabel: (level: number) => string;
  legendItems?: HeatmapLegendItem[];
  
  // Analysis panel options (choose one):
  // Option 1: Provide factor cards and let BaseHeatmap render the panel
  factorCards?: HeatmapFactorCardConfig[];
  scoreType?: 'safety' | 'effectiveness';  // Controls status summary styling
  
  // Option 2: Provide custom renderer for full control
  renderAnalysisPanel?: (hoveredCell: HeatmapHoveredCell | null, currentPower: number, currentPulse: number) => ReactNode;
  
  // Optional: Footer description
  footerDescription?: ReactNode;
  
  // Adaptive color scaling: normalize colors to actual data range (default: true)
  adaptiveColorScale?: boolean;
}

// ============================================================================
// CITATION TYPES - For research citations and references
// ============================================================================

/**
 * Key finding from research citation
 */
export interface CitationKeyFinding {
  finding: string;
  specific_value?: string;
  confidence: number;
}

/**
 * Quality indicators for research citation
 */
export interface CitationQualityIndicators {
  peer_reviewed?: boolean;
  impact_factor?: number;
  citation_count?: number;
  authority?: string;
}

/**
 * Research citation structure
 * Used in research_library and Citations component
 */
export interface Citation {
  type?: 'journal_article' | 'industry_standard' | 'government_database' | 'textbook' | 'ai_research';
  author: string;
  year: number;
  title: string;
  journal?: string;
  volume?: string;
  issue?: string;
  doi?: string;
  url?: string;
  key_findings?: CitationKeyFinding[];
  quality_indicators?: CitationQualityIndicators;
  relevance_to_our_work?: string;
  // Legacy fields for backward compatibility
  key_finding?: string;
  relevance?: string;
}

/**
 * Props for Citations component
 */
export interface CitationsProps {
  research_library: Record<string, Citation>;
  materialName?: string;
}

// ============================================================================
// COMPONENT-SPECIFIC INTERFACES
// Centralized from individual component files for complete type consolidation
// ============================================================================

/**
 * Micro component internal interfaces
 */
export interface MicroContentProps {
  before: string;
  after: string;
  content: string;
  materialName?: string;
  frontmatter?: FrontmatterType;
  seoData?: {
    description?: string;
    keywords?: string[];
    author?: string;
  };
}

export interface MicroHeaderProps {
  materialName: string;
  frontmatter?: FrontmatterType;
  microData?: ParsedMicroData;
}

export interface MetadataDisplayProps {
  metadata?: {
    generated?: string;
    format?: string;
    version?: string;
  };
  material?: string;
  show: boolean;
  frontmatter?: FrontmatterType;
}

export interface TechnicalDetailsProps {
  laserParams?: {
    wavelength?: number;
    power?: number;
    pulse_duration?: number;
    spot_size?: number;
    frequency?: number;
    energy_density?: number;
  };
  show: boolean;
  frontmatter?: FrontmatterType;
}

export interface MicroYamlData {
  before?: string;
  after?: string;
  material?: string;
  laser_parameters?: {
    wavelength?: number;
    power?: number;
    pulse_duration?: number;
    spot_size?: number;
    frequency?: number;
    energy_density?: number;
  };
  metadata?: {
    generated?: string;
    format?: string;
    version?: string;
  };
}

export interface EnhancedMicroYamlData extends MicroYamlData {
  before_text?: string;
  after_text?: string;
  quality_metrics?: {
    contamination_removal?: string;
    surface_roughness_before?: string;
    surface_roughness_after?: string;
    thermal_damage?: string;
    substrate_integrity?: string;
    processing_efficiency?: string;
    confidence_score?: number;
    validation_status?: string;
  };
  author_object?: Author;
}

/**
 * Schedule component interfaces
 */
export interface BookingCTAProps {
  variant?: 'default' | 'featured';
  className?: string;
}

export interface WorkizWidgetProps {
  className?: string;
}

/**
 * Dataset component interfaces
 */
export interface BulkDownloadWrapperProps {
  materials: any[];
  categoryStats: Record<string, number>;
}

export interface CategoryBundlesProps {
  categoryStats: Record<string, number>;
  materials: any[];
}

export interface CompleteDatabaseProps {
  totalMaterials: number;
}

export interface DatasetDownloadProps extends MaterialDatasetDownloaderProps {
  showFullDataset?: boolean;
}

export interface DatasetSectionClientProps {
  title: string;
  description: string;
  stats: Array<{
    value: string | number;
    label: string;
  }>;
  formats: Array<'json' | 'csv' | 'txt'>;
  includes?: Array<string>;
  note?: string;
  categoryLink?: {
    href: string;
    label: string;
  };
  fullDatasetLink?: boolean;
  materialData?: any;
}

export interface DatasetsContentProps {
  materials: any[];
}

export interface DownloadCardProps {
  format: 'JSON' | 'CSV' | 'TXT';
  size: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface MaterialBrowserExtendedProps extends MaterialBrowserProps {
  showSearch?: boolean;
  showFilters?: boolean;
}

export interface SubcategoryData {
  name: string;
  materialCount: number;
  materials: Array<{
    name: string;
    slug: string;
  }>;
}

export interface SubcategoryDatasetCardsProps {
  subcategories: SubcategoryData[];
  category: string;
}

export interface SubcategoryDatasetWrapperProps {
  category: string;
  subcategory: string;
  materials: Array<{
    name: string;
    slug: string;
    category: string;
    subcategory: string;
  }>;
}

/**
 * Heatmap component interfaces
 */

/**
 * Shared props for all heatmap visualization components
 * Use this type for MaterialSafetyHeatmap, ProcessEffectivenessHeatmap,
 * ThermalStressHeatmap, and EnergyCouplingHeatmap
 */
export interface HeatmapVisualizationProps {
  powerRange: HeatmapRange;
  pulseRange: HeatmapRange;
  optimalPower: [number, number];
  optimalPulse: [number, number];
  materialProperties?: HeatmapMaterialProperties;
}

export interface AnalysisCardsProps {
  hoveredCell: {
    power: number;
    pulse: number;
    analysis: {
      level: number;
      finalScore: number;
      [key: string]: any;
    };
  } | null;
  currentPower: number;
  currentPulse: number;
}

/**
 * Energy coupling heatmap props
 * @see HeatmapVisualizationProps
 */
export type EnergyCouplingHeatmapProps = HeatmapVisualizationProps;

export interface HeatmapFactorCardProps {
  id: string;
  label: string;
  weight: string;
  description: string;
  score: number;
  color: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'lime';
  dataRows?: Array<{
    label: string;
    value: string;
    color?: string;
  }>;
  status?: {
    text: string;
    color: 'green' | 'yellow' | 'orange' | 'red' | 'lime';
  } | null;
}

export interface HeatmapStatusSummaryProps {
  level: number;
  scoreType?: 'safety' | 'effectiveness';
}

/**
 * Material safety heatmap props
 * @see HeatmapVisualizationProps
 */
export type MaterialSafetyHeatmapProps = HeatmapVisualizationProps;

/**
 * Process effectiveness heatmap props
 * @see HeatmapVisualizationProps
 */
export type ProcessEffectivenessHeatmapProps = HeatmapVisualizationProps;

/**
 * Thermal stress heatmap props
 * @see HeatmapVisualizationProps
 */
export type ThermalStressHeatmapProps = HeatmapVisualizationProps;

export interface StatusSummaryData {
  level: number;
  scoreType?: 'safety' | 'effectiveness';
}

/**
 * Heat Buildup component interfaces
 */
export interface HeatAnalysisCardsProps {
  heatAccumulation: number;
  thermalRelaxation: number;
  effectiveRepRate: number;
  thermalStress: number;
  materialProperties?: HeatmapMaterialProperties;
}

export interface HeatBuildupProps {
  materialProperties?: HeatmapMaterialProperties;
  defaultPower?: number;
  defaultRepRate?: number;
  defaultScanSpeed?: number;
  defaultPassCount?: number;
}

export interface HeatFactorData {
  label: string;
  value: string;
  description: string;
  status: 'safe' | 'warning' | 'danger';
  icon?: ReactNode;
}

export interface HeatStatusData {
  status: 'safe' | 'warning' | 'danger';
  message: string;
  recommendation?: string;
}

/**
 * Icon component interfaces
 */
export interface IconProps {
  className?: string;
  size?: number;
}

/**
 * Contamination component interfaces
 */
export interface IndustriesGridProps {
  industries: Industry[];
}

export interface Industry {
  name: string;
  frequency: string;
  use_cases: string[];
  materials: string[];
}

export interface QuickFactsCardProps {
  facts: QuickFact[];
}

export interface QuickFact {
  label: string;
  value: string;
  unit?: string;
  icon?: string;
}

export interface SafetyWarningsGridProps {
  warnings: SafetyData;
}

export interface SafetyData {
  critical_warnings: Warning[];
  high_priority_warnings: Warning[];
  moderate_warnings: Warning[];
  hazardous_fumes: Fume[];
}

export interface Warning {
  icon: string;
  message: string;
  ppe_required?: string;
  mitigation?: string;
  best_practice?: string;
}

export interface Fume {
  compound: string;
  concentration: string;
  exposure_limit: string;
  hazard_class: string;
  exceeds_limit: boolean;
}

export interface TechnicalSpecsTableProps {
  specs: Record<string, {
    min: number;
    max: number;
    recommended: number;
    unit: string;
  }>;
}

/**
 * Other component interfaces
 */
export interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: ComponentSize;
  className?: string;
}

export interface BadgeSymbolProps {
  symbol: string;
  formula?: string;
  materialType?: MaterialType;
  className?: string;
}

export interface ButtonIconProps {
  icon: ReactNode;
  label?: string;
  onClick?: () => void;
  className?: string;
}

export interface DatePanelProps {
  datePublished?: string;
  dateModified?: string;
  className?: string;
}

export interface DiagnosticCenterProps {
  challenges?: Record<string, any[]>;
  troubleshooting?: any[];
  materialName?: string;
}

export interface Issue {
  symptom: string;
  causes: string[];
  solutions: string[];
  verification: string;
  prevention: string[];
}

export interface Challenge {
  challenge: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  impact: string;
  solutions: string[];
  prevention?: string;
}

export interface PreventionTabProps {
  challenges: Record<string, Challenge[]>;
}

export interface QuickReferenceTabProps {
  challenges: Record<string, Challenge[]>;
  troubleshooting: Issue[];
}

export interface TroubleshootingTabProps {
  issues: Issue[];
}

export interface LaserMaterialInteractionProps {
  materialProperties?: HeatmapMaterialProperties;
  currentPower?: number;
  currentPulse?: number;
}

export interface MachineSettingsProps {
  metadata: SettingsMetadata | ArticleMetadata;
}

export interface MaterialCharacteristicsProps {
  properties: Record<string, any>;
}

export interface MaterialsLayoutProps extends LayoutProps {
  showMicroImage?: boolean;
}

export interface PricingProps {
  plans: Array<{
    name: string;
    price: string;
    features: string[];
    highlighted?: boolean;
  }>;
}

export interface PropertyBarsProps {
  properties: Record<string, PropertyValue | PropertyCategory>;
  materialName?: string;
}

export interface PropertyData {
  key: string;
  value: number;
  unit: string;
  min?: number;
  max?: number;
}

export interface ResearchPageProps {
  data: any;
  category: string;
  subcategory: string;
  materialSlug: string;
  property: string;
}

export interface SafetyWarningProps {
  materialName: string;
  warningText?: string;
  className?: string;
}

export interface SectionContainerInternalProps extends SectionContainerBaseProps {
  variant?: 'default' | 'dark' | 'light';
}

export interface SectionContainerBaseProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'dark' | 'light';
  id?: string;
}

export interface SectionTitleProps {
  title: string;
  subtitle?: string;
  alignment?: 'left' | 'center' | 'right';
  className?: string;
}

export interface SettingValue {
  value: number | string;
  unit?: string;
  min?: number;
  max?: number;
}

/**
 * Settings Layout Props - Extends base LayoutProps for consistency
 * Normalized to match MaterialsLayoutProps and ContaminantsLayoutProps pattern
 */
export interface SettingsLayoutProps extends LayoutProps {
  materialProperties?: any;
  category: string;
  subcategory: string;
  slug: string;
}

/**
 * Content Section component interfaces
 */
export interface EnvironmentalImpactProps {
  environmentalImpact: Record<string, any>;
  className?: string;
}

export interface FAQMaterialProps {
  materialName: string;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  className?: string;
}

export interface FAQSettingsProps {
  settingName: string;
  help?: HelpSection[];
  expertAnswers?: ExpertAnswerItem[];
  className?: string;
}

export interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// ===============================
// GRID MAPPER TYPES
// ===============================

/**
 * Enhanced compound interface (from produces_compounds top-level field)
 */
export interface EnhancedCompound {
  id: string;
  title: string;
  url: string;
  image: string;
  category: string;
  subcategory: string;
  frequency: 'very_common' | 'common' | 'occasional' | 'rare';
  severity: 'severe' | 'high' | 'moderate' | 'low';
  typical_context: string;
  exposure_risk: 'high' | 'moderate' | 'low';
  concentration_range: string;
  hazard_class: 'carcinogenic' | 'toxic' | 'irritant' | 'corrosive' | 'asphyxiant' | 'flammable';
  exposure_limits: {
    osha_pel_mg_m3: number | null;
    niosh_rel_mg_m3: number | null;
    acgih_tlv_mg_m3: number | null;
    idlh_mg_m3: number | null;
  };
  exceeds_limits: boolean;
  monitoring_required: boolean;
  control_measures: {
    ventilation_required: boolean;
    ppe_level: 'none' | 'basic' | 'enhanced' | 'full';
    filtration_type: string | null;
  };
}

/**
 * Domain linkage interface (from related_* top-level fields)
 */
export interface Relationship {
  id: string;
  title: string;
  url: string;
  image: string;
  category: string;
  subcategory: string;
  frequency: 'very_common' | 'common' | 'occasional' | 'rare';
  severity: 'severe' | 'high' | 'moderate' | 'low';
  typical_context: string;
}

/**
 * Simple related material type from frontmatter
 */
export interface RelatedMaterial {
  title: string;
  url: string;
  material_type?: string;
  micro?: string;
}

/**
 * Simple related contaminant type from frontmatter
 */
export interface RelatedContaminant {
  title: string;
  url: string;
  contaminant_category?: string;
  micro?: string;
}

/**
 * Simple related setting type from frontmatter
 */
export interface RelatedSetting {
  title: string;
  url: string;
  setting_category?: string;
  micro?: string;
}

// ===============================
// LAYOUT COMPONENT PROPS
// ===============================

/**
 * Section configuration for content layouts
 */
export interface SectionConfig {
  component: React.ComponentType<any>;
  condition?: boolean | (() => boolean);
  props?: Record<string, any>;
}

/**
 * Base content layout props
 */
export interface BaseContentLayoutProps extends LayoutProps {
  slug?: string;
  category?: string;
  subcategory?: string;
  contentType: 'materials' | 'contaminants' | 'compounds' | 'settings';
  sections?: SectionConfig[];
  showMicro?: boolean;
  enrichedMetadata?: any;
}

/**
 * Contaminants layout specific props
 */
export interface ContaminantsLayoutProps extends LayoutProps {
  slug: string;
  category?: string;
  subcategory?: string;
}

/**
 * Compounds layout specific props
 */
export interface CompoundsLayoutProps extends LayoutProps {
  slug: string;
  category?: string;
  subcategory?: string;
}

/**
 * Settings layout specific props
 */
export interface SettingsLayoutProps extends LayoutProps {
  materialProperties?: any;
  category: string;
  subcategory: string;
  slug: string;
}

/**
 * Item page props (generic content page)
 */
export interface ItemPageProps {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

// ===============================
// GRID COMPONENT PROPS
// ===============================

/**
 * Data grid props (generic grid component)
 */
export interface DataGridProps<T> {
  items: T[];
  columns?: 2 | 3 | 4;
  variant?: 'default' | 'relationship';
  showBadgeSymbols?: boolean;
  mode?: 'simple' | 'category-grouped';
  filterBy?: 'category' | 'subcategory' | 'all';
  className?: string;
  mapper?: (item: T) => GridItem;
  sorter?: (a: T, b: T) => number;
}

/**
 * Hazardous compounds grid props
 */
export interface HazardousCompoundsGridProps {
  compounds: EnhancedCompound[];
  title?: string;
  columns?: 2 | 3 | 4;
  showConcentrations?: boolean;
  showExceedsWarnings?: boolean;
  filterBySeverity?: 'severe' | 'high' | 'moderate' | 'low';
  sortBy?: 'severity' | 'frequency' | 'alphabetical';
  className?: string;
}

/**
 * Compound safety grid sort strategies
 */
export type SortStrategy = 
  | 'severity-desc'
  | 'severity-asc'
  | 'exposure-desc'
  | 'exposure-asc'
  | 'alphabetical-asc'
  | 'alphabetical-desc';

/**
 * Compound safety grid props
 */
export interface CompoundSafetyGridProps {
  compounds: EnhancedCompound[];
  title?: string;
  columns?: number;
  mode?: 'default' | 'compact' | 'detailed';
  sortStrategy?: SortStrategy;
  filterBySeverity?: 'severe' | 'high' | 'moderate' | 'low';
  showControls?: boolean;
  className?: string;
}

// ===============================
// CATEGORY INFO TYPES (CONSOLIDATED)
// ===============================

/**
 * Category information (materials, contaminants, compounds, settings)
 */
export interface CategoryInfo {
  slug: string;
  name: string;
  title: string;
  description: string;
  subcategories?: SubcategoryInfo[];
}

/**
 * Subcategory information
 */
export interface SubcategoryInfo {
  slug: string;
  name: string;
  title: string;
  description?: string;
}

/**
 * Material information
 */
export interface MaterialInfo {
  slug: string;
  name: string;
  category: string;
  subcategory?: string;
}

/**
 * Contaminant information
 */
export interface ContaminantInfo {
  slug: string;
  name: string;
  category: string;
  subcategory?: string;
}

/**
 * Compound information
 */
export interface CompoundInfo {
  slug: string;
  name: string;
  category: string;
  subcategory?: string;
}
