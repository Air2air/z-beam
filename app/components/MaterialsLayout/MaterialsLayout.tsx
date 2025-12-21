// app/components/MaterialsLayout/MaterialsLayout.tsx
// Specialized layout for materials pages using consolidated BaseContentLayout

import React from 'react';
import { BaseContentLayout } from '../BaseContentLayout';
import { RegulatoryStandards } from '../RegulatoryStandards';
import { MaterialFAQ } from '../FAQ/MaterialFAQ';
import { ScheduleCards } from '../Schedule/ScheduleCards';
import { LaserMaterialInteraction } from '../LaserMaterialInteraction/LaserMaterialInteraction';
import { MaterialCharacteristics } from '../MaterialCharacteristics/MaterialCharacteristics';
import { RelatedMaterials } from '../RelatedMaterials/RelatedMaterials';
import MaterialDatasetDownloader from '../Dataset/MaterialDatasetDownloader';
import { CardGrid } from '../CardGrid';
import { materialLinkageToGridItem, contaminantLinkageToGridItem } from '@/app/utils/gridMappers';
import { sortByFrequency } from '@/app/utils/gridSorters';
import { getEnrichmentMetadata } from '@/app/utils/layoutHelpers';
import type { LayoutProps } from '@/types';
import type { SectionConfig } from '../BaseContentLayout';

interface MaterialsLayoutProps extends LayoutProps {
  slug?: string;
  category?: string;
  subcategory?: string;
}

export function MaterialsLayout(props: MaterialsLayoutProps) {
  const { metadata, children, slug = '', category = '', subcategory = '' } = props;
  const materialName = (metadata?.title as string) || metadata?.name || slug;
  const thumbnailLink = `/materials/${category}/${subcategory}/${slug}`;
  const heroImage = metadata?.images?.hero?.url;
  
  // Configure sections for BaseContentLayout
  // Access data from relationships
  const relationships = (metadata as any)?.relationships || {};
  const materialProperties = relationships?.materialProperties;
  const regulatoryStandards = relationships?.regulatory_standards;

  const sections: SectionConfig[] = [
    {
      component: LaserMaterialInteraction,
      condition: !!materialProperties,
      props: {
        materialName,
        materialProperties,
        category,
        subcategory,
        slug,
      }
    },
    {
      component: MaterialCharacteristics,
      condition: !!materialProperties,
      props: {
        materialName,
        materialProperties,
        category,
        subcategory,
        slug,
      }
    },
    {
      component: RegulatoryStandards,
      props: {
        standards: regulatoryStandards,
        heroImage,
        thumbnailLink,
      }
    },
    {
      component: MaterialFAQ,
      condition: metadata?.faq && Array.isArray(metadata.faq) && metadata.faq.length > 0,
      props: {
        materialName,
        faq: metadata?.faq || [],
        heroImage,
        thumbnailLink,
      }
    },
    {
      component: RelatedMaterials,
      props: {
        currentSlug: slug,
        category,
        subcategory,
        maxItems: 6,
      }
    },
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
    {
      component: MaterialDatasetDownloader,
      props: {
        materialName,
        slug,
        category,
        subcategory,
        machineSettings: (metadata as any)?.machine_settings || relationships?.machine_settings || {},
        materialProperties: (metadata as any)?.properties || relationships?.materialProperties || {},
        faq: metadata?.faq,
        regulatoryStandards: relationships?.regulatory_standards || (metadata as any)?.regulatoryStandards || [],
        showFullDataset: true,
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
      contentType="materials"
      sections={sections}
      slug={slug}
      category={category}
      subcategory={subcategory}
    >
      {children}
    </BaseContentLayout>
  );
}

export default MaterialsLayout;
