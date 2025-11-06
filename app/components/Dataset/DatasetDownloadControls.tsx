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
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFormatChange('json')}
              iconLeft={<BsFiletypeJson className="text-lg" />}
              className={selectedFormat === 'json'
                ? 'bg-amber-200 dark:bg-amber-900/60 border-amber-700 dark:border-amber-300 text-amber-700 dark:text-amber-300 !border-opacity-100'
                : 'text-amber-700 dark:text-amber-300 border-amber-700 dark:border-amber-300 !border-opacity-50 hover:!border-opacity-100 hover:bg-amber-100 dark:hover:bg-amber-900/40'
              }
            >
              <span className="text-sm font-medium">JSON</span>
            </Button>
          )}
          
          {formats.includes('csv') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFormatChange('csv')}
              iconLeft={<BsFiletypeCsv className="text-lg" />}
              className={selectedFormat === 'csv'
                ? 'bg-green-200 dark:bg-green-900/60 border-green-700 dark:border-green-300 text-green-700 dark:text-green-300 !border-opacity-100'
                : 'text-green-700 dark:text-green-300 border-green-700 dark:border-green-300 !border-opacity-50 hover:!border-opacity-100 hover:bg-green-100 dark:hover:bg-green-900/40'
              }
            >
              <span className="text-sm font-medium">CSV</span>
            </Button>
          )}

          {formats.includes('txt') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFormatChange('txt')}
              iconLeft={<AiOutlineFileText className="text-lg" />}
              className={selectedFormat === 'txt'
                ? 'bg-purple-200 dark:bg-purple-900/60 border-purple-700 dark:border-purple-300 text-purple-700 dark:text-purple-300 !border-opacity-100'
                : 'text-purple-700 dark:text-purple-300 border-purple-700 dark:border-purple-300 !border-opacity-50 hover:!border-opacity-100 hover:bg-purple-100 dark:hover:bg-purple-900/40'
              }
            >
              <span className="text-sm font-medium">TXT</span>
            </Button>
          )}

          {showCopyButton && (
            <Button
              onClick={onCopyLink}
              variant="outline"
              size="sm"
              iconLeft={copied ? <FiCheckCircle className="text-green-500" /> : <AiOutlineFileText />}
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
          size="sm"
          iconLeft={<FiDownload />}
          className="w-full sm:w-auto sm:ml-auto"
        >
          {isDownloading ? 'Downloading...' : `Download ${selectedFormat.toUpperCase()}`}
        </Button>
      </div>
    </div>
  );
}
