// app/layout.tsx
import "./css/global.css";
import type { Metadata } from "next";
import { GeistSans, GeistMono } from "geist/font";
import { Navbar } from "./components/nav";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Footer from "./components/footer";
import { baseUrl } from "./sitemap";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Z-Beam",
    template: "%s | Z-Beam",
  },
  description: "This is my portfolio.",
  openGraph: {
    title: "Z-Beam",
    description: "This is my portfolio.",
    url: baseUrl,
    siteName: "Z-Beam",
    locale: "en_US",
    type: "website",
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

// You can keep cx if you use it elsewhere, but it's not directly used in this layout
// const cx = (...classes: (string | boolean | undefined | null)[]) =>
//   classes.filter(Boolean).join(" ");

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      // Removed 'bg-white', kept 'dark', 'dark:text-white', 'dark:bg-gray-800'
      // You can even simplify further if your global.css handles primary colors
      className={`${GeistSans.variable} ${GeistMono.variable} dark text-white bg-gray-800`}
    >
      <body
        className="antialiased flex flex-col min-h-screen bg-gray-700 text-gray-200" // Set default text color for body content
      >
        <Navbar />
        {/*
          Delegated markup:
          - flex-auto: Allows main content to grow and push footer down.
          - max-w-6xl: Maximum width for content.
          - w-full: Takes full width available within max-w.
          - mx-auto: Centers the content.
          - px-4: Horizontal padding for smaller screens.
          - py-8 sm:py-12: Consistent vertical padding for all pages.
          
          Removed the `div.prose` wrapper here, as `prose` is for content blocks,
          not the entire page. It will be applied where MDX content is rendered.
        */}
        <main className="flex-auto max-w-6xl w-full mx-auto px-4 py-8 sm:py-12">
          {children} {/* All page content will be rendered inside this main tag */}
        </main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}