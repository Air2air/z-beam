// app/tag/[tag]/page.tsx
import { Metadata } from "next";

// app/utils/contentUtils.ts
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Add the export keyword here
export interface Article {
  slug: string;
  title: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  tags?: string[];
  name?: string;
  headline?: string;
  website?: string;
  author?: {
    author_id?: number;
    author_name?: string;
    author_country?: string;
    credentials?: string;
  };
  metadata?: {
    // Your metadata interface...
    keywords?: string[];
    category?: string;
    articleType?: string;
    subject?: string;
    chemicalProperties?: {
      symbol?: string;
      formula?: string;
      materialType?: string;
      [key: string]: any;
    };
    // Rest of your interface definition...
    [key: string]: any;
  };
}

export async function getAllArticleSlugs(): Promise<string[]> {
  try {
    // Get slugs from any component directory (metatags, content, etc.)
    const metatagsDir = path.join(process.cwd(), 'content', 'components', 'metatags');
    const contentDir = path.join(process.cwd(), 'content', 'components', 'content');
    const frontmatterDir = path.join(process.cwd(), 'content', 'components', 'frontmatter');
    
    let slugs: string[] = [];
    
    // Check metatags directory first
    if (existsSync(metatagsDir)) { // Use the imported existsSync
      const metaFiles = await fs.readdir(metatagsDir);
      const metaSlugs = metaFiles
        .filter(file => file.endsWith('.md'))
        .map(file => file.replace('.md', ''));
      slugs.push(...metaSlugs);
    }
    
    // Then check content directory
    if (existsSync(contentDir)) { // Use the imported existsSync
      const contentFiles = await fs.readdir(contentDir);
      const contentSlugs = contentFiles
        .filter(file => file.endsWith('.md'))
        .map(file => file.replace('.md', ''));
      
      // Add only unique slugs
      contentSlugs.forEach(slug => {
        if (!slugs.includes(slug)) {
          slugs.push(slug);
        }
      });
    }
    
    // Finally check frontmatter directory
    if (existsSync(frontmatterDir)) { // Use the imported existsSync
      const frontmatterFiles = await fs.readdir(frontmatterDir);
      const frontmatterSlugs = frontmatterFiles
        .filter(file => file.endsWith('.md'))
        .map(file => file.replace('.md', ''));
      
      // Add only unique slugs
      frontmatterSlugs.forEach(slug => {
        if (!slugs.includes(slug)) {
          slugs.push(slug);
        }
      });
    }
    
    return slugs;
  } catch (error) {
    console.error('Error getting article slugs:', error);
    return [];
  }
}

export async function getAllArticles(): Promise<Article[]> {
  const slugs = await getAllArticleSlugs();
  const articles: Article[] = [];
  
  for (const slug of slugs) {
    // Try to find the article in any of the content directories
    const directories = [
      path.join(process.cwd(), 'content', 'components', 'frontmatter'),
      path.join(process.cwd(), 'content', 'components', 'metatags'),
      path.join(process.cwd(), 'content', 'components', 'content')
    ];
    
    let articleData: Article | null = null;
    
    for (const dir of directories) {
      const filePath = path.join(dir, `${slug}.md`);
      
      try {
        if (existsSync(filePath)) { // Use the imported existsSync
          const fileContents = await fs.readFile(filePath, 'utf8');
          const { data } = matter(fileContents);
          
          articleData = {
            slug,
            title: data.title || 'Untitled', // Keep as fallback
            name: data.name || '', // Make sure this is mapped properly
            headline: data.headline || '',
            description: data.description || '',
            image: data.image || '',
            imageAlt: data.imageAlt || '',
            tags: data.tags || [],
            website: data.website || '',
            author: data.author || {},
            metadata: {
              keywords: data.keywords || [],
              category: data.category || '',
              articleType: data.articleType || '',
              subject: data.subject || '',
              chemicalProperties: data.chemicalProperties || {},
              properties: data.properties || {},
              applications: data.applications || [],
              environmentalImpact: data.environmentalImpact || [],
              regulatoryStandards: data.regulatoryStandards || [],
              outcomes: data.outcomes || [],
              composition: data.composition || [],
              compatibility: data.compatibility || [],
              technicalSpecifications: data.technicalSpecifications || {},
              countries: data.countries || [],
              manufacturingCenters: data.manufacturingCenters || []
            }
          };
          
          break; // Stop once we've found the article
        }
      } catch (error) {
        console.error(`Error reading ${slug} from ${dir}:`, error);
      }
    }
    
    if (articleData) {
      articles.push(articleData);
    }
  }
  
  // Make sure each article has proper tags
  return articles.map(article => {
    // Ensure article has tags array
    if (!article.tags) {
      article.tags = [];
    }
    
    // Add category as a tag if it exists
    if (article.metadata?.category && !article.tags.includes(article.metadata.category)) {
      article.tags.push(article.metadata.category);
    }
    
    // Add subject as a tag if it exists
    if (article.metadata?.subject && !article.tags.includes(article.metadata.subject)) {
      article.tags.push(article.metadata.subject);
    }
    
    // Add article type as a tag if it exists
    if (article.metadata?.articleType && !article.tags.includes(article.metadata.articleType)) {
      article.tags.push(article.metadata.articleType);
    }
    
    return article;
  });
}

export async function getAllTags(): Promise<string[]> {
  const articles = await getAllArticles();
  
  // Collect all tags from articles
  const tagSet = new Set<string>();
  
  articles.forEach(article => {
    if (article.tags) {
      article.tags.forEach(tag => tagSet.add(tag));
    }
  });
  
  // Convert Set to Array and sort alphabetically
  return Array.from(tagSet).sort();
}

export async function getArticlesByTag(tag: string): Promise<Article[]> {
  const articles = await getAllArticles();
  
  // Filter articles by tag (case-insensitive)
  return articles.filter(article => 
    article.tags?.some(articleTag => 
      articleTag.toLowerCase() === tag.toLowerCase()
    )
  );
}