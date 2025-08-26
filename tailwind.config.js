// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}', // Adjust these paths based on where your components/pages are
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            // Set maxWidth to 'none' to make it expand to the parent's width,
            // or specify a larger value like '80rem' (1280px) or '1000px'.
            maxWidth: 'none', // Content will now fill the full width of your <main> container
            // OR
            // maxWidth: '80rem', // Or max-w-[1280px]
            // If you want to refine other aspects, like line-height for wider text:
            // 'p': {
            //   lineHeight: '1.625', // Adjust for readability on wider lines
            // },
            // 'ul > li::marker': { // Example: Custom bullet point color
            //   color: theme('colors.gray.500'),
            // },
            // 'ol > li::marker': {
            //   color: theme('colors.gray.500'),
            // },
            // '--tw-prose-body': theme('colors.gray.700'), // Example: Light mode body text color
            // '--tw-prose-invert-body': theme('colors.gray.200'), // Example: Dark mode body text color
          },
        },
        // You can define specific overrides for different prose variants if you use them
        // 'xl': { // For example, if you want `prose-xl` to be even wider
        //   css: {
        //     maxWidth: 'none',
        //   },
        // },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // If you use prose
  ],
  darkMode: 'class', // Or 'media' depending on your setup
}