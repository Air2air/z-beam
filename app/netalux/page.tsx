// app/netalux/page.tsx
import { Layout } from "../components/Layout/Layout";
import { ContentSection } from "../components/ContentCard";
import { ComparisonTable } from "../components/ComparisonTable/ComparisonTable";
import { Table } from "../components/Table/Table";
import { SITE_CONFIG } from "@/app/config";
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import type { ArticleMetadata } from '@/types';

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
      description={pageConfig.description || metadata.description}
      metadata={pageConfig}
      slug="netalux"
    >
      {/* Needle® Section: Card followed by comparison table */}
      {needleCard && (
        <>
          <ContentSection items={[needleCard]} />
          {pageConfig.needle100_150 && pageConfig.needle200_300 && (
            <div className="my-12">
              <ComparisonTable
                title="Needle® Model Comparison"
                model1Data={pageConfig.needle100_150}
                model2Data={pageConfig.needle200_300}
                model1Name="Needle® 100/150"
                model2Name="Needle® 200/300"
                variant="compact"
              />
            </div>
          )}
        </>
      )}
      
      {/* Jango® Section: Card followed by specs table */}
      {jangoCard && (
        <>
          <ContentSection items={[jangoCard]} />
          {pageConfig.jangoSpecs && (
            <div className="my-12">
              <Table content="" frontmatterData={pageConfig.jangoSpecs} config={{}} />
            </div>
          )}
        </>
      )}
      
      {/* Other content cards */}
      {otherCards.length > 0 && <ContentSection items={otherCards} />}
    </Layout>
  );
}
