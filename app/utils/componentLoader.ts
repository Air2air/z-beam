// app/utils/componentLoader.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

/**
 * Load component data directly from content/components/{type}/{slug}.md
 * Simplified direct loading utility for components
 */
export async function loadComponent(
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
}
