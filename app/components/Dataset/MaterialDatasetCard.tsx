// app/components/Dataset/MaterialDatasetCard.tsx
'use client';

import React, { useState } from 'react';
import { FiDownload, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { AiOutlineFileText } from 'react-icons/ai';
import { BsFiletypeJson, BsFiletypeCsv, BsFileEarmarkSpreadsheet } from 'react-icons/bs';
import { BiCodeAlt } from 'react-icons/bi';
import type { MaterialDatasetCardProps } from '@/types';

export default function MaterialDatasetCard({ material, showFullDataset = false }: MaterialDatasetCardProps) {
  const [downloadFormat, setDownloadFormat] = useState<'json' | 'csv' | 'txt'>('json');
  const [copied, setCopied] = useState(false);
  const [datasetInfo, setDatasetInfo] = useState<any>(null);

  // Generate static file URLs
  // Check if slug already ends with "-laser-cleaning" to avoid duplication
  const datasetName = material.slug.endsWith('-laser-cleaning') 
    ? material.slug 
    : `${material.slug}-laser-cleaning`;
  const downloadUrls = {
    json: `/datasets/materials/${datasetName}.json`,
    csv: `/datasets/materials/${datasetName}.csv`,
    txt: `/datasets/materials/${datasetName}.txt`
  };

  // Load dataset metadata from JSON file for accurate counts
  React.useEffect(() => {
    if (!material.materialProperties && !material.machineSettings) {
      fetch(downloadUrls.json)
        .then(res => res.json())
        .then(data => setDatasetInfo(data))
        .catch(err => console.error('Failed to load dataset info:', err));
    }
  }, [material.slug, downloadUrls.json, material.materialProperties, material.machineSettings]);
  
  // Handle download (direct link)
  const handleDownload = (format: 'json' | 'csv' | 'txt') => {
    const link = document.createElement('a');
    link.href = downloadUrls[format];
    link.download = `${material.slug}-dataset.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy download URL
  const copyDownloadUrl = () => {
    const fullUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}${downloadUrls[downloadFormat]}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Count data points with defensive checks
  const countDataPoints = () => {
    let count = 0;
    
    try {
      // Use datasetInfo if material data is incomplete
      const source = datasetInfo?.material || material;
      
      // Count laser parameters
      if (source.parameters && typeof source.parameters === 'object') {
        count += Object.keys(source.parameters).length;
      }
      if (source.laserParameters && typeof source.laserParameters === 'object') {
        count += Object.keys(source.laserParameters).length;
      }
      
      // Count machine settings
      if (source.machineSettings && typeof source.machineSettings === 'object') {
        count += Object.keys(source.machineSettings).length;
      }
      
      // Count material properties (nested structure)
      const materialProps = source.materialProperties || source.materialProperties;
      if (materialProps && typeof materialProps === 'object') {
        Object.values(materialProps).forEach((category: any) => {
          if (category && typeof category === 'object') {
            Object.keys(category).forEach((key) => {
              // Skip 'label' keys and only count properties with values
              if (key !== 'label' && typeof category[key] === 'object' && category[key]?.value !== undefined) {
                count++;
              }
            });
          }
        });
      }
      
      // Count applications
      const apps = source.applications || [];
      if (Array.isArray(apps)) {
        count += apps.length;
      }
      
      // Count FAQs (support both 'faq' and 'faqs')
      const faqList = source.faq || source.faqs || [];
      if (Array.isArray(faqList)) {
        count += faqList.length;
      }
    } catch (error) {
      console.error('Error counting data points:', error);
      return 0;
    }
    
    return count || 0; // Ensure we return at least 0, not NaN
  };

  const dataPoints = countDataPoints();
  
  // Use datasetInfo as fallback for checking available sections
  const source = datasetInfo?.material || material;
  const faqList = source.faq || source.faqs || [];
  const hasParameters = source.parameters || source.laserParameters || source.machineSettings;
  const hasProperties = source.materialProperties && Object.keys(source.materialProperties).length > 0;
  const hasApplications = Array.isArray(source.applications) && source.applications.length > 0;
  const hasFaqs = Array.isArray(faqList) && faqList.length > 0;

  return (
    <div className="bg-gradient-to-br from-blue-50/30 to-indigo-50/30 dark:from-gray-800/30 dark:to-gray-900/30 rounded-lg border border-blue-100 dark:border-gray-700/50 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
            <BsFiletypeJson className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {material.name} Dataset
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {dataPoints} data points • JSON & CSV formats
            </p>
          </div>
        </div>
        {/* <div className="p-2 bg-green-50 dark:bg-green-900/50 rounded-full">
          <FiCheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
        </div> */}
      </div>

      {/* Data Includes */}
      <div className="bg-white/50 dark:bg-gray-800/30 rounded-lg p-4 mb-4 border border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center space-x-2 mb-2">
          <FiInfo className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Dataset Includes:
          </span>
        </div>
        <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          {hasParameters && (
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span>Laser parameters (power, fluence, wavelength, scan speed)</span>
            </li>
          )}
          {hasProperties && (
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span>Material properties (physical, thermal, optical)</span>
            </li>
          )}
          {hasApplications && (
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span>Applications ({(source.applications || []).length} industries)</span>
            </li>
          )}
          {hasFaqs && (
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span>Technical FAQ ({faqList.length} questions)</span>
            </li>
          )}
        </ul>
      </div>

      {/* Download Options */}
      <div className="space-y-3">
        {/* Format Selection and Download Button */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Format:
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setDownloadFormat('json')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  downloadFormat === 'json'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                JSON
              </button>
              <button
                onClick={() => setDownloadFormat('csv')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  downloadFormat === 'csv'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                CSV
              </button>
              <button
                onClick={() => setDownloadFormat('txt')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  downloadFormat === 'txt'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                TXT
              </button>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={() => handleDownload(downloadFormat)}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm whitespace-nowrap"
          >
            <FiDownload className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>

        {/* Direct Link */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <BiCodeAlt className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Direct Link:
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={downloadUrls[downloadFormat]}
              readOnly
              className="flex-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 font-mono"
            />
            <button
              onClick={copyDownloadUrl}
              className="px-3 py-2 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* License Info */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <span className="font-medium">License:</span> Creative Commons BY 4.0 • 
            Free to use with attribution • 
            <a 
              href="https://creativecommons.org/licenses/by/4.0/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline ml-1"
            >
              Learn more
            </a>
          </p>
        </div>
      </div>

      {/* Full Dataset Link */}
      {showFullDataset && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <a
            href="/dataset"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
          >
            <BsFileEarmarkSpreadsheet className="w-4 h-4" />
            <span>View complete materials database (138+ materials)</span>
          </a>
        </div>
      )}
    </div>
  );
}
