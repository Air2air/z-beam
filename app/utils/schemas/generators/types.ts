/**
 * Shared types for JSON-LD schema generators
 */

export interface SchemaContext {
  slug: string;
  baseUrl: string;
  pageUrl: string;
  currentDate: string;
}

export interface AuthorData {
  id?: string;
  name?: string;
  title?: string;
  expertise?: string | string[];
  country?: string;
  email?: string;
}

export interface ImageData {
  url: string;
  alt?: string;
  micro?: string;
  width?: number;
  height?: number;
}

export interface PropertyValue {
  value: unknown;
  unit?: string;
  confidence?: number;
  metadata?: {
    last_verified?: string;
    source?: string;
  };
}

// Schema.org JSON-LD base types
export interface SchemaOrgBase {
  '@context'?: string;  // Optional - added at Graph level
  '@type': string;
  [key: string]: unknown;
}

// JSON-LD Graph container type - used when combining multiple schemas
// Note: @graph format doesn't have @type at root level (it's implicit)
export interface SchemaOrgGraph {
  '@context': string;
  '@graph': SchemaOrgBase[];
}

export interface SchemaOrgThing extends SchemaOrgBase {
  name?: string;
  description?: string;
  url?: string;
  image?: string | ImageObject | ImageObject[];
  identifier?: string;
}

export interface ImageObject {
  '@type': 'ImageObject';
  url: string;
  width?: number;
  height?: number;
  micro?: string;
  contentUrl?: string;
  // Image License Metadata (Google Rich Results)
  // @see https://developers.google.com/search/docs/appearance/structured-data/image-license-metadata
  license?: string;
  acquireLicensePage?: string;
  creditText?: string;
  copyrightNotice?: string;
  creator?: PersonObject | { '@type': 'Person'; name: string; url?: string };
}

export interface PersonObject {
  '@type': 'Person';
  name: string;
  jobTitle?: string;
  email?: string;
  url?: string;
  image?: string | ImageObject;
  knowsAbout?: string[];
  sameAs?: string[];
}

export interface OrganizationObject {
  '@type': 'Organization';
  name: string;
  url?: string;
  logo?: ImageObject;
  contactPoint?: ContactPointObject[];
}

export interface ContactPointObject {
  '@type': 'ContactPoint';
  telephone?: string;
  email?: string;
  contactType?: string;
  areaServed?: string;
  availableLanguage?: string[];
}

export interface BreadcrumbListObject {
  '@type': 'BreadcrumbList';
  itemListElement: ListItemObject[];
}

export interface ListItemObject {
  '@type': 'ListItem';
  position: number;
  name: string;
  item?: string;
}

/**
 * SpeakableSpecification for voice search optimization
 * Marks content sections that are especially suitable for text-to-speech
 * @see https://schema.org/SpeakableSpecification
 */
export interface SpeakableSpecification {
  '@type': 'SpeakableSpecification';
  /** CSS selectors pointing to speakable content */
  cssSelector?: string[];
  /** XPath expressions pointing to speakable content */
  xpath?: string[];
}

// Material properties types
export interface MaterialPropertyValue {
  value?: unknown;
  unit?: string;
  min?: number;
  max?: number;
  confidence?: number;
  metadata?: Record<string, unknown>;
}

// Import MaterialProperties from centralized types
import type { MaterialProperties } from '@/types';
export type { MaterialProperties };

// Frontmatter types
export interface FrontmatterBase {
  title?: string;
  description?: string;
  slug?: string;
  author?: AuthorData | string;
  publishDate?: string;
  modifiedDate?: string;
  image?: string | ImageData;
  tags?: string[];
  category?: string;
  subcategory?: string;
}

export interface MaterialFrontmatter extends FrontmatterBase {
  materialType?: string;
  description?: string;
  materialProperties?: MaterialProperties;
  machineSettings?: Record<string, unknown>;
  applications?: string[];
  benefits?: string[];
  equipment?: unknown[];
}

export interface ArticleFrontmatter extends FrontmatterBase {
  content?: string;
  excerpt?: string;
  readingTime?: number;
}

// Component data types
export interface ComponentData {
  type?: string;
  title?: string;
  content?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ContentCard {
  title?: string;
  description?: string;
  icon?: string;
  link?: string;
  [key: string]: unknown;
}

// Schema generation data
export interface SchemaData {
  frontmatter?: FrontmatterBase | MaterialFrontmatter | ArticleFrontmatter | ExtendedFrontmatter;
  content?: string;
  components?: ComponentData[];
  contentCards?: ContentCard[];
  equipment?: unknown[];
  workflow?: unknown[];
  faq?: unknown[];
  contactPoint?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  businessInfo?: Record<string, unknown>;
  // Additional data fields
  courseData?: unknown;
  trainingData?: unknown;
  steps?: unknown[];
  eventData?: unknown;
  reviews?: unknown[];
  testimonials?: unknown[];
  video?: unknown;
  youtubeUrl?: string;
  images?: unknown[];
  author?: AuthorData | string;
  [key: string]: unknown;
}

// ============================================================================
// SERVICE OFFERING TYPES - For frontmatter serviceOffering field
// ============================================================================

/**
 * Material-specific service details from frontmatter
 */
export interface ServiceOfferingMaterialSpecific {
  /** Minimum hours for typical job (usually 1) */
  estimatedHoursMin: number;
  /** Typical hours based on material difficulty */
  estimatedHoursTypical: number;
  /** List of contaminants this service removes */
  targetContaminants: string[];
  /** Optional material-specific safety or process notes */
  notes?: string;
}

/**
 * Service offering configuration from frontmatter
 * Pricing is pulled from SITE_CONFIG.pricing based on type
 */
export interface ServiceOffering {
  /** Enable service schema generation */
  isEnabled: boolean;
  /** Service type - maps to SITE_CONFIG.pricing key */
  type: 'professionalCleaning' | 'equipmentRental';
  /** Material-specific service details */
  materialSpecific: ServiceOfferingMaterialSpecific;
}

// Extended frontmatter with additional properties
export interface ExtendedFrontmatter extends MaterialFrontmatter {
  faq?: unknown[];
  outcomeMetrics?: unknown;
  environmentalImpact?: unknown;
  video?: unknown;
  images?: unknown[];
  regulatoryStandards?: unknown[];
  /** Service offering for JSON-LD Service schema */
  serviceOffering?: ServiceOffering;
}
