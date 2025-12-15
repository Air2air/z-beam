// app/materials/[category]/[subcategory]/page.tsx
// Dynamic material subcategory pages - uses unified content system

import { getContentConfig } from '@/app/config/contentTypes';
import { generateSubcategoryMetadata } from '@/app/utils/contentPages/helpers';
import { 
  generateSubcategoryStaticParams,
  getSubcategoryInfoForType 
} from '@/app/utils/categories';
import { SubcategoryPage } from '@/app/components/ContentPages/SubcategoryPage';

export const dynamic = 'force-static';
export const revalidate = false;

const config = getContentConfig('materials');

export async function generateStaticParams() {
  return await generateSubcategoryStaticParams(config);
}

export async function generateMetadata({ params }: { params: Promise<{ category: string; subcategory: string }> }) {
  const { category, subcategory } = await params;
  const subcategoryInfo = await getSubcategoryInfoForType(config, category, subcategory);
  
  if (!subcategoryInfo) {
    return {
      title: 'Subcategory Not Found',
      description: 'The requested subcategory could not be found.'
    };
  }
  
  return generateSubcategoryMetadata(config, category, subcategory, subcategoryInfo);
}

export default async function MaterialSubcategoryPage({ 
  params 
}: { 
  params: Promise<{ category: string; subcategory: string }> 
}) {
  const { category, subcategory } = await params;
  const subcategoryInfo = await getSubcategoryInfoForType(config, category, subcategory);
  
  return (
    <SubcategoryPage 
      config={config}
      categorySlug={category}
      subcategorySlug={subcategory}
      subcategoryInfo={subcategoryInfo}
    />
  );
}
