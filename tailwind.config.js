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
      // Single Source: app/config/fonts.ts FONT_CONFIG.baseFontSize
      // Current base: 0.875rem (14px)
      // All sizes use em units to scale RELATIVE to base
      // To change base: Update fonts.ts, then sync 'base' here
      fontSize: {
        'xs': ['0.714em', { lineHeight: '1.4' }],        // ~10px (0.714 × 14)
        'sm': ['0.857em', { lineHeight: '1.5' }],        // ~12px (0.857 × 14)
        'base': ['0.875rem', { lineHeight: '1.5' }],     // 14px - BASE (rem, not em)
        'lg': ['1.143em', { lineHeight: '1.6' }],        // ~16px (1.143 × 14)
        'xl': ['1.286em', { lineHeight: '1.5' }],        // ~18px (1.286 × 14)
        '2xl': ['1.429em', { lineHeight: '1.4' }],       // ~20px (1.429 × 14)
        '3xl': ['1.714em', { lineHeight: '1.35' }],      // ~24px (1.714 × 14)
        '4xl': ['2.143em', { lineHeight: '1.3' }],       // ~30px (2.143 × 14)
        '5xl': ['2.571em', { lineHeight: '1.2' }],       // ~36px (2.571 × 14)
        '6xl': ['3.143em', { lineHeight: '1.1' }],       // ~44px (3.143 × 14)
        '7xl': ['4em', { lineHeight: '1' }],             // ~56px (4 × 14)
        '8xl': ['5.143em', { lineHeight: '1' }],         // ~72px (5.143 × 14)
        '9xl': ['6.857em', { lineHeight: '1' }],         // ~96px (6.857 × 14)
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