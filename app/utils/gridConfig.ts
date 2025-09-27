// app/utils/gridConfig.ts
// Unified grid configuration for consistent layouts across all components

// Grid responsive breakpoint configurations
export const GRID_CONFIGS = {
  1: "grid-cols-2",
  2: "grid-cols-2", // Always 2 columns at all sizes
  3: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  4: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
} as const;

// Gap configurations for consistent spacing
export const GRID_GAPS = {
  xs: "gap-2",
  sm: "gap-4", 
  md: "gap-6",
  lg: "gap-8",
  xl: "gap-12"
} as const;

// Standard grid container classes
export const GRID_CONTAINER_CLASSES = {
  standard: "auto-rows-fr", // Equal height rows
  flexible: "", // Natural height
  stretch: "min-h-0", // Allow shrinking
} as const;

// Grid section spacing
export const GRID_SECTION_SPACING = {
  betweenSections: "space-y-12",
  categoryHeader: "mb-6",
  sectionHeader: "mb-8",
  gridToHeader: "mt-6"
} as const;

// Unified grid utilities
export type GridColumns = 1 | 2 | 3 | 4;
export type GridGap = keyof typeof GRID_GAPS;
export type GridContainer = keyof typeof GRID_CONTAINER_CLASSES;

export interface StandardGridProps {
  columns?: GridColumns;
  gap?: GridGap;
  container?: GridContainer;
  className?: string;
}

/**
 * Generate consistent grid classes
 */
export function getGridClasses({ 
  columns = 3, 
  gap = "md", 
  container = "standard", 
  className = "" 
}: StandardGridProps = {}) {
  return `grid ${GRID_CONFIGS[columns]} ${GRID_GAPS[gap]} ${GRID_CONTAINER_CLASSES[container]} ${className}`.trim();
}

/**
 * Standard section header classes
 */
export const SECTION_HEADER_CLASSES = {
  title: "text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2",
  subtitle: "text-gray-600 dark:text-gray-400 mt-2",
  accent: "w-16 h-1 bg-blue-600 dark:bg-blue-400 rounded",
  container: "mb-8"
} as const;

/**
 * Category header classes for category-grouped displays
 */
export const CATEGORY_HEADER_CLASSES = {
  title: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2",
  subtitle: "text-gray-600 dark:text-gray-400 mt-2", 
  accent: "w-12 h-1 bg-blue-600 dark:bg-blue-400 rounded",
  container: "mb-6"
} as const;

/**
 * Generate section header JSX with consistent styling
 */
export function createSectionHeader(title: string, subtitle?: string) {
  return {
    title,
    subtitle,
    titleClass: SECTION_HEADER_CLASSES.title,
    subtitleClass: SECTION_HEADER_CLASSES.subtitle,
    accentClass: SECTION_HEADER_CLASSES.accent,
    containerClass: SECTION_HEADER_CLASSES.container
  };
}

/**
 * Generate category header JSX with consistent styling
 */
export function createCategoryHeader(title: string, itemCount: number) {
  const subtitle = `${itemCount} ${itemCount === 1 ? 'article' : 'articles'}`;
  return {
    title,
    subtitle,
    titleClass: CATEGORY_HEADER_CLASSES.title,
    subtitleClass: CATEGORY_HEADER_CLASSES.subtitle, 
    accentClass: CATEGORY_HEADER_CLASSES.accent,
    containerClass: CATEGORY_HEADER_CLASSES.container
  };
}