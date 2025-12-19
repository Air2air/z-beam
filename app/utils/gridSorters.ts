/**
 * Grid Sorter Utilities
 * 
 * Pure comparison functions for sorting grid data.
 * Each sorter is a standard JavaScript comparator (a, b) => number
 * that can be passed to Array.sort() or DataGrid component.
 * 
 * Benefits:
 * - Centralized sorting logic
 * - Easy to test (pure functions)
 * - Reusable across components
 * - Composable (can chain sorters)
 * 
 * @see DataGrid component for usage
 */

import { EnhancedCompound, DomainLinkage } from './gridMappers';

/**
 * Severity hierarchy (most severe first)
 */
const SEVERITY_ORDER = {
  severe: 0,
  high: 1,
  moderate: 2,
  low: 3,
} as const;

/**
 * Frequency hierarchy (most common first)
 */
const FREQUENCY_ORDER = {
  very_common: 0,
  common: 1,
  occasional: 2,
  rare: 3,
} as const;

/**
 * Exposure risk hierarchy (highest risk first)
 */
const EXPOSURE_RISK_ORDER = {
  high: 0,
  moderate: 1,
  low: 2,
} as const;

/**
 * PPE level hierarchy (most protection first)
 */
const PPE_LEVEL_ORDER = {
  full: 0,
  enhanced: 1,
  basic: 2,
  none: 3,
} as const;

/**
 * Sort compounds by severity (severe → high → moderate → low)
 * Secondary sort by title alphabetically
 */
export function sortBySeverity<T extends { severity: string; title: string }>(
  a: T,
  b: T
): number {
  const severityA = SEVERITY_ORDER[a.severity as keyof typeof SEVERITY_ORDER] ?? 999;
  const severityB = SEVERITY_ORDER[b.severity as keyof typeof SEVERITY_ORDER] ?? 999;
  
  if (severityA !== severityB) {
    return severityA - severityB;
  }
  
  // Secondary sort: alphabetical by title
  return a.title.localeCompare(b.title);
}

/**
 * Sort items alphabetically by title (A-Z)
 */
export function sortAlphabetically<T extends { title: string }>(a: T, b: T): number {
  return a.title.localeCompare(b.title);
}

/**
 * Sort items by frequency (very_common → common → occasional → rare)
 * Secondary sort by severity
 */
export function sortByFrequency<T extends { frequency: string; severity?: string; title: string }>(
  a: T,
  b: T
): number {
  const frequencyA = FREQUENCY_ORDER[a.frequency as keyof typeof FREQUENCY_ORDER] ?? 999;
  const frequencyB = FREQUENCY_ORDER[b.frequency as keyof typeof FREQUENCY_ORDER] ?? 999;
  
  if (frequencyA !== frequencyB) {
    return frequencyA - frequencyB;
  }
  
  // Secondary sort: by severity if available
  if (a.severity && b.severity) {
    const severityA = SEVERITY_ORDER[a.severity as keyof typeof SEVERITY_ORDER] ?? 999;
    const severityB = SEVERITY_ORDER[b.severity as keyof typeof SEVERITY_ORDER] ?? 999;
    if (severityA !== severityB) {
      return severityA - severityB;
    }
  }
  
  // Tertiary sort: alphabetical
  return a.title.localeCompare(b.title);
}

/**
 * Sort compounds by exposure risk (high → moderate → low)
 * Useful for SafetyDataPanel prioritization
 */
export function sortByExposureRisk(a: EnhancedCompound, b: EnhancedCompound): number {
  const riskA = EXPOSURE_RISK_ORDER[a.exposure_risk as keyof typeof EXPOSURE_RISK_ORDER] ?? 999;
  const riskB = EXPOSURE_RISK_ORDER[b.exposure_risk as keyof typeof EXPOSURE_RISK_ORDER] ?? 999;
  
  if (riskA !== riskB) {
    return riskA - riskB;
  }
  
  // Secondary sort: by severity
  return sortBySeverity(a, b);
}

/**
 * Sort compounds by PPE level (full → enhanced → basic → none)
 * Groups by required protection level
 */
export function sortByPPELevel(a: EnhancedCompound, b: EnhancedCompound): number {
  const ppeA = PPE_LEVEL_ORDER[a.control_measures.ppe_level as keyof typeof PPE_LEVEL_ORDER] ?? 999;
  const ppeB = PPE_LEVEL_ORDER[b.control_measures.ppe_level as keyof typeof PPE_LEVEL_ORDER] ?? 999;
  
  if (ppeA !== ppeB) {
    return ppeA - ppeB;
  }
  
  // Secondary sort: by severity
  return sortBySeverity(a, b);
}

/**
 * Sort compounds by exceeds limits (violations first)
 * Prioritizes compounds exceeding OSHA/NIOSH/ACGIH limits
 */
export function sortByExceedsLimits(a: EnhancedCompound, b: EnhancedCompound): number {
  if (a.exceeds_limits !== b.exceeds_limits) {
    return a.exceeds_limits ? -1 : 1;  // Exceeds limits first
  }
  
  // Secondary sort: by exposure risk
  return sortByExposureRisk(a, b);
}

/**
 * Sort compounds by monitoring requirement (required first)
 * Groups compounds requiring continuous monitoring
 */
export function sortByMonitoringRequired(a: EnhancedCompound, b: EnhancedCompound): number {
  if (a.monitoring_required !== b.monitoring_required) {
    return a.monitoring_required ? -1 : 1;  // Required first
  }
  
  // Secondary sort: by severity
  return sortBySeverity(a, b);
}

/**
 * Sort compounds by concentration (highest first)
 * Parses concentration_range like "10-50 mg/m³" and uses max value
 */
export function sortByConcentration(a: EnhancedCompound, b: EnhancedCompound): number {
  const getMaxConcentration = (range: string): number => {
    const match = range.match(/(\d+)-(\d+)/);
    if (!match) return 0;
    return parseInt(match[2], 10);  // Use max value from range
  };
  
  const concA = getMaxConcentration(a.concentration_range);
  const concB = getMaxConcentration(b.concentration_range);
  
  if (concA !== concB) {
    return concB - concA;  // Highest first
  }
  
  // Secondary sort: by severity
  return sortBySeverity(a, b);
}

/**
 * Reverse any sorter (flip the comparison)
 * Usage: sort(reverseSort(sortAlphabetically))
 */
export function reverseSort<T>(sorter: (a: T, b: T) => number) {
  return (a: T, b: T): number => sorter(b, a);
}

/**
 * Compose multiple sorters (fallback chain)
 * Usage: composeSorters(sortBySeverity, sortAlphabetically)
 */
export function composeSorters<T>(...sorters: Array<(a: T, b: T) => number>) {
  return (a: T, b: T): number => {
    for (const sorter of sorters) {
      const result = sorter(a, b);
      if (result !== 0) return result;
    }
    return 0;
  };
}
