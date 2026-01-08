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
import { materialLinkageToGridItem, contaminantLinkageToGridItem } from '@/app/utils/gridMappers';
import { sortByFrequency } from '@/app/utils/gridSorters';
import { getContaminatedBy, getRegulatoryStandards, getHeroImageUrl } from '@/app/utils/relationshipHelpers';
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

  // Extract contaminants using standardized helper (handles interactions → technical → legacy fallback)
  const contaminatedByData = getContaminatedBy(metadata);
  const contaminantRefs = (contaminatedByData?.items || []).filter((item: any) => item != null);
  const contaminatedBySection = contaminatedByData?._section || {};
  
  // Enrich contaminants with full metadata - wrapped in try-catch for production safety
  const { getContaminantArticle } = await import('@/app/utils/contentAPI');
  let enrichedContaminants: any[] = [];
  
  try {
    const enrichmentResults = await Promise.all(
      contaminantRefs.map(async (ref: any) => {
        if (!ref || !ref.id) return null;
        
        try {
          // Fetch full article data to get metadata
          const article = await getContaminantArticle(ref.id);
          if (!article) return null;
          
          const metadata = article.metadata as any;
          const contaminantCategory = metadata.category || '';
          const contaminantSubcategory = metadata.subcategory || '';
          
          // Use fullPath (camelCase) from frontmatter, fallback to constructing from category/subcategory/id
          const fullPath = metadata.fullPath || `/contaminants/${contaminantCategory}/${contaminantSubcategory}/${ref.id}`;
          
          return {
            id: ref.id,
            title: metadata.name || metadata.title,
            category: contaminantCategory,
            subcategory: contaminantSubcategory,
            description: ref.typical_context || metadata.description || '',
            url: ref.url || fullPath,
            frequency: ref.frequency || 'unknown',
            severity: ref.severity || 'unknown',
            typical_context: ref.typical_context || '',
            image: metadata.images?.hero?.url || '',
          };
        } catch (error) {
          console.error(`[MaterialsLayout] Failed to enrich contaminant ${ref.id}:`, error);
          return null;
        }
      })
    );
    
    enrichedContaminants = enrichmentResults.filter(Boolean);
  } catch (error) {
    console.error('[MaterialsLayout] Failed to enrich contaminants:', error);
    enrichedContaminants = [];
  }

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
    // Relationship cards for contaminated_by (interactions.contaminated_by or technical.contaminated_by)
    {
      component: CardGrid,
      condition: enrichedContaminants.length > 0,
      props: {
        items: (enrichedContaminants || []).sort(sortByFrequency).map(contaminantLinkageToGridItem),
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
