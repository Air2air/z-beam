// app/components/Dataset/DatasetDownload.tsx
'use client';

import React from 'react';
import { SectionContainer } from '@/app/components/SectionContainer/SectionContainer';
import { getSectionIcon } from '@/app/config/sectionIcons';
import MaterialDatasetCardWrapper from './MaterialDatasetCardWrapper';

interface DatasetDownloadProps {
  materialName: string;
  slug: string;
  category: string;
  subcategory: string;
  machineSettings?: Record<string, any>;
  materialProperties?: Record<string, any>;
  faq?: any[];
  regulatoryStandards?: any[];
  showFullDataset?: boolean;
  title?: string;
}

/**
 * DatasetDownload component for material pages
 * Wraps MaterialDatasetCardWrapper with SectionContainer styling
 */
export default function DatasetDownload({
  materialName,
  slug,
  category,
  subcategory,
  machineSettings,
  materialProperties,
  faq,
  regulatoryStandards,
  showFullDataset = false,
  title,
}: DatasetDownloadProps) {
  const displayTitle = title || `${materialName} Dataset Download`;

  return (
    <SectionContainer
      variant="dark"
      title={displayTitle}
      icon={getSectionIcon('dataset')}
    >
      <MaterialDatasetCardWrapper 
        materialName={materialName}
        slug={slug}
        category={category}
        subcategory={subcategory}
        machineSettings={machineSettings}
        materialProperties={materialProperties}
        faq={faq}
        regulatoryStandards={regulatoryStandards}
        showFullDataset={showFullDataset}
      />
    </SectionContainer>
  );
}
