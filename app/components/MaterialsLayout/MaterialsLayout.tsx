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
import { getHeroImageUrl } from '@/app/utils/relationshipHelpers';
import type { LayoutProps } from '@/types';
import type { SectionConfig } from '../BaseContentLayout';

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
  // The AI-generated properties data doesn't include _section, so we need to merge it from frontmatter
  if (materialProperties?.materialCharacteristics && (metadata as any)?.properties?.materialCharacteristics?._section) {
    materialProperties.materialCharacteristics._section = (metadata as any).properties.materialCharacteristics._section;
  }

  // Handle FAQ - can be string, array, or object with items array
  const rawFaq = (metadata as any)?.faq;
  const faq = Array.isArray(rawFaq) ? rawFaq : (typeof rawFaq === 'string' ? rawFaq : rawFaq?.items);
  const industryApplications = relationships?.operational?.industryApplications;
  const regulatoryStandards = relationships?.safety?.regulatoryStandards?.items;
  const contaminatedBy = relationships?.interactions?.contaminatedBy?.items;

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
      component: Micro,
      condition: () => !!metadata?.images?.micro?.url,
      props: {
        frontmatter: metadata as any,
        config: {}
      }
    },
    {
      component: RegulatoryStandards,
      props: {
        standards: regulatoryStandards,
        sectionMetadata: relationships?.safety?.regulatoryStandards?._section,
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
        sectionMetadata: industryApplications?._section,
      }
    },
    {
      component: FAQPanel,
      condition: !!faq && (typeof faq === 'string' ? faq.length > 0 : faq.length > 0),
      props: {
        faq: faq,
        entityName: materialName,
        variant: 'faq' as const,
        sectionTitle: (metadata as any)?.faq?._section?.sectionTitle,
        sectionDescription: (metadata as any)?.faq?._section?.sectionDescription,
      }
    },
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
    },
    // Contaminant cards - complete data from frontmatter denormalization
    {
      component: CardGrid,
      condition: contaminatedBy.length > 0,
      props: {
        items: contaminatedBy.map((item: any) => ({
          href: item.url,
          slug: item.id,
          imageUrl: item.image,
          title: item.name,
          category: item.category,
          subcategory: item.subcategory,
          frequency: item.frequency,
          severity: item.severity,
        })),
        title: relationships?.interactions?.contaminatedBy?._section?.sectionTitle,
        description: relationships?.interactions?.contaminatedBy?._section?.sectionDescription,
        icon: relationships?.interactions?.contaminatedBy?._section?.icon,
        variant: 'relationship' as const,
        columns: 3,
      }
    },
    // Dataset downloader at bottom
    {
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
