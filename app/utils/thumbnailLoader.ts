// app/utils/thumbnailLoader.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export async function loadThumbnailData(slug: string, imageType: string = 'hero'): Promise<{
  src: string | null;
  alt: string | null;
}> {
  try {
    // Default paths for images
    const defaultImage = `/images/fallbacks/default-fallback.jpg`;
    const defaultAlt = slug || 'Image';
    
    if (!slug) return { src: defaultImage, alt: defaultAlt };
    
    // Check if there's a frontmatter file for this slug
    const frontmatterPath = path.join(
      process.cwd(),
      'content',
      'components',
      'frontmatter',
      `${slug}.md`
    );
    
    if (fs.existsSync(frontmatterPath)) {
      const fileContent = fs.readFileSync(frontmatterPath, 'utf8');
      const { data } = matter(fileContent);
      
      // Check for images in the frontmatter
      if (data?.images) {
        // For hero images
        if (imageType === 'hero' && data.images.hero) {
          return {
            src: data.images.hero.url || defaultImage,
            alt: data.images.hero.alt || defaultAlt
          };
        }
        
        // For thumbnail images
        if (imageType === 'thumbnail' && data.images.thumbnail) {
          return {
            src: data.images.thumbnail.url || defaultImage,
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
