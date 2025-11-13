# Person Author Normalization - November 4, 2025

## Overview
Standardized the use of `Person` schema as the `author` property across all rich data schemas throughout the application to improve E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) signals for SEO.

## Changes Made

### 1. Material Pages (via jsonld-helper.ts)
**File**: `app/utils/jsonld-helper.ts`

Added `author` references to schemas that previously didn't have them:

#### Article Schema
- **Already had Person author** ✓
- Line 136: `@type: 'Person'` with full credentials
- Author includes: name, jobTitle, worksFor, knowsAbout, nationality

#### Product Schema
- **Added Person author** ✓
- Line 275: Added `author: { '@id': '${baseUrl}#author-expert' }`
- References the same expert author as other schemas

#### HowTo Schema
- **Added Person author** ✓
- Line 394: Added `author: { '@id': '${baseUrl}#author-expert' }`
- References the expert author for process documentation

#### Dataset Schema
- **Added Person author** ✓
- Line 474: Added `author: { '@id': '${baseUrl}#author-expert' }`
- Added Line 544: `inLanguage: 'en-US'` (was missing)
- References the expert author for data credibility

### 2. Category Pages
**File**: `app/materials/[category]/page.tsx`

Added Person author schema and references:

#### Person Schema Added
- Line 252-266: New Person schema with `@id: #author-technical-team`
- Properties:
  - name: "Z-Beam Technical Team"
  - jobTitle: "Laser Cleaning Specialists"
  - knowsAbout: Dynamic based on category
  - worksFor: Organization reference

#### CollectionPage Schema
- Line 97: Added `author` reference to Person schema

#### Dataset Schema
- Line 166: Added `author` reference to Person schema

#### WebPage Schema
- Line 236: Added `author` reference to Person schema

### 3. Subcategory Pages
**File**: `app/materials/[category]/[subcategory]/page.tsx`

Added Person author schema and references:

#### Person Schema Added
- Line 247-261: New Person schema with `@id: #author-technical-team`
- Properties:
  - name: "Z-Beam Technical Team"
  - jobTitle: "Laser Cleaning Specialists"
  - knowsAbout: Dynamic based on subcategory and category
  - worksFor: Organization reference

#### CollectionPage Schema
- Line 86: Added `author` reference to Person schema
- Line 177: Added `inLanguage: 'en-US'` to Dataset (was missing)

#### Dataset Schema
- Line 159: Added `author` reference to Person schema

#### WebPage Schema
- Line 230: Added `author` reference to Person schema

## Schema.org Compliance

All schemas now properly use `Person` as the author type, which is preferred by Google for E-E-A-T signals:

- **Article**: Person author (expertise)
- **Product**: Person author (product expert)
- **HowTo**: Person author (process expert)
- **Dataset**: Person author (data curator)
- **CollectionPage**: Person author (collection curator)
- **WebPage**: Person author (content creator)

## Benefits

### SEO Improvements
1. **Better E-E-A-T Signals**: Google can now identify human experts behind all content
2. **Author Authority**: Person schemas establish expertise and credentials
3. **Consistent Attribution**: Same author pattern across all page types
4. **Rich Results Eligibility**: Proper Person attribution improves rich snippet chances

### Schema Relationships
- All schemas on material pages reference: `#author-expert`
- All schemas on category/subcategory pages reference: `#author-technical-team`
- Using `@id` references creates semantic relationships within @graph
- Person schema appears once, referenced by multiple entities

## Production Impact

### Pages Affected
- **Material Pages**: 132 pages (all individual materials)
- **Category Pages**: 5 pages (ceramic, metal, glass, polymer, composite)
- **Subcategory Pages**: ~15 pages (oxide, alloy, pure, etc.)
- **Total**: ~152 pages with improved author attribution

### Schema Count per Page Type
- Material pages: 7-8 schemas (Article, Product, HowTo, Dataset, BreadcrumbList, VideoObject, Person, WebPage)
- Category pages: 6 schemas (CollectionPage, BreadcrumbList, ItemList, Dataset, WebPage, Person)
- Subcategory pages: 6 schemas (CollectionPage, BreadcrumbList, ItemList, Dataset, WebPage, Person)

## Next Steps

1. **Build and Deploy**:
   ```bash
   npm run build
   git add .
   git commit -m "feat: normalize Person author across all rich data schemas"
   git push
   ```

2. **Verify in Production**:
   - Use Google Rich Results Test on sample pages
   - Verify Person schemas are discoverable
   - Check that author references resolve correctly

3. **Monitor Impact**:
   - Track rich results appearance in Google Search Console
   - Monitor E-E-A-T signal improvements
   - Check for any schema validation warnings

## Technical Notes

### Author ID Pattern
- Material pages: `#author-${author.id || 'expert'}` (from frontmatter)
- Category/subcategory pages: `#author-technical-team` (default team)

### Person Schema Properties
Material pages (from frontmatter):
- name
- jobTitle
- worksFor (Organization)
- knowsAbout (expertise)
- nationality
- image (optional)

Category/subcategory pages (standard):
- name: "Z-Beam Technical Team"
- jobTitle: "Laser Cleaning Specialists"
- worksFor: Organization reference
- knowsAbout: Dynamic based on page content

### Reference Pattern
```json
{
  "@type": "Article",
  "author": {
    "@id": "https://z-beam.com#author-expert"
  }
}
```

This creates a reference to the Person schema defined elsewhere in the @graph, establishing clear semantic relationships.

## Files Modified
1. `app/utils/jsonld-helper.ts` (4 schemas enhanced)
2. `app/materials/[category]/page.tsx` (Person schema added, 3 references added)
3. `app/materials/[category]/[subcategory]/page.tsx` (Person schema added, 3 references added)

## Status
✅ All changes implemented
⏳ Ready for build and deployment
📊 Awaiting production validation
