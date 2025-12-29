# Partners Page - Meta Tags & JSON-LD SEO Proposal

**Date:** October 17, 2025  
**Page:** http://localhost:3000/partners  
**Status:** 📋 Proposal

---

## Executive Summary

This proposal outlines a comprehensive SEO strategy for the Partners page using:
1. **Enhanced Meta Tags** for social sharing and search snippets
2. **JSON-LD Structured Data** for search engine understanding
3. **Organization & CollectionPage schemas** for partner relationships

---

## 1. Meta Tags Implementation

### Current State
```tsx
// app/partners/page.tsx
export const metadata = {
  title: `Partners | ${SITE_CONFIG.shortName}`,
  description: `Trusted partners providing laser cleaning equipment, services, and training across North America and Europe.`,
};
```

### Proposed Enhancement
```tsx
// app/partners/page.tsx
import { Metadata } from 'next';
import { SITE_CONFIG } from '@/app/config';

export const metadata: Metadata = {
  title: `Laser Cleaning Partners | ${SITE_CONFIG.shortName}`,
  description: 'Authorized laser cleaning partners across North America and Europe. Laserverse (Canada), MacK Laser Restoration (California), and Netalux (Belgium) provide equipment, services, and training.',
  keywords: [
    'laser cleaning partners',
    'Laserverse Canada',
    'MacK Laser Restoration',
    'Netalux Belgium',
    'authorized distributors',
    'laser equipment suppliers',
    'laser cleaning services',
    'professional laser training'
  ],
  
  // OpenGraph for Facebook, LinkedIn
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: `${SITE_CONFIG.url}/partners`,
    title: 'Laser Cleaning Partners - North America & Europe',
    description: 'Trusted laser cleaning partners: Laserverse (Equipment Distribution), MacK Laser (Professional Services), Netalux (Manufacturing).',
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: '/images/partners/partners-og-image.jpg', // Create composite image
        width: 1200,
        height: 630,
        alt: 'Z-Beam laser cleaning partners across North America and Europe',
      }
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Laser Cleaning Partners | Z-Beam',
    description: 'Authorized partners for laser cleaning equipment, services, and training across North America and Europe.',
    images: ['/images/partners/partners-twitter-card.jpg'],
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Geo-targeting
  alternates: {
    canonical: `${SITE_CONFIG.url}/partners`,
  },
};
```

---

## 2. JSON-LD Structured Data

### Schema Strategy

The Partners page should implement a **CollectionPage** schema with embedded **Organization** schemas for each partner.

### Proposed Implementation

#### Create: `app/utils/partners-jsonld.ts`

```typescript
import { SITE_CONFIG } from './constants';

export interface Partner {
  order: number;
  heading: string;
  text: string;
  details: string[];
  image?: {
    url: string;
    alt: string;
  };
}

/**
 * Generate comprehensive JSON-LD for Partners page
 * Implements CollectionPage + Organization schemas
 */
export function createPartnersJsonLd(partners: Partner[]) {
  const baseUrl = SITE_CONFIG.url;
  const pageUrl = `${baseUrl}/partners`;
  
  // Extract partner details from the details array
  const extractDetail = (details: string[], prefix: string): string => {
    const detail = details.find(d => d.startsWith(prefix));
    return detail ? detail.replace(prefix, '').trim() : '';
  };
  
  // Map partners to Organization schemas
  const partnerOrganizations = partners.map((partner, index) => {
    const location = extractDetail(partner.details, 'Location:');
    const region = extractDetail(partner.details, 'Region:');
    const specialization = extractDetail(partner.details, 'Specialization:');
    const websiteUrl = extractDetail(partner.details, 'Website:');
    const fullUrl = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;
    
    return {
      '@type': 'Organization',
      '@id': `${baseUrl}/partners#partner-${index + 1}`,
      name: partner.heading,
      description: partner.text,
      url: fullUrl,
      ...(partner.image && {
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}${partner.image.url}`,
          micro: partner.image.alt
        }
      }),
      address: {
        '@type': 'PostalAddress',
        addressLocality: location,
        addressRegion: region
      },
      areaServed: {
        '@type': 'Place',
        name: region
      },
      knowsAbout: specialization,
      memberOf: {
        '@type': 'Organization',
        name: SITE_CONFIG.name,
        url: baseUrl
      }
    };
  });
  
  // Main CollectionPage schema with @graph structure
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. CollectionPage (main page)
      {
        '@type': 'CollectionPage',
        '@id': pageUrl,
        url: pageUrl,
        name: 'Z-Beam Laser Cleaning Partners',
        description: 'Trusted partners providing laser cleaning equipment, services, and training across North America and Europe.',
        inLanguage: 'en-US',
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${baseUrl}#website`,
          url: baseUrl,
          name: SITE_CONFIG.name
        },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: baseUrl
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Partners',
              item: pageUrl
            }
          ]
        },
        hasPart: partnerOrganizations.map(org => ({ '@id': org['@id'] }))
      },
      
      // 2. Z-Beam as parent Organization
      {
        '@type': 'Organization',
        '@id': `${baseUrl}#organization`,
        name: SITE_CONFIG.name,
        url: baseUrl,
        description: SITE_CONFIG.description,
        member: partnerOrganizations.map(org => ({ '@id': org['@id'] }))
      },
      
      // 3. Individual partner organizations
      ...partnerOrganizations
    ]
  };
}
```

#### Update: `app/partners/page.tsx`

```tsx
// app/partners/page.tsx
import { StaticPage } from "../components/StaticPage/StaticPage";
import { SITE_CONFIG } from "@/app/config";
import { createPartnersJsonLd } from "../utils/partners-jsonld";
import { loadPageData } from "../utils/contentAPI";

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
  // ... (use enhanced metadata from section 1 above)
};

export default async function PartnersPage() {
  // Load partner data for JSON-LD
  const { components } = await loadPageData('partners');
  const partners = components.contentCards?.content || [];
  
  // Generate JSON-LD
  const jsonLd = createPartnersJsonLd(partners);
  
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd, null, 2) }}
      />
      
      {/* Page Content */}
      <StaticPage 
        slug="partners" 
        fallbackTitle="Partners"
        fallbackDescription={metadata.description}
      />
    </>
  );
}
```

---

## 3. Example JSON-LD Output

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://z-beam.com/partners",
      "url": "https://z-beam.com/partners",
      "name": "Z-Beam Laser Cleaning Partners",
      "description": "Trusted partners providing laser cleaning equipment, services, and training across North America and Europe.",
      "inLanguage": "en-US",
      "isPartOf": {
        "@type": "WebSite",
        "@id": "https://z-beam.com#website",
        "url": "https://z-beam.com",
        "name": "Z-Beam"
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://z-beam.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Partners",
            "item": "https://z-beam.com/partners"
          }
        ]
      },
      "hasPart": [
        { "@id": "https://z-beam.com/partners#partner-1" },
        { "@id": "https://z-beam.com/partners#partner-2" },
        { "@id": "https://z-beam.com/partners#partner-3" }
      ]
    },
    {
      "@type": "Organization",
      "@id": "https://z-beam.com#organization",
      "name": "Z-Beam",
      "url": "https://z-beam.com",
      "description": "Professional laser cleaning services",
      "member": [
        { "@id": "https://z-beam.com/partners#partner-1" },
        { "@id": "https://z-beam.com/partners#partner-2" },
        { "@id": "https://z-beam.com/partners#partner-3" }
      ]
    },
    {
      "@type": "Organization",
      "@id": "https://z-beam.com/partners#partner-1",
      "name": "Laserverse - Canada",
      "description": "Laserverse is North America's premier provider of advanced laser cleaning equipment and training...",
      "url": "https://laserverse.ca",
      "logo": {
        "@type": "ImageObject",
        "url": "https://z-beam.com/images/partners/partner_laserverse.png",
        "micro": "Laserverse logo - North American laser cleaning equipment distributor"
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Canada",
        "addressRegion": "North America"
      },
      "areaServed": {
        "@type": "Place",
        "name": "North America"
      },
      "knowsAbout": "Equipment Distribution & Training",
      "memberOf": {
        "@type": "Organization",
        "name": "Z-Beam",
        "url": "https://z-beam.com"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://z-beam.com/partners#partner-2",
      "name": "MacK Laser Restoration - Southern California",
      "description": "MacK Laser Restoration is Southern California's first and largest Laser Cleaning provider...",
      "url": "https://macklaserrestoration.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://z-beam.com/images/partners/partner_mack.png",
        "micro": "MacK Laser Restoration logo - Professional laser cleaning services"
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Southern California",
        "addressRegion": "Southwest United States"
      },
      "areaServed": {
        "@type": "Place",
        "name": "Southwest United States"
      },
      "knowsAbout": "Professional Laser Cleaning Services",
      "memberOf": {
        "@type": "Organization",
        "name": "Z-Beam",
        "url": "https://z-beam.com"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://z-beam.com/partners#partner-3",
      "name": "Netalux - Belgium",
      "description": "Netalux delivers award-winning technology to industries worldwide from its headquarters in Beringen, Belgium...",
      "url": "https://netalux.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://z-beam.com/images/partners/partner_netalux.png",
        "micro": "Netalux logo - European laser cleaning equipment manufacturer"
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Beringen, Belgium",
        "addressRegion": "Europe"
      },
      "areaServed": {
        "@type": "Place",
        "name": "Europe"
      },
      "knowsAbout": "Laser Cleaning Equipment Manufacturer",
      "memberOf": {
        "@type": "Organization",
        "name": "Z-Beam",
        "url": "https://z-beam.com"
      }
    }
  ]
}
```

---

## 4. SEO Benefits

### Meta Tags Benefits
- ✅ **Social Sharing**: Rich previews on Facebook, LinkedIn, Twitter
- ✅ **Search Snippets**: Better CTR with detailed descriptions
- ✅ **Geographic Targeting**: Regional keywords for local discovery
- ✅ **Partner Brand Visibility**: Named partners in meta descriptions

### JSON-LD Benefits
- ✅ **Knowledge Graph**: Partners may appear in Google Knowledge Panel
- ✅ **Entity Recognition**: Search engines understand partner relationships
- ✅ **Rich Results**: Potential for enhanced search listings
- ✅ **Structured Navigation**: Breadcrumbs in search results
- ✅ **Geographic Signals**: Location data for local SEO

---

## 5. Required Assets

### Social Media Images
Create the following images for optimal social sharing:

1. **OpenGraph Image** (`/images/partners/partners-og-image.jpg`)
   - Dimensions: 1200×630px
   - Content: Composite of 3 partner logos + "Z-Beam Partners" text
   - Format: JPG, optimized for web

2. **Twitter Card Image** (`/images/partners/partners-twitter-card.jpg`)
   - Dimensions: 1200×675px (or use same as OG)
   - Content: Similar to OG image
   - Format: JPG, optimized for web

### Alternative: Use Existing Hero Image
If creating composite images is not feasible, use an existing professional image:
```tsx
images: [
  {
    url: '/images/partners/partners_hero.jpg',
    width: 1200,
    height: 630,
    alt: 'Professional laser cleaning equipment and services',
  }
]
```

---

## 6. Implementation Checklist

### Phase 1: Meta Tags (Quick Win)
- [ ] Update `app/partners/page.tsx` with enhanced metadata
- [ ] Create or identify social sharing images
- [ ] Add keywords array for search targeting
- [ ] Test OpenGraph tags with [Facebook Debugger](https://developers.facebook.com/tools/debug/)
- [ ] Test Twitter Cards with [Twitter Card Validator](https://cards-dev.twitter.com/validator)

### Phase 2: JSON-LD (Rich Results)
- [ ] Create `app/utils/partners-jsonld.ts` helper
- [ ] Update `app/partners/page.tsx` to include JSON-LD script
- [ ] Extract partner data from `contentCards` component
- [ ] Test JSON-LD with [Google Rich Results Test](https://search.google.com/test/rich-results)
- [ ] Test JSON-LD with [Schema Markup Validator](https://validator.schema.org/)

### Phase 3: Validation & Monitoring
- [ ] Verify all partner URLs are clickable
- [ ] Check mobile rendering of enhanced meta tags
- [ ] Submit sitemap to Google Search Console
- [ ] Monitor Search Console for rich result eligibility
- [ ] Track CTR improvements in analytics

---

## 7. Expected Search Result Enhancement

### Before (Basic Meta)
```
Partners | Z-Beam
Trusted partners providing laser cleaning equipment, services, and 
training across North America and Europe.
https://z-beam.com/partners
```

### After (Enhanced Meta + JSON-LD)
```
Laser Cleaning Partners - North America & Europe | Z-Beam
Home > Partners
Authorized laser cleaning partners: Laserverse (Canada - Equipment 
Distribution), MacK Laser Restoration (California - Professional 
Services), Netalux (Belgium - Manufacturing). Training & support.
https://z-beam.com/partners
[Partner logos may appear in rich results]
```

---

## 8. Related Documentation

- [METADATA_EEAT_OPTIMIZATION.md](../systems/METADATA_EEAT_OPTIMIZATION.md) - General E-E-A-T principles
- [JSONLD_COMPONENT_UPDATE_SUMMARY.md](../JSONLD_COMPONENT_UPDATE_SUMMARY.md) - JSON-LD implementation patterns
- [PARTNERS_PAGE_ENHANCEMENT.md](./PARTNERS_PAGE_ENHANCEMENT.md) - Partners page structure

---

## 9. Notes

- **CollectionPage** is the appropriate schema type for a page listing multiple organizations
- **Organization** schemas include `memberOf` to show relationship with Z-Beam
- **Address** and **areaServed** provide geographic SEO signals
- **Logo** images help with visual identification in rich results
- **Breadcrumbs** improve navigation in search results

---

## Approval & Next Steps

**Recommended Approach:**
1. Implement Meta Tags first (immediate social sharing benefit)
2. Add JSON-LD second (rich results take time to appear)
3. Create optimized social images for maximum impact

**Estimated Effort:**
- Meta Tags: 15 minutes
- JSON-LD Helper: 30 minutes
- Social Images: 1-2 hours (design time)
- Testing & Validation: 30 minutes

**Total:** ~2.5-3 hours for complete implementation

