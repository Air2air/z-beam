# Frontend Migration to v6.0.0 Schema - Required Code Changes

**Date**: February 2, 2026  
**Status**: Planning Phase  
**Test Result**: ❌ Single file test failed - frontend needs updates

**Current Production**: Frontmatter exports are still v5.0.0. Treat this document as a migration plan only and do not hand-edit frontmatter; update the generator and re-export when v6 is ready.

---

## Test Results Summary

### What Was Tested
- Migrated `carbon-buildup-contamination.yaml` from v5.0.0 (780 lines) → v6.0.0 (273 lines)
- Attempted to load page at `/contaminants/laser-contaminants/carbon-buildup-contamination`
- Result: Page returned "Subcategory Not Found" error

### Root Cause
The frontend code is still expecting v5.0.0 structure with fields like:
- `displayName` (removed - use `name`)
- `pageTitle` (removed - use `name`)
- `pageDescription` (removed - use `description`)
- `metaDescription` (removed - generate from `meta.description`)
- `fullPath` (removed - generate from `meta.path`)
- `breadcrumb` array (removed - generate from `category` + `subcategory`)
- `images.hero.url` (changed to `images.hero` filename only)
- `author` full object (changed to `authorId` reference)

---

## Required Code Updates

### 1. Frontmatter Loader Functions

**Files to Update:**
- `lib/loaders/frontmatterLoader.ts` (or similar)
- `lib/utils/frontmatter.ts`

**Changes Required:**

```typescript
// OLD v5.0.0 structure
interface FrontmatterV5 {
  id: string;
  name: string;
  displayName: string;  // ❌ Remove
  pageTitle: string;     // ❌ Remove
  pageDescription: string;  // ❌ Remove
  metaDescription: string;  // ❌ Remove
  fullPath: string;      // ❌ Remove
  breadcrumb: Array<{label: string, href: string}>;  // ❌ Remove
  images: {
    hero: {url: string, alt: string, width: number, height: number};
    micro: {url: string, alt: string, width: number, height: number};
  };
  author: {
    id: number;
    name: string;
    country: string;
    // ... 20+ fields
  };
}

// NEW v6.0.0 structure
interface FrontmatterV6 {
  // Section 1: Core Identity
  id: string;
  contentType: 'material' | 'contaminant' | 'compound' | 'setting';
  schemaVersion: '6.0.0';
  
  // Section 2: Basic Info
  name: string;
  category: string;
  subcategory?: string;
  datePublished: string;
  dateModified: string;
  
  // Section 3: Content
  description: string;
  
  // Section 4: SEO
  meta: {
    title: string;
    description: string;
    path: string;
  };
  
  // Section 5: Images
  images: {
    hero: string;  // Just filename
    micro: string; // Just filename
  };
  
  // Section 6: Author
  authorId: number;  // Reference only
  
  // Section 7: Domain-Specific
  properties?: { ... };
  composition?: string[];
  laser?: { ... };
  safety?: { ... };
  appearance?: { ... };
  
  // Section 8: Relationships
  relationships?: { ... };
}

// Migration helper function
function migrateFromV5ToV6(doc: FrontmatterV5 | FrontmatterV6): FrontmatterV6 {
  if (doc.schemaVersion === '6.0.0') {
    return doc as FrontmatterV6;
  }
  
  // For v5.0.0 documents, map old fields to new structure
  const v5 = doc as FrontmatterV5;
  return {
    id: v5.id,
    contentType: v5.contentType,
    schemaVersion: '6.0.0',
    name: v5.name,
    category: v5.category,
    subcategory: extractSubcategoryFromPath(v5.fullPath),
    datePublished: v5.datePublished,
    dateModified: v5.dateModified,
    description: v5.pageDescription || v5.description,
    meta: {
      title: v5.pageTitle || v5.name,
      description: v5.metaDescription || v5.pageDescription,
      path: v5.fullPath
    },
    images: {
      hero: extractFilename(v5.images.hero.url),
      micro: extractFilename(v5.images.micro.url)
    },
    authorId: v5.author.id,
    // ... map other fields
  };
}
```

### 2. Image Path Generation

**Files to Update:**
- `lib/utils/images.ts`
- `components/Image/OptimizedImage.tsx`

**Changes Required:**

```typescript
// OLD - Direct URL usage
const imageUrl = frontmatter.images.hero.url;

// NEW - Generate full path from filename + domain
function getImageUrl(filename: string, domain: string): string {
  return `/images/${domain}/${filename}`;
}

// Usage
const heroUrl = getImageUrl(frontmatter.images.hero, frontmatter.contentType);
// Result: /images/contaminant/carbon-buildup-contamination-hero.jpg
```

### 3. Author Data Expansion

**Files to Update:**
- `lib/data/authors.ts` (create if doesn't exist)
- `lib/loaders/authorLoader.ts`

**Changes Required:**

```typescript
// Create author registry
const AUTHORS = {
  1: {
    id: 1,
    name: "Todd Dunning",
    country: "United States",
    countryDisplay: "United States",
    title: "B.Eng.",
    sex: "m",
    jobTitle: "Laser Systems Specialist",
    // ... full author data
  },
  2: {
    id: 2,
    name: "Alessandro Moretti",
    country: "Italy",
    // ... full author data
  },
  3: { ... },
  4: { ... }
};

// Expand author reference
function getAuthor(authorId: number) {
  return AUTHORS[authorId];
}

// Usage in component
const author = getAuthor(frontmatter.authorId);
```

### 4. Breadcrumb Generation

**Files to Update:**
- `components/Breadcrumb/Breadcrumb.tsx`
- `lib/utils/navigation.ts`

**Changes Required:**

```typescript
// OLD - Direct array usage
const breadcrumbs = frontmatter.breadcrumb;

// NEW - Generate from category/subcategory
function generateBreadcrumbs(doc: FrontmatterV6): Breadcrumb[] {
  const crumbs: Breadcrumb[] = [
    { label: "Home", href: "/" }
  ];
  
  // Add domain
  const domainLabel = doc.contentType + 's';  // "contaminants"
  crumbs.push({
    label: titleCase(domainLabel),
    href: `/${domainLabel}`
  });
  
  // Add category
  if (doc.category) {
    crumbs.push({
      label: titleCase(doc.category.replace(/-/g, ' ')),
      href: `/${domainLabel}/${doc.category}`
    });
  }
  
  // Add subcategory
  if (doc.subcategory) {
    crumbs.push({
      label: titleCase(doc.subcategory.replace(/-/g, ' ')),
      href: `/${domainLabel}/${doc.category}/${doc.subcategory}`
    });
  }
  
  return crumbs;
}
```

### 5. SEO Metadata Generation

**Files to Update:**
- `app/[domain]/[category]/[subcategory]/page.tsx`
- `lib/utils/seo.ts`

**Changes Required:**

```typescript
// OLD - Direct field usage
export function generateMetadata({ params }) {
  return {
    title: frontmatter.pageTitle,
    description: frontmatter.metaDescription,
    // ...
  };
}

// NEW - Use meta section
export function generateMetadata({ params }) {
  const doc = loadFrontmatter(params.id);
  return {
    title: doc.meta.title,
    description: doc.meta.description,
    openGraph: {
      title: doc.meta.title,
      description: doc.meta.description,
      url: `https://z-beam.com${doc.meta.path}`,
      images: [
        {
          url: getImageUrl(doc.images.hero, doc.contentType),
          width: 1200,
          height: 630,
          alt: `${doc.name} hero image`
        }
      ]
    }
  };
}
```

### 6. Relationship ID Expansion

**Files to Update:**
- `lib/loaders/relationshipLoader.ts`

**Changes Required:**

```typescript
// OLD - Full object with all data
const relatedMaterials = frontmatter.relationships.interactions.affectsMaterials;

// NEW - ID references that need expansion
interface RelationshipV6 {
  materials?: {
    common?: string[];        // IDs only
    specialized?: string[];   // IDs only
  };
  contaminants?: {
    produces?: string[];      // IDs only
    removes?: string[];       // IDs only
  };
  // ...
}

// Expansion function
async function expandRelationships(doc: FrontmatterV6) {
  const expanded = { ...doc };
  
  if (doc.relationships?.materials?.common) {
    expanded.relationships.materials.common = await Promise.all(
      doc.relationships.materials.common.map(id => loadMaterial(id))
    );
  }
  
  // ... expand other relationships
  
  return expanded;
}
```

---

## Migration Strategy

### Phase 1: Add Backward Compatibility Layer (RECOMMENDED)

**Goal**: Support both v5.0.0 and v6.0.0 simultaneously

**Approach**:
1. Create detection function to identify schema version
2. Add migration helpers to convert v5 → v6 on-the-fly
3. Update all loader functions to use migrated data
4. Test with mix of v5 and v6 files

**Benefits**:
- ✅ No downtime
- ✅ Gradual migration possible
- ✅ Easy rollback if issues found
- ✅ Test v6 with single files

**Code Example**:
```typescript
function loadFrontmatter(id: string) {
  const raw = readYamlFile(`${id}.yaml`);
  
  // Detect version and migrate if needed
  if (raw.schemaVersion === '5.0.0' || !raw.schemaVersion) {
    return migrateFromV5ToV6(raw);
  }
  
  return raw;  // Already v6.0.0
}
```

### Phase 2: Execute Full Migration

**Once backward compatibility is working**:
1. Run migration script on ALL domains
2. Verify all pages load correctly
3. Check structured data / SEO metadata
4. Remove backward compatibility code

---

## Testing Checklist

Before deploying v6.0.0 to production:

### Functional Testing
- [ ] All pages load without errors
- [ ] Images display correctly
- [ ] Author information shows properly
- [ ] Breadcrumbs generate correctly
- [ ] SEO metadata is complete

### Cross-Domain Testing
- [ ] Materials domain (153 files)
- [ ] Contaminants domain (98 files)
- [ ] Compounds domain (34 files)
- [ ] Settings domain (153 files)

### SEO Verification
- [ ] Meta titles present
- [ ] Meta descriptions present
- [ ] Canonical URLs correct
- [ ] OpenGraph metadata complete
- [ ] Structured data JSON-LD valid

### Performance Testing
- [ ] Page load times (should improve with smaller files)
- [ ] Build times (should improve significantly)

---

## Estimated Implementation Time

| Phase | Task | Time |
|-------|------|------|
| 1 | Add v5→v6 migration helpers | 2 hours |
| 2 | Update image path functions | 30 min |
| 3 | Create author registry | 30 min |
| 4 | Update breadcrumb generation | 1 hour |
| 5 | Update SEO metadata | 1 hour |
| 6 | Test single file | 30 min |
| 7 | Test all domains | 1 hour |
| 8 | Execute migration | 10 min |
| 9 | Verify production | 1 hour |
| **TOTAL** | | **7.5 hours** |

---

## Files to Create/Update

### New Files
- `/lib/data/authors.ts` - Author registry
- `/lib/utils/schemaVersion.ts` - Version detection and migration
- `/docs/SCHEMA_V6_MIGRATION_GUIDE.md` - Developer guide

### Update Existing
- `/lib/loaders/frontmatterLoader.ts` - Add v5→v6 migration
- `/lib/utils/images.ts` - Generate full paths from filenames
- `/components/Breadcrumb/Breadcrumb.tsx` - Generate from category/subcategory
- All page components that read frontmatter

---

## Next Steps

1. ✅ **Create backward compatibility layer** (7.5 hour estimate)
   - Add v5→v6 migration helpers
   - Update all loader functions
   - Create author registry
   - Update image/breadcrumb/SEO utilities

2. **Test with single file**
   - Migrate carbon-buildup-contamination.yaml
   - Verify page loads correctly
   - Check all sections render properly

3. **Execute full migration**
   - Run migration script on all domains
   - Deploy to production
   - Monitor for issues

---

## Key Takeaway

**The v6.0.0 schema is sound and achieves 80% file size reduction. The frontend code needs updating to support the reference-based architecture instead of expecting full denormalized data.**

Once the backward compatibility layer is in place, migration can proceed smoothly with zero downtime.
