// app/layout.tsx
import './css/global.css' // Ensure this imports your Tailwind CSS (via globals.css)
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Navbar } from './components/nav' // Your full-width responsive Navbar
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Footer from './components/footer' // Your Footer component
import { baseUrl } from './sitemap' // Assuming sitemap.ts provides baseUrl

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
}

// Utility function for combining classes (already present)
const cx = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ')

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
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
      <body className="antialiased flex flex-col min-h-screen"> {/* Make body a flex column to push footer down */}
        <Navbar /> {/* Navbar stays outside the max-width content area */}
        <main className="flex-auto max-w-xl w-full mx-auto px-4 mt-8">
          {/*
            - flex-auto: allows main to grow and take available space
            - max-w-xl: content will not exceed 'xl' breakpoint (1280px by default)
            - w-full: takes full width up to max-w-xl
            - mx-auto: centers the content horizontally
            - px-4: adds horizontal padding on small screens (4 units from Tailwind default)
            - mt-8: top margin for content below navbar
          */}
          {children}
        </main>
        <Footer /> {/* Footer stays outside the max-width content area */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}