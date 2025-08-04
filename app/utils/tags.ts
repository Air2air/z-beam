// app/utils/tags.ts
// Simplified tag system with React cache for performance
'use server';

import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { cache } from 'react';
import { Article } from '../types/Article';
import { getAllArticles } from './contentUtils';

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
 * Parse tags from content string (from tags markdown file)
 */
export async function parseTagsFromContent(content: string): Promise<string[]> {
  if (!content) return [];
  
  // Skip any comment lines
  const contentWithoutComments = content.replace(/<!--.*?-->/gs, '').trim();
  
  // Split by commas and trim each tag
  return contentWithoutComments
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
}

/**
 * Check if an article matches a tag (case-insensitive)
 */
export async function articleMatchesTag(article: { tags?: string[] }, tag: string): Promise<boolean> {
  if (!tag) return true;
  if (!article.tags || !Array.isArray(article.tags)) return false;
  
  const tagLower = tag.toLowerCase();
  
  // Check each tag on the article
  return article.tags
    .filter(Boolean)
    .some(t => {
      // Direct match (case-insensitive)
      if (t.toLowerCase() === tagLower) return true;
      
      // Compound tag check (e.g., "Precision Cleaning" should match with "Cleaning")
      if (tagLower.includes(' ')) {
        const tagParts = tagLower.split(' ');
        return tagParts.some(part => t.toLowerCase() === part);
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
  // Skip if cache is still valid
  if (_tagsCache && (Date.now() - _tagsCache.lastUpdated < CACHE_EXPIRATION)) {
    return _tagsCache;
  }
  
  // Get all articles
  const articles = await getAllArticles();
  
  // Get all unique tags from tag files
  const tagFiles = await getAllTagFiles();
  const tagSet = new Set<string>();
  
  // Process each tag file
  for (const file of tagFiles) {
    const slug = file.replace('.md', '');
    const tags = await getArticleTagsFromTagsDir(slug);
    tags.forEach(tag => tagSet.add(tag));
  }
  
  // Convert tag set to array
  const allTags = Array.from(tagSet).sort();
  
  // Calculate tag counts
  const tagCounts: Record<string, number> = {};
  const articleTags: Record<string, string[]> = {};
  
  // Count articles per tag
  for (const tag of allTags) {
    const matchResults = await Promise.all(
      articles.map(article => articleMatchesTag(article, tag))
    );
    tagCounts[tag] = matchResults.filter(Boolean).length;
  }
  
  // Store tags for each article
  for (const article of articles) {
    if (article.slug) {
      const tags = await getArticleTagsFromTagsDir(article.slug);
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

// For backward compatibility
export const getAllUniqueTags = getAllTags;

/**
 * Get all articles with their tags
 */
export const getArticlesWithTags = cache(async (): Promise<Article[]> => {
  // Get all articles
  const articles = await getAllArticles();
  await initializeTagCache();
  
  // Add tags to each article
  for (const article of articles) {
    if (article.slug && _tagsCache?.articleTags[article.slug]) {
      article.tags = _tagsCache.articleTags[article.slug];
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
