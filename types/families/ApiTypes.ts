// types/families/ApiTypes.ts
// API-related interfaces and response types

/**
 * Generic API response structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

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
 * Search result item for API responses
 */
export interface SearchResultItem {
  slug: string;
  title: string;
  name?: string;
  description?: string;
  type: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  href: string;
  image?: string;
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
 * Search parameters
 */
export interface SearchParams {
  query?: string;
  filters?: FilterParams;
  pagination?: PaginationParams;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
