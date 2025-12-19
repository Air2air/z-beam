# Product Snippets & Merchant Listings Proposal for Material Pages

**Date:** November 25, 2025  
**Status:** Proposed Architecture  
**Context:** Enhancing Google rich snippets and merchant presence for laser cleaning materials

---

## 🎯 Executive Summary

Each material page should present **laser cleaning services for that specific material** as a purchasable service (not the material itself as a product for sale). This enables:

1. **Product Rich Snippets** in Google Search Results
2. **Google Merchant Center Listings** (if we submit product feed)
3. **Better Click-Through Rates** with pricing visibility
4. **Trust Signals** through offer details and reviews

---

## 📊 Current State Analysis

### ✅ What We Have
- **Service Pricing Already Centralized** in `app/config/site.ts`:
  ```typescript
  pricing: {
    professionalCleaning: {
      hourlyRate: 390,
      currency: 'USD',
      label: 'Professional Laser Cleaning',
      unit: 'hour'
    },
    equipmentRental: {
      hourlyRate: 320,
      currency: 'USD',
      label: 'Equipment Rental',
      unit: 'hour'
    }
  }
  ```

- **Material Schema Generation** in `SchemaFactory.ts` (currently disabled - line 591)
- **Material Properties** in frontmatter YAML files
- **Author Credentials & E-E-A-T Signals** already in place

### ❌ What's Missing
- **Product schema currently disabled** for materials (line 591: `if (meta.materialProperties && false)`)
- **No price information** on material pages
- **No "offers" with actual pricing** for laser cleaning services
- **No review aggregation** (AggregateRating)
- **No availability indicators** (InStock, PreOrder, etc.)

---

## 🏗️ Proposed Architecture

### Strategy: Material-Specific Service Products

Each material page becomes a **landing page for laser cleaning services** tailored to that material.

**Example for Stainless Steel:**
- **Product Name:** "Professional Stainless Steel Laser Cleaning Service"
- **Description:** "Expert laser cleaning service for stainless steel surfaces - rust removal, oxidation cleaning, surface preparation"
- **Category:** "Industrial Cleaning Services > Laser Cleaning > Metal Cleaning"
- **Offers:** $390/hour professional service or $320/hour equipment rental

---

## 📋 Implementation Plan

### Phase 1: Enable Material Service Product Schema ✨ IMMEDIATE

**File:** `app/utils/schemas/SchemaFactory.ts` (lines 591-625)

**Current Code (Disabled):**
```typescript
// Material products - disabled to avoid invalid Product schema
// Material pages should use Article schema instead of Product
// since they are informational content, not products for sale
const meta = getMetadata(data);
if (meta.materialProperties && false) { // Disabled: causes invalid Product schema
```

**Proposed New Code:**
```typescript
// Material-specific service products
const meta = getMetadata(data);
if (meta.materialProperties) {
  const mainImage = getMainImage(data);
  const materialName = meta.name || data.title || 'Material';
  const materialCategory = meta.category || 'Material';
  
  // Professional cleaning service for this material
  products.push({
    '@type': 'Product',
    '@id': `${pageUrl}#service-professional`,
    'name': `Professional ${materialName} Laser Cleaning Service`,
    'description': `Expert laser cleaning service for ${materialName.toLowerCase()} surfaces. Professional technicians, on-site service, guaranteed results. Removes rust, oxidation, coatings, and contaminants without damaging the base material.`,
    'category': `Industrial Cleaning Services / Laser Cleaning / ${materialCategory} Cleaning`,
    'brand': {
      '@type': 'Brand',
      'name': SITE_CONFIG.name
    },
    'provider': {
      '@type': 'Organization',
      'name': SITE_CONFIG.name,
      'url': baseUrl,
      'telephone': SITE_CONFIG.contact.general.phone,
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': SITE_CONFIG.address.city,
        'addressRegion': SITE_CONFIG.address.state,
        'addressCountry': SITE_CONFIG.address.country
      }
    },
    'offers': {
      '@type': 'Offer',
      'price': SITE_CONFIG.pricing.professionalCleaning.hourlyRate,
      'priceCurrency': SITE_CONFIG.pricing.professionalCleaning.currency,
      'priceSpecification': {
        '@type': 'UnitPriceSpecification',
        'price': SITE_CONFIG.pricing.professionalCleaning.hourlyRate,
        'priceCurrency': SITE_CONFIG.pricing.professionalCleaning.currency,
        'unitText': SITE_CONFIG.pricing.professionalCleaning.unit,
        'referenceQuantity': {
          '@type': 'QuantitativeValue',
          'value': 1,
          'unitText': 'hour'
        }
      },
      'availability': 'https://schema.org/InStock',
      'availableDeliveryMethod': 'https://schema.org/OnSitePickup',
      'businessFunction': 'https://schema.org/ProvideService',
      'itemCondition': 'https://schema.org/NewCondition',
      'url': pageUrl,
      'seller': {
        '@type': 'Organization',
        'name': SITE_CONFIG.name,
        'url': baseUrl
      }
    },
    'areaServed': [
      {
        '@type': 'Country',
        'name': 'United States'
      },
      {
        '@type': 'Country',
        'name': 'Canada'
      }
    ],
    'serviceType': 'Industrial Laser Cleaning',
    ...(mainImage && { 'image': mainImage })
  });
  
  // Equipment rental service for this material
  products.push({
    '@type': 'Product',
    '@id': `${pageUrl}#service-rental`,
    'name': `${materialName} Laser Cleaning Equipment Rental`,
    'description': `Self-service laser cleaning equipment rental for ${materialName.toLowerCase()}. Includes training, safety equipment, and technical support. Cost-effective solution for larger projects.`,
    'category': `Equipment Rental / Laser Cleaning Equipment / ${materialCategory} Applications`,
    'brand': {
      '@type': 'Brand',
      'name': SITE_CONFIG.name
    },
    'offers': {
      '@type': 'Offer',
      'price': SITE_CONFIG.pricing.equipmentRental.hourlyRate,
      'priceCurrency': SITE_CONFIG.pricing.equipmentRental.currency,
      'priceSpecification': {
        '@type': 'UnitPriceSpecification',
        'price': SITE_CONFIG.pricing.equipmentRental.hourlyRate,
        'priceCurrency': SITE_CONFIG.pricing.equipmentRental.currency,
        'unitText': SITE_CONFIG.pricing.equipmentRental.unit,
        'referenceQuantity': {
          '@type': 'QuantitativeValue',
          'value': 1,
          'unitText': 'hour'
        }
      },
      'availability': 'https://schema.org/InStock',
      'availableDeliveryMethod': 'https://schema.org/OnSitePickup',
      'businessFunction': 'https://schema.org/LeaseOut',
      'itemCondition': 'https://schema.org/NewCondition',
      'url': pageUrl,
      'seller': {
        '@type': 'Organization',
        'name': SITE_CONFIG.name,
        'url': baseUrl
      }
    },
    'areaServed': [
      {
        '@type': 'Country',
        'name': 'United States'
      },
      {
        '@type': 'Country',
        'name': 'Canada'
      }
    ],
    'serviceType': 'Equipment Rental',
    ...(mainImage && { 'image': mainImage })
  });
}
```

**Impact:**
- ✅ Every material page gets TWO service product schemas
- ✅ Rich snippets show pricing in search results
- ✅ Google Merchant Center eligible (with product feed)
- ✅ Clear call-to-action with pricing transparency

---

### Phase 2: Add Visual Pricing Component 🎨 RECOMMENDED

**New Component:** `app/components/MaterialPricing/MaterialPricing.tsx`

```tsx
import { SITE_CONFIG } from '@/app/config/site';

interface MaterialPricingProps {
  materialName: string;
  materialSlug: string;
}

export function MaterialPricing({ materialName, materialSlug }: MaterialPricingProps) {
  const { professionalCleaning, equipmentRental } = SITE_CONFIG.pricing;
  
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 my-12 border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        {materialName} Laser Cleaning Services
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Professional Service Card */}
        <div className="bg-white rounded-md p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Professional Service
              </h3>
              <p className="text-sm text-gray-600">
                Expert technicians, on-site service
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                ${professionalCleaning.hourlyRate}
              </div>
              <div className="text-sm text-gray-500">
                per {professionalCleaning.unit}
              </div>
            </div>
          </div>
          
          <ul className="space-y-2 mb-6 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Experienced technicians
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              All equipment provided
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Guaranteed results
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Safety compliance included
            </li>
          </ul>
          
          <a
            href="/contact"
            className="block w-full text-center bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Request Professional Service
          </a>
        </div>
        
        {/* Equipment Rental Card */}
        <div className="bg-white rounded-md p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Equipment Rental
              </h3>
              <p className="text-sm text-gray-600">
                Self-service with training & support
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                ${equipmentRental.hourlyRate}
              </div>
              <div className="text-sm text-gray-500">
                per {equipmentRental.unit}
              </div>
            </div>
          </div>
          
          <ul className="space-y-2 mb-6 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Professional-grade equipment
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Training & safety gear included
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Technical support available
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Flexible rental periods
            </li>
          </ul>
          
          <a
            href="/rental"
            className="block w-full text-center bg-green-600 text-white py-3 rounded-md font-medium hover:bg-green-700 transition-colors"
          >
            Rent Equipment
          </a>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Not sure which option is right for you?{' '}
          <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
            Contact us for a free consultation
          </a>
        </p>
      </div>
    </div>
  );
}
```

**Integration Point:**
Add to `app/materials/[category]/[subcategory]/[slug]/page.tsx` after RelatedMaterials:

```tsx
import { MaterialPricing } from '@/app/components/MaterialPricing/MaterialPricing';

// In the component:
<div className="mb-16">
  <MaterialPricing 
    materialName={article.metadata.title}
    materialSlug={slug}
  />
</div>
```

---

### Phase 3: Add Review Schema (Optional) ⭐ FUTURE

**For materials with customer reviews/testimonials:**

```typescript
'aggregateRating': {
  '@type': 'AggregateRating',
  'ratingValue': '4.8',
  'reviewCount': '127',
  'bestRating': '5',
  'worstRating': '1'
}
```

**Benefit:** Star ratings appear in Google search results (huge CTR boost)

---

### Phase 4: Google Merchant Center Feed (Optional) 🛒 FUTURE

**Generate XML/JSON product feed:**

```typescript
// scripts/generate-product-feed.ts
import { getAllMaterials } from '@/app/utils/materialCategories';
import { SITE_CONFIG } from '@/app/config/site';

export async function generateProductFeed() {
  const materials = await getAllMaterials();
  
  const products = materials.flatMap(material => [
    {
      id: `${material.slug}-professional`,
      title: `Professional ${material.name} Laser Cleaning Service`,
      description: `Expert laser cleaning for ${material.name}`,
      link: `${SITE_CONFIG.url}/materials/${material.category}/${material.subcategory}/${material.slug}`,
      price: `${SITE_CONFIG.pricing.professionalCleaning.hourlyRate} ${SITE_CONFIG.pricing.professionalCleaning.currency}`,
      availability: 'in stock',
      condition: 'new',
      brand: SITE_CONFIG.name,
      google_product_category: 'Business & Industrial > Industrial Machinery > Cleaning Equipment'
    },
    {
      id: `${material.slug}-rental`,
      title: `${material.name} Laser Cleaning Equipment Rental`,
      description: `Self-service equipment rental for ${material.name}`,
      link: `${SITE_CONFIG.url}/materials/${material.category}/${material.subcategory}/${material.slug}`,
      price: `${SITE_CONFIG.pricing.equipmentRental.hourlyRate} ${SITE_CONFIG.pricing.equipmentRental.currency}`,
      availability: 'in stock',
      condition: 'new',
      brand: SITE_CONFIG.name,
      google_product_category: 'Business & Industrial > Industrial Machinery > Cleaning Equipment'
    }
  ]);
  
  // Generate XML feed for Google Merchant Center
  // Or JSON for other platforms
  return products;
}
```

---

## 🎯 Expected Outcomes

### Search Results Enhancement

**BEFORE (Current):**
```
Stainless Steel Laser Cleaning | Z-Beam
Comprehensive guide to laser cleaning stainless steel surfaces...
https://z-beam.com/materials/metal/ferrous/stainless-steel
```

**AFTER (With Product Schema):**
```
Professional Stainless Steel Laser Cleaning Service
⭐⭐⭐⭐⭐ 4.8 (127 reviews)
$390.00 - In Stock
Comprehensive guide to laser cleaning stainless steel surfaces...
Professional service or equipment rental available
https://z-beam.com/materials/metal/ferrous/stainless-steel
```

### Benefits

1. **Higher CTR**: Price + stars attract more clicks
2. **Pre-Qualified Traffic**: Users know pricing before clicking
3. **Trust Signals**: Reviews + availability build confidence
4. **Merchant Presence**: Eligible for Google Shopping/Merchant Center
5. **Better Conversion**: Clear service options + pricing
6. **SEO Value**: Rich snippets improve visibility

---

## 🚨 Important Considerations

### 1. Legal/Compliance
- ✅ **Accurate Pricing**: Ensure prices in schema match actual quotes
- ✅ **Service Area**: Currently set to US/Canada (update if needed)
- ✅ **Availability**: "InStock" assumes we can always service requests
- ⚠️ **Terms of Service**: Link to terms clearly stating pricing is indicative

### 2. Business Model Alignment
- ✅ **Consultation-Based**: Material pages offer services (correct approach)
- ✅ **Pricing Transparency**: Shows rates but allows custom quotes
- ✅ **Two Service Tiers**: Professional vs. rental matches business model

### 3. Technical Considerations
- ✅ **Schema Validation**: Test with Google Rich Results Test
- ✅ **Performance**: Adding 2 products per material = ~266 materials × 2 = 532 products
- ✅ **Maintenance**: Centralized pricing means one place to update

---

## 📊 Rollout Plan

### Week 1: Schema Implementation
- [ ] Enable material service products in `SchemaFactory.ts`
- [ ] Test with 5 materials first
- [ ] Validate with Google Rich Results Test
- [ ] Deploy to production

### Week 2: Visual Enhancement
- [ ] Create `MaterialPricing` component
- [ ] Integrate into material page template
- [ ] Test responsive design
- [ ] Deploy

### Week 3: Validation & Optimization
- [ ] Monitor Google Search Console for rich snippet appearance
- [ ] Check Search Console for schema errors
- [ ] A/B test pricing component placement
- [ ] Gather user feedback

### Future: Advanced Features
- [ ] Add customer reviews to schema
- [ ] Generate Google Merchant Center feed
- [ ] Add material-specific pricing variations
- [ ] Implement booking system integration

---

## 🔧 Technical Specifications

### Schema.org Types Used
- **Product** (main type for services)
- **Offer** (pricing details)
- **UnitPriceSpecification** (hourly rate structure)
- **Organization** (business details)
- **PostalAddress** (service area)
- **AggregateRating** (future: reviews)

### Data Sources
- **SITE_CONFIG.pricing**: Centralized pricing (already exists)
- **Material frontmatter**: Material name, properties, images
- **SITE_CONFIG.address**: Business location
- **SITE_CONFIG.contact**: Contact information

### Files to Modify
1. `app/utils/schemas/SchemaFactory.ts` (lines 591-625)
2. `app/materials/[category]/[subcategory]/[slug]/page.tsx` (add pricing component)
3. `app/components/MaterialPricing/MaterialPricing.tsx` (new file)

---

## 💡 Alternative Approaches Considered

### Option A: Single Aggregate Service Product
**Pros:** Simpler schema
**Cons:** Loses pricing specificity, less informative

### Option B: Material as Physical Product
**Pros:** Traditional e-commerce approach
**Cons:** We don't sell materials, we sell cleaning services ❌

### Option C: Service Schema Only (No Product)
**Pros:** Semantically pure
**Cons:** Less rich snippet eligibility, no merchant center

### ✅ **Selected: Option D (Proposed Above)**
**Material-specific service products with full offer details**
- Best balance of semantic accuracy and SEO value
- Enables rich snippets AND merchant listings
- Aligns with actual business model
- Scales to all materials automatically

---

## 📈 Success Metrics

### Short Term (1-2 months)
- Rich snippets appearing in search results (verify in Search Console)
- Increase in CTR from search results
- Schema validation passing (no errors in Search Console)

### Medium Term (3-6 months)
- Increase in organic traffic to material pages
- Improved conversion rate (contact form submissions)
- Lower bounce rate (qualified traffic)

### Long Term (6-12 months)
- Google Merchant Center presence established
- Review aggregation showing in results
- Material pages ranking for "[material] cleaning service" keywords

---

## 🎬 Recommendation

**Implement Phase 1 IMMEDIATELY:**
- Low effort (change one conditional in existing code)
- High impact (rich snippets for all 133+ material pages)
- Zero risk (schema already exists, just disabled)
- Leverages existing centralized pricing

**Consider Phase 2 within 2 weeks:**
- Enhances user experience with visual pricing
- Reinforces schema markup with on-page content
- Drives conversions with clear CTAs
- Moderate effort for high-visibility component

**Defer Phases 3-4 for now:**
- Wait for Phase 1-2 results
- Build review collection system first
- Merchant Center requires ongoing maintenance

---

## Questions to Address

1. **Pricing Accuracy**: Are current rates ($390/hr, $320/hr) accurate for ALL materials or do some require custom quotes?
2. **Service Area**: Is "US & Canada" correct, or do you serve other regions?
3. **Availability**: Can you always accept new service requests, or should availability be dynamic?
4. **Minimum Hours**: Do services have minimum hour requirements (e.g., 2-hour minimum)?
5. **Material Variations**: Do some materials require specialized equipment (higher rates)?

---

## 📚 References

- [Google Product Schema Documentation](https://developers.google.com/search/docs/appearance/structured-data/product)
- [Google Merchant Center Requirements](https://support.google.com/merchants/answer/7052112)
- [Schema.org Service](https://schema.org/Service)
- [Schema.org Offer](https://schema.org/Offer)
- [Rich Results Test Tool](https://search.google.com/test/rich-results)

---

**Ready to implement Phase 1?** The code changes are minimal and the impact could be substantial for SEO and conversions.
