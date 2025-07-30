import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface FrontmatterData {
  // Basic article metadata
  subject?: string;
  articleType?: string;
  category?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  
  // Minimal component configurations
  tableConfig?: {
    maxRows?: number;
    showHeader?: boolean;
    zebraStripes?: boolean;
  };
  
  bulletConfig?: {
    style?: 'bulleted' | 'numbered';
    maxItems?: number;
    showIcons?: boolean;
  };
  
  captionConfig?: {
    style?: 'default' | 'italic';
    size?: 'default' | 'large';
    alignment?: 'left' | 'center' | 'right';
  };

  // Allow any additional properties from YAML
  [key: string]: any;
}

export async function loadFrontmatterData(slug: string): Promise<FrontmatterData | null> {
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
    const { data } = matter(fileContent);
    
    return data as FrontmatterData;
  } catch (error) {
    console.error(`Error loading frontmatter for ${slug}:`, error);
    return null;
  }
}

// Helper function to get all available frontmatter slugs
export function getAvailableFrontmatterSlugs(): string[] {
  try {
    const frontmatterDir = path.join(process.cwd(), 'content', 'components', 'frontmatter');
    
    if (!fs.existsSync(frontmatterDir)) {
      return [];
    }
    
    return fs.readdirSync(frontmatterDir)
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace('.md', ''));
  } catch (error) {
    console.error('Error getting frontmatter slugs:', error);
    return [];
  }
}