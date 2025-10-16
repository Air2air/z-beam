# Enhanced Metadata System with E-E-A-T Optimization

## Overview

The metadata system has been enhanced to provide comprehensive E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) optimization across all meta tags, including OpenGraph, Twitter Cards, and JSON-LD.

**Key Features:**
- ✅ **Automatic hero image extraction** from `images.hero` frontmatter
- ✅ **Twitter Card support** (summary_large_image)
- ✅ **Enhanced OpenGraph** with article-specific properties
- ✅ **E-E-A-T signals** in meta tags
- ✅ **Author expertise** metadata
- ✅ **Publication/modification dates** for trustworthiness
- ✅ **Consistent image usage** across OG, Twitter, and JSON-LD

---

## Architecture

### Image Priority Flow

```
1. images.hero.url (frontmatter) → Primary source
2. image field (legacy) → Fallback
3. No image → Meta tags without images
```

### Metadata Structure

```typescript
{
  title: "Material Name | Z-Beam",
  description: "Subtitle + Description",
  keywords: ["tag1", "tag2", "tag3"],
  
  openGraph: {
    title: "Material Name",
    description: "Full description",
    type: "article",
    url: "https://z-beam.com/material-name",
    siteName: "Z-Beam",
    locale: "en_US",
    images: [{
      url: "https://z-beam.com/images/material/hero.jpg",
      alt: "Descriptive alt text",
      width: 1200,
      height: 630,
      type: "image/jpeg"
    }],
    article: {
      publishedTime: "2024-01-15T10:00:00Z",
      modifiedTime: "2024-06-20T14:30:00Z",
      authors: ["Dr. Emily Chen"],
      section: "conservation",
      tags: ["limestone", "conservation", "laser"]
    }
  },
  
  twitter: {
    card: "summary_large_image",
    title: "Material Name",
    description: "Full description",
    images: ["https://z-beam.com/images/material/hero.jpg"],
    creator: "@AuthorName"
  },
  
  other: {
    // E-E-A-T: Expertise
    "author": "Dr. Emily Chen",
    "author-title": "Ph.D.",
    "author-expertise": "Materials Science",
    
    // E-E-A-T: Trustworthiness
    "article:published_time": "2024-01-15T10:00:00Z",
    "article:modified_time": "2024-06-20T14:30:00Z",
    
    // E-E-A-T: Authoritativeness
    "article:section": "conservation",
    "material-name": "Limestone"
  }
}
```

---

## Hero Image Integration

### Frontmatter Structure

All material pages should have hero images defined:

```yaml
images:
  hero:
    url: /images/material/alabaster-laser-cleaning-hero.jpg
    alt: "Alabaster surface undergoing laser cleaning showing precise contamination removal"
    width: 1200
    height: 630
```

### Automatic Extraction

The metadata system automatically:

1. **Extracts** `images.hero.url` and `images.hero.alt`
2. **Constructs full URLs** for external sharing
3. **Falls back** to legacy `image` field if hero missing
4. **Generates default alt text** from title if alt missing

### Image Requirements

- **Format:** JPG or PNG
- **Dimensions:** 1200×630px (optimal for OG/Twitter)
- **Size:** < 1MB
- **Alt Text:** Descriptive, includes material name and process
- **Location:** `/public/images/material/`

### Example Usage

```typescript
// In [slug]/page.tsx
export async function generateMetadata({ params }) {
  const article = await getArticle(params.slug);
  
  // Hero image automatically extracted
  return createMetadata(article.metadata);
}
```

---

## E-E-A-T Optimization

### Why E-E-A-T in Meta Tags?

While JSON-LD provides structured data for search engines, meta tags serve multiple purposes:

1. **Social sharing** (OpenGraph, Twitter Cards)
2. **Search snippets** (meta description)
3. **Browser display** (title tags)
4. **Additional signals** for search engines

### E-E-A-T Signals Implemented

#### 1. Experience & Expertise

```html
<meta name="author" content="Dr. Emily Chen">
<meta name="author-title" content="Ph.D.">
<meta name="author-expertise" content="Materials Science and Engineering">
```

**Benefits:**
- Shows author credentials in meta tags
- Complements JSON-LD Person schema
- Provides fallback if JSON-LD fails

#### 2. Authoritativeness

```html
<meta name="article:section" content="conservation">
<meta name="material-name" content="Limestone">
<meta property="og:type" content="article">
```

**Benefits:**
- Establishes content category
- Shows topical authority
- Helps with content classification

#### 3. Trustworthiness

```html
<meta name="article:published_time" content="2024-01-15T10:00:00Z">
<meta name="article:modified_time" content="2024-06-20T14:30:00Z">
<meta property="og:article:published_time" content="2024-01-15T10:00:00Z">
<meta property="og:article:modified_time" content="2024-06-20T14:30:00Z">
```

**Benefits:**
- Shows content freshness
- Indicates maintenance/updates
- Builds trust through transparency

---

## SEO Best Practices

### Meta Tags vs. JSON-LD

| Feature | Meta Tags | JSON-LD | Both? |
|---------|-----------|---------|-------|
| **Hero Images** | ✅ Required | ✅ Required | ✅ Yes |
| **Author Name** | ✅ Simple | ✅ Structured | ✅ Yes |
| **Dates** | ✅ Simple | ✅ Structured | ✅ Yes |
| **Detailed Credentials** | ❌ No | ✅ Full | JSON-LD only |
| **Confidence Scores** | ❌ No | ✅ Yes | JSON-LD only |
| **Citations** | ❌ No | ✅ Yes | JSON-LD only |

### Why Duplicate Some Data?

1. **Redundancy:** If JSON-LD fails to parse, meta tags provide fallback
2. **Social platforms:** Twitter/Facebook primarily use meta tags
3. **Different purposes:** Meta for display, JSON-LD for understanding
4. **Better coverage:** More signals = more opportunities to rank

### What NOT to Duplicate

Avoid putting these in meta tags (keep in JSON-LD only):
- ❌ Confidence scores (too technical for meta)
- ❌ Full citation lists (too verbose)
- ❌ Detailed test procedures (structured data only)
- ❌ Machine settings (technical data)

---

## Implementation Details

### createMetadata() Function

Located in: `app/utils/metadata.ts`

**Enhanced Features:**

1. **Hero Image Extraction:**
```typescript
// Extract from images.hero
if (images?.hero?.url) {
  heroImageUrl = images.hero.url.startsWith('http') 
    ? images.hero.url 
    : `${SITE_CONFIG.url}${images.hero.url}`;
}
```

2. **Twitter Card Generation:**
```typescript
twitter: {
  card: 'summary_large_image',
  title: actualTitle || formattedTitle,
  description: fullDescription,
  images: heroImageUrl ? [heroImageUrl] : undefined,
  creator: authorName ? `@${authorName.replace(/\s+/g, '')}` : undefined,
}
```

3. **E-E-A-T Meta Tags:**
```typescript
other: {
  ...(authorName ? { 'author': authorName } : {}),
  ...(authorTitle ? { 'author-title': authorTitle } : {}),
  ...(datePublished ? { 'article:published_time': datePublished } : {}),
  // ... more E-E-A-T signals
}
```

### Article Page Integration

Located in: `app/[slug]/page.tsx`

```typescript
export async function generateMetadata({ params }) {
  const article = await getArticle(params.slug);
  
  if (!article) {
    return {
      title: 'Article Not Found | Z-Beam',
    };
  }
  
  // Automatic hero image + E-E-A-T optimization
  return createMetadata(article.metadata);
}
```

---

## Testing

### Test Coverage

See: `tests/unit/metadata.test.ts`

**Test Suites:**
1. ✅ Hero Image Extraction (5 tests)
2. ✅ Twitter Card Generation (2 tests)
3. ✅ Enhanced OpenGraph (4 tests)
4. ✅ E-E-A-T Meta Tags (3 tests)
5. ✅ Subtitle Integration (2 tests)
6. ✅ Backward Compatibility (3 tests)

### Running Tests

```bash
# Run metadata tests only
npm test -- metadata.test.ts

# Run with coverage
npm test -- --coverage metadata.test.ts

# Watch mode
npm test -- --watch metadata.test.ts
```

### Manual Verification

1. **View source** on any material page
2. **Check for:**
   - `<meta property="og:image" content="...hero.jpg">`
   - `<meta name="twitter:card" content="summary_large_image">`
   - `<meta name="author" content="Dr. [Name]">`
   - `<meta name="article:published_time" content="...">`

3. **Test social sharing:**
   - [Facebook Debugger](https://developers.facebook.com/tools/debug/)
   - [Twitter Card Validator](https://cards-dev.twitter.com/validator)
   - [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

---

## Verification Checklist

### For Each Material Page

- [ ] Hero image displays in social previews
- [ ] Alt text is descriptive and material-specific
- [ ] OpenGraph type is "article"
- [ ] Twitter card is "summary_large_image"
- [ ] Author name appears in meta tags
- [ ] Publication date present
- [ ] Category/section defined
- [ ] All images use full URLs (not relative paths)

### For JSON-LD Consistency

- [ ] Same hero image in JSON-LD and OpenGraph
- [ ] Same author in meta tags and JSON-LD Person schema
- [ ] Same dates in meta tags and JSON-LD
- [ ] Image URLs match across all systems

---

## Migration Guide

### From Legacy System

**Old (before enhancement):**
```typescript
{
  title: "Material Name",
  description: "Description",
  image: "/images/legacy.jpg",
  openGraph: {
    title: "Material Name",
    images: [{ url: "/images/legacy.jpg" }]
  }
}
```

**New (enhanced):**
```yaml
# frontmatter.yaml
images:
  hero:
    url: /images/material/material-name-hero.jpg
    alt: "Descriptive alt text"
    width: 1200
    height: 630
```

```typescript
// Automatic extraction
const metadata = createMetadata(article.metadata);
// Now includes: OG, Twitter, E-E-A-T, hero image
```

### Updating Existing Content

1. **Add hero images** to all YAML files (123 materials)
2. **Verify alt text** is descriptive
3. **Run tests** to ensure compatibility
4. **Check social previews** on staging

---

## Troubleshooting

### Hero Image Not Appearing

**Symptom:** Meta tags don't include hero image

**Solutions:**
1. Check frontmatter has `images.hero.url`
2. Verify image file exists in `/public/images/material/`
3. Ensure image path is correct (starts with `/`)
4. Check browser console for 404 errors

### Twitter Card Not Validating

**Symptom:** Twitter Card Validator shows errors

**Solutions:**
1. Ensure hero image is 1200×630px
2. Check image is < 1MB
3. Verify full URL (not relative path)
4. Test with Twitter Card Validator

### Author Not Showing

**Symptom:** No author in meta tags

**Solutions:**
1. Check frontmatter has `author` field
2. Verify author object has `name` property
3. Ensure `getAuthorName()` extracts correctly

---

## Performance Considerations

### Image Optimization

- Use WebP with JPG fallback
- Compress images to < 200KB
- Lazy load hero images below fold
- Use Next.js Image component

### Metadata Size

- Current meta tags: ~2-3KB
- E-E-A-T additions: ~500 bytes
- Total overhead: < 0.1% of page size
- **Impact:** Negligible

---

## Future Enhancements

### Planned Improvements

1. **Dynamic OG image generation** (with material name overlay)
2. **Multiple image sizes** for different platforms
3. **Video meta tags** for video content
4. **Breadcrumb markup** in meta tags
5. **Schema.org WebSite** search action

### Monitoring

- Track social share click-through rates
- Monitor rich snippet appearance in SERP
- Analyze Twitter/Facebook engagement
- A/B test different meta descriptions

---

## Related Documentation

- [JSON-LD Component Usage](./JSONLD_COMPONENT_USAGE.md)
- [JSON-LD Live Analysis](./JSONLD_LIVE_ANALYSIS.md)
- [JSON-LD Implementation Guide](./JSONLD_IMPLEMENTATION_GUIDE.md)
- [E-E-A-T Signals Reference](./EEAT_SIGNALS_REFERENCE.md)
- [Image Optimization Guide](./IMAGE_OPTIMIZATION.md)

---

## Questions?

For implementation questions or enhancement suggestions, see:
- `app/utils/metadata.ts` - Core implementation
- `tests/unit/metadata.test.ts` - Test examples
- `app/[slug]/page.tsx` - Usage in article pages
