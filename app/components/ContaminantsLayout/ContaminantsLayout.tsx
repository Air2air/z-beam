// app/components/ContaminantsLayout/ContaminantsLayout.tsx
// Specialized layout for contaminant pages using consolidated BaseContentLayout

import React from 'react';
import { BaseContentLayout } from '../BaseContentLayout';
import { RegulatoryStandards } from '../RegulatoryStandards';
import { ScheduleCards } from '../Schedule/ScheduleCards';
import { GridSection } from '../GridSection';
import { CompoundSafetyGrid } from '../CompoundSafetyGrid';
import { LinkageGridGroup } from '../LinkageGridGroup';
import { SafetyOverview } from '../Contaminants';
import { convertCitationsToStandards, getEnrichmentMetadata } from '@/app/utils/layoutHelpers';
import type { LayoutProps } from '@/types';
import type { SectionConfig } from '../BaseContentLayout';

interface ContaminantsLayoutProps extends LayoutProps {
  slug?: string;
  category?: string;
  subcategory?: string;
}

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
    {
      component: LinkageGridGroup,
      condition: () => {
        const hasMaterials = relationships?.related_materials?.length > 0;
        const hasContaminants = relationships?.related_contaminants?.length > 0;
        const hasSettings = relationships?.related_settings?.length > 0;
        return hasMaterials || hasContaminants || hasSettings;
      },
      props: {
        title: 'Related Content',
        description: 'Explore compatible materials, related contaminants, and removal settings',
        grids: [
          {
            data: (metadata as any)?.related_materials || [],
            type: 'materials' as const,
            ...getEnrichmentMetadata(
              metadata,
              'material_linkage',
              'Compatible Materials',
              'Materials frequently contaminated by this substance'
            ),
            sortBy: 'frequency' as const,
          },
          {
            data: (metadata as any)?.related_contaminants || [],
            type: 'contaminants' as const,
            ...getEnrichmentMetadata(
              metadata,
              'compound_linkage',
              'Related Contaminants',
              'Contaminants that often appear together with this substance'
            ),
            sortBy: 'severity' as const,
            variant: 'domain-linkage' as const,
          },
          {
            data: (metadata as any)?.related_settings || [],
            type: 'settings' as const,
            ...getEnrichmentMetadata(
              metadata,
              'settings_linkage',
              'Recommended Settings',
              'Machine settings optimized for removing this contaminant'
            ),
            sortBy: 'frequency' as const,
          },
        ],
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
      contentType="contaminants"
      sections={sections}
      slug={slug}
      category={category}
      subcategory={subcategory}
    >
      {children}
    </BaseContentLayout>
  );
}

export default ContaminantsLayout;
