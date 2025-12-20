// app/components/LinkageSection/LinkageSection.tsx
import React from 'react';
import { GridSection } from '@/app/components/GridSection/GridSection';
import { DataGrid } from '@/app/components/DataGrid/DataGrid';
import type { GridItem } from '@/types';

/**
 * Universal component for rendering linkage sections with consistent pattern
 * Encapsulates: conditional rendering, GridSection wrapper, DataGrid configuration
 */

interface LinkageSectionProps<T> {
  /** Data array from metadata (e.g., metadata.produces_compounds) */
  data: T[] | undefined;
  
  /** Section title */
  title: string;
  
  /** Section description (optional) */
  description?: string;
  
  /** Mapper function to transform data to GridItem format */
  mapper: (item: T) => GridItem;
  
  /** Optional sorter function */
  sorter?: (a: T, b: T) => number;
  
  /** Number of columns (default: 3) */
  columns?: number;
  
  /** Grid variant (default: 'default') */
  variant?: 'default' | 'relationship';
}

/**
 * LinkageSection Component
 * 
 * Renders a linkage section with:
 * - Automatic conditional rendering (only shows if data exists)
 * - GridSection wrapper with title/description
 * - DataGrid with mapper/sorter
 * 
 * @example
 * <LinkageSection
 *   data={metadata.produces_compounds}
 *   title="Hazardous Compounds"
 *   description="Compounds produced during laser cleaning"
 *   mapper={compoundToGridItem}
 *   sorter={sortBySeverity}
 * />
 */
export function LinkageSection<T>({
  data,
  title,
  description,
  mapper,
  sorter,
  columns = 3,
  variant = 'default'
}: LinkageSectionProps<T>) {
  // Early return if no data
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <GridSection title={title} description={description}>
      <DataGrid<T>
        items={data}
        mapper={mapper}
        sorter={sorter}
        columns={columns as 2 | 3 | 4}
        variant={variant}
      />
    </GridSection>
  );
}
