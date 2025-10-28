# FAQ Component Implementation

**Date:** October 27, 2025  
**Status:** ✅ Implemented  
**Location:** `app/components/FAQ/MaterialFAQ.tsx`

---

## Overview

The MaterialFAQ component displays material-specific frequently asked questions that are now stored directly in frontmatter YAML files. This implementation supports both SEO optimization through JSON-LD FAQPage schema and improved user experience with detailed Q&A content.

---

## Architecture

### Component Structure

```
app/components/FAQ/
└── MaterialFAQ.tsx          # FAQ display component (client-side)
```

### Data Flow

```
Frontmatter YAML (faq field)
    ↓
contentAPI.ts (loads frontmatter)
    ↓
Layout.tsx (passes faq to MaterialFAQ)
    ↓
MaterialFAQ.tsx (renders Q&A)
    ↓
JSON-LD Helper (creates FAQPage schema)
```

---

## Frontmatter Structure

### YAML Format

```yaml
faq:
  - question: "Can a standard laser cleaning machine safely remove lanthanum oxide scale or contamination from components?"
    answer: "A standard 1064nm laser system can effectively remove lanthanum oxide scale, but requires precise fluence control near the 2.5 J/cm² ablation threshold. Its high absorption coefficient of 0.85 facilitates efficient cleaning, yet the low thermal conductivity of 13.4 W/(m·K) demands careful parameterization to prevent localized thermal effects and potential surface modification."
  
  - question: "What are the specific safety hazards of laser cleaning lanthanum or lanthanum-containing alloys?"
    answer: "Lanthanum's low 200°C oxidation threshold means laser cleaning readily generates hazardous oxide fumes. At our standard 2.5 J/cm² fluence, you require a P100 particulate filter and powerful fume extraction. The fine, reactive particles necessitate this robust respiratory and ventilation control to mitigate inhalation risks."
```

### Field Requirements

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `faq` | Array | No | Array of FAQ items |
| `faq[].question` | String | Yes | Question text |
| `faq[].answer` | String | Yes | Answer text |

---

## Component Implementation

### MaterialFAQ.tsx

**Purpose:** Displays FAQ data from frontmatter  
**Type:** Client component  
**Complexity:** Low (display only)

**Props:**
```typescript
interface MaterialFAQProps {
  materialName: string;        // e.g., "Lanthanum"
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  className?: string;
}
```

**Usage in Layout.tsx:**
```typescript
{metadata?.name && metadata?.faq && metadata.faq.length > 0 && (
  <section aria-labelledby="faq-section" className="my-8">
    <MaterialFAQ
      materialName={metadata.name}
      faq={metadata.faq}
    />
  </section>
)}
```

### Rendering Behavior

- **No FAQ data:** Component returns `null` (no render)
- **With FAQ data:** Renders expandable accordion-style Q&A
- **Styling:** Uses `<details>` and `<summary>` HTML5 elements for native accordion behavior

---

## JSON-LD Integration

### FAQPage Schema

The FAQ data is automatically converted to JSON-LD FAQPage schema for enhanced SEO:

```json
{
  "@type": "FAQPage",
  "@id": "https://z-beam.com/materials/rare-earth/lanthanide/lanthanum-laser-cleaning#faq",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Can a standard laser cleaning machine safely remove lanthanum oxide scale?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A standard 1064nm laser system can effectively remove..."
      }
    }
  ]
}
```

### Schema Generation

**File:** `app/utils/jsonld-helper.ts`  
**Function:** `createFAQPageSchema()`

```typescript
function createFAQPageSchema(data: any) {
  const { materialName, faq, pageUrl } = data;
  
  if (!faq || !Array.isArray(faq) || faq.length === 0) {
    return null;
  }
  
  const faqEntities = faq.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer
    }
  }));
  
  return {
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    mainEntity: faqEntities
  };
}
```

---

## Migration from Generated FAQs

### Previous Implementation

Previously, FAQs were auto-generated from material properties:
- Extracted hardness, thermal conductivity, wavelength data
- Generated generic questions based on property thresholds
- Limited customization and material-specific insights

### New Implementation

Now FAQs are authored content in frontmatter:
- ✅ Material-specific expert questions
- ✅ Detailed, accurate answers from research
- ✅ Better SEO with targeted keywords
- ✅ More user value with practical insights
- ✅ Easier to update and maintain

### Changes Made

1. **MaterialFAQ.tsx:**
   - Removed property-based FAQ generation logic
   - Simplified to display-only component
   - Updated props to accept `faq` array

2. **Layout.tsx:**
   - Removed material property props
   - Now only passes `materialName` and `faq`
   - Added conditional check for `faq` existence

3. **jsonld-helper.ts:**
   - Updated `createFAQPageSchema()` to use frontmatter FAQ data
   - Removed property-based FAQ generation
   - Simplified schema creation logic

---

## SEO Benefits

### Rich Results Eligibility

FAQPage schema enables Google Rich Results:
- **FAQ Accordion:** Questions expanded in search results
- **Featured Snippets:** Individual Q&A can appear as answers
- **People Also Ask:** FAQ content feeds SERP features
- **Knowledge Panels:** Structured data enhances entity understanding

### E-E-A-T Signals

FAQ content demonstrates:
- **Experience:** Practical, real-world Q&A
- **Expertise:** Technical accuracy in answers
- **Authoritativeness:** Comprehensive material coverage
- **Trustworthiness:** Transparent, detailed information

---

## Content Guidelines

### Question Best Practices

1. **Start with question words:** What, How, Why, Can, Does
2. **Include material name:** "What makes lanthanum challenging..."
3. **Be specific:** Target actual user queries
4. **Natural language:** How users actually search
5. **Length:** 50-150 characters optimal

### Answer Best Practices

1. **Direct answer first:** Address question immediately
2. **Technical details:** Include specific values, parameters
3. **Practical context:** Real-world applications
4. **Completeness:** 150-300 words per answer
5. **Accuracy:** Cite material properties when relevant
6. **Readability:** Short paragraphs, clear language

### Example Structure

**Good Question:**
```
Can laser cleaning damage lanthanum through overheating?
```

**Good Answer:**
```
Lanthanum has a thermal limit of 200°C, which our laser cleaning process stays well below. Using 12 ns pulses ensures that heat input is confined to the contamination layer with minimal thermal diffusion into the base material. The short interaction time prevents bulk heating, and the scanning pattern allows cooling between passes. This results in surface temperatures that remain safely below critical thresholds, preserving material properties.
```

---

## Testing

### Component Testing

```bash
# Run component tests
npm test -- MaterialFAQ
```

### JSON-LD Validation

1. **Schema.org Validator:** https://validator.schema.org/
2. **Google Rich Results Test:** https://search.google.com/test/rich-results
3. **Structured Data Testing Tool:** https://search.google.com/structured-data/testing-tool

### Manual Testing Checklist

- [ ] FAQ section renders when data exists
- [ ] FAQ section hidden when no data
- [ ] Accordion expand/collapse works
- [ ] Mobile responsive layout
- [ ] Accessibility (keyboard navigation)
- [ ] JSON-LD schema valid
- [ ] Rich results preview shows FAQ

---

## Material Coverage

### Materials with FAQ Data (Oct 2025)

**Rare-Earth Materials (8):**
- cerium-laser-cleaning.yaml
- dysprosium-laser-cleaning.yaml
- europium-laser-cleaning.yaml
- lanthanum-laser-cleaning.yaml
- neodymium-laser-cleaning.yaml
- praseodymium-laser-cleaning.yaml
- terbium-laser-cleaning.yaml
- yttrium-laser-cleaning.yaml

**Wood Materials (1):**
- bamboo-laser-cleaning.yaml

### Expansion Strategy

1. **Phase 1:** All rare-earth materials (✅ Complete)
2. **Phase 2:** High-traffic metals (aluminum, copper, steel)
3. **Phase 3:** Specialty ceramics and composites
4. **Phase 4:** All remaining materials

**Target:** 10+ FAQs per material by Q1 2026

---

## Performance Considerations

### Bundle Size Impact

- **Component:** ~2KB (display logic only)
- **Data:** Stored in frontmatter (already loaded)
- **Runtime:** Minimal (no generation, just rendering)

### Rendering Performance

- Client-side component (interactive accordion)
- No hydration issues (FAQ in frontmatter)
- Lazy rendering via `<details>` HTML5 element
- No JavaScript required for basic functionality

---

## Maintenance

### Adding FAQs to New Materials

1. Open frontmatter YAML file
2. Add `faq:` array field
3. Add question/answer pairs
4. Validate YAML syntax
5. Test page locally
6. Validate JSON-LD schema

### Updating Existing FAQs

1. Edit frontmatter YAML
2. Regenerate static pages
3. Redeploy to production
4. Monitor search console for rich result changes

### Quality Assurance

- Monthly review of FAQ accuracy
- Update answers with new research
- Add questions based on user queries
- Monitor search console for keyword opportunities

---

## Future Enhancements

### Planned Features

1. **FAQ Search:** Filter questions by keyword
2. **Related Questions:** Link to similar Q&A
3. **Feedback:** "Was this helpful?" voting
4. **Analytics:** Track most-viewed questions
5. **A/B Testing:** Optimize question phrasing

### Schema Enhancements

1. **HowTo Schema:** For process-oriented questions
2. **VideoObject:** Embed demonstration videos
3. **Mentions:** Link to regulatory standards
4. **Citations:** Reference scientific sources

---

## Related Documentation

- [JSON-LD E-E-A-T Implementation](/docs/JSONLD_EEAT_IMPLEMENTATION.md)
- [Frontmatter Naming Rules](/docs/reference/FRONTMATTER_NAMING_RULES.md)
- [Component Architecture](/docs/architecture/)
- [SEO Best Practices](/docs/guides/ADDITIONAL_HTML_BEST_PRACTICES.md)

---

## Changelog

### v1.0.0 - October 27, 2025
- ✅ Migrated from generated to frontmatter-based FAQs
- ✅ Updated MaterialFAQ component to display-only
- ✅ Updated JSON-LD helper to use frontmatter FAQ data
- ✅ Updated Layout.tsx to pass FAQ array
- ✅ Added FAQ data to 9 materials (8 rare-earth + bamboo)
- ✅ Documented implementation and guidelines
