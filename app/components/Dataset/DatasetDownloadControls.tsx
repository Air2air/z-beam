// app/components/Dataset/DatasetDownloadControls.tsx
'use client';

import React from 'react';
import { FiDownload, FiCheckCircle } from 'react-icons/fi';
import { AiOutlineFileText } from 'react-icons/ai';
import { BsFiletypeJson, BsFiletypeCsv } from 'react-icons/bs';
import { Button } from '@/app/components/Button';
import type { DatasetDownloadControlsProps } from '@/types/centralized';

export default function DatasetDownloadControls({
  formats,
  selectedFormat,
  onFormatChange,
  onDownload,
  onCopyLink,
  isDownloading,
  copied,
  showCopyButton
}: DatasetDownloadControlsProps) {
  return (
    <div className="dataset-download-controls mb-4">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
        Download Format
      </label>
      
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        {/* Format Selection Buttons */}
        <div className="flex flex-wrap gap-2">
          {formats.includes('json') && (
            <button
              onClick={() => onFormatChange('json')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                selectedFormat === 'json'
                  ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 text-amber-700 dark:text-amber-300'
                  : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-amber-300'
              }`}
            >
              <BsFiletypeJson className="text-lg" />
              <span className="text-sm font-medium">JSON</span>
            </button>
          )}
          
          {formats.includes('csv') && (
            <button
              onClick={() => onFormatChange('csv')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                selectedFormat === 'csv'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300'
                  : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-green-300'
              }`}
            >
              <BsFiletypeCsv className="text-lg" />
              <span className="text-sm font-medium">CSV</span>
            </button>
          )}

          {formats.includes('txt') && (
            <button
              onClick={() => onFormatChange('txt')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                selectedFormat === 'txt'
                  ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-700 dark:text-purple-300'
                  : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-300'
              }`}
            >
              <AiOutlineFileText className="text-lg" />
              <span className="text-sm font-medium">TXT</span>
            </button>
          )}

          {showCopyButton && (
            <button
              onClick={onCopyLink}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              {copied ? (
                <>
                  <FiCheckCircle className="text-green-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <AiOutlineFileText />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Download Button */}
        <Button
          onClick={onDownload}
          disabled={isDownloading}
          variant="primary"
          className="w-full sm:w-auto sm:ml-auto"
        >
          <FiDownload />
          <span>{isDownloading ? 'Downloading...' : `Download ${selectedFormat.toUpperCase()}`}</span>
        </Button>
      </div>
    </div>
  );
}
