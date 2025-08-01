// app/utils/contentIntegrator.ts - Fixed
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

// Import component loaders (if they exist, otherwise we'll create simple ones)
import { TableData } from '@/app/components/Table/TableLoader';
import { BulletsData } from '@/app/components/Bullets/BulletsLoader';
import { CaptionData } from '@/app/components/Caption/CaptionLoader';

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

export interface Article {
  slug: string;
  metadata: MetaTagsData;
  components: {
    table?: TableData;
    bullets?: BulletsData;
    caption?: CaptionData;
    content?: string;
    jsonld?: string;
  };
}

export async function getArticle(slug: string): Promise<Article | null> {
  try {
    const [tableData, bulletsData, captionData, contentData, jsonldData, metatagsData] = await Promise.all([
      loadTableData(slug),
      loadBulletsData(slug), 
      loadCaptionData(slug),
      loadContentData(slug),
      loadJsonldData(slug),
      loadMetaTagsData(slug),
    ]);

    return {
      slug,
      metadata: metatagsData || { subject: slug },
      components: {
        table: tableData || undefined,
        bullets: bulletsData || undefined,
        caption: captionData || undefined,
        content: contentData || undefined,
        jsonld: jsonldData || undefined,
      },
    };
  } catch (error) {
    console.error(`Error getting enhanced article for ${slug}:`, error);
    return null;
  }
}

// Simple component loaders - inline to avoid import errors
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

// Content and jsonld loaders
async function loadContentData(slug: string): Promise<string | null> {
  return loadComponent('content', slug, true); // Convert markdown
}

async function loadJsonldData(slug: string): Promise<string | null> {
  return loadComponent('jsonld', slug, false); // No markdown conversion
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