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
      // Override default base font size (16px -> 15px)
      fontSize: {
        base: '15px',
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
      // Typography config removed - using custom CSS for better performance
    },
  },
  plugins: [],
  darkMode: 'class',
}