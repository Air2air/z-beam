// app/types/content.ts
// Unified content types for the Z-Beam website

export interface ArticleMetadata {
  title: string;
  articleType: "material" | "author" | "region" | "application" | "thesaurus"; // Renamed for global consistency
  nameShort?: string;
  publishedAt: string | null;
  summary: string;
  description?: string;
  image?: string;
  thumbnail?: string | null;
  imageCaption?: string;
  tags?: string[]; // Content tags
  atomicNumber?: number | null;
  chemicalSymbol?: string | null;
  materialType?: string;
  metalClass?: string;
  crystalStructure?: string;
  primaryApplication?: string;
  // Author reference
  authorId?: number; // Reference to author by unique integer ID
}

// -------- SPECIFIC CATEGORY METADATA TYPES --------

export interface MaterialMetadata extends ArticleMetadata {
  articleType: "material";
  nameShort: string;
  atomicNumber: number | null;
  chemicalSymbol: string | null;
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

export interface ThesaurusMetadata extends ArticleMetadata {
  articleType: "thesaurus";
  term: string;
  definition: string;
  relatedTerms?: string[];
  category?: string; // e.g., "Laser Technology", "Materials", "Process Parameters"
  abbreviation?: string;
  technicalLevel?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

export interface AuthorMetadata {
  id: number; // Unique integer identifier for the author
  slug: string; // URL-friendly slug (e.g., "dr-evelyn-reed")
  name: string;
  title: string;
  bio: string;
  linkedin?: string;
  email?: string;
  image?: string;
  specialties?: string[];
  articleType?: "author";
  publishedArticles?: number; // Count of published articles
  expertise?: string[];
  education?: string[];
}

export interface ArticlePost {
  metadata: ArticleMetadata;
  slug: string;
  content: string;
}

// -------- SPECIFIC CONTENT POST TYPES --------

export interface MaterialPost extends ArticlePost {
  metadata: MaterialMetadata;
}

export interface ApplicationPost extends ArticlePost {
  metadata: ApplicationMetadata;
}

export interface RegionPost extends ArticlePost {
  metadata: RegionMetadata;
}

export interface ThesaurusPost extends ArticlePost {
  metadata: ThesaurusMetadata;
}

export interface AuthorPost {
  metadata: AuthorMetadata;
  slug: string;
  content: string;
}

// Types for filtering and searching
export type ContentType = 'article' | 'author' | 'tag' | 'category';
export type FilterCriteria = {
  type: ContentType;
  value: string | number;
};

// Legacy type alias for backwards compatibility
export type Metadata = ArticleMetadata;
