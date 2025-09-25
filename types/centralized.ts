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
 * Article metadata (base for all content types) - enhanced version
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
  video?: string; // For video metadata
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
// CAPTION & METRICS TYPES
// ===============================

/**
 * Enhanced Caption Data Structure - Complete interface for caption content
 */
export interface CaptionDataStructure {
  before_text?: string;
  after_text?: string;
  material?: string;
  title?: string;
  description?: string;
  keywords?: string[];
  laser_parameters?: {
    wavelength?: number;
    power?: number;
    pulse_duration?: number;
    spot_size?: string;
    frequency?: number;
    energy_density?: number;
    scanning_speed?: string;
    beam_profile?: string;
    pulse_overlap?: number;
  };
  quality_metrics?: {
    contamination_removal?: string;
    surface_roughness_before?: string;
    surface_roughness_after?: string;
    thermal_damage?: string;
    substrate_integrity?: string;
    processing_efficiency?: string;
  };
  author_object?: AuthorInfo;
  chemicalProperties?: {
    composition?: string;
    surface_treatment?: string;
    contamination_type?: string;
    materialType?: string;
    formula?: string;
    surface_finish?: string;
    corrosion_resistance?: string;
    density?: string;
    meltingPoint?: string;
    thermalConductivity?: string;
  };
  technicalSpecifications?: {
    wavelength?: string;
    power?: string;
    pulse_duration?: string;
    scanning_speed?: string;
    material?: string;
    beam_delivery?: string;
    focus_diameter?: string;
    processing_atmosphere?: string;
  };
  metadata?: {
    generated?: string;
    format?: string;
    version?: string;
    analysis_method?: string;
    magnification?: string;
    field_of_view?: string;
    image_resolution?: string;
  };
  images?: {
    micro?: {
      url?: string;
      alt?: string;
      width?: number;
      height?: number;
      format?: string;
      caption?: string;
    };
  };
  accessibility?: {
    alt_text_detailed?: string;
    caption_language?: string;
    technical_level?: string;
    visual_description?: string;
  };
  seo_data?: {
    canonical_url?: string;
    og_title?: string;
    og_description?: string;
    schema_type?: string;
    last_modified?: string;
  };
}

/**
 * Legacy frontmatter interface for backward compatibility
 */
export interface FrontmatterType {
  title?: string;
  description?: string;
  keywords?: string[];
  author?: string | AuthorInfo;
  name?: string;
  images?: {
    micro?: {
      url?: string;
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
}

/**
 * Caption component props
 */
export interface CaptionProps {
  content: string | any; // CaptionData type from useCaptionParsing
  image?: string;
  frontmatter?: FrontmatterType;
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
 * MetricsGrid component props
 */
export interface MetricsGridProps {
  qualityMetrics: QualityMetrics;
  maxCards?: number;
  excludeMetrics?: string[];
  className?: string;
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
  children?: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  fullWidth?: boolean; // For pages that need full-width sections
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
 * PropertiesTable component props
 */
export interface PropertiesTableProps {
  content: string;
  config?: {
    caption?: string;
    className?: string;
  };
  data?: Record<string, any>;
  className?: string;
  showHeader?: boolean;
  title?: string;
  maxRows?: number;
  excludeKeys?: string[];
  formatters?: Record<string, (value: any) => string>;
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
  // Accessibility props
  alt?: string;
  ariaLabel?: string;
  role?: string;
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

export type ComponentVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'solid' | 'subtle';
export type ComponentSize = 'sm' | 'md' | 'lg' | 'xl';
export type ComponentType = 'propertiestable' | 'badgesymbol' | 'content' | 'caption' | 'table' | 'tags' | 'settings';
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
 * Material properties - enhanced to support dual value system
 */
export interface MaterialProperties {
  chemicalFormula?: string;
  materialType?: string;
  density?: string | PropertyWithUnits;
  meltingPoint?: string | PropertyWithUnits;
  thermalConductivity?: string | PropertyWithUnits;
  laserType?: string;
  wavelength?: string | PropertyWithUnits;
  fluenceRange?: string | PropertyWithUnits;
  [key: string]: string | number | PropertyWithUnits | undefined;
}

/**
 * Property with dual value system (text + numeric + units)
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
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Article grid item interface
 */
export interface ArticleItem {
  slug: string;
  title?: string;
  description?: string;
  href?: string;
  imageUrl?: string;
  imageAlt?: string;
  badge?: any; // Using any for now to avoid type conflicts
  tags?: string[];
  featured?: boolean;
  metadata?: Record<string, unknown>;
  height?: string;
  name?: string;
  image?: string;
  article?: {
    metadata?: Record<string, unknown>;
    components?: Record<string, ComponentData>;
  } | null;
}

/**
 * Article grid component props
 */
export interface ArticleGridProps {
  items: ArticleItem[];
  title?: string;
  heading?: string;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  showBadgeSymbols?: boolean;
  loadBadgeSymbolData?: boolean;
  variant?: 'standard' | 'featured';
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
 * Contact form data interface
 */
export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  subject: string;
  message: string;
  inquiryType: 'general' | 'quote' | 'technical' | 'sales';
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
  category: string;
  articleType: string;
  chemicalSymbol?: string;
  atomicNumber?: number;
  chemicalFormula?: string;
  featured?: boolean;
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
 * Navigation item interface
 */
export interface NavItem {
  name: string;
  href: string;
  current: boolean;
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
}

/**
 * Universal page props
 */
export interface UniversalPageProps {
  params: {
    slug: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
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
  showBreadcrumbs?: boolean;
}

/**
 * Content props interface
 */
export interface ContentProps {
  children: React.ReactNode;
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
  frontmatter: ArticleMetadata;
  content: string | CaptionDataStructure;
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
 * Section card interface
 */
export interface SectionCard {
  id: string;
  title: string;
  description: string;
  href: string;
  icon?: React.ComponentType;
  color?: string;
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
 * Frontmatter item interface
 */
export interface FrontmatterItem {
  file: string;
  frontmatter: Record<string, any>;
  errors?: string[];
}
