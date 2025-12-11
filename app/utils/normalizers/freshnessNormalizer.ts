/**
 * @module freshnessNormalizer
 * @purpose Automatically ensures frontmatter has proper datePublished and dateModified timestamps
 *          for SEO freshness signals without requiring manual script execution
 * @dependencies None (pure function)
 * @usage Import normalizeFreshnessTimestamps and apply to frontmatter data
 * 
 * GOOGLE FRESHNESS SIGNALS:
 * - Content updated within 30 days: "Fresh" content boost
 * - Content updated 30-90 days: Normal ranking
 * - Content updated 90+ days: Potential "stale" penalty
 */

export interface FreshnessConfig {
  // Freshness intervals in days
  freshInterval: number;      // 30 days - Google "fresh" content
  normalInterval: number;     // 90 days - Normal ranking
  staleInterval: number;      // 180 days - Potentially stale
  
  // Auto-update settings
  autoUpdateStale: boolean;   // Auto-update dateModified if stale
  minDaysBetweenUpdates: number; // Minimum 7 days between updates
}

const DEFAULT_CONFIG: FreshnessConfig = {
  freshInterval: 30,
  normalInterval: 90,
  staleInterval: 180,
  autoUpdateStale: false, // Conservative - don't auto-update by default
  minDaysBetweenUpdates: 7,
};

/**
 * Calculate days since a date
 */
function daysSince(dateString: string | undefined): number {
  if (!dateString) return Infinity;
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  } catch {
    return Infinity;
  }
}

/**
 * Get freshness status
 */
export function getFreshnessStatus(
  dateString: string | undefined,
  config: FreshnessConfig = DEFAULT_CONFIG
): 'fresh' | 'normal' | 'stale' | 'very_stale' | 'missing' {
  if (!dateString) return 'missing';
  
  const days = daysSince(dateString);
  
  if (days <= config.freshInterval) return 'fresh';
  if (days <= config.normalInterval) return 'normal';
  if (days <= config.staleInterval) return 'stale';
  return 'very_stale';
}

/**
 * Get current ISO 8601 timestamp
 */
function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Ensure frontmatter has proper freshness timestamps
 * 
 * @param data - Frontmatter data object
 * @param config - Freshness configuration
 * @returns Data with normalized timestamp fields
 */
export function normalizeFreshnessTimestamps(
  data: any,
  config: FreshnessConfig = DEFAULT_CONFIG
): any {
  if (!data) return data;
  
  const now = getCurrentTimestamp();
  
  // 1. Ensure datePublished exists
  if (!data.datePublished) {
    // Try to use micro.generated as fallback
    if (data.micro && data.micro.generated) {
      data.datePublished = data.micro.generated;
    } else {
      // Set to current timestamp (first time seeing this file)
      data.datePublished = now;
    }
  }
  
  // 2. Ensure dateModified exists
  if (!data.dateModified) {
    // Initialize to datePublished
    data.dateModified = data.datePublished;
  }
  
  // 3. Optional: Auto-update stale content (disabled by default)
  if (config.autoUpdateStale) {
    const status = getFreshnessStatus(data.dateModified, config);
    const daysSinceUpdate = daysSince(data.dateModified);
    
    // Only update if content is stale AND minimum days have passed
    if (
      (status === 'stale' || status === 'very_stale') &&
      daysSinceUpdate >= config.minDaysBetweenUpdates
    ) {
      data.dateModified = now;
    }
  }
  
  return data;
}

/**
 * Check if content needs a freshness update (for reporting/monitoring)
 */
export function needsFreshnessUpdate(
  data: any,
  config: FreshnessConfig = DEFAULT_CONFIG
): boolean {
  if (!data || !data.dateModified) return true;
  
  const status = getFreshnessStatus(data.dateModified, config);
  return status === 'stale' || status === 'very_stale';
}

/**
 * Get freshness statistics for monitoring
 */
export function getFreshnessStats(data: any): {
  hasDatePublished: boolean;
  hasDateModified: boolean;
  status: string;
  daysSinceModified: number;
  needsUpdate: boolean;
} {
  return {
    hasDatePublished: !!data?.datePublished,
    hasDateModified: !!data?.dateModified,
    status: getFreshnessStatus(data?.dateModified),
    daysSinceModified: daysSince(data?.dateModified),
    needsUpdate: needsFreshnessUpdate(data),
  };
}
