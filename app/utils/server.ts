// app/utils/server.ts - Server-only utilities
// These functions use fs and can only be used in server components

import { getArticlesByCategory } from './content';

export { 
  getArticleList,
  getArticleBySlug,
  getAllArticleSlugs,
  getArticlesByAuthorId,
  getArticlesByCategory,
  getAllTags,
  getTagSlug,
  getTagFromSlug,
  getAllTagSlugs,
  getArticlesByTag,
  getTagStats,
  filterContent,
  clearContentCache,
  getMDXFiles,
  readMDXFile
} from './content';

// Author utilities
export { 
  getAllAuthors,
  getAuthorById,
  getAuthorBySlug,
  getAllAuthorSlugs,
  generateAuthorSlug,
  getAuthorByName,
  getAuthorsBySpecialty,
  clearAuthorsCache
} from './authors';

// Legacy exports for backwards compatibility
export function getMaterialList() {
  return getArticlesByCategory('material');
}

export { parseFrontmatter, extractFirstImage } from './metadata';
