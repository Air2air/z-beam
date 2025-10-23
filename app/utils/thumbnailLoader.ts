// app/utils/thumbnailLoader.ts
import 'server-only';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { stripParenthesesFromSlug, stripParenthesesFromImageUrl } from './formatting';

export async function loadThumbnailData(slug: string, imageType: string = 'hero'): Promise<{
  src: string | null;
  alt: string | null;
}> {
  try {
    // Default paths for images
    const defaultImage = `/images/fallbacks/default-fallback.jpg`;
    const defaultAlt = slug || 'Image';
    
    if (!slug) return { src: defaultImage, alt: defaultAlt };
    
    // Check if there's a frontmatter file for this slug (first try exact match)
    let frontmatterPath = path.join(
      process.cwd(),
      'content',
      'components',
      'frontmatter',
      `${slug}.md`
    );
    
    // If not found, look for files that would generate this slug (with parentheses)
    if (!fs.existsSync(frontmatterPath)) {
      const frontmatterDir = path.join(process.cwd(), 'content', 'frontmatter');
      if (fs.existsSync(frontmatterDir)) {
        const files = fs.readdirSync(frontmatterDir);
        const matchingFile = files.find(file => 
          file.endsWith('.md') && 
          stripParenthesesFromSlug(file.replace('.md', '')) === slug
        );
        
        if (matchingFile) {
          frontmatterPath = path.join(frontmatterDir, matchingFile);
        }
      }
    }
    
    if (fs.existsSync(frontmatterPath)) {
      const fileContent = fs.readFileSync(frontmatterPath, 'utf8');
      const { data } = matter(fileContent);
      
      // Check for images in the frontmatter
      if (data?.images) {
        // For hero images
        if (imageType === 'hero' && data.images.hero) {
          const imageUrl = data.images.hero.url || defaultImage;
          return {
            src: stripParenthesesFromImageUrl(imageUrl),
            alt: data.images.hero.alt || defaultAlt
          };
        }
        
        // For thumbnail images
        if (imageType === 'thumbnail' && data.images.thumbnail) {
          const imageUrl = data.images.thumbnail.url || defaultImage;
          return {
            src: stripParenthesesFromImageUrl(imageUrl),
            alt: data.images.thumbnail.alt || defaultAlt
          };
        }
      }
    }
    
    // Fallbacks for different types of content
    return { src: defaultImage, alt: defaultAlt };
  } catch (error) {
    console.error(`Error loading thumbnail data for ${slug}:`, error);
    return { src: null, alt: null };
  }
}
