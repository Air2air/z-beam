// app/components/CardGrid/index.ts
// Consolidated article grid system - all variants use the same core components

// Core components - use these for all article grid needs
export { CardGrid } from './CardGrid';
export { CardGridSSR } from './CardGridSSR';

// Backward compatibility exports - all point to core components
export { CardGrid as UnifiedCardGrid } from './CardGrid';
export { CardGridSSR as UnifiedCardGridSSR } from './CardGridSSR';
export { CardGrid as CategoryGroupedGrid } from './CardGrid';
export { CardGridSSR as CategoryGroupedGridSSR } from './CardGridSSR';
export { CardGrid as SearchResultsGrid } from './CardGrid';
export { CardGrid as List } from './CardGrid';
export { CardGridSSR as ListSSR } from './CardGridSSR';

// Legacy component exports - deprecated, use CardGrid instead
export { CardGrid as ListSimplified } from './CardGrid';
