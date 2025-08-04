// app/utils/contentIntegrator.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

// Single interface for article metadata
export interface ArticleMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  subject?: string;
  category?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  noindex?: boolean;
  author?: string;
  // Include any other fields from your metatags files
  [key: string]: any; // Allow any other properties
}

export interface ArticleData {
  metadata: ArticleMetadata;
  components: Record<string, any> | null;
}

export async function getArticle(slug: string): Promise<ArticleData | null> {
  try {
    // 1. Load metadata directly from metatags
    const metadata = await loadMetaTags(slug);
    
    // 2. Load components
    const components: Record<string, any> = {};
    let hasAnyComponent = false;
    
    const componentTypes = [
      "content",
      "bullets",
      "table",
      "caption",
      "jsonld",
      "tags",
    ];
    
    for (const type of componentTypes) {
      const componentData = await loadComponentData(type, slug);
      if (componentData) {
        components[type] = componentData;
        hasAnyComponent = true;
      }
    }
    
    // 3. Return null if no metadata and no components
    if (!metadata && !hasAnyComponent) {
      return null;
    }
    
    // 4. Return article data
    return {
      metadata: metadata || {},
      components: hasAnyComponent ? components : null
    };
  } catch (error) {
    console.error(`Error loading article ${slug}:`, error);
    return null;
  }
}

// Simplified metatags loader
async function loadMetaTags(slug: string): Promise<ArticleMetadata | null> {
  try {
    const metatagsPath = path.join(
      process.cwd(),
      "content",
      "components",
      "metatags",
      `${slug}.md`
    );
    
    if (!fs.existsSync(metatagsPath)) {
      return null;
    }
    
    const fileContent = fs.readFileSync(metatagsPath, "utf8");
    const { data } = matter(fileContent);
    
    // Extract comment-based metadata (Category, Article Type, Subject)
    const commentMetadata: Record<string, string> = {};
    const commentMatch = fileContent.match(/<!--\s*([^>]*?)\s*-->/);
    
    if (commentMatch && commentMatch[1]) {
      const commentText = commentMatch[1];
      
      // Parse category
      const categoryMatch = commentText.match(/Category:\s*([^,]+)/i);
      if (categoryMatch && categoryMatch[1]) {
        commentMetadata.category = categoryMatch[1].trim();
      }
      
      // Parse article type
      const typeMatch = commentText.match(/Article Type:\s*([^,]+)/i);
      if (typeMatch && typeMatch[1]) {
        commentMetadata.articleType = typeMatch[1].trim();
      }
      
      // Parse subject
      const subjectMatch = commentText.match(/Subject:\s*([^,]+)/i);
      if (subjectMatch && subjectMatch[1]) {
        commentMetadata.subject = subjectMatch[1].trim();
      }
    }
    
    // Create a single metadata object
    const metadata: ArticleMetadata = {
      ...data,
      ...commentMetadata,
      // For Open Graph image, use the first image if it's an array
      ogImage: data.openGraph?.images?.[0]?.url || data.openGraph?.image || data.image,
      // Standard properties
      title: data.title,
      description: data.description,
      keywords: typeof data.keywords === 'string' ? data.keywords.split(',').map(k => k.trim()) : data.keywords,
      canonical: data.openGraph?.url,
      ogType: data.openGraph?.type || 'article',
      // Add materialSlug derived from subject for easier reference
      materialSlug: commentMetadata.subject ? commentMetadata.subject.toLowerCase() : null
    };
    
    return metadata;
  } catch (error) {
    console.error(`Error loading metatags for ${slug}:`, error);
    return null;
  }
}

// Generic component loader - always convert markdown to HTML
export async function loadComponentData(
  type: string,
  slug: string
): Promise<{ content: string; config?: any } | null> {
  try {
    const componentPath = path.join(
      process.cwd(),
      "content",
      "components",
      type,
      `${slug}.md`
    );

    if (!fs.existsSync(componentPath)) {
      return null;
    }

    const fileContent = fs.readFileSync(componentPath, "utf8");
    const { data, content } = matter(fileContent);

    if (!content?.trim()) {
      return null;
    }

    // Always convert markdown to HTML
    const processedContent = marked(content.trim());

    // Return generic structure
    return {
      content:
        processedContent instanceof Promise
          ? await processedContent
          : processedContent,
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
    case "table":
      return { maxRows: 50, showHeader: true, zebraStripes: false };
    case "bullets":
      return { style: "bulleted" };
    case "caption":
      return { style: "default", alignment: "left" };
    default:
      return {};
  }
}

// Get all article slugs
export async function getAllArticleSlugs() {
  try {
    // Using content/components/content directory instead of content/articles
    const contentDir = path.join(
      process.cwd(),
      "content",
      "components",
      "content"
    );

    // Create the directory if it doesn't exist to prevent errors
    if (!fs.existsSync(contentDir)) {
      console.warn(`Content directory ${contentDir} not found, creating it...`);
      fs.mkdirSync(contentDir, { recursive: true });
      return [];
    }

    const files = fs.readdirSync(contentDir);

    // Extract slugs from filenames (removing .md extension)
    return files
      .filter((file) => file.endsWith(".md"))
      .map((file) => file.replace(/\.md$/, ""));
  } catch (error) {
    console.error("Error getting article slugs:", error);
    // Return an empty array instead of throwing an error
    return [];
  }
}
