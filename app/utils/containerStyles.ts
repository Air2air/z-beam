// app/utils/containerStyles.ts
// Unified responsive container system for consistent layouts

/**
 * Responsive container styles with mobile-first approach
 * Consistent spacing and width constraints across all breakpoints
 * Standardized to max-w-6xl for uniform layout width
 */
// Standard container used across most pages
export const STANDARD_CONTAINER = 'mx-auto max-w-6xl px-4 sm:px-6';

/**
 * Container styles - standardized to max-w-6xl for consistent layouts
 * Reduced padding on mobile devices for better space utilization
 */
export const CONTAINER_STYLES = {
  // Standard container - optimal reading width for all content (standardized to 6xl)
  standard: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8",
  
  // Main container - used by Layout component
  main: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8",
  
  // Article container - optimized for long-form content
  article: "max-w-4xl mx-auto px-4 sm:px-6",
  
  // Centered container - narrow for focused content
  centered: "max-w-2xl mx-auto px-4 sm:px-6",
  
    // Full width - for hero sections, full-bleed content
  fullWidth: "w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8",
  
  // Content only - no vertical padding
  contentOnly: 'mx-auto max-w-6xl px-4 sm:px-6',
  
  // Section - standard with reduced mobile padding
  section: 'mx-auto max-w-6xl px-4 sm:px-4',
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
 * Smaller gaps on mobile, larger on desktop
 */
export const GRID_STYLES = {
  auto: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6",
  twoColumn: "grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-8",
  threeColumn: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6",
  fourColumn: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6",
} as const;

/**
 * @deprecated Import GRID_CONFIGS from @/config/site instead
 * Grid column classes - kept for backward compatibility only
 * Will be removed in next major version
 */
export const GRID_CLASSES = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
} as const;

/**
 * @deprecated Import GRID_GAPS from @/config/site instead
 * Gap size classes - kept for backward compatibility only
 * Will be removed in next major version
 */
export const GAP_CLASSES = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6'
} as const;
