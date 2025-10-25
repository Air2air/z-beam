// app/netalux/page.tsx
import { StaticPage } from "../components/StaticPage/StaticPage";
import { SITE_CONFIG } from "@/app/config";

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: `Netalux Laser Cleaning Equipment | ${SITE_CONFIG.shortName}`,
  description: 'Comprehensive specifications and comparison of Netalux Needle® and Jango® laser cleaning systems. Industry-leading technology for precision cleaning and large-scale industrial applications.',
  keywords: [
    'Netalux laser cleaning',
    'Needle laser system',
    'Jango laser system',
    'industrial laser cleaning equipment',
    'precision laser cleaning',
    'Top-Hat beam laser',
    'Gaussian beam laser',
    'laser cleaning specifications'
  ],
  
  // OpenGraph for Facebook, LinkedIn
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: `${SITE_CONFIG.url}/netalux`,
    title: 'Netalux Laser Cleaning Equipment - Needle® & Jango® Series',
    description: 'Award-winning precision laser cleaning systems from Belgium. Compare Needle® (100-300W) and Jango® (7500W) models for industrial applications.',
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: '/images/partners/partner-netalux.webp',
        width: 1200,
        height: 630,
        alt: 'Netalux laser cleaning equipment - Needle and Jango systems',
      }
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Netalux Laser Cleaning Equipment | Z-Beam',
    description: 'Award-winning Needle® and Jango® laser cleaning systems. Complete specifications and comparisons.',
    images: ['/images/partners/partner-netalux.webp'],
  },
  
  // Robots
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
  
  // Canonical URL
  alternates: {
    canonical: `${SITE_CONFIG.url}/netalux`,
  },
};

export default async function NetaluxPage() {
  return (
    <StaticPage 
      slug="netalux" 
      fallbackTitle="Netalux Laser Cleaning Equipment"
      fallbackDescription={metadata.description}
    />
  );
}
