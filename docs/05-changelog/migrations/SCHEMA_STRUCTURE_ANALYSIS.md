# Schema Structure Analysis & Recommendations

## Current Investigation (October 28, 2025)

### Questions to Answer:
1. **Should FAQ be under metadata, or flattened?**
2. **Why isn't FAQ schema appearing on bluestone page?**
3. **What is the optimal structure per Google guidelines?**

---

## 1. Current Data Flow

### From ContentAPI to SchemaFactory

```typescript
// contentAPI.getArticle() returns:
{
  metadata: {
    title: "Aluminum Laser Cleaning",
    description: "...",
    faq: [ /* array of FAQ objects */ ],
    applications: [...],
    environmentalImpact: [...],
    // ... all frontmatter fields
  },
  components: {
    text: { content: "...", config: {} },
    micro: { content: "...", config: {} },
    // ... other components
  }
}
```

### SchemaFactory Access Pattern

```typescript
// SchemaFactory checks these locations:
const frontmatter = data.frontmatter || data.metadata || {};
const faqData = frontmatter.faq || data.metadata?.faq || data.faq;
```

**Current Structure: FAQ is under `metadata`** ✅ This is correct for contentAPI structure.

---

## 2. FAQ Schema Investigation - Bluestone Page

### Findings:

**YAML File**: ✅ FAQ data exists
```yaml
# bluestone-laser-cleaning.yaml
faq:
  - question: "What are the best laser settings..."
    answer: "For Bluestone, I recommend..."
  # ... 10 FAQs total
```

**Live Production**: ❌ No FAQPage schema
```bash
curl -s "https://www.z-beam.com/stone/sedimentary/bluestone-laser-cleaning" | grep -c '"@type":"FAQPage"'
# Output: 0
```

**Root Cause**: Production is running OLD code before our fixes were deployed.

---

## 3. Google Guidelines for FAQ Rich Results

### Official Requirements (per Google Search Central)

#### Structure Requirements:
1. **FAQPage Type**: Must be `@type: "FAQPage"`
2. **mainEntity Array**: Array of Question objects
3. **Question Structure**:
   ```json
   {
     "@type": "Question",
     "name": "Question text?",
     "acceptedAnswer": {
       "@type": "Answer",
       "text": "Answer text"
     }
   }
   ```

#### Content Guidelines:
- Questions must be actual questions (not statements)
- Answers must be factual and complete
- FAQ must be visible on the page (not schema-only)
- Each page should have only ONE FAQPage schema
- Minimum 2 questions recommended

#### Rich Results Eligibility:
- ✅ Questions appear as expandable accordions in SERPs
- ✅ Can appear in "People Also Ask" boxes
- ✅ Increases search result real estate
- ✅ Higher CTR potential

---

## 4. Optimal Schema Structure

### Current @graph Structure (RECOMMENDED ✅)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "...#webpage",
      "name": "Material-Specific Title",
      "description": "Material-Specific Description"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "...#breadcrumb"
    },
    {
      "@type": "Organization",
      "@id": "...#organization"
    },
    {
      "@type": "TechnicalArticle",
      "@id": "...#article",
      "author": {
        "@type": "Person",
        "name": "...",
        "jobTitle": "Ph.D.",
        "knowsAbout": "Laser Materials Processing",
        "nationality": "Italy"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "...#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What are the best laser settings...",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "For Bluestone, I recommend..."
          }
        }
      ]
    },
    {
      "@type": "VideoObject",
      "@id": "...#video",
      "name": "Bluestone Laser Cleaning - Professional Demonstration",
      "about": {
        "@type": "Thing",
        "name": "stone laser cleaning"
      }
    },
    {
      "@type": "HowTo",
      "@id": "...#howto"
    }
  ]
}
```

### Why @graph Pattern is Optimal:

1. **Single Script Tag**: Cleaner HTML, easier to manage
2. **Related Entities**: Shows relationships between schemas
3. **Better Indexing**: Search engines process related entities together
4. **E-E-A-T**: Multiple schema types enhance authority signals
5. **Google Preference**: Recommended by Google for complex pages
6. **Validation**: Easier to validate all schemas at once

---

## 5. Data Structure Recommendations

### ✅ RECOMMENDED: Keep Current Structure

```typescript
// contentAPI returns:
{
  metadata: {
    // All frontmatter flattened here
    faq: [...],
    applications: [...],
    author: {...}
  },
  components: {
    // Component-specific data
  }
}

// SchemaFactory checks:
const frontmatter = data.metadata || data.frontmatter || {};
```

**Rationale**:
- Consistent with contentAPI design
- Clear separation: metadata (schema) vs components (rendering)
- Backward compatible
- Matches Next.js metadata pattern

### ❌ NOT RECOMMENDED: Flatten Everything

```typescript
// Don't do this:
{
  title: "...",
  faq: [...],
  components: {...}
}
```

**Why Not**:
- Mixes concerns
- Harder to maintain
- Component data leaks into schema
- No clear separation

---

## 6. FAQ Schema Enhancement Opportunities

### Current Implementation Status:

✅ **Fixed Today**:
- FAQ condition checks `data.metadata.faq`
- Prioritizes explicit FAQs over auto-generated
- Handles environmentalImpact object arrays
- Material-specific error handling

### 🎯 **Recommended Enhancements**:

#### A. Add FAQ Display Component
The schema exists, but FAQ content should be visible on page:

```tsx
// Material pages should render FAQs
{metadata.faq && metadata.faq.length > 0 && (
  <MaterialFAQ 
    materialName={metadata.name}
    faq={metadata.faq}
  />
)}
```

#### B. Add More FAQ Sources
```typescript
// In SchemaFactory FAQ condition:
condition: (data) => {
  const fm = data.frontmatter || data.metadata || {};
  return !!(
    fm.faq ||                    // Explicit FAQs
    fm.outcomeMetrics ||         // Generate from metrics
    fm.applications ||           // Generate from apps
    fm.machineSettings ||        // Generate from settings
    fm.safetyConsiderations      // Generate from safety
  );
}
```

#### C. Enhance Question Quality
Current FAQs are excellent! Examples from bluestone:
- ✅ Specific technical questions
- ✅ Complete, detailed answers
- ✅ Include parameters (1064 nm, 5 J/cm², 100W)
- ✅ Safety considerations
- ✅ Cost comparisons

---

## 7. Production Deployment Checklist

### Before Deploying:

- [x] FAQ schema condition fixed
- [x] WebPage uses material-specific title/description
- [x] TechnicalArticle has E-E-A-T signals
- [x] VideoObject enhanced with material context
- [x] Person schema includes credentials
- [ ] **Deploy to production**
- [ ] Test with Google Rich Results Test
- [ ] Verify FAQ appears on bluestone page
- [ ] Monitor Search Console for rich results

### Validation Commands:

```bash
# Test local dev server
curl -s "http://localhost:3000/stone/sedimentary/bluestone-laser-cleaning" | grep -c '"@type":"FAQPage"'

# After deployment
curl -s "https://www.z-beam.com/stone/sedimentary/bluestone-laser-cleaning" | grep -c '"@type":"FAQPage"'

# Should return: 1 (one FAQPage schema)
```

---

## 8. Google Rich Results Optimization

### Expected Rich Results:

1. **FAQ Accordion**
   - Questions expand in search results
   - Increases SERP real estate
   - Higher CTR

2. **Featured Snippets**
   - Individual Q&A can be featured
   - Position 0 opportunity
   - Voice search friendly

3. **People Also Ask**
   - FAQ feeds PAA boxes
   - Related questions visibility
   - Topic authority signal

4. **Knowledge Panel**
   - Entity relationship signals
   - Industry expertise
   - Brand authority

### Monitoring Strategy:

1. **Google Search Console**
   - Enhancements → FAQ
   - Monitor impressions
   - Track CTR improvements

2. **Rich Results Test**
   - Validate FAQ structure
   - Check eligibility
   - Debug errors

3. **Analytics**
   - Track organic traffic
   - Monitor bounce rate
   - Measure engagement

---

## 9. Answers to Your Questions

### 1. Should FAQ be under metadata, or flattened?

**Answer**: ✅ **Keep under metadata** (current structure is correct)

**Rationale**:
- Matches contentAPI pattern (`metadata` contains all frontmatter)
- Clear separation of concerns
- SchemaFactory already handles this correctly
- Backward compatible with existing code

### 2. Why isn't FAQ showing on bluestone page?

**Answer**: ❌ **Production is running old code**

**Evidence**:
- YAML has FAQ data ✅
- SchemaFactory has FAQ generator ✅
- Production shows generic WebPage ("Z-Beam", "") ❌
- This proves old code is deployed

**Solution**: Deploy the changes we made today.

### 3. What is the optimal structure per Google guidelines?

**Answer**: ✅ **Current @graph structure is optimal**

**Google Recommendations**:
1. Use `@graph` for multiple related schemas ✅
2. Single `<script type="application/ld+json">` ✅
3. Unique `@id` for each entity ✅
4. Material-specific content (not generic) ✅
5. E-E-A-T signals in author ✅
6. FAQPage with visible content ⚠️ (need to add MaterialFAQ component to page)

---

## 10. Final Recommendations

### Immediate Actions:

1. **✅ Deploy Current Changes**
   - FAQ schema fix
   - WebPage material-specific content
   - E-E-A-T enhancements
   - VideoObject improvements

2. **Add MaterialFAQ Component to Material Pages**
   ```tsx
   // In Layout.tsx or material page template
   {components.faq && (
     <MaterialFAQ faq={metadata.faq} materialName={metadata.name} />
   )}
   ```

3. **Validate After Deployment**
   ```bash
   # Test each material type
   curl -s "https://www.z-beam.com/metal/non-ferrous/aluminum-laser-cleaning" | grep '"@type":"FAQPage"'
   curl -s "https://www.z-beam.com/stone/sedimentary/bluestone-laser-cleaning" | grep '"@type":"FAQPage"'
   ```

### Long-term Enhancements:

1. **Add Review Schema** (when you have customer testimonials)
2. **Add AggregateRating** (when you have ratings data)
3. **Enhance HowTo** with images and tools
4. **Add Event Schema** (for webinars/training)
5. **Monitor Performance** in Search Console

---

## References

- [Google FAQ Rich Results](https://developers.google.com/search/docs/appearance/structured-data/faqpage)
- [Schema.org FAQPage](https://schema.org/FAQPage)
- [Google E-E-A-T Guidelines](https://developers.google.com/search/docs/appearance/core-web-vitals)
- [Rich Results Test](https://search.google.com/test/rich-results)

---

**Status**: ✅ Analysis Complete  
**Next Step**: Deploy changes and validate
