// app/components/Dataset/DatasetDownloadControls.tsx
'use client';

import React from 'react';
import { Button } from '@/app/components/Button';
import { DatabaseIcon, DownloadIcon, CheckCircleIcon, InfoIcon } from '@/app/components/Buttons';
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
      <label className="text-sm font-medium mb-2 block">
        Download Format
      </label>
      
      <div className="flex flex-row items-start justify-between gap-3">
        {/* Format Selection Buttons */}
        <div className="flex flex-wrap gap-2">
          {formats.includes('json') && (
            <button
              onClick={() => onFormatChange('json')}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border transition-all min-h-[40px] ${
                selectedFormat === 'json'
                  ? 'bg-amber-200 dark:bg-amber-900/60 border-amber-700 dark:border-amber-300 text-amber-700 dark:text-amber-300'
                  : 'text-amber-700 dark:text-amber-300 border-amber-700 dark:border-amber-300 border-opacity-50 hover:border-opacity-100 hover:bg-amber-100 dark:hover:bg-amber-900/40'
              }`}
            >
              <DatabaseIcon className="w-4 h-4 text-amber-700 dark:text-amber-300" />
              <span className="text-sm font-medium">JSON</span>
            </button>
          )}
          
          {formats.includes('csv') && (
            <button
              onClick={() => onFormatChange('csv')}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border transition-all min-h-[40px] ${
                selectedFormat === 'csv'
                  ? 'bg-green-200 dark:bg-green-900/60 border-green-700 dark:border-green-300 text-green-700 dark:text-green-300'
                  : 'text-green-700 dark:text-green-300 border-green-700 dark:border-green-300 border-opacity-50 hover:border-opacity-100 hover:bg-green-100 dark:hover:bg-green-900/40'
              }`}
            >
              <DatabaseIcon className="w-4 h-4 text-green-700 dark:text-green-300" />
              <span className="text-sm font-medium">CSV</span>
            </button>
          )}

          {formats.includes('txt') && (
            <button
              onClick={() => onFormatChange('txt')}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border transition-all min-h-[40px] ${
                selectedFormat === 'txt'
                  ? 'bg-purple-200 dark:bg-purple-900/60 border-purple-700 dark:border-purple-300 text-purple-700 dark:text-purple-300'
                  : 'text-purple-700 dark:text-purple-300 border-purple-700 dark:border-purple-300 border-opacity-50 hover:border-opacity-100 hover:bg-purple-100 dark:hover:bg-purple-900/40'
              }`}
            >
              <DatabaseIcon className="w-4 h-4 text-purple-700 dark:text-purple-300" />
              <span className="text-sm font-medium">TXT</span>
            </button>
          )}

          {showCopyButton && (
            <Button
              onClick={onCopyLink}
              variant="outline"
              size="md"
              iconLeft={copied ? <CheckCircleIcon className="text-green-500 w-4 h-4" /> : <InfoIcon className="w-4 h-4" />}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          )}
        </div>

        {/* Download Button */}
        <Button
          onClick={onDownload}
          disabled={isDownloading}
          variant="primary"
          size="md"
          iconLeft={<DownloadIcon className="w-4 h-4" />}
          className="flex-shrink-0"
        >
          {isDownloading ? 'Downloading...' : `Download ${selectedFormat.toUpperCase()}`}
        </Button>
      </div>
    </div>
  );
}
