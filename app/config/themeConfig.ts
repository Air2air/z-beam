// app/config/themeConfig.ts
/**
 * @purpose Centralized theme configuration for consistent styling across components
 * @usage Import and use getThemeClasses() instead of defining theme objects in each component
 */

export type ThemeVariant = 'body' | 'navbar';

export interface ThemeConfig {
  container: string;
  heading: string;
  text: string;
}

/**
 * Standard theme configuration used across EquipmentSection, BenefitsSection, WorkflowSection, ContentCard, etc.
 * Provides consistent dark/light mode styling
 */
export const THEME_CLASSES: Record<ThemeVariant, ThemeConfig> = {
  body: {
    container: 'bg-gray-700',
    heading: 'text-white',
    text: 'text-gray-100',
  },
  navbar: {
    container: 'bg-white dark:bg-gray-800',
    heading: 'text-gray-900 dark:text-white',
    text: 'text-gray-700 dark:text-gray-300',
  },
} as const;

/**
 * Get theme classes for a specific variant
 * @param theme - 'body' or 'navbar'
 * @returns Theme configuration object with container, heading, and text classes
 */
export function getThemeClasses(theme: ThemeVariant = 'navbar'): ThemeConfig {
  return THEME_CLASSES[theme];
}
