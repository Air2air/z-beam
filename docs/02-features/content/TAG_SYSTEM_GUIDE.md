# Z-Beam Tag System Guide

## Current System Architecture

The Z-Beam tag system has been refactored and consolidated for better performance and maintainability. The system now uses React's cache functionality for improved performance and has a cleaner, more consistent API.

### Core Components

1. **`tags.ts`** - The main tag system file that contains all tag-related functionality:
   - Tag parsing and extraction from content files
   - Article-tag matching logic
   - Tag counting and popularity metrics
   - Cached access to tag data
   - Filtering functionality for tag-based queries

2. **`tagIntegration.ts`** - A compatibility layer that re-exports everything from `tags.ts` to maintain backward compatibility.

3. **`tagManager.ts`** - A client-side utility for managing tags in the browser:
   - Tag normalization
   - Tag set operations (add, remove, check)
   - Case sensitivity options
   - Duplicate handling

## Usage Guidelines

### Server-Side Tag Operations

For server components and server actions, import tag utilities from `tags.ts`:

```typescript
// Server component
import { 
  getAllTags, 
  getTagCounts, 
  filterArticlesByTag,
  getPopularTags
} from '@/app/utils/tags';

// Use in a React Server Component
export default async function TagList() {
  const allTags = await getAllTags();
  const tagCounts = await getTagCounts();
  
  return (
    <ul>
      {allTags.map(tag => (
        <li key={tag}>
          {tag} ({tagCounts[tag] || 0})
        </li>
      ))}
    </ul>
  );
}
```

### Client-Side Tag Management

For client components that need to manage tag state:

```typescript
// Client component
'use client';

import { useState } from 'react';
import { createTagManager } from '@/app/utils/tagManager';

export default function TagSelector({ initialTags = [] }) {
  const [tagManager] = useState(() => createTagManager(initialTags));
  const [newTag, setNewTag] = useState('');
  
  const addTag = () => {
    if (newTag) {
      tagManager.addTag(newTag);
      setNewTag('');
    }
  };
  
  return (
    <div>
      <input
        type="text"
        value={newTag}
        onChange={(e) => setNewTag(e.target.value)}
        placeholder="Add a tag"
      />
      <button onClick={addTag}>Add</button>
      
      <div className="tag-list">
        {tagManager.getTags().map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
    </div>
  );
}
```

## Migration Path

If you're still using the old tag utilities, here's how to migrate:

### Old Code:

```typescript
import { getAllTags } from '../utils/tagUtils';
import { filterArticlesByTag } from '../utils/articleTagsUtils';
```

### New Code:

```typescript
// Direct import from the main tag system
import { getAllTags, filterArticlesByTag } from '../utils/tags';

// OR, for backward compatibility
import { getAllTags, filterArticlesByTag } from '../utils/tagIntegration';
```

## Performance Considerations

The tag system uses React's cache functionality to improve performance. This means:

1. Multiple calls to functions like `getAllTags()` within the same render cycle will only execute once
2. Tag data is cached for a period of time (default: 15 minutes)
3. To force a refresh of the cache, call `invalidateTagCache()`

## Future Development

The tag system is designed to be extensible. If you need to add new tag-related functionality:

1. Add new functions to `tags.ts`
2. Re-export them from `tagIntegration.ts` for backward compatibility
3. Update this documentation to reflect the new capabilities
