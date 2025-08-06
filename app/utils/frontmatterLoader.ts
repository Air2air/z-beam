// app/utils/frontmatterLoader.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import yaml from 'js-yaml';

export async function loadFrontmatterData(slug: string): Promise<any> {
  try {
    const frontmatterPath = path.join(
      process.cwd(),
      'content',
      'components',
      'frontmatter',
      `${slug}.md`
    );
    
    if (fs.existsSync(frontmatterPath)) {
      const fileContent = fs.readFileSync(frontmatterPath, 'utf8');
      console.log('Raw frontmatter file content (first 500 chars):', fileContent.substring(0, 500));
      
      // Method 1: Try with gray-matter first
      let data: any = {};
      try {
        const matterResult = matter(fileContent);
        data = matterResult.data;
        console.log('Gray-matter extracted data:', data);
      } catch (matterError) {
        console.log('Gray-matter parsing failed, trying manual extraction');
      }
      
      // Method 2: Try manual YAML extraction
      if (Object.keys(data).length === 0) {
        try {
          data = extractYamlManually(fileContent);
          console.log('Manual YAML extraction result:', data);
        } catch (yamlError) {
          console.error('Manual YAML extraction failed:', yamlError);
        }
      }
      
      // Method 3: Direct regex extraction of the hero image URL as a last resort
      if (!data.images?.hero?.url) {
        // Extract hero image URL using regex
        const heroImageMatch = fileContent.match(/hero:[\s\S]*?url:[\s]*([^\n]+)/);
        if (heroImageMatch && heroImageMatch[1]) {
          const heroUrl = heroImageMatch[1].trim();
          console.log('Direct regex extracted hero URL:', heroUrl);
          
          // If we don't have images structure yet, create it
          if (!data.images) {
            data.images = { hero: { url: heroUrl } };
          } else if (!data.images.hero) {
            data.images.hero = { url: heroUrl };
          } else {
            data.images.hero.url = heroUrl;
          }
        }
      }
      
      console.log('Final frontmatter data for', slug, 'with images:', data?.images);
      return data;
    }
    
    return null;
  } catch (error) {
    console.error(`Error loading frontmatter for ${slug}:`, error);
    return null;
  }
}

// Function to manually extract YAML content from frontmatter files
function extractYamlManually(content: string): any {
  try {
    // Skip HTML comments at the beginning
    const contentWithoutComments = content.replace(/<!--[\s\S]*?-->\s*/g, '');
    
    // Try to parse as YAML
    return yaml.load(contentWithoutComments) as Record<string, any>;
  } catch (error) {
    console.error('Failed to manually extract YAML:', error);
    
    // Last resort: Extract specific fields we're interested in
    const result: any = {};
    
    // Extract images section specifically
    const imagesMatch = content.match(/images:([\s\S]*?)(?:^[a-zA-Z]+:|$)/m);
    if (imagesMatch && imagesMatch[1]) {
      try {
        const imagesYaml = `images:${imagesMatch[1]}`;
        const parsedImages = yaml.load(imagesYaml) as { images?: any };
        if (parsedImages && typeof parsedImages === 'object' && 'images' in parsedImages) {
          result.images = parsedImages.images;
        }
      } catch (e) {
        console.error('Failed to parse images section:', e);
      }
    }
    
    return result;
  }
}
