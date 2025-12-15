# SITE_CONFIG Centralized Configuration Guide

## 📋 Overview

The Z-Beam application uses a **centralized configuration system** called `SITE_CONFIG` to manage all site-wide settings, URLs, company information, and schema.org metadata. This approach provides a **single source of truth** for all configuration values used throughout the application.

## 🎯 Purpose

**SITE_CONFIG centralizes:**
- Company name and branding
- Contact information (email, phone, address)
- Social media URLs
- Site URLs and canonical links
- Schema.org structured data contexts
- Email configuration
- Validation patterns
- User-facing messages

**Benefits:**
- ✅ **Single Source of Truth** - Update once, propagates everywhere
- ✅ **Consistency** - All references use identical values
- ✅ **Maintainability** - No need to search/replace across files
- ✅ **Type Safety** - TypeScript ensures correct usage
- ✅ **Easy Rebranding** - Change company name in one place
- ✅ **Environment Management** - Can extend for dev/staging/production

## 📍 Location

**File:** `app/utils/constants.ts`

**Import:**
```typescript
import { SITE_CONFIG } from '@/app/utils/constants';
// or
import { SITE_CONFIG } from '../utils/constants';
// or
import { SITE_CONFIG } from '../../utils/constants';
```

## 🏗️ Structure

### Core Identity

```typescript
SITE_CONFIG = {
  // Company Identity
  name: 'Z-Beam Laser Cleaning',          // Full company name
  shortName: 'Z-Beam',                     // Short brand name
  author: 'Z-Beam',                        // Default content author
  description: 'Advanced laser cleaning...' // Site description
  
  // URLs
  url: process.env.NEXT_PUBLIC_BASE_URL || 'https://z-beam.com',
  
  // Contact Information
  contact: {
    general: { email: '...', phone: '...', phoneHref: '...' },
    sales: { email: '...', phone: '...', phoneHref: '...' },
    support: { email: '...', phone: '...', phoneHref: '...' }
  },
  
  // ... (see full structure below)
}
```

### Complete SITE_CONFIG Fields

#### **1. Identity & Branding**
```typescript
name: string;              // Full company name
shortName: string;         // Brand abbreviation
author: string;            // Default author for content
description: string;       // Site meta description
```

#### **2. Contact Information**
```typescript
contact: {
  general: {
    email: string;         // General inquiries email
    phone: string;         // Display phone number
    phoneHref: string;     // tel: link format
  },
  sales: { /* same structure */ },
  support: { /* same structure */ }
}
```

#### **3. Address**
```typescript
address: {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  company: string;         // Legal company name
}
```

#### **4. Business Hours**
```typescript
hours: {
  weekday: string;         // "Monday - Friday: 9:00 AM - 5:00 PM PST"
  weekend: string;         // "Saturday - Sunday: Closed"
  timezone: string;        // "PST"
}
```

#### **5. Response Time**
```typescript
responseTime: {
  general: string;         // "within 24 hours"
  urgent: string;          // "within 2 hours"
}
```

#### **6. Social Media**
```typescript
social: {
  twitter: string;         // Handle only (e.g., "@zbeam")
  twitterUrl: string;      // Full URL
  facebook: string;        // Handle only
  facebookUrl: string;     // Full URL
  linkedin: string;        // Handle only
  linkedinUrl: string;     // Full URL
  youtube: string;         // Channel identifier
  youtubeUrl: string;      // Full URL
}
```

#### **7. Media Assets**
```typescript
media: {
  youtube: {
    baseUrl: string;       // YouTube embed base
    defaultParams: string; // Default query params
  },
  logo: {
    default: string;       // Primary logo path
    white: string;         // White variant
    dark: string;          // Dark variant
  },
  favicon: {
    svg: string;           // SVG favicon
    png: string;           // PNG favicon
    apple: string;         // Apple touch icon
  }
}
```

#### **8. Email Configuration**
```typescript
emailConfig: {
  fromAddress: string;     // Sender email with name
  toAddresses: string[];   // Recipient emails
  brandColor: string;      // Hex color for email templates
  replyToMessage: string;  // Auto-reply message
}
```

#### **9. Validation Patterns**
```typescript
validation: {
  emailRegex: RegExp;      // Email validation pattern
  phoneRegex: RegExp;      // Phone validation pattern
}
```

#### **10. User Messages**
```typescript
messages: {
  success: {
    contact: string;       // Contact form success
    newsletter: string;    // Newsletter success
  },
  error: {
    contact: string;       // Contact form error
    newsletter: string;    // Newsletter error
    validation: string;    // Validation error
  }
}
```

#### **11. Schema.org Configuration**
```typescript
schema: {
  context: string;         // "https://schema.org"
  organizationType: string; // "Organization"
  websiteType: string;     // "WebSite"
  articleType: string;     // "Article"
  propertyValueType: string; // "PropertyValue"
}
```

#### **12. SEO Keywords**
```typescript
keywords: string[];        // Default SEO keywords array
```

## 💻 Usage Examples

### **1. Page Metadata**

**Before (Hardcoded):**
```typescript
export const metadata = {
  title: 'Contact Z-Beam',
  description: 'Get in touch with Z-Beam\'s team...'
};
```

**After (Centralized):**
```typescript
import { SITE_CONFIG } from '../utils/constants';

export const metadata = {
  title: `Contact ${SITE_CONFIG.shortName}`,
  description: `Get in touch with ${SITE_CONFIG.shortName}'s team...`
};
```

### **2. Schema.org Structured Data**

**Before (Hardcoded):**
```typescript
const schema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Z-Beam',
  url: 'https://z-beam.com'
};
```

**After (Centralized):**
```typescript
import { SITE_CONFIG } from '../utils/constants';

const schema = {
  '@context': SITE_CONFIG.schema.context,
  '@type': SITE_CONFIG.schema.organizationType,
  name: SITE_CONFIG.shortName,
  url: SITE_CONFIG.url
};
```

### **3. Contact Information Display**

**Before (Hardcoded):**
```typescript
<a href="mailto:info@z-beam.com">info@z-beam.com</a>
<a href="tel:+16505905040">(650) 590-5040</a>
```

**After (Centralized):**
```typescript
import { SITE_CONFIG } from '../../utils/constants';

<a href={`mailto:${SITE_CONFIG.contact.general.email}`}>
  {SITE_CONFIG.contact.general.email}
</a>
<a href={SITE_CONFIG.contact.general.phoneHref}>
  {SITE_CONFIG.contact.general.phone}
</a>
```

### **4. Social Media Links**

**Before (Hardcoded):**
```typescript
<a href="https://twitter.com/@zbeam">Twitter</a>
<a href="https://facebook.com/zbeam">Facebook</a>
```

**After (Centralized):**
```typescript
import { SITE_CONFIG } from '../../utils/constants';

<a href={SITE_CONFIG.social.twitterUrl}>Twitter</a>
<a href={SITE_CONFIG.social.facebookUrl}>Facebook</a>
```

### **5. Logo and Images**

**Before (Hardcoded):**
```typescript
<Image src="/images/logo/logo_.png" alt="Z-Beam logo" />
```

**After (Centralized):**
```typescript
import { SITE_CONFIG } from '../../utils/constants';

<Image 
  src={SITE_CONFIG.media.logo.default} 
  alt={`${SITE_CONFIG.shortName} logo`} 
/>
```

### **6. Canonical URLs**

**Before (Hardcoded):**
```typescript
canonical: `https://z-beam.com/${slug}`
```

**After (Centralized):**
```typescript
import { SITE_CONFIG } from '../utils/constants';

canonical: `${SITE_CONFIG.url}/${slug}`
```

### **7. Author Fallbacks**

**Before (Hardcoded):**
```typescript
author: data.author || 'Z-Beam Technical Team'
```

**After (Centralized):**
```typescript
import { SITE_CONFIG } from './constants';

author: data.author || SITE_CONFIG.author  // Preserves article authors!
```

## 🔒 Best Practices

### **DO:**
- ✅ Always import and use `SITE_CONFIG` for site-wide values
- ✅ Use template literals for dynamic strings: `` `${SITE_CONFIG.shortName} - Title` ``
- ✅ Preserve article-specific authors (use SITE_CONFIG.author only as fallback)
- ✅ Use `SITE_CONFIG.schema.context` for all schema.org URLs
- ✅ Test that SITE_CONFIG values are used correctly

### **DON'T:**
- ❌ Hardcode company names, URLs, or contact info
- ❌ Copy/paste email addresses or phone numbers
- ❌ Hardcode 'https://schema.org' - use `SITE_CONFIG.schema.context`
- ❌ Hardcode 'Z-Beam' - use `SITE_CONFIG.shortName` or `SITE_CONFIG.name`
- ❌ Overwrite article authors with site default author

## 🎨 Component Patterns

### **Page Component**
```typescript
import { SITE_CONFIG } from '../utils/constants';

export const metadata = {
  title: `Page Title | ${SITE_CONFIG.shortName}`,
  description: `Description mentioning ${SITE_CONFIG.shortName}...`
};

export default function Page() {
  return (
    <Layout title={`${SITE_CONFIG.name} - Page Title`}>
      <ContactInfo config={SITE_CONFIG} />
    </Layout>
  );
}
```

### **Metadata Helper**
```typescript
import { SITE_CONFIG } from './constants';

export function createMetadata(metadata: ArticleMetadata) {
  const formattedTitle = metadata.title && !metadata.title.includes(SITE_CONFIG.shortName)
    ? `${metadata.title} | ${SITE_CONFIG.shortName}`
    : metadata.title || SITE_CONFIG.shortName;
    
  return {
    title: formattedTitle,
    description: metadata.description,
    // ...
  };
}
```

### **JSON-LD Schema**
```typescript
import { SITE_CONFIG } from './constants';

export function createSchema(data: any) {
  return {
    '@context': SITE_CONFIG.schema.context,
    '@type': SITE_CONFIG.schema.organizationType,
    name: SITE_CONFIG.shortName,
    url: SITE_CONFIG.url,
    author: {
      '@type': 'Person',
      name: data.author || SITE_CONFIG.author  // Fallback only
    }
  };
}
```

## 🧪 Testing with SITE_CONFIG

### **Test Pattern**
```typescript
import { SITE_CONFIG } from '@/app/utils/constants';

describe('Component with SITE_CONFIG', () => {
  it('should use SITE_CONFIG for company name', () => {
    const { container } = render(<Component />);
    expect(container.textContent).toContain(SITE_CONFIG.shortName);
  });
  
  it('should use SITE_CONFIG for canonical URL', () => {
    const metadata = generateMetadata();
    expect(metadata.canonical).toContain(SITE_CONFIG.url);
  });
  
  it('should preserve article author over SITE_CONFIG.author', () => {
    const schema = createSchema({ author: 'John Doe' });
    expect(schema.author.name).toBe('John Doe');
    expect(schema.author.name).not.toBe(SITE_CONFIG.author);
  });
});
```

## 🔄 Migration Notes

### **What Changed (October 2025)**

All hardcoded site configuration values were migrated to `SITE_CONFIG`:

**Files Updated:** 20+
- Page files (contact, about, services, home, slug)
- Utility files (jsonld-schema, metadata, materials/metadata)
- Component files (Micro, JsonLD, Author, Hero, Layout, etc.)

**Key Changes:**
1. All "Z-Beam" references → `SITE_CONFIG.shortName` or `SITE_CONFIG.name`
2. All "https://schema.org" → `SITE_CONFIG.schema.context`
3. All "z-beam.com" → `SITE_CONFIG.url`
4. All contact info → `SITE_CONFIG.contact.*`
5. All social URLs → `SITE_CONFIG.social.*Url`

**Author Handling:**
- ✅ Article authors are **preserved**
- ✅ `SITE_CONFIG.author` is used **only as fallback** when no author specified
- ✅ Pattern: `data.author || SITE_CONFIG.author`

## 🌍 Environment-Specific Configuration

### **Production vs Development**

The `SITE_CONFIG.url` uses environment variables:

```typescript
url: process.env.NEXT_PUBLIC_BASE_URL || 'https://z-beam.com'
```

**Set in `.env.local`:**
```bash
# Development
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Production (already set by Vercel)
NEXT_PUBLIC_BASE_URL=https://z-beam.com
```

### **Extending for Multiple Environments**

To support dev/staging/production:

```typescript
// app/utils/constants.ts
const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  
  return {
    url: baseUrl || (env === 'production' ? 'https://z-beam.com' : 'http://localhost:3000'),
    // ... other environment-specific settings
  };
};

export const SITE_CONFIG = {
  ...getEnvironmentConfig(),
  // ... rest of config
};
```

## 📦 Related Files

- **Source:** `app/utils/constants.ts`
- **Navigation:** `app/config/navigation.ts`
- **Types:** `types/centralized.ts`
- **Tests:** `tests/utils/constants.test.js`

## 🔗 Related Documentation

- [Business Configuration Guide](./BUSINESS_CONFIGURATION_GUIDE.md)
- [Developer Guide](../development/DEVELOPER_GUIDE.md)
- [Contact Form README](./CONTACT_FORM_README.md)
- [Type System Architecture](../architecture/type-system.md)

## ❓ FAQ

### **Q: When should I use SITE_CONFIG vs hardcoding?**
A: **Always use SITE_CONFIG** for any site-wide value that could change or needs consistency. Only hardcode truly static, one-off values specific to a single component.

### **Q: How do I add a new configuration field?**
A: Add it to `SITE_CONFIG` in `app/utils/constants.ts`, then use it throughout the app. Consider adding TypeScript types if needed.

### **Q: What if I need different values per page?**
A: Use SITE_CONFIG as the base, then override in page-specific metadata. Example:
```typescript
title: pageData.title || `Default | ${SITE_CONFIG.shortName}`
```

### **Q: Should test mocks use SITE_CONFIG?**
A: **Yes!** Import and use SITE_CONFIG in tests to ensure tests validate the actual configuration system.

### **Q: What about article authors?**
A: **Always preserve article authors.** Use pattern: `data.author || SITE_CONFIG.author` to provide fallback only when author is missing.

### **Q: Can I use SITE_CONFIG in client components?**
A: **Yes!** SITE_CONFIG is a standard ES6 export and works in both server and client components.

---

**Last Updated:** October 3, 2025
**Contributors:** AI Assistant (SITE_CONFIG Centralization Initiative)
