// app/components/Dataset/MaterialDatasetCardWrapper.tsx
'use client';

import DatasetSection from './DatasetSection';
import type { MaterialDatasetCardWrapperProps, MaterialDatasetData } from '@/types/centralized';

export default function MaterialDatasetCardWrapper({
  material,
  showFullDataset = false
}: MaterialDatasetCardWrapperProps) {
  const { 
    name, 
    slug, 
    category, 
    subcategory, 
    parameters = {}, 
    materialProperties = {}, 
    applications = [],
    faq,
    regulatoryStandards = [],
    machineSettings = {}
  } = material;

  return (
    <DatasetSection
      title={`${name} Dataset`}
      description="Download material properties, specifications, and machining parameters in machine-readable formats"
      stats={[
        {
          value: Object.keys(materialProperties).length,
          label: 'Properties'
        },
        {
          value: Object.keys(machineSettings).length,
          label: 'Settings'
        },
        {
          value: Object.keys(parameters).length,
          label: 'Parameters'
        },
        {
          value: applications.length,
          label: 'Applications'
        },
        {
          value: Array.isArray(faq) ? faq.length : ((faq as any)?.questions?.length || 0),
          label: 'FAQs'
        },
        {
          value: regulatoryStandards.length,
          label: 'Standards'
        }
      ]}
      formats={['json', 'csv', 'txt']}
      onDownload={(format: 'json' | 'csv' | 'txt') => {
        // Remove -laser-cleaning suffix if slug already contains it
        const baseSlug = slug.endsWith('-laser-cleaning') ? slug : `${slug}-laser-cleaning`;
        const fileName = `${baseSlug}.${format}`;
        const filePath = `/datasets/materials/${fileName}`;
        
        console.log('Download Debug:', { slug, baseSlug, fileName, filePath });
        
        const link = document.createElement('a');
        link.href = filePath;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }}
      getDirectLink={(format: 'json' | 'csv' | 'txt') => {
        const baseSlug = slug.endsWith('-laser-cleaning') ? slug : `${slug}-laser-cleaning`;
        return `/datasets/materials/${baseSlug}.${format}`;
      }}
      includes={[
        'Material properties with full specifications',
        'Processing parameters and recommended settings',
        'Application examples and use cases',
        'Safety information and handling guidelines',
        'Source references and validation data'
      ]}
      categoryLink={{
        href: `/materials/${category}`,
        label: `View all ${category.charAt(0).toUpperCase() + category.slice(1)} datasets`
      }}
    />
  );
}
