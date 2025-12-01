# Font System - Quick Start Guide

## 🎯 Single Source of Truth: `app/config/fonts.ts`

All font changes happen in **ONE file** for maximum flexibility and maintainability.

## 🚀 How to Change Fonts (3 Easy Steps)

### Step 1: Open `app/config/fonts.ts`

### Step 2: Uncomment Your Desired Font

```typescript
// Option A: Roboto (Currently Active)
import { Roboto } from 'next/font/google';
const fontLoader = Roboto({...});

// Option B: Geist (Comment out Roboto, uncomment this)
// import { GeistSans } from 'geist/font/sans';
// const fontLoader = GeistSans;

// Option C: Inter
// import { Inter } from 'next/font/google';
// const fontLoader = Inter({...});

// ... more options available in the file
```

### Step 3: Update FONT_CONFIG

```typescript
export const FONT_CONFIG = {
  name: 'Roboto', // ← Change this to match your font
  cssVariable: '--font-primary',
  // ... rest auto-configured
};
```

### Step 4: Restart Dev Server

```bash
npm run dev
```

**That's it!** ✅ The font updates everywhere automatically.

## 📂 System Architecture

```
app/config/fonts.ts          ← 🔥 CHANGE FONTS HERE (single source)
├── Imports font from next/font/google or geist
├── Configures font settings
└── Exports primaryFont

app/layout.tsx               ← Applies font globally
└── <body className={primaryFont.className}>

app/css/global.css           ← Defines font weights & colors
├── h1-h6 typography
└── Component classes (.btn, .card-title, etc.)

tailwind.config.js           ← Auto-configured
└── Uses CSS variable from fonts.ts

All Components                ← No font imports needed!
└── Automatically inherit font from body
```

## 🎨 Available Pre-Configured Fonts

| Font | Style | Best For | Status |
|------|-------|----------|--------|
| **Roboto** | Clean, modern | Body text, headings | ✅ Active |
| **Geist** | Tech, minimal | Modern UI, SaaS | 📦 Ready |
| **Inter** | Highly legible | Interfaces, docs | 📦 Ready |
| **Poppins** | Geometric | Startups, marketing | 📦 Ready |
| **IBM Plex Sans** | Corporate | Enterprise, tech | 📦 Ready |

## 📋 Current Configuration

**Active Font:** Geist  
**Base Font Size:** 14px (0.875rem)  
**Font Scale:** Relative (`em` units based on base)  
**CSS Variable:** `--font-primary`  
**Applied:** Globally via body element  
**Type:** Self-hosted via `geist` package

### Font Size Scale (relative to 14px base)

| Class | Multiplier | Size at 14px base |
|-------|------------|-------------------|
| `xs` | 0.714em | ~10px |
| `sm` | 0.857em | ~12px |
| `base` | 0.875rem | 14px |
| `lg` | 1.143em | ~16px |
| `xl` | 1.286em | ~18px |
| `2xl` | 1.429em | ~20px |
| `3xl` | 1.714em | ~24px |
| `4xl` | 2.143em | ~30px |

## 🔧 Adding a New Font

Want to use a font not in the pre-configured list?

1. **Install font package** (if needed):
   ```bash
   npm install geist  # For Geist
   # or use Google Fonts (no install needed)
   ```

2. **Add to `app/config/fonts.ts`**:
   ```typescript
   // Option X: Your Custom Font
   import { YourFont } from 'next/font/google';
   const fontLoader = YourFont({
     weight: ['400', '700'],
     subsets: ['latin'],
     display: 'swap',
     variable: '--font-primary',
     preload: true,
   });
   ```

3. **Update FONT_CONFIG**:
   ```typescript
   export const FONT_CONFIG = {
     name: 'Your Font Name',
     cssVariable: '--font-primary',
     // ... rest of config
   };
   ```

4. **Restart**: `npm run dev`

## 🎯 Design Principles

1. ✅ **NO inline font classes** in components
2. ✅ Use **semantic HTML** (`<h1>`, `<strong>`, etc.)
3. ✅ Use **component classes** (`.btn`, `.card-title`)
4. ✅ Font changes in **ONE place** only
5. ❌ Never use `className="font-bold"` on individual elements

## 📖 Usage Examples

### ✅ Good Examples

```tsx
// Automatically uses configured font with proper weight
<h1>Page Title</h1>

// Semantic HTML for emphasis
<p>This is <strong>important</strong></p>

// Component class (defined in global.css)
<button className="btn">Click Me</button>
```

### ❌ Bad Examples

```tsx
// Don't do this - defeats centralization
<h1 className="font-bold">Title</h1>

// Don't do this - inconsistent
<div className="font-medium">Text</div>

// Don't do this - scattered font imports
import { SomeFont } from 'next/font/google';
```

## 🔍 Verification

Check if font is loaded correctly:

1. Open browser dev tools (F12)
2. Console tab
3. Run:
   ```javascript
   window.getComputedStyle(document.body).fontFamily
   ```
4. Should see your font name

Or visit: `http://localhost:3000/debug/fonts`

## 📚 Related Files

- **app/config/fonts.ts** - ⭐ Single source of truth (change fonts here)
- **app/layout.tsx** - Applies font globally
- **app/css/global.css** - Typography styles
- **tailwind.config.js** - Tailwind integration
- **docs/FONT_CONFIGURATION.md** - Detailed documentation

## 🆘 Troubleshooting

### Font not appearing?

1. **Clear browser cache**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. **Restart dev server**: Stop and run `npm run dev`
3. **Check import**: Make sure only ONE font import is uncommented
4. **Check font name**: Verify FONT_CONFIG.name matches your font

### Need to install font package?

```bash
# For Geist
npm install geist

# For other fonts from npm
npm install @next/font
```

## 💡 Pro Tips

1. **Variable fonts are best**: Single file, all weights (Geist, Inter)
2. **Limit weights**: Only load weights you actually use
3. **Test thoroughly**: Check all pages after changing fonts
4. **Document changes**: Update FONT_CONFIG for team awareness

## 🎉 Benefits of This System

✅ **Change fonts in 1 file** - No hunting through components  
✅ **Consistent typography** - Applied everywhere automatically  
✅ **Easy maintenance** - Clear, centralized configuration  
✅ **Type safe** - TypeScript support out of the box  
✅ **Performance** - Optimized by Next.js automatically  
✅ **Self-hosted** - No external font requests  
✅ **Zero layout shift** - font-display: swap

---

**Last Updated:** December 1, 2025  
**Current Font:** Geist (14px base)  
**System Version:** 3.0 (Relative Font Scale)
