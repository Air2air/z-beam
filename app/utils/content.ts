// app/utils/content.ts
// Unified content management system for articles, authors, and tags

import fs from 'fs';
import path from 'path';
import { parseFrontmatter, extractFirstImage } from './metadata';
import type { ArticlePost, ArticleMetadata, AuthorPost, AuthorMetadata, ContentType, FilterCriteria } from 'app/types/content';

// Cache for content
let articlesCache: ArticlePost[] | null = null;
let authorsCache: AuthorMetadata[] | null = null;
let tagsCache: string[] | null = null;

// Clear cache on module reload in development
if (process.env.NODE_ENV === 'development') {
  articlesCache = null;
  authorsCache = null;
  tagsCache = null;
}

// -------- ARTICLE UTILITIES --------

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

export function getMDXFilesRecursive(baseDir: string): Array<{filePath: string, category: 'application' | 'author' | 'material' | 'region' | 'thesaurus'}> {
  const results: Array<{filePath: string, category: 'application' | 'author' | 'material' | 'region' | 'thesaurus'}> = [];
  const categories: Array<'application' | 'author' | 'material' | 'region' | 'thesaurus'> = ['application', 'author', 'material', 'region', 'thesaurus'];
  
  for (const category of categories) {
    const categoryDir = path.join(baseDir, category);
    try {
      if (fs.existsSync(categoryDir)) {
        const files = getMDXFiles(categoryDir);
        files.forEach(file => {
          results.push({
            filePath: path.join(categoryDir, file),
            category
          });
        });
      }
    } catch (error) {
      console.error(`Error reading MDX files from category ${category}:`, error);
    }
  }
  
  return results;
}

export function readMDXFile(filePath: string) {
  let rawContent = fs.readFileSync(filePath, 'utf-8');
  return parseFrontmatter(rawContent);
}

export function getArticleList(): ArticlePost[] {
  if (articlesCache !== null) {
    return articlesCache;
  }

  const contentDir = path.join(process.cwd(), 'content');
  const mdxFileData = getMDXFilesRecursive(contentDir);
  
  const articles = mdxFileData.map(({filePath, category}) => {
    const { metadata, content } = readMDXFile(filePath);
    const slug = path.basename(filePath, path.extname(filePath));
    
    // Process images and thumbnails
    const rawImagePath = metadata.image || extractFirstImage(content);
    const thumbnail = rawImagePath;
    
    // Use the directory-based category as the contentCategory (override metadata if needed)
    const contentCategory = category;
    
    return {
      metadata: {
        ...metadata,
        contentCategory,
        thumbnail,
      },
      slug,
      content,
    };
  });
  
  articlesCache = articles;
  return articles;
}

export function getArticleBySlug(slug: string): ArticlePost | undefined {
  const articles = getArticleList();
  return articles.find(article => article.slug === slug);
}

export function getAllArticleSlugs(): string[] {
  const articles = getArticleList();
  return articles.map(article => article.slug);
}

// -------- AUTHOR UTILITIES --------

export function getAllAuthors(): AuthorMetadata[] {
  if (authorsCache !== null) {
    return authorsCache;
  }

  try {
    const authorsPath = path.join(process.cwd(), 'app', 'data', 'authors.json');
    const authorsData = JSON.parse(fs.readFileSync(authorsPath, 'utf-8'));
    const authors = authorsData.authors || [];
    authorsCache = authors;
    return authors;
  } catch (error) {
    console.error('Error loading authors data:', error);
    authorsCache = [];
    return [];
  }
}

export function getAuthorById(id: number): AuthorMetadata | null {
  const authors = getAllAuthors();
  return authors.find(author => author.id === id) || null;
}

export function getAuthorBySlug(slug: string): AuthorMetadata | undefined {
  const authors = getAllAuthors();
  return authors.find(author => author.slug === slug);
}

export function getAllAuthorSlugs(): string[] {
  const authors = getAllAuthors();
  return authors.map(author => author.slug);
}

export function getArticlesByAuthorId(authorId: number): ArticlePost[] {
  const articles = getArticleList();
  return articles.filter(article => article.metadata.authorId === authorId);
}

// -------- TAG UTILITIES --------

export function getAllTags(): string[] {
  if (tagsCache !== null) {
    return tagsCache;
  }

  try {
    const articles = getArticleList();
    const tagSet = new Set<string>();
    
    articles.forEach(article => {
      if (article.metadata.tags && Array.isArray(article.metadata.tags)) {
        article.metadata.tags.forEach(tag => {
          if (tag && typeof tag === 'string') {
            tagSet.add(tag);
          }
        });
      }
    });
    
    const tags = Array.from(tagSet).sort();
    tagsCache = tags;
    return tags;
  } catch (error) {
    console.error('Error loading tags:', error);
    return [];
  }
}

export function getTagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getTagFromSlug(slug: string): string | undefined {
  const tags = getAllTags();
  return tags.find(tag => getTagSlug(tag) === slug);
}

export function getAllTagSlugs(): string[] {
  const tags = getAllTags();
  return tags.map(tag => getTagSlug(tag));
}

export function getArticlesByTag(tag: string): ArticlePost[] {
  const articles = getArticleList();
  return articles.filter(article => 
    article.metadata.tags && 
    article.metadata.tags.includes(tag)
  );
}

export function getTagStats(): Array<{ tag: string; slug: string; count: number }> {
  const tags = getAllTags();
  const articles = getArticleList();
  
  return tags.map(tag => ({
    tag,
    slug: getTagSlug(tag),
    count: articles.filter(article => 
      article.metadata.tags && 
      article.metadata.tags.includes(tag)
    ).length
  })).filter(tagStat => tagStat.count > 0)
    .sort((a, b) => b.count - a.count); // Sort by count, descending
}

// -------- CONTENT CATEGORY UTILITIES --------

export function getArticlesByCategory(category: string): ArticlePost[] {
  const articles = getArticleList();
  return articles.filter(article => 
    article.metadata.contentCategory === category
  );
}

export function getAllContentCategories(): string[] {
  const articles = getArticleList();
  const categorySet = new Set<string>();
  
  articles.forEach(article => {
    if (article.metadata.contentCategory) {
      categorySet.add(article.metadata.contentCategory);
    }
  });
  
  return Array.from(categorySet).sort();
}

// -------- UNIFIED FILTERING --------

export function filterContent(criteria: FilterCriteria): ArticlePost[] {
  const { type, value } = criteria;
  const articles = getArticleList();

  switch (type) {
    case 'author':
      return typeof value === 'number'
        ? getArticlesByAuthorId(value)
        : getArticlesByAuthorId(parseInt(String(value), 10));
    case 'tag':
      return getArticlesByTag(String(value));
    case 'article':
      const article = getArticleBySlug(String(value));
      return article ? [article] : [];
    case 'category':
      return getArticlesByCategory(String(value));
    default:
      return articles;
  }
}

// -------- CACHE MANAGEMENT --------

export function clearContentCache(): void {
  articlesCache = null;
  authorsCache = null;
  tagsCache = null;
}
