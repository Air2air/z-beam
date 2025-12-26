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
import { Micro } from '../Micro/Micro';
import { RelationshipsDump } from '../RelationshipsDump/RelationshipsDump';
import { materialLinkageToGridItem, contaminantLinkageToGridItem } from '@/app/utils/gridMappers';
import { sortByFrequency } from '@/app/utils/gridSorters';
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
  const heroImage = metadata?.images?.hero?.url;
  
  // Configure sections for BaseContentLayout
  // Access data from relationships
  const relationships = (metadata as any)?.relationships || {};
  const materialProperties = relationships?.materialProperties || (metadata as any)?.properties;
  const regulatoryStandards = relationships?.regulatory?.items || relationships?.regulatory_standards?.items || relationships?.regulatory_standards || relationships?.regulatory || [];
  const applications = (metadata as any)?.applications;

  // Extract contaminants from relationships and filter null items
  const contaminatedByData = relationships?.technical?.contaminated_by || relationships?.contaminated_by || {};
  const contaminantRefs = (contaminatedByData?.items || []).filter((item: any) => item != null);
  const contaminatedBySection = contaminatedByData?._section || {};
  
  // Enrich contaminants with full metadata
  const { getContaminantArticle } = await import('@/app/utils/contentAPI');
  const enrichedContaminants = await Promise.all(
    contaminantRefs.map(async (ref: any) => {
      if (!ref || !ref.id) return null;
      
      // Fetch full article data to get full_path and other metadata
      const article = await getContaminantArticle(ref.id);
      if (!article) return null;
      
      const metadata = article.metadata as any;
      return {
        id: ref.id,
        title: metadata.name || metadata.title,
        category: metadata.category || '',
        subcategory: metadata.subcategory || '',
        description: ref.typical_context || metadata.description || '',
        url: ref.url || metadata.full_path, // Use full_path from frontmatter
        frequency: ref.frequency,
        severity: ref.severity,
        typical_context: ref.typical_context,
        image: metadata.images?.hero?.url || '',
      };
    })
  ).then(items => items.filter(Boolean));

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
    // DUMP ALL RELATIONSHIPS FOR ANALYSIS
    {
      component: RelationshipsDump,
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
      component: MaterialFAQ,
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
    // Relationship cards for contaminated_by
    {
      component: CardGrid,
      props: {
        items: enrichedContaminants.sort(sortByFrequency).map(contaminantLinkageToGridItem),
        title: contaminatedBySection?.title ? contaminatedBySection.title.replace('Common Contaminants', `Common ${materialName} contaminants`) : `Common ${materialName} contaminants`,
        description: contaminatedBySection?.description || 'Contaminants frequently found on this material requiring laser cleaning removal',
        variant: 'relationship' as const,
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
