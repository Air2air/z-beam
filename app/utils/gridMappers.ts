/**
 * Grid Mapper Utilities
 * 
 * Pure functions for transforming domain data to GridItemSSR format.
 * Each mapper handles a specific data type and enriches it with metadata
 * for display in CardGridSSR.
 * 
 * Benefits:
 * - Centralized transformation logic
 * - Easy to test (pure functions)
 * - Reusable across components
 * - Type-safe with TypeScript
 * 
 * @see DataGrid component for usage
 */

import { GridItemSSR } from '@/types';

/**
 * Enhanced compound interface (from produces_compounds top-level field)
 */
export interface EnhancedCompound {
  id: string;
  title: string;
  url: string;
  image: string;
  category: string;
  subcategory: string;
  frequency: 'very_common' | 'common' | 'occasional' | 'rare';
  severity: 'severe' | 'high' | 'moderate' | 'low';
  typical_context: string;
  exposure_risk: 'high' | 'moderate' | 'low';
  concentration_range: string;  // e.g., "10-50 mg/m³"
  hazard_class: 'carcinogenic' | 'toxic' | 'irritant' | 'corrosive' | 'asphyxiant' | 'flammable';
  exposure_limits: {
    osha_pel_mg_m3: number | null;
    niosh_rel_mg_m3: number | null;
    acgih_tlv_mg_m3: number | null;
    idlh_mg_m3: number | null;
  };
  exceeds_limits: boolean;
  monitoring_required: boolean;
  control_measures: {
    ventilation_required: boolean;
    ppe_level: 'none' | 'basic' | 'enhanced' | 'full';
    filtration_type: string | null;
  };
}

/**
 * Domain linkage interface (from related_* top-level fields)
 */
export interface DomainLinkage {
  id: string;
  title: string;
  url: string;
  image: string;
  category: string;
  subcategory: string;
  frequency: 'very_common' | 'common' | 'occasional' | 'rare';
  severity: 'severe' | 'high' | 'moderate' | 'low';
  typical_context: string;
}

/**
 * Transform compound (produces_compounds) to GridItemSSR
 * Shows safety metadata: concentration, hazard class, warnings
 */
export function compoundToGridItem(compound: EnhancedCompound): GridItemSSR {
  return {
    href: compound.url,
    frontmatter: {
      title: compound.title,
      image: compound.image,
      category: compound.category,
      severity: compound.severity,
      subject: compound.hazard_class,  // Show hazard class as subject line
    },
    metadata: {
      concentrationBadge: compound.concentration_range,
      exceedsWarning: compound.exceeds_limits,
      monitoringRequired: compound.monitoring_required,
      ppeLevel: compound.control_measures.ppe_level,
      exposureRisk: compound.exposure_risk,
      frequency: compound.frequency,
      typical_context: compound.typical_context,
    },
  };
}

/**
 * Transform material linkage (related_materials) to GridItemSSR
 * Shows frequency and severity metadata
 */
export function materialLinkageToGridItem(linkage: DomainLinkage): GridItemSSR {
  return {
    href: linkage.url,
    frontmatter: {
      title: linkage.title,
      image: linkage.image,
      category: linkage.category,
      severity: linkage.severity,
    },
    metadata: {
      frequency: linkage.frequency,
      typical_context: linkage.typical_context,
    },
  };
}

/**
 * Transform contaminant linkage (related_contaminants) to GridItemSSR
 * Uses domain-linkage variant (colored borders, no images)
 */
export function contaminantLinkageToGridItem(linkage: DomainLinkage): GridItemSSR {
  return {
    href: linkage.url,
    frontmatter: {
      title: linkage.title,
      image: linkage.image,
      category: linkage.category,
      severity: linkage.severity,
      subject: linkage.severity,  // Show severity as subject for domain-linkage cards
    },
    metadata: {
      frequency: linkage.frequency,
      typical_context: linkage.typical_context,
    },
  };
}

/**
 * Transform compound linkage (produces_compounds - lightweight version)
 * For domain linkage display without full safety data
 */
export function compoundLinkageToGridItem(linkage: DomainLinkage): GridItemSSR {
  return {
    href: linkage.url,
    frontmatter: {
      title: linkage.title,
      image: linkage.image,
      category: linkage.category,
      severity: linkage.severity,
      subject: linkage.severity,  // Show severity as subject
    },
    metadata: {
      frequency: linkage.frequency,
      severity: linkage.severity,
      typical_context: linkage.typical_context,
    },
  };
}

/**
 * Transform settings linkage (related_settings) to GridItemSSR
 * Specialized for machine settings display
 */
export function settingsLinkageToGridItem(linkage: DomainLinkage): GridItemSSR {
  return {
    href: linkage.url,
    frontmatter: {
      title: linkage.title,
      image: linkage.image,
      category: linkage.category,
    },
    metadata: {
      frequency: linkage.frequency,
      typical_context: linkage.typical_context,
    },
  };
}
// ============================================================================
// Simple Frontmatter Types and Mappers (for test compatibility)
// ============================================================================

/**
 * Simple related material type from frontmatter
 */
export interface RelatedMaterial {
  title: string;
  url: string;
  material_type?: string;
  micro?: string;
}

/**
 * Simple related contaminant type from frontmatter
 */
export interface RelatedContaminant {
  title: string;
  url: string;
  contaminant_category?: string;
  micro?: string;
}

/**
 * Simple related setting type from frontmatter
 */
export interface RelatedSetting {
  title: string;
  url: string;
  setting_category?: string;
  micro?: string;
}

/**
 * Map RelatedMaterial to GridItemSSR
 * Simple mapper for test compatibility
 */
export function mapMaterialToGridItem(material: RelatedMaterial): GridItemSSR {
  return {
    href: material.url,
    frontmatter: {
      title: material.title,
      category: material.material_type || '',
      subject: material.micro || '',
    },
    metadata: {},
  };
}

/**
 * Map RelatedContaminant to GridItemSSR
 * Simple mapper for test compatibility
 */
export function mapContaminantToGridItem(contaminant: RelatedContaminant): GridItemSSR {
  return {
    href: contaminant.url,
    frontmatter: {
      title: contaminant.title,
      category: contaminant.contaminant_category || '',
      subject: contaminant.micro || '',
    },
    metadata: {},
  };
}

/**
 * Map RelatedSetting to GridItemSSR
 * Simple mapper for test compatibility
 */
export function mapSettingToGridItem(setting: RelatedSetting): GridItemSSR {
  return {
    href: setting.url,
    frontmatter: {
      title: setting.title,
      category: setting.setting_category || '',
      subject: setting.micro || '',
    },
    metadata: {},
  };
}