// app/components/Dataset/DatasetSection.tsx
'use client';

import React, { useState } from 'react';
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
  formats,
  onDownload,
  getDirectLink,
  includes: _includes,
  note: _note,
  categoryLink,
  fullDatasetLink = false
}: DatasetSectionProps) {
  const [downloadFormat, setDownloadFormat] = useState<'json' | 'csv' | 'txt'>(formats[0]);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Handle download
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await onDownload(downloadFormat);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download dataset. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Copy download URL
  const copyDownloadUrl = async () => {
    const textToCopy = !getDirectLink
      ? `${title} - ${description}`
      : `${typeof window !== 'undefined' ? window.location.origin : ''}${getDirectLink(downloadFormat)}`;
    
    await copyToClipboard(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const _directLink = getDirectLink?.(downloadFormat);

  return (
    <div className="dataset-card bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      {/* Header */}
      <SectionTitle 
        title={title}
        description={description}
        icon={getSectionIcon('dataset')}
      />

      {/* Stats Grid */}
      <div className={`dataset-stats-grid grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 ${GRID_GAP_RESPONSIVE} mb-6`}>
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="dataset-stat-card bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 p-1 h-[60px] flex flex-col items-center justify-center"
          >
            <div 
              className="dataset-stat-value text-lg md:text-xl font-bold text-center text-gray-900 dark:text-white"
            >
              {stat.value}
            </div>
            <div 
              className="dataset-stat-label text-xs text-center mt-0.5 text-gray-600 dark:text-gray-400"
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <DatasetDownloadControls
        formats={formats}
        selectedFormat={downloadFormat}
        onFormatChange={setDownloadFormat}
        onDownload={handleDownload}
        onCopyLink={copyDownloadUrl}
        isDownloading={isDownloading}
        copied={copied}
        showCopyButton={false}
      />

      {/* Navigation Links (conditional based on context) */}
      {(categoryLink || fullDatasetLink) && (
        <div className="mt-4 pt-4 space-y-2">
          {/* Category Link (shown on material pages) */}
          {categoryLink && (
            <a
              href={categoryLink.href}
              className="text-sm text-blue-600400 hover:underline flex items-center space-x-1"
            >
              <FileIcon className="w-4 h-4" />
              <span>{categoryLink.label}</span>
            </a>
          )}
          
          {/* Full Dataset Link (shown on category pages) */}
          {fullDatasetLink && (
            <a
              href="/datasets"
              className="text-sm text-blue-600400 hover:underline flex items-center space-x-1"
            >
              <FileIcon className="w-4 h-4" />
              <span>View complete materials database (138+ materials)</span>
            </a>
          )}
        </div>
      )}

      {/* License Info */}
      <div className="mt-4 pt-3">
        <p className="text-xs text-muted">
          <span className="font-medium">License:</span> Creative Commons BY 4.0 • 
          Free to use with attribution • 
          <a 
            href="https://creativecommons.org/licenses/by/4.0/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600400 hover:underline ml-1"
          >
            Learn more
          </a>
        </p>
      </div>
    </div>
  );
}
