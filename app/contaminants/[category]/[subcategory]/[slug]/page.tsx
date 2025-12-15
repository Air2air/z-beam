// app/contaminants/[category]/[subcategory]/[slug]/page.tsx
// Dynamic contaminant item pages - uses unified content system
// Force cache bust for Vercel build

import { getContentConfig } from '@/app/config/contentTypes';
import { generateItemMetadata } from '@/app/utils/contentPages/helpers';
import { generateItemStaticParams } from '@/app/utils/categories';
import { ItemPage } from '@/app/components/ContentPages/ItemPage';

export const dynamic = 'force-static';
export const revalidate = false;

const config = getContentConfig('contaminants');

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

export default async function ContaminantItemPage({ 
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
