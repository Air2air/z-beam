# International Discoverability Strategy

**Date:** November 29, 2025  
**Focus:** Making Z-Beam more discoverable internationally  
**Current State:** English-only (en-US), Bay Area focused

---

## 📊 Current International SEO Status

### ✅ What's Already Working
- **HTML lang attribute:** `<html lang="en">` properly declared
- **Open Graph locale:** `locale: 'en_US'` on all pages
- **inLanguage:** JSON-LD schemas include `"inLanguage": "en-US"`
- **UTF-8 encoding:** Proper character encoding set
- **International contact support:** Schema includes `availableLanguage` field
- **Geo-coordinates:** Structured data includes location (San Jose, CA)

### ❌ What's Missing for International Discovery
- **No hreflang tags** - No language/region alternatives declared
- **No language switcher** - Single English version only
- **No regional targeting** - Content not adapted for different markets
- **No international domains** - Only www.z-beam.com
- **Limited geo-targeting** - "Bay Area" focus limits international reach

---

## 🌍 Three-Tier International Strategy

### Tier 1: Technical SEO (Immediate - 2-4 hours)
**Goal:** Make current English content discoverable internationally

#### 1.1 Add hreflang Tags
```tsx
// app/layout.tsx or page metadata
export const metadata = {
  alternates: {
    canonical: 'https://www.z-beam.com',
    languages: {
      'en-US': 'https://www.z-beam.com',
      'en-GB': 'https://www.z-beam.com',
      'en-CA': 'https://www.z-beam.com',
      'en-AU': 'https://www.z-beam.com',
      'x-default': 'https://www.z-beam.com' // Fallback for unmatched regions
    }
  }
}
```

**Why:** Tells Google that English content applies to multiple English-speaking markets

#### 1.2 Update JSON-LD Schema
```tsx
// app/utils/jsonld-helper.ts
{
  "@type": "WebPage",
  "inLanguage": ["en-US", "en-GB", "en-CA", "en-AU"],
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.z-beam.com/search?q={search_term}",
      "actionPlatform": [
        "http://schema.org/DesktopWebPlatform",
        "http://schema.org/MobileWebPlatform"
      ]
    }
  }
}
```

#### 1.3 Expand Service Area in Structured Data
```tsx
// Update Organization schema
{
  "@type": "Organization",
  "areaServed": [
    {
      "@type": "Country",
      "name": "United States"
    },
    {
      "@type": "Country", 
      "name": "Canada"
    },
    {
      "@type": "Country",
      "name": "United Kingdom"
    },
    {
      "@type": "Country",
      "name": "Australia"
    }
  ],
  "availableLanguage": ["en-US", "en-GB", "en-CA", "en-AU"]
}
```

#### 1.4 Add International Contact Options
```tsx
// app/contact/page.tsx - Add international inquiry form field
{
  "@type": "ContactPoint",
  "contactType": "International Inquiries",
  "telephone": SITE_CONFIG.contact.general.phoneHref,
  "email": SITE_CONFIG.contact.general.email,
  "availableLanguage": ["en"],
  "areaServed": ["Worldwide"],
  "hoursAvailable": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "08:00",
    "closes": "17:00",
    "timeZone": "America/Los_Angeles"
  }
}
```

---

### Tier 2: Content Adaptation (1-2 weeks)
**Goal:** Adapt existing English content for international audiences

#### 2.1 Create International Landing Pages
```
app/
  international/
    page.tsx               # International services overview
    canada/page.tsx        # Canadian market
    uk/page.tsx           # UK market
    australia/page.tsx    # Australian market
    europe/page.tsx       # European market
```

**Content Focus:**
- Regional regulations (CE marking, OSHA vs HSE)
- Metric vs Imperial units
- Regional case studies
- Local distributor/partner information
- Time zone adjusted contact hours

#### 2.2 Add Regional Metadata
```tsx
// app/international/canada/page.tsx
export const metadata = {
  title: 'Laser Cleaning Services | Canada | Z-Beam',
  description: 'Industrial laser cleaning solutions for Canadian manufacturers. CSA certified, metric specifications.',
  alternates: {
    canonical: 'https://www.z-beam.com/international/canada',
    languages: {
      'en-CA': 'https://www.z-beam.com/international/canada'
    }
  },
  openGraph: {
    locale: 'en_CA'
  }
}
```

#### 2.3 Unit Conversion Utility
```tsx
// app/utils/units.ts
export const convertUnits = (value: number, from: 'imperial' | 'metric', to: 'imperial' | 'metric') => {
  // Temperature: °F ↔ °C
  // Distance: inches ↔ mm
  // Pressure: PSI ↔ bar
  // Power: watts (same globally)
};

// Component usage
<SettingValue 
  value={setting.value}
  unit={userLocale === 'en-US' ? 'imperial' : 'metric'}
/>
```

#### 2.4 Localized Material Names
```yaml
# frontmatter/materials/aluminum.yaml
name: Aluminum
aliases:
  en-GB: Aluminium
  en-US: Aluminum
  en-CA: Aluminum
  en-AU: Aluminium
```

---

### Tier 3: Full Internationalization (2-3 months)
**Goal:** Multi-language support with localized content

#### 3.1 Next.js i18n Configuration
```ts
// next.config.js
module.exports = {
  i18n: {
    locales: ['en-US', 'en-GB', 'en-CA', 'es', 'fr', 'de', 'zh'],
    defaultLocale: 'en-US',
    localeDetection: true, // Auto-detect user locale
    domains: [
      {
        domain: 'z-beam.com',
        defaultLocale: 'en-US',
      },
      {
        domain: 'z-beam.co.uk',
        defaultLocale: 'en-GB',
      },
      {
        domain: 'z-beam.com.au',
        defaultLocale: 'en-AU',
      }
    ]
  }
};
```

#### 3.2 Translation File Structure
```
app/
  locales/
    en-US/
      common.json
      materials.json
      settings.json
    es/
      common.json
      materials.json
      settings.json
    fr/
      common.json
      ...
```

#### 3.3 Translation Component
```tsx
// app/components/Translate.tsx
import { useTranslation } from 'next-i18next';

export function Translate({ key }: { key: string }) {
  const { t } = useTranslation();
  return <>{t(key)}</>;
}

// Usage
<Translate key="materials.aluminum.description" />
```

#### 3.4 Language Switcher Component
```tsx
// app/components/LanguageSwitcher.tsx
export function LanguageSwitcher() {
  const router = useRouter();
  const { locale, locales } = router;
  
  return (
    <select 
      value={locale}
      onChange={(e) => router.push(router.pathname, router.asPath, { locale: e.target.value })}
    >
      {locales?.map(loc => (
        <option key={loc} value={loc}>
          {getLanguageName(loc)}
        </option>
      ))}
    </select>
  );
}
```

---

## 🎯 Priority: Quick Wins (Tier 1 Implementation)

### Phase 1A: Add hreflang (1 hour)
**Impact:** High - Immediate international SEO benefit  
**Effort:** Low

```tsx
// app/utils/metadata.ts
export function generateMetadata({ canonical, locale = 'en-US' }) {
  return {
    alternates: {
      canonical,
      languages: {
        'en-US': canonical,
        'en-GB': canonical,
        'en-CA': canonical,
        'en-AU': canonical,
        'x-default': canonical
      }
    },
    openGraph: {
      locale: locale.replace('-', '_'),
      alternateLocale: ['en_US', 'en_GB', 'en_CA', 'en_AU']
    }
  };
}
```

**Apply to all pages:**
- ✅ Homepage
- ✅ Material pages
- ✅ Settings pages
- ✅ Services pages
- ✅ Static pages (about, contact, etc.)

### Phase 1B: Expand Schema areaServed (30 mins)
**Impact:** Medium - Signals international availability  
**Effort:** Low

```tsx
// app/config/business-config.ts
export const BUSINESS_CONFIG = {
  service: {
    areaServed: [
      { type: 'Country', name: 'United States' },
      { type: 'Country', name: 'Canada' },
      { type: 'Country', name: 'United Kingdom' },
      { type: 'Country', name: 'Australia' },
      { type: 'Country', name: 'Germany' },
      { type: 'Country', name: 'France' },
      { type: 'Country', name: 'Japan' }
    ]
  }
};
```

### Phase 1C: International Contact Form Field (1 hour)
**Impact:** Medium - Shows international openness  
**Effort:** Low

```tsx
// app/contact/page.tsx
<select name="region" required>
  <option value="north-america">North America</option>
  <option value="europe">Europe</option>
  <option value="asia-pacific">Asia Pacific</option>
  <option value="middle-east">Middle East</option>
  <option value="latin-america">Latin America</option>
  <option value="africa">Africa</option>
</select>
```

### Phase 1D: Update Sitemap (30 mins)
**Impact:** Low-Medium - Better crawling  
**Effort:** Low

```tsx
// app/sitemap.ts
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.z-beam.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages: {
          'en-US': 'https://www.z-beam.com',
          'en-GB': 'https://www.z-beam.com',
          'en-CA': 'https://www.z-beam.com',
          'en-AU': 'https://www.z-beam.com'
        }
      }
    }
    // ... more pages
  ];
}
```

---

## 📊 Expected Impact

### Short-term (Tier 1 - 1 month)
- **+15-25% international organic traffic** - From English-speaking markets
- **Google Search Console coverage** - Site appears in international search results
- **Better geo-targeting** - Google understands multi-market relevance

### Mid-term (Tier 2 - 3 months)
- **+30-50% international leads** - From targeted regional pages
- **Reduced bounce rate** - Regional content matches user expectations
- **Higher conversion** - Localized units, regulations, case studies

### Long-term (Tier 3 - 6-12 months)
- **+100-200% international traffic** - Multi-language content
- **New market penetration** - Non-English speaking markets
- **Global brand presence** - Recognized internationally

---

## 🛠️ Implementation Plan

### Week 1: Tier 1 Technical SEO (Total: 3 hours)
- [ ] Add hreflang tags to layout/metadata utility (1 hour)
- [ ] Update Organization schema with international areaServed (30 mins)
- [ ] Add international contact form field (1 hour)
- [ ] Update sitemap with language alternates (30 mins)
- [ ] Test with Google Rich Results Test

### Week 2-3: Tier 2 Content Adaptation (Total: 20-30 hours)
- [ ] Create /international landing page (4 hours)
- [ ] Create regional pages (Canada, UK, Australia, Europe) (8 hours)
- [ ] Add unit conversion utility (4 hours)
- [ ] Update material frontmatter with regional aliases (4 hours)
- [ ] Add regional case studies (if available) (8 hours)

### Month 2-3: Tier 3 Full i18n (Total: 80-120 hours)
- [ ] Set up next-i18next or similar library (8 hours)
- [ ] Extract all text strings to translation files (20 hours)
- [ ] Translate to priority languages (Spanish, French, German) (30 hours)
- [ ] Implement language switcher component (4 hours)
- [ ] Update all components for translation support (20 hours)
- [ ] QA testing for all languages (20 hours)

---

## 🚀 Recommended Starting Point

### Immediate Action (Next Session):
**Implement Phase 1A: Add hreflang tags**

Benefits:
- ✅ Takes only 1 hour
- ✅ Zero risk (pure metadata addition)
- ✅ Immediate SEO benefit
- ✅ Foundation for future internationalization
- ✅ Signals multi-market intent to Google

**Files to modify:**
1. `app/utils/metadata.ts` - Add hreflang generation utility
2. `app/layout.tsx` - Add alternates to root layout
3. `app/page.tsx` - Apply to homepage
4. `app/materials/[category]/[subcategory]/[slug]/page.tsx` - Apply to material pages
5. `app/settings/[category]/[subcategory]/[slug]/page.tsx` - Apply to settings pages
6. `app/services/page.tsx` - Apply to services
7. `app/sitemap.ts` - Add language alternates

**Testing:**
```bash
# After implementation
curl -s https://www.z-beam.com | grep "hreflang"
# Should see: <link rel="alternate" hreflang="en-US" href="..." />

# Google Rich Results Test
npm run validate:seo-infrastructure
```

---

## 📚 Resources

### Next.js i18n Documentation
- https://nextjs.org/docs/advanced-features/i18n-routing
- https://next-intl-docs.vercel.app/

### Google International SEO
- https://developers.google.com/search/docs/specialty/international
- https://support.google.com/webmasters/answer/189077

### hreflang Tag Implementation
- https://developers.google.com/search/docs/specialty/international/localized-versions

---

## ✅ Success Metrics

### Technical Validation
- [ ] hreflang tags present on all pages
- [ ] Google Search Console shows international coverage
- [ ] Rich Results Test passes for all locales
- [ ] Sitemap includes language alternates

### Traffic Metrics (3-6 months post-implementation)
- [ ] International organic traffic increase (target: +20%)
- [ ] Non-US countries in top 10 traffic sources
- [ ] Reduced bounce rate from international visitors
- [ ] International contact form submissions

### SEO Metrics
- [ ] Rankings in google.co.uk, google.ca, google.com.au
- [ ] "laser cleaning" searches from international IPs
- [ ] International featured snippets
- [ ] International backlinks

---

**Status:** Ready for implementation  
**Recommendation:** Start with Phase 1A (hreflang tags) - 1 hour, high impact  
**Next Steps:** Implement Phase 1A, monitor Search Console for 2-4 weeks, then proceed to Phase 1B-D
