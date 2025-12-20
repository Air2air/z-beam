/**
 * CompoundSafetyGrid Component
 * 
 * Specialized grid for displaying hazardous compounds with safety metadata.
 * Uses the DataGrid universal component with compound-specific mapper/sorter.
 * 
 * Features:
 * - Severity-based sorting (default)
 * - Concentration badges
 * - Exceeds limits warnings
 * - PPE level indicators
 * - Relationship card variant
 * - Monitoring requirements
 * 
 * Data Source: produces_compounds (flattened structure)
 * 
 * Usage:
 * <CompoundSafetyGrid 
 *   compounds={metadata.produces_compounds || []}
 *   sortBy="severity"
 *   showConcentrations={true}
 * />
 * 
 * @see DataGrid for universal grid logic
 * @see gridMappers.ts for compound transformation
 * @see gridSorters.ts for sorting options
 */

import React from 'react';
import { DataGrid } from '../DataGrid';
import { 
  compoundToGridItem, 
  EnhancedCompound 
} from '@/app/utils/gridMappers';
import {
  sortBySeverity,
  sortByExposureRisk,
  sortByPPELevel,
  sortByExceedsLimits,
  sortByConcentration,
  sortByFrequency,
  sortAlphabetically,
} from '@/app/utils/gridSorters';

/**
 * Sort strategy options
 */
export type SortStrategy = 
  | 'severity'       // Default: severe → high → moderate → low
  | 'exposure_risk'  // High risk → moderate → low
  | 'ppe_level'      // Full protection → enhanced → basic → none
  | 'exceeds_limits' // Violations first
  | 'concentration'  // Highest concentration first
  | 'frequency'      // Very common → common → occasional → rare
  | 'alphabetical';  // A-Z by title

/**
 * Sorter lookup map
 */
const SORTERS = {
  severity: sortBySeverity,
  exposure_risk: sortByExposureRisk,
  ppe_level: sortByPPELevel,
  exceeds_limits: sortByExceedsLimits,
  concentration: sortByConcentration,
  frequency: sortByFrequency,
  alphabetical: sortAlphabetically,
} as const;

interface CompoundSafetyGridProps {
  compounds: EnhancedCompound[];
  sortBy?: SortStrategy;
  columns?: number;
  showConcentrations?: boolean;
  showExceedsWarnings?: boolean;
  className?: string;
  mode?: 'default' | 'compact' | 'detailed';
  filterBy?: {
    severity?: ('severe' | 'high' | 'moderate' | 'low')[];
    hazard_class?: string[];
    exceeds_limits?: boolean;
    monitoring_required?: boolean;
  };
}

/**
 * CompoundSafetyGrid - Display hazardous compounds with safety metadata
 */
export function CompoundSafetyGrid({
  compounds,
  sortBy = 'severity',
  columns = 3,
  showConcentrations = true,
  showExceedsWarnings = true,
  className = '',
  mode = 'default',
  filterBy,
}: CompoundSafetyGridProps) {
  // Apply filters if provided
  const filteredCompounds = React.useMemo(() => {
    if (!filterBy) return compounds;

    return compounds.filter((compound) => {
      // Filter by severity
      if (filterBy.severity && !filterBy.severity.includes(compound.severity as any)) {
        return false;
      }

      // Filter by hazard class
      if (filterBy.hazard_class && !filterBy.hazard_class.includes(compound.hazard_class)) {
        return false;
      }

      // Filter by exceeds limits
      if (filterBy.exceeds_limits !== undefined && compound.exceeds_limits !== filterBy.exceeds_limits) {
        return false;
      }

      // Filter by monitoring required
      if (filterBy.monitoring_required !== undefined && compound.monitoring_required !== filterBy.monitoring_required) {
        return false;
      }

      return true;
    });
  }, [compounds, filterBy]);

  // Get sorter function
  const sorter = SORTERS[sortBy];

  // Empty state
  if (filteredCompounds.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No compounds match the current filters.</p>
      </div>
    );
  }

  return (
    <DataGrid<EnhancedCompound>
      items={filteredCompounds}
      mapper={compoundToGridItem}
      sorter={sorter}
      columns={columns as 2 | 3 | 4}
      variant="relationship"  // Use colored borders for safety context
      mode="simple"
      className={className}
    />
  );
}

export default CompoundSafetyGrid;
