// app/components/MaterialsLayout/MaterialsLayout.tsx
// Specialized layout for materials pages using consolidated BaseContentLayout
// Refactored Feb 4, 2026 to use consolidated relationship utilities

import React from 'react';
import { BaseContentLayout } from '../BaseContentLayout';
import { RegulatoryStandards } from '../RegulatoryStandards';
import { FAQPanel } from '../FAQPanel';
import { ScheduleCards } from '../Schedule/ScheduleCards';
import { LaserMaterialInteraction } from '../LaserMaterialInteraction/LaserMaterialInteraction';
import { MaterialCharacteristics } from '../MaterialCharacteristics/MaterialCharacteristics';
import { RelatedMaterials } from '../RelatedMaterials/RelatedMaterials';
import MaterialDatasetDownloader from '../Dataset/MaterialDatasetDownloader';
import { Micro } from '../Micro/Micro';
import { getHeroImageUrl } from '@/app/utils/relationshipHelpers';
import { SectionConfigBuilder } from '@/app/utils/sectionConfigBuilder';
import { getRelationshipItems } from '@/types/relationships';
import type { LayoutProps } from '@/types';

interface MaterialsLayoutProps extends LayoutProps {
  slug?: string;
  category?: string;
  subcategory?: string;
}

export async function MaterialsLayout(props: MaterialsLayoutProps) {
  const { metadata, children, slug = '', category = '', subcategory = '' } = props;
  const materialName = metadata?.name;
  const thumbnailLink = `/materials/${category}/${subcategory}/${slug}`;
  const heroImage = getHeroImageUrl(metadata);
  
  // All data comes directly from frontmatter - no enrichment or transformation
  const relationships = (metadata as any)?.relationships;
  
  const materialProperties = (metadata as any)?.properties || {
    materialCharacteristics: (metadata as any)?.materialCharacteristics,
    laserMaterialInteraction: (metadata as any)?.laserMaterialInteraction
  };
  
  // 🔥 FIX: Ensure _section metadata is included in materialCharacteristics
  // The _section metadata is at the root level materialCharacteristics._section (not under properties)
  if (materialProperties?.materialCharacteristics && (metadata as any)?.materialCharacteristics?._section) {
    materialProperties.materialCharacteristics._section = (metadata as any).materialCharacteristics._section;
  }

  // 🔥 FIX: Also ensure _section metadata for laserMaterialInteraction
  if (materialProperties?.laserMaterialInteraction && (metadata as any)?.laserMaterialInteraction?._section) {
    materialProperties.laserMaterialInteraction._section = (metadata as any).laserMaterialInteraction._section;
  }

  // Handle FAQ - can be string, array, or object with items array
  const rawFaq = (metadata as any)?.faq;
  const faq = Array.isArray(rawFaq) ? rawFaq : (typeof rawFaq === 'string' ? rawFaq : rawFaq?.items);
  const regulatoryStandards = relationships?.safety?.regulatoryStandards?.items;
  
  // Use consolidated relationship accessor
  const contaminatedBy = getRelationshipItems(relationships, 'interactions', 'contaminatedBy');
  
  // FAIL-FAST: Throw if required relationship data is missing
  if (!contaminatedBy || !Array.isArray(contaminatedBy)) {
    throw new Error(`Missing or invalid contaminatedBy data for material: ${materialName}`);
  }

  // Build sections using consolidated builder pattern
  const sections = new SectionConfigBuilder()
    .addComponent({
      component: LaserMaterialInteraction,
      props: {
        materialName,
        materialProperties,
        category,
        subcategory,
        slug,
      }
    })
    .addComponent({
      component: MaterialCharacteristics,
      props: {
        materialName,
        materialProperties,
        category,
        subcategory,
        slug,
      }
    })
    .addConditional(
      !!(metadata as any)?.components?.micro || !!(metadata as any)?.micro,
      {
        component: Micro,
        props: {
          frontmatter: metadata as any,
          config: {}
        }
      }
    )
    .addComponent({
      component: RegulatoryStandards,
      props: {
        standards: regulatoryStandards,
        sectionMetadata: relationships?.safety?.regulatoryStandards?._section,
        heroImage,
        thumbnailLink,
      }
    })
    .addRelationshipCardGrid(
      relationships,
      'operational',
      'industryApplications',
      'application',
      materialName || ''
    )
    .addConditional(
      !!faq && (typeof faq === 'string' ? faq.length > 0 : faq.length > 0),
      {
        component: FAQPanel,
        props: {
          faq: faq,
          entityName: materialName,
          variant: 'faq' as const,
          sectionTitle: (metadata as any)?.faq?._section?.sectionTitle,
          sectionDescription: (metadata as any)?.faq?._section?.sectionDescription,
        }
      }
    )
    .addConditional(
      relationships?.discovery?.relatedMaterials?._section?.sectionTitle,
      {
        component: RelatedMaterials,
        props: {
          currentSlug: slug,
          category,
          subcategory,
          maxItems: 6,
          sectionTitle: relationships?.discovery?.relatedMaterials?._section?.sectionTitle,
          sectionDescription: relationships?.discovery?.relatedMaterials?._section?.sectionDescription,
        }
      }
    )
    // Use consolidated relationship CardGrid builder
    .addRelationshipCardGrid(
      relationships,
      'interactions',
      'contaminatedBy',
      'contaminant',
      materialName || ''
    )
    .addComponent({
      component: MaterialDatasetDownloader,
      props: {
        materialName,
        slug,
        category,
        subcategory,
        machineSettings: (metadata as any)?.machine_settings,
        materialProperties: (metadata as any)?.properties,
        faq: faq,
        regulatoryStandards: regulatoryStandards,
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
      contentType="materials"
      sections={sections}
      slug={slug}
      category={category}
      subcategory={subcategory}
      showMicro={false}
    >
      {children}
    </BaseContentLayout>
  );
}

export default MaterialsLayout;
