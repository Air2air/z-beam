// app/layout.tsx
// This is the Root Layout for your entire Next.js application.
// It defines the global HTML structure, including the <html> and <body> tags,
// and wraps all other pages and nested layouts.

import './css/global.css'; // Import your global Tailwind CSS styles
import type { Metadata } from 'next'; // Import Metadata type for type safety
import { GeistSans, GeistMono } from 'geist/font'; // Importing your custom fonts
import { Navbar } from './components/nav'; // Your site's global navigation bar
import { Analytics } from '@vercel/analytics/react'; // Vercel Analytics for tracking
import { SpeedInsights } from '@vercel/speed-insights/next'; // Vercel Speed Insights for performance monitoring
import Footer from './components/footer'; // Your site's global footer
import { baseUrl } from './sitemap'; // Assuming baseUrl is for generating absolute URLs

// --- Global Metadata ---
// This metadata applies to all pages by default unless overridden by a nested layout or page.
// It's crucial for SEO and how your site appears when shared.
export const metadata: Metadata = {
  metadataBase: new URL(baseUrl), // Base URL for generating absolute paths in metadata
  title: {
    default: 'Z-Beam', // Default title for pages without a specific title
    template: '%s | Z-Beam', // Template for page titles (e.g., "Home | Z-Beam")
  },
  description: 'This is my portfolio.', // Default site description
  openGraph: {
    title: 'Z-Beam',
    description: 'This is my portfolio.',
    url: baseUrl, // Canonical URL for the site
    siteName: 'Z-Beam',
    locale: 'en_US',
    type: 'website', // Specifies the type of content for Open Graph
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// Utility function to combine Tailwind CSS classes conditionally
const cx = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

// --- Root Layout Component ---
// This component receives `children`, which represents the content of the current page
// or nested layout (e.g., `app/page.tsx` or `app/articles/layout.tsx`).
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      // Apply global text and background colors, and integrate custom font variables
      className={cx(
        'text-black bg-white dark:text-white dark:bg-black',
        GeistSans.variable,
        GeistMono.variable
      )}
    >
      {/*
        The <body> element acts as the primary container for the entire page content.
        - flex flex-col: Stacks its children (Navbar, main content, Footer) vertically.
        - min-h-screen: Ensures the body takes at least the full viewport height,
                        which helps in pushing the footer to the bottom on short content pages.
        - antialiased: Applies font antialiasing for smoother text rendering.
      */}
      <body className="antialiased flex flex-col min-h-screen">
        {/*
          Navbar: Renders the site-wide navigation.
          It's placed outside the <main> content wrapper so it can span full width.
        */}
        <Navbar />

        {/*
          Main Content Area:
          This <main> tag is where the content of individual pages will be rendered.
          - flex-auto: Allows this <main> element to grow and take up all available vertical space
                       between the Navbar and Footer, effectively pushing the footer down.
          - max-w-xl: Limits the maximum content width on larger screens for readability.
          - w-full: Ensures the content takes 100% of the available width up to the max-w-xl.
          - mx-auto: Centers the content horizontally when `max-w-xl` is active.
          - px-4: Adds horizontal padding to prevent content from touching screen edges,
                  especially important on smaller viewports.
          - my-8: Adds vertical margin, providing spacing from the Navbar and Footer.
        */}
        <main className="flex-auto max-w-6xl w-full mx-auto px-4 my-8">
          {children} {/* This is where the content from app/page.tsx or nested layouts/pages will be inserted */}
        </main>

        {/*
          Footer: Renders the site-wide footer.
          Placed outside the <main> content wrapper to span full width.
        */}
        <Footer />

        {/* Vercel Analytics and Speed Insights for performance and usage tracking */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}