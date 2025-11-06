/**
 * @component RelatedMaterials
 * @purpose Displays related materials from the same subcategory to encourage exploration
 * @dependencies SectionContainer, CardGridSSR, getMaterialsBySubcategory
 * @related Layout.tsx
 * @complexity Low (simple grid with filtering)
 * @aiContext Shows 3-6 related materials from same subcategory, excluding current material
 */
// app/components/RelatedMaterials/RelatedMaterials.tsx

import { getMaterialsBySubcategory } from '@/app/utils/materialCategories';
import { CardGridSSR } from '../CardGrid';
import { SectionContainer } from '../SectionContainer/SectionContainer';
import { Button } from '../Button';

export interface RelatedMaterialsProps {
  currentSlug: string;
  category: string;
  subcategory: string;
  maxItems?: number;
}

export async function RelatedMaterials({
  currentSlug,
  category,
  subcategory,
  maxItems = 6
}: RelatedMaterialsProps) {
  // Get all materials in this subcategory
  const materials = await getMaterialsBySubcategory(category, subcategory);
  
  // Filter out current material and limit results
  const relatedSlugs = materials
    .filter(m => m.slug !== currentSlug)
    .slice(0, maxItems)
    .map(m => m.slug);
  
  // Don't render if no related materials
  if (relatedSlugs.length === 0) return null;
  
  // Format subcategory name for display (e.g., "elemental" -> "Elemental")
  const formattedSubcategory = subcategory
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return (
    <SectionContainer 
      title={`Related ${formattedSubcategory} Materials`}
      bgColor="transparent"
      radius={false}
    >
      <div className="flex justify-end mb-4 -mt-12">
        <Button
          variant="primary"
          size="md"
          href={`/search?q=${encodeURIComponent(category)}`}
          showIcon={true}
        >
          Show all
        </Button>
      </div>
      
      <CardGridSSR
        slugs={relatedSlugs}
        columns={3}
        mode="simple"
        showBadgeSymbols={true}
        loadBadgeSymbolData={true}
      />
    </SectionContainer>
  );
}
