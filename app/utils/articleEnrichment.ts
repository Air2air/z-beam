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
  
  // Debug logging for frontmatter
  if (process.env.NODE_ENV === 'development') {
    console.log(`Enriching article: ${article.slug || 'unknown'}`);
    console.log(`Frontmatter:`, article.frontmatter);
    console.log(`Name before: ${article.name || 'undefined'}`);
    console.log(`Frontmatter name: ${article.frontmatter?.name || 'undefined'}`);
  }
  
  // Initialize tags array if it doesn't exist
  if (!enriched.tags) {
    enriched.tags = [];
  }
  
  // Ensure name is set from frontmatter if available
  if (enriched.frontmatter?.name && !enriched.name) {
    enriched.name = enriched.frontmatter.name;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Setting name from frontmatter: ${enriched.name}`);
    }
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
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`Generated multi-word name from slug: ${enriched.name}`);
        }
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
        // Fallback to just the first part capitalized
        enriched.name = slugParts[0].charAt(0).toUpperCase() + slugParts[0].slice(1);
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Generated name from slug: ${enriched.name}`);
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
  
  // 4. DEVELOPMENT TEST TAGS
  if (process.env.NODE_ENV === 'development') {
    // Add common category tags for testing
    enriched.tags.push('Ceramic');
    enriched.tags.push('Surface Treatment');
    enriched.tags.push('Laser');
    enriched.tags.push('Cleaning');
    enriched.tags.push('Industrial Cleaning');
    enriched.tags.push('Precision Cleaning');
    
    // Also extract from the URL for testing the current page
    if (typeof window !== 'undefined') {
      const urlPath = window.location.pathname;
      if (urlPath.startsWith('/tag/')) {
        const urlTag = decodeURIComponent(urlPath.split('/').pop() || '');
        if (urlTag && urlTag !== '') {
          enriched.tags.push(urlTag);
        }
      }
    }
  }
  
  // 5. DEDUPLICATE AND ENSURE HREF
  enriched.tags = [...new Set(enriched.tags)];
  
  if (!enriched.href) {
    if (enriched.slug) {
      enriched.href = `/${enriched.slug}`;
    } else {
      enriched.href = '#';
    }
  }
  
  return enriched;
}

// Batch process multiple articles
export function enrichArticles(articles: Article[]): EnrichedArticle[] {
  return articles.map(article => enrichArticle(article));
}