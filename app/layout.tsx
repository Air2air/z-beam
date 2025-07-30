// app/layout.tsx
import "./css/global.css";
import type { Metadata } from "next";
import { GeistSans, GeistMono } from "geist/font";
import { Navbar } from "./components/Layout/nav";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Footer from "./components/Layout/footer";
import { getDefaultMetadata } from "./utils/metadataGenerator";

// Use the utility function for base metadata
export const metadata: Metadata = getDefaultMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} dark text-white bg-gray-800`}
    >
      <body className="antialiased flex flex-col min-h-screen bg-gray-700 text-gray-200">
        <Navbar />
        <main className="flex-auto max-w-6xl w-full mx-auto px-4 py-8 sm:py-12">
          {children}
        </main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}