// app/components/CompoundsLayout/CompoundsLayout.tsx
// Specialized layout for hazardous compound pages

import React from 'react';
import { BaseContentLayout } from '../BaseContentLayout';
import { CardGrid } from '../CardGrid';
import { ScheduleCards } from '../Schedule/ScheduleCards';
import { contaminantLinkageToGridItem } from '@/app/utils/gridMappers';
import { sortByFrequency } from '@/app/utils/gridSorters';
import type { LayoutProps, SectionConfig, CompoundsLayoutProps } from '@/types';

// Re-export for convenience
export type { CompoundsLayoutProps };

export function CompoundsLayout(props: CompoundsLayoutProps) {
  const { metadata, children, slug = '', category = '', subcategory = '' } = props;
  
  // Access data from relationships
  const relationships = (metadata as any)?.relationships || {};
  
  // Source contaminants that produce this compound
  // Handle both array format and object with items array
  const sourceContaminantsRaw = relationships?.source_contaminants;
  const sourceContaminants = Array.isArray(sourceContaminantsRaw) 
    ? sourceContaminantsRaw 
    : (sourceContaminantsRaw?.items || []);

  // Configure sections for BaseContentLayout
  const sections: SectionConfig[] = [
    {
      component: CardGrid,
      condition: sourceContaminants.length > 0,
      props: {
        items: sourceContaminants
          .filter((item: any) => item && item.frequency)
          .sort(sortByFrequency)
          .map(contaminantLinkageToGridItem),
        title: sourceContaminantsRaw?.title || 'Contaminant Sources',
        description: sourceContaminantsRaw?.description || 'Contaminants that produce this compound during laser cleaning operations',
        variant: 'relationship' as const,
      }
    },
    {
      component: ScheduleCards,
      props: {}
    },
  ];
  
  return (
    <BaseContentLayout
      {...props}
      contentType="compounds"
      sections={sections}
      slug={slug}
      category={category}
      subcategory={subcategory}
    >
      {children}
    </BaseContentLayout>
  );
}

export default CompoundsLayout;
