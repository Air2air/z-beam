# Font Configuration

## Overview

All fonts are centrally managed in one location for easy maintenance and optimization. The application uses **Geist** as the primary font with a **14px base size** and **relative font scaling**.

## Architecture

### 1. Central Configuration File
**Location**: `app/config/fonts.ts`

This file is the **single source of truth** for all font configuration:
- Imports fonts from `geist/font/sans`
- Defines base font size (14px) and line height (24px)
- Exports CSS variables for Tailwind integration
- All other font sizes scale relative to base using `em` units

### 2. Font Configuration

```typescript
import { GeistSans } from 'geist/font/sans';

export const FONT_CONFIG = {
  primary: 'Geist',
  baseFontSize: '0.875rem',  // 14px base
  baseLineHeight: '1.625rem', // 26px
  fallback: ['system-ui', 'sans-serif'],
} as const;

export const fontConfig = {
  className: GeistSans.className,
  variable: GeistSans.variable,
};
```

**Benefits:**
- ✅ **Single source of truth** - All sizes derive from base
- ✅ **Relative scaling** - Font sizes use `em` units (scale with base)
- ✅ **Modern design** - Geist is Vercel's system font
- ✅ **Performance** - Self-hosted via npm package
- ✅ **Flexibility** - Change base size in one place

### 3. Relative Font Scale

All font sizes scale relative to the 14px base using `em` units:

| Size | Em Value | Computed (at 14px base) |
|------|----------|-------------------------|
| xs   | 0.714em  | ~10px |
| sm   | 0.857em  | ~12px |
| base | 0.875rem | 14px |
| lg   | 1.143em  | ~16px |
| xl   | 1.286em  | ~18px |
| 2xl  | 1.429em  | ~20px |
| 3xl  | 1.714em  | ~24px |
| 4xl  | 2.143em  | ~30px |

### 4. Application in Root Layout
**Location**: `app/layout.tsx`

```typescript
import { fontConfig } from "./config/fonts";

<body className={`${fontConfig.className} ...`}>
```

The font className is applied directly to the body element, making Geist the default font for the entire application automatically.

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
// Geist is applied by default - no font-family needed!
<p>Regular text uses Geist automatically</p>

// Just control the weight with Tailwind classes
<h1 className="font-light">Light heading</h1>
<p className="font-normal">Regular text</p>
<strong className="font-bold">Bold text</strong>

// Font sizes scale relative to 14px base
<p className="text-sm">12px text</p>
<p className="text-base">14px text (base)</p>
<p className="text-lg">16px text</p>
```

### Changing Base Size

To change the base font size for the entire app:

1. **Update `app/config/fonts.ts`:**
```typescript
export const FONT_CONFIG = {
  primary: 'Geist',
  baseFontSize: '1rem',  // Change to 16px base
  baseLineHeight: '1.75rem',
  fallback: ['system-ui', 'sans-serif'],
} as const;
```

2. **Update `tailwind.config.js`:**
```javascript
fontSize: {
  base: ['1rem', { lineHeight: '1.75rem' }], // Match the new base
  // Other sizes use em - they scale automatically!
}
```

All other font sizes (xs, sm, lg, xl, etc.) will automatically scale because they use `em` units.

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

**Before (Roboto):**
- Used `next/font/google` for Roboto
- Font sizes in fixed `rem` values
- No relative scaling

**After (Geist):**
- ✅ Self-hosted Geist via `geist` npm package
- ✅ Configurable base size (14px default)
- ✅ All sizes use `em` units (scale with base)
- ✅ Single source of truth in `app/config/fonts.ts`

## Troubleshooting

### Font not loading?
1. Check that `geist` package is installed: `npm ls geist`
2. Verify `app/config/fonts.ts` imports from `geist/font/sans`
3. Check browser DevTools Network tab for font requests
4. Clear `.next` cache: `rm -rf .next && npm run dev`

### Wrong font size?
1. Check base size in `FONT_CONFIG.baseFontSize`
2. Verify tailwind.config.js `fontSize.base` matches
3. Remember: other sizes use `em` (relative to base)

### Performance issues?
1. Geist is already optimized for performance
2. Check font file sizes in Network tab
3. Verify fonts are being cached correctly

## Resources

- [Geist Font](https://vercel.com/font)
- [Next.js Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- [CSS em vs rem Units](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units)
