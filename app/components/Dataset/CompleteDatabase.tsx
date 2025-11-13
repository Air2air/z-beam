// app/components/Dataset/CompleteDatabase.tsx
'use client';

import React, { useState } from 'react';
import { PackageIcon, FileIcon } from '@/app/components/Buttons';
import { Button } from '@/app/components/Button';
import { DownloadCard } from './DownloadCard';

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
    <DownloadCard
      icon={<PackageIcon className="w-6 h-6" />}
      title="Complete Database"
      subtitle={`All ${materials.length} materials in one file`}
      description={`Download the entire materials database including all laser cleaning parameters, material properties, and specifications for all ${materials.length} materials.`}
    >
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
    </DownloadCard>
  );
}
