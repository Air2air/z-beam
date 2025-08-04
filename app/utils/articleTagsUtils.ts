// app/utils/articleTagsUtils.ts - COMPATIBILITY LAYER
// This file maintains backward compatibility with the simplified tag system
'use server';

import { 
  getArticleTagsFromTagsDir,
  getAllTags as getAllUniqueTags,
  getArticlesWithTags,
  getTagCounts,
  getAllTagFiles,
  filterArticlesByTag
} from './tags';

// Re-export all functions for backward compatibility
export {
  getArticleTagsFromTagsDir,
  getAllUniqueTags,
  getArticlesWithTags,
  getTagCounts,
  getAllTagFiles,
  filterArticlesByTag
};
