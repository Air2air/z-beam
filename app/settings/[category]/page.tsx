// app/settings/[category]/page.tsx
// Dynamic settings category pages - uses unified content system

import { getContentConfig } from '@/app/config/contentTypes';
import { generateCategoryMetadata } from '@/app/utils/contentPages/helpers';
import { generateCategoryStaticParams, findCategoryBySlug } from '@/app/utils/categories';
import { CategoryPage } from '@/app/components/ContentPages/CategoryPage';

export const dynamic = 'force-static';
export const revalidate = false;

const config = getContentConfig('settings');

export async function generateStaticParams() {
  return await generateCategoryStaticParams(config);
}

export async function generateMetadata({ params }: { params: { category: string } }) {
  const { category } = params;
  // Note: Settings don't have category metadata yet, but structure matches materials
  return generateCategoryMetadata(config, category);
}

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export default async function SettingsCategoryPage({ params }: CategoryPageProps) {
  const { category } = params;
  const categoryData = await findCategoryBySlug(config, category);
  
  return (
    <CategoryPage 
      config={config}
      categorySlug={category}
      categoryData={categoryData}
      // categoryMetadata omitted - settings don't have category-level metadata
    />
  );
}
