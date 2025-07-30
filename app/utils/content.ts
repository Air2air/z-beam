// app/utils/content.ts
// Unified content management system for articles, authors, and tags

import fs from 'fs';
import path from 'path';
import { parseFrontmatter } from './metadata';
import type { ArticlePost } from 'app/types/content';

// Simple cache
let articlesCache: ArticlePost[] | null = null;

export function getMDXFiles(dir: string): string[] {
  try {
    return fs.readdirSync(dir).filter((file) => {
      const ext = path.extname(file);
      return ext === '.mdx' || ext === '.md';
    });
  } catch (error) {
    console.error(`Error reading MDX files from directory ${dir}:`, error);
    return [];
  }
}

export function readMDXFile(filePath: string) {
  let rawContent = fs.readFileSync(filePath, 'utf-8');
  return parseFrontmatter(rawContent);
}

// Main function - just get basic article list
export function getList(): ArticlePost[] {
  if (articlesCache !== null) {
    return articlesCache;
  }

  const contentDir = path.join(process.cwd(), 'content');
  const categories = ['application', 'material'];
  const articles: ArticlePost[] = [];
  
  for (const category of categories) {
    const categoryDir = path.join(contentDir, category);
    try {
      if (fs.existsSync(categoryDir)) {
        const files = getMDXFiles(categoryDir);
        files.forEach(file => {
          const filePath = path.join(categoryDir, file);
          const { metadata, content } = readMDXFile(filePath);
          const slug = path.basename(filePath, path.extname(filePath));
          
          articles.push({
            metadata: {
              ...metadata,
              articleType: category,
            },
            slug,
            content,
          });
        });
      }
    } catch (error) {
      console.error(`Error reading category ${category}:`, error);
    }
  }
  
  articlesCache = articles;
  return articles;
}

// Basic utilities for cards/lists
export function getArticleBySlug(slug: string): ArticlePost | undefined {
  const articles = getList();
  return articles.find(article => article.slug === slug);
}

export function getArticlesByCategory(category: string): ArticlePost[] {
  const articles = getList();
  return articles.filter(article => 
    article.metadata.articleType === category
  );
}

export function getAllArticleSlugs(): string[] {
  const articles = getList();
  return articles.map(article => article.slug);
}

export function clearContentCache(): void {
  articlesCache = null;
}
