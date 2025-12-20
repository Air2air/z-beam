// app/components/Relationship/Relationship.tsx
import React from 'react';
import { GridSection } from '@/app/components/GridSection/GridSection';
import { DataGrid } from '@/app/components/DataGrid/DataGrid';
import type { GridItem } from '@/types/centralized';

/**
 * Universal component for rendering linkage sections with consistent pattern
 * Encapsulates: conditional rendering, GridSection wrapper, DataGrid configuration
 */

interface RelationshipProps<T> {
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
 * Relationship Component
 * 
 * Renders a relationship section with:
 * - Automatic conditional rendering (only shows if data exists)
 * - GridSection wrapper with title/description
 * - DataGrid with mapper/sorter
 * 
 * @example
 * <Relationship
 *   data={metadata.produces_compounds}
 *   title="Hazardous Compounds"
 *   description="Compounds produced during laser cleaning"
 *   mapper={compoundToGridItem}
 *   sorter={sortBySeverity}
 * />
 */
export function Relationship<T>({
  data,
  title,
  description,
  mapper,
  sorter,
  columns = 3,
  variant = 'default'
}: RelationshipProps<T>) {
  // Early return if no data
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <GridSection title={title} description={description}>
      <DataGrid
        items={data}
        mapper={mapper}
        sorter={sorter}
        columns={columns as 2 | 3 | 4 | undefined}
        variant={variant}
      />
    </GridSection>
  );
}
