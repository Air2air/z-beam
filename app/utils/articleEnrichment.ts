import { Article, SearchableArticle } from '@/types';
import { slugToDisplayName, capitalizeFirst } from './formatting';

// Define patterns for tag inference
const TAG_PATTERNS = [
  { pattern: /ceramic|porcelain|alumina|kaolin|silicon/i, tag: 'Ceramic' },
  { pattern: /surface.*(treatment|preparation)|preparation.*surface/i, tag: 'Surface Treatment' },
  { pattern: /contaminant.*removal|removal.*contaminant|clean.*surface/i, tag: 'Contaminant Removal' },
  { pattern: /(industrial|manufacturing).*cleaning|cleaning.*(industrial|manufacturing)/i, tag: 'Industrial Cleaning' },
  { pattern: /laser|ablation|beam/i, tag: 'Laser' },
  { pattern: /clean|cleaner|cleaning/i, tag: 'Cleaning' },
  { pattern: /precision.*(clean|cleaner|cleaning)|cleaning.*precision/i, tag: 'Precision Cleaning' },
  { pattern: /industrial|manufacturing|factory/i, tag: 'Industrial' },
  { pattern: /medical|healthcare|hospital|surgical/i, tag: 'Medical' },
  { pattern: /electronic|semiconductor|pcb|circuit/i, tag: 'Electronics' },
  { pattern: /automotive|vehicle|car|transport/i, tag: 'Automotive' }
];

// Extract text from an article for tag inference
function extractArticleText(article: Article): string {
  const textParts: string[] = [];
  
  // Add title
  if (article.title) textParts.push(article.title);
  if (article.frontmatter?.title) textParts.push(article.frontmatter.title);
  
  // Add description
  if (article.description) textParts.push(article.description);
  if (article.frontmatter?.description) textParts.push(article.frontmatter.description);
  
  // Add slug parts
  if (article.slug) textParts.push(article.slug.replace(/-/g, ' '));
  
  // Add keywords
  if (article.frontmatter?.keywords && Array.isArray(article.frontmatter.keywords)) {
    textParts.push(...article.frontmatter.keywords);
  }
  
  return textParts.join(' ');
}

// Infer tags from article content
function inferTags(article: Article): string[] {
  const text = extractArticleText(article).toLowerCase();
  const inferredTags: string[] = [];
  
  TAG_PATTERNS.forEach(({ pattern, tag }) => {
    if (pattern.test(text)) {
      inferredTags.push(tag);
    }
  });
  
  return inferredTags;
}

// Main article enrichment function
export function enrichArticle(article: Article): SearchableArticle {
  // Create a new object to avoid mutating the original
  const enriched = { ...article } as SearchableArticle;
  
  // Initialize tags array if it doesn't exist
  if (!enriched.tags) {
    enriched.tags = [];
  }
  
  // Add author name as a tag if available
  if (enriched.author && !enriched.tags.includes(enriched.author)) {
    enriched.tags.push(enriched.author);
  }
  
  // Ensure name is set from frontmatter if available
  if (enriched.frontmatter?.name && !enriched.name) {
    enriched.name = enriched.frontmatter.name;
  }
  
  // If no name is available yet, try to extract it from the slug
  if (!enriched.name && enriched.slug) {
    enriched.name = slugToDisplayName(enriched.slug);
  }
  
  // 1. EXTRACT TAGS FROM FRONTMATTER
  if (enriched.frontmatter) {
    // Add explicit tags
    if (enriched.frontmatter.tags && Array.isArray(enriched.frontmatter.tags)) {
      enriched.tags.push(...enriched.frontmatter.tags);
    }
    
    // Add keywords
    if (enriched.frontmatter.keywords && Array.isArray(enriched.frontmatter.keywords)) {
      enriched.frontmatter.keywords.forEach(keyword => {
        if (keyword && typeof keyword === 'string') {
          enriched.tags.push(keyword);
        }
      });
    }
    
    // Add category
    if (enriched.frontmatter.category) {
      enriched.tags.push(enriched.frontmatter.category);
      // Also add capitalized version for consistency
      if (typeof enriched.frontmatter.category === 'string') {
        const capitalizedCategory = capitalizeFirst(enriched.frontmatter.category);
        enriched.tags.push(capitalizedCategory);
      }
    }
    
    // Add subject
    if (enriched.frontmatter.subject) {
      enriched.tags.push(enriched.frontmatter.subject);
    }
    
    // Add articleType
    if (enriched.frontmatter.articleType) {
      enriched.tags.push(enriched.frontmatter.articleType);
    }
    
    // Add author name from frontmatter if it exists
    if (enriched.frontmatter.author && typeof enriched.frontmatter.author === 'string') {
      enriched.tags.push(enriched.frontmatter.author);
    }
    
    // Parse raw content if it exists - EXTRACT TAGS FROM THE FIRST LINE
    if (enriched.content && typeof enriched.content === 'string') {
      const contentLines = enriched.content.trim().split('\n');
      // Check if the first line contains comma-separated tags
      if (contentLines.length > 0 && contentLines[0].includes(',')) {
        // Extract tags from the first line
        const firstLineTags = contentLines[0]
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);
        
        // Add these tags
        enriched.tags.push(...firstLineTags);
      }
    }
  }
  
  // 2. EXTRACT TAGS FROM METADATA
  if (enriched.metadata) {
    if (enriched.metadata.category) {
      enriched.tags.push(enriched.metadata.category);
    }
    
    if (enriched.metadata.subject) {
      enriched.tags.push(enriched.metadata.subject);
    }
    
    if (enriched.metadata.keywords && Array.isArray(enriched.metadata.keywords)) {
      enriched.tags.push(...enriched.metadata.keywords);
    }
  }
  
  // Add author name as a tag
  if (enriched.author && typeof enriched.author === 'string') {
    enriched.tags.push(enriched.author);
  }
  
  // 3. EXTRACT FROM SLUG
  if (enriched.slug) {
    // For slugs like "kaolin-laser-cleaning"
    const slugParts = enriched.slug.split('-');
    slugParts.forEach(part => {
      if (part.length > 3) {
        enriched.tags.push(part);
      }
    });
    
    // Important: Add "Surface Treatment" tag for any cleaning-related slug
    if (enriched.slug.includes('cleaning') || enriched.slug.includes('surface')) {
      enriched.tags.push('Surface Treatment');
    }
  }
  
  // ENHANCED TAG INFERENCE MAPPINGS
  const industryTagMappings: Record<string, string> = {
    'semiconductor': 'Electronics',
    'Semiconductor': 'Electronics'
  };

  // Apply tag mappings but keep originals too
  const mappedTags = enriched.tags.map(tag => industryTagMappings[tag] || tag);
  enriched.tags.push(...mappedTags);

  // Ensure specific industry tags are added based on content
  if (enriched.tags.some(tag => typeof tag === 'string' && tag.toLowerCase().includes('semiconductor'))) {
    enriched.tags.push('Electronics');
  }
  
  // Medical inference - more comprehensive
  if (enriched.tags.some(tag => typeof tag === 'string' && (
    tag.toLowerCase().includes('biomedical') || 
    tag.toLowerCase().includes('medical') ||
    tag.toLowerCase().includes('biocompatible') ||
    tag.toLowerCase().includes('surgical') ||
    tag.toLowerCase().includes('implant')
  ))) {
    enriched.tags.push('Medical');
  }
  
  // Industrial inference 
  if (enriched.tags.some(tag => typeof tag === 'string' && (
    tag.toLowerCase().includes('engineering') || 
    tag.toLowerCase().includes('quality') ||
    tag.toLowerCase().includes('industrial') ||
    tag.toLowerCase().includes('manufacturing')
  ))) {
    enriched.tags.push('Industrial');
  }
  
  // Surface Treatment inference - check slug, title, and tags
  const allText = `${enriched.slug || ''} ${enriched.title || ''} ${enriched.description || ''} ${enriched.tags.join(' ')}`.toLowerCase();
  if (allText.includes('cleaning') || allText.includes('surface treatment') || allText.includes('surface')) {
    enriched.tags.push('Surface Treatment');
  }
  
  // Precision Cleaning inference - combination patterns
  if (allText.includes('precision') && allText.includes('cleaning')) {
    enriched.tags.push('Precision Cleaning');
  }
  
  // Contaminant Removal inference
  if (allText.includes('contaminant') && allText.includes('removal')) {
    enriched.tags.push('Contaminant Removal');
  }

  // DEDUPLICATE AND ENSURE HREF - remove duplicates (case-insensitive, prefer capitalized)
  const tagMap = new Map<string, string>();
  enriched.tags.forEach(tag => {
    // Only process string tags
    if (typeof tag === 'string') {
      const lowerTag = tag.toLowerCase();
      if (!tagMap.has(lowerTag)) {
        tagMap.set(lowerTag, tag);
      } else {
        // If we have a duplicate, prefer the capitalized version
        const existing = tagMap.get(lowerTag)!;
        if (tag.charAt(0) === tag.charAt(0).toUpperCase() && existing.charAt(0) !== existing.charAt(0).toUpperCase()) {
          tagMap.set(lowerTag, tag);
        }
      }
    }
  });
  enriched.tags = Array.from(tagMap.values());
  
  // Ensure href is set - critical for navigation
  if (!enriched.href) {
    if (enriched.slug) {
      enriched.href = `/${enriched.slug}`;
      
      // Validate that href is a valid path - potentially check if file exists?
      if (process.env.NODE_ENV === 'development') {
        // Advanced validation could go here in the future
      }
    } else {
      // If no slug, use # but mark it for debugging
      enriched.href = '#';
    }
  }
  
  return enriched;
}

// Batch process multiple articles
export function enrichArticles(articles: Article[]): SearchableArticle[] {
  return articles.map(article => enrichArticle(article));
}