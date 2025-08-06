// app/utils/serverUtils.ts
import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';

/**
 * Get frontmatter data for a material by slug
 * @param materialSlug The slug of the material to load
 * @returns The frontmatter data or null if not found
 */
export async function getMaterialFrontmatter(materialSlug: string) {
  if (!materialSlug) return null;
  
  try {
    // Clean the material name for search
    const cleanMaterialName = materialSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    // Define the base directory for material content
    const contentDir = path.join(process.cwd(), 'content', 'components', 'frontmatter');
    
    // List all files in the directory
    const allFiles = fs.readdirSync(contentDir);
    
    // Find matching material files
    let matchingFiles = allFiles.filter(file => 
      file.toLowerCase().includes(cleanMaterialName.toLowerCase())
    );

    if (matchingFiles.length === 0) {
      console.warn(`Material not found: ${materialSlug}`);
      return null;
    }

    // Use the first matching file
    const filePath = path.join(contentDir, matchingFiles[0]);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    // Parse frontmatter
    const { data: frontmatter } = matter(fileContents);

    return frontmatter;
  } catch (error) {
    console.error('Error loading material frontmatter:', error);
    return null;
  }
}

/**
 * Get image path for a material
 * @param materialSlug The slug of the material
 * @param imageType The type of image (hero, closeup, etc.)
 * @returns The image URL or undefined if not found
 */
export async function getMaterialImagePath(materialSlug: string, imageType: 'hero' | 'closeup' = 'hero') {
  const frontmatter = await getMaterialFrontmatter(materialSlug);
  
  if (!frontmatter?.images?.[imageType]?.url) {
    return undefined;
  }
  
  return frontmatter.images[imageType].url;
}
