// app/layout.tsx
// This is the Root Layout for your entire Next.js application.
// It defines the global HTML structure, including the <html> and <body> tags,
// and wraps all other pages and nested layouts.

import "./css/global.css"; // Import your global Tailwind CSS styles
import type { Metadata } from "next"; // Import Metadata type for type safety
import { GeistSans, GeistMono } from "geist/font"; // Importing your custom fonts
import { Navbar } from "./components/nav"; // Your site's global navigation bar
import { Analytics } from "@vercel/analytics/react"; // Vercel Analytics for tracking
import { SpeedInsights } from "@vercel/speed-insights/next"; // Vercel Speed Insights for performance monitoring
import Footer from "./components/footer"; // Your site's global footer
import { baseUrl } from "./sitemap"; // Assuming baseUrl is for generating absolute URLs

// --- Global Metadata ---
// This metadata applies to all pages by default unless overridden by a nested layout or page.
// It's crucial for SEO and how your site appears when shared.
export const metadata: Metadata = {
  metadataBase: new URL(baseUrl), // Base URL for generating absolute paths in metadata
  title: {
    default: "Z-Beam", // Default title for pages without a specific title
    template: "%s | Z-Beam", // Template for page titles (e.g., "Home | Z-Beam")
  },
  description: "This is my portfolio.", // Default site description
  openGraph: {
    title: "Z-Beam",
    description: "This is my portfolio.",
    url: baseUrl, // Canonical URL for the site
    siteName: "Z-Beam",
    locale: "en_US",
    type: "website", // Specifies the type of content for Open Graph
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const cx = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(" ");

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark bg-white dark:text-white dark:bg-gray-800">
      <body className="antialiased flex flex-col min-h-screen bg-white dark:bg-gray-700">
        <Navbar />
        <main className="flex-auto max-w-6xl w-full mx-auto px-4 my-8">
          <div className="prose">{children}</div>
        </main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
