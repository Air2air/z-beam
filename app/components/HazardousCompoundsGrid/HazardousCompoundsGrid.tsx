/**
 * @component HazardousCompoundsGrid
 * @purpose Display domain linkage compounds with enhanced safety data
 * @pattern Uses DataGrid mapper/sorter pattern for reusable consolidation
 * 
 * ✅ USE ON: Contamination pages only
 *    - Displays produces_compounds from contaminant frontmatter
 * 
 * Consolidation: Replaced 119 lines of custom sorting/mapping with
 * reusable DataGrid pattern (mapCompoundToGrid, sortBySeverity)
 */
'use client';

import { DataGrid } from '../DataGrid';
import { mapCompoundToGrid, type EnhancedCompound } from '@/app/utils/gridMappers';
import { sortBySeverity } from '@/app/utils/gridSorters';

interface HazardousCompoundsGridProps {
  compounds: EnhancedCompound[];
  className?: string;
  columns?: 2 | 3 | 4;
}

export function HazardousCompoundsGrid({
  compounds,
  className = '',
  columns = 3,
}: HazardousCompoundsGridProps) {
  if (!compounds || compounds.length === 0) return null;

  return (
    <DataGrid<EnhancedCompound>
      items={compounds}
      mapper={mapCompoundToGrid}
      sorter={sortBySeverity}
      columns={columns}
      variant="relationship"
      className={className}
    />
  );
}

export default HazardousCompoundsGrid;
