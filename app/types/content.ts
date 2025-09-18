// app/types/content.ts
// Unified content types for the Z-Beam website

// Use centralized ArticleMetadata instead of local one
import { 
  ArticleMetadata, 
  AuthorInfo,
  MaterialMetadata,
  ApplicationMetadata,
  RegionMetadata,
  ThesaurusMetadata
} from '@/types/centralized';

// Specialized metadata types extending the centralized ArticleMetadata

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
  metadata: AuthorInfo;
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
