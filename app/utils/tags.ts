// app/utils/tags.ts
// Simplified tag system with React cache for performance
'use server';

import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { cache } from 'react';
import { Article } from '../../types/core';
import { loadAllArticles } from './contentAPI';
import { logger } from './logger';
import { stripParenthesesFromSlug } from './formatting';
import { extractSafeValue } from './stringHelpers';

// Constants
const TAGS_DIRECTORY = path.join(process.cwd(), 'content', 'components', 'tags');

// Cache
let _tagsCache: {
  allTags: string[];
  tagCounts: Record<string, number>;
  articleTags: Record<string, string[]>;
  lastUpdated: number;
} | null = null;

const CACHE_EXPIRATION = 15 * 60 * 1000; // 15 minutes

// Basic tag functions
/**
 * Parse tags from content string (from tags markdown file) or YAML data
 * Supports both legacy comma-separated format and new YAML v2.0 structured format
 */
export async function parseTagsFromContent(content: string): Promise<string[]> {
  if (!content) return [];
  
  // Skip any comment lines
  const contentWithoutComments = content.replace(/<!--.*?-->/gs, '').trim();
  
  // Check if content looks like YAML (contains "tags:" or "categories:")
  if (contentWithoutComments.includes('tags:') || contentWithoutComments.includes('categories:')) {
    try {
      // Try to extract tags from YAML-like content
      const tagMatches = contentWithoutComments.match(/tags:\s*\n((?:\s*-\s*.+\n?)*)/);
      if (tagMatches && tagMatches[1]) {
        // Extract list items from YAML array
        const yamlTags = tagMatches[1]
          .split('\n')
          .map(line => line.replace(/^\s*-\s*/, '').trim())
          .filter(tag => tag.length > 0);
        
        if (yamlTags.length > 0) {
          return yamlTags;
        }
      }
      
      // If no direct tags array, try to extract from categories
      const categoryMatches = contentWithoutComments.match(/categories:\s*\n((?:\s+\w+:\s*\n(?:\s*-\s*.+\n?)*)*)/);
      if (categoryMatches && categoryMatches[1]) {
        const categorySection = categoryMatches[1];
        const allCategoryTags: string[] = [];
        
        // Extract tags from each category
        const categoryBlocks = categorySection.split(/\n\s+\w+:\s*\n/).filter(Boolean);
        categoryBlocks.forEach(block => {
          const tags = block
            .split('\n')
            .map(line => line.replace(/^\s*-\s*/, '').trim())
            .filter(tag => tag.length > 0);
          allCategoryTags.push(...tags);
        });
        
        if (allCategoryTags.length > 0) {
          return allCategoryTags;
        }
      }
    } catch (error) {
      // If YAML parsing fails, fall back to comma-separated parsing
      console.warn('Failed to parse YAML content, falling back to comma-separated format:', error);
    }
  }
  
  // Legacy comma-separated format or fallback
  return contentWithoutComments
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
}

/**
 * Check if an article matches a tag (case-insensitive)
 */
export async function articleMatchesTag(article: { tags?: string[] } | null, tag: string): Promise<boolean> {
  if (!tag) return true;
  if (!article || !article.tags || !Array.isArray(article.tags)) return false;
  
  const tagLower = extractSafeValue(tag).toLowerCase();
  
  // Check each tag on the article
  return article.tags
    .filter(Boolean)
    .some(t => {
      const tString = extractSafeValue(t).toLowerCase();
      
      // Direct match (case-insensitive)
      if (tString === tagLower) return true;
      
      // Check if the article tag contains the search tag (for compound tags)
      if (tString.includes(tagLower)) return true;
      
      // Check if the search tag contains parts of the article tag
      if (tagLower.includes(' ')) {
        const tagParts = tagLower.split(' ');
        return tagParts.some(part => tString.includes(part));
      }
      
      // Check if the article tag contains parts of the search tag
      if (tString.includes(' ')) {
        const articleTagParts = tString.split(' ');
        return articleTagParts.some(part => part === tagLower);
      }
      
      return false;
    });
}

/**
 * Get tags for a specific article from tags file
 */
export async function getArticleTagsFromTagsDir(slug: string): Promise<string[]> {
  try {
    const tagsPath = path.join(TAGS_DIRECTORY, `${slug}.md`);
    
    if (!existsSync(tagsPath)) {
      return [];
    }
    
    const content = await fs.readFile(tagsPath, 'utf8');
    return await parseTagsFromContent(content);
  } catch (error) {
    console.error(`Error loading tags for ${slug}:`, error);
    return [];
  }
}

/**
 * Get tags content with match counts for a specific slug
 */
export async function getTagsContentWithMatchCounts(slug: string) {
  try {
    // Load the tags content
    const tagsPath = path.join(TAGS_DIRECTORY, `${slug}.md`);
    
    if (!existsSync(tagsPath)) {
      return { content: null, counts: {} };
    }
    
    const content = await fs.readFile(tagsPath, 'utf8');
    
    // Parse tags from the content
    const tags = await parseTagsFromContent(content);
    
    // Get all articles to count tag matches
    const articles = await getArticlesWithTags();
    
    // Count how many articles match each tag
    const counts: Record<string, number> = {};
    
    for (const tag of tags) {
      counts[tag] = (await Promise.all(articles.map(article => 
        articleMatchesTag(article, tag)
      ))).filter(Boolean).length;
    }
    
    return { content, counts };
  } catch (error) {
    console.error(`Error in getTagsContentWithMatchCounts for ${slug}:`, error);
    return { content: null, counts: {} };
  }
}

// Cache initialization
async function initializeTagCache() {
  try {
    // Skip if cache is still valid
    if (_tagsCache && (Date.now() - _tagsCache.lastUpdated < CACHE_EXPIRATION)) {
      return _tagsCache;
    }
    
    // Get all articles
    const articles = await loadAllArticles();
    
    // Get all unique tags from tag files
    const tagFiles = await getAllTagFiles();
    const tagSet = new Set<string>();
    
    // Process each tag file
    for (const file of tagFiles) {
      const slug = stripParenthesesFromSlug(file.replace('.md', ''));
      const tags = await getArticleTagsFromTagsDir(slug);
      tags.forEach(tag => tagSet.add(tag));
    }
    
    // Add author names to the tag set
    for (const article of articles) {
      if (article.author && typeof article.author === 'string') {
        // Add the author name to the tag set
        tagSet.add(article.author);
      }
    }
    
    // Convert tag set to array
    const allTags = Array.from(tagSet).sort();
    
    // Calculate tag counts
    const tagCounts: Record<string, number> = {};
    const articleTags: Record<string, string[]> = {};
    
    // Count articles per tag
    for (const tag of allTags) {
      let count = 0;
      for (const article of articles) {
        // Create a temporary article with author as tag for matching
        const articleWithAuthorTag = {
          ...article,
          tags: [...(article.tags || []), ...(article.author && typeof article.author === 'string' ? [article.author] : [])]
        };
        
        if (await articleMatchesTag(articleWithAuthorTag, tag)) {
          count++;
        }
      }
      tagCounts[tag] = count;
    }
    
    // Store tags for each article
    for (const article of articles) {
      if (article.slug) {
        // Get tags from tags directory
        const tags = await getArticleTagsFromTagsDir(article.slug);
        
        // Add author name as a tag if available
        if (article.author && typeof article.author === 'string') {
          tags.push(article.author);
        }
        
        articleTags[article.slug] = tags;
      }
    }
    
    // Create cache
    _tagsCache = {
      allTags,
      tagCounts,
      articleTags,
      lastUpdated: Date.now()
    };
    
    return _tagsCache;
  } catch (error) {
    console.error('Error initializing tag cache:', error);
    // Return empty cache on error
    _tagsCache = {
      allTags: [],
      tagCounts: {},
      articleTags: {},
      lastUpdated: Date.now()
    };
    return _tagsCache;
  }
}

// Main tag system functions (with React cache)
/**
 * Get all tag files
 */
export async function getAllTagFiles(): Promise<string[]> {
  try {
    if (!existsSync(TAGS_DIRECTORY)) {
      return [];
    }
    
    const files = await fs.readdir(TAGS_DIRECTORY);
    return files.filter(file => file.endsWith('.md'));
  } catch (error) {
    console.error('Error reading tags directory:', error);
    return [];
  }
}

/**
 * Get all unique tags across all articles
 */
export const getAllTags = cache(async (): Promise<string[]> => {
  await initializeTagCache();
  return _tagsCache?.allTags || [];
});

/**
 * Get all articles with their tags
 */
export const getArticlesWithTags = cache(async (): Promise<Article[]> => {
  // Get all articles
  const articles = await loadAllArticles();
  await initializeTagCache();
  
  // Add tags to each article
  for (const article of articles) {
    if (article.slug && _tagsCache?.articleTags[article.slug]) {
      article.tags = _tagsCache.articleTags[article.slug];
      
      // Ensure author name is included in tags if available
      if (article.author && typeof article.author === 'string' && !article.tags.includes(article.author)) {
        article.tags.push(article.author);
      }
    } else if (article.slug) {
      // If no tags found in cache, initialize with empty array
      article.tags = [];
      
      // Add author name as tag if available
      if (article.author && typeof article.author === 'string') {
        article.tags.push(article.author);
      }
    }
  }
  
  return articles;
});

// For backward compatibility with new naming
export const getEnrichedArticles = getArticlesWithTags;

/**
 * Get tag counts
 */
export const getTagCounts = cache(async (): Promise<Record<string, number>> => {
  await initializeTagCache();
  return _tagsCache?.tagCounts || {};
});

// For backward compatibility
export const getTagsWithCounts = getTagCounts;
export const getAllTagsWithCounts = getTagCounts;

/**
 * Filter articles by tag
 */
export async function filterArticlesByTag(articles: Article[], tag: string): Promise<Article[]> {
  if (!tag || tag === 'all') {
    return articles;
  }
  
  const filteredArticles: Article[] = [];
  for (const article of articles) {
    if (await articleMatchesTag(article, tag)) {
      filteredArticles.push(article);
    }
  }
  
  return filteredArticles;
}

/**
 * Invalidate the tag cache (for testing or after content changes)
 */
export async function invalidateTagCache(): Promise<void> {
  _tagsCache = null;
}

// ===============================
// POPULAR TAGS FUNCTIONALITY
// ===============================

/**
 * Get popular tags by usage count
 */
export const getPopularTags = cache(async (limit: number = 10): Promise<string[]> => {
  const allTagsWithCounts = await getTagsWithCounts();
  
  // Convert to array of [tag, count] pairs
  const tagCountPairs = Object.entries(allTagsWithCounts);
  
  // Sort by count (descending)
  tagCountPairs.sort((a, b) => b[1] - a[1]);
  
  // Return the top tags (limit)
  return tagCountPairs.slice(0, limit).map(pair => pair[0]);
});

// For backward compatibility (no deprecation warnings needed)
export const getAllUniqueTags = getAllTags;
