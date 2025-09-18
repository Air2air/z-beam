// types/api/index.ts
// API type definitions - Import from centralized source

// Import base ApiResponse and SearchResultItem from centralized source
import type { ApiResponse, SearchResultItem, ArticleMetadata, BadgeData } from '../centralized';

// Re-export for convenience
export type { ApiResponse, SearchResultItem };

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
