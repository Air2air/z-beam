// app/components/Dataset/MaterialDatasetDownloader.tsx

import { SectionContainer } from '@/app/components/SectionContainer/SectionContainer';
import { getSectionIcon } from '@/app/config/sectionIcons';
import DatasetSectionClient from './DatasetSectionClient';
import type { MaterialDatasetDownloaderProps } from '@/types/centralized';

/**
 * Material Dataset Downloader Component
 * 
 * Server component that generates dataset download sections for material and settings pages.
 * Calculates comprehensive statistics from material properties and machine settings at build
 * time, providing download options in JSON, CSV, and TXT formats.
 * 
 * **Features:**
 * - Automatic stat calculation from provided data (no API calls)
 * - Support for multiple export formats (JSON, CSV, TXT)
 * - Property categorization (physical properties, laser interaction, etc.)
 * - Machine parameter tracking with min/max ranges
 * - FAQ and regulatory standards integration
 * - Category-level navigation links
 * 
 * **Performance:**
 * - Static generation at build time (no client-side processing)
 * - Zero runtime data fetching
 * - Optimized for SEO with structured metadata
 * 
 * @component
 * @param {MaterialDatasetDownloaderProps} props - Component props
 * @returns {JSX.Element} Dataset download section with statistics and download buttons
 * 
 * @example
 * ```tsx
 * // In a material page (materials/[category]/[subcategory]/[item]/page.tsx)
 * import MaterialDatasetDownloader from '@/app/components/Dataset/MaterialDatasetDownloader';
 * 
 * <MaterialDatasetDownloader
 *   materialName={frontmatter.name}
 *   slug={slug}
 *   category={frontmatter.category}
 *   subcategory={frontmatter.subcategory}
 *   machineSettings={frontmatter.machineSettings}
 *   materialProperties={frontmatter.materialProperties}
 *   faq={frontmatter.faq}
 *   regulatoryStandards={frontmatter.regulatory_standards}
 * />
 * ```
 * 
 * @see {@link MaterialDatasetDownloaderProps} for prop definitions
 * @see {@link DatasetSectionClient} for client-side download functionality
 */
export default function MaterialDatasetDownloader({
  materialName,
  slug,
  category,
  subcategory,
  machineSettings = {},
  materialProperties = {},
  faq = [],
  regulatoryStandards = [],
  showFullDataset: _showFullDataset = false
}: MaterialDatasetDownloaderProps) {
  // Calculate stats from provided data
  const totalProperties = Object.values(materialProperties).reduce((total: number, section: any) => {
    if (section && typeof section === 'object' && !Array.isArray(section)) {
      const propCount = Object.keys(section).filter(k => !['label', 'percentage', 'description'].includes(k)).length;
      return total + propCount;
    }
    return total;
  }, 0);

  const settingsCount = Object.keys(machineSettings).filter(
    k => !['label', 'percentage', 'description', 'material_challenges', 'common_issues', 'essential_parameters'].includes(k)
  ).length;

  const faqCount = Array.isArray(faq) ? faq.length : ((faq as any)?.questions?.length || 0);
  const standardsCount = regulatoryStandards?.length || 0;
  
  // Break down properties by section for better stats
  const physicalProps = Object.keys(materialProperties?.physical_properties || {}).filter(k => !['label', 'percentage', 'description'].includes(k)).length;
  const laserInteraction = Object.keys(materialProperties?.laser_material_interaction || {}).filter(k => !['label', 'percentage', 'description'].includes(k)).length;
  
  const variablesCount = totalProperties;
  const sectionsCount = Object.keys(materialProperties).length;

  // Normalize slug for downloads
  const baseSlug = slug.replace(/-settings$/, '').replace(/-laser-cleaning$/, '');

  return (
    <SectionContainer
      variant="dark"
      title={`${materialName} Dataset Download`}
      icon={getSectionIcon('dataset')}
    >
      <DatasetSectionClient
        title={`${materialName} Dataset`}
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
        baseSlug={baseSlug}
        materialName={materialName}
        category={category}
        subcategory={subcategory}
        includes={[
          `Material properties (${totalProperties} variables across ${sectionsCount} categories)`,
          `Machine settings (${settingsCount} parameters with min/max ranges)`,
          `FAQs and troubleshooting (${faqCount} entries)`,
          `Regulatory standards and compliance (${standardsCount} references)`,
          'Source citations and validation data',
          'Processing parameters and recommended settings'
        ]}
        categoryLink={{
          href: `/materials/${category}`,
          label: `View all ${category.charAt(0).toUpperCase() + category.slice(1)} datasets`
        }}
      />
    </SectionContainer>
  );
}
