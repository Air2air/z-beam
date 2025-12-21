// app/components/Dataset/DatasetSectionClient.tsx
'use client';

import DatasetSection from './DatasetSection';
import { trackDatasetDownload } from '@/app/utils/analytics';
import { triggerDownload } from '@/app/utils/downloadUtils';

interface DatasetSectionClientProps {
  title: string;
  description: string;
  stats: Array<{
    value: string | number;
    label: string;
  }>;
  formats: Array<'json' | 'csv' | 'txt'>;
  baseSlug: string;
  materialName: string;
  category: string;
  subcategory: string | undefined;
  includes: Array<string>;
  categoryLink?: {
    href: string;
    label: string;
  };
  contentType?: 'materials' | 'contaminants';
}

export default function DatasetSectionClient({
  title,
  description,
  stats,
  formats,
  baseSlug,
  materialName,
  category,
  subcategory,
  includes,
  categoryLink,
  contentType = 'materials'
}: DatasetSectionClientProps) {
  
  const handleDownload = (format: 'json' | 'csv' | 'txt') => {
    const fileName = contentType === 'contaminants' 
      ? `${baseSlug}.${format}`
      : `${baseSlug}-laser-cleaning.${format}`;
    const filePath = `/datasets/${contentType}/${fileName}`;
    
    // Track download event
    trackDatasetDownload({
      format,
      category,
      subcategory,
      materialName,
      fileSize: undefined // File size not available for direct links
    });
    
    triggerDownload(filePath, fileName);
  };

  const getDirectLink = (format: 'json' | 'csv' | 'txt') => {
    const fileName = contentType === 'contaminants'
      ? `${baseSlug}.${format}`
      : `${baseSlug}-laser-cleaning.${format}`;
    return `/datasets/${contentType}/${fileName}`;
  };

  return (
    <DatasetSection
      title={title}
      description={description}
      stats={stats}
      formats={formats}
      onDownload={handleDownload}
      getDirectLink={getDirectLink}
      includes={includes}
      categoryLink={categoryLink}
    />
  );
}
