/**
 * @component RelatedMaterials
 * @purpose Displays related materials from the same subcategory to encourage exploration
 * @dependencies CardGridSSR, getMaterialsBySubcategory
 * @related Layout.tsx
 * @complexity Low (simple grid with filtering)
 * @aiContext Shows 3-6 related materials from same subcategory, excluding current material
 */
// app/components/RelatedMaterials/RelatedMaterials.tsx

import { getMaterialsBySubcategory } from '@/app/utils/materialCategories';
import { CardGridSSR } from '../CardGrid';
import { SectionTitle } from '../SectionTitle/SectionTitle';

export interface RelatedMaterialsProps {
  currentSlug: string;
  category: string;
  subcategory: string;
  className?: string;
  maxItems?: number;
}

export async function RelatedMaterials({
  currentSlug,
  category,
  subcategory,
  className = '',
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
    <section className={className} aria-labelledby="related-materials-heading">
      <SectionTitle 
        title={`Related ${formattedSubcategory} Materials`}
        id="related-materials-heading"
      />
      
      <CardGridSSR
        slugs={relatedSlugs}
        columns={3}
        mode="simple"
        showBadgeSymbols={true}
        loadBadgeSymbolData={true}
      />
    </section>
  );
}
