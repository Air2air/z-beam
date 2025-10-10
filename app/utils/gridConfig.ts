// app/utils/gridConfig.ts
// Unified grid configuration for consistent layouts across all components
// 
// ⚠️ DEPRECATED: Import from @/config instead
// This file now re-exports from app/config/site.ts for backward compatibility
// New code should import from @/config or @/config/site
//
// Migration Guide:
// OLD: import { GRID_CONFIGS } from '@/utils/gridConfig'
// NEW: import { GRID_CONFIGS } from '@/config'

export {
  GRID_CONFIGS,
  GRID_GAPS,
  GRID_CONTAINER_CLASSES,
  GRID_SECTION_SPACING,
  SECTION_HEADER_CLASSES,
  CATEGORY_HEADER_CLASSES,
  getGridClasses,
  createSectionHeader,
  createCategoryHeader,
  type GridColumns,
  type GridGap,
  type GridContainer,
  type StandardGridProps
} from '../config/site';

/**
 * @deprecated Use imports from @/config instead
 * All configuration has been consolidated into app/config/site.ts
 */

// Original content below (commented out for reference):
// All exports now come from app/config/site.ts