# Schema Enhancements - October 28, 2025

## Overview
Enhanced JSON-LD schema generation in `SchemaFactory.ts` to improve SEO, fix FAQ schema generation, and add comprehensive E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) signals.

## Changes Made

### 1. ✅ Fixed FAQ Schema Generation

**Problem**: FAQ schema wasn't being generated for material pages despite FAQ data existing in YAML files.

**Root Cause**: The FAQ condition and data extraction was checking `data.faq` and `data.frontmatter.faq`, but the contentAPI passes FAQ data via `data.metadata.faq`.

**Solution**:
- Updated FAQ condition to check `data.metadata?.faq` in addition to other locations
- Improved FAQ detection to explicitly check for `fm.faq` field
- Enhanced FAQ generation to prioritize explicit FAQs over auto-generated ones
- Fixed environmentalImpact handling to extract benefits from object arrays
- Better null checking for question/answer pairs

**Files Modified**:
- `app/utils/schemas/SchemaFactory.ts` (lines 173-181, 800-870)

**Testing**: Verify FAQ schema appears on material pages like `/metal/non-ferrous/aluminum-laser-cleaning`

---

### 2. ✅ Enhanced VideoObject Schema

**Improvements**:
- Added material-specific video titles and descriptions
- Enhanced descriptions to include frontmatter description when available
- Added `about` field linking to material category for context
- Improved fallback descriptions with better detail
- Standardized publisher logo reference

**Example Output**:
```json
{
  "@type": "VideoObject",
  "name": "Aluminum Laser Cleaning - Professional Demonstration",
  "description": "See how laser cleaning effectively processes Aluminum. Laser cleaning parameters for Aluminum",
  "about": {
    "@type": "Thing",
    "name": "metal laser cleaning"
  }
}
```

**Files Modified**:
- `app/utils/schemas/SchemaFactory.ts` (lines 870-920)

---

### 3. ✅ Enhanced TechnicalArticle with E-E-A-T Signals

**Improvements**:
- Added enhanced author object with credentials
- Included `jobTitle` from author.title field
- Added `worksFor` organizational affiliation
- Included `knowsAbout` expertise areas (from author.expertise or material applications)
- Added `nationality` for geographic authority
- Enhanced publisher with logo
- Added `abstract` field from subtitle
- Included keywords for topical relevance

**E-E-A-T Signals Added**:
- **Experience**: Abstract, applications, keywords
- **Expertise**: Author jobTitle, knowsAbout, nationality
- **Authoritativeness**: Organizational affiliation, publisher logo
- **Trustworthiness**: Complete author credentials, structured data validation

**Example Output**:
```json
{
  "@type": "TechnicalArticle",
  "author": {
    "@type": "Person",
    "name": "Todd Dunning",
    "jobTitle": "MA",
    "worksFor": {
      "@type": "Organization",
      "name": "Z-Beam Laser Cleaning"
    },
    "knowsAbout": "Optical Materials for Laser Systems",
    "nationality": "United States (California)"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Z-Beam Laser Cleaning",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.z-beam.com/images/favicon/favicon-350.png"
    }
  },
  "abstract": "Precision laser cleaning for aluminum surfaces"
}
```

**Files Modified**:
- `app/utils/schemas/SchemaFactory.ts` (lines 450-530)

---

### 4. ✅ Fixed WebPage Name/Description to be Material-Specific

**Problem**: WebPage schema was using generic fallback values ("Z-Beam" and "") instead of material-specific content.

**Solution**:
- Extract metadata from `data.metadata`, `data.frontmatter`, or `data.pageConfig`
- Use material title and description from frontmatter
- Properly cascade fallbacks: metadata → data → defaults
- Added dateModified fallback chain

**Before**:
```json
{
  "@type": "WebPage",
  "name": "Z-Beam",
  "description": ""
}
```

**After**:
```json
{
  "@type": "WebPage",
  "name": "Aluminum Laser Cleaning",
  "description": "Laser cleaning parameters for Aluminum"
}
```

**Files Modified**:
- `app/utils/schemas/SchemaFactory.ts` (lines 290-330)

---

### 5. ✅ Enhanced Author Credentials (Person Schema)

**Improvements**:
- Added `jobTitle` with fallback from author.title
- Added `affiliation` for organizational membership
- Enhanced `knowsAbout` with expertise areas
- Added `nationality` for geographic context
- Included `sameAs` for social proof
- Better credential handling

**E-E-A-T Signals**:
- Professional credentials (jobTitle, title)
- Organizational affiliation
- Geographic authority (nationality)
- Expertise areas (knowsAbout)
- Social proof (sameAs links)

**Example Output**:
```json
{
  "@type": "Person",
  "name": "Todd Dunning",
  "jobTitle": "MA",
  "affiliation": {
    "@type": "Organization",
    "name": "Z-Beam Laser Cleaning"
  },
  "knowsAbout": "Optical Materials for Laser Systems",
  "nationality": "United States (California)"
}
```

**Files Modified**:
- `app/utils/schemas/SchemaFactory.ts` (lines 1180-1230)

---

## Implementation Details

### Data Flow Understanding

The FAQ issue was traced to the data structure from `contentAPI.getArticle()`:

```typescript
{
  metadata: {
    title: "Aluminum Laser Cleaning",
    description: "...",
    faq: [ /* FAQ array */ ],
    applications: [ /* ... */ ],
    // ... all frontmatter fields
  },
  components: {
    text: { /* ... */ },
    micro: { /* ... */ }
  }
}
```

The SchemaFactory receives this structure and needs to check:
1. `data.metadata.faq` (primary location from contentAPI)
2. `data.frontmatter.faq` (legacy compatibility)
3. `data.faq` (direct pass-through)

### FAQ Generation Priority

1. **Explicit FAQs**: Use FAQs from YAML frontmatter if present
2. **Auto-generated FAQs**: Only generate from applications/environmentalImpact if no explicit FAQs exist
3. **Environmental Impact**: Properly extract benefit descriptions from object arrays

---

## Testing Checklist

- [x] Verify FAQ schema appears on material pages
- [x] Check VideoObject includes material-specific titles
- [x] Confirm TechnicalArticle has enhanced author credentials
- [x] Validate WebPage uses material title/description
- [x] Ensure Person schema includes jobTitle, affiliation, expertise
- [x] No TypeScript errors in SchemaFactory.ts

---

## Next Steps

1. **Monitor Search Console**: Check if FAQ rich snippets appear in Google Search Console
2. **Test Live Pages**: Verify schemas on production after deployment
3. **Validate Schema**: Use Google's Rich Results Test tool
4. **Track Performance**: Monitor CTR improvements from enhanced schemas
5. **Add More E-E-A-T Signals**: Consider adding:
   - Review/Rating schemas
   - Organization credentials
   - Certification badges
   - Industry affiliations

---

## Files Modified

- `app/utils/schemas/SchemaFactory.ts` - Enhanced schema generation with E-E-A-T signals

---

## Related Documentation

- [JSON-LD Architecture](docs/architecture/JSON_LD_ARCHITECTURE.md)
- [SchemaFactory Implementation](docs/architecture/SCHEMAFACTORY_IMPLEMENTATION.md)
- [E-E-A-T Implementation](docs/JSONLD_EEAT_IMPLEMENTATION.md)
- [Web Standards Improvements](docs/WEB_STANDARDS_IMPROVEMENTS_JAN_2025.md)
