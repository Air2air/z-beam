// app/components/Dataset/CategoryDatasetCard.tsx
'use client';

import React, { useState } from 'react';
import { FiDownload, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { AiOutlineFileText } from 'react-icons/ai';
import { BsFiletypeJson, BsFiletypeCsv } from 'react-icons/bs';

interface CategoryDatasetCardProps {
  category: string;
  categoryLabel: string;
  materials: Array<{
    slug: string;
    name: string;
    subcategory: string;
    subcategoryLabel: string;
  }>;
}

export default function CategoryDatasetCard({ 
  category, 
  categoryLabel,
  materials 
}: CategoryDatasetCardProps) {
  const [downloadFormat, setDownloadFormat] = useState<'json' | 'csv'>('json');
  const [copied, setCopied] = useState(false);

  // Generate aggregated dataset filename
  const datasetName = `${category}-category-materials`;
  
  // Handle download - generate aggregated dataset on-the-fly
  const handleDownload = async (format: 'json' | 'csv') => {
    try {
      if (format === 'json') {
        await downloadAggregatedJSON();
      } else {
        await downloadAggregatedCSV();
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download dataset. Please try again.');
    }
  };

  // Generate aggregated JSON dataset
  const downloadAggregatedJSON = async () => {
    const datasets = await Promise.all(
      materials.map(async (material) => {
        const datasetName = material.slug.endsWith('-laser-cleaning') 
          ? material.slug 
          : `${material.slug}-laser-cleaning`;
        
        try {
          const response = await fetch(`/datasets/materials/${datasetName}.json`);
          if (response.ok) {
            return await response.json();
          }
          return null;
        } catch (error) {
          console.error(`Failed to load dataset for ${material.slug}:`, error);
          return null;
        }
      })
    );

    const validDatasets = datasets.filter(d => d !== null);

    // Create aggregated dataset
    const aggregatedDataset = {
      '@context': 'https://schema.org',
      '@type': 'DataCatalog',
      name: `${categoryLabel} Materials Dataset Collection`,
      description: `Comprehensive laser cleaning parameters and material properties for ${materials.length} ${categoryLabel.toLowerCase()} materials`,
      version: '1.0',
      dateModified: new Date().toISOString().split('T')[0],
      license: 'https://creativecommons.org/licenses/by/4.0/',
      creator: {
        '@type': 'Organization',
        name: 'Z-Beam Laser Cleaning',
        url: 'https://www.z-beam.com'
      },
      numberOfItems: materials.length,
      materials: validDatasets,
      summary: {
        category: categoryLabel,
        materialCount: materials.length,
        subcategories: [...new Set(materials.map(m => m.subcategoryLabel))],
        materialNames: materials.map(m => m.name)
      }
    };

    // Download
    const blob = new Blob([JSON.stringify(aggregatedDataset, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${datasetName}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate aggregated CSV dataset
  const downloadAggregatedCSV = async () => {
    const rows: string[][] = [];
    
    // Headers
    rows.push([
      'Material',
      'Subcategory',
      'Category',
      'Property Type',
      'Property Name',
      'Value',
      'Unit',
      'Source'
    ]);

    // Load all datasets and aggregate
    for (const material of materials) {
      const datasetName = material.slug.endsWith('-laser-cleaning') 
        ? material.slug 
        : `${material.slug}-laser-cleaning`;
      
      try {
        const response = await fetch(`/datasets/materials/${datasetName}.json`);
        if (!response.ok) continue;
        
        const dataset = await response.json();
        const matData = dataset.material;

        // Extract properties
        if (matData.materialProperties) {
          Object.entries(matData.materialProperties).forEach(([categoryKey, categoryData]: [string, any]) => {
            Object.entries(categoryData).forEach(([propKey, propValue]: [string, any]) => {
              if (propKey !== 'label' && propKey !== 'percentage' && propValue && typeof propValue === 'object' && propValue.value !== undefined) {
                rows.push([
                  material.name,
                  material.subcategoryLabel,
                  categoryLabel,
                  categoryKey.replace(/_/g, ' '),
                  propKey,
                  String(propValue.value),
                  propValue.unit || '',
                  propValue.source || ''
                ]);
              }
            });
          });
        }

        // Extract parameters
        if (matData.laserParameters || matData.parameters) {
          const params = matData.laserParameters || matData.parameters;
          Object.entries(params).forEach(([key, value]: [string, any]) => {
            if (value && typeof value === 'object' && value.value !== undefined) {
              rows.push([
                material.name,
                material.subcategoryLabel,
                categoryLabel,
                'Laser Parameter',
                key,
                String(value.value),
                value.unit || '',
                value.source || ''
              ]);
            }
          });
        }
      } catch (error) {
        console.error(`Failed to process ${material.slug}:`, error);
      }
    }

    // Escape CSV cells
    const escapeCSV = (value: string): string => {
      const str = String(value ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Generate CSV string
    const csvContent = rows.map(row => 
      row.map(cell => escapeCSV(cell)).join(',')
    ).join('\n');

    // Add metadata header
    const metadata = [
      `# ${categoryLabel} Materials Dataset Collection`,
      `# Materials: ${materials.length}`,
      `# License: CC BY 4.0`,
      `# Source: Z-Beam Laser Cleaning (https://www.z-beam.com)`,
      `# Generated: ${new Date().toISOString().split('T')[0]}`,
      '#'
    ].join('\n') + '\n';

    // Download
    const blob = new Blob([metadata + csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${datasetName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy download instruction
  const copyDownloadUrl = () => {
    const message = `Category dataset includes ${materials.length} materials. Download available in JSON or CSV format.`;
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {categoryLabel} Materials Dataset
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Aggregated laser cleaning data for {materials.length} {categoryLabel.toLowerCase()} materials
          </p>
        </div>
        <div className="ml-4">
          <FiInfo className="text-blue-500 text-xl" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {materials.length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Materials</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {[...new Set(materials.map(m => m.subcategoryLabel))].length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Subcategories</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 col-span-2 md:col-span-1">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">CC BY 4.0</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">License</div>
        </div>
      </div>

      {/* Format Selection */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Download Format
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setDownloadFormat('json')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              downloadFormat === 'json'
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300'
                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300'
            }`}
          >
            <BsFiletypeJson className="text-lg" />
            <span className="text-sm font-medium">JSON</span>
          </button>
          
          <button
            onClick={() => setDownloadFormat('csv')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              downloadFormat === 'csv'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300'
                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-green-300'
            }`}
          >
            <BsFiletypeCsv className="text-lg" />
            <span className="text-sm font-medium">CSV</span>
          </button>
        </div>
      </div>

      {/* Download Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={copyDownloadUrl}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
        >
          {copied ? (
            <>
              <FiCheckCircle className="text-green-500" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <AiOutlineFileText />
              <span>Copy Info</span>
            </>
          )}
        </button>

        <button
          onClick={() => handleDownload(downloadFormat)}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
        >
          <FiDownload />
          <span>Download {downloadFormat.toUpperCase()}</span>
        </button>
      </div>

      {/* Info Note */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-300">
          <strong>Note:</strong> This aggregated dataset combines data from all {materials.length} materials in the {categoryLabel.toLowerCase()} category. Individual material datasets are also available on each material page.
        </p>
      </div>
    </div>
  );
}
