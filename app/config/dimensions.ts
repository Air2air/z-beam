/**
 * @file app/config/dimensions.ts
 * @purpose Single source of truth for component dimensions
 * @aiContext Import from '@/app/config/dimensions' to ensure skeleton/component consistency
 * @usage Guarantees zero CLS (Cumulative Layout Shift) between loading states and actual components
 */

/**
 * Component dimension constants
 * Use these in both components AND their skeleton loading states
 */
export const COMPONENT_DIMENSIONS = {
  // Hero dimensions
  HERO: {
    DEFAULT_HEIGHT: 400, // h-[400px]
    MOBILE_HEIGHT: 300,  // Mobile: h-[300px]
    DESKTOP_HEIGHT: 500, // Desktop: h-[500px]
  },

  // Micro component dimensions
  MICRO: {
    MIN_HEIGHT: 500,     // min-h-[500px] - actual Micro component
    IMAGE_HEIGHT: 450,   // h-[450px] - MicroImage component
  },

  // Card dimensions
  CARD: {
    GRID_ITEM_HEIGHT: 280,        // Standard card in grid
    GRID_ITEM_IMAGE: 192,         // h-48 (192px) - card image area
    RELATIONSHIP_CARD_HEIGHT: 280, // Relationship cards
    RELATIONSHIP_CARD_IMAGE: 160,  // h-40 (160px)
    INFO_CARD_MIN_HEIGHT: 200,    // InfoCard minimum
  },

  // Section dimensions
  SECTION: {
    PROPERTY_CARD: 128,   // h-32 (128px) - MaterialCharacteristics cards
    FAQ_MAX_HEIGHT: 1000, // max-h-[1000px] - expanded FAQ
    COLLAPSIBLE_MAX: 500, // max-h-[500px] - expanded content
  },

  // Interactive element dimensions (accessibility)
  INTERACTIVE: {
    BUTTON_SM: 32,  // min-h-[32px]
    BUTTON_MD: 40,  // min-h-[40px]
    BUTTON_LG: 48,  // min-h-[48px]
    TAP_TARGET: 44, // min-h-[44px] - minimum touch target
  },

  // Special component dimensions
  SPECIAL: {
    CTA_HEIGHT: 80,           // h-[80px] - CallToAction
    HEATMAP_SM: 120,          // h-[120px]
    HEATMAP_MD: 200,          // h-[200px]
    HEAT_BUILDUP_SM: 200,     // h-[200px]
    HEAT_BUILDUP_MD: 360,     // h-[360px]
    DATASET_ITEM: 60,         // h-[60px]
  },
} as const;

/**
 * Tailwind class names for dimensions
 * Use these for consistent styling across components and skeletons
 */
export const DIMENSION_CLASSES = {
  // Hero
  hero: {
    default: 'h-[400px]',
    mobile: 'h-[300px] md:h-[400px]',
    desktop: 'h-[400px] md:h-[500px]',
  },

  // Micro
  micro: {
    container: 'min-h-[500px]',
    image: 'h-[450px]',
  },

  // Cards
  card: {
    standard: 'h-[280px]',
    image: 'h-48', // 192px
    relationshipImage: 'h-40', // 160px
    infoCard: 'min-h-[200px]',
  },

  // Sections
  section: {
    propertyCard: 'h-32', // 128px
    faqExpanded: 'max-h-[1000px]',
    collapsible: 'max-h-[500px]',
  },

  // Interactive elements
  interactive: {
    buttonSm: 'min-h-[32px]',
    buttonMd: 'min-h-[40px]',
    buttonLg: 'min-h-[48px]',
    tapTarget: 'min-h-[44px] min-w-[44px]',
  },

  // Special
  special: {
    cta: 'h-[80px]',
    heatmapSm: 'h-[120px]',
    heatmapMd: 'h-[200px]',
    heatBuildupSm: 'h-[200px]',
    heatBuildupMd: 'h-[360px]',
    datasetItem: 'h-[60px]',
  },
} as const;

/**
 * Helper function to get pixel value from Tailwind class
 */
export function getDimensionValue(dimensionClass: string): number {
  const match = dimensionClass.match(/h-\[(\d+)px\]|h-(\d+)/);
  if (!match) return 0;
  
  // If h-[XXXpx] format
  if (match[1]) return parseInt(match[1], 10);
  
  // If h-XX format (Tailwind units: 4px per unit)
  if (match[2]) return parseInt(match[2], 10) * 4;
  
  return 0;
}

/**
 * Type exports for TypeScript safety
 */
export type DimensionKey = keyof typeof COMPONENT_DIMENSIONS;
export type DimensionClassKey = keyof typeof DIMENSION_CLASSES;
