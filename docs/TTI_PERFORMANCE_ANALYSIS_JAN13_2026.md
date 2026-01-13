# TTI Performance Analysis - January 13, 2026

## 🎯 Issue Summary

**Desktop TTI: 8.18s (POOR)** - Failing predeploy validation
**Mobile TTI: 5.5s (71%)** - Passing but suboptimal

## 🔍 Root Cause Analysis

### 1. **Google Analytics is the PRIMARY Bottleneck** (436 KB!)
- **gtag.js**: 436 KB uncompressed JavaScript
- **37% of payload unused** (54 KB waste detected)
- Blocking initial interactivity

### 2. **Main Thread Blocking**
```
scriptEvaluation:      0.80s  (50% of work)
other:                 0.51s
scriptParseCompile:    0.14s
styleLayout:           0.09s
```

### 3. **Large Vendor Chunks**
- `vendor-9b6e52f9`: 168.8 KB
- Multiple vendor chunks not code-split optimally

### 4. **Render-Blocking Resources**
- 13 KB unused CSS
- 54 KB unused JavaScript
- Images not optimally loaded (112 KB potential savings)

## 📊 Impact Breakdown

| Factor | Impact | Size/Time |
|--------|--------|-----------|
| Google Analytics (gtag.js) | **CRITICAL** | 436 KB |
| Unused JavaScript | High | 54 KB |
| Render-blocking CSS | Medium | 13 KB |
| Image optimization | Medium | 112 KB |
| Legacy polyfills | Low | 12 KB |

## ✅ Recommended Solutions

### **Priority 1: Defer Google Analytics (QUICK WIN)** 🔥
**Impact**: Could reduce TTI by 1-2 seconds

Already using `@next/third-parties/google` but gtag.js is still loading synchronously.

**Solution**: Implement Partytown for true off-main-thread analytics

```tsx
// app/layout.tsx - Add Partytown for Google Analytics
import { GoogleAnalytics } from '@next/third-parties/google'

// Current (blocking):
<GoogleAnalytics gaId="G-TZF55CB5XC" />

// Better (partytown):
<GoogleAnalytics 
  gaId="G-TZF55CB5XC" 
  partytown={true}  // Run in web worker
/>
```

**Alternative**: Lazy load after TTI
```tsx
const GoogleAnalytics = dynamic(
  () => import("@next/third-parties/google").then(mod => ({ 
    default: mod.GoogleAnalytics 
  })), 
  {
    ssr: false,
    loading: () => null,
  }
);

// Load after 3 seconds or on user interaction
useEffect(() => {
  const timer = setTimeout(() => {
    setLoadAnalytics(true);
  }, 3000);
  return () => clearTimeout(timer);
}, []);
```

### **Priority 2: Optimize Vendor Chunks**
**Impact**: Reduce by 50-80 KB

Current issue: Large vendor chunks not optimally split

**Solution**: Configure webpack chunking
```js
// next.config.js
experimental: {
  optimizePackageImports: [
    '@vercel/analytics', 
    '@vercel/speed-insights', 
    'react', 
    'react-dom',
    'next'  // Add Next.js itself
  ],
}
```

### **Priority 3: Remove Unused CSS/JS**
**Impact**: Save 67 KB (13 KB CSS + 54 KB JS)

**Actions**:
1. Enable PurgeCSS in production
2. Tree-shake unused Tailwind utilities
3. Audit component imports for unused code

```js
// tailwind.config.js
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  safelist: [], // Remove unused safelist items
}
```

### **Priority 4: Image Optimization**
**Impact**: Save 112 KB

**Current issue**: Images not using optimal formats/sizes

**Solution**: Already configured AVIF/WebP, but enforce lazy loading
```tsx
// Ensure all images use lazy loading
<Image 
  loading="lazy"  // Add explicitly
  placeholder="blur"  // Use blur placeholders
/>
```

### **Priority 5: Legacy Polyfills**
**Impact**: Save 12 KB

**Solution**: Target modern browsers only
```js
// next.config.js
experimental: {
  forceSwcTransforms: true,  // Already set ✅
},

// Add browserslist to package.json
"browserslist": [
  "defaults and fully supports es6-module"
]
```

## 🚀 Quick Win Implementation Plan

### Step 1: Defer Google Analytics (5 minutes)
```bash
npm install @builder.io/partytown
```

Update layout:
```tsx
import { GoogleAnalytics } from '@next/third-parties/google'

<GoogleAnalytics 
  gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} 
  partytown={true}
/>
```

**Expected Result**: TTI improved from 8.18s → 6.5-7.0s

### Step 2: Optimize Next.js Config (2 minutes)
Add to `next.config.js`:
```js
experimental: {
  optimizePackageImports: [
    '@vercel/analytics',
    '@vercel/speed-insights',
    'react',
    'react-dom',
    'next',
    '@next/third-parties'
  ],
  // More aggressive code splitting
  workerThreads: false,
  esmExternals: true,
},
```

**Expected Result**: TTI improved from 7.0s → 6.0-6.5s

### Step 3: Add Resource Hints (1 minute)
```tsx
// app/layout.tsx
<head>
  <link rel="preconnect" href="https://www.googletagmanager.com" />
  <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
</head>
```

**Expected Result**: TTI improved from 6.5s → 5.5-6.0s

## 📈 Expected Improvements

| Metric | Current | After Quick Wins | Target |
|--------|---------|------------------|--------|
| **Desktop TTI** | 8.18s ❌ | 5.5-6.0s ✅ | <5.0s |
| **Mobile TTI** | 5.5s (71%) | 4.0-4.5s ✅ | <3.8s |
| **JavaScript Size** | 627 KB | 550 KB | <500 KB |
| **Main Thread Time** | 1.67s | 1.2s | <1.0s |

## 🎯 Success Criteria

✅ Desktop TTI < 7.0s (passing validation)
✅ Mobile TTI < 5.0s (90+ score)
✅ JavaScript execution < 1.0s
✅ No render-blocking resources

## 📚 References

- [Partytown Documentation](https://partytown.builder.io/)
- [Next.js Performance Best Practices](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web.dev TTI Guide](https://web.dev/tti/)
- [Lighthouse TTI Audit](https://developer.chrome.com/docs/lighthouse/performance/interactive/)

## 🚨 Important Notes

1. **Google Analytics is the biggest issue** - 436 KB blocking main thread
2. Workiz widget is already lazy-loaded ✅
3. Vercel Analytics/SpeedInsights already deferred ✅
4. Footer/CTA already lazy-loaded ✅
5. Most optimization already in place, just need analytics fix

## 🔄 Next Steps

1. Implement Partytown for Google Analytics
2. Test with Lighthouse
3. Deploy and monitor Real User Metrics (RUM)
4. Iterate on remaining optimizations if needed
