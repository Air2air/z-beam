// app/components/ArticleGrid/index.ts
// Single unified article grid system

// Main components - use these for all article grid needs
export { ArticleGrid } from './ArticleGrid';
export { ArticleGridSSR } from './ArticleGridSSR';

// Backward compatibility exports - all point to unified components
export { ArticleGrid as UnifiedArticleGrid } from './ArticleGrid';
export { ArticleGridSSR as UnifiedArticleGridSSR } from './ArticleGridSSR';
export { ArticleGrid as CategoryGroupedGrid } from './ArticleGrid';
export { ArticleGridSSR as CategoryGroupedGridSSR } from './ArticleGridSSR';
export { ArticleGridSSR as List } from './ArticleGridSSR';
export { ArticleGrid as SearchResultsGrid } from './ArticleGrid';
