// app/utils/contentIntegrator.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

export interface MetaTagsData {
  subject?: string;
  articleType?: string;
  category?: string;
  description?: string;
  keywords?: string[];
  author?: string;
  // Other metadata fields...
  [key: string]: any;
}

export interface Article {
  slug: string;
  metadata: MetaTagsData;
  components: {
    [key: string]: {
      content: string;
      config?: any;
    } | undefined;
  };
}

// Main function to get article data
export async function getArticle(slug: string): Promise<Article | null> {
  try {
    // Load metadata
    const metatagsData = await loadMetaTagsData(slug);
    const metadata = metatagsData || { 
      subject: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    };

    // Define component types to load
    const componentTypes = ['table', 'bullets', 'caption', 'content'];
    
    // Create components object
    const components: Record<string, any> = {};
    
    // Load all components
    for (const type of componentTypes) {
      const convertMarkdown = type === 'table' || type === 'content';
      const componentData = await loadComponentData(type, slug, convertMarkdown);
      if (componentData) {
        components[type] = componentData;
      }
    }
    
    // Handle JSON-LD separately
    let jsonldData = await loadJsonldData(slug);
    
    if (!jsonldData && Object.keys(metadata).length > 0) {
      jsonldData = generateJsonLDFromMetadata(slug, metadata);
    }
    
    if (jsonldData) {
      components.jsonld = jsonldData;
    }

    return {
      slug,
      metadata,
      components,
    };
  } catch (error) {
    console.error(`Error getting article for ${slug}:`, error);
    return null;
  }
}

// For backward compatibility
export const getEnhancedArticle = getArticle;

// Generic component loader
export async function loadComponentData(type: string, slug: string, convertMarkdown = false): Promise<{content: string; config?: any} | null> {
  try {
    const componentPath = path.join(process.cwd(), 'content', 'components', type, `${slug}.md`);
    
    if (!fs.existsSync(componentPath)) {
      return null;
    }

    const fileContent = fs.readFileSync(componentPath, 'utf8');
    const { data, content } = matter(fileContent);
    
    if (!content?.trim()) {
      return null;
    }

    let processedContent: string;
    
    if (convertMarkdown) {
      // Handle the case where marked() might return a Promise
      const markedResult = marked(content.trim());
      processedContent = markedResult instanceof Promise 
        ? await markedResult 
        : markedResult;
    } else {
      processedContent = content.trim();
    }

    // Return generic structure
    return {
      content: processedContent,
      config: Object.keys(data).length > 0 ? data : getDefaultConfig(type),
    };
  } catch (error) {
    console.error(`Error loading ${type} for ${slug}:`, error);
    return null;
  }
}

// Simple default configs
function getDefaultConfig(type: string): any {
  switch (type) {
    case 'table':
      return { maxRows: 50, showHeader: true, zebraStripes: false };
    case 'bullets':
      return { style: 'bulleted' };
    case 'caption':
      return { style: 'default', alignment: 'left' };
    default:
      return {};
  }
}

// Simple metatags loader function
async function loadMetaTagsData(slug: string): Promise<MetaTagsData | null> {
  try {
    const metatagsPath = path.join(
      process.cwd(),
      'content',
      'components',
      'metatags',
      `${slug}.md`
    );

    if (!fs.existsSync(metatagsPath)) {
      return null;
    }

    const fileContent = fs.readFileSync(metatagsPath, 'utf8');
    const { data } = matter(fileContent);
    
    return data as MetaTagsData;
  } catch (error) {
    console.error(`Error loading meta tags data for ${slug}:`, error);
    return null;
  }
}

// JSON-LD loader
async function loadJsonldData(slug: string): Promise<any | null> {
  try {
    const jsonldPath = path.join(
      process.cwd(),
      'content',
      'components',
      'jsonld',
      `${slug}.md`
    );
    
    if (!fs.existsSync(jsonldPath)) {
      return null;
    }
    
    const fileContent = fs.readFileSync(jsonldPath, 'utf8');
    
    // Extract the JSON-LD script content
    const scriptMatch = fileContent.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    
    if (!scriptMatch || !scriptMatch[1]) {
      console.error(`No JSON-LD script found in ${jsonldPath}`);
      return null;
    }
    
    // Parse the JSON
    const jsonString = scriptMatch[1].trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error(`Error loading JSON-LD data for ${slug}:`, error);
    return null;
  }
}

// Generate JSON-LD from metadata
function generateJsonLDFromMetadata(slug: string, metadata: MetaTagsData): any {
  const title = metadata.subject || slug;
  const description = metadata.description || `Technical guide to ${title} for laser cleaning applications`;
  
  // Create basic structure
  const jsonLdData: any = {
    "@context": "https://schema.org",
    "@type": metadata.schemaType || "TechnicalArticle",
    "headline": metadata.title || `Technical guide to ${title} in laser cleaning applications`,
    "description": description,
    "url": metadata.url || `https://www.z-beam.com/${slug}`,
    "keywords": metadata.keywords || [],
    "datePublished": new Date().toISOString().split('T')[0],
    "dateModified": new Date().toISOString().split('T')[0]
  };
  
  // Add author if available
  if (metadata.author) {
    jsonLdData.author = {
      "@type": "Person",
      "name": metadata.author,
      "description": metadata.authorDescription || "Industry Expert in Laser Cleaning Technology"
    };
  }
  
  // Add publisher
  jsonLdData.publisher = {
    "@type": "Organization",
    "name": "Z-Beam",
    "url": "https://www.z-beam.com"
  };
  
  // Add material properties if available
  if (metadata.specifications) {
    jsonLdData.about = {
      "@type": "Product",
      "name": title,
      "description": `High-purity ${title.toLowerCase()} material used in laser cleaning applications`,
      "additionalProperty": Object.entries(metadata.specifications).map(([name, value]) => ({
        "@type": "PropertyValue",
        "name": name,
        "value": value
      }))
    };
  }
  
  // Add application categories
  if (metadata.applicationCategory) {
    jsonLdData.applicationCategory = metadata.applicationCategory;
  }
  
  // Add industry
  if (metadata.industry) {
    jsonLdData.industry = metadata.industry;
  }
  
  // Add word count if available
  if (metadata.wordCount) {
    jsonLdData.wordCount = parseInt(metadata.wordCount);
  }
  
  // Add image if available
  if (metadata.image) {
    jsonLdData.image = metadata.image;
  }
  
  // Add any additional properties directly from metadata.jsonld if it exists
  if (metadata.jsonld) {
    Object.assign(jsonLdData, metadata.jsonld);
  }
  
  return jsonLdData;
}