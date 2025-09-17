# Author Architecture: Troubleshooting Guide

## 🚨 Common Issues & Solutions

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
ls content/components/author/

# Expected files:
# ikmanda-roswati.yaml
# todd-dunning.yaml
```

**Solution**: Ensure YAML file exists and has correct naming
```yaml
# Correct format in content/components/author/author-name.yaml
id: 1
name: "Author Name"  # Must match frontmatter exactly
title: "Ph.D."
expertise: "Field of expertise"
country: "Country"
sex: "f"  # or "m"
image: "/images/author/author-name.jpg"
profile:
  description: "Description..."
  expertiseAreas: ["Area 1", "Area 2"]
  contactNote: "Contact note..."
```

**B. Frontmatter Mismatch**
```yaml
# In content file frontmatter
author: "Ikmanda Roswati"  # Must match YAML filename exactly
# YAML file should be: ikmanda-roswati.yaml
```

**Solution**: Ensure author name in frontmatter matches YAML filename (kebab-case)

**C. ContentAPI Processing Issues**
```typescript
// Debug in app/utils/contentAPI.ts
console.log('Loading author:', authorSlug);
console.log('Author data:', authorInfo);
```

**Solution**: Check console for author loading errors

### 2. Author Images Not Loading

#### **Problem**: Author avatar shows broken image or doesn't load
**Symptoms**:
- Broken image icon in author component
- 404 errors in browser console for image requests
- Author info appears but no avatar

**Root Causes & Solutions**:

**A. Image File Missing**
```bash
# Check if image exists
ls public/images/author/

# Expected files:
# ikmanda-roswati.jpg
# todd-dunning.jpg
```

**Solution**: Add image file to correct directory

**B. Incorrect Image Path**
```yaml
# Wrong - missing leading slash
image: "images/author/author.jpg"

# Correct - with leading slash
image: "/images/author/author.jpg"
```

**C. Image Format Issues**
```bash
# Supported formats
.jpg, .jpeg, .png, .webp

# Recommended size
120x120 pixels or larger (square format)
```

### 3. TypeScript Compilation Errors

#### **Problem**: Build fails with type errors related to author system
**Symptoms**:
- TypeScript compilation errors
- Build process fails
- IDE shows type errors

**Root Causes & Solutions**:

**A. Missing Type Imports**
```typescript
// Wrong - missing import
const Layout = ({ metadata }) => { ... }

// Correct - with proper imports
import { AuthorInfo, ArticleMetadata } from '@/types/centralized';
interface LayoutProps {
  metadata?: ArticleMetadata;
}
```

**B. Type Mismatch in Components**
```typescript
// Wrong - incorrect prop type
interface AuthorProps {
  author: any;  // ❌ Too generic
}

// Correct - specific type
import { AuthorInfo } from '@/types/centralized';
interface AuthorProps {
  authorInfo: AuthorInfo;  // ✅ Proper typing
}
```

**C. Missing Required Fields**
```yaml
# Incomplete YAML - missing required fields
name: "Author Name"
# Missing: id, title, expertise, country, sex, image, profile

# Complete YAML - all required fields
id: 1
name: "Author Name"
title: "Ph.D."
expertise: "Field"
country: "Country"
sex: "f"
image: "/images/author/author.jpg"
profile:
  description: "..."
  expertiseAreas: []
  contactNote: "..."
```

### 4. Global Rendering Issues

#### **Problem**: Author renders in wrong location or multiple times
**Symptoms**:
- Author appears in unexpected places
- Duplicate author components
- Layout issues with author placement

**Root Causes & Solutions**:

**A. Multiple Rendering Locations**
```typescript
// Wrong - author rendered in multiple places
const PropertiesTable = ({ authorInfo }) => (
  <div>
    <Author authorInfo={authorInfo} />  {/* ❌ Don't render here */}
    {/* Table content */}
  </div>
);

const Layout = ({ metadata }) => (
  <div>
    <Author authorInfo={metadata?.authorInfo} />  {/* ✅ Only render here */}
  </div>
);
```

**B. Conditional Rendering Issues**
```typescript
// Wrong - missing null check
<Author authorInfo={metadata.authorInfo} />  {/* ❌ Can cause errors */}

// Correct - proper conditional rendering
{metadata?.authorInfo && (
  <Author authorInfo={metadata.authorInfo} />  {/* ✅ Safe rendering */}
)}
```

### 5. YAML Parsing Errors

#### **Problem**: YAML files fail to parse correctly
**Symptoms**:
- Author data not loading
- Console errors about YAML parsing
- Undefined author information

**Root Causes & Solutions**:

**A. YAML Syntax Errors**
```yaml
# Wrong - inconsistent indentation
profile:
description: "Text"
  expertiseAreas:
    - "Area 1"

# Correct - consistent indentation
profile:
  description: "Text"
  expertiseAreas:
    - "Area 1"
```

**B. Special Characters**
```yaml
# Wrong - unescaped quotes
description: "Author's expertise"

# Correct - escaped or different quotes
description: "Author's expertise"
# or
description: 'Author\'s expertise'
```

**C. Empty Values**
```yaml
# Wrong - empty required fields
name: ""
title: 

# Correct - all fields populated
name: "Author Name"
title: "Ph.D."
```

### 6. Content Processing Issues

#### **Problem**: Author processing fails in contentAPI
**Symptoms**:
- Authors work in development but fail in production
- Intermittent author loading issues
- Cache-related problems

**Root Causes & Solutions**:

**A. File System Paths**
```typescript
// Check path resolution
console.log('Content dir:', CONTENT_DIRS.components.author);
console.log('Author file path:', componentPath);
```

**B. Cache Issues**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

**C. File Permissions**
```bash
# Check file permissions
ls -la content/components/author/
# Ensure files are readable
```

## 🔧 Debugging Tools

### Console Debugging
```typescript
// Add to Layout.tsx for debugging
console.log('Metadata received:', metadata);
console.log('Author info:', metadata?.authorInfo);
console.log('Author name:', metadata?.authorInfo?.name);
```

### Network Debugging
```bash
# Test page loading
curl -I http://localhost:3001/aluminum-laser-cleaning

# Check for author content
curl -s http://localhost:3001/aluminum-laser-cleaning | grep -i "author"
```

### File System Debugging
```bash
# Validate YAML files
npm run yaml:validate

# Check specific author file
node -e "
const yaml = require('yaml');
const fs = require('fs');
const content = fs.readFileSync('content/components/author/ikmanda-roswati.yaml', 'utf8');
console.log(yaml.parse(content));
"
```

### Type Checking
```bash
# Run TypeScript compiler
npx tsc --noEmit

# Check specific file
npx tsc --noEmit app/components/Layout/Layout.tsx
```

## 🎯 Testing Checklist

### Pre-Production Checklist
- [ ] All author YAML files validate successfully
- [ ] All author images load correctly (no 404s)
- [ ] TypeScript compilation passes
- [ ] Authors appear on aluminum and copper pages
- [ ] No duplicate author rendering
- [ ] Author links work correctly
- [ ] Mobile responsive design works
- [ ] Dark/light theme compatibility

### Performance Checklist
- [ ] Author data caching is working
- [ ] Image optimization is enabled
- [ ] No unnecessary re-renders
- [ ] Build time is reasonable
- [ ] Page load times are acceptable

### Accessibility Checklist
- [ ] Author images have proper alt text
- [ ] Author information is screen reader accessible
- [ ] Keyboard navigation works
- [ ] Color contrast meets standards

## 🚀 Emergency Fixes

### Quick Author Disable
```typescript
// Temporarily disable author rendering in Layout.tsx
{false && metadata?.authorInfo && (  // Add 'false &&' to disable
  <Author authorInfo={metadata.authorInfo} />
)}
```

### Fallback Author Data
```typescript
// Add fallback in contentAPI.ts
if (!authorInfo) {
  console.warn(`Author not found: ${authorSlug}`);
  return null; // Or provide default author
}
```

### Cache Reset
```bash
# Complete cache reset
rm -rf .next node_modules/.cache
npm install
npm run dev
```

---

**Troubleshooting Guide Version**: 1.0  
**Last Updated**: September 16, 2025  
**Status**: Complete
