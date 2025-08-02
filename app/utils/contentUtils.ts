// app/utils/contentUtils.ts

// Define the Article interface first
export interface Article {
  slug: string;
  title: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  tags?: string[];
  metadata?: {
    keywords?: string[];
    category?: string;
    author?: string;
    // Add any other metadata fields your articles use
    [key: string]: any;
  };
}

// Get all articles with a specific tag
export async function getArticlesByTag(tag: string): Promise<Article[]> {
  const allArticles = await getAllArticles();
  return allArticles.filter(article => 
    article.tags && article.tags.includes(tag)
  );
}

// Get all unique tags from all articles
export async function getAllTags(): Promise<string[]> {
  const allArticles = await getAllArticles();
  
  const tagSet = new Set<string>();
  allArticles.forEach(article => {
    if (article.tags) {
      article.tags.forEach(tag => tagSet.add(tag));
    }
  });
  
  return Array.from(tagSet).sort();
}

// Get all articles (this depends on your content structure)
export async function getAllArticles(): Promise<Article[]> {
  // Your implementation to get all articles
  // For now, return empty array with correct type
  return [] as Article[];
}