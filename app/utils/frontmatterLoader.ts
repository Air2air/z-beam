// app/utils/frontmatterLoader.ts
import fs from 'fs/promises';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { safeMatterParse } from './yamlSanitizer';
import { logger } from './logger';
import { stripParenthesesFromImageUrl, stripParenthesesFromSlug } from './formatting';

export async function loadFrontmatterData(slug: string): Promise<unknown> {
  try {
    // First try the exact slug
    let frontmatterPath = path.join(
      process.cwd(),
      'content',
      'components',
      'frontmatter',
      `${slug}.md`
    );
    
    // If not found, look for files that would generate this slug (with parentheses)
    if (!existsSync(frontmatterPath)) {
      const frontmatterDir = path.join(process.cwd(), 'content', 'components', 'frontmatter');
      if (existsSync(frontmatterDir)) {
        const files = await fs.readdir(frontmatterDir);
        const matchingFile = files.find(file => 
          file.endsWith('.md') && 
          stripParenthesesFromSlug(file.replace('.md', '')) === slug
        );
        
        if (matchingFile) {
          frontmatterPath = path.join(frontmatterDir, matchingFile);
        }
      }
    }
    
    if (!existsSync(frontmatterPath)) {
      return null;
    }
    
    const fileContent = readFileSync(frontmatterPath, 'utf8');
    
    // Simple approach: Try to parse with gray-matter
    try {
      const { data } = safeMatterParse(fileContent);
      
      // Process all image URLs to strip parentheses
      if (data.images && typeof data.images === 'object') {
        Object.keys(data.images as Record<string, unknown>).forEach(imageType => {
          const imageData = (data.images as any)[imageType];
          if (imageData && imageData.url) {
            imageData.url = stripParenthesesFromImageUrl(imageData.url);
          }
        });
      }
      
      // Direct regex extraction for images even if gray-matter worked
      const heroImageMatch = fileContent.match(/hero:[\s\S]*?url:[\s]*([^\n"]+)/);
      if (heroImageMatch && heroImageMatch[1]) {
        const heroUrl = stripParenthesesFromImageUrl(heroImageMatch[1].trim().replace(/"/g, ''));
        
        // Make sure the images structure exists
        if (!data.images) data.images = {};
        if (!(data.images as any).hero) (data.images as any).hero = {};
        
        // Add or update the URL
        (data.images as any).hero.url = heroUrl;
      }
      
      return data;
    } catch (matterError) {
      // Alternative: Extract image URLs directly with regex
      const result: Record<string, unknown> = {};
      
      // Extract hero image URL
      const heroImageMatch = fileContent.match(/hero:[\s\S]*?url:[\s]*([^\n"]+)/);
      if (heroImageMatch && heroImageMatch[1]) {
        const heroUrl = stripParenthesesFromImageUrl(heroImageMatch[1].trim().replace(/"/g, ''));
        result.images = {
          hero: {
            url: heroUrl
          }
        };
      }
      
      return result;
    }
  } catch (error) {
    logger.error(`Error loading frontmatter for ${slug}`, error, { slug });
    return null;
  }
}
