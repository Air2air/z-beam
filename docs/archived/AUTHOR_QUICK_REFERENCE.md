# Author Architecture: Quick Reference Guide

## 🚀 Quick Start

### Adding a New Author
1. **Create YAML file**: `content/components/author/new-author.yaml`
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
curl -s "http://localhost:3001/aluminum-laser-cleaning" | grep -A 10 "author-component"
```

### Verify Global Rendering
```typescript
// In Layout.tsx - check this pattern exists
{metadata?.authorInfo && (
  <Author authorInfo={metadata.authorInfo} />
)}
```

### Debug Author Data
```typescript
// Add to Layout.tsx for debugging
console.log('Author metadata:', metadata?.authorInfo);
```

## 🐛 Troubleshooting

### Author Not Appearing
1. **Check YAML syntax**: Validate YAML file format
2. **Verify file path**: Ensure file is in `content/components/author/`
3. **Check frontmatter**: Confirm `author: "Name"` matches YAML filename
4. **Validate image**: Ensure image exists in `public/images/author/`

### Image Not Loading
1. **Check path**: Verify image path in YAML matches actual file
2. **Check format**: Use .jpg, .png, or .webp formats
3. **Check size**: Optimize images for web (recommended: 120x120px)

### Type Errors
1. **Check imports**: Ensure `AuthorInfo` is imported from `types/centralized.ts`
2. **Verify interface**: Match YAML structure to `AuthorInfo` interface
3. **Check required fields**: All fields in `AuthorInfo` are required

## 📊 File Structure Quick View

```
Z-Beam Author System
├── content/components/author/          # Author YAML files
│   ├── ikmanda-roswati.yaml           # ✅ Working
│   └── todd-dunning.yaml              # ✅ Working
├── public/images/author/              # Author images
│   ├── ikmanda-roswati.jpg            # ✅ Working
│   └── todd-dunning.jpg               # ✅ Working
├── types/centralized.ts               # ✅ Type definitions
├── app/utils/contentAPI.ts            # ✅ YAML processing
├── app/components/Layout/Layout.tsx   # ✅ Global rendering
└── app/components/Author/Author.tsx   # ✅ Display component
```

## 🎯 Validation Checklist

### For New Authors
- [ ] YAML file created with correct structure
- [ ] Image file added to public/images/author/
- [ ] YAML passes validation (no syntax errors)
- [ ] All required fields populated
- [ ] Image path in YAML matches actual file
- [ ] Author name matches between YAML and content frontmatter

### For Existing Authors
- [ ] Author appears in header section of pages
- [ ] Image loads correctly
- [ ] All author information displays properly
- [ ] Author link works (goes to tag page)
- [ ] No console errors in browser

## 📈 Performance Notes

- **Author data is cached** via Next.js `cache()` function
- **Images are optimized** automatically by Next.js Image component
- **Global rendering** prevents repeated processing per page
- **YAML files load once** per request cycle

## 🔄 Data Flow Summary

```
Article Request → getArticle() → loadComponent('author') → YAML Parse → AuthorInfo → Layout → Author Component
```

## 📝 Code Snippets

### Check if Author Exists
```typescript
const authorInfo = await loadComponent('author', 'author-slug');
if (authorInfo) {
  // Author found and loaded
}
```

### Custom Author Rendering
```typescript
// In any component
import { AuthorInfo } from '@/types/centralized';
import Author from '@/components/Author/Author';

const MyComponent = ({ authorInfo }: { authorInfo: AuthorInfo }) => (
  <div>
    <Author authorInfo={authorInfo} />
  </div>
);
```

### Testing Author Data
```typescript
// Jest test example
import { loadComponent } from '@/utils/contentAPI';

test('loads author data correctly', async () => {
  const author = await loadComponent('author', 'todd-dunning');
  expect(author.name).toBe('Todd Dunning');
  expect(author.title).toBe('MA');
});
```

---

**Last Updated**: September 16, 2025  
**Quick Reference Version**: 1.0
