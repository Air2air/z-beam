# Google Shopping Feed Specification for Z-Beam Services

**Document Version**: 1.0  
**Last Updated**: December 6, 2025  
**Status**: Implementation Ready

---

## Overview

Z-Beam offers **hourly laser cleaning services**, not physical products. Each material type has its own service offering with a unique SKU combining the service type and material identifier.

### Business Model
- **Service Type**: Hourly professional services (not product sales)
- **Pricing Model**: Per-hour billing with estimated project ranges
- **Inventory**: Service availability (always in stock)
- **Fulfillment**: On-site service delivery in North America

---

## Service Offerings

### Base Service Types

| Service Type | SKU Prefix | Hourly Rate | Description |
|-------------|------------|-------------|-------------|
| Professional Cleaning | `ZB-PROF-CLEAN` | $390 USD | On-site professional laser cleaning with experienced technicians |
| Equipment Rental | `ZB-EQUIP-RENT` | $320 USD | Self-service equipment rental with training and support |

### Material-Specific SKU Format

Each material gets a unique SKU by combining service prefix with material identifier:

**Format**: `{SERVICE_PREFIX}-{MATERIAL_SLUG_UPPERCASE}`

**Examples**:
- `ZB-PROF-CLEAN-STONEWARE-LASER-CLEANING`
- `ZB-PROF-CLEAN-ALUMINUM-LASER-CLEANING`
- `ZB-EQUIP-RENT-STAINLESS-STEEL-LASER-CLEANING`

---

## Product Feed Structure

### Required Fields (Google Merchant Center)

| Field | Description | Example |
|-------|-------------|---------|
| `id` | Unique product identifier | `stoneware-laser-cleaning-professionalCleaning` |
| `title` | Service name with material | `Professional Laser Cleaning for Stoneware` |
| `description` | Full service description | `On-site professional laser cleaning service for stoneware...` |
| `link` | Material page URL | `https://www.z-beam.com/materials/ceramic/oxide/stoneware-laser-cleaning` |
| `image_link` | Material hero image | `https://www.z-beam.com/images/material/stoneware-laser-cleaning-hero.jpg` |
| `price` | Base hourly rate | `390 USD` |
| `availability` | Service availability | `in stock` |
| `condition` | Service condition | `new` |
| `brand` | Company name | `Z-Beam` |

### Recommended Fields

| Field | Description | Example |
|-------|-------------|---------|
| `mpn` | Manufacturer part number | `ZB-PROF-CLEAN-stoneware-laser-cleaning` |
| `product_type` | Material hierarchy | `Ceramic > Oxide > Stoneware` |
| `google_product_category` | Google's taxonomy | `Business & Industrial > Industrial Machinery > Cleaning Equipment` |
| `custom_label_0` | Service type label | `Professional Laser Cleaning` |
| `custom_label_1` | Pricing detail | `Hourly Rate: $390/hour` |
| `custom_label_2` | Estimated range | `Est. Range: $390-$1170` |

### Optional Enhancement Fields

| Field | Description | Notes |
|-------|-------------|-------|
| `gtin` | Global Trade Item Number | Not applicable for services |
| `service_type` | Schema.org service type | `Laser Cleaning` |
| `area_served` | Geographic coverage | `North America` |
| `provider` | Service provider details | Organization schema reference |

---

## Data Sources

### Primary Configuration
**File**: `app/config/site.ts`
```typescript
pricing: {
  professionalCleaning: {
    hourlyRate: 390,
    currency: 'USD',
    label: 'Professional Laser Cleaning',
    unit: 'hour',
    description: '...',
    sku: 'ZB-PROF-CLEAN'
  },
  equipmentRental: {
    hourlyRate: 320,
    currency: 'USD',
    label: 'Equipment Rental',
    unit: 'hour',
    description: '...',
    sku: 'ZB-EQUIP-RENT'
  }
}
```

### Material Frontmatter
**Path**: `frontmatter/materials/{material-slug}.yaml`
```yaml
serviceOffering:
  enabled: true
  type: professionalCleaning
  materialSpecific:
    estimatedHoursMin: 1
    estimatedHoursTypical: 3
    targetContaminants:
      - Surface contamination
      - Oxide scale
```

### JSON-LD Schema
**Location**: Material page `@graph` in `<script type="application/ld+json">`
```json
{
  "@type": "Service",
  "offers": {
    "@type": "Offer",
    "sku": "ZB-PROF-CLEAN",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": 390,
      "priceCurrency": "USD",
      "unitText": "per hour"
    }
  }
}
```

---

## Current Coverage

### Statistics (as of December 6, 2025)
- **Total Materials**: 189
- **Services Enabled**: 153 materials
- **Service Types**: 2 (Professional Cleaning, Equipment Rental)
- **Unique SKUs**: 153+ (one per material)

### Material Categories Covered
- Metals (ferrous, non-ferrous, precious)
- Ceramics (oxide, non-oxide)
- Polymers (thermoplastics, thermosets)
- Composites (fiber-reinforced, particle-reinforced)
- Wood (hardwood, softwood)
- Stone (natural, engineered)
- Glass (soda-lime, borosilicate)

---

## Feed Generation

### XML Feed Format (Primary)
**URL**: `https://www.z-beam.com/feeds/google-merchant-feed.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Z-Beam - Laser Cleaning Services</title>
    <link>https://www.z-beam.com</link>
    <description>Professional laser cleaning services for various materials</description>
    <item>
      <g:id>stoneware-laser-cleaning-professionalCleaning</g:id>
      <g:title>Professional Laser Cleaning for Stoneware Laser Cleaning</g:title>
      <g:description>...</g:description>
      <g:link>https://www.z-beam.com/materials/ceramic/oxide/stoneware-laser-cleaning</g:link>
      <g:image_link>https://www.z-beam.com/images/material/stoneware-laser-cleaning-hero.jpg</g:image_link>
      <g:price>390 USD</g:price>
      <g:availability>in stock</g:availability>
      <g:condition>new</g:condition>
      <g:brand>Z-Beam</g:brand>
      <g:mpn>ZB-PROF-CLEAN-stoneware-laser-cleaning</g:mpn>
      <g:product_type>Ceramic &gt; Oxide</g:product_type>
      <g:google_product_category>Business &amp; Industrial &gt; Industrial Machinery &gt; Cleaning Equipment</g:google_product_category>
      <g:custom_label_0>Professional Laser Cleaning</g:custom_label_0>
      <g:custom_label_1>Hourly Rate: $390/hour</g:custom_label_1>
      <g:custom_label_2>Est. Range: $390-$1170</g:custom_label_2>
    </item>
  </channel>
</rss>
```

### CSV Feed Format (Alternative)
**URL**: `https://www.z-beam.com/feeds/google-merchant-feed.csv`

Tab-separated values with headers:
```
id	title	description	link	image_link	price	availability	condition	brand	mpn	product_type	google_product_category	custom_label_0	custom_label_1	custom_label_2
```

### Generation Script
**Location**: `scripts/seo/generate-google-merchant-feed.js`

**Run Command**:
```bash
node scripts/seo/generate-google-merchant-feed.js
```

**Outputs**:
- `public/feeds/google-merchant-feed.xml` (153 products)
- `public/feeds/google-merchant-feed.csv` (153 products)

---

## Price Representation

### Hourly Rate Display
Since these are hourly services, not fixed-price products:

**Base Price**: Shows hourly rate
- Format: `{rate} {currency}`
- Example: `390 USD`
- Meaning: $390 per hour of service

**Estimated Range**: Uses `custom_label_2`
- Calculation: `hoursMin × hourlyRate` to `hoursTypical × hourlyRate`
- Example: `$390-$1170` (1-3 hours × $390/hour)
- Purpose: Give customers realistic project cost expectations

### Why Not Fixed Prices?
1. **Variable Duration**: Each project varies based on:
   - Material size and complexity
   - Contamination severity
   - Surface area coverage
   - Client-specific requirements

2. **Transparent Billing**: Hourly rates allow:
   - Clear cost expectations
   - Flexible project scoping
   - Pay-for-actual-time model

3. **Professional Services**: Industry standard for:
   - Technical services
   - Specialized equipment operation
   - Expert labor billing

---

## Google Merchant Center Setup

### 1. Account Creation
- **URL**: https://merchants.google.com
- **Requirements**: 
  - Google account
  - Website ownership verification
  - Business information

### 2. Feed Submission
**Method 1: Direct URL**
- Feed URL: `https://www.z-beam.com/feeds/google-merchant-feed.xml`
- Fetch schedule: Daily automatic updates

**Method 2: Manual Upload**
- Download: `public/feeds/google-merchant-feed.csv`
- Upload via Merchant Center interface

### 3. Verification Checklist
- [ ] Domain verified
- [ ] Feed uploaded successfully
- [ ] All 153 products detected
- [ ] No critical errors in diagnostics
- [ ] Pricing displays correctly
- [ ] Images load properly
- [ ] Links resolve to correct pages

### 4. Approval Timeline
- **Initial Review**: 3-7 business days
- **Status Updates**: Check "Products" → "Diagnostics"
- **Common Issues**: 
  - Image quality/size
  - Description length
  - Category mapping

---

## Schema.org Integration

### Service Schema (On-Page)
Each material page includes Service schema with:
- Service name and description
- Provider (Organization)
- Area served (North America)
- Offers with pricing
- **SKU included** (as of Dec 6, 2025)

### Example Service Schema
```json
{
  "@type": "Service",
  "@id": "https://www.z-beam.com/materials/ceramic/oxide/stoneware-laser-cleaning#service",
  "name": "Professional Laser Cleaning for Stoneware Laser Cleaning",
  "description": "On-site professional laser cleaning service...",
  "provider": {
    "@type": "Organization",
    "@id": "https://www.z-beam.com#organization",
    "name": "Z-Beam"
  },
  "serviceType": "Laser Cleaning",
  "offers": {
    "@type": "Offer",
    "sku": "ZB-PROF-CLEAN",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": 390,
      "priceCurrency": "USD",
      "unitCode": "HUR",
      "unitText": "per hour"
    }
  },
  "potentialAction": {
    "@type": "OrderAction",
    "target": "https://www.z-beam.com/contact",
    "priceSpecification": {
      "@type": "PriceSpecification",
      "minPrice": 390,
      "maxPrice": 1170,
      "priceCurrency": "USD"
    }
  }
}
```

---

## Validation & Testing

### 1. Rich Results Test
**URL**: https://search.google.com/test/rich-results

**Test URLs**:
- https://www.z-beam.com/materials/ceramic/oxide/stoneware-laser-cleaning
- https://www.z-beam.com/materials/metal/ferrous/stainless-steel-laser-cleaning

**Expected Results**:
- Service schema detected ✓
- Organization schema detected ✓
- Offer with pricing detected ✓
- SKU present ✓

### 2. Feed Validator
**URL**: https://merchants.google.com/tools/feed_rules

**Validation Points**:
- XML well-formed ✓
- All required fields present ✓
- Price format correct ✓
- URLs resolve ✓
- Images accessible ✓

### 3. Automated Post-Deployment Validation
**Integration**: Built into production deployment pipeline

**Script**: `scripts/validation/post-deployment/validate-production.js`

**Feed-Specific Checks**:
- ✅ XML feed accessibility (HTTP 200 status)
- ✅ CSV feed accessibility (HTTP 200 status)
- ✅ XML structure validation (RSS 2.0 with Google namespace)
- ✅ Product count validation (100-200 expected range)
- ✅ Required fields check (all 10 required fields present)
- ✅ Sample product validation (first 5 products)
- ✅ SKU format validation (`ZB-PROF-CLEAN-*` or `ZB-EQUIP-RENT-*`)
- ✅ Brand validation (must be "Z-Beam")
- ✅ Availability validation (must be "in stock")
- ✅ Condition validation (must be "new")
- ✅ URL validation (links must start with base URL)
- ✅ SKU uniqueness check (no duplicate SKUs)
- ✅ Service type distribution analysis

**Run Validation**:
```bash
# Full post-deployment validation (includes feeds)
npm run validate:production

# Feed validation only
npm run validate:production -- --category=feeds

# Skip feed validation
npm run validate:production -- --skip-feeds

# Verbose output with detailed errors
npm run validate:production -- --category=feeds --verbose
```

**Standalone Feed Validation**:
```bash
# Independent feed validation script
node scripts/validation/post-deployment/validate-feeds.js

# Expected output:
# ✅ XML feed accessible
# ✅ 153 products in expected range
# ✅ All required fields present
# ✅ Sample products valid
# ✅ All SKUs unique
# ✅ CSV feed accessible
```

**Exit Codes**:
- `0`: All validations passed
- `1`: Critical failures detected (feeds broken or invalid)

**Integration**:
```bash
# Runs automatically after deployment
npm run postdeploy
  → npm run validate:production
    → includes feed validation
```

### 4. Manual Verification
```bash
# Check feed is accessible
curl https://www.z-beam.com/feeds/google-merchant-feed.xml

# Verify SKU in production HTML
curl https://www.z-beam.com/materials/ceramic/oxide/stoneware-laser-cleaning | grep -o '"sku":"[^"]*"'
```

---

## Maintenance & Updates

### Feed Regeneration Triggers
1. **New Materials Added**: Run feed generator
2. **Pricing Changes**: Update `app/config/site.ts` → rebuild
3. **Service Modifications**: Update frontmatter → regenerate
4. **URL Structure Changes**: Update feed generator script

### Automated Updates (Future)
Consider adding to build process:
```json
{
  "scripts": {
    "prebuild": "node scripts/seo/generate-google-merchant-feed.js",
    "build": "next build"
  }
}
```

### Monitoring
- Check Merchant Center diagnostics weekly
- Monitor product approval status
- Track impression/click data
- Review disapproved items

---

## Business Logic

### Service Availability
**Always "in stock"** because:
- Services are not inventory-constrained
- Scheduling handled via contact/booking
- Capacity managed operationally, not in feed

### Geographic Targeting
**Area Served**: North America
- United States (primary)
- Canada (available)
- Mexico (case-by-case)

### Lead Generation Flow
1. User finds service in Google Shopping
2. Clicks through to material page
3. Reviews technical specifications
4. Sees estimated price range
5. Contacts via `/contact` or `/booking`
6. Receives custom quote based on actual needs

---

## Future Enhancements

### Phase 2: Enhanced Product Data
- [ ] Add customer ratings/reviews
- [ ] Include aggregateRating schema
- [ ] Add service guarantee information
- [ ] Include warranty/return policy

### Phase 3: Dynamic Pricing
- [ ] Regional pricing variations
- [ ] Volume discount tiers
- [ ] Seasonal promotions
- [ ] Rush service premium pricing

### Phase 4: Equipment Rental Products
- [ ] Separate SKUs for rental vs service
- [ ] Equipment specifications
- [ ] Rental duration options
- [ ] Damage deposit information

### Phase 5: Advanced Segmentation
- [ ] Industry-specific services
- [ ] Material bundle packages
- [ ] Recurring maintenance contracts
- [ ] Enterprise service agreements

---

## Compliance & Policies

### Google Merchant Center Policies
- ✓ Accurate pricing (hourly rates clearly stated)
- ✓ Clear service descriptions
- ✓ Valid contact information
- ✓ Realistic availability
- ✓ Professional imagery

### Service-Specific Considerations
1. **Not Selling Physical Goods**: Ensure feed clearly represents services
2. **Pricing Transparency**: Hourly rates + estimated ranges
3. **Lead Generation**: Optimize for quote requests, not direct checkout
4. **Local Service Ads**: Consider upgrading to LSA format

---

## Technical Architecture

### Data Flow
```
frontmatter/materials/*.yaml
    ↓ (serviceOffering.enabled)
app/config/site.ts (pricing)
    ↓
scripts/seo/generate-google-merchant-feed.js
    ↓
public/feeds/google-merchant-feed.xml
    ↓
Google Merchant Center
    ↓
Google Shopping Results
```

### Code References
1. **Pricing Config**: `app/config/site.ts` lines 45-60
2. **Service Schema**: `app/utils/schemas/SchemaFactory.ts` lines 865-940
3. **Feed Generator**: `scripts/seo/generate-google-merchant-feed.js`
4. **Material Data**: `frontmatter/materials/*.yaml`

---

## Success Metrics

### Key Performance Indicators
- **Feed Health**: 100% approved products (target)
- **Click-Through Rate**: Track from Shopping to site
- **Conversion Rate**: Contact form submissions from Shopping
- **Cost Per Lead**: Monitor if using paid Shopping ads
- **Quote Request Rate**: Material pages from Shopping traffic

### Google Merchant Center Metrics
- Impressions (search appearances)
- Clicks (site visits)
- CTR (click-through rate)
- Product views
- Cart adds (if booking implemented)

---

## Support & Resources

### Google Documentation
- [Merchant Center Help](https://support.google.com/merchants)
- [Product Data Specification](https://support.google.com/merchants/answer/7052112)
- [Services Feed Best Practices](https://support.google.com/merchants/answer/9703236)

### Internal Documentation
- Service pricing: `app/config/site.ts`
- Schema generation: `docs/seo/JSON_LD_SCHEMA.md`
- Material frontmatter: `docs/data/FRONTMATTER_SCHEMA.md`

### Contact
- **Technical Issues**: Review build logs
- **Feed Errors**: Check Merchant Center diagnostics
- **Schema Issues**: Use Rich Results Test
- **Pricing Questions**: Review `SITE_CONFIG.pricing`

---

**End of Specification**
