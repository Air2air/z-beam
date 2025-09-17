// app/utils/contentAPI.ts
// Consolidated content loading API - replaces multiple content loaders
'use server';

import { cache } from 'react';
import fs from 'fs/promises';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { marked } from 'marked';
import matter from 'gray-matter';
import { logger, safeContentOperation } from './logger';
import { safeMatterParse } from './yamlSanitizer';
import { stripParenthesesFromSlug } from './formatting';
import { loadFrontmatterData } from './frontmatterLoader';
import { extractSafeValue } from './stringHelpers';
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
    badgesymbol: path.join(process.cwd(), 'content', 'components', 'badgesymbol'),
    author: path.join(process.cwd(), 'content', 'components', 'author'),
    tags: path.join(process.cwd(), 'content', 'components', 'tags'),
  },
  pages: path.join(process.cwd(), 'content', 'components', 'pages'),
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
          .map(file => stripParenthesesFromSlug(file.replace('.md', '')))
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
    
    // First try the exact slug for .md files
    let filePath = path.join(dir, `${slug}.md`);
    let isYamlFile = false;
    
    // If not found, look for files that would generate this slug (with parentheses)
    if (!existsSync(filePath)) {
      try {
        const files = await fs.readdir(dir);
        const matchingFile = files.find(file => 
          file.endsWith('.md') && 
          stripParenthesesFromSlug(file.replace('.md', '')) === slug
        );
        
        if (matchingFile) {
          filePath = path.join(dir, matchingFile);
        }
      } catch (error) {
        // Directory doesn't exist or can't be read
        return null;
      }
    }
    
    // For table component, also try .yaml files if .md not found
    if (!existsSync(filePath) && type === 'table') {
      const yamlPath = path.join(dir, `${slug}.yaml`);
      if (existsSync(yamlPath)) {
        filePath = yamlPath;
        isYamlFile = true;
      } else {
        // Try with parentheses for yaml files too
        try {
          const files = await fs.readdir(dir);
          const matchingYamlFile = files.find(file => 
            file.endsWith('.yaml') && 
            stripParenthesesFromSlug(file.replace('.yaml', '')) === slug
          );
          
          if (matchingYamlFile) {
            filePath = path.join(dir, matchingYamlFile);
            isYamlFile = true;
          }
        } catch (error) {
          // Continue with null result
        }
      }
    }

    // For jsonld component, try YAML files in jsonld-yaml directory
    if (!existsSync(filePath) && type === 'jsonld') {
      const yamlDir = path.join(process.cwd(), 'content', 'components', 'jsonld-yaml');
      const yamlPath = path.join(yamlDir, `${slug}.yaml`);
      if (existsSync(yamlPath)) {
        filePath = yamlPath;
        isYamlFile = true;
      }
    }

    // For metatags component, try YAML files in metatags-yaml directory
    if (!existsSync(filePath) && type === 'metatags') {
      const yamlDir = path.join(process.cwd(), 'content', 'components', 'metatags-yaml');
      const yamlPath = path.join(yamlDir, `${slug}.yaml`);
      if (existsSync(yamlPath)) {
        filePath = yamlPath;
        isYamlFile = true;
      }
    }
    
    if (!existsSync(filePath)) {
      return null;
    }
    
    const fileContents = await fs.readFile(filePath, 'utf8');
    
    if (isYamlFile) {
      // Handle YAML files for different component types
      const yamlContent = readFileSync(filePath, 'utf-8');
      const yamlData = matter(yamlContent);
      
      if (type === 'table') {
        // Handle YAML table files - convert to markdown format expected by Table component
        const tableData = yamlData.data.materialTables as { tables?: any[] };
        
        if (tableData && tableData.tables) {
          // Convert YAML structure to markdown format
          let markdownContent = '';
          
          tableData.tables.forEach((table: any) => {
            if (table.header) {
              markdownContent += `${table.header}\n\n`;
            }
            
            if (table.rows && table.rows.length > 0) {
              // Create markdown table header
              markdownContent += '| Property | Value | Unit |\n';
              markdownContent += '| --- | --- | --- |\n';
              
              // Add table rows
              table.rows.forEach((row: any) => {
                const property = row.property || '';
                const value = row.value || '';
                const unit = row.unit || '';
                markdownContent += `| ${property} | ${value} | ${unit} |\n`;
              });
              
              markdownContent += '\n\n';
            }
          });
          
          const processedContent = options.convertMarkdown 
            ? await marked(markdownContent)
            : markdownContent;
          
          return {
            content: processedContent,
            config: { variant: 'sectioned' }, // Use sectioned variant for YAML-based tables
          };
        }
      } else if (type === 'jsonld') {
        // Handle YAML jsonld files
        const materialData = yamlData.data.materialData;
        const jsonldSchema = yamlData.data.jsonldSchema;
        
        if (jsonldSchema) {
          const jsonldContent = JSON.stringify(jsonldSchema, null, 2);
          const processedContent = options.convertMarkdown 
            ? jsonldContent  // Don't markdown-process JSON-LD
            : jsonldContent;
          
          return {
            content: processedContent,
            config: { 
              ...materialData,
              jsonld: jsonldSchema
            },
          };
        }
      } else if (type === 'metatags') {
        // Handle YAML metatags files
        const seoData = yamlData.data.seoData;
        const seoConfig = yamlData.data.seoConfig;
        
        if (seoData) {
          // Convert to markdown format for consistency
          let markdownContent = `# SEO Meta Tags\n\n`;
          markdownContent += `Title: ${seoData.title}\n\n`;
          
          if (seoData.metaTags) {
            markdownContent += `## Meta Tags\n\n`;
            seoData.metaTags.forEach((tag: any) => {
              markdownContent += `- ${tag.name}: ${tag.content}\n`;
            });
            markdownContent += '\n';
          }
          
          const processedContent = options.convertMarkdown 
            ? await marked(markdownContent)
            : markdownContent;
          
          return {
            content: processedContent,
            config: { 
              title: seoData.title,
              meta_tags: seoData.metaTags,
              opengraph: seoData.openGraph,
              twitter: seoData.twitter,
              canonical: seoData.canonical,
              alternate: seoData.alternateLinks,
              seoConfig: seoConfig
            },
          };
        }
      }
      
      return null;
    } else {
      // Handle markdown files as before
      const { data, content } = safeMatterParse(fileContents);
      
      const processedContent = options.convertMarkdown 
        ? await marked(content)
        : content;
      
      return {
        content: processedContent,
        config: Object.keys(data).length > 0 ? data : undefined,
      };
    }
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
        // Use raw content for all components - let each component handle its own parsing
        // This provides consistency and flexibility for components like bullets, tags, etc.
        const componentData = await loadComponent(type, slug, { convertMarkdown: false });
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
    // Use specialized frontmatter loader for frontmatter data to ensure image URL processing
    const frontmatterData = await loadFrontmatterData(slug);
    if (frontmatterData && Object.keys(frontmatterData).length > 0) {
      return frontmatterData;
    }
    
    // Fallback to basic component loading for metatags
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
    // Skip markdown conversion for tags since they're just comma-separated values
    const shouldConvertMarkdown = type !== 'tags';
    const componentData = await loadComponent(type, slug, { convertMarkdown: shouldConvertMarkdown });
    
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

// Note: extractSafeValue is available from './stringHelpers' - 
// cannot re-export sync functions from server action files
