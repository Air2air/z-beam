// app/utils/containerStyles.ts
// Unified responsive container system for consistent layouts

/**
 * Responsive container styles with mobile-first approach
 * Consistent spacing and width constraints across all breakpoints
 * Standardized to max-w-6xl for uniform layout width
 */
// Standard container used across most pages
export const STANDARD_CONTAINER = 'container-standard';

/**
 * Container styles - standardized to max-w-6xl for consistent layouts
 * Reduced padding on mobile devices for better space utilization
 */
export const CONTAINER_STYLES = {
  // Standard container - optimal reading width for all content (standardized to 6xl)
  standard: "container-full section-padding",
  
  // Main container - used by Layout component
  main: "container-full",
  
  // Article container - optimized for long-form content
  article: "container-narrow",
  
  // Centered container - narrow for focused content
  centered: "container-centered",
  
    // Full width - for hero sections, full-bleed content
  fullWidth: "w-full px-responsive section-padding",
  
  // Content only - no vertical padding
  contentOnly: 'container-standard',
  
  // Section - standard with reduced mobile padding
  section: 'container-standard',
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
  auto: "grid-3col gap-3-responsive",
  twoColumn: "grid grid-cols-1 lg:grid-cols-2 gap-3-responsive",
  threeColumn: "grid-3col gap-3-responsive",
  fourColumn: "grid-4col gap-3-responsive",
} as const;

/**
 * @deprecated Import GRID_CONFIGS from @/config/site instead
 * Grid column classes - kept for backward compatibility only
 * Will be removed in next major version
 */
export const GRID_CLASSES = {
  1: 'grid-cols-1',
  2: 'grid-2col',
  3: 'grid-3col',
  4: 'grid-4col'
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
