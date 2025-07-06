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

// Get unique tags from all articles written by a specific author
export function getAuthorTags(authorId: number): string[] {
  const { getArticlesByAuthorId } = require('./content');
  const authorArticles = getArticlesByAuthorId(authorId);
  
  console.log(`Getting tags for author ${authorId}, found ${authorArticles.length} articles`);
  
  const allTags = authorArticles
    .flatMap((article: any) => {
      let tags = article.metadata.tags || [];
      
      // If tags is a string (JSON stringified), parse it
      if (typeof tags === 'string') {
        try {
          tags = JSON.parse(tags);
        } catch (e) {
          console.warn(`Failed to parse tags for article "${article.metadata.title}":`, tags);
          return [];
        }
      }
      
      // Ensure tags is an array
      if (!Array.isArray(tags)) {
        console.warn(`Tags for article "${article.metadata.title}" is not an array:`, tags);
        return [];
      }
      
      console.log(`Article "${article.metadata.title}" has tags:`, tags);
      return tags;
    })
    .filter((tag: any) => tag && typeof tag === 'string' && tag.trim() !== ''); // Remove empty tags
  
  console.log('All tags before deduplication:', allTags);
  
  // Return unique tags, sorted alphabetically
  const uniqueTags = Array.from(new Set(allTags as string[])).sort();
  console.log('Final unique tags:', uniqueTags);
  
  return uniqueTags;
}

// Legacy exports for backwards compatibility
export function getMaterialList() {
  return getArticlesByCategory('material');
}

export { parseFrontmatter, extractFirstImage } from './metadata';
