// app/components/Dataset/DatasetCard.tsx
'use client';

import React, { useState } from 'react';
import { FiInfo, FiCheckCircle } from 'react-icons/fi';
import { BsFileEarmarkSpreadsheet } from 'react-icons/bs';
import DatasetDownloadControls from './DatasetDownloadControls';

interface DatasetCardProps {
  title: string;
  description: string;
  stats: Array<{
    value: string | number;
    label: string;
  }>;
  formats: Array<'json' | 'csv' | 'txt'>;
  onDownload: (format: 'json' | 'csv' | 'txt') => void | Promise<void>;
  getDirectLink?: (format: 'json' | 'csv' | 'txt') => string;
  includes?: Array<string>;
  note?: string;
  categoryLink?: {
    href: string;
    label: string;
  };
  fullDatasetLink?: boolean;
}

export default function DatasetCard({
  title,
  description,
  stats,
  formats,
  onDownload,
  getDirectLink,
  includes,
  note,
  categoryLink,
  fullDatasetLink = false
}: DatasetCardProps) {
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
  const copyDownloadUrl = () => {
    if (!getDirectLink) {
      const message = `${title} - ${description}`;
      navigator.clipboard.writeText(message);
    } else {
      const fullUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}${getDirectLink(downloadFormat)}`;
      navigator.clipboard.writeText(fullUrl);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const directLink = getDirectLink?.(downloadFormat);

  return (
    <div className="dataset-card bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      {/* Header */}
      <div className="dataset-header flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="dataset-title text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {title}
          </h3>
          <p className="dataset-description text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
        {directLink && (
          <button
            onClick={copyDownloadUrl}
            className="ml-4 flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
          >
            {copied ? (
              <>
                <FiCheckCircle className="text-green-500" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <FiInfo className="text-gray-500" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="dataset-stats-grid grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2 mb-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="dataset-stat-card bg-gray-50 dark:bg-gray-700/50 rounded-lg p-1 h-[60px] flex flex-col items-center justify-center"
          >
            <div className="dataset-stat-value text-lg md:text-xl font-bold text-gray-900 dark:text-white text-center">
              {stat.value}
            </div>
            <div className="dataset-stat-label text-xs text-gray-600 dark:text-gray-400 text-center mt-0.5">{stat.label}</div>
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

      {/* Info Note (optional) */}
      {note && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-300">
            <strong>Note:</strong> {note}
          </p>
        </div>
      )}

      {/* Navigation Links (conditional based on context) */}
      {(categoryLink || fullDatasetLink) && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          {/* Category Link (shown on material pages) */}
          {categoryLink && (
            <a
              href={categoryLink.href}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
            >
              <BsFileEarmarkSpreadsheet className="w-4 h-4" />
              <span>{categoryLink.label}</span>
            </a>
          )}
          
          {/* Full Dataset Link (shown on category pages) */}
          {fullDatasetLink && (
            <a
              href="/datasets"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
            >
              <BsFileEarmarkSpreadsheet className="w-4 h-4" />
              <span>View complete materials database (138+ materials)</span>
            </a>
          )}
        </div>
      )}

      {/* License Info */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
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
  );
}
