// app/components/LinkageGrid/LinkageGrid.tsx
// Simplified wrapper for common LinkageSection + DataGrid pattern

import React from 'react';
import { LinkageSection } from '../LinkageSection';
import {
  contaminantLinkageToGridItem,
  materialLinkageToGridItem,
  settingsLinkageToGridItem,
} from '@/app/utils/gridMappers';
import {
  sortByFrequency,
  sortBySeverity,
} from '@/app/utils/gridSorters';

interface LinkageGridProps {
  data: any[];
  type: 'materials' | 'contaminants' | 'settings';
  title: string;
  description: string;
  sortBy?: 'frequency' | 'severity';
  variant?: 'default' | 'domain-linkage';
}

const MAPPERS = {
  materials: materialLinkageToGridItem,
  contaminants: contaminantLinkageToGridItem,
  settings: settingsLinkageToGridItem,
};

const SORTERS = {
  frequency: sortByFrequency,
  severity: sortBySeverity,
};

/**
 * LinkageGrid - Simplified wrapper for LinkageSection pattern
 * 
 * Automatically selects appropriate mapper and sorter based on type
 */
export function LinkageGrid({
  data,
  type,
  title,
  description,
  sortBy = 'frequency',
  variant = 'default',
}: LinkageGridProps) {
  const mapper = MAPPERS[type];
  const sorter = SORTERS[sortBy];
  
  return (
    <LinkageSection
      data={data}
      title={title}
      description={description}
      mapper={mapper}
      sorter={sorter}
      variant={variant}
    />
  );
}

export default LinkageGrid;
