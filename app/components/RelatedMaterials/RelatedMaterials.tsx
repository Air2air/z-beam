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
import { BaseSection } from '../BaseSection/BaseSection';
import { getSectionIcon } from '@/app/config/sectionIcons';
import { capitalizeWords } from '@/app/utils/formatting';
import { Button } from '../Button';
import type { RelatedMaterialsProps } from '@/types';

export async function RelatedMaterials({
  currentSlug,
  category,
  subcategory,
  maxItems = 6,
  sectionTitle,
  sectionDescription
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
  
  // Use provided title/description or fall back to defaults
  const title = sectionTitle || `Other ${formattedSubcategory} Materials`;
  const description = sectionDescription || `Explore other ${formattedSubcategory.toLowerCase()} materials suitable for laser cleaning applications`;
  
  return (
    <BaseSection
      title={title}
      description={description}
      icon={getSectionIcon('related-materials')}
      action={
        <Button 
          variant="primary" 
          size="md" 
          href={`/search?q=${encodeURIComponent(category)}`}
          showIcon
        >
          {formattedSubcategory}
        </Button>
      }
    >
      <CardGridSSR
        slugs={relatedSlugs}
        columns={3}
        mode="simple"
        showBadgeSymbols={true}
        loadBadgeSymbolData={true}
      />
    </BaseSection>
  );
}
