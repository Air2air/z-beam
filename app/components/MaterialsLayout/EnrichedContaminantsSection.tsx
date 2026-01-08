// app/components/MaterialsLayout/EnrichedContaminantsSection.tsx
// Async component for loading and displaying enriched contaminant relationships
// Wrapped in Suspense boundary for progressive rendering

import React from 'react';
import { CardGrid } from '../CardGrid';
import { contaminantLinkageToGridItem } from '@/app/utils/gridMappers';
import { sortByFrequency } from '@/app/utils/gridSorters';

interface EnrichedContaminantsSectionProps {
  contaminantRefs: any[];
  contaminatedBySection: any;
  materialName: string;
}

export async function EnrichedContaminantsSection({
  contaminantRefs,
  contaminatedBySection,
  materialName
}: EnrichedContaminantsSectionProps) {
  if (!contaminantRefs || contaminantRefs.length === 0) {
    return null;
  }

  let enrichedContaminants: any[] = [];
  
  try {
    // Import batch loading API (dynamic import for code splitting)
    const { batchEnrichReferences } = await import('@/app/utils/batchContentAPI');
    
    // Single batch fetch for all contaminants (replaces N individual fetches)
    const result = await batchEnrichReferences(contaminantRefs, 'contaminants');
    
    // Type guard: Ensure result is array before assignment
    if (Array.isArray(result)) {
      enrichedContaminants = result;
    } else {
      console.warn('[EnrichedContaminantsSection] batchEnrichReferences returned non-array:', typeof result);
      enrichedContaminants = [];
    }
  } catch (error) {
    console.error('[EnrichedContaminantsSection] Failed to batch load contaminant data:', error);
    enrichedContaminants = [];
  }

  if (enrichedContaminants.length === 0) {
    return null;
  }

  return (
    <CardGrid
      items={enrichedContaminants.sort(sortByFrequency).map(contaminantLinkageToGridItem)}
      title={contaminatedBySection?.title 
        ? contaminatedBySection.title.replace('Common Contaminants', `Common ${materialName} contaminants`) 
        : `Common ${materialName} contaminants`}
      description={contaminatedBySection?.description || 'Contaminants frequently found on this material requiring laser cleaning removal'}
      variant="relationship"
    />
  );
}

// Loading fallback component
export function EnrichedContaminantsSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-6">
            <div className="h-40 bg-gray-200 rounded mb-4"></div>
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
