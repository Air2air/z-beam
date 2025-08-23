// app/utils/tagDebug.ts
// Debug utilities for the tag system
'use server';

import { getArticlesWithTags, getAllTags, getTagCounts } from './tags';
import { loadAllArticles } from './contentAPI';
import { logger } from './logger';

interface TagDebugData {
  totalArticles: number;
  articlesWithAuthor: number;
  articlesWithFrontmatterAuthor: number;
  sampleAuthors: Array<{
    title: string;
    slug: string;
    author: string;
    tags: string[];
  }>;
}

/**
 * Generate comprehensive debug data for the tag system
 */
export async function debugTagSystem(): Promise<TagDebugData> {
  try {
    // Get all articles
    const allArticles = await loadAllArticles();
    const articlesWithTags = await getArticlesWithTags();
    
    // Count articles with authors
    const articlesWithAuthor = allArticles.filter(article => 
      article.author && typeof article.author === 'string'
    ).length;
    
    // Count articles with frontmatter author
    const articlesWithFrontmatterAuthor = allArticles.filter(article => 
      article.metadata && article.metadata.author
    ).length;
    
    // Get sample authors for display
    const sampleAuthors = allArticles
      .filter(article => article.author || article.metadata?.author)
      .slice(0, 10)
      .map(article => ({
        title: article.title || article.slug || 'Unknown',
        slug: article.slug || 'unknown',
        author: getAuthorName(article),
        tags: article.tags || []
      }));
    
    return {
      totalArticles: allArticles.length,
      articlesWithAuthor,
      articlesWithFrontmatterAuthor,
      sampleAuthors
    };
  } catch (error) {
    logger.error('Error in debugTagSystem', error);
    
    // Return fallback data
    return {
      totalArticles: 0,
      articlesWithAuthor: 0,
      articlesWithFrontmatterAuthor: 0,
      sampleAuthors: []
    };
  }
}

/**
 * Helper function to extract author name from various article formats
 */
function getAuthorName(article: any): string {
  // Check author object
  if (article.author) {
    if (typeof article.author === 'string') {
      return article.author;
    }
  }
  
  // Check metadata
  if (article.metadata?.author) {
    if (typeof article.metadata.author === 'string') {
      return article.metadata.author;
    }
  }
  
  return 'Unknown';
}

/**
 * Get debug information about tag counts and distribution
 */
export async function debugTagCounts(): Promise<{
  totalTags: number;
  topTags: Array<{ tag: string; count: number }>;
  unusedTags: string[];
}> {
  try {
    const allTags = await getAllTags();
    const tagCounts = await getTagCounts();
    
    // Get top tags
    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
    
    // Find unused tags (count = 0)
    const unusedTags = Object.entries(tagCounts)
      .filter(([, count]) => count === 0)
      .map(([tag]) => tag);
    
    return {
      totalTags: allTags.length,
      topTags,
      unusedTags
    };
  } catch (error) {
    logger.error('Error in debugTagCounts', error);
    return {
      totalTags: 0,
      topTags: [],
      unusedTags: []
    };
  }
}

/**
 * Debug a specific tag and show which articles match it
 */
export async function debugTag(tagName: string): Promise<{
  tag: string;
  matchCount: number;
  matchingArticles: Array<{
    title: string;
    slug: string;
    tags: string[];
  }>;
}> {
  try {
    const articlesWithTags = await getArticlesWithTags();
    
    // Find articles that match this tag
    const matchingArticles = articlesWithTags
      .filter(article => 
        article.tags && 
        article.tags.some(tag => 
          tag.toLowerCase() === tagName.toLowerCase()
        )
      )
      .map(article => ({
        title: article.title || article.slug || 'Unknown',
        slug: article.slug || 'unknown',
        tags: article.tags || []
      }));
    
    return {
      tag: tagName,
      matchCount: matchingArticles.length,
      matchingArticles
    };
  } catch (error) {
    logger.error(`Error in debugTag for ${tagName}`, error);
    return {
      tag: tagName,
      matchCount: 0,
      matchingArticles: []
    };
  }
}
