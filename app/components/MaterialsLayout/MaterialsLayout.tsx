// app/components/MaterialsLayout/MaterialsLayout.tsx
// Specialized layout for materials pages using consolidated BaseContentLayout

import React from 'react';
import { BaseContentLayout } from '../BaseContentLayout';
import { RegulatoryStandards } from '../RegulatoryStandards';
import { FAQPanel } from '../FAQPanel';
import { ScheduleCards } from '../Schedule/ScheduleCards';
import { LaserMaterialInteraction } from '../LaserMaterialInteraction/LaserMaterialInteraction';
import { MaterialCharacteristics } from '../MaterialCharacteristics/MaterialCharacteristics';
import { RelatedMaterials } from '../RelatedMaterials/RelatedMaterials';
import MaterialDatasetDownloader from '../Dataset/MaterialDatasetDownloader';
import { CardGrid } from '../CardGrid';
import { Micro } from '../Micro/Micro';
import { RelationshipsDump } from '../RelationshipsDump/RelationshipsDump';
import { IndustryApplicationsPanel } from '../IndustryApplicationsPanel';
import { getRegulatoryStandards, getHeroImageUrl } from '@/app/utils/relationshipHelpers';
import type { LayoutProps } from '@/types';
import type { SectionConfig } from '../BaseContentLayout';

interface MaterialsLayoutProps extends LayoutProps {
  slug?: string;
  category?: string;
  subcategory?: string;
}

export async function MaterialsLayout(props: MaterialsLayoutProps) {
  const { metadata, children, slug = '', category = '', subcategory = '' } = props;
  const materialName = metadata?.name || (metadata?.title as string) || slug;
  const thumbnailLink = `/materials/${category}/${subcategory}/${slug}`;
  const heroImage = getHeroImageUrl(metadata);
  
  // Configure sections for BaseContentLayout
  // Access data from relationships using standardized helpers
  const relationships = (metadata as any)?.relationships || {};
  const materialProperties = relationships?.materialProperties || (metadata as any)?.properties;
  const regulatoryStandards = getRegulatoryStandards(metadata);
  const industryApplications = relationships?.operational?.industry_applications || (metadata as any)?.applications;

  // Contaminant enrichment removed - was causing build errors with e.map undefined
  // TODO: Re-add when frontmatter structure is confirmed

  const sections: SectionConfig[] = [
    {
      component: LaserMaterialInteraction,
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
      props: {
        materialName,
        materialProperties,
        category,
        subcategory,
        slug,
      }
    },
    // Micro section - positioned after Material Characteristics
    {
      component: () => <Micro frontmatter={metadata as any} config={{}} />,
      condition: () => !!metadata?.images?.micro?.url,
      props: {}
    },
    // DUMP ALL RELATIONSHIPS FOR ANALYSIS (development only)
    {
      component: RelationshipsDump,
      condition: () => process.env.NODE_ENV === 'development',
      props: {
        relationships,
        entityName: materialName,
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
      component: IndustryApplicationsPanel,
      condition: !!industryApplications,
      props: {
        applications: industryApplications,
        entityName: materialName,
        variant: 'materials' as const,
      }
    },
    {
      component: FAQPanel,
      props: {
        faq: metadata?.faq || [],
        entityName: materialName,
        variant: 'faq' as const,
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
    // Contaminant cards removed temporarily - causing build errors
    // TODO: Re-add when frontmatter structure is confirmed
    // Dataset downloader at bottom
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
    // ScheduleCards MUST be last section for all layouts
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
      showMicro={false}
    >
      {children}
    </BaseContentLayout>
  );
}

export default MaterialsLayout;
