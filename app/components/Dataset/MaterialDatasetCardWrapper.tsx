'use client';
// app/components/Dataset/MaterialDatasetCardWrapper.tsx

import { SectionContainer } from '@/app/components/SectionContainer/SectionContainer';
import { getSectionIcon } from '@/app/config/sectionIcons';
import DatasetSection from './DatasetSection';
import type { MaterialDatasetCardWrapperProps, MaterialDatasetData } from '@/types/centralized';
import { trackDatasetDownload } from '@/app/utils/analytics';
import { triggerDownload } from '@/app/utils/downloadUtils';

export default function MaterialDatasetCardWrapper({
  material,
  showFullDataset = false,
  pageType // Optional: 'material' or 'settings' (auto-detected from slug if not provided)
}: MaterialDatasetCardWrapperProps) {
  const { 
    name, 
    slug, 
    category, 
    subcategory, 
    materialProperties = {}, 
    faq,
    regulatoryStandards = [],
    machineSettings = {}
  } = material;

  // Auto-detect page type from slug if not explicitly provided
  const isSettingsPage = pageType === 'settings' || slug.endsWith('-settings');

  // Count total properties from all nested sections
  const totalProperties = Object.values(materialProperties).reduce((total, section: any) => {
    if (section && typeof section === 'object' && !Array.isArray(section)) {
      // Count all nested properties in this section (excluding label, percentage, description)
      const propCount = Object.keys(section).filter(k => !['label', 'percentage', 'description'].includes(k)).length;
      return total + propCount;
    }
    return total;
  }, 0);

  // Count machine settings
  const settingsCount = Object.keys(machineSettings).length;

  // Count FAQs
  const faqCount = Array.isArray(faq) ? faq.length : ((faq as any)?.questions?.length || 0);

  // Count standards
  const standardsCount = regulatoryStandards?.length || 0;
  
  // Count total variables measured (sum of all properties across all sections)
  const variablesCount = totalProperties;
  
  // Count material property sections
  const sectionsCount = Object.keys(materialProperties).length;

  return (
    <SectionContainer
      variant="dark"
      title={`${name} Dataset Download`}
      icon={getSectionIcon('dataset')}
    >
      <DatasetSection
      title={`${name} Dataset`}
      description="Download material properties, specifications, and machining parameters in machine-readable formats"
      stats={[
        {
          value: variablesCount,
          label: 'Variables'
        },
        {
          value: settingsCount,
          label: 'Parameters'
        },
        {
          value: sectionsCount,
          label: 'Categories'
        },
        {
          value: faqCount,
          label: 'FAQs'
        },
        {
          value: standardsCount,
          label: 'Standards'
        },
        {
          value: 3,
          label: 'Formats'
        }
      ]}
      formats={['json', 'csv', 'txt']}
      onDownload={(format: 'json' | 'csv' | 'txt') => {
        // Remove -laser-cleaning suffix if slug already contains it
        const baseSlug = slug.endsWith('-laser-cleaning') ? slug : `${slug}-laser-cleaning`;
        const fileName = `${baseSlug}.${format}`;
        const filePath = `/datasets/materials/${fileName}`;
        
        // Track download event
        trackDatasetDownload({
          format,
          category,
          subcategory,
          materialName: name,
          fileSize: undefined // File size not available for direct links
        });
        
        triggerDownload(filePath, fileName);
      }}
      getDirectLink={(format: 'json' | 'csv' | 'txt') => {
        const baseSlug = slug.endsWith('-laser-cleaning') ? slug : `${slug}-laser-cleaning`;
        return `/datasets/materials/${baseSlug}.${format}`;
      }}
      includes={isSettingsPage ? [
        'Essential laser parameters with optimal ranges',
        'Material-specific damage thresholds',
        'Troubleshooting guides and solutions',
        'Research citations and validation data',
        'Safety warnings and prevention strategies'
      ] : [
        'Material properties with full specifications',
        'Processing parameters and recommended settings',
        'Application examples and use cases',
        'Safety information and handling guidelines',
        'Source references and validation data'
      ]}
      categoryLink={{
        href: isSettingsPage ? `/settings/${category}` : `/materials/${category}`,
        label: `View all ${category.charAt(0).toUpperCase() + category.slice(1)} datasets`
      }}
    />
    </SectionContainer>
  );
}
