// app/components/SearchResults/SearchResultsGrid.tsx
// CONSOLIDATED: This now redirects to the unified CardGrid

export { CardGrid as SearchResultsGrid } from '../CardGrid/CardGrid';

// Migration guide:
// OLD: <SearchResultsGrid items={items} columns={3} />
// NEW: <CardGrid searchResults={items} columns={3} mode="search-results" />
