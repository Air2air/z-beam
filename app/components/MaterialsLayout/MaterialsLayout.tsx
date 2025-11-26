// app/components/MaterialsLayout/MaterialsLayout.tsx
// Specialized layout for materials pages
// Contains all materials-specific components in proper order

import React from 'react';
import dynamic from 'next/dynamic';
import { Layout } from '../Layout/Layout';
import { RegulatoryStandards } from '../RegulatoryStandards';
import { MaterialFAQ } from '../FAQ/MaterialFAQ';
import { Services } from '../Services/Services';
import { LaserMaterialInteraction } from '../LaserMaterialInteraction/LaserMaterialInteraction';
import { MaterialCharacteristics } from '../MaterialCharacteristics/MaterialCharacteristics';
import { RelatedMaterials } from '../RelatedMaterials/RelatedMaterials';
import MaterialDatasetCardWrapper from '../Dataset/MaterialDatasetCardWrapper';
import type { LayoutProps } from '@/types';

// Dynamic import Caption for code-splitting
const Caption = dynamic(
  () => import('../Caption/Caption').then(mod => mod.Caption),
  { ssr: true }
);

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
      {(metadata as any)?.materialProperties && (
        <div className="mb-16">
          <LaserMaterialInteraction
            materialName={materialName}
            materialProperties={(metadata as any).materialProperties}
          />
        </div>
      )}
      
      {/* Material Characteristics */}
      {(metadata as any)?.materialProperties && (
        <div className="mb-16">
          <MaterialCharacteristics
            materialName={materialName}
            materialProperties={(metadata as any).materialProperties}
          />
        </div>
      )}
      
      {/* Caption */}
      <div className="mb-16">
        <Caption 
          frontmatter={metadata as any} 
          config={{ showTechnicalDetails: true, showMetadata: true }} 
        />
      </div>
      
      {/* Regulatory Standards */}
      <div className="mb-16">
        <RegulatoryStandards standards={(metadata as any)?.regulatoryStandards} />
      </div>
      
      {/* FAQ */}
      {(metadata as any)?.faq && (metadata as any).faq.length > 0 && (
        <div className="mb-16">
          <MaterialFAQ 
            materialName={materialName}
            faq={(metadata as any).faq}
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
        machineSettings={(metadata as any)?.machineSettings}
        materialProperties={(metadata as any)?.materialProperties}
        faq={(metadata as any)?.faq}
        regulatoryStandards={(metadata as any)?.regulatoryStandards}
        showFullDataset={true}
      />
      
      {/* Services */}
      <div className="mb-16">
        <Services />
      </div>
    </Layout>
  );
}

export default MaterialsLayout;
