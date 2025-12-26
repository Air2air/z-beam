/**
 * Reusable background pattern SVG data URIs
 * These can be used in style.backgroundImage properties
 */

/**
 * Plus-sign grid pattern with customizable opacity
 * @param opacity - Fill opacity (0-1), default 0.4
 * @returns Data URI string for use in backgroundImage
 */
export const getPlusGridPattern = (opacity: number = 0.4): string => {
  const opacityValue = Math.max(0, Math.min(1, opacity));
  return `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='${opacityValue}'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;
};

/**
 * Default plus-sign grid pattern for hero sections (full opacity)
 */
export const PLUS_GRID_PATTERN_FULL = getPlusGridPattern(1.0);

/**
 * Subtle plus-sign grid pattern for overlays (40% opacity)
 */
export const PLUS_GRID_PATTERN_SUBTLE = getPlusGridPattern(0.4);
