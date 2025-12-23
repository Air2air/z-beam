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
import { materialLinkageToGridItem, contaminantLinkageToGridItem } from '@/app/utils/gridMappers';
import { sortByFrequency } from '@/app/utils/gridSorters';
import { getEnrichmentMetadata } from '@/app/utils/layoutHelpers';
import { getContaminantArticle } from '@/app/utils/contentAPI';
import type { LayoutProps } from '@/types';
import type { SectionConfig } from '../BaseContentLayout';

interface MaterialsLayoutProps extends LayoutProps {
  slug?: string;
  category?: string;
  subcategory?: string;
}

export async function MaterialsLayout(props: MaterialsLayoutProps) {
  const { metadata, children, slug = '', category = '', subcategory = '' } = props;
  const materialName = (metadata?.title as string) || metadata?.name || slug;
  const thumbnailLink = `/materials/${category}/${subcategory}/${slug}`;
  const heroImage = metadata?.images?.hero?.url;
  
  // Configure sections for BaseContentLayout
  // Access data from relationships
  const relationships = (metadata as any)?.relationships || {};
  const materialProperties = relationships?.materialProperties || (metadata as any)?.properties;
  const regulatoryStandards = relationships?.regulatory?.items || relationships?.regulatory_standards?.items || relationships?.regulatory_standards || relationships?.regulatory || [];
  const applications = (metadata as any)?.applications; // NEW: Extract applications array

  // Enrich minimal references with full contaminant data
  const contaminatedBy = relationships?.contaminated_by?.items || relationships?.contaminated_by || [];
  const enrichedContaminants = await Promise.all(
    (Array.isArray(contaminatedBy) ? contaminatedBy : []).map(async (ref: { id: string; frequency?: string; severity?: string; typical_context?: string }) => {
      const article = await getContaminantArticle(ref.id);
      if (!article) return null;
      
      const metadata = article.metadata as any; // Allow images.hero access
      const normalizeFrequency = (freq: string | undefined): 'very_common' | 'common' | 'occasional' | 'rare' => {
        if (freq === 'very_common' || freq === 'common' || freq === 'rare') return freq;
        return 'occasional';
      };
      const normalizeSeverity = (sev: string | undefined): 'severe' | 'high' | 'moderate' | 'low' => {
        if (sev === 'severe' || sev === 'high' || sev === 'low') return sev;
        return 'moderate';
      };
      return {
        id: ref.id,
        title: metadata.name || metadata.title,
        category: metadata.category || '',
        subcategory: metadata.subcategory || '',
        description: metadata.description,
        url: metadata.full_path || `/contaminants/${ref.id}`,
        frequency: normalizeFrequency(ref.frequency),
        severity: normalizeSeverity(ref.severity),
        typical_context: ref.typical_context || '',
        image: metadata.images?.hero?.url || '',
      };
    })
  ).then(items => items.filter((item): item is NonNullable<typeof item> => item !== null));

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
        title: 'Common Contaminants',
        description: 'Contaminants frequently found on this material requiring laser cleaning removal',
        variant: 'relationship' as const,
      }
    },
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
