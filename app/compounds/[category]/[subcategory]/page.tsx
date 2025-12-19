// app/compounds/[category]/[subcategory]/page.tsx
// Dynamic compound subcategory pages - uses unified content system

import { getContentConfig } from '@/app/config/contentTypes';
import { generateSubcategoryMetadata } from '@/app/utils/contentPages/helpers';
import { generateSubcategoryStaticParams } from '@/app/utils/categories';
import { SubcategoryPage } from '@/app/components/ContentPages/SubcategoryPage';

export const dynamic = 'force-static';
export const revalidate = false;

const config = getContentConfig('compounds');

export async function generateStaticParams() {
  return await generateSubcategoryStaticParams(config);
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ category: string; subcategory: string }> 
}) {
  const { category, subcategory } = await params;
  return await generateSubcategoryMetadata(config, category, subcategory);
}

export default async function CompoundSubcategoryPage({ 
  params 
}: { 
  params: Promise<{ category: string; subcategory: string }> 
}) {
  const { category, subcategory } = await params;
  
  return (
    <SubcategoryPage 
      config={config}
      categorySlug={category}
      subcategorySlug={subcategory}
    />
  );
}
