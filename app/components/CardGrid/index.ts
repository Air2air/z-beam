// app/components/CardGrid/index.ts
// Consolidated article grid system

// Use client version for all imports - it's now the single source of truth with imageUrl fixes
export { CardGrid } from './CardGrid';
export { CardGrid as CardGridSSR } from './CardGrid.server';

// Backward compatibility exports - all point to client CardGrid (now fixed with imageUrl support)
export { CardGrid as UnifiedCardGrid } from './CardGrid';
export { CardGrid as UnifiedCardGridSSR } from './CardGrid';
export { CardGrid as CategoryGroupedGrid } from './CardGrid';
export { CardGrid as CategoryGroupedGridSSR } from './CardGrid';
export { CardGrid as SearchResultsGrid } from './CardGrid';
export { CardGrid as List } from './CardGrid';
export { CardGrid as ListSSR } from './CardGrid';

// Legacy component exports - deprecated, use CardGrid instead
export { CardGrid as ListSimplified } from './CardGrid';


