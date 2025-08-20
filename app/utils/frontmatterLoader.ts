// app/utils/frontmatterLoader.ts
import fs from 'fs';
import path from 'path';
import { safeMatterParse } from './yamlSanitizer';
import { logger } from './logger';

export async function loadFrontmatterData(slug: string): Promise<any> {
  try {
    const frontmatterPath = path.join(
      process.cwd(),
      'content',
      'components',
      'frontmatter',
      `${slug}.md`
    );
    
    if (!fs.existsSync(frontmatterPath)) {
      return null;
    }
    
    const fileContent = fs.readFileSync(frontmatterPath, 'utf8');
    
    // Simple approach: Try to parse with gray-matter
    try {
      const { data } = safeMatterParse(fileContent);
      
      // Direct regex extraction for images even if gray-matter worked
      const heroImageMatch = fileContent.match(/hero:[\s\S]*?url:[\s]*([^\n"]+)/);
      if (heroImageMatch && heroImageMatch[1]) {
        const heroUrl = heroImageMatch[1].trim().replace(/"/g, '');
        
        // Make sure the images structure exists
        if (!data.images) data.images = {};
        if (!data.images.hero) data.images.hero = {};
        
        // Add or update the URL
        data.images.hero.url = heroUrl;
      }
      
      return data;
    } catch (matterError) {
      // Alternative: Extract image URLs directly with regex
      const result: any = {};
      
      // Extract hero image URL
      const heroImageMatch = fileContent.match(/hero:[\s\S]*?url:[\s]*([^\n"]+)/);
      if (heroImageMatch && heroImageMatch[1]) {
        const heroUrl = heroImageMatch[1].trim().replace(/"/g, '');
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
