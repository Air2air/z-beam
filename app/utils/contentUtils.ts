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
// For testing - replace the empty implementation with this
export async function getAllArticles(): Promise<Article[]> {
  // Mock data for testing
  return [
    {
      slug: 'article-1',
      title: 'Test Article 1',
      description: 'This is a test article about aluminum',
      tags: ['aluminum', 'metal', 'materials'],
      metadata: {
        keywords: ['aluminum oxide', 'manufacturing'],
        category: 'Materials'
      }
    },
    {
      slug: 'article-2',
      title: 'Working with Ceramics',
      description: 'A guide to ceramic materials',
      tags: ['ceramic', 'materials', 'manufacturing'],
      metadata: {
        keywords: ['alumina', 'silicon nitride'],
        category: 'Materials'
      }
    },
    {
      slug: 'article-3',
      title: 'Laser Cleaning Technologies',
      description: 'Modern approaches to laser cleaning',
      tags: ['laser', 'cleaning', 'surface treatment'],
      metadata: {
        keywords: ['laser ablation', 'surface preparation'],
        category: 'Processes'
      }
    }
  ];
}