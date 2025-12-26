// app/config/index.ts
// Unified Configuration Export
// Single source of truth for all application settings
//
// For server-side configuration management (ConfigurationManager), 
// import from './manager.server.ts' instead.

// ============================================================================
// UNIFIED SITE CONFIGURATION EXPORTS
// Import site, business, grid, navigation, and animation configs from here
// ============================================================================

export {
  // Site Configuration
  SITE_CONFIG,
  
  // Business Configuration
  BUSINESS_CONFIG,
  generateOrganizationSchema,
  
  // Animation Configuration
  ANIMATION_CONFIG,
  
  // Grid Configuration
  GRID_CONFIGS,
  GRID_GAPS,
  GRID_CONTAINER_CLASSES,
  GRID_SECTION_SPACING,
  SECTION_HEADER_CLASSES,
  CATEGORY_HEADER_CLASSES,
  CARD_HEADER_CLASSES,
  getGridClasses,
  createSectionHeader,
  createCategoryHeader,
  
  // Navigation Configuration
  MAIN_NAV_ITEMS,
  
  // Component Defaults
  COMPONENT_DEFAULTS,
  
  // Breakpoints
  BREAKPOINTS,
} from './site';

// Re-export types from @/types (they're defined there, not in site.ts)
export type { GridColumns, GridGap, GridContainer, StandardGridProps, NavItem } from '@/types';
