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
import { SectionContainerDefault } from '../SectionContainer/SectionContainerDefault';
import { getSectionIcon } from '@/app/config/sectionIcons';
import { capitalizeWords } from '@/app/utils/formatting';

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
  
  // Format category and subcategory names for display (e.g., "elemental" -> "Elemental")
  const formattedCategory = capitalizeWords(category.replace(/-/g, ' '));
  const formattedSubcategory = capitalizeWords(subcategory.replace(/-/g, ' '));
  
  return (
    <SectionContainerDefault
      title={`Related ${formattedCategory} › ${formattedSubcategory} Materials`}
      icon={getSectionIcon('related-materials')}
      actionText="Show all"
      actionUrl={`/search?q=${encodeURIComponent(category)}`}
    >
      <CardGridSSR
        slugs={relatedSlugs}
        columns={3}
        mode="simple"
        showBadgeSymbols={true}
        loadBadgeSymbolData={true}
      />
    </SectionContainerDefault>
  );
}
