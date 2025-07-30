// app/utils/contentIntegrator.ts - Fixed version
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { loadFrontmatterData, FrontmatterData } from './frontmatterLoader';

// Import component loaders directly for now (simplified approach)
import { loadTableData, TableData } from '@/app/components/Table/TableLoader';
import { loadBulletsData, BulletsData } from '@/app/components/Bullets/BulletsLoader';
import { loadCaptionData, CaptionData } from '@/app/components/Caption/CaptionLoader';

export interface EnhancedArticle {
  slug: string;
  metadata: {
    title: string;
    description?: string;
    articleType?: string;
    category?: string;
  };
  frontmatter: FrontmatterData | null;
  components: {
    table?: TableData;
    bullets?: BulletsData;
    caption?: CaptionData;
    content?: string;
    jsonld?: string;
    tags?: string;
  };
}

export async function getEnhancedArticle(slug: string): Promise<EnhancedArticle | null> {
  try {
    const frontmatter = await loadFrontmatterData(slug);
    
    // Load component data using specific loaders
    const [tableData, bulletsData, captionData] = await Promise.all([
      loadTableData(slug, frontmatter),
      loadBulletsData(slug, frontmatter),
      loadCaptionData(slug, frontmatter),
    ]);

    // Keep legacy components for now
    const [content, jsonld, tags] = await Promise.all([
      loadLegacyComponent('content', slug),
      loadLegacyComponent('jsonld', slug),
      loadLegacyComponent('tags', slug),
    ]);

    // Check if we have any content to show
    if (!frontmatter && !content && !tableData && !bulletsData && !captionData) {
      return null;
    }

    return {
      slug,
      metadata: {
        title: frontmatter?.subject || slug,
        description: frontmatter?.description,
        articleType: frontmatter?.articleType,
        category: frontmatter?.category,
      },
      frontmatter,
      components: {
        table: tableData || undefined,
        bullets: bulletsData || undefined,
        caption: captionData || undefined,
        content: content || undefined,
        jsonld: jsonld || undefined,
        tags: tags || undefined,
      },
    };
  } catch (error) {
    console.error(`Error getting enhanced article for ${slug}:`, error);
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
      // Configure marked for tables
      marked.setOptions({
        gfm: true, // GitHub Flavored Markdown for tables
        breaks: false,
      });
      
      return await marked(content.trim()); // Add await here
    }
    
    return content.trim();
  } catch (error) {
    console.error(`Error loading component ${componentType} for ${slug}:`, error);
    return null;
  }
}