// app/utils/utils.ts - Main utilities entry point
// Re-export from organized modules

export { formatDate, slugify, truncateText, capitalizeFirst, kebabToTitle } from './formatting';
export { getMaterialList, getMDXFiles, readMDXFile, getMDXData } from './mdx';
export { parseFrontmatter, extractFirstImage } from './metadata';
export { SITE_CONFIG, ANIMATION_CONFIG, COMPONENT_DEFAULTS, BREAKPOINTS } from './constants';

// Legacy exports for backward compatibility
export type { Metadata, MaterialPost } from 'app/types';
