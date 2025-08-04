// app/utils/tagIntegration.ts
// UNIFIED COMPATIBILITY LAYER for tag system
// This file serves as the single entry point for backward compatibility with the tag system
'use server';

import { cache } from 'react';
import { Article } from '../types/Article';

// Import all functions from the main tag system
import * as tagSystem from './tags';

// Re-export all functions from the tag system for direct usage
export * from './tags';

// DEPRECATED aliases with warnings - these should be avoided in new code
export const getAllTags_DEPRECATED = cache(async () => {
  console.warn('WARNING: getAllTags_DEPRECATED is deprecated. Use getAllTags from ./tags instead.');
  return await tagSystem.getAllTags();
});

export const getAllTagsWithCounts_DEPRECATED = cache(async () => {
  console.warn('WARNING: getAllTagsWithCounts_DEPRECATED is deprecated. Use getTagsWithCounts from ./tags instead.');
  return await tagSystem.getTagsWithCounts();
});

export const filterArticlesByTag_DEPRECATED = async (
  articles: Article[], 
  tag: string
): Promise<Article[]> => {
  console.warn('WARNING: filterArticlesByTag_DEPRECATED is deprecated. Use filterArticlesByTag from ./tags instead.');
  return await tagSystem.filterArticlesByTag(articles, tag);
};

export const getArticlesWithTags_DEPRECATED = cache(async (): Promise<Article[]> => {
  console.warn('WARNING: getArticlesWithTags_DEPRECATED is deprecated. Use getEnrichedArticles from ./tags instead.');
  return await tagSystem.getEnrichedArticles();
});

// The getPopularTags function appears to be missing from the tag system
// Adding a basic implementation here as a temporary measure
export const getPopularTags = cache(async (limit: number = 10): Promise<string[]> => {
  const allTagsWithCounts = await tagSystem.getTagsWithCounts();
  
  // Convert to array of [tag, count] pairs
  const tagCountPairs = Object.entries(allTagsWithCounts);
  
  // Sort by count (descending)
  tagCountPairs.sort((a, b) => b[1] - a[1]);
  
  // Return the top tags (limit)
  return tagCountPairs.slice(0, limit).map(pair => pair[0]);
});

// Keep this for backward compatibility
export const getPopularTags_DEPRECATED = cache(async (limit: number = 10): Promise<string[]> => {
  console.warn('WARNING: getPopularTags_DEPRECATED is deprecated. Use getPopularTags instead.');
  return await getPopularTags(limit);
});

// Export a migration guide message
export const TAG_MIGRATION_GUIDE = `
MIGRATION GUIDE: Tag System Update

The tag system has been updated to a more efficient implementation.
All tag-related functionality is now centralized in the ./tags.ts file.

Please update your imports to use the new tag system:

OLD:
import { getAllTags } from '../utils/tagUtils';
import { filterArticlesByTag } from '../utils/articleTagsUtils';

NEW:
import { getAllTags, filterArticlesByTag } from '../utils/tags';

For backward compatibility, you can also import from tagIntegration.ts:
import { getAllTags, filterArticlesByTag } from '../utils/tagIntegration';
`;

// A helper function to log the migration guide
export function logTagMigrationGuide(): void {
  console.warn(TAG_MIGRATION_GUIDE);
}
