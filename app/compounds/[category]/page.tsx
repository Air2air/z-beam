// app/compounds/[category]/page.tsx
// Dynamic compound category pages - uses unified content system

import { getContentConfig } from '@/app/config/contentTypes';
import { generateCategoryMetadata } from '@/app/utils/contentPages/helpers';
import { generateCategoryStaticParams } from '@/app/utils/categories';
import { CategoryPage } from '@/app/components/ContentPages/CategoryPage';
import { COMPOUND_CATEGORY_METADATA } from '@/app/compoundMetadata';

export const dynamic = 'force-static';
export const revalidate = false;

const config = getContentConfig('compounds');

export async function generateStaticParams() {
  return await generateCategoryStaticParams(config);
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ category: string }> 
}) {
  const { category } = await params;
  return await generateCategoryMetadata(config, category, COMPOUND_CATEGORY_METADATA);
}

export default async function CompoundCategoryPage({ 
  params 
}: { 
  params: Promise<{ category: string }> 
}) {
  const { category } = await params;
  
  return (
    <CategoryPage 
      config={config}
      categorySlug={category}
      categoryMetadata={COMPOUND_CATEGORY_METADATA}
    />
  );
}
