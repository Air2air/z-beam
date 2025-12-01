// app/config/fonts.ts
/**
 * ============================================
 * CENTRALIZED FONT CONFIGURATION SYSTEM
 * ============================================
 * 
 * SINGLE SOURCE OF TRUTH for all font settings.
 * Change fonts in ONE place and it updates everywhere.
 * 
 * BENEFITS:
 * - Automatic font subsetting (only loads characters you use)
 * - Self-hosted fonts (no external requests, better privacy & performance)
 * - Zero layout shift with font-display: swap
 * - Optimized for Core Web Vitals
 * - Easy font switching (change one import)
 * 
 * TO CHANGE FONTS:
 * 1. Update the import statement below
 * 2. Update FONT_CONFIG object
 * 3. Run: npm run dev
 * That's it! Font will update everywhere automatically.
 * 
 * ============================================
 */

// ============================================
// STEP 1: IMPORT YOUR CHOSEN FONT
// ============================================
// Uncomment ONE of the options below, or add your own:

// Option A: Roboto (Classic, widely used)
// import { Roboto } from 'next/font/google';
// const fontLoader = Roboto({
//   weight: ['100', '300', '400', '500', '700', '900'],
//   subsets: ['latin'],
//   display: 'swap',
//   variable: '--font-primary',
//   preload: true,
// });

// Option B: Geist (Modern, Vercel's font)
import { GeistSans } from 'geist/font/sans';
const fontLoader = GeistSans;

// Option C: Inter (Popular, excellent readability)
// import { Inter } from 'next/font/google';
// const fontLoader = Inter({
//   subsets: ['latin'],
//   display: 'swap',
//   variable: '--font-primary',
//   preload: true,
// });

// Option D: Poppins (Modern, geometric)
// import { Poppins } from 'next/font/google';
// const fontLoader = Poppins({
//   weight: ['100', '300', '400', '500', '600', '700', '900'],
//   subsets: ['latin'],
//   display: 'swap',
//   variable: '--font-primary',
//   preload: true,
// });

// Option E: IBM Plex Sans (Tech/Corporate)
// import { IBM_Plex_Sans } from 'next/font/google';
// const fontLoader = IBM_Plex_Sans({
//   weight: ['100', '300', '400', '500', '600', '700'],
//   subsets: ['latin'],
//   display: 'swap',
//   variable: '--font-primary',
//   preload: true,
// });

// ============================================
// STEP 2: FONT CONFIGURATION (Update this when changing fonts)
// ============================================
export const FONT_CONFIG = {
  // Font name (for documentation and debugging)
  name: 'Geist',
  
  // CSS variable name (must match 'variable' in fontLoader above)
  cssVariable: '--font-primary',
  
  // ============================================
  // BASE FONT SIZE - Single Source of Truth
  // ============================================
  // This defines the default body text size
  // All other sizes scale relative to this
  baseFontSize: '0.875rem',   // 14px
  baseLineHeight: '1.5rem',   // 24px
  
  // Fallback fonts (safe defaults)
  fallbacks: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Helvetica Neue',
    'Arial',
    'sans-serif'
  ],
  
  // Available weights (for documentation)
  weights: {
    thin: 100,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },
  
  // Font characteristics (for documentation)
  characteristics: {
    type: 'sans-serif',
    style: 'modern, clean, highly legible',
    bestFor: 'body text, headings, technical content',
    source: 'Google Fonts',
  }
};

// ============================================
// STEP 3: EXPORT PRIMARY FONT
// ============================================
// This is used throughout the application
// Import this in layout.tsx as: import { primaryFont } from './config/fonts'
export const primaryFont = fontLoader;

// Also export with generic name for backward compatibility
export const font = fontLoader;

/**
 * ============================================
 * USAGE GUIDE
 * ============================================
 * 
 * In layout.tsx:
 *   import { primaryFont } from './config/fonts';
 *   <body className={primaryFont.className}>
 * 
 * In Tailwind config:
 *   import { FONT_CONFIG } from './app/config/fonts';
 *   fontFamily: { sans: [`var(${FONT_CONFIG.cssVariable})`, ...FONT_CONFIG.fallbacks] }
 * 
 * In components (automatic):
 *   Just use Tailwind classes: font-light, font-bold, etc.
 *   The font is already applied globally via layout.tsx
 * 
 * ============================================
 * SWITCHING FONTS (3 easy steps):
 * ============================================
 * 
 * 1. Comment out current import and uncomment desired font (see STEP 1)
 * 2. Update FONT_CONFIG.name and other properties (see STEP 2)
 * 3. Restart dev server: npm run dev
 * 
 * Everything updates automatically! No need to touch any components.
 * 
 * ============================================
 */
