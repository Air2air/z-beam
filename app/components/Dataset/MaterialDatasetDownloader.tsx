// app/components/Dataset/MaterialDatasetDownloader.tsx

import DatasetDownloader from './DatasetDownloader';
import type { MaterialDatasetDownloaderProps } from '@/types/centralized';

/**
 * Material Dataset Downloader - Thin wrapper around unified DatasetDownloader
 * 
 * **Phase 2 Consolidation**: Uses shared DatasetDownloader component with enhanced features:
 * - 20+ variableMeasured items
 * - Author credentials and E-E-A-T data
 * - Quality verification metadata
 * - Citation array with 3+ authoritative sources
 * - Image references
 * 
 * @component
 * @param {MaterialDatasetDownloaderProps} props - Component props
 * @returns {JSX.Element} Dataset download section
 */
export default function MaterialDatasetDownloader({
  materialName,
  slug,
  category,
  subcategory,
}: MaterialDatasetDownloaderProps) {
  // Normalize slug for dataset lookup - use -material-dataset suffix
  const baseSlug = slug.replace(/-settings$/, '').replace(/-laser-cleaning$/, '').replace(/-material-dataset$/, '');
  const datasetSlug = `${baseSlug}-material-dataset`;

  return (
    <DatasetDownloader
      itemName={materialName}
      slug={datasetSlug}
      category={category}
      subcategory={subcategory}
      datasetType="materials"
    />
  );
}
