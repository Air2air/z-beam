// app/components/ContaminantsLayout/ContaminantsLayout.tsx
// Specialized layout for contaminant pages using consolidated BaseContentLayout
// Refactored Feb 4, 2026 to use consolidated relationship utilities

import React from 'react';
import { BaseContentLayout } from '../BaseContentLayout';
import { RegulatoryStandards } from '../RegulatoryStandards';
import { ScheduleCards } from '../Schedule/ScheduleCards';
import { SafetyDataPanel } from '../SafetyDataPanel/SafetyDataPanel';
import { DescriptiveDataPanel } from '../DescriptiveDataPanel';
import { Collapsible } from '../Collapsible';
import { RelationshipsDump } from '../RelationshipsDump/RelationshipsDump';
import { IndustryApplicationsPanel } from '../IndustryApplicationsPanel';
import ContaminantDatasetDownloader from '../Dataset/ContaminantDatasetDownloader';
import { SectionConfigBuilder } from '@/app/utils/sectionConfigBuilder';
import type { ContaminantsLayoutProps } from '@/types';

/**
 * Denormalized compound item structure (legacy - use types/relationships.ts)
 * @deprecated Use CompoundRelationshipItem from @/types
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
 * Denormalized material item structure (legacy - use types/relationships.ts)
 * @deprecated Use MaterialRelationshipItem from @/types
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
  
  // Relationship data - extracted via accessors (no longer needed individually)
  const visualCharacteristics = relationships?.visual?.appearanceOnCategories || {};
  const laserProperties = relationships?.operational?.laserProperties || {};

  // Build sections using consolidated builder pattern
  const sections = new SectionConfigBuilder()
    // Use consolidated relationship CardGrid builder for compounds
    .addRelationshipCardGrid(
      relationships,
      'interactions',
      'producesCompounds',
      'compound',
      contaminantName
    )
    .addConditional(
      !!safetyData,
      {
        component: SafetyDataPanel,
        props: { 
          safetyData,
          compounds: [],
          collapsible: true,
          entityName: contaminantName
        }
      }
    )
    .addConditional(
      regulatoryStandards.length > 0,
      {
        component: RegulatoryStandards,
        props: {
          standards: regulatoryStandards,
          heroImage,
          thumbnailLink,
        }
      }
    )
    // Use consolidated relationship CardGrid builder for materials
    .addRelationshipCardGrid(
      relationships,
      'interactions',
      'affectsMaterials',
      'material',
      contaminantName
    )
    .addConditional(
      !!industryApplications,
      {
        component: IndustryApplicationsPanel,
        props: {
          applications: industryApplications,
          entityName: contaminantName,
          variant: 'contaminants' as const,
        }
      }
    )
    .addConditional(
      !!visualCharacteristics,
      {
        component: visualCharacteristics?.presentation === 'descriptive' ? Collapsible : DescriptiveDataPanel,
        props: {
          items: visualCharacteristics?.items || [],
          sectionMetadata: {
            ...visualCharacteristics?.frontmatter,
            title: `Visual characteristics of ${contaminantName}`,
          },
        }
      }
    )
    .addConditional(
      !!laserProperties,
      {
        component: DescriptiveDataPanel,
        props: {
          items: laserProperties?.items || [],
          sectionMetadata: laserProperties?.frontmatter,
        }
      }
    )
    .addConditional(
      process.env.NODE_ENV === 'development',
      {
        component: RelationshipsDump,
        props: {
          relationships,
          entityName: contaminantName,
        }
      }
    )
    .addComponent({
      component: ContaminantDatasetDownloader,
      props: {
        contaminantName,
        slug,
        category,
        subcategory,
        laserProperties: relationships?.operational?.laserProperties,
        visualCharacteristics: relationships?.visual?.appearanceOnCategories,
        removalByMaterial: relationships?.interactions?.affectsMaterials,
        composition: (metadata as any)?.composition,
        safetyData: relationships?.safety,
        faq: metadata?.faq,
        regulatoryStandards: relationships?.safety?.regulatoryStandards?.items,
        showFullDataset: true,
      }
    })
    .addComponent({
      component: ScheduleCards,
      props: {}
    })
    .build();
  
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
