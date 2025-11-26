// app/layout.tsx
import "./css/global.css";
import { primaryFont } from "./config/fonts";
import { getNonce } from "./utils/csp";
import { Navbar } from "./components/Navigation/nav";
import dynamic from 'next/dynamic';

// Defer ALL non-critical components to reduce initial JS bundle
// Load after page interactive to not impact LCP
const SpeedInsights = dynamic(() => import("@vercel/speed-insights/next").then(mod => ({ default: mod.SpeedInsights })), {
  ssr: false,
  loading: () => null,
});

const Analytics = dynamic(() => import("@vercel/analytics/react").then(mod => ({ default: mod.Analytics })), {
  ssr: false,
  loading: () => null,
});

const GoogleAnalytics = dynamic(() => import("@next/third-parties/google").then(mod => ({ default: mod.GoogleAnalytics })), {
  ssr: false,
  loading: () => null,
});

const WebVitalsReporter = dynamic(() => import("./components/WebVitalsReporter").then(mod => ({ default: mod.WebVitalsReporter })), {
  ssr: false,
  loading: () => null,
});

const Footer = dynamic(() => import("./components/Navigation/footer").then(mod => ({ default: mod.default })), {
  ssr: false,
  loading: () => null,
});

const ConditionalCTA = dynamic(() => import("./components/CTA").then(mod => ({ default: mod.ConditionalCTA })), {
  ssr: false,
  loading: () => null,
});
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
      { url: '/images/favicon/favicon-350.png', sizes: '350x350', type: 'image/png' },
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
    images: ['/images/og-image.jpg'],
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
  verification: {
    google: 'HS1GKAULwVWhcn49yxMtkoQdbdWZw05XBMtuJGmzwug',
    // yandex: 'yandex-verification-code',
    // bing: 'bing-verification-code',
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = await getNonce();
  return (
    <html
      lang="en"
      dir="ltr"
      className="dark scroll-smooth"
    >
      <head>
        {/* Font is automatically optimized by Next.js through geist/font/sans */}
        {/* No manual preload needed - Next.js handles font loading */}
        
        {/* Critical resource hints for better LCP and TTFB */}
        <link rel="preconnect" href="https://vercel.live" crossOrigin="anonymous" />
        
        {/* Defer non-critical third-party connections */}
        <link rel="dns-prefetch" href="https://img.youtube.com" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        <link rel="dns-prefetch" href="https://vitals.vercel-insights.com" />
        <link rel="dns-prefetch" href="https://va.vercel-scripts.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/images/favicon/favicon-350.png" type="image/png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Global Organization Schema */}
        <script
          type="application/ld+json"
          {...(nonce ? { nonce } : {})}
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema)
          }}
        />
        
        {/* Website Schema */}
        <script
          type="application/ld+json"
          {...(nonce ? { nonce } : {})}
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema)
          }}
        />
      </head>
      <body className={`${primaryFont.className} antialiased flex flex-col min-h-screen bg-gray-700 overflow-x-hidden`} style={{ color: 'var(--text-primary)' }}>
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
        <WebVitalsReporter />
        <GoogleAnalytics gaId="G-TZF55CB5XC" />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
