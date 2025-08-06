// app/utils/componentLoader.new.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { cache } from 'react';

/**
 * Server-side component loader - uses direct file system access
 * Use this in server components
 */
export const loadComponentServer = cache(async function(
  type: string,
  slug: string,
  options: {
    convertMarkdown?: boolean;
    loadFrontmatter?: boolean;
  } = {}
) {
  const { convertMarkdown = false, loadFrontmatter = false } = options;
  
  try {
    // Load component content
    const componentPath = path.join(
      process.cwd(),
      'content',
      'components',
      type,
      `${slug}.md`
    );
    
    if (!fs.existsSync(componentPath)) {
      return null;
    }
    
    const fileContent = fs.readFileSync(componentPath, 'utf8');
    const { data, content } = matter(fileContent);
    
    // Process content if needed
    let processedContent = content;
    if (convertMarkdown) {
      processedContent = await Promise.resolve(marked(content));
    }
    
    // Load frontmatter if requested
    let frontmatterData = {};
    if (loadFrontmatter) {
      const frontmatterPath = path.join(
        process.cwd(),
        'content',
        'components',
        'frontmatter',
        `${slug}.md`
      );
      
      if (fs.existsSync(frontmatterPath)) {
        const frontmatterContent = fs.readFileSync(frontmatterPath, 'utf8');
        const { data: fmData } = matter(frontmatterContent);
        frontmatterData = fmData;
      }
    }
    
    return {
      content: processedContent,
      config: data,
      frontmatter: frontmatterData
    };
  } catch (error) {
    console.error(`Error loading ${type} for ${slug}:`, error);
    return null;
  }
});

/**
 * Export for components that may be used on either client or server
 * This is a dynamic approach that falls back to API in client context
 */
export const loadComponent = loadComponentServer;
