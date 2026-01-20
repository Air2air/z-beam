/**
 * @component DataGrid
 * @purpose Universal grid that accepts any data + mapper function
 * @usage Replace all domain-specific grid components with this consolidated pattern
 * 
 * This component provides maximum reusability by accepting:
 * - Generic data of type T
 * - A mapper function to transform T → GridItem
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
 *   variant="relationship"
 *   columns={3}
 * />
 * ```
 */

import React from 'react';
import { CardGrid } from '../CardGrid';
import type { DataGridProps } from '@/types';

// Re-export for convenience
export type { DataGridProps };

export function DataGrid<T>({
  items,
  mapper,
  sorter,
  columns = 3,
  variant = 'default',
  className = '',
  showBadgeSymbols = false,
  mode = 'simple',
  filterBy = 'all',
}: DataGridProps<T>) {
  // Sort if sorter provided
  const sortedData = React.useMemo(() => {
    if (!items || items.length === 0 || !sorter) return items;
    return [...items].sort(sorter);
  }, [items, sorter]);

  // Transform to GridItem
  const gridItems = React.useMemo(() => {
    if (!sortedData || sortedData.length === 0) return [];
    return sortedData.map(item => mapper!(item));
  }, [sortedData, mapper]);

  // Early return if no data
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <CardGrid
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
