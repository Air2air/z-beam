/**
 * @component DataGrid
 * @purpose Universal grid that accepts any data + mapper function
 * @usage Replace all domain-specific grid components with this consolidated pattern
 * 
 * This component provides maximum reusability by accepting:
 * - Generic data of type T
 * - A mapper function to transform T → GridItemSSR
 * - An optional sorter function for custom ordering
 * - Configuration props (columns, variant, etc.)
 * 
 * Benefits:
 * - Single grid component for all data types
 * - Mappers and sorters are pure functions (easy to test)
 * - Type-safe with TypeScript generics
 * - Composable: mix any mapper with any sorter
 * 
 * @example
 * ```tsx
 * import { compoundToGridItem, sortBySeverity } from '@/app/utils/gridMappers';
 * 
 * <DataGrid
 *   data={compounds}
 *   mapper={compoundToGridItem}
 *   sorter={sortBySeverity}
 *   variant="domain-linkage"
 *   columns={3}
 * />
 * ```
 */

import React from 'react';
import { CardGridSSR } from '../CardGrid/CardGridSSR';
import { GridItemSSR } from '@/types';

interface DataGridProps<T> {
  data: T[];
  mapper: (item: T) => GridItemSSR;
  sorter?: (a: T, b: T) => number;
  columns?: 2 | 3 | 4;
  variant?: 'default' | 'domain-linkage';
  className?: string;
  showBadgeSymbols?: boolean;
  mode?: 'simple' | 'category-grouped';
  filterBy?: 'all' | 'category' | 'subcategory';
}

export function DataGrid<T>({
  data,
  mapper,
  sorter,
  columns = 3,
  variant = 'default',
  className = '',
  showBadgeSymbols = false,
  mode = 'simple',
  filterBy = 'all',
}: DataGridProps<T>) {
  // Early return if no data
  if (!data || data.length === 0) {
    return null;
  }

  // Sort if sorter provided
  const sortedData = React.useMemo(() => {
    if (!sorter) return data;
    return [...data].sort(sorter);
  }, [data, sorter]);

  // Transform to GridItemSSR
  const gridItems = React.useMemo(() => {
    return sortedData.map(mapper);
  }, [sortedData, mapper]);

  return (
    <CardGridSSR
      items={gridItems}
      columns={columns}
      variant={variant}
      showBadgeSymbols={showBadgeSymbols}
      mode={mode}
      filterBy={filterBy}
      className={className}
    />
  );
}
