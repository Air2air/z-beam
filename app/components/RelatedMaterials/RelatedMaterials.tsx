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
import Link from 'next/link';

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
      <div className="flex items-center justify-between mb-8">
        <h2 
          id="related-materials-heading"
          className="text-gray-900 dark:text-white"
        >
          Related {formattedSubcategory} Materials
        </h2>
        <Link
          href={`/search?q=${encodeURIComponent(category)}`}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Show all
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      
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
