// app/components/MaterialsLayout/MaterialsLayout.tsx
// Specialized layout for materials pages using consolidated BaseContentLayout

import React, { Suspense } from 'react';
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
import { EnrichedContaminantsSection } from './EnrichedContaminantsSection';
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
  const contaminantRefs = Array.isArray(contaminatedByData?.items) 
    ? contaminatedByData.items.filter((item: any) => item != null)
    : [];
  const contaminatedBySection = contaminatedByData?._section || {};

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
      
      {/* Suspense boundary for slow contaminant enrichment - progressive rendering */}
      {contaminantRefs.length > 0 && (
        <Suspense fallback={
          <div className="animate-pulse space-y-4 my-12">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-6">
                  <div className="h-40 bg-gray-200 rounded mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        }>
          {/* @ts-expect-error Async Server Component */}
          <EnrichedContaminantsSection 
            contaminantRefs={contaminantRefs}
            contaminatedBySection={contaminatedBySection}
            materialName={materialName}
          />
        </Suspense>
      )}
    </BaseContentLayout>
  );
}

export default MaterialsLayout;
