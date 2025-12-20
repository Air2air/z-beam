/**
 * @component HazardousCompoundsGrid
 * @purpose Extended grid for displaying domain linkage compounds with enhanced safety data
 * @extends CardGrid - Adds safety indicators, severity ordering, and enhanced metadata
 * 
 * ✅ USE ON: Contamination pages only
 *    - Displays produces_compounds from contaminant frontmatter
 *    - Shows compounds generated during laser cleaning of contaminants
 * 
 * ❌ DO NOT USE ON: Materials pages, Settings pages
 *    - Materials use standard MaterialCard grids (different data structure)
 *    - Settings have specialized components (no compound data)
 */
'use client';

import { CardGrid } from '../CardGrid';
import { GridItem } from '@/types';

interface EnhancedCompound {
  id: string;
  title: string;
  url: string;
  image: string;
  category: string;
  subcategory: string;
  frequency: 'very_common' | 'common' | 'occasional' | 'rare';
  severity: 'low' | 'moderate' | 'high' | 'severe';
  typical_context: string;
  exposure_risk: 'low' | 'moderate' | 'high' | 'critical';
  
  // Enhanced safety data
  concentration_range?: {
    min_mg_m3: number;
    max_mg_m3: number;
    typical_mg_m3: number;
  };
  exposure_limits?: {
    osha_pel_mg_m3: number | null;
    niosh_rel_mg_m3: number | null;
    acgih_tlv_mg_m3: number;
    idlh_mg_m3: number | null;
  };
  exceeds_limits?: boolean;
  monitoring_required?: boolean;
  particulate_properties?: {
    respirable_fraction: number;
    size_range_um: [number, number];
  };
  control_measures?: {
    ventilation_required: boolean;
    ppe_level: 'none' | 'basic' | 'enhanced' | 'full';
    filtration_type: string | null;
  };
}

interface HazardousCompoundsGridProps {
  compounds: EnhancedCompound[];
  className?: string;
  columns?: 2 | 3 | 4;
  sortBy?: 'severity' | 'concentration' | 'alphabetical';
  showConcentrations?: boolean;
  showExceedsWarnings?: boolean;
}

export function HazardousCompoundsGrid({
  compounds,
  className = '',
  columns = 3,
  sortBy = 'severity',
  showConcentrations = true,
  showExceedsWarnings = true,
}: HazardousCompoundsGridProps) {
  if (!compounds || compounds.length === 0) return null;

  // Sort compounds based on sortBy preference
  const sortedCompounds = [...compounds].sort((a, b) => {
    if (sortBy === 'severity') {
      const severityOrder = { severe: 0, high: 1, moderate: 2, low: 3 };
      const aOrder = severityOrder[a.severity] ?? 3;
      const bOrder = severityOrder[b.severity] ?? 3;
      if (aOrder !== bOrder) return aOrder - bOrder;
      // Secondary sort: alphabetical
      return a.title.localeCompare(b.title);
    } else if (sortBy === 'concentration') {
      const aConc = a.concentration_range?.typical_mg_m3 ?? 0;
      const bConc = b.concentration_range?.typical_mg_m3 ?? 0;
      return bConc - aConc; // Highest concentration first
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  // Transform compounds to GridItem format
  const gridItems: GridItem[] = sortedCompounds.map((compound) => {
    // Build subject with optional safety indicators
    const subject = compound.title;
    
    // Add concentration badge if available and enabled
    const concentrationBadge = showConcentrations && compound.concentration_range?.min_mg_m3 && compound.concentration_range?.max_mg_m3
      ? `${compound.concentration_range.min_mg_m3}-${compound.concentration_range.max_mg_m3} mg/m³`
      : undefined;
    
    // Add exceeds limits warning if enabled
    const exceedsWarning = showExceedsWarnings && compound.exceeds_limits
      ? '⚠️ Exceeds Exposure Limit'
      : undefined;

    const slug = compound.url.split('/').pop() || '';

    return {
      slug,
      href: compound.url,
      frontmatter: {
        title: compound.title,
        subject: subject,
        images: {
          hero: {
            url: compound.image,
            alt: `${compound.title} hazardous compound`,
          },
        },
        // Pass through safety metadata for Card component
        severity: compound.severity,
        exposure_risk: compound.exposure_risk,
        concentration_range: compound.concentration_range || {},
        exceeds_limits: compound.exceeds_limits,
        monitoring_required: compound.monitoring_required,
        ppe_level: compound.control_measures?.ppe_level,
      },
      metadata: {
        domain: 'compounds',
        frequency: compound.frequency,
        severity: compound.severity,
        typical_context: compound.typical_context,
        exposure_risk: compound.exposure_risk,
        concentration_badge: concentrationBadge,
        exceeds_warning: exceedsWarning,
        // Additional metadata for potential tooltips/hover states
        ...(compound.concentration_range || {}),
        ...(compound.exposure_limits || {}),
        ...(compound.control_measures || {}),
      },
    };
  });

  return (
    <div className={className}>
      {/* Optional header with sort info */}
      <div className="mb-4 text-sm text-gray-400">
        Sorted by: <span className="capitalize text-white">{sortBy}</span>
        {sortBy === 'severity' && ' (Most dangerous first)'}
        {showExceedsWarnings && (
          <span className="ml-4">
            ⚠️ = Exceeds ACGIH exposure limits
          </span>
        )}
      </div>

      <CardGrid
        items={gridItems}
        variant="relationship"
        columns={columns}
      />
    </div>
  );
}

export default HazardousCompoundsGrid;
