// app/components/Dataset/DatasetDownload.tsx
'use client';

import React from 'react';
import { SectionContainerDark } from '@/app/components/SectionContainer/SectionContainerDark';
import { getSectionIcon } from '@/app/config/sectionIcons';
import MaterialDatasetCardWrapper from './MaterialDatasetCardWrapper';
import type { MaterialDatasetCardWrapperProps } from '@/types/centralized';

interface DatasetDownloadProps extends MaterialDatasetCardWrapperProps {
  title?: string;
  iconColor?: string;
  iconBgColor?: string;
}

/**
 * DatasetDownload component for material pages
 * Wraps MaterialDatasetCardWrapper with SectionContainer styling
 */
export default function DatasetDownload({
  material,
  showFullDataset = false,
  title,
}: Omit<DatasetDownloadProps, 'iconColor' | 'iconBgColor'>) {
  const displayTitle = title || `${material.name} Dataset Download`;

  return (
    <SectionContainerDark
      title={displayTitle}
      icon={getSectionIcon('dataset')}
    >
      <MaterialDatasetCardWrapper 
        material={material}
        showFullDataset={showFullDataset}
      />
    </SectionContainerDark>
  );
}
