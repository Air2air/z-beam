import { Article, SearchableArticle } from '@/types';

// Main article enrichment function
export function enrichArticle(article: Article): SearchableArticle {
  return { ...article } as SearchableArticle;
}

// Batch process multiple articles
export function enrichArticles(articles: Article[]): SearchableArticle[] {
  return articles.map(article => enrichArticle(article));
}