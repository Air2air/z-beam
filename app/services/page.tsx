// app/services/page.tsx
import { Layout } from "../components/Layout/Layout";
import { ContentSection } from "../components/ContentCard";
import { ScheduleCards } from "../components/Schedule/ScheduleCards";
import { SITE_CONFIG } from "@/app/config";
import { JsonLD } from "@/app/components/JsonLD/JsonLD";
import { SchemaRegistry } from "@/app/utils/schemas/registry";
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import type { ArticleMetadata } from '@/types';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Industrial Laser Cleaning Services | Bay Area',
  description: `Precision laser cleaning: no chemicals, no abrasives, no substrate damage. Faster setup than sandblasting, zero hazardous waste. Bay Area mobile service.`,
  alternates: {
    canonical: `${SITE_CONFIG.url}/services`,
  },
  openGraph: {
    title: 'Laser Cleaning Services | Bay Area Mobile | Z-Beam',
    description: `Precision laser cleaning: no chemicals, no abrasives, no substrate damage. Faster setup than sandblasting, zero hazardous waste. Bay Area mobile service.`,
    url: `${SITE_CONFIG.url}/services`,
    siteName: SITE_CONFIG.name,
    type: 'website',
    images: [
      {
        url: `${SITE_CONFIG.url}/images/og-services.jpg`,
        width: 1200,
        height: 630,
        alt: 'Professional Laser Cleaning Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Laser Cleaning Services | Bay Area Mobile | Z-Beam',
    description: `Precision laser cleaning: no chemicals, no substrate damage. Faster than sandblasting. Bay Area service.`,
  },
};

export default async function ServicesPage() {
  const pricing = SITE_CONFIG.pricing.professionalCleaning;
  
  // Load services page configuration from YAML
  const yamlPath = path.join(process.cwd(), 'static-pages', 'services.yaml');
  const yamlContent = await fs.readFile(yamlPath, 'utf8');
  const pageConfig = yaml.load(yamlContent) as ArticleMetadata & { contentCards?: any[] };
  
  // Generate schemas using centralized registry
  const serviceSchema = SchemaRegistry.getPageSchemas('services', {
    pricing,
    description: 'Professional on-site laser cleaning service with experienced technicians and state-of-the-art equipment. Specializing in industrial surface preparation, rust removal, coating removal, and precision cleaning for aerospace, automotive, and manufacturing industries.'
  });
  
  return (
    <>
      <JsonLD data={serviceSchema} />
      <Layout
        title={pageConfig.title || "Professional Laser Cleaning Services"}
        description={pageConfig.description || metadata.description}
        metadata={pageConfig}
        slug="services"
      >
        {pageConfig.contentCards && pageConfig.contentCards.length > 0 && (
          <ContentSection items={pageConfig.contentCards} />
        )}
        
        {/* Schedule Cards */}
        <div className="mb-16">
          <ScheduleCards />
        </div>
      </Layout>
    </>
  );
}
