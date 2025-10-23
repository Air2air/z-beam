// app/layout.tsx
import "./css/global.css";
import { primaryFont } from "./config/fonts";
import { Navbar } from "./components/Navigation/nav";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from 'next/script';
import { Analytics } from "@vercel/analytics/react";
import Footer from "./components/Navigation/footer";
import { ConditionalCTA } from "./components/CTA";
import { SITE_CONFIG } from "./utils/constants";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import { generateOrganizationSchema } from "./utils/business-config";

// Generate the business schema
const organizationSchema = generateOrganizationSchema();

// Define viewport manually since Viewport type is not exported from next
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1f2937",
};

// Enhanced metadata with comprehensive defaults
export const metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    template: `%s | ${SITE_CONFIG.name}`,
    default: SITE_CONFIG.name,
  },
  description: SITE_CONFIG.description,
  keywords: SITE_CONFIG.keywords,
  authors: [{ name: SITE_CONFIG.author }],
  creator: SITE_CONFIG.author,
  publisher: SITE_CONFIG.author,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: SITE_CONFIG.media.favicon.ico },
      { url: SITE_CONFIG.media.favicon.png, type: 'image/png' },
    ],
    apple: [
      { url: '/images/favicon/favicon_350.png', sizes: '350x350', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.shortName} - Professional Laser Cleaning Services`,
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    images: ['/images/twitter-card.jpg'],
    // creator: '@zbeamproductions', // Update with actual Twitter handle
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

// Website schema
const websiteSchema = {
  "@context": SITE_CONFIG.schema.context,
  "@type": SITE_CONFIG.schema.websiteType,
  "@id": `${SITE_CONFIG.url}#website`,
  "url": SITE_CONFIG.url,
  "name": SITE_CONFIG.name,
  "description": SITE_CONFIG.description,
  "publisher": {
    "@id": `${SITE_CONFIG.url}#organization`
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${SITE_CONFIG.url}/search?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      className="dark scroll-smooth"
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/images/favicon/favicon_350.png" type="image/png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Global Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema)
          }}
        />
        
        {/* Website Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema)
          }}
        />
      </head>
      <body className={`${primaryFont.className} antialiased`}>
        <ErrorBoundary componentName="Layout">
          <Navbar />
          <main className="flex-grow w-full max-w-full py-0 pb-32 md:pb-0 overflow-x-hidden" id="main-content">
            <ErrorBoundary componentName="Page Content">
              {children}
            </ErrorBoundary>
          </main>
          <ConditionalCTA />
          <Footer />
        </ErrorBoundary>
        <SpeedInsights />
        <Analytics />
        <Script
          src="https://va.vercel-scripts.com/v1/script.debug.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
