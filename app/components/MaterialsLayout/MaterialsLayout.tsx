// app/components/MaterialsLayout/MaterialsLayout.tsx
// Specialized layout for materials pages
// Contains all materials-specific components in proper order

import React from 'react';
import dynamic from 'next/dynamic';
import { Layout } from '../Layout/Layout';
import { RegulatoryStandards } from '../RegulatoryStandards';
import { MaterialFAQ } from '../FAQ/MaterialFAQ';
import { ScheduleCards } from '../Schedule/ScheduleCards';
import { LaserMaterialInteraction } from '../LaserMaterialInteraction/LaserMaterialInteraction';
import { MaterialCharacteristics } from '../MaterialCharacteristics/MaterialCharacteristics';
import { RelatedMaterials } from '../RelatedMaterials/RelatedMaterials';
import MaterialDatasetCardWrapper from '../Dataset/MaterialDatasetCardWrapper';
import type { LayoutProps } from '@/types';

const Micro = dynamic(() => import('../Micro/Micro').then(mod => ({ default: mod.Micro })), {
  ssr: true
});

interface MaterialsLayoutProps extends LayoutProps {
  slug?: string;
  category?: string;
  subcategory?: string;
}

export function MaterialsLayout(props: MaterialsLayoutProps) {
  const { metadata, children, slug = '', category = '', subcategory = '' } = props;
  const materialName = (metadata?.title as string) || metadata?.name || slug;
  
  return (
    <Layout {...props}>
      {/* Page-specific content passed from materials page */}
      {children}
      
      {/* Laser-Material Interaction */}
      {metadata?.materialProperties && (
        <div className="mb-16">
          <LaserMaterialInteraction
            materialName={materialName}
            materialProperties={metadata.materialProperties}
            category={category}
            subcategory={subcategory}
            slug={slug}
          />
        </div>
      )}
      
      {/* Material Characteristics */}
      {metadata?.materialProperties && (
        <div className="mb-16">
          <MaterialCharacteristics
            materialName={materialName}
            materialProperties={metadata.materialProperties}
            category={category}
            subcategory={subcategory}
            slug={slug}
          />
        </div>
      )}
      
      {/* Micro - hidden if no micro image */}
      {metadata?.images?.micro?.url && (
        <div className="mb-16">
          <Micro 
            frontmatter={metadata}
            config={{}}
          />
        </div>
      )}
      
      {/* Regulatory Standards */}
      <div className="mb-16">
        <RegulatoryStandards 
          standards={(metadata as any)?.regulatoryStandards}
          heroImage={(metadata as any)?.images?.hero?.url}
          thumbnailLink={`/materials/${category}/${subcategory}/${slug}`}
        />
      </div>
      
      {/* FAQ */}
      {metadata?.faq && Array.isArray(metadata.faq) && metadata.faq.length > 0 && (
        <div className="mb-16">
          <MaterialFAQ 
            materialName={materialName}
            faq={metadata.faq as any}
            heroImage={metadata?.images?.hero?.url}
            thumbnailLink={`/materials/${category}/${subcategory}/${slug}`}
          />
        </div>
      )}
      
      {/* Related Materials */}
      <div className="mb-16">
        <RelatedMaterials 
          currentSlug={slug}
          category={category}
          subcategory={subcategory}
          maxItems={6}
        />
      </div>
      
      {/* Dataset */}
      <MaterialDatasetCardWrapper 
        materialName={materialName}
        slug={slug}
        category={category}
        subcategory={subcategory}
        machineSettings={metadata?.machineSettings as any}
        materialProperties={metadata?.materialProperties as any}
        faq={metadata?.faq as any}
        regulatoryStandards={(metadata as any)?.regulatoryStandards}
        showFullDataset={true}
      />
      
      {/* Schedule Cards */}
      <div className="mb-16">
        <ScheduleCards />
      </div>
    </Layout>
  );
}

export default MaterialsLayout;
