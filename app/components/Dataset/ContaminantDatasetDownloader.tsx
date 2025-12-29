// app/components/Dataset/ContaminantDatasetDownloader.tsx

import DatasetDownloader from './DatasetDownloader';
import type { ContaminantDatasetDownloaderProps } from '@/types/centralized';

/**
 * Contaminant Dataset Downloader - Thin wrapper around unified DatasetDownloader
 * 
 * **Phase 2 Consolidation**: Uses shared DatasetDownloader component with enhanced features:
 * - 36+ variableMeasured items (visual characteristics across 12+ material categories)
 * - Author credentials and E-E-A-T data
 * - Quality verification metadata
 * - Citation array with 3+ authoritative sources
 * - Safety and handling information
 * 
 * @component
 * @param {ContaminantDatasetDownloaderProps} props - Component props
 * @returns {JSX.Element} Dataset download section
 */
export default function ContaminantDatasetDownloader({
  contaminantName,
  slug,
  category = '',
  subcategory = '',
}: ContaminantDatasetDownloaderProps) {
  // Pass slug as-is - DatasetDownloader handles the filename conversion
  return (
    <DatasetDownloader
      itemName={contaminantName}
      slug={slug}
      category={category}
      subcategory={subcategory}
      datasetType="contaminants"
    />
  );
}
