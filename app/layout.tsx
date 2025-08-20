// app/layout.tsx
import "./css/global.css";
// Using a generic type since Metadata isn't exported correctly from next
import { GeistSans, GeistMono } from "geist/font";
import { Navbar } from "./components/Layout/nav";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Footer from "./components/Layout/footer";
import { SITE_CONFIG } from "./utils/constants";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";

// Define viewport manually since Viewport type is not exported from next
export const viewport = {
  width: "device-width",
  initialScale: 1,
};

// Define metadata without explicit type annotation
export const metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    template: `%s | ${SITE_CONFIG.name}`,
    default: SITE_CONFIG.name,
  },
  description: SITE_CONFIG.description,
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/images/Site/Favicon/favicon_350.png', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} dark scroll-smooth`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/images/Site/Favicon/favicon_350.png" type="image/png" />
      </head>
      <body className="antialiased flex flex-col min-h-screen bg-gray-700 text-gray-100">
        <ErrorBoundary componentName="Layout">
          <Navbar />
          <main className="flex-grow w-full py-8">
            <ErrorBoundary componentName="Page Content">
              {children}
            </ErrorBoundary>
          </main>
          <Footer />
        </ErrorBoundary>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
