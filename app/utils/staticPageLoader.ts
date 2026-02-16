/**
 * Static page loader for Next.js App Router static export
 * 
 * This utility loads YAML and Markdown files at build time for static pages,
 * avoiding runtime fs operations that break static export.
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import type { ArticleMetadata, ContentCardItem } from '@/types';

/**
 * Enhanced interface for static page frontmatter
 */
export interface StaticPageFrontmatter extends ArticleMetadata {
  pageTitle: string;
  pageDescription: string;
  contentCards?: ContentCardItem[];
  sections?: any[];  // Dynamic sections for enhanced pages
  comparisonSection?: {
    title: string;
    description: string;
  };
  schema?: {
    '@type': string;
    name?: string;
    description?: string;
    mainEntity?: any;
    [key: string]: any;
  };
  seo?: {
    robots?: {
      index: boolean;
      follow: boolean;
    };
  };
}

/**
 * Load a static page YAML configuration at build time
 * Uses synchronous fs for compatibility with static export
 */
export function loadStaticPage<T = ArticleMetadata>(filename: string): T {
  const yamlPath = path.join(process.cwd(), 'static-pages', filename);
  const yamlContent = fs.readFileSync(yamlPath, 'utf8');
  return yaml.load(yamlContent) as T;
}

/**
 * Load frontmatter YAML from a static page directory
 * Looks for page.yaml in the app directory structure
 * 
 * @param pageDirectory - Directory name (e.g., 'surface-cleaning', 'contact')
 * @returns Parsed frontmatter data
 */
export function loadStaticPageFrontmatter<T = StaticPageFrontmatter>(pageDirectory: string): T {
  const yamlPath = path.join(process.cwd(), 'app', pageDirectory, 'page.yaml');
  const yamlContent = fs.readFileSync(yamlPath, 'utf8');
  return yaml.load(yamlContent) as T;
}

/**
 * Type for static pages with content cards
 */
export interface StaticPageWithCards extends ArticleMetadata {
  contentCards?: any[];
}

/**
 * Type for Netalux page
 */
export interface NetaluxPageConfig extends ArticleMetadata {
  contentCards?: any[];
  needle100_150?: any;
  needle200_300?: any;
  jangoSpecs?: any;
}

/**
 * Parsed section structure for markdown content
 */
interface ParsedMarkdownSection {
  heading: string;
  text: string;
  image: {
    url: string;
    alt: string;
  };
  imagePosition: 'left' | 'right';
  details: string[];
}

/**
 * Load markdown content from app directory for static pages
 * 
 * Parses markdown with structure:
 * - # Page Title
 * - Description: text
 * - ## Section headings
 * - **Image**: url
 * - **Position**: left|right
 * - ### Details (bullet list)
 * 
 * Uses synchronous fs.readFileSync for compatibility with Next.js static export.
 * 
 * @param relativePath - Path relative to app directory (e.g., 'operations/content.md')
 * @returns Object with title, description, and contentCards array
 */
export function loadMarkdownContent(relativePath: string): {
  title: string;
  description: string;
  contentCards: ContentCardItem[];
} {
  const contentPath = path.join(process.cwd(), 'app', relativePath);
  const content = fs.readFileSync(contentPath, 'utf-8');
  
  // Extract title and description
  const lines = content.split('\n');
  const title = lines[0].replace(/^#\s+/, '').trim();
  const description = lines[2].trim();
  
  // Parse sections
  const sections: ParsedMarkdownSection[] = [];
  let currentSection: Partial<ParsedMarkdownSection> | null = null;
  let inDetails = false;
  
  for (let i = 4; i < lines.length; i++) {
    const line = lines[i];
    
    // New section (## heading)
    if (line.startsWith('## ')) {
      if (currentSection && currentSection.heading) {
        sections.push(currentSection as ParsedMarkdownSection);
      }
      currentSection = {
        heading: line.replace(/^##\s+/, '').trim(),
        details: []
      };
      inDetails = false;
    }
    // Section description (first non-empty line after heading)
    else if (currentSection && !currentSection.text && line.trim() && !line.startsWith('**')) {
      currentSection.text = line.trim();
    }
    // Image metadata
    else if (line.startsWith('**Image**:')) {
      if (currentSection) {
        const imageUrl = line.replace(/^\*\*Image\*\*:\s*/, '').trim();
        currentSection.image = {
          url: imageUrl,
          alt: currentSection.heading || ''
        };
      }
    }
    // Position metadata
    else if (line.startsWith('**Position**:')) {
      if (currentSection) {
        const position = line.replace(/^\*\*Position\*\*:\s*/, '').trim();
        currentSection.imagePosition = position as 'left' | 'right';
      }
    }
    // Details section starts
    else if (line.startsWith('### Details')) {
      inDetails = true;
    }
    // Detail item
    else if (inDetails && line.startsWith('- ')) {
      if (currentSection) {
        const detail = line.replace(/^-\s+/, '').trim();
        currentSection.details!.push(detail);
      }
    }
  }
  
  // Add last section
  if (currentSection && currentSection.heading) {
    sections.push(currentSection as ParsedMarkdownSection);
  }
  
  // Convert to ContentCardItem format
  const contentCards: ContentCardItem[] = sections.map((section, index) => ({
    order: index + 1,
    heading: section.heading,
    text: section.text,
    image: section.image,
    imagePosition: section.imagePosition,
    details: section.details
  }));
  
  return {
    title,
    description,
    contentCards
  };
}

/**
 * Enhanced markdown content loader for flexible component prop passing
 * 
 * Loads main content.md plus any additional markdown files in the page directory
 * Converts markdown to structured props for component consumption
 * 
 * @param pageDirectory - Directory name (e.g., 'surface-cleaning', 'contact')
 * @returns Object with main content plus additional markdown files as component props
 */
export function loadPageMarkdownContent(pageDirectory: string): {
  title: string;
  description: string;
  contentCards: ContentCardItem[];
  additionalContent: Record<string, {
    title?: string;
    content: string;
    sections: Array<{
      heading: string;
      content: string;
      list?: string[];
    }>;
  }>;
} {
  const basePath = path.join(process.cwd(), 'app', pageDirectory);
  
  // Load main content.md
  const mainContent = loadMarkdownContent(`${pageDirectory}/content.md`);
  
  // Discover additional markdown files
  const additionalContent: Record<string, any> = {};
  
  try {
    const files = fs.readdirSync(basePath);
    const markdownFiles = files.filter(file => 
      file.endsWith('.md') && file !== 'content.md'
    );
    
    for (const file of markdownFiles) {
      const fileName = file.replace('.md', '');
      const filePath = path.join(basePath, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      // Parse markdown content for component consumption
      const lines = fileContent.split('\n');
      let title = '';
      const sections: Array<{heading: string, content: string, list?: string[]}> = [];
      let currentSection: any = null;
      
      for (const line of lines) {
        if (line.startsWith('# ')) {
          title = line.replace(/^#\s+/, '').trim();
        } else if (line.startsWith('## ')) {
          if (currentSection) {
            sections.push(currentSection);
          }
          currentSection = {
            heading: line.replace(/^##\s+/, '').trim(),
            content: '',
            list: []
          };
        } else if (line.startsWith('- ') && currentSection) {
          currentSection.list = currentSection.list || [];
          currentSection.list.push(line.replace(/^-\s+/, '').trim());
        } else if (line.trim() && currentSection) {
          currentSection.content += (currentSection.content ? '\n' : '') + line.trim();
        }
      }
      
      if (currentSection) {
        sections.push(currentSection);
      }
      
      additionalContent[fileName] = {
        title,
        content: fileContent,
        sections
      };
    }
  } catch (error) {
    // Directory doesn't exist or no additional files - that's okay
  }
  
  return {
    ...mainContent,
    additionalContent
  };
}

/**
 * Centralized static page content loader with automatic slug generation
 * 
 * @param pageDirectory - Directory name (e.g., 'surface-cleaning', 'contact', 'operations')
 * @param enhanced - Whether to load additional markdown files (default: false)
 * @param useFrontmatter - Whether to load from page.yaml frontmatter instead of markdown (default: false)
 * @returns Object with title, description, contentCards, slug, and optional additionalContent
 */
export function loadStaticPageContent(
  pageDirectory: string, 
  enhanced: boolean = false,
  useFrontmatter: boolean = false
): {
  title: string;
  description: string;
  contentCards: ContentCardItem[];
  slug: string;
  clickableCards?: Array<{
    href: string;
    heading: string;
    text: string;
    image: {
      url: string;
      alt: string;
    };
  }>;
  additionalContent?: Record<string, {
    title?: string;
    content: string;
    sections: Array<{
      heading: string;
      content: string;
      list?: string[];
    }>;
  }>;
} {
  if (useFrontmatter) {
    // Load from frontmatter YAML in the page directory
    const frontmatter = loadStaticPageFrontmatter(pageDirectory) as any;

    const sectionsAsCards = Array.isArray(frontmatter.sections)
      ? frontmatter.sections
          .flatMap((section: any) => (Array.isArray(section?.items) ? section.items : []))
          .map((item: any, index: number): ContentCardItem => ({
            order: typeof item?.order === 'number' ? item.order : undefined,
            heading: item?.heading ?? '',
            text: item?.text ?? '',
            image: item?.image,
            imagePosition: item?.imagePosition,
            details: Array.isArray(item?.details) ? item.details : []
          }))
      : [];

    return {
      title: frontmatter.pageTitle || frontmatter.title || '',
      description: frontmatter.pageDescription || frontmatter.description || '',
      contentCards: frontmatter.contentCards || sectionsAsCards,
      slug: frontmatter.slug || pageDirectory,
      clickableCards: frontmatter.clickableCards,
      additionalContent: undefined // Not supported for frontmatter mode yet
    };
  } else if (enhanced) {
    const content = loadPageMarkdownContent(pageDirectory);
    return {
      ...content,
      slug: pageDirectory
    };
  } else {
    const content = loadMarkdownContent(`${pageDirectory}/content.md`);
    return {
      ...content,
      slug: pageDirectory
    };
  }
}
