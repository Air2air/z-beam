// app/config/fonts.ts
/**
 * Centralized Font Configuration
 * 
 * This file manages all font loading for the application.
 * Uses Next.js font optimization for automatic font subsetting,
 * self-hosting, and zero layout shift.
 * 
 * Benefits:
 * - Automatic font subsetting (only loads characters you use)
 * - Self-hosted fonts (no external requests, better privacy & performance)
 * - Zero layout shift with font-display: swap
 * - Optimized for Core Web Vitals
 */

import { Roboto } from 'next/font/google';

/**
 * Primary font: Roboto
 * 
 * Loaded weights:
 * - 100: Thin
 * - 300: Light
 * - 400: Regular
 * - 500: Medium
 * - 700: Bold
 * - 900: Black
 * 
 * Subsets: Latin (can add more if needed, e.g., 'latin-ext', 'cyrillic')
 */
export const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  subsets: ['latin'],
  display: 'swap', // Prevents invisible text during font loading
  variable: '--font-roboto', // CSS variable for Tailwind
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
});

/**
 * Font Application Strategy:
 * 
 * The font is applied using `roboto.className` directly on the body element.
 * This automatically applies Roboto as the default font for the entire application
 * without needing to specify font classes on individual elements.
 * 
 * Usage:
 * - The font is applied globally via layout.tsx
 * - No need to add font classes to components
 * - Font weights are controlled via Tailwind classes (font-light, font-bold, etc.)
 * 
 * Example: <h1 className="font-bold">Title</h1>
 * This will use Roboto Bold automatically.
 */
