import { Article, EnrichedArticle } from '../types/Article';

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
export function enrichArticle(article: Article): EnrichedArticle {
  // Create a new object to avoid mutating the original
  const enriched = { ...article } as EnrichedArticle;
  
  // Initialize tags array if it doesn't exist
  if (!enriched.tags) {
    enriched.tags = [];
  }
  
  // Add author name as a tag if available
  if (enriched.author?.author_name && !enriched.tags.includes(enriched.author.author_name)) {
    enriched.tags.push(enriched.author.author_name);
  }
  
  // Ensure name is set from frontmatter if available
  if (enriched.frontmatter?.name && !enriched.name) {
    enriched.name = enriched.frontmatter.name;
  }
  
  // If no name is available yet, try to extract it from the slug
  if (!enriched.name && enriched.slug) {
    // Handle multi-word material names in slugs like "silicon-carbide-laser-cleaning"
    const slugParts = enriched.slug.split('-');
    
    // Common multi-word material patterns
    const multiWordMaterials = [
      {pattern: ["silicon", "carbide"], name: "Silicon Carbide"},
      {pattern: ["silicon", "nitride"], name: "Silicon Nitride"},
      {pattern: ["aluminum", "oxide"], name: "Aluminum Oxide"},
      {pattern: ["zirconium", "oxide"], name: "Zirconium Oxide"},
      {pattern: ["carbon", "fiber"], name: "Carbon Fiber"},
      {pattern: ["stainless", "steel"], name: "Stainless Steel"},
    ];
    
    // Check for known multi-word materials
    let foundMultiWord = false;
    for (const material of multiWordMaterials) {
      if (
        slugParts.length >= material.pattern.length &&
        material.pattern.every((part, i) => slugParts[i] === part)
      ) {
        enriched.name = material.name;
        foundMultiWord = true;
        break;
      }
    }
    
    // If no known multi-word pattern, use smart extraction
    if (!foundMultiWord) {
      // If the slug has "laser" or "cleaning", extract everything before that
      const laserIndex = slugParts.indexOf("laser");
      const cleaningIndex = slugParts.indexOf("cleaning");
      
      let endIndex = -1;
      if (laserIndex > 0) endIndex = laserIndex;
      else if (cleaningIndex > 0) endIndex = cleaningIndex;
      
      if (endIndex > 0) {
        // Take all parts before "laser" or "cleaning" and capitalize them
        enriched.name = slugParts
          .slice(0, endIndex)
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ");
      } else {
        // Use first part capitalized
        enriched.name = slugParts[0].charAt(0).toUpperCase() + slugParts[0].slice(1);
      }
    }
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
      const capitalizedCategory = enriched.frontmatter.category.charAt(0).toUpperCase() + 
                                  enriched.frontmatter.category.slice(1);
      enriched.tags.push(capitalizedCategory);
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
    if (enriched.frontmatter.author && enriched.frontmatter.author.author_name) {
      enriched.tags.push(enriched.frontmatter.author.author_name);
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
  if (enriched.author?.author_name) {
    enriched.tags.push(enriched.author.author_name);
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
  
  // DEDUPLICATE AND ENSURE HREF
  enriched.tags = [...new Set(enriched.tags)];
  
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
export function enrichArticles(articles: Article[]): EnrichedArticle[] {
  return articles.map(article => enrichArticle(article));
}