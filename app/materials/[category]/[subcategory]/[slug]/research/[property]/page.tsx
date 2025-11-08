// app/materials/[category]/[subcategory]/[slug]/research/[property]/page.tsx
import { notFound } from "next/navigation";
import { Layout } from "@/app/components/Layout/Layout";
import { ResearchPage } from "@/app/components/Research/ResearchPage";
import { SITE_CONFIG } from "@/app/utils/constants";
import { createMetadata, type ArticleMetadata } from "@/app/utils/metadata";
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

export const dynamic = 'force-static';
export const revalidate = false;

interface ResearchPageProps {
  params: Promise<{ 
    category: string; 
    subcategory: string; 
    slug: string;
    property: string;
  }>;
}

// For now, hardcode granite-density as example
export async function generateStaticParams() {
  return [
    {
      category: 'stone',
      subcategory: 'igneous',
      slug: 'granite-laser-cleaning',
      property: 'density'
    }
  ];
}

async function loadResearchData(material: string, property: string) {
  try {
    const filePath = path.join(process.cwd(), 'frontmatter', 'research', `${material}-${property}-research.yaml`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = yaml.load(fileContent) as any;
    return data;
  } catch (error) {
    console.error(`Error loading research data for ${material}-${property}:`, error);
    return null;
  }
}

export async function generateMetadata({ params }: ResearchPageProps) {
  const { category, subcategory, slug, property } = await params;
  const material = slug.replace('-laser-cleaning', '');
  const data = await loadResearchData(material, property);
  
  if (!data) {
    return {
      title: `Page Not Found | ${SITE_CONFIG.shortName}`,
      description: 'The requested research page could not be found.'
    };
  }
  
  return createMetadata({
    title: data.title || `${property} Research for ${material}`,
    description: data.description || `Deep research into ${property} values for ${material} laser cleaning`,
    canonical: `${SITE_CONFIG.url}/materials/${category}/${subcategory}/${slug}/research/${property}`,
    keywords: data.seo?.keywords || [],
    author: data.author?.name,
    ogImage: data.seo?.og_image || data.images?.property_visualization?.url
  } as unknown as ArticleMetadata);
}

export default async function MaterialResearchPage({ params }: ResearchPageProps) {
  const { category, subcategory, slug, property } = await params;
  const material = slug.replace('-laser-cleaning', '');
  
  const researchData = await loadResearchData(material, property);
  
  if (!researchData) {
    notFound();
  }
  
  return (
    <Layout
      title={researchData.title}
      description={researchData.description}
    >
      <ResearchPage 
        data={researchData}
        category={category}
        subcategory={subcategory}
        materialSlug={slug}
        property={property}
      />
    </Layout>
  );
}
