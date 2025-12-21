// app/components/Dataset/ContaminantDatasetDownloader.tsx

import { SectionContainer } from '@/app/components/SectionContainer/SectionContainer';
import { getSectionIcon } from '@/app/config/sectionIcons';
import DatasetSectionClient from './DatasetSectionClient';

export interface ContaminantDatasetDownloaderProps {
  contaminantName: string;
  slug: string;
  category: string;
  subcategory?: string;
  laserProperties?: any;
  visualCharacteristics?: any;
  removalByMaterial?: any;
  composition?: any[];
  safetyData?: any;
  faq?: any[];
  regulatoryStandards?: any[];
  showFullDataset?: boolean;
}

/**
 * Server component for contaminant dataset downloads
 * Calculates dataset stats from contaminant data at build time
 */
export default function ContaminantDatasetDownloader({
  contaminantName,
  slug,
  category = '',
  subcategory = '',
  laserProperties = {},
  visualCharacteristics = {},
  removalByMaterial = {},
  composition = [],
  safetyData = {},
  faq = [],
  regulatoryStandards = [],
  showFullDataset: _showFullDataset = false
}: ContaminantDatasetDownloaderProps) {
  // Calculate stats from provided data
  const laserParamsCount = Object.keys(laserProperties?.laser_parameters || {}).length;
  const opticalPropsCount = Object.keys(laserProperties?.optical_properties || {}).length;
  const removalCharsCount = Object.keys(laserProperties?.removal_characteristics || {}).length;
  const thermalPropsCount = Object.keys(laserProperties?.thermal_properties || {}).length;
  
  const visualCategoriesCount = Object.keys(visualCharacteristics?.appearance_on_categories || {}).length;
  const materialRemovalCount = Object.keys(removalByMaterial || {}).length;
  const compositionCount = Array.isArray(composition) ? composition.length : 0;
  const safetyMetricsCount = Object.keys(safetyData || {}).length;
  
  const faqCount = Array.isArray(faq) ? faq.length : 0;
  const standardsCount = regulatoryStandards?.length || 0;
  
  const variablesCount = laserParamsCount + opticalPropsCount + removalCharsCount + thermalPropsCount + compositionCount + safetyMetricsCount;
  const sectionsCount = visualCategoriesCount + (laserParamsCount > 0 ? 1 : 0) + (materialRemovalCount > 0 ? 1 : 0) + (compositionCount > 0 ? 1 : 0);

  // Use slug directly for contaminant datasets (files are named with full slug)
  const baseSlug = slug;

  return (
    <SectionContainer
      variant="dark"
      title={`${contaminantName} Dataset Download`}
      icon={getSectionIcon('dataset')}
    >
      <DatasetSectionClient
        title={`${contaminantName} Contamination Dataset`}
        description="Download contamination characteristics, laser cleaning parameters, and removal data in machine-readable formats"
        contentType="contaminants"
        stats={[
          {
            value: variablesCount,
            label: 'Variables'
          },
          {
            value: laserParamsCount,
            label: 'Laser Parameters'
          },
          {
            value: materialRemovalCount,
            label: 'Material Methods'
          },
          {
            value: visualCategoriesCount,
            label: 'Visual Profiles'
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
        baseSlug={baseSlug}
        materialName={contaminantName}
        category={category}
        subcategory={subcategory}
        includes={[
          `Chemical composition (${compositionCount} compounds)`,
          'Contamination characteristics and behavior',
          'Laser cleaning parameters for optimal removal',
          `Material-specific removal methods (${materialRemovalCount} materials)`,
          `Visual identification (${visualCategoriesCount} material categories)`,
          `Safety metrics and handling guidelines (${safetyMetricsCount} measures)`,
          'Source references and validation data'
        ]}
        categoryLink={category ? {
          href: `/contaminants/${category}`,
          label: `View all ${category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} datasets`
        } : undefined}
      />
    </SectionContainer>
  );
}
