# Tag System Architecture

## Overview

The tag system is designed to manage article tags throughout the application. It provides functions to retrieve, filter, and organize content by tags.

## Core Files

- **`app/utils/tags.ts`**: The main implementation with all core functionality
- **`app/utils/tagIntegration.ts`**: Compatibility layer that re-exports all tag functions and provides deprecated versions

## Deprecated Files (Safe to Remove)

- **`app/utils/articleTagsUtils.ts`**: Legacy compatibility layer that just re-exports from tags.ts
- **`app/utils/tagUtils.ts`**: Legacy compatibility layer that just re-exports from tags.ts

## Migration Guide

### For New Code

Always import directly from the main tag system:

```typescript
import { 
  getAllTags, 
  getTagsWithCounts, 
  filterArticlesByTag 
} from '../utils/tags';
```

### For Transitional Code

You can import from the compatibility layer:

```typescript
import { 
  getAllTags, 
  getTagsWithCounts, 
  filterArticlesByTag 
} from '../utils/tagIntegration';
```

### Key Functions Available

- `getAllTags()`: Get all unique tags across all articles
- `getTagsWithCounts()`: Get all tags with their article counts
- `filterArticlesByTag(articles, tag)`: Filter articles by a specific tag
- `getEnrichedArticles()`: Get all articles with their tags attached
- `getPopularTags(limit)`: Get the most popular tags by article count

## Technical Implementation

- Uses React cache for performance optimization
- Implements lazy loading and caching with 15-minute expiration
- Provides case-insensitive tag matching
- Supports compound tag matching

## Recent Simplification (August 2025)

The tag system has been simplified to reduce bloat and overlap:

1. Consolidated import path to just `tags.ts`
2. Unified compatibility layer in `tagIntegration.ts`
3. Identified deprecated files safe for removal
4. Updated imports across the codebase to use the main implementation
