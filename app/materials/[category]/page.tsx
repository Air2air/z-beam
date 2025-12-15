// app/materials/[category]/page.tsx
// Dynamic material category pages - uses unified content system

import { CATEGORY_METADATA } from '@/app/metadata';
import { getContentConfig } from '@/app/config/contentTypes';
import { generateCategoryMetadata } from '@/app/utils/contentPages/helpers';
import { generateCategoryStaticParams, findCategoryBySlug } from '@/app/utils/categories';
import { CategoryPage } from '@/app/components/ContentPages/CategoryPage';

export const dynamic = 'force-static';
export const revalidate = false;

const config = getContentConfig('materials');

// Static generation for all category pages
export async function generateStaticParams() {
  return await generateCategoryStaticParams(config);
}

// SEO metadata generation per category
export async function generateMetadata({ params }: { params: { category: string } }) {
  const { category } = params;
  const categoryMetadata = CATEGORY_METADATA[category];
  return generateCategoryMetadata(config, category, categoryMetadata);
}

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export default async function MaterialCategoryPage({ params }: CategoryPageProps) {
  const { category } = params;
  const categoryData = await findCategoryBySlug(config, category);
  const categoryMetadata = CATEGORY_METADATA[category];
  
  return (
    <CategoryPage 
      config={config}
      categorySlug={category}
      categoryData={categoryData}
      categoryMetadata={categoryMetadata}
    />
  );
}
