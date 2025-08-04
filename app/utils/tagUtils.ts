// app/utils/tagUtils.ts - COMPATIBILITY LAYER
// This file maintains backward compatibility with the simplified tag system
'use server';

import { 
  parseTagsFromContent,
  articleMatchesTag,
  getTagsContentWithMatchCounts,
  getAllTagsWithCounts
} from './tags';

// Re-export all functions for backward compatibility
export {
  parseTagsFromContent,
  articleMatchesTag,
  getTagsContentWithMatchCounts,
  getAllTagsWithCounts
};
