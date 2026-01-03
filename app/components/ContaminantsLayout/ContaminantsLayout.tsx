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
import { convertCitationsToStandards } from '@/app/utils/layoutHelpers';
import { getCompoundArticle, getContaminantArticle, getArticle } from '@/app/utils/contentAPI';
import { getRelationshipSection } from '@/app/utils/relationshipHelpers';
import ContaminantDatasetDownloader from '../Dataset/ContaminantDatasetDownloader';
import type { LayoutProps, ContaminantsLayoutProps, SectionConfig } from '@/types';

// Re-export for convenience
export type { ContaminantsLayoutProps };

export async function ContaminantsLayout(props: ContaminantsLayoutProps) {
  const { metadata, children, slug = '', category = '', subcategory = '' } = props;
  const rawTitle = (metadata?.title as string) || metadata?.name || slug;
  // Remove ' Laser Cleaning' suffix from page title
  const contaminantName = rawTitle.replace(/ Laser Cleaning$/i, '');
  const thumbnailLink = `/contaminants/${category}/${subcategory}/${slug}`;
  const heroImage = metadata?.images?.hero?.url;
  
  // Access data from relationships using type-safe helper
  const relationships = (metadata as any)?.relationships || {};
  const industryApplications = relationships?.operational?.industry_applications || (metadata as any)?.applications;
  
  // Convert citations using utility
  const regulatoryStandards = convertCitationsToStandards(metadata);
  
  /**
   * Safety data location (normalized structure):
   * - PREFERRED: relationships.safety.* (normalized location)
   * - FALLBACK: relationships.operational.laser_properties.items[0].safety_data (legacy contaminants)
   * - FALLBACK: relationships.laser_properties.items[0].safety_data (legacy alternative)
   * - FALLBACK: relationships.technical.laser_properties.items[0].safety_data (legacy technical)
   * 
   * After full migration, only relationships.safety will be needed.
   */
  
  // Check normalized location first
  let safetyData = relationships.safety;
  
  // If not found, try legacy locations for backward compatibility
  if (!safetyData) {
    const laserPropertiesSection = getRelationshipSection(relationships, 'operational.laser_properties') 
      || getRelationshipSection(relationships, 'laser_properties')
      || getRelationshipSection(relationships, 'technical.laser_properties');
    
    safetyData = laserPropertiesSection?.items?.[0]?.safety_data;
  }
  
  // Default to empty object if no safety data found
  safetyData = safetyData || {};

  // Use helper to safely access relationship sections
  // New structure: interactions.produces_compounds, fallback: technical.produces_compounds
  const producesCompoundsSection = getRelationshipSection(
    relationships, 
    'interactions.produces_compounds'
  ) || getRelationshipSection(
    relationships,
    'technical.produces_compounds'
  ) || getRelationshipSection(relationships, 'produces_compounds');
  
  // Enrich minimal references with full compound data
  const producesCompounds = producesCompoundsSection?.items || [];
  const enrichedCompounds = await Promise.all(
    producesCompounds.map(async (ref: { id: string; phase?: string; hazard_level?: string }) => {
      const article = await getCompoundArticle(ref.id);
      if (!article) return null;
      
      const metadata = article.metadata as any;
      return {
        id: ref.id,
        title: metadata.name || metadata.title,
        category: metadata.category,
        description: metadata.description,
        url: metadata.full_path,
        phase: ref.phase,
        hazard_level: ref.hazard_level,
        image: metadata.images?.hero?.url,
      };
    })
  ).then(items => items.filter(Boolean));

  // Use helper to safely access materials section
  // New structure: interactions.affects_materials, fallback: technical.affects_materials
  const affectsMaterialsSection = getRelationshipSection(
    relationships, 
    'interactions.affects_materials'
  ) || getRelationshipSection(
    relationships,
    'technical.affects_materials'
  ) || getRelationshipSection(relationships, 'found_on_materials');
  
  // Enrich minimal references with full material data
  const foundOnMaterials = (affectsMaterialsSection?.items || []).filter(item => item != null);
  const enrichedMaterials = await Promise.all(
    foundOnMaterials.map(async (ref: any) => {
      if (!ref || !ref.id) return null;
      
      const article = await getArticle(ref.id);
      if (!article) return null;
      
      const metadata = article.metadata as any;
      return {
        id: ref.id,
        title: metadata.name || metadata.title,
        category: metadata.category,
        description: metadata.description,
        url: metadata.full_path,
        image: metadata.images?.hero?.url,
      };
    })
  ).then(items => items.filter(Boolean));

  // Use helper for descriptive data sections
  const visualCharacteristics = getRelationshipSection(relationships, 'visual_characteristics');
  const laserProperties = getRelationshipSection(relationships, 'laser_properties');

  // Configure sections for BaseContentLayout
  const sections: SectionConfig[] = [
    // Relationship cards for produces_compounds (interactions.produces_compounds or technical.produces_compounds)
    {
      component: CardGrid,
      condition: enrichedCompounds.length > 0,
      props: {
        items: enrichedCompounds.filter((c): c is NonNullable<typeof c> => c != null).map(c => ({
          slug: c.id,
          href: c.url,
          title: c.title,
          imageUrl: c.image,
          imageAlt: c.title,
          category: c.category,
          metadata: {
            phase: c.phase,
            hazard_level: c.hazard_level,
          },
        })),
        title: `Compounds produced by ${contaminantName}`,
        description: producesCompoundsSection?.metadata?.section_description || 'Compounds produced during laser removal with exposure limits and required safety controls',
        variant: 'relationship' as const,
      }
    },
    {
      component: SafetyDataPanel,
      condition: !!safetyData,
      props: { 
        safetyData,
        compounds: enrichedCompounds,
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
      condition: enrichedMaterials.length > 0,
      props: {
        items: enrichedMaterials.filter((m): m is NonNullable<typeof m> => m != null).map(m => ({
          slug: m.id,
          href: m.url,
          title: m.title,
          imageUrl: m.image,
          imageAlt: m.title,
          category: m.category,
        })),
        title: `Materials affected by ${contaminantName}`,
        description: affectsMaterialsSection?.metadata?.section_description || 'Materials where this contaminant is commonly present',
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
