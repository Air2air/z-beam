# Font Configuration

## Overview

All fonts are centrally managed in one location for easy maintenance and optimization. The application uses **Roboto** as the primary font, loaded via Next.js font optimization.

## Architecture

### 1. Central Configuration File
**Location**: `app/config/fonts.ts`

This file is the **single source of truth** for all font configuration:
- Imports fonts from `next/font/google`
- Defines font weights, subsets, and display properties
- Exports CSS variables for Tailwind integration
- Provides fallback fonts for improved performance

### 2. Font Loading Strategy

```typescript
import { Roboto } from 'next/font/google';

export const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
});
```

**Benefits:**
- ✅ **Zero layout shift** - `font-display: swap` prevents invisible text
- ✅ **Self-hosted** - Fonts served from your domain (no external requests)
- ✅ **Automatic subsetting** - Only loads characters you actually use
- ✅ **Performance** - Optimized for Core Web Vitals
- ✅ **Privacy** - No data sent to Google Fonts servers

### 3. Application in Root Layout
**Location**: `app/layout.tsx`

```typescript
import { roboto } from "./config/fonts";

<body className={`${roboto.className} ...`}>
```

The font className is applied directly to the body element, making Roboto the default font for the entire application automatically. No need to add font classes to individual components!

### 4. CSS Documentation
**Location**: `app/css/global.css`

Includes comprehensive comments about font configuration for developer reference.

## Available Font Weights

Use these Tailwind classes throughout your app:

| Tailwind Class | Weight | Use Case |
|----------------|--------|----------|
| `font-thin` | 100 | Very light text, decorative |
| `font-light` | 300 | Body text, subtle emphasis |
| `font-normal` | 400 | Default body text |
| `font-medium` | 500 | Subheadings, emphasis |
| `font-bold` | 700 | Headings, strong emphasis |
| `font-black` | 900 | Extra strong emphasis |

## Usage Examples

### In Components

```tsx
// Roboto is applied by default - no font-family needed!
<p>Regular text uses Roboto automatically</p>

// Just control the weight with Tailwind classes
<h1 className="font-light">Light heading</h1>
<p className="font-normal">Regular text</p>
<strong className="font-bold">Bold text</strong>

// No need to import or configure anything!
// Roboto is the default font for everything
```

### Why This Works

The font is applied via `className` directly on the `<body>` element in `layout.tsx`, which means:
- ✅ All text automatically uses Roboto
- ✅ No need to add font classes to every component
- ✅ Just use font-weight classes (font-light, font-bold, etc.)
- ✅ Cleaner, simpler code

## Adding Additional Fonts

If you need to add more fonts in the future:

1. **Add to `app/config/fonts.ts`:**
```typescript
import { Roboto_Mono } from 'next/font/google';

export const robotoMono = Roboto_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
});
```

2. **Apply in `app/layout.tsx`:**
```typescript
// For the primary font, just use className
<body className={`${roboto.className} ...`}>

// For additional fonts, you can use them on specific elements
// Example: <code className={robotoMono.className}>code</code>
```

## Performance Considerations

### Preloading
Fonts are automatically preloaded by Next.js for optimal performance.

### Subsetting
Next.js automatically:
- Analyzes your pages
- Determines which characters are used
- Creates optimized font files with only those characters
- Reduces font file size by up to 90%

### Caching
Font files are:
- Self-hosted on your domain
- Cached indefinitely (immutable)
- Served with optimal cache headers

## Migration from Previous Setup

**Before:**
- No explicit `@font-face` declarations
- Relied on system fonts via Tailwind defaults
- Commented-out Geist font imports

**After:**
- ✅ Single source of truth in `app/config/fonts.ts`
- ✅ Optimized Roboto font loading
- ✅ Consistent typography across the app
- ✅ Better performance and privacy

## Troubleshooting

### Font not loading?
1. Check that `app/config/fonts.ts` is imported in `layout.tsx`
2. Verify the CSS variable is applied to the `<body>` element
3. Check browser DevTools Network tab for font requests
4. Clear `.next` cache: `rm -rf .next && npm run dev`

### Wrong font displaying?
1. Verify Tailwind config has the correct `fontFamily` configuration
2. Check for conflicting CSS with higher specificity
3. Inspect element in DevTools to see computed font-family

### Performance issues?
1. Reduce number of font weights if not needed
2. Consider using `display: 'optional'` for non-critical fonts
3. Check font file sizes in Network tab

## Resources

- [Next.js Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- [Google Fonts](https://fonts.google.com/specimen/Roboto)
- [Web Font Best Practices](https://web.dev/font-best-practices/)
