// app/components/Dataset/MaterialDatasetCardWrapper.tsx
'use client';

import DatasetCard from './DatasetCard';

interface MaterialData {
  name: string;
  slug: string;
  category: string;
  subcategory: string;
  parameters?: Record<string, any>;
  materialProperties?: Record<string, any>;
  applications?: Array<any>;
  faq?: { questions?: Array<any> };
  regulatoryStandards?: Array<any>;
  machineSettings?: Record<string, any>;
}

interface MaterialDatasetCardWrapperProps {
  material: MaterialData;
  showFullDataset?: boolean;
}

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
    <DatasetCard
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
          value: faq?.questions?.length || 0,
          label: 'FAQs'
        },
        {
          value: regulatoryStandards.length,
          label: 'Standards'
        }
      ]}
      formats={['json', 'csv', 'txt']}
      onDownload={(format: 'json' | 'csv' | 'txt') => {
        const fileName = `${slug}.${format}`;
        const filePath = `/datasets/${category}/${subcategory}/${fileName}`;
        const link = document.createElement('a');
        link.href = filePath;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }}
      getDirectLink={(format: 'json' | 'csv' | 'txt') => 
        `/datasets/${category}/${subcategory}/${slug}.${format}`
      }
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
