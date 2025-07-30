import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface FrontmatterData {
  category: string;
  articleType: string;
  subject: string;
  description?: string;
  keywords?: string[];
  author?: string;
  date?: string;
  image?: string;
  canonicalUrl?: string;
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
      console.warn(`Frontmatter file not found: ${frontmatterPath}`);
      return null;
    }

    const fileContent = fs.readFileSync(frontmatterPath, 'utf8');
    const { content } = matter(fileContent);
    
    // Extract metadata from HTML comment
    const metadataMatch = content.match(
      /<!-- Category: (.*?) \| Article Type: (.*?) \| Subject: (.*?) -->/
    );
    
    if (!metadataMatch) {
      console.warn(`No metadata found in frontmatter for ${slug}`);
      return null;
    }

    const [, category, articleType, subject] = metadataMatch;
    
    // Extract additional metadata if present in the content
    const descriptionMatch = content.match(/Description: (.*?)(?:\n|$)/);
    const keywordsMatch = content.match(/Keywords: (.*?)(?:\n|$)/);
    const authorMatch = content.match(/Author: (.*?)(?:\n|$)/);
    const dateMatch = content.match(/Date: (.*?)(?:\n|$)/);
    const imageMatch = content.match(/Image: (.*?)(?:\n|$)/);
    
    return {
      category: category.trim(),
      articleType: articleType.trim(),
      subject: subject.trim(),
      description: descriptionMatch?.[1]?.trim(),
      keywords: keywordsMatch?.[1]?.split(',').map(k => k.trim()),
      author: authorMatch?.[1]?.trim(),
      date: dateMatch?.[1]?.trim(),
      image: imageMatch?.[1]?.trim(),
    };
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