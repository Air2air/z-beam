# Z-Beam Content Architecture

This document outlines the content architecture for the Z-Beam website, explaining how articles, authors, and tags are organized.

## Directory Structure

- `/content/` - Root directory for all content, organized by category
  - `/content/application/` - Application-focused articles
  - `/content/author/` - Author profile pages
  - `/content/material/` - Material-specific laser cleaning articles
  - `/content/region/` - Region-specific content
  - `/content/thesaurus/` - Terminology and definitions
- `/app/[slug]/` - Unified dynamic route for all content types
- `/app/authors/[slug]/` - Dedicated author profile pages
- `/app/articles/` - Index page listing all articles
- `/app/authors/` - Index page listing all authors
- `/app/applications/` - Index page listing application articles
- `/app/regions/` - Index page listing region articles
- `/app/thesaurus/` - Index page listing thesaurus entries

## Content Categories

Each MDX file is automatically categorized based on its directory location: Architecture

This document outlines the content architecture for the Z-Beam website, explaining how articles, authors, and tags are organized.

## Directory Structure

- `/content/` - All MDX files are stored here in a flat structure and are read-only (updated externally)
- `/app/(authors)/[slug]/` - Dynamic routes for author pages
- `/app/(tags)/[slug]/` - Dynamic routes for tag pages
- `/app/articles/` - Index page listing all articles
- `/app/authors/` - Index page listing all authors
- `/app/tags/` - Index page for tag browsing

## Content Categories

Each MDX file in `/content/` must include a `contentCategory` field in its frontmatter:

```yaml
---
title: "Article Title"
contentCategory: "material"
# Other frontmatter fields...
---
```

Supported content categories:
- `"material"` - Articles about materials (e.g., aluminum, bronze)
- `"author"` - Author profiles and information
- `"region"` - Region-specific content
- `"application"` - Application-specific content
- `"thesaurus"` - Thesaurus/dictionary entries

## Content System

The content system is based on a modular architecture that allows for flexible filtering and organization of content:

### Key Features

1. **Unified Content API**: 
   - All content is accessible through the central `utils/content.ts` module
   - Common interface for articles, authors, and tags

2. **Type-Safe Architecture**:
   - Strong TypeScript typings for all content objects
   - Clear separation between metadata and content

3. **Performance Optimized**:
   - Content is cached to minimize file system operations
   - Efficient filtering of content by author or tag

## Usage Examples

### Accessing Articles

```typescript
import { getArticleList, getArticleBySlug } from 'app/utils/utils';

// Get all articles
const allArticles = getArticleList();

// Get article by slug
const article = getArticleBySlug('aluminum-laser-cleaning');
```

### Filtering Content

```typescript
import { getArticlesByAuthorId, getArticlesByTag } from 'app/utils/utils';

// Get articles by author ID
const authorArticles = getArticlesByAuthorId(1);

// Get articles by tag
const taggedArticles = getArticlesByTag('Aluminum');
```

### Authors and Tags

```typescript
import { 
  getAllAuthors,
  getAuthorBySlug,
  getAllTags,
  getTagStats
} from 'app/utils/utils';

// Get all authors
const authors = getAllAuthors();

// Get tag statistics (for tag cloud)
const tagStats = getTagStats();
```

## Components

- `ArticleList` - Displays a list of articles with various options
- `AuthorArticles` - Shows articles by a specific author
- `TagDirectory` - Shows all available tags with counts

## Backwards Compatibility

For backwards compatibility with older code:

```typescript
// Legacy imports still work
import { getMaterialList } from 'app/utils/utils';

// These are equivalent
const materials = getMaterialList();
const articles = getArticleList();
```
