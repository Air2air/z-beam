// app/utils/contentIntegrator.ts - Merged functions
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

// Import component loaders
import { TableData } from '@/app/components/Table/TableLoader';
import { BulletsData } from '@/app/components/Bullets/BulletsLoader';
import { CaptionData } from '@/app/components/Caption/CaptionLoader';

export interface MetaTagsData {
  subject?: string;
  articleType?: string;
  category?: string;
  description?: string;
  keywords?: string[];
  author?: string;
  authorDescription?: string;
  technicalCompliance?: string;
  wordCount?: string;
  image?: string;
  url?: string;
  schemaType?: string;
  applicationCategory?: string;
  industry?: string;
  specifications?: Record<string, string>;
  jsonld?: any;
  [key: string]: any;
}

export interface Article {
  slug: string;
  metadata: MetaTagsData;
  components: {
    table?: TableData;
    bullets?: BulletsData;
    caption?: CaptionData;
    content?: string;
    jsonld?: any;
  };
}

// SINGLE implementation of getArticle
export async function getArticle(slug: string): Promise<Article | null> {
  try {
    // Load metadata
    const metatagsData = await loadMetaTagsData(slug);
    const metadata = metatagsData || { 
      subject: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    };

    // Load all components
    const tableData = await loadTableData(slug);
    const bulletsData = await loadBulletsData(slug);
    const captionData = await loadCaptionData(slug);
    const contentData = await loadContentData(slug);
    
    // Try to load JSON-LD from file first
    let jsonldData = await loadJsonldData(slug);
    
    // If no JSON-LD file exists, generate from metadata
    if (!jsonldData && Object.keys(metadata).length > 0) {
      jsonldData = generateJsonLDFromMetadata(slug, metadata);
    }

    return {
      slug,
      metadata,
      components: {
        table: tableData || undefined,
        bullets: bulletsData || undefined,
        caption: captionData || undefined,
        content: contentData || undefined,
        jsonld: jsonldData || undefined,
      },
    };
  } catch (error) {
    console.error(`Error getting article for ${slug}:`, error);
    return null;
  }
}

// For backward compatibility
export const getEnhancedArticle = getArticle;

// Simple component loaders
async function loadTableData(slug: string): Promise<TableData | null> {
  try {
    const content = await loadComponent('table', slug, true); // Convert markdown for tables
    if (!content) return null;
    
    return {
      content,
      config: { maxRows: 50, showHeader: true, zebraStripes: false }, // Default config
    };
  } catch (error) {
    console.error(`Error loading table data for ${slug}:`, error);
    return null;
  }
}

async function loadBulletsData(slug: string): Promise<BulletsData | null> {
  try {
    const content = await loadComponent('bullets', slug, false);
    if (!content) return null;
    
    return {
      content,
      config: { style: 'bulleted', maxItems: 10, showIcons: false }, // Default config
    };
  } catch (error) {
    console.error(`Error loading bullets data for ${slug}:`, error);
    return null;
  }
}

async function loadCaptionData(slug: string): Promise<CaptionData | null> {
  try {
    const content = await loadComponent('caption', slug, false);
    if (!content) return null;
    
    return {
      content,
      config: { style: 'default', size: 'default', alignment: 'left' }, // Default config
    };
  } catch (error) {
    console.error(`Error loading caption data for ${slug}:`, error);
    return null;
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

// Content loader
async function loadContentData(slug: string): Promise<string | null> {
  return loadComponent('content', slug, true); // Convert markdown
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

// Generic component loader
async function loadComponent(type: string, slug: string, convertMarkdown = false): Promise<string | null> {
  try {
    const componentPath = path.join(process.cwd(), 'content', 'components', type, `${slug}.md`);
    
    if (!fs.existsSync(componentPath)) {
      return null;
    }

    const fileContent = fs.readFileSync(componentPath, 'utf8');
    const { content } = matter(fileContent);
    
    if (!content?.trim()) {
      return null;
    }

    if (convertMarkdown) {
      const result = marked(content.trim());
      return typeof result === 'string' ? result : await result;
    }
    
    return content.trim();
  } catch (error) {
    console.error(`Error loading ${type} for ${slug}:`, error);
    return null;
  }
}