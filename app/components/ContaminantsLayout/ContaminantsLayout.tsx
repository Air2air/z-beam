// app/components/ContaminantsLayout/ContaminantsLayout.tsx
// Specialized layout for contaminant pages using consolidated BaseContentLayout

import React from 'react';
import { BaseContentLayout } from '../BaseContentLayout';
import { RegulatoryStandards } from '../RegulatoryStandards';
import { ScheduleCards } from '../Schedule/ScheduleCards';
import { GridSection } from '../GridSection';
import { CompoundSafetyGrid } from '../CompoundSafetyGrid';
import { CardGrid } from '../CardGrid';
import { SafetyDataPanel } from '../SafetyDataPanel/SafetyDataPanel';
import { materialLinkageToGridItem, compoundLinkageToGridItem } from '@/app/utils/gridMappers';
import { sortByFrequency } from '@/app/utils/gridSorters';
import { SafetyOverview } from '../Contaminants';
import { convertCitationsToStandards, getEnrichmentMetadata } from '@/app/utils/layoutHelpers';
import { getCompoundArticle, getContaminantArticle, getArticle } from '@/app/utils/contentAPI';
import ContaminantDatasetDownloader from '../Dataset/ContaminantDatasetDownloader';
import type { LayoutProps, ContaminantsLayoutProps, SectionConfig } from '@/types';

// Re-export for convenience
export type { ContaminantsLayoutProps };

export async function ContaminantsLayout(props: ContaminantsLayoutProps) {
  const { metadata, children, slug = '', category = '', subcategory = '' } = props;
  const contaminantName = (metadata?.title as string) || metadata?.name || slug;
  const thumbnailLink = `/contaminants/${category}/${subcategory}/${slug}`;
  const heroImage = metadata?.images?.hero?.url;
  
  // Access data from relationships
  const relationships = (metadata as any)?.relationships || {};
  
  // Convert citations using utility
  const regulatoryStandards = convertCitationsToStandards(metadata);
  
  const safetyData = relationships?.laser_properties?.safety_data;

  // Enrich minimal references with full compound data
  const producesCompounds = relationships?.produces_compounds?.items || [];
  const enrichedCompounds = await Promise.all(
    producesCompounds.map(async (ref: { id: string; phase?: string; hazard_level?: string }) => {
      const article = await getCompoundArticle(ref.id);
      if (!article) return null;
      
      const metadata = article.metadata as any; // Allow images.hero access
      return {
        id: ref.id,
        title: metadata.name || metadata.title,
        category: metadata.category,
        description: metadata.description,
        url: metadata.full_path || `/compounds/${ref.id}`,
        phase: ref.phase,
        hazard_level: ref.hazard_level,
        image: metadata.images?.hero?.url,
      };
    })
  ).then(items => items.filter(Boolean));

  // Enrich minimal references with full material data
  const foundOnMaterials = relationships?.found_on_materials?.items || [];
  const enrichedMaterials = await Promise.all(
    foundOnMaterials.map(async (ref: { id: string }) => {
      const article = await getArticle(ref.id);
      if (!article) return null;
      
      const metadata = article.metadata as any; // Allow images.hero access
      return {
        id: ref.id,
        title: metadata.name || metadata.title,
        category: metadata.category,
        description: metadata.description,
        url: metadata.full_path || `/materials/${ref.id}`,
        image: metadata.images?.hero?.url,
      };
    })
  ).then(items => items.filter(Boolean));

  // Configure sections for BaseContentLayout
  const sections: SectionConfig[] = [
    {
      component: () => (
        <GridSection
          title="Hazardous Compounds Generated"
          description="Compounds produced during laser removal with exposure limits and required safety controls"
        >
          <CompoundSafetyGrid
            compounds={enrichedCompounds}
            sortBy="severity"
            showConcentrations={true}
            showExceedsWarnings={true}
            columns={3}
          />
        </GridSection>
      ),
      condition: enrichedCompounds.length > 0,
      props: {}
    },
    {
      component: SafetyDataPanel,
      condition: !!safetyData,
      props: { 
        safetyData,
        compounds: enrichedCompounds
      }
    },
    {
      component: SafetyOverview,
      condition: !!safetyData,
      props: { safetyData }
    },
    {
      component: ContaminantDatasetDownloader,
      props: {
        contaminantName,
        slug,
        category,
        subcategory,
        laserProperties: relationships?.laser_properties,
        visualCharacteristics: relationships?.visual_characteristics,
        removalByMaterial: relationships?.removal_by_material,
        composition: (metadata as any)?.composition,
        safetyData: relationships?.safety_data || (metadata as any)?.safety_data,
        faq: metadata?.faq,
        regulatoryStandards: (metadata as any)?.regulatoryStandards || relationships?.regulatory_standards,
        showFullDataset: true,
      }
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
    // Relationship cards for produces_compounds
    {
      component: CardGrid,
      condition: enrichedCompounds.length > 0,
      props: {
        items: enrichedCompounds.map(compoundLinkageToGridItem),
        title: 'Compounds Produced',
        description: 'Compounds generated during laser removal of this contaminant',
        variant: 'relationship' as const,
      }
    },
    // Relationship cards for found_on_materials
    {
      component: CardGrid,
      condition: enrichedMaterials.length > 0,
      props: {
        items: enrichedMaterials.map(materialLinkageToGridItem),
        title: 'Found On Materials',
        description: 'Materials where this contaminant is commonly found',
      }
    },
    // ScheduleCards MUST be last section for all layouts
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
