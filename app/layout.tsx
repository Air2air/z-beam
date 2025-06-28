// app/layout.tsx
import './css/global.css'; // Your global Tailwind CSS imports
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Navbar } from './components/nav'; // Your Navbar component
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Footer from './components/footer'; // Your Footer component
import { baseUrl } from './sitemap'; // Assuming this provides your base URL

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Z-Beam',
    template: '%s | Z-Beam',
  },
  description: 'This is my portfolio.',
  openGraph: {
    title: 'Z-Beam',
    description: 'This is my portfolio.',
    url: baseUrl,
    siteName: 'Z-Beam',
    locale: 'en_US',
    type: 'website',
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

// Utility function for combining classes (already present)
const cx = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cx(
        'text-black bg-white dark:text-white dark:bg-black',
        GeistSans.variable,
        GeistMono.variable
      )}
    >
      {/*
        The <body> element now acts as a flex container for the entire page.
        - flex flex-col: Stacks its children (Navbar, main, Footer) vertically.
        - min-h-screen: Ensures the body takes at least the full viewport height.
        - antialiased: (Good for text rendering).
      */}
      <body className="antialiased flex flex-col min-h-screen">
        {/*
          Navbar: Placed directly inside <body>.
          Its own component styling (which we set up to be w-full) will make it full-width.
        */}
        <Navbar />

        {/*
          Main Content Area:
          - flex-auto: Allows this <main> element to grow and take up all available vertical space
                       between the Navbar and Footer. This is key for pushing the footer to the bottom.
          - max-w-xl: Limits the maximum width of the content (e.g., 1280px by default in Tailwind's 'xl' breakpoint).
          - w-full: Ensures the content takes 100% of the available width up to the max-w-xl.
          - mx-auto: Centers the content horizontally when it's less than 100% width (i.e., when max-w-xl is hit).
          - px-4: Adds horizontal padding on all screen sizes, providing breathing room.
          - my-8: Adds vertical margin to the top and bottom of the content, separating it from Navbar and Footer.
        */}
        <main className="flex-auto max-w-xl w-full mx-auto px-4 my-8">
          {children} {/* This is where your page content gets rendered */}
        </main>

        {/*
          Footer: Placed directly inside <body>.
          Like the Navbar, its own component styling should make it full-width.
        */}
        <Footer />

        {/* Vercel Analytics and Speed Insights */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}