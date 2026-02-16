// app/components/LinkageSection/LinkageSection.tsx
import React from 'react';
import { Relationship } from '@/app/components/Relationship/Relationship';
import type { RelationshipProps } from '@/app/components/Relationship/Relationship';

/**
 * Legacy-named wrapper for Relationship component.
 * Kept for compatibility while consolidating relationship rendering logic
 * to a single implementation.
 */

export type LinkageSectionProps<T> = RelationshipProps<T>;

/**
 * LinkageSection Component
 * 
 * Renders a linkage section with:
 * - Automatic conditional rendering (only shows if data exists)
 * - Relationship wrapper with title/description
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
  return (
    <Relationship
      data={data}
      title={title}
      description={description}
      mapper={mapper}
      sorter={sorter}
      columns={columns}
      variant={variant}
    />
  );
}
