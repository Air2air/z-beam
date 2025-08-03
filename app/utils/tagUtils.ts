import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getAllArticles } from './contentUtils';
import { Article } from '../types/Article';

/**
 * Parse tags from the content string (from a tags markdown file)
 * For the format shown in alumina-laser-cleaning.md
 */
export function parseTagsFromContent(content: string): string[] {
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
export function articleMatchesTag(article: Article, tag: string): boolean {
  if (!tag) return true;
  if (!article.tags || !Array.isArray(article.tags)) return false;
  
  const tagLower = tag.toLowerCase();
  
  // Debug logging for specific tags in development
  const isDebugTag = process.env.NODE_ENV === 'development' && 
    (tag === 'Alumina' || tag === 'Laser Cleaning');
  
  if (isDebugTag) {
    console.log(`[tagUtils] Checking if article "${article.slug}" matches tag "${tag}"`);
    console.log(`[tagUtils] Article tags:`, article.tags);
  }
  
  const hasMatch = article.tags.some(t => {
    if (!t) return false;
    
    // Direct match (case-insensitive)
    if (t.toLowerCase() === tagLower) {
      if (isDebugTag) console.log(`[tagUtils] Direct match found: ${t} = ${tag}`);
      return true;
    }
    
    // Check if this is a compound tag (e.g., "Precision Cleaning" should match with "Cleaning")
    if (tagLower.includes(' ')) {
      // Split compound tag into parts
      const tagParts = tagLower.split(' ');
      
      // If any part of the compound tag matches, consider it a match
      const partMatch = tagParts.some(part => t.toLowerCase() === part);
      if (partMatch && isDebugTag) {
        console.log(`[tagUtils] Compound match found: ${t} matches part of ${tag}`);
      }
      return partMatch;
    }
    
    return false;
  });
  
  return hasMatch;
}

/**
 * Get tag content for a specific slug with article match counts
 */
export async function getTagsContentWithMatchCounts(slug: string) {
  try {
    // Load the tags content
    const tagsPath = path.join(process.cwd(), 'content', 'components', 'tags', `${slug}.md`);
    
    if (!existsSync(tagsPath)) {
      console.error(`No tags found for ${slug}`);
      return { content: null, counts: {} };
    }
    
    const content = await fs.readFile(tagsPath, 'utf8');
    
    // Parse tags from the content
    const tags = parseTagsFromContent(content);
    
    // Import the getArticlesWithTags function from articleTagsUtils
    // to ensure we have tags loaded from the tags directory
    const { getArticlesWithTags } = await import('./articleTagsUtils');
    const articles = await getArticlesWithTags();
    
    // Debug log
    if (process.env.NODE_ENV === 'development') {
      console.log(`[tagUtils] Found ${articles.length} total articles`);
      console.log(`[tagUtils] Processing tags for "${slug}":`, tags);
      
      // Check article tags
      articles.slice(0, 3).forEach((article, i) => {
        console.log(`[tagUtils] Article ${i} (${article.slug}) tags:`, article.tags);
      });
    }
    
    // Calculate match counts for each tag
    const counts: Record<string, number> = {};
    tags.forEach(tag => {
      const matchingArticles = articles.filter(article => articleMatchesTag(article, tag));
      counts[tag] = matchingArticles.length;
      
      // Debug log
      if (process.env.NODE_ENV === 'development') {
        console.log(`[tagUtils] Tag "${tag}" matches ${matchingArticles.length} articles`);
        if (matchingArticles.length > 0) {
          console.log(`[tagUtils] First few matching articles for "${tag}":`, 
            matchingArticles.slice(0, 2).map(a => a.slug));
        }
      }
    });
    
    return {
      content,
      counts
    };
  } catch (error) {
    console.error(`Error loading tags for ${slug}:`, error);
    return { content: null, counts: {} };
  }
}

/**
 * Get all available tags with article match counts
 */
export async function getAllTagsWithCounts() {
  try {
    // Get all articles
    const articles = await getAllArticles();
    
    // Collect all unique tags
    const allTags = new Set<string>();
    articles.forEach(article => {
      if (article.tags) {
        article.tags.forEach(tag => {
          if (tag) allTags.add(tag);
        });
      }
    });
    
    // Calculate match counts for each tag
    const counts: Record<string, number> = {};
    Array.from(allTags).forEach(tag => {
      counts[tag] = articles.filter(article => articleMatchesTag(article, tag)).length;
    });
    
    return {
      tags: Array.from(allTags).sort(),
      counts
    };
  } catch (error) {
    console.error('Error getting tags with counts:', error);
    return { tags: [], counts: {} };
  }
}
