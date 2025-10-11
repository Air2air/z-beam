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
  theme: {
    extend: {
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
          orange: '#ff6811',
        },
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            maxWidth: 'none',
            // Paragraph styles
            'p': {
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
              color: theme('colors.neutral.800'),
            },
            // Heading styles with custom font weights
            'h1': {
              fontSize: theme('fontSize.4xl'),
              fontWeight: '300', // font-light
              letterSpacing: theme('letterSpacing.tight'),
              marginTop: '1.5rem',
              marginBottom: '0.5rem',
              color: theme('colors.neutral.900'),
            },
            'h2': {
              fontSize: theme('fontSize.xl'),
              fontWeight: '300', // font-light
              letterSpacing: theme('letterSpacing.tight'),
              marginTop: '1.5rem',
              marginBottom: '0.5rem',
              color: theme('colors.neutral.900'),
            },
            'h3': {
              fontSize: theme('fontSize.xl'),
              fontWeight: '600', // font-semibold
              letterSpacing: theme('letterSpacing.tight'),
              marginTop: '1.5rem',
              marginBottom: '0.5rem',
              color: theme('colors.neutral.900'),
            },
            'h4': {
              fontSize: theme('fontSize.lg'),
              fontWeight: '500', // font-medium
              letterSpacing: theme('letterSpacing.tight'),
              marginTop: '1.5rem',
              marginBottom: '0.5rem',
              color: theme('colors.neutral.900'),
            },
            // Link styles
            'a': {
              textDecoration: 'underline',
              textDecorationColor: theme('colors.neutral.400'),
              textUnderlineOffset: '2px',
              textDecorationThickness: '0.1em',
              transition: 'all 0.2s',
              '&:hover': {
                textDecorationColor: theme('colors.neutral.600'),
              },
            },
            // Strong/bold text
            'strong': {
              fontWeight: '500', // font-medium
            },
            // Lists
            'ul': {
              listStyleType: 'disc',
              paddingLeft: '1.5rem',
            },
            'ol': {
              listStyleType: 'decimal',
              paddingLeft: '1.5rem',
            },
            // Code blocks
            'pre': {
              backgroundColor: theme('colors.neutral.50'),
              borderRadius: theme('borderRadius.lg'),
              overflowX: 'auto',
              border: `1px solid ${theme('colors.neutral.200')}`,
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem',
              paddingLeft: '0.75rem',
              paddingRight: '0.75rem',
              fontSize: theme('fontSize.sm'),
            },
            'code': {
              paddingLeft: '0.25rem',
              paddingRight: '0.25rem',
              paddingTop: '0.125rem',
              paddingBottom: '0.125rem',
              borderRadius: theme('borderRadius.lg'),
            },
            'pre code': {
              padding: '0',
              border: 'none',
              lineHeight: '1.5',
            },
            'code span': {
              fontWeight: '500',
            },
            // Images
            'img': {
              margin: '0',
            },
            // Override first child margin
            '> :first-child': {
              marginTop: '1.25em !important',
              marginBottom: '1.25em !important',
            },
          },
        },
        // Dark mode overrides
        invert: {
          css: {
            'p': {
              color: theme('colors.neutral.200'),
            },
            'h1': {
              color: theme('colors.neutral.100'),
            },
            'h2': {
              color: theme('colors.neutral.100'),
            },
            'h3': {
              color: theme('colors.neutral.100'),
            },
            'h4': {
              color: theme('colors.neutral.100'),
            },
            'a': {
              textDecorationColor: theme('colors.neutral.600'),
              '&:hover': {
                textDecorationColor: theme('colors.neutral.400'),
              },
            },
            'pre': {
              backgroundColor: theme('colors.neutral.900'),
              borderColor: theme('colors.neutral.900'),
            },
            'code': {
              backgroundColor: theme('colors.neutral.800'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // If you use prose
  ],
  darkMode: 'class', // Or 'media' depending on your setup
}