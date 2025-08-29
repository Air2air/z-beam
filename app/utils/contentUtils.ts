// app/utils/contentUtils.ts
// Mark this file as server-only to prevent client-side imports of Node.js modules
'use server';

import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { logger, safeContentOperation } from './logger';
import { safeMatterParse } from './yamlSanitizer';
import { stripParenthesesFromSlug } from './formatting';
import { Article } from '../../types/core';

export type { Article };

export async function getAllArticleSlugs(): Promise<string[]> {
  return safeContentOperation(async () => {
    // Get slugs from any component directory (metatags, content, etc.)
    const metatagsDir = path.join(process.cwd(), 'content', 'components', 'metatags');
    const contentDir = path.join(process.cwd(), 'content', 'components', 'content');
    const frontmatterDir = path.join(process.cwd(), 'content', 'components', 'frontmatter');
    
    const slugs: string[] = [];
    
    // Check metatags directory first
    if (existsSync(metatagsDir)) {
      const metaFiles = await fs.readdir(metatagsDir);
      const metaSlugs = metaFiles
        .filter(file => file.endsWith('.md'))
        .map(file => stripParenthesesFromSlug(file.replace('.md', '')));
      slugs.push(...metaSlugs);
    }
    
    // Then check content directory
    if (existsSync(contentDir)) {
      const contentFiles = await fs.readdir(contentDir);
      const contentSlugs = contentFiles
        .filter(file => file.endsWith('.md'))
        .map(file => stripParenthesesFromSlug(file.replace('.md', '')));
      
      // Add only unique slugs
      contentSlugs.forEach(slug => {
        if (!slugs.includes(slug)) {
          slugs.push(slug);
        }
      });
    }
    
    // Finally check frontmatter directory
    if (existsSync(frontmatterDir)) {
      const frontmatterFiles = await fs.readdir(frontmatterDir);
      const frontmatterSlugs = frontmatterFiles
        .filter(file => file.endsWith('.md'))
        .map(file => stripParenthesesFromSlug(file.replace('.md', '')));
      
      // Add only unique slugs
      frontmatterSlugs.forEach(slug => {
        if (!slugs.includes(slug)) {
          slugs.push(slug);
        }
      });
    }
    
    return slugs;
  }, [], 'getAllArticleSlugs');
}

export async function getAllArticles(): Promise<Article[]> {
  const slugs = await getAllArticleSlugs();
  const articles: Article[] = [];
  
  for (const slug of slugs) {
    // Try to find the article in any of the content directories
    const directories = [
      path.join(process.cwd(), 'content', 'components', 'frontmatter'),
      path.join(process.cwd(), 'content', 'components', 'metatags'),
      path.join(process.cwd(), 'content', 'components', 'content')
    ];
    
    let articleData: Article | null = null;
    
    for (const dir of directories) {
      const filePath = path.join(dir, `${slug}.md`);
      
        try {
        if (existsSync(filePath)) {
          const fileContents = await fs.readFile(filePath, 'utf8');
          const { data, content } = safeMatterParse(fileContents);
          
          articleData = {
            slug,
            title: data.title,
            name: data.name || '',
            headline: data.headline || '',
            description: data.description || '',
            image: data.image || '',
            imageAlt: data.imageAlt || '',
            tags: data.tags || [],
            website: data.website || '',
            author: data.author || {},
            content: content || '', // Include the content for property searching
            metadata: {
              keywords: data.keywords || [],
              category: data.category || '',
              articleType: data.articleType || '',
              subject: data.subject || '',
              chemicalProperties: data.chemicalProperties || {},
              properties: data.properties || [],
              applications: data.applications || [],
              environmentalImpact: data.environmentalImpact || [],
              regulatoryStandards: data.regulatoryStandards || [],
              outcomes: data.outcomes || [],
              composition: data.composition || [],
              compatibility: data.compatibility || [],
              images: data.images || {}, // Add images to metadata
              technicalSpecifications: data.technicalSpecifications || {},
              countries: data.countries || [],
              manufacturingCenters: data.manufacturingCenters || []
            } as any
          } as Article;          // For frontmatter files, always try to read any top-level properties
          if (dir.includes('frontmatter') && articleData) {
            // Add any missing properties from raw data to articleData
            Object.entries(data).forEach(([key, value]) => {
              // articleData is guaranteed to be non-null here because of the check in the if condition
              if (key !== 'metadata' && articleData && !(articleData as any)[key]) {
                (articleData as any)[key] = value;
              }
            });
          }
          
          break;
        }
      } catch (error) {
        logger.error(`Error loading article for ${slug} in ${dir}`, error, { slug, dir });
      }
    }
    
    // Now also try to load property table content for this slug
    if (articleData) {
      try {
        const propertyTablePath = path.join(process.cwd(), 'content', 'components', 'propertiestable', `${slug}.md`);
        if (existsSync(propertyTablePath)) {
          const propertyContents = await fs.readFile(propertyTablePath, 'utf8');
          const { content: propertyContent } = safeMatterParse(propertyContents);
          
          // Append property table content to the main content
          if (propertyContent) {
            articleData.content = (articleData.content || '') + '\n' + propertyContent;
          }
        }
      } catch (error) {
        logger.error(`Error loading property table for ${slug}`, error, { slug });
      }
    }
    
    if (articleData) {
      articles.push(articleData);
    }
  }
  
  return articles;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  // Try to find the article in any of the content directories
  const directories = [
    path.join(process.cwd(), 'content', 'components', 'frontmatter'),
    path.join(process.cwd(), 'content', 'components', 'metatags'),
    path.join(process.cwd(), 'content', 'components', 'content')
  ];
  
  for (const dir of directories) {
    try {
      // First try the exact slug
      let filePath = path.join(dir, `${slug}.md`);
      
      // If not found, look for files that would generate this slug (with parentheses)
      if (!existsSync(filePath)) {
        const files = await fs.readdir(dir);
        const matchingFile = files.find(file => 
          file.endsWith('.md') && 
          stripParenthesesFromSlug(file.replace('.md', '')) === slug
        );
        
        if (matchingFile) {
          filePath = path.join(dir, matchingFile);
        }
      }
      
      if (existsSync(filePath)) {
        const fileContents = await fs.readFile(filePath, 'utf8');
        const { data } = safeMatterParse(fileContents);
        
        const articleData: Article = {
          slug: stripParenthesesFromSlug(slug), // Ensure slug is clean
          title: data.title || 'Untitled',
          name: data.name || '',
          headline: data.headline || '',
          description: data.description || '',
          image: data.image || '',
          imageAlt: data.imageAlt || '',
          tags: data.tags || [],
          website: data.website || '',
          author: data.author || {},
          metadata: {
            keywords: data.keywords || [],
            category: data.category || '',
            articleType: data.articleType || '',
            subject: data.subject || '',
            chemicalProperties: data.chemicalProperties || {},
            properties: data.properties || {},
            applications: data.applications || [],
            environmentalImpact: data.environmentalImpact || [],
            regulatoryStandards: data.regulatoryStandards || [],
            outcomes: data.outcomes || [],
            composition: data.composition || [],
            compatibility: data.compatibility || [],
            images: data.images || {}, // Add images to metadata
            technicalSpecifications: data.technicalSpecifications || {},
            countries: data.countries || [],
            manufacturingCenters: data.manufacturingCenters || []
          } as any
        } as Article;
        
        return articleData;
      }
    } catch (error) {
      logger.error(`Error loading article for ${slug} in ${dir}`, error, { slug, dir });
    }
  }
  
  return null;
}
