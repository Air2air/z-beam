// types/api/index.ts
// API related types

import { ArticleMetadata, BadgeData } from '../core';

/**
 * API response structure
 */
export interface ApiResponse<T = any> {
  /** Response data */
  data?: T;
  
  /** Success flag */
  success: boolean;
  
  /** Error message if any */
  error?: string;
  
  /** Response message */
  message?: string;
  
  /** Response metadata */
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    [key: string]: unknown;
  };
}

/**
 * Search API response
 */
export interface SearchApiResponse extends ApiResponse {
  /** Search results */
  data: {
    /** Result items */
    results: SearchResultItem[];
    
    /** Total count */
    total: number;
    
    /** Query used */
    query: string;
    
    /** Filters applied */
    filters?: Record<string, unknown>;
  };
}

/**
 * Search result item
 */
export interface SearchResultItem {
  /** Item ID */
  id: string;
  
  /** Content slug */
  slug: string;
  
  /** Title */
  title: string;
  
  /** Description */
  description?: string;
  
  /** Content type */
  type: string;
  
  /** Category */
  category?: string;
  
  /** Tags */
  tags?: string[];
  
  /** Score (relevance) */
  score?: number;
  
  /** Associated metadata */
  metadata?: ArticleMetadata;
  
  /** Badge data */
  badge?: BadgeData;
  
  /** Thumbnail URL */
  thumbnail?: string;
  
  /** Link URL */
  url?: string;
}

/**
 * Materials API response
 */
export interface MaterialsApiResponse extends ApiResponse {
  /** Materials data */
  data: {
    /** Material items */
    materials: MaterialItem[];
  };
}

/**
 * Material item
 */
export interface MaterialItem {
  /** Material name */
  name: string;
  
  /** Material type */
  type: string;
  
  /** Status */
  status: 'active' | 'inactive';
  
  /** Chemical properties */
  chemicalProperties?: {
    symbol?: string;
    formula?: string;
    atomicNumber?: number;
    materialType?: string;
  };
  
  /** Additional properties */
  [key: string]: unknown;
}

/**
 * Debug API response
 */
export interface DebugApiResponse extends ApiResponse {
  /** Debug data */
  data: {
    /** Debug category */
    category: string;
    
    /** Debug items */
    items: DebugItem[];
    
    /** Metadata */
    metadata?: Record<string, unknown>;
  };
}

/**
 * Debug item
 */
export interface DebugItem {
  /** Item ID */
  id: string;
  
  /** Item name */
  name: string;
  
  /** Item type */
  type: string;
  
  /** Status */
  status: string;
  
  /** Debug data */
  data?: Record<string, unknown>;
}
