// app/utils/utils.ts - Client-safe utilities only
// Re-export from organized modules

export { 
  formatDate, 
  formatRelativeDate,
  slugify, 
  truncateText, 
  capitalizeFirst, 
  kebabToTitle,
  stripHtml,
  toSentenceCase,
  isValidUrl,
  formatFileSize
} from './formatting';

export { SITE_CONFIG, ANIMATION_CONFIG, COMPONENT_DEFAULTS, BREAKPOINTS } from './constants';

export { 
  isValidEmail,
  isRequired,
  hasMinLength,
  hasMaxLength,
  isPositiveNumber,
  isInRange,
  isValidSlug,
  validateField,
  ValidationRules,
  type ValidationResult,
  type ValidationRule
} from './validation';

export {
  cn,
  getVariantClasses,
  generateMaterialAltText,
  safeGet,
  debounce,
  throttle,
  delay,
  isBrowser,
  prefersReducedMotion,
  generateId,
  fileToBase64,
  getContrastRatio
} from './helpers';

export {
  generateChartColors,
  generateChartBorderColors,
  createChartDataset,
  createChartData,
  createEffectivenessChart,
  createRiskComparisonChart,
  createContaminantImpactChart,
  CHART_DEFAULTS,
  CLEANING_COMPARISON_DATA
} from './chart';

// Legacy exports for backward compatibility
export type { Metadata, MaterialPost } from 'app/types';
