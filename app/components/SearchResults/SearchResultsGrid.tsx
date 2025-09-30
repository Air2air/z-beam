// app/components/SearchResults/SearchResultsGrid.tsx
// CONSOLIDATED: This now redirects to the unified ArticleGrid

export { ArticleGrid as SearchResultsGrid } from '../ArticleGrid/ArticleGrid';

// Migration guide:
// OLD: <SearchResultsGrid items={items} columns={3} />
// NEW: <ArticleGrid searchResults={items} columns={3} mode="search-results" />
