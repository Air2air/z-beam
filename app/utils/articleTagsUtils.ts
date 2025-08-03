// app/utils/articleTagsUtils.ts
// Mark this file as server-only to prevent client-side imports of Node.js modules
'use server';

import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getAllArticles, Article } from './contentUtils';
import { parseTagsFromContent } from './tagUtils';

/**
 * Get tags for a specific article slug from the tags directory
 * Filters out test tags
 */
export async function getArticleTagsFromTagsDir(slug: string): Promise<string[]> {
  try {
    const tagsPath = path.join(process.cwd(), 'content', 'components', 'tags', `${slug}.md`);
    
    if (!existsSync(tagsPath)) {
      console.log(`No tags file found for ${slug}`);
      return [];
    }
    
    const content = await fs.readFile(tagsPath, 'utf8');
    const allTags = await parseTagsFromContent(content);
    return await filterOutTestTags(allTags);
  } catch (error) {
    console.error(`Error loading tags for ${slug}:`, error);
    return [];
  }
}

/**
 * Filter out test tags from an array of tags
 */
async function filterOutTestTags(tags: string[]): Promise<string[]> {
  // Define test tag patterns to filter out
  const testTagPatterns = [
    /test/i,           // matches "test", "Test", "TEST", etc.
    /sample/i,         // matches "sample", "Sample", etc.
    /example/i,        // matches "example", "Example", etc.
    /demo/i,           // matches "demo", "Demo", etc.
    /temporary/i,      // matches "temporary", "Temporary", etc.
    /development/i,    // matches "development", "Development", etc.
    /placeholder/i     // matches "placeholder", "Placeholder", etc.
  ];
  
  // Filter out tags that match any of the test patterns
  return tags.filter(tag => {
    return !testTagPatterns.some(pattern => pattern.test(tag));
  });
}

/**
 * Get all tag files from the tags directory
 */
export async function getAllTagFiles(): Promise<string[]> {
  try {
    const tagsDir = path.join(process.cwd(), 'content', 'components', 'tags');
    
    if (!existsSync(tagsDir)) {
      console.error(`Tags directory not found: ${tagsDir}`);
      return [];
    }
    
    const files = await fs.readdir(tagsDir);
    return files.filter(file => file.endsWith('.md'));
  } catch (error) {
    console.error('Error reading tags directory:', error);
    return [];
  }
}

/**
 * Get all articles with tags from the tags directory
 */
export async function getArticlesWithTags(): Promise<Article[]> {
  // Get all articles
  const articles = await getAllArticles();
  
  // For each article, try to load tags from the tags directory
  for (const article of articles) {
    // Skip if article already has tags
    if (!article.tags || article.tags.length === 0) {
      const tags = await getArticleTagsFromTagsDir(article.slug);
      if (tags.length > 0) {
        article.tags = tags;
      }
    } else {
      // Filter out test tags if the article already has tags
      article.tags = await filterOutTestTags(article.tags);
    }
  }
  
  return articles;
}

/**
 * Get all unique tags across all articles
 */
export async function getAllUniqueTags(): Promise<string[]> {
  const articles = await getArticlesWithTags();
  
  const tagSet = new Set<string>();
  articles.forEach(article => {
    if (article.tags && article.tags.length > 0) {
      article.tags.forEach(tag => {
        if (tag) tagSet.add(tag);
      });
    }
  });
  
  const allTags = Array.from(tagSet).sort();
  return await filterOutTestTags(allTags);
}

/**
 * Get tag counts for all tags
 */
export async function getTagCounts(): Promise<Record<string, number>> {
  const articles = await getArticlesWithTags();
  const tags = await getAllUniqueTags();
  
  const counts: Record<string, number> = {};
  tags.forEach(tag => {
    counts[tag] = articles.filter(article => 
      article.tags?.some(articleTag => 
        articleTag.toLowerCase() === tag.toLowerCase()
      )
    ).length;
  });
  
  return counts;
}

/**
 * Check if a tag appears to be a test tag
 */
export async function isTestTag(tag: string): Promise<boolean> {
  const testTagPatterns = [
    /test/i,
    /sample/i,
    /example/i,
    /demo/i,
    /temporary/i,
    /development/i,
    /placeholder/i
  ];
  
  return testTagPatterns.some(pattern => pattern.test(tag));
}
