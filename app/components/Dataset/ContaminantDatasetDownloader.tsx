// app/components/Dataset/ContaminantDatasetDownloader.tsx

import { SectionContainer } from '@/app/components/SectionContainer/SectionContainer';
import { getSectionIcon } from '@/app/config/sectionIcons';
import DatasetSectionClient from './DatasetSectionClient';
import type { ContaminantDatasetDownloaderProps } from '@/types/centralized';

/**
 * Contaminant Dataset Downloader Component
 * 
 * Server component that generates dataset download sections for contaminant pages.
 * Calculates comprehensive statistics from contamination characteristics, laser cleaning
 * parameters, visual identification profiles, and material-specific removal methods.
 * 
 * **Features:**
 * - Laser parameter statistics (wavelength sensitivity, power requirements)
 * - Visual identification profiles by substrate material
 * - Material-specific removal method counts
 * - Chemical composition and safety data
 * - Support for JSON, CSV, and TXT export formats
 * - Regulatory standards and compliance tracking
 * 
 * **Data Categories:**
 * - **Laser Properties:** Parameters, optical properties, removal characteristics, thermal properties
 * - **Visual Characteristics:** Appearance profiles organized by substrate category
 * - **Removal Methods:** Material-specific laser cleaning approaches
 * - **Composition:** Chemical constituents and concentrations
 * - **Safety Data:** Handling requirements and hazard classifications
 * 
 * **Performance:**
 * - Static generation at build time (no runtime fetching)
 * - Optimized stat calculation from structured frontmatter data
 * - Zero client-side processing for statistics
 * 
 * @component
 * @param {ContaminantDatasetDownloaderProps} props - Component props
 * @returns {JSX.Element} Dataset download section with contaminant-specific statistics
 * 
 * @example
 * ```tsx
 * // In a contaminant page (contaminants/[category]/[subcategory]/page.tsx)
 * import ContaminantDatasetDownloader from '@/app/components/Dataset/ContaminantDatasetDownloader';
 * 
 * <ContaminantDatasetDownloader
 *   contaminantName={frontmatter.name}
 *   slug={slug}
 *   category={frontmatter.category}
 *   subcategory={frontmatter.subcategory}
 *   laserProperties={frontmatter.laser_properties}
 *   visualCharacteristics={frontmatter.visual_characteristics}
 *   removalByMaterial={frontmatter.removal_by_material}
 *   composition={frontmatter.composition}
 *   safetyData={frontmatter.safety_data}
 *   faq={frontmatter.faq}
 *   regulatoryStandards={frontmatter.regulatory_standards}
 * />
 * ```
 * 
 * @see {@link ContaminantDatasetDownloaderProps} for prop definitions
 * @see {@link DatasetSectionClient} for client-side download functionality
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
