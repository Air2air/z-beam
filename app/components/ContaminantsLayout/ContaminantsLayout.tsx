// app/components/ContaminantsLayout/ContaminantsLayout.tsx
// Specialized layout for contaminant pages using consolidated BaseContentLayout

import React from 'react';
import { BaseContentLayout } from '../BaseContentLayout';
import { RegulatoryStandards } from '../RegulatoryStandards';
import { ScheduleCards } from '../Schedule/ScheduleCards';
import { GridSection } from '../GridSection';
import { CompoundSafetyGrid } from '../CompoundSafetyGrid';
import { CardGrid } from '../CardGrid';
import { materialLinkageToGridItem, contaminantLinkageToGridItem } from '@/app/utils/gridMappers';
import { sortByFrequency } from '@/app/utils/gridSorters';
import { SafetyOverview } from '../Contaminants';
import { convertCitationsToStandards, getEnrichmentMetadata } from '@/app/utils/layoutHelpers';
import type { LayoutProps, ContaminantsLayoutProps, SectionConfig } from '@/types';

// Re-export for convenience
export type { ContaminantsLayoutProps };

export function ContaminantsLayout(props: ContaminantsLayoutProps) {
  const { metadata, children, slug = '', category = '', subcategory = '' } = props;
  const contaminantName = (metadata?.title as string) || metadata?.name || slug;
  const thumbnailLink = `/contaminants/${category}/${subcategory}/${slug}`;
  const heroImage = metadata?.images?.hero?.url;
  
  // Access data from relationships
  const relationships = (metadata as any)?.relationships || {};
  
  // Convert citations using utility
  const regulatoryStandards = convertCitationsToStandards(metadata);
  
  const safetyData = relationships?.laser_properties?.safety_data;
  const compounds = relationships?.produces_compounds || [];

  // Configure sections for BaseContentLayout
  const sections: SectionConfig[] = [
    {
      component: () => (
        <GridSection
          title="Hazardous Compounds Generated"
          description="Compounds produced during laser removal with exposure limits and required safety controls"
        >
          <CompoundSafetyGrid
            compounds={compounds}
            sortBy="severity"
            showConcentrations={true}
            showExceedsWarnings={true}
            columns={3}
          />
        </GridSection>
      ),
      condition: compounds.length > 0,
      props: {}
    },
    {
      component: SafetyOverview,
      condition: !!safetyData,
      props: { safetyData }
    },
    {
      component: RegulatoryStandards,
      condition: regulatoryStandards.length > 0,
      props: {
        standards: regulatoryStandards,
        heroImage,
        thumbnailLink,
      }
    },
    // Material groups (from relationships.materials.groups)
    ...(relationships?.materials?.groups ? Object.values(relationships.materials.groups) : []).flatMap((group: any) => ({
      component: CardGrid,
      condition: group?.items?.length > 0,
      props: {
        items: (group.items || []).filter((item: any) => item && item.frequency).sort(sortByFrequency).map(materialLinkageToGridItem),
        title: group.title,
        description: group.description,
      }
    })),
    // Contaminant groups (from relationships.contaminants.groups)
    ...(relationships?.contaminants?.groups ? Object.values(relationships.contaminants.groups) : []).flatMap((group: any) => ({
      component: CardGrid,
      condition: group?.items?.length > 0,
      props: {
        items: (group.items || []).filter((item: any) => item && item.frequency).sort(sortByFrequency).map(contaminantLinkageToGridItem),
        title: group.title,
        description: group.description,
        variant: 'relationship' as const,
      }
    })),
    {
      component: ScheduleCards,
      props: {}
    },
  ];
  
  return (
    <BaseContentLayout
      {...props}
      contentType="contaminants"
      sections={sections}
      slug={slug}
      category={category}
      subcategory={subcategory}
      title={contaminantName}
    >
      {children}
    </BaseContentLayout>
  );
}

export default ContaminantsLayout;
