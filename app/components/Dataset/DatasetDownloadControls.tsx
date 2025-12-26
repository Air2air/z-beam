'use client';

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
    <div className="mb-4">
      <label className="text-sm font-medium mb-2 block">Download Format</label>
      
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {formats.includes('json') && (
            <button
              onClick={() => onFormatChange('json')}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-md border min-h-[40px] ${
                selectedFormat === 'json'
                  ? 'bg-amber-200 dark:bg-amber-900/60 border-amber-700 text-amber-700 dark:text-amber-300'
                  : 'border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40'
              }`}
            >
              <DatabaseIcon className="w-4 h-4" />
              <span className="text-sm font-medium">JSON</span>
            </button>
          )}
          
          {formats.includes('csv') && (
            <button
              onClick={() => onFormatChange('csv')}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-md border min-h-[40px] ${
                selectedFormat === 'csv'
                  ? 'bg-green-200 dark:bg-green-900/60 border-green-700 text-green-700 dark:text-green-300'
                  : 'border-green-700 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40'
              }`}
            >
              <DatabaseIcon className="w-4 h-4" />
              <span className="text-sm font-medium">CSV</span>
            </button>
          )}

          {formats.includes('txt') && (
            <button
              onClick={() => onFormatChange('txt')}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-md border min-h-[40px] ${
                selectedFormat === 'txt'
                  ? 'bg-purple-200 dark:bg-purple-900/60 border-purple-700 text-purple-700 dark:text-purple-300'
                  : 'border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40'
              }`}
            >
              <DatabaseIcon className="w-4 h-4" />
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

        <Button
          onClick={onDownload}
          disabled={isDownloading}
          variant="primary"
          size="md"
          iconLeft={<DownloadIcon className="w-4 h-4" />}
        >
          {isDownloading ? 'Downloading...' : `Download ${selectedFormat.toUpperCase()}`}
        </Button>
      </div>
    </div>
  );
}
