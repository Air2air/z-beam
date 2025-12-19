// app/compounds/[category]/[subcategory]/[slug]/page.tsx
// Dynamic compound item pages - uses unified content system

import { getContentConfig } from '@/app/config/contentTypes';
import { generateItemMetadata } from '@/app/utils/contentPages/helpers';
import { generateItemStaticParams } from '@/app/utils/categories';
import { ItemPage } from '@/app/components/ContentPages/ItemPage';

export const dynamic = 'force-static';
export const revalidate = false;

const config = getContentConfig('compounds');

export async function generateStaticParams() {
  return await generateItemStaticParams(config);
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ category: string; subcategory: string; slug: string }> 
}) {
  const { category, subcategory, slug } = await params;
  return await generateItemMetadata(config, category, subcategory, slug);
}

export default async function CompoundItemPage({ 
  params 
}: { 
  params: Promise<{ category: string; subcategory: string; slug: string }> 
}) {
  const { category, subcategory, slug } = await params;
  
  return (
    <ItemPage 
      config={config}
      categorySlug={category}
      subcategorySlug={subcategory}
      itemSlug={slug}
    />
  );
}
