# Google Merchant Center Category Research
**Date**: November 29, 2025  
**Issue**: Current category is product-focused, but Z-Beam offers services  
**Current Category**: "Business & Industrial > Industrial Machinery > Cleaning Equipment"

---

## Problem Statement

Z-Beam's Google Merchant feed incorrectly categorizes laser cleaning services as physical products. The business model is:
- **Professional Cleaning Service**: $390/hour
- **Equipment Rental Service**: $320/hour

Both are **services**, not products for sale.

---

## Google Product Taxonomy Research

### Key Finding: Google's Taxonomy is Product-Focused

Google's official product taxonomy (version 2021-09-21) contains **6,929 categories**, but they are overwhelmingly designed for **physical products**, not services. There is no dedicated "Services" category in the taxonomy.

### Relevant Category Options

After analyzing the full taxonomy, here are the most relevant categories:

#### Option 1: Keep Current Category (Least Change)
```
Category: Business & Industrial > Industrial Machinery > Cleaning Equipment
Why: Most semantically relevant to laser cleaning
Pros: 
  - Already configured
  - Users searching for cleaning solutions may find services
Cons: 
  - Technically incorrect (equipment vs service)
  - May confuse Google's algorithms
```

#### Option 2: Material Handling (More Generic)
```
Category ID: 6987
Category: Business & Industrial > Material Handling
Why: Services involve handling/processing materials
Pros: 
  - Broader category, less specific expectations
  - Covers industrial service territory
Cons: 
  - Very generic
  - Doesn't convey "cleaning" aspect
```

#### Option 3: Construction (Industry Alignment)
```
Category ID: 114
Category: Business & Industrial > Construction
Why: Laser cleaning is often used in construction/restoration
Pros: 
  - Aligns with industry use cases
  - Construction implies services, not just products
Cons: 
  - Doesn't specifically mention cleaning
  - May attract wrong audience
```

---

## Recommended Approach

### Primary Recommendation: Use Google Local Services Instead

**Why Google Merchant Center isn't ideal for services:**
- Merchant Center is designed for e-commerce (physical products)
- Product feeds expect inventory, SKUs, product availability
- Service pricing (hourly rates) doesn't fit product model

**Better alternatives for services:**
1. **Google Local Services Ads** - Specifically designed for service businesses
2. **Google Ads (Search)** - Direct targeting for service keywords
3. **Google Business Profile** - Local service visibility

### If Continuing with Merchant Center

**Best Option**: Keep current category OR switch to more generic

**Recommended Category Change**:
```xml
<!-- BEFORE -->
<g:google_product_category>Business &amp; Industrial &gt; Industrial Machinery &gt; Cleaning Equipment</g:google_product_category>

<!-- AFTER Option A: Material Handling (More Accurate) -->
<g:google_product_category>6987</g:google_product_category>

<!-- AFTER Option B: Construction (Industry-Focused) -->
<g:google_product_category>114</g:google_product_category>
```

**Note**: Using category IDs (like `6987`) is preferred over full paths to avoid formatting errors.

---

## Implementation Plan

### Step 1: Verify Merchant Center Purpose
- **Question**: Is the goal e-commerce sales or service lead generation?
- **If e-commerce**: Merchant Center makes sense (selling physical items)
- **If services**: Consider Google Local Services or Google Ads instead

### Step 2: If Staying with Merchant Center
1. Choose category: `6987` (Material Handling) or `114` (Construction)
2. Update `scripts/seo/generate-google-merchant-feed.js` line 150
3. Regenerate feeds
4. Test with Google Merchant Center validation

### Step 3: Update Feed Generation Script

```javascript
// In generate-google-merchant-feed.js, line 150
// CURRENT:
<g:google_product_category>Business &amp; Industrial &gt; Industrial Machinery &gt; Cleaning Equipment</g:google_product_category>

// RECOMMENDED CHANGE:
<g:google_product_category>6987</g:google_product_category>
// OR
<g:google_product_category>114</g:google_product_category>
```

---

## Additional Considerations

### Product vs Service Declaration

Consider adding custom labels to indicate these are services:
```xml
<g:custom_label_0>Service</g:custom_label_0>
<g:service_category>Industrial Cleaning</g:service_category>
```

### Pricing Model

Hourly pricing doesn't fit traditional product feeds. Consider:
- Listing as "packages" (e.g., "4-hour professional cleaning package")
- Using minimum service pricing as product price
- Creating tiered service offerings as separate "products"

---

## References

- Google Product Taxonomy: https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt
- Merchant Center Help: https://support.google.com/merchants/answer/6324436
- Google Local Services: https://ads.google.com/local-services-ads/

---

## Conclusion

**The fundamental issue**: Google Merchant Center is designed for products, not services.

**Recommendation**: 
1. **Ideal**: Migrate to Google Local Services Ads for better service-focused targeting
2. **Acceptable**: Use generic category `6987` (Material Handling) or `114` (Construction) if staying with Merchant Center
3. **Compromise**: Keep current category but add custom labels to clarify these are services

**Next Steps**: User should decide whether to:
- A) Change category within Merchant Center (quick fix, line 150)
- B) Explore Google Local Services (better long-term solution)
- C) Keep current category and monitor performance

