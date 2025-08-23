// app/utils/contentAPI.ts
// Consolidated content loading API - replaces multiple content loaders
'use server';

import { cache } from 'react';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { marked } from 'marked';
import { logger, safeContentOperation } from './logger';
import { safeMatterParse } from './yamlSanitizer';
import type { Article } from './contentUtils';

// Content directories configuration
const CONTENT_DIRS = {
  components: {
    frontmatter: path.join(process.cwd(), 'content', 'components', 'frontmatter'),
    metatags: path.join(process.cwd(), 'content', 'components', 'metatags'),
    content: path.join(process.cwd(), 'content', 'components', 'content'),
    bullets: path.join(process.cwd(), 'content', 'components', 'bullets'),
    caption: path.join(process.cwd(), 'content', 'components', 'caption'),
    table: path.join(process.cwd(), 'content', 'components', 'table'),
    propertiestable: path.join(process.cwd(), 'content', 'components', 'propertiestable'),
    author: path.join(process.cwd(), 'content', 'components', 'author'),
    tags: path.join(process.cwd(), 'content', 'components', 'tags'),
  },
  pages: path.join(process.cwd(), 'content', 'pages'),
} as const;

export interface ComponentData {
  content: string;
  config?: Record<string, unknown>;
}

export interface PageData {
  metadata: Record<string, unknown>;
  components: { [componentType: string]: ComponentData };
}

/**
 * Get all available article slugs from any content directory
 */
export const getAllSlugs = cache(async (): Promise<string[]> => {
  return safeContentOperation(async () => {
    const slugs = new Set<string>();
    
    // Check all component directories for slugs
    for (const dir of Object.values(CONTENT_DIRS.components)) {
      if (existsSync(dir)) {
        const files = await fs.readdir(dir);
        files
          .filter(file => file.endsWith('.md'))
          .map(file => file.replace('.md', ''))
          .forEach(slug => slugs.add(slug));
      }
    }
    
    return Array.from(slugs);
  }, [], 'getAllSlugs');
});

/**
 * Load a specific component for a given slug
 */
export const loadComponent = cache(async (
  type: string, 
  slug: string,
  options: { convertMarkdown?: boolean } = { convertMarkdown: true }
): Promise<ComponentData | null> => {
  return safeContentOperation(async () => {
    const dir = CONTENT_DIRS.components[type as keyof typeof CONTENT_DIRS.components];
    if (!dir) {
      logger.warn(`Unknown component type: ${type}`);
      return null;
    }
    
    const filePath = path.join(dir, `${slug}.md`);
    
    if (!existsSync(filePath)) {
      return null;
    }
    
    const fileContents = await fs.readFile(filePath, 'utf8');
    const { data, content } = safeMatterParse(fileContents);
    
    const processedContent = options.convertMarkdown 
      ? await marked(content)
      : content;
    
    return {
      content: processedContent,
      config: Object.keys(data).length > 0 ? data : undefined,
    };
  }, null, 'loadComponent', slug);
});

/**
 * Load all components for a given slug
 */
export const loadAllComponents = cache(async (slug: string): Promise<{ [componentType: string]: ComponentData }> => {
  return safeContentOperation(async () => {
    const components: { [componentType: string]: ComponentData } = {};
    
    // Load all component types for this slug
    const componentTypes = Object.keys(CONTENT_DIRS.components);
    
    await Promise.all(
      componentTypes.map(async (type) => {
        const componentData = await loadComponent(type, slug);
        if (componentData) {
          components[type] = componentData;
        }
      })
    );
    
    return components;
  }, {}, 'loadAllComponents', slug);
});

/**
 * Load frontmatter/metadata for a slug
 */
export const loadMetadata = cache(async (slug: string): Promise<Record<string, unknown>> => {
  return safeContentOperation(async () => {
    // Try frontmatter first, then metatags
    const frontmatterData = await loadComponent('frontmatter', slug, { convertMarkdown: false });
    if (frontmatterData?.config) {
      return frontmatterData.config;
    }
    
    const metatagsData = await loadComponent('metatags', slug, { convertMarkdown: false });
    if (metatagsData?.config) {
      return metatagsData.config;
    }
    
    return {};
  }, {}, 'loadMetadata', slug);
});

/**
 * Load complete page data (metadata + all components)
 */
export const loadPageData = cache(async (slug: string): Promise<PageData> => {
  return safeContentOperation(async () => {
    const [metadata, components] = await Promise.all([
      loadMetadata(slug),
      loadAllComponents(slug),
    ]);
    
    return { metadata, components };
  }, { metadata: {}, components: {} }, 'loadPageData', slug);
});

/**
 * Load article data in legacy format for backward compatibility
 */
export const loadArticle = cache(async (slug: string): Promise<Article | null> => {
  return safeContentOperation(async () => {
    const metadata = await loadMetadata(slug);
    
    if (!metadata.title) {
      return null;
    }
    
    return {
      slug,
      title: (metadata.title as string) || '',
      name: (metadata.name as string) || '',
      headline: (metadata.headline as string) || '',
      description: (metadata.description as string) || '',
      image: (metadata.image as string) || '',
      imageAlt: (metadata.imageAlt as string) || '',
      tags: (metadata.tags as string[]) || [],
      website: (metadata.website as string) || '',
      author: (metadata.author as string) || '',
      metadata,
    };
  }, null, 'loadArticle', slug);
});

/**
 * Load all articles in legacy format
 */
export const loadAllArticles = cache(async (): Promise<Article[]> => {
  return safeContentOperation(async () => {
    const slugs = await getAllSlugs();
    const articles: Article[] = [];
    
    await Promise.all(
      slugs.map(async (slug) => {
        const article = await loadArticle(slug);
        if (article) {
          articles.push(article);
        }
      })
    );
    
    return articles;
  }, [], 'loadAllArticles');
});

// Export legacy functions for backward compatibility
export const getAllArticles = loadAllArticles;
// Backward compatibility aliases
export const getArticleBySlug = loadArticle;

/**
 * Backward compatibility for getArticle function from contentIntegrator
 */
export const getArticle = cache(async (slug: string): Promise<{ metadata: Record<string, unknown>; components: Record<string, ComponentData> } | null> => {
  return safeContentOperation(async () => {
    const pageData = await loadPageData(slug);
    
    // Return in contentIntegrator format
    return {
      metadata: pageData.metadata,
      components: pageData.components
    };
  }, null, 'getArticle', slug);
});

/**
 * Backward compatibility for loadComponentData function from contentIntegrator
 */
export const loadComponentData = cache(async (type: string, slug: string): Promise<{ content: string; config?: Record<string, unknown> } | null> => {
  return safeContentOperation(async () => {
    const componentData = await loadComponent(type, slug, { convertMarkdown: true });
    
    if (!componentData) {
      return null;
    }
    
    // Return in contentIntegrator format
    return {
      content: componentData.content || '',
      config: componentData.config || {}
    };
  }, null, 'loadComponentData', `${type}/${slug}`);
});
export const getAllArticleSlugs = getAllSlugs;
