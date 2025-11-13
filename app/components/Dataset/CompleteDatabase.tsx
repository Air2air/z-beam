// app/components/Dataset/CompleteDatabase.tsx
'use client';

import React, { useState } from 'react';
import { PackageIcon, FileIcon } from '@/app/components/Buttons';
import { Button } from '@/app/components/Button';

interface CompleteDatabaseProps {
  materials: any[];
  onDownload: (type: 'all', format: 'json' | 'csv') => Promise<void>;
}

export default function CompleteDatabase({ materials, onDownload }: CompleteDatabaseProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (format: 'json' | 'csv') => {
    setDownloading(`all-${format}`);
    try {
      await onDownload('all', format);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-blue-200 dark:border-gray-700 p-6 md:p-8">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-600 rounded-lg">
            <PackageIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Complete Database
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              All {materials.length} materials in one file
            </p>
          </div>
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Download the entire materials database including all laser cleaning parameters, 
        material properties, and specifications for all {materials.length} materials.
      </p>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => handleDownload('json')}
          disabled={downloading === 'all-json'}
          variant="primary"
          size="md"
          iconLeft={<FileIcon className="w-5 h-5" />}
        >
          {downloading === 'all-json' ? 'Downloading...' : 'Download JSON'}
        </Button>
        <Button
          onClick={() => handleDownload('csv')}
          disabled={downloading === 'all-csv'}
          variant="primary"
          size="md"
          iconLeft={<FileIcon className="w-5 h-5" />}
        >
          {downloading === 'all-csv' ? 'Downloading...' : 'Download CSV'}
        </Button>
      </div>
    </div>
  );
}
