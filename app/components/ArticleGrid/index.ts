// app/components/ArticleGrid/index.ts
// Export clean client version for client components
export { UnifiedArticleGrid } from './UnifiedArticleGridClient';
export { UnifiedArticleGridSSR } from './UnifiedArticleGridSSR';

// Backward compatibility exports - all consolidated into UnifiedArticleGrid
export { UnifiedArticleGrid as ArticleGrid } from './UnifiedArticleGridClient';
export { UnifiedArticleGrid as ArticleGridClient } from './UnifiedArticleGridClient';
export { UnifiedArticleGrid as List } from './UnifiedArticleGridClient';
export { UnifiedArticleGrid as SearchResultsGrid } from './UnifiedArticleGridClient';
