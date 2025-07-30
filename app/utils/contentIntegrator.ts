// app/utils/contentIntegrator.ts - Fixed imports
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

// Remove frontmatter import since we're moving away from central frontmatter
// import { loadFrontmatterData, FrontmatterData } from './frontmatterLoader';

// Import component loaders
import { loadTableData, TableData } from '@/app/components/Table/TableLoader';
import { loadBulletsData, BulletsData } from '@/app/components/Bullets/BulletsLoader';
import { loadCaptionData, CaptionData } from '@/app/components/Caption/CaptionLoader';

// Create a simple MetaTagsData interface here for now
export interface MetaTagsData {
  subject?: string;
  articleType?: string;
  category?: string;
  description?: string;
  keywords?: string[];
  author?: string;
  technicalCompliance?: string;
  wordCount?: string;
  image?: string;
  url?: string;
}

export interface EnhancedArticle {
  slug: string;
  metadata: MetaTagsData; // This contains subject, author, etc.
  components: {
    table?: TableData;
    bullets?: BulletsData;
    caption?: CaptionData;
    content?: string;
    jsonld?: string;
    metatags?: MetaTagsData; // Optional: duplicate of metadata
  };
  // No frontmatter property!
}

export async function getEnhancedArticle(slug: string): Promise<EnhancedArticle | null> {
  try {
    // Load component data - remove frontmatter dependency
    const [tableData, bulletsData, captionData, contentData, jsonldData, metatagsData] = await Promise.all([
      loadTableData(slug), // Remove frontmatter parameter
      loadBulletsData(slug), // Remove frontmatter parameter
      loadCaptionData(slug), // Remove frontmatter parameter
      loadLegacyComponent('content', slug),
      loadLegacyComponent('jsonld', slug),
      loadMetaTagsData(slug),
    ]);

    // Check if we have any content to show
    if (!contentData && !tableData && !bulletsData && !captionData && !metatagsData) {
      return null;
    }

    return {
      slug,
      metadata: metatagsData || { subject: slug },
      components: {
        table: tableData || undefined,
        bullets: bulletsData || undefined,
        caption: captionData || undefined,
        content: contentData || undefined,
        jsonld: jsonldData || undefined,
        metatags: metatagsData || undefined,
      },
    };
  } catch (error) {
    console.error(`Error getting enhanced article for ${slug}:`, error);
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

// Legacy function for non-refactored components
async function loadLegacyComponent(componentType: string, slug: string): Promise<string | null> {
  try {
    const componentPath = path.join(
      process.cwd(),
      'content',
      'components',
      componentType,
      `${slug}.md`
    );

    if (!fs.existsSync(componentPath)) {
      return null;
    }

    const fileContent = fs.readFileSync(componentPath, 'utf8');
    const { content } = matter(fileContent);
    
    // Convert markdown to HTML for table components (legacy support)
    if (componentType === 'table') {
      marked.setOptions({
        gfm: true,
        breaks: false,
      });
      
      const result = marked(content.trim());
      return typeof result === 'string' ? result : await result;
    }
    
    return content.trim();
  } catch (error) {
    console.error(`Error loading component ${componentType} for ${slug}:`, error);
    return null;
  }
}