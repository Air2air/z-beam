// app/layout.tsx
import "./css/global.css";
import type { Metadata, Viewport } from "next";
import { GeistSans, GeistMono } from "geist/font";
import { Navbar } from "./components/Layout/nav";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Footer from "./components/Layout/footer";
import { SITE_CONFIG } from "./utils/constants";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    template: `%s | ${SITE_CONFIG.name}`,
    default: SITE_CONFIG.name,
  },
  description: SITE_CONFIG.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} dark text-white bg-gray-800 scroll-smooth`}
    >
      <body className="antialiased flex flex-col min-h-screen bg-gray-700 text-gray-200">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
