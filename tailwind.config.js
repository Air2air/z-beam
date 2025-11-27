// tailwind.config.js
/** @type {import('tailwindcss').Config} */

// Import font configuration for centralized font management
// This allows easy font switching in one place (app/config/fonts.ts)
const fontConfig = {
  cssVariable: '--font-primary',
  fallbacks: [
    'system-ui',
    '-apple-system', 
    'BlinkMacSystemFont',
    'Segoe UI',
    'Helvetica Neue',
    'Arial',
    'sans-serif'
  ]
};

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  // Optimize CSS output
  future: {
    hoverOnlyWhenSupported: true,
  },
  // Safelist only critical dynamic classes
  safelist: [
    'aspect-[16/9]',
    {
      pattern: /^(text|bg|border)-(gray|blue|red)-(50|100|200|300|400|500|600|700|800|900)$/,
      variants: ['hover', 'focus', 'dark'],
    },
  ],
  theme: {
    extend: {
      // ============================================
      // BASE FONT SIZE CONFIGURATION
      // ============================================
      // Custom font size scale - reduced for better mobile readability
      // SM: Reduced by one unit from default Tailwind
      // XS: Reduced by two units from default Tailwind
      fontSize: {
        'xs': ['0.625rem', { lineHeight: '1rem' }],      // 10px (was 12px)
        'sm': ['0.75rem', { lineHeight: '1.25rem' }],     // 12px (was 14px)
        'base': ['0.8125rem', { lineHeight: '1.5rem' }],  // 13px (was 15px)
        'lg': ['0.9375rem', { lineHeight: '1.75rem' }],   // 15px (was 18px)
        'xl': ['1.0625rem', { lineHeight: '1.75rem' }],   // 17px (was 20px)
        '2xl': ['1.25rem', { lineHeight: '2rem' }],       // 20px (was 24px)
        '3xl': ['1.5rem', { lineHeight: '2.25rem' }],     // 24px (was 30px)
        '4xl': ['1.875rem', { lineHeight: '2.5rem' }],    // 30px (was 36px)
        '5xl': ['2.25rem', { lineHeight: '2.5rem' }],     // 36px (was 48px)
        '6xl': ['2.75rem', { lineHeight: '1' }],          // 44px (was 60px)
        '7xl': ['3.5rem', { lineHeight: '1' }],           // 56px (was 72px)
        '8xl': ['4.5rem', { lineHeight: '1' }],           // 72px (was 96px)
        '9xl': ['6rem', { lineHeight: '1' }],             // 96px (was 128px)
      },
      // ============================================
      // CENTRALIZED FONT FAMILY CONFIGURATION
      // ============================================
      // Font is loaded via app/config/fonts.ts
      // To change fonts, update app/config/fonts.ts only
      // This automatically updates everywhere
      fontFamily: {
        sans: [`var(${fontConfig.cssVariable})`, ...fontConfig.fallbacks],
      },
      colors: {
        brand: {
          orange: '#ff8500',
          'orange-dark': '#e67700',
        },
      },
      // Animation for FAQ dropdowns and other transitions
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out forwards',
      },
      // Typography config removed - using custom CSS for better performance
    },
  },
  plugins: [],
  darkMode: 'class',
}