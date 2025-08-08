// app/utils/frontmatterLoader.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

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
      console.log(`DEBUG frontmatterLoader - No frontmatter file found for ${slug}`);
      return null;
    }
    
    const fileContent = fs.readFileSync(frontmatterPath, 'utf8');
    console.log(`DEBUG frontmatterLoader - Found frontmatter file for ${slug}`);
    
    // Simple approach: Try to parse with gray-matter
    try {
      const { data } = matter(fileContent);
      console.log(`DEBUG frontmatterLoader - Gray-matter parsed data for ${slug}:`, data?.images);
      
      // Direct regex extraction for images even if gray-matter worked
      const heroImageMatch = fileContent.match(/hero:[\s\S]*?url:[\s]*([^\n"]+)/);
      if (heroImageMatch && heroImageMatch[1]) {
        const heroUrl = heroImageMatch[1].trim().replace(/"/g, '');
        console.log(`DEBUG frontmatterLoader - Regex found hero URL for ${slug}:`, heroUrl);
        
        // Make sure the images structure exists
        if (!data.images) data.images = {};
        if (!data.images.hero) data.images.hero = {};
        
        // Add or update the URL
        data.images.hero.url = heroUrl;
      } else {
        console.log(`DEBUG frontmatterLoader - No hero URL found with regex for ${slug}`);
      }
      
      return data;
    } catch (matterError) {
      console.log(`DEBUG frontmatterLoader - Gray-matter failed for ${slug}:`, matterError);
      
      // Fallback: Extract image URLs directly with regex
      const result: any = {};
      
      // Extract hero image URL
      const heroImageMatch = fileContent.match(/hero:[\s\S]*?url:[\s]*([^\n"]+)/);
      if (heroImageMatch && heroImageMatch[1]) {
        const heroUrl = heroImageMatch[1].trim().replace(/"/g, '');
        console.log(`DEBUG frontmatterLoader - Fallback regex found hero URL for ${slug}:`, heroUrl);
        result.images = {
          hero: {
            url: heroUrl
          }
        };
      } else {
        console.log(`DEBUG frontmatterLoader - No hero URL found with fallback regex for ${slug}`);
      }
      
      return result;
    }
  } catch (error) {
    console.error(`Error loading frontmatter for ${slug}:`, error);
    return null;
  }
}
