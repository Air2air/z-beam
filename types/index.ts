// types/index.ts
// UNIFIED TYPE EXPORTS - Single import source for all Z-Beam types
// This file replaces all scattered type imports

// Re-export everything from centralized.ts (SINGLE SOURCE OF TRUTH)
export * from './centralized';

// Backward compatibility exports from old structure (DEPRECATED - use centralized types)
export type {
  // Legacy core types (use centralized versions instead)
  MaterialType,
  BadgeSymbolData
} from './core/badge';

export type {
  // Legacy article types (use centralized versions instead)
  MaterialMetadata,
  ApplicationMetadata,
  RegionMetadata,
  ThesaurusMetadata,
  ArticlePost,
  MaterialPost,
  ApplicationPost,
  RegionPost,
  ThesaurusPost,
  AuthorPost,
  ContentType,
  FilterCriteria
} from './core/article';

// Note: ALL NEW IMPORTS SHOULD USE:
// import { TypeName } from '@/types'
// 
// This consolidates:
// - types/core/* (REMOVE AFTER MIGRATION)
// - types/components/* (REMOVE AFTER MIGRATION)  
// - types/families/* (REMOVE AFTER MIGRATION)
// - app/types/* (REMOVE AFTER MIGRATION)