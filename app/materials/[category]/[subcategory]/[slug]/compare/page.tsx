// app/materials/[category]/[subcategory]/[slug]/compare/page.tsx
import { notFound } from "next/navigation";
import { Layout } from "@/app/components/Layout/Layout";
import { ComparisonPage } from "@/app/components/Comparison/ComparisonPage";
import { SITE_CONFIG } from "@/app/utils/constants";
import { createMetadata, type ArticleMetadata } from "@/app/utils/metadata";
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

export const dynamic = 'force-static';
export const revalidate = false;

interface ComparePageProps {
  params: Promise<{ 
    category: string; 
    subcategory: string; 
    slug: string;
  }>;
}

// For now, hardcode granite comparison as example
export async function generateStaticParams() {
  return [
    {
      category: 'stone',
      subcategory: 'igneous',
      slug: 'granite-laser-cleaning'
    }
  ];
}

async function loadComparisonData(material: string) {
  try {
    const filePath = path.join(process.cwd(), 'frontmatter', 'research', `${material}-material-comparison.yaml`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = yaml.load(fileContent) as any;
    return data;
  } catch (error) {
    console.error(`Error loading comparison data for ${material}:`, error);
    return null;
  }
}

export async function generateMetadata({ params }: ComparePageProps) {
  const { category, subcategory, slug } = await params;
  const material = slug.replace('-laser-cleaning', '');
  const data = await loadComparisonData(material);
  
  if (!data) {
    return {
      title: `Page Not Found | ${SITE_CONFIG.shortName}`,
      description: 'The requested comparison page could not be found.'
    };
  }
  
  return createMetadata({
    title: data.title || `${material} Material Comparison`,
    description: data.description || `Compare ${material} against similar materials for laser cleaning`,
    canonical: `${SITE_CONFIG.url}/materials/${category}/${subcategory}/${slug}/compare`,
    keywords: data.seo?.keywords || [],
    author: data.author?.name,
    ogImage: data.seo?.og_image
  } as unknown as ArticleMetadata);
}

export default async function MaterialComparePage({ params }: ComparePageProps) {
  const { category, subcategory, slug } = await params;
  const material = slug.replace('-laser-cleaning', '');
  
  const comparisonData = await loadComparisonData(material);
  
  if (!comparisonData) {
    notFound();
  }
  
  return (
    <Layout
      title={comparisonData.title}
      description={comparisonData.description}
    >
      <ComparisonPage 
        data={comparisonData}
        category={category}
        subcategory={subcategory}
        materialSlug={slug}
      />
    </Layout>
  );
}
