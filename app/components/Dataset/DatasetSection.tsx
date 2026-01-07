'use client';

import { useState } from 'react';
import { FileIcon } from '@/app/components/Buttons';
import { SectionTitle } from '@/app/components/SectionTitle/SectionTitle';
import { getSectionIcon } from '@/app/config/sectionIcons';
import DatasetDownloadControls from './DatasetDownloadControls';
import { copyToClipboard } from '@/app/utils/downloadUtils';
import type { DatasetSectionProps } from '@/types/centralized';
import { GRID_GAP_RESPONSIVE } from '@/app/config/site';

export default function DatasetSection({
  title,
  description,
  stats,
  jsonUrl,
  csvUrl,
  txtUrl,
  category,
  categoryLabel,
  fullDatasetLink = false
}: DatasetSectionProps) {
  const [downloadFormat, setDownloadFormat] = useState<'json' | 'csv' | 'txt'>('json');
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const getCurrentUrl = () => {
    switch (downloadFormat) {
      case 'json': return jsonUrl;
      case 'csv': return csvUrl;
      case 'txt': return txtUrl;
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const url = getCurrentUrl();
      if (!url) {
        throw new Error('Download URL not available');
      }
      const a = document.createElement('a');
      a.href = url;
      a.download = url.split('/').pop() || '';
      a.click();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download dataset. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const copyDownloadUrl = async () => {
    const url = getCurrentUrl();
    const fullUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}${url}`;
    await copyToClipboard(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const directLink = getCurrentUrl();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <SectionTitle 
        title={title}
        sectionDescription={description}
        icon={getSectionIcon('dataset')}
      />

      <div className={`grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 ${GRID_GAP_RESPONSIVE} mb-6`}>
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 p-1 h-[60px] flex flex-col items-center justify-center">
            <div className="text-lg md:text-xl font-bold text-center text-gray-900 dark:text-white">
              {stat.value}
            </div>
            <div className="text-xs text-center mt-0.5 text-gray-600 dark:text-gray-400">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <DatasetDownloadControls
        formats={['json', 'csv', 'txt']}
        selectedFormat={downloadFormat}
        onFormatChange={setDownloadFormat}
        onDownload={handleDownload}
        onCopyLink={copyDownloadUrl}
        isDownloading={isDownloading}
        copied={copied}
        showCopyButton={false}
      />

      {(category || fullDatasetLink) && (
        <div className="mt-4 pt-4 space-y-2">
          {category && categoryLabel && (
            <a href={`/contaminants/${category}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              <FileIcon className="w-4 h-4" />
              <span>{categoryLabel}</span>
            </a>
          )}
          {fullDatasetLink && (
            <a href="/datasets" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              <FileIcon className="w-4 h-4" />
              <span>View complete materials database (138+ materials)</span>
            </a>
          )}
        </div>
      )}

      <div className="mt-4 pt-3">
        <p className="text-xs text-muted">
          <span className="font-medium">License:</span> Creative Commons BY 4.0 • Free to use with attribution • 
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
            Learn more
          </a>
        </p>
      </div>
    </div>
  );
}
