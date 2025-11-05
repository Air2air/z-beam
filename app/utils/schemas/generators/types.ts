/**
 * Shared types for JSON-LD schema generators
 */

export interface SchemaContext {
  baseUrl: string;
  pageUrl: string;
  currentDate?: string;
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
  caption?: string;
}

export interface PropertyValue {
  value: any;
  unit?: string;
  confidence?: number;
  metadata?: {
    last_verified?: string;
    source?: string;
  };
}
