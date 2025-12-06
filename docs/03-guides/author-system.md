# Author System Guide

## Overview

The Z-Beam application uses a simplified, centralized author architecture that provides global author rendering across all pages with YAML-based content management and centralized type definitions.

## Architecture Principles

### 🎯 Single Responsibility
- **Layout Component**: Handles global author rendering
- **PropertiesTable Component**: Focuses purely on property data display
- **Author Component**: Renders author information consistently
- **ContentAPI**: Manages YAML author data loading and processing

### 🌐 Global Consistency
- Authors render uniformly in the header section of all pages
- Consistent styling and data structure across the application
- No embedded author logic in property components

### 📏 Simplified Data Flow
```
YAML Files → ContentAPI → Layout → Author Component
```

## Component Architecture

### 1. Layout Component (`app/components/Layout/Layout.tsx`)

**Purpose**: Main layout component with global author rendering

**Key Features**:
- Global author rendering in header section
- Simplified data flow with centralized type imports
- Clean component structure without complex transformations

**Author Rendering Logic**:
```typescript
// Global author rendering in header section
{metadata?.author && (
  <Author author={metadata.author} />
)}
```

### 2. Author Component (`app/components/Author/Author.tsx`)

**Purpose**: Consistent author information rendering

**Key Features**:
- Unified author display across all pages
- Support for both object and string author data
- Configurable display options (avatar, credentials, etc.)

## 🚀 Quick Start

### Adding a New Author
1. **Create YAML file**: `[REMOVED] content/components/author/new-author.yaml`
2. **Add author image**: `public/images/author/new-author.jpg`
3. **Reference in content**: Set `author: "New Author"` in frontmatter

### Basic YAML Template
```yaml
id: 5
name: "New Author"
title: "Ph.D."
expertise: "Laser Processing"
country: "United States"
sex: "f"
image: "/images/author/new-author.jpg"
profile:
  description: "Expert description..."
  expertiseAreas:
    - "Area 1"
    - "Area 2"
  contactNote: "Contact for consultation..."
```

## 🔧 Common Operations

### Check Author Loading
```bash
# Test author YAML processing
npm run yaml:check-file [REMOVED] content/components/author/author-name.yaml

# Validate all author files
npm run yaml:authors
```

### Update Author Information
1. Edit the YAML file in `[REMOVED] content/components/author/`
2. Update the author image if needed
3. Restart dev server to see changes

## 🚨 Troubleshooting

### 1. Author Not Appearing on Pages

#### **Problem**: Author component doesn't show up in page header
**Symptoms**:
- No author information visible on material pages
- Header section only shows title and description
- No author avatar or details displayed

**Root Causes & Solutions**:

**A. YAML File Issues**
```bash
# Check if YAML file exists
ls [REMOVED] content/components/author/

# Expected files:
# ikmanda-roswati.yaml
# todd-dunning.yaml
```

**Solution**: Ensure YAML file exists and has correct naming
```yaml
# Correct format in [REMOVED] content/components/author/author-name.yaml
id: 1
name: "Author Name"  # Must match frontmatter exactly
title: "Ph.D."
expertise: "Field of expertise"
```

**B. Frontmatter Mismatch**
Check that the `author` field in your content frontmatter matches the `name` field in the YAML:

```yaml
# In content/material/aluminum-laser-cleaning.md
---
author: "Ikmanda Roswati"  # Must match YAML name exactly
---

# In [REMOVED] content/components/author/ikmanda-roswati.yaml
name: "Ikmanda Roswati"  # Must match frontmatter exactly
```

**C. Image Path Issues**
```yaml
# Correct image path format
image: "/images/author/author-name.jpg"

# Check file exists:
ls public/images/author/author-name.jpg
```

### 2. TypeScript Errors

#### **Problem**: Type errors related to Author
**Solution**: Import types from centralized location:
```typescript
import { Author } from '@/types';
// NOT from individual component files
```

### 3. Author Data Not Loading

#### **Problem**: Author data is undefined in components
**Debugging Steps**:
```typescript
// Add debug logging in Layout component
console.log('Author data:', metadata?.author);
console.log('Author field:', metadata?.author);
```

**Common Causes**:
- YAML parsing errors
- Missing `author` processing in content API
- Case sensitivity in author names

### 4. Styling Issues

#### **Problem**: Author component styling doesn't match design
**Solution**: Check CSS classes in Author component:
```typescript
// Standard author styling
<div className="author-component mt-2 mb-4">
  {/* Author content */}
</div>
```

## 🔄 Data Flow

### Author Loading Process
1. **YAML Processing**: ContentAPI loads author YAML files
2. **Name Matching**: Matches frontmatter `author` field to YAML `name`
3. **Data Enrichment**: Adds full author object as `author`
4. **Component Rendering**: Layout component renders Author with full data

### Author Data Structure
```typescript
interface Author {
  id: number;
  name: string;
  title?: string;
  expertise?: string;
  country?: string;
  sex?: string;
  image?: string;
  profile?: {
    description?: string;
    expertiseAreas?: string[];
    contactNote?: string;
  };
}
```

## 📁 File Structure

```
[REMOVED] content/components/author/          # Author YAML files
├── ikmanda-roswati.yaml           # Author profiles
└── todd-dunning.yaml              # With structured data

public/images/author/              # Author images
├── ikmanda-roswati.jpg
└── todd-dunning.jpg

app/components/
├── Layout/Layout.tsx              # Global author rendering
└── Author/Author.tsx              # Author display component

types/centralized.ts               # Author type definition
app/utils/contentAPI.ts           # YAML processing
```

## ⚠️ Important Notes

### Author Object Rendering Fix
Recent fix addresses React rendering error when author objects are rendered directly:

```typescript
// Safe author rendering in meta tags
{seoData?.author && (
  <meta itemProp="author" content={
    typeof seoData.author === 'string' 
      ? seoData.author 
      : (seoData.author as any)?.name || 'Unknown Author'
  } />
)}
```

### Backward Compatibility
- Legacy `author_object` fields are supported but deprecated
- String author fields are automatically enriched with YAML data
- Both formats work seamlessly during transition

### Performance Considerations
- Author YAML files are loaded once during build
- Author images should be optimized (< 100KB recommended)
- Use Next.js Image component for automatic optimization

## 🚀 Best Practices

1. **Consistent Naming**: Use kebab-case for YAML filenames matching author names
2. **Image Optimization**: Compress author images for better performance
3. **Data Validation**: Validate YAML structure with npm scripts
4. **Type Safety**: Always use centralized TypeScript types
5. **Error Handling**: Provide fallbacks for missing author data

## 📖 Related Documentation
- [Type System Architecture](../architecture/type-system.md)
- [Content System Guide](../development/content-system.md)
- [Component Guidelines](../development/component-guide.md)