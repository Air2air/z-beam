// app/contaminants/[category]/page.tsx
// Dynamic contaminant category pages - uses unified content system

import { CONTAMINANT_CATEGORY_METADATA } from '@/app/contaminantMetadata';
import { getContentConfig } from '@/app/config/contentTypes';
import { generateCategoryMetadata } from '@/app/utils/contentPages/helpers';
import { generateCategoryStaticParams, findCategoryBySlug } from '@/app/utils/categories';
import { CategoryPage } from '@/app/components/ContentPages/CategoryPage';

export const dynamic = 'force-static';
export const revalidate = false;

const config = getContentConfig('contaminants');

// Static generation for all category pages
export async function generateStaticParams() {
  return await generateCategoryStaticParams(config);
}

// SEO metadata generation per category
export async function generateMetadata({ params }: { params: { category: string } }) {
  const { category } = params;
  const categoryMetadata = CONTAMINANT_CATEGORY_METADATA[category];
  return generateCategoryMetadata(config, category, categoryMetadata);
}

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export default async function ContaminantCategoryPage({ params }: CategoryPageProps) {
  const { category } = params;
  const categoryData = await findCategoryBySlug(config, category);
  const categoryMetadata = CONTAMINANT_CATEGORY_METADATA[category];
  
  return (
    <CategoryPage 
      config={config}
      categorySlug={category}
      categoryData={categoryData}
      categoryMetadata={categoryMetadata}
    />
  );
}
