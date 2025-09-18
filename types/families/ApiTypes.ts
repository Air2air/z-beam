// types/families/ApiTypes.ts
// API-related interfaces and response types - All importing from centralized source

// Import all API types from centralized source
import type { 
  ApiResponse, 
  SearchResultItem,
  SearchApiResponse,
  MaterialsApiResponse,
  MaterialItem,
  DebugApiResponse,
  DebugItem,
  PaginationParams,
  FilterParams,
  ApiSearchParams
} from '../centralized';

// Re-export all API types for organized import paths
export type { 
  ApiResponse, 
  SearchResultItem,
  SearchApiResponse,
  MaterialsApiResponse,
  MaterialItem,
  DebugApiResponse,
  DebugItem,
  PaginationParams,
  FilterParams,
  ApiSearchParams as SearchParams // Rename to avoid conflict with URL SearchParams
};
