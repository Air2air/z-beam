// app/utils/contentIntegrator.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { MetaTagsData } from './metadata';

interface ArticleMetadata {
  subject?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  category?: string;
}

interface ArticleData {
  metadata: ArticleMetadata;
  components: Record<string, any> | null;
}

export async function getArticle(slug: string): Promise<ArticleData | null> {
  try {
    // Load article metadata from frontmatter instead of articles
    const metadataPath = path.join(process.cwd(), 'content', 'components', 'frontmatter', `${slug}.md`);
    
    // Initialize with correct type
    let metadata = {} as ArticleMetadata;
    
    // Get metadata from frontmatter if available
    if (fs.existsSync(metadataPath)) {
      const frontmatterContent = fs.readFileSync(metadataPath, 'utf8');
      const { data } = matter(frontmatterContent);
      // Cast the data to ArticleMetadata
      metadata = data as ArticleMetadata || {} as ArticleMetadata;
    }
    
    // Components object to store only available components
    const components: Record<string, any> = {};
    
    // Check each component type
    const componentTypes = ['content', 'bullets', 'table', 'caption', 'jsonld', 'metatags', 'tags'];
    
    let hasAnyComponent = false;
    
    for (const type of componentTypes) {
      const componentData = await loadComponentData(type, slug);
      if (componentData) {
        components[type] = componentData;
        hasAnyComponent = true;
      }
    }
    
    // If no components and no metadata found, return null
    if (!hasAnyComponent && Object.keys(metadata).length === 0) {
      return null;
    }
    
    // Return with properly typed metadata
    return {
      metadata: { 
        subject: metadata.subject || '',
        description: metadata.description || '',
        keywords: metadata.keywords || [],
        ogImage: metadata.ogImage || '',
        category: metadata.category || '',
      },
      components: Object.keys(components).length > 0 ? components : null
    };
  } catch (error) {
    console.error(`Error loading article ${slug}:`, error);
    return null;
  }
}

// For backward compatibility
export const getEnhancedArticle = getArticle;

// Generic component loader - always convert markdown to HTML
export async function loadComponentData(type: string, slug: string): Promise<{content: string; config?: any} | null> {
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

    // Always convert markdown to HTML
    const processedContent = marked(content.trim());
    
    // Return generic structure
    return {
      content: processedContent instanceof Promise ? await processedContent : processedContent,
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

// Get all article slugs
export async function getAllArticleSlugs() {
  try {
    // Using content/components/content directory instead of content/articles
    const contentDir = path.join(process.cwd(), 'content', 'components', 'content');
    
    // Create the directory if it doesn't exist to prevent errors
    if (!fs.existsSync(contentDir)) {
      console.warn(`Content directory ${contentDir} not found, creating it...`);
      fs.mkdirSync(contentDir, { recursive: true });
      return [];
    }
    
    const files = fs.readdirSync(contentDir);
    
    // Extract slugs from filenames (removing .md extension)
    return files
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace(/\.md$/, ''));
  } catch (error) {
    console.error('Error getting article slugs:', error);
    // Return an empty array instead of throwing an error
    return [];
  }
}