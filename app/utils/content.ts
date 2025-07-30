// app/utils/content.ts - Simplified version
// Unified content management system for articles, authors, and tags

import fs from 'fs';
import path from 'path';
import { parseFrontmatter } from './metadata';

export interface ArticleMetadata {
  title: string;
  description?: string;
  articleType?: string;
  category?: string;
  date?: string;
  [key: string]: any;
}

export interface ArticlePost {
  metadata: ArticleMetadata;
  slug: string;
  content: string;
}

// Simple cache
let articlesCache: ArticlePost[] | null = null;

export function getMDXFiles(dir: string): string[] {
  try {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter((file) => 
      file.endsWith('.mdx') || file.endsWith('.md')
    );
  } catch (error) {
    console.error(`Error reading MDX files from ${dir}:`, error);
    return [];
  }
}

export function readMDXFile(filePath: string) {
  const rawContent = fs.readFileSync(filePath, 'utf-8');
  return parseFrontmatter(rawContent);
}

export function getArticleBySlug(slug: string): ArticlePost | undefined {
  // This is now mainly for legacy support
  const articles = getList();
  return articles.find(article => article.slug === slug);
}

// Main function - just get basic article list
export function getList(): ArticlePost[] {
  // Legacy function - keep for backwards compatibility
  return [];
}

export function getArticlesByCategory(category: string): ArticlePost[] {
  // Legacy function - keep for backwards compatibility  
  return [];
}

export function getAllArticleSlugs(): string[] {
  // Delegate to the component-based system
  try {
    const frontmatterDir = path.join(process.cwd(), 'content', 'components', 'frontmatter');
    if (!fs.existsSync(frontmatterDir)) return [];
    
    return fs.readdirSync(frontmatterDir)
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace('.md', ''));
  } catch (error) {
    console.error('Error getting article slugs:', error);
    return [];
  }
}

export function clearContentCache(): void {
  articlesCache = null;
}
