// app/netalux/page.tsx
import { Layout } from "../components/Layout/Layout";
import { ContentSection } from "../components/ContentCard";
import { SITE_CONFIG } from "@/app/config";
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import type { ArticleMetadata } from '@/types';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Netalux Needle & Jango Laser Systems | Belgian Tech | Z-Beam',
  description: 'Netalux Needle® (100-300W precision) & Jango® (7500W industrial) laser cleaning systems. Belgian engineering, award-winning technology. Bay Area dealer.',
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
    title: 'Netalux Needle & Jango Laser Systems | Belgian Tech | Z-Beam',
    description: 'Netalux Needle® (100-300W) & Jango® (7500W) laser systems. Belgian engineering, award-winning technology. Bay Area authorized dealer.',
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
  // Load netalux page configuration from YAML
  const yamlPath = path.join(process.cwd(), 'static-pages', 'netalux.yaml');
  const yamlContent = await fs.readFile(yamlPath, 'utf8');
  const pageConfig = yaml.load(yamlContent) as ArticleMetadata & { 
    contentCards?: any[];
    needle100_150?: any;
    needle200_300?: any;
    jangoSpecs?: any;
  };
  
  // Split content cards for specific sections
  const contentCards = pageConfig.contentCards || [];
  const needleCard = contentCards.find(card => card.heading?.includes('Needle'));
  const jangoCard = contentCards.find(card => card.heading?.includes('Jango'));
  const otherCards = contentCards.filter(card => 
    !card.heading?.includes('Needle') && !card.heading?.includes('Jango')
  );
  
  return (
    <Layout
      title={pageConfig.title || "Netalux Laser Cleaning Equipment"}
      pageDescription={pageConfig.description}
      metadata={pageConfig}
      slug="netalux"
    >
      {/* Needle® Section */}
      {needleCard && <ContentSection items={[needleCard]} />}
      
      {/* Jango® Section */}
      {jangoCard && <ContentSection items={[jangoCard]} />}
      
      {/* Other content cards */}
      {otherCards.length > 0 && <ContentSection items={otherCards} />}
    </Layout>
  );
}
