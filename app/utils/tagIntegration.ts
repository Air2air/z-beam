// app/utils/tagIntegration.ts
// Bridge between old and new tag systems
'use server';

import { cache } from 'react';
import { Article } from '../types/Article';

// Import from the new tag system
import { 
  getAllTags,
  getTagsWithCounts,
  filterArticlesByTag,
  getEnrichedArticles,
  getPopularTags,
  getTagManagerForArticle
} from './tags';

// Cache for backward compatibility
export const getAllTags_DEPRECATED = cache(async () => {
  console.warn('WARNING: getAllTags is deprecated. Use tags/getAllTags instead.');
  return await getAllTags();
});

export const getAllTagsWithCounts_DEPRECATED = cache(async () => {
  console.warn('WARNING: getAllTagsWithCounts is deprecated. Use tags/getTagsWithCounts instead.');
  return await getTagsWithCounts();
});

export const filterArticlesByTag_DEPRECATED = async (
  articles: Article[], 
  tag: string
): Promise<Article[]> => {
  console.warn('WARNING: filterArticlesByTag is deprecated. Use tags/filterArticlesByTag instead.');
  return await filterArticlesByTag(articles, tag);
};

export const getArticlesWithTags_DEPRECATED = cache(async (): Promise<Article[]> => {
  console.warn('WARNING: getArticlesWithTags is deprecated. Use tags/getEnrichedArticles instead.');
  return await getEnrichedArticles();
});

export const getPopularTags_DEPRECATED = cache(async (limit: number = 10): Promise<string[]> => {
  console.warn('WARNING: getPopularTags is deprecated. Use tags/getPopularTags instead.');
  return await getPopularTags(limit);
});

// For direct imports
export {
  getAllTags,
  getTagsWithCounts,
  filterArticlesByTag,
  getEnrichedArticles,
  getPopularTags,
  getTagManagerForArticle
};

// Export a migration guide message
export const TAG_MIGRATION_GUIDE = `
MIGRATION GUIDE: Tag System Update

The tag system has been updated to a new, more efficient implementation.
The old tag system functions are now deprecated and will be removed in a future release.

Please update your imports to use the new tag system:

OLD:
import { getAllTags, getAllTagsWithCounts } from '../utils/tagUtils';
import { filterArticlesByTag } from '../utils/articleTagsUtils';

NEW:
import { 
  getAllTags, 
  getTagsWithCounts, 
  filterArticlesByTag 
} from '../utils/tags';

For more information, see the migration guide in the documentation.
`;

// A helper function to log the migration guide
export function logTagMigrationGuide(): void {
  console.warn(TAG_MIGRATION_GUIDE);
}
