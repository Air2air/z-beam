// app/utils/containerStyles.ts
// Unified responsive container system for consistent layouts

/**
 * Responsive container styles with mobile-first approach
 * Consistent spacing and width constraints across all breakpoints
 */
export const STANDARD_CONTAINER = "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8";

/**
 * Container styles - simplified to use article layout by default
 */
export const CONTAINER_STYLES = {
  // Standard container - optimal reading width for all content
  standard: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
  
  // Full width - for hero sections, full-bleed content (legacy support)
  fullWidth: "w-full px-4 sm:px-6 lg:px-8 py-8",
  
  // Content only - no vertical padding (for nested layouts)
  contentOnly: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8",
  
  // Section spacing - for page sections with extra spacing
  section: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16",
} as const;

/**
 * Get container class for specific layout types
 */
export function getContainerClass(type: keyof typeof CONTAINER_STYLES = 'standard'): string {
  return CONTAINER_STYLES[type];
}

/**
 * Responsive prose styles for content areas
 * Optimized for readability across all device sizes
 */
export const PROSE_STYLES = {
  standard: "prose prose-lg max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300",
  compact: "prose max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300",
  wide: "prose prose-lg prose-xl:prose-xl max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300",
} as const;

/**
 * Responsive grid utilities for consistent layouts
 */
export const GRID_STYLES = {
  auto: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
  twoColumn: "grid grid-cols-1 lg:grid-cols-2 gap-8",
  threeColumn: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
  fourColumn: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
} as const;
