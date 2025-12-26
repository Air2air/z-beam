'use client';

import { useState, useEffect } from 'react';
import DatasetSection from './DatasetSection';
import type { DatasetDownloaderProps } from '@/types/centralized';

export default function DatasetDownloader({
  itemName,
  slug,
  category,
  subcategory,
  datasetType
}: DatasetDownloaderProps) {
  const [dataset, setDataset] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load dataset on client side
    const loadData = async () => {
      try {
        const { loadGeneratedDataset } = await import('@/app/utils/schemas/datasetLoaderClient');
        const data = await loadGeneratedDataset(slug, datasetType);
        setDataset(data);
      } catch (error) {
        console.warn(`Could not load dataset for ${slug}:`, error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [slug, datasetType]);

  const variableCount = dataset?.variableMeasured?.length || 0;
  const quality = dataset?.dataQuality;
  const keywordCount = dataset?.keywords?.length || 0;
  const citationCount = dataset?.citation?.length || 0;
  const distributionCount = dataset?.distribution?.length || 0;

  // Calculate parameters (machine settings from variableMeasured with machine_ prefix)
  const parameterCount = dataset?.variableMeasured?.filter((v: any) => 
    v.propertyID?.startsWith('machine_')
  ).length || 0;

  // Calculate categories (from classification or keywords)
  const categoryCount = dataset?.material?.classification ? 
    Object.keys(dataset.material.classification).length : 0;

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="text-sm text-gray-600 mt-2">Loading...</p>
      </div>
    );
  }

  return (
    <DatasetSection
        title={`${itemName} Dataset`}
        description={`Download ${itemName} properties, specifications, and parameters in machine-readable formats`}
        stats={[
          {
            value: variableCount,
            label: 'Variables'
          },
          {
            value: parameterCount,
            label: 'Laser Parameters'
          },
          {
            value: categoryCount,
            label: 'Material Methods'
          },
          {
            value: keywordCount,
            label: 'Visual Profiles'
          },
          {
            value: citationCount,
            label: 'Standards'
          },
          {
            value: distributionCount,
            label: 'Formats'
          }
        ]}
        formats={['json', 'csv', 'txt']}
        onDownload={(format: 'json' | 'csv' | 'txt') => {
          const baseSlug = slug.endsWith('-laser-cleaning') || slug.endsWith('-settings') ? slug : `${slug}-laser-cleaning`;
          const fileName = `${baseSlug}.${format}`;
          const filePath = `/datasets/${datasetType}/${fileName}`;
          
          const link = document.createElement('a');
          link.href = filePath;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }}
        getDirectLink={(format: 'json' | 'csv' | 'txt') => {
          const baseSlug = slug.endsWith('-laser-cleaning') || slug.endsWith('-settings') ? slug : `${slug}-laser-cleaning`;
          return `/datasets/${datasetType}/${baseSlug}.${format}`;
        }}
        includes={[]}
        categoryLink={category ? {
          href: `/${datasetType}/${category}`,
          label: `View all ${category.charAt(0).toUpperCase() + category.slice(1)} datasets`
        } : undefined}
      />
  );
}

