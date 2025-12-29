import DatasetSection from './DatasetSection';
import type { DatasetDownloaderProps } from '@/types/centralized';
import { loadGeneratedDataset } from '@/app/utils/schemas/datasetLoader';

export default function DatasetDownloader({
  itemName,
  slug,
  category,
  datasetType
}: DatasetDownloaderProps) {
  const dataset = loadGeneratedDataset(slug, datasetType);

  if (!dataset) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-600">Dataset not available</p>
      </div>
    );
  }

  // Extract counts from dataset
  const variableCount = dataset.variableMeasured?.length || 0;
  const keywordCount = dataset.keywords?.length || 0;
  const citationCount = dataset.citation?.length || 0;
  const distributionCount = dataset.distribution?.length || 0;
  
  // Calculate type-specific counts
  const parameterCount = dataset.variableMeasured?.filter((v: any) => 
    v.propertyID?.startsWith('machine_')
  ).length || 0;
  
  const safetyCount = dataset.variableMeasured?.filter((v: any) => 
    v.propertyID?.startsWith('safety_') || v.propertyID?.startsWith('ppe_')
  ).length || 0;
  
  const categoryCount = dataset.material?.classification ? 
    Object.keys(dataset.material.classification).length : 0;

  // Build stats array
  const stats = datasetType === 'materials' ? [
    { value: variableCount, label: 'Variables' },
    { value: parameterCount, label: 'Laser Parameters' },
    { value: categoryCount, label: 'Material Methods' },
    { value: keywordCount, label: 'Properties' },
    { value: citationCount, label: 'Standards' },
    { value: distributionCount, label: 'Formats' }
  ] : [
    { value: variableCount, label: 'Variables' },
    { value: safetyCount, label: 'Safety Data' },
    { value: keywordCount, label: 'Characteristics' },
    { value: citationCount, label: 'References' },
    { value: distributionCount, label: 'Formats' }
  ];

  // Build dataset URLs
  const baseFilename = datasetType === 'materials' 
    ? `${slug}-material-dataset`
    : `${slug.replace('-contamination', '')}-contaminant-dataset`;
  
  return (
    <DatasetSection
      title={`${itemName} Dataset`}
      description={`Download ${itemName} properties, specifications, and parameters in machine-readable formats`}
      stats={stats}
      jsonUrl={`/datasets/${datasetType}/${baseFilename}.json`}
      csvUrl={`/datasets/${datasetType}/${baseFilename}.csv`}
      txtUrl={`/datasets/${datasetType}/${baseFilename}.txt`}
      category={category}
      categoryLabel={category ? `View all ${category.charAt(0).toUpperCase() + category.slice(1)} datasets` : undefined}
    />
  );
}
