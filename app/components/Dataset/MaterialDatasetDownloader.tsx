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
  // Normalize slug for dataset lookup - remove all suffixes to get base name
  // The DatasetDownloader will add the appropriate suffix (-material-dataset.json)
  const baseSlug = slug
    .replace(/-laser-cleaning$/, '')
    .replace(/-settings$/, '')
    .replace(/-material-dataset$/, '');

  return (
    <DatasetDownloader
      itemName={materialName}
      slug={baseSlug}
      category={category}
      subcategory={subcategory}
      datasetType="materials"
    />
  );
}
