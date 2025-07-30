// app/utils/server.ts - Updated to use component system
import fs from 'fs';
import path from 'path';

export async function getAllArticleSlugs(): Promise<string[]> {
  try {
    // Get slugs from any component directory (metatags, content, etc.)
    const metatagsDir = path.join(process.cwd(), 'content', 'components', 'metatags');
    const contentDir = path.join(process.cwd(), 'content', 'components', 'content');
    
    let slugs: string[] = [];
    
    // Check metatags directory first
    if (fs.existsSync(metatagsDir)) {
      slugs = fs.readdirSync(metatagsDir)
        .filter(file => file.endsWith('.md'))
        .map(file => file.replace('.md', ''));
    }
    
    // Fallback to content directory
    if (slugs.length === 0 && fs.existsSync(contentDir)) {
      slugs = fs.readdirSync(contentDir)
        .filter(file => file.endsWith('.md'))
        .map(file => file.replace('.md', ''));
    }
    
    return slugs;
  } catch (error) {
    console.error('Error getting article slugs:', error);
    return [];
  }
}

// Add other server-side functions if needed
export async function getAllArticles() {
  const slugs = await getAllArticleSlugs();
  // Return basic article info for listings, etc.
  return slugs.map(slug => ({ slug }));
}

