// app/layout.tsx
import "./css/global.css";
import type { Metadata } from "next";
import { GeistSans, GeistMono } from "geist/font";
import { Navbar } from "./components/Layout/nav";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Footer from "./components/Layout/footer";

// Define default metadata directly here
export const metadata: Metadata = {
  title: "Z-Beam Laser Cleaning Solutions",
  description:
    "Advanced laser cleaning technology for industrial applications. Precision surface preparation, coating removal, and material restoration.",
  keywords:
    "laser cleaning, industrial cleaning, surface preparation, coating removal, rust removal, paint stripping",

  openGraph: {
    title: "Z-Beam Laser Cleaning Solutions",
    description: "Advanced laser cleaning technology for industrial applications.",
    url: "https://z-beam.com",
    siteName: "Z-Beam",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://z-beam.com/images/og/default.jpg",
        width: 1200,
        height: 630,
        alt: "Z-Beam Laser Cleaning",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
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