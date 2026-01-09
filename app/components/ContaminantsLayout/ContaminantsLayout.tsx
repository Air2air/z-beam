// app/components/ContaminantsLayout/ContaminantsLayout.tsx
// Specialized layout for contaminant pages using consolidated BaseContentLayout

import React from 'react';
import { BaseContentLayout } from '../BaseContentLayout';
import { RegulatoryStandards } from '../RegulatoryStandards';
import { ScheduleCards } from '../Schedule/ScheduleCards';
import { CardGrid } from '../CardGrid';
import { SafetyDataPanel } from '../SafetyDataPanel/SafetyDataPanel';
import { DescriptiveDataPanel } from '../DescriptiveDataPanel';
import { Collapsible } from '../Collapsible';
import { RelationshipsDump } from '../RelationshipsDump/RelationshipsDump';
import { IndustryApplicationsPanel } from '../IndustryApplicationsPanel';
import { sortByFrequency } from '@/app/utils/gridSorters';
import { getRelationshipSection } from '@/app/utils/relationshipHelpers';
import ContaminantDatasetDownloader from '../Dataset/ContaminantDatasetDownloader';
import type { LayoutProps, ContaminantsLayoutProps, SectionConfig } from '@/types';

/**
 * Denormalized compound item structure
 * After backend denormalization, each compound will have all required fields
 */
interface DenormalizedCompoundItem {
  id: string;
  title: string;
  name: string;
  category: string;
  subcategory: string;
  url: string;
  image: string;
  description: string;
  phase: string;
  hazardLevel: string;
}

/**
 * Denormalized material item structure (Phase 2)
 * After backend denormalization, each material will have all 8 required fields
 */
interface DenormalizedMaterialItem {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  url: string;
  image: string;
  description: string;
  frequency: string;
  difficulty: string;
}

// Re-export for convenience
export type { ContaminantsLayoutProps };

export async function ContaminantsLayout(props: ContaminantsLayoutProps) {
  const { metadata, children, slug = '', category = '', subcategory = '' } = props;
  const rawTitle = (metadata?.title as string) || metadata?.name || slug;
  // Remove ' Laser Cleaning' suffix from page title
  const contaminantName = rawTitle.replace(/ Laser Cleaning$/i, '');
  const thumbnailLink = `/contaminants/${category}/${subcategory}/${slug}`;
  const heroImage = metadata?.images?.hero?.url;
  
  // All data comes directly from frontmatter - no transformation needed
  const relationships = (metadata as any)?.relationships || {};
  const industryApplications = relationships?.operational?.industryApplications?.items || [];
  const regulatoryStandards = relationships?.safety?.regulatoryStandards?.items || [];
  const safetyData = relationships?.safety || {};
  
  // Relationship data - complete from frontmatter
  const producesCompounds = relationships?.interactions?.producesCompounds?.items || [];
  const affectsMaterials = relationships?.interactions?.affectsMaterials?.items || [];
  const visualCharacteristics = relationships?.descriptive?.visualCharacteristics || {};
  const laserProperties = relationships?.technical?.laserProperties || {};

  // Configure sections for BaseContentLayout
  const sections: SectionConfig[] = [
    // Relationship cards for produces_compounds (interactions.produces_compounds or technical.produces_compounds)
    {
      component: CardGrid,
      condition: producesCompounds.length > 0,
      props: {
        items: (producesCompounds as DenormalizedCompoundItem[]).map(c => ({
          slug: c.id,
          href: c.url,
          title: c.title,
          imageUrl: c.image,
          imageAlt: c.title,
          category: c.category,
          metadata: {
            phase: c.phase,
            hazard_level: c.hazardLevel,
          },
        })),
        title: `Compounds produced by ${contaminantName}`,
        description: undefined,
        variant: 'relationship' as const,
      }
    },
    {
      component: SafetyDataPanel,
      condition: !!safetyData,
      props: { 
        safetyData,
        compounds: [], // Compounds now rendered by dedicated CardGrid section above
        collapsible: true,
        entityName: contaminantName
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
    // Relationship cards for found_on_materials
    {
      component: CardGrid,
      condition: affectsMaterials.length > 0,
      props: {
        items: (affectsMaterials as DenormalizedMaterialItem[]).map(m => ({
          slug: m.id,
          href: m.url,
          title: m.name,
          imageUrl: m.image,
          imageAlt: m.name,
          category: m.category,
          metadata: {
            frequency: m.frequency,
            difficulty: m.difficulty,
          },
        })),
        title: `Materials affected by ${contaminantName}`,
        description: undefined,
        variant: 'relationship' as const,
      }
    },
    {
      component: IndustryApplicationsPanel,
      condition: !!industryApplications,
      props: {
        applications: industryApplications,
        entityName: contaminantName,
        variant: 'contaminants' as const,
      }
    },
    // Visual characteristics - collapsible or descriptive based on presentation
    {
      component: visualCharacteristics?.presentation === 'descriptive' ? Collapsible : DescriptiveDataPanel,
      condition: !!visualCharacteristics,
      props: {
        items: visualCharacteristics?.items || [],
        sectionMetadata: {
          ...visualCharacteristics?.metadata,
          title: `Visual characteristics of ${contaminantName}`,
        },
      }
    },
    {
      component: DescriptiveDataPanel,
      condition: !!laserProperties,
      props: {
        items: laserProperties?.items || [],
        sectionMetadata: laserProperties?.metadata,
      }
    },
    // DUMP ALL RELATIONSHIPS FOR ANALYSIS (development only)
    {
      component: RelationshipsDump,
      condition: () => process.env.NODE_ENV === 'development',
      props: {
        relationships,
        entityName: contaminantName,
      }
    },
    // Dataset downloader at bottom
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
