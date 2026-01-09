/**
 * Grid Mapper Utilities
 * 
 * Pure functions for transforming domain data to GridItem format.
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

import type {
  GridItem,
  EnhancedCompound,
  Relationship,
  RelatedMaterial,
  RelatedContaminant,
  RelatedSetting
} from '@/types/centralized';

// Re-export for convenience
export type { GridItem };

// Re-export types for convenience
export type {
  EnhancedCompound,
  Relationship,
  RelatedMaterial,
  RelatedContaminant,
  RelatedSetting
};

// Backward compatibility exports (deprecated)
/** @deprecated Use mapCompoundToGrid instead */
export const compoundToGridItem = mapCompoundToGrid;
/** @deprecated Use mapMaterialLinkageToGrid instead */
export const materialLinkageToGridItem = mapMaterialLinkageToGrid;
/** @deprecated Use mapContaminantLinkageToGrid instead */
export const contaminantLinkageToGridItem = mapContaminantLinkageToGrid;
/** @deprecated Use mapCompoundLinkageToGrid instead */
export const compoundLinkageToGridItem = mapCompoundLinkageToGrid;
/** @deprecated Use mapSettingsLinkageToGrid instead */
export const settingsLinkageToGridItem = mapSettingsLinkageToGrid;
/** @deprecated Use mapMaterialToGrid instead */
export const mapMaterialToGridItem = mapMaterialToGrid;
/** @deprecated Use mapContaminantToGrid instead */
export const mapContaminantToGridItem = mapContaminantToGrid;
/** @deprecated Use mapSettingToGrid instead */
export const mapSettingToGridItem = mapSettingToGrid;

/**
 * Transform compound (produces_compounds) to GridItem
 * Shows safety metadata: concentration, hazard class, warnings
 */
export function mapCompoundToGrid(compound: EnhancedCompound): GridItem {
  return {
    slug: compound.id,
    href: compound.url,
    title: compound.title,
    name: compound.hazard_class,  // Show hazard class as name
    imageUrl: compound.image,
    imageAlt: compound.title,
    category: compound.category,
    metadata: {
      concentrationBadge: compound.concentration_range,
      exceedsWarning: compound.exceeds_limits,
      monitoringRequired: compound.monitoring_required,
      ppeLevel: compound.control_measures?.ppe_level,
      exposureRisk: compound.exposure_risk,
      severity: compound.severity,
      frequency: compound.frequency,
      typical_context: compound.typical_context,
    },
  };
}

/**
 * Transform material linkage (related_materials) to GridItem
 * Shows frequency and severity metadata
 */
export function mapMaterialLinkageToGrid(linkage: Relationship): GridItem {
  return {
    slug: linkage.id,
    href: linkage.url,
    title: linkage.title,
    imageUrl: linkage.image,
    imageAlt: linkage.title,
    category: linkage.category,
    metadata: {
      title: linkage.title,
      images: {
        hero: {
          url: linkage.image,
          alt: linkage.title
        }
      },
      category: linkage.category,
      severity: linkage.severity,
      subject: linkage.severity,
      frequency: linkage.frequency,
      typical_context: linkage.typical_context,
    },
  };
}

/**
 * Transform contaminant linkage (related_contaminants) to GridItem
 * Uses relationship variant (colored borders, no images)
 * Handles both complete denormalized data and incomplete linkage data
 */
export function mapContaminantLinkageToGrid(linkage: Relationship): GridItem {
  // Handle incomplete data (only id, frequency, severity, typicalContext)
  const formattedTitle = linkage.title || linkage.id?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
  
  return {
    slug: linkage.id,
    href: linkage.url || `/contaminants/${linkage.id}`, // Fallback to basic URL if not enriched
    title: formattedTitle,
    imageUrl: linkage.image || undefined, // Don't provide fallback - let Card component handle it
    imageAlt: formattedTitle,
    category: linkage.category || 'contaminants',
    metadata: {
      title: formattedTitle,
      slug: linkage.id,
      category: linkage.category || 'contaminants',
      description: linkage.typical_context || linkage.typicalContext,
      images: linkage.image ? {
        hero: {
          url: linkage.image,
          alt: formattedTitle
        }
      } : undefined,
      severity: linkage.severity,
      subject: formattedTitle,
      frequency: linkage.frequency,
      typical_context: linkage.typical_context || linkage.typicalContext,
    },
  };
}

/**
 * Transform compound linkage (produces_compounds - lightweight version)
 * For domain linkage display without full safety data
 */
export function mapCompoundLinkageToGrid(linkage: Relationship): GridItem {
  return {
    slug: linkage.id,
    href: linkage.url,
    title: linkage.title,
    imageUrl: linkage.image,
    imageAlt: linkage.title,
    category: linkage.category,
    metadata: {
      title: linkage.title,
      images: {
        hero: {
          url: linkage.image,
          alt: linkage.title
        }
      },
      category: linkage.category,
      severity: linkage.severity,
      subject: linkage.severity,  // Show severity as subject
      frequency: linkage.frequency,
      typical_context: linkage.typical_context,
    },
  };
}

/**
 * Transform settings linkage (related_settings) to GridItem
 * Specialized for machine settings display
 */
export function mapSettingsLinkageToGrid(linkage: Relationship): GridItem {
  return {
    slug: linkage.id,
    href: linkage.url,
    title: linkage.title,
    imageUrl: linkage.image,
    imageAlt: linkage.title,
    category: linkage.category,
    metadata: {
      title: linkage.title,
      images: {
        hero: {
          url: linkage.image,
          alt: linkage.title
        }
      },
      category: linkage.category,
      frequency: linkage.frequency,
      typical_context: linkage.typical_context,
    },
  };
}

// ============================================================================
// Simple Metadata Types and Mappers (for test compatibility)
// ============================================================================
// Types now imported from @/types/centralized

/**
 * Map RelatedMaterial to GridItem
 * Simple mapper for test compatibility
 */
export function mapMaterialToGrid(material: RelatedMaterial): GridItem {
  const slug = material.url.split('/').pop() || '';
  return {
    slug,
    href: material.url,
    metadata: {
      title: material.title,
      category: material.material_type || '',
      subject: material.micro || '',
    },
  };
}

/**
 * Map RelatedContaminant to GridItem
 * Simple mapper for test compatibility
 */
export function mapContaminantToGrid(contaminant: RelatedContaminant): GridItem {
  const slug = contaminant.url.split('/').pop() || '';
  return {
    slug,
    href: contaminant.url,
    metadata: {
      title: contaminant.title,
      category: contaminant.contaminant_category || '',
      subject: contaminant.micro || '',
    },
  };
}

/**
 * Map RelatedSetting to GridItem
 * Simple mapper for test compatibility
 */
export function mapSettingToGrid(setting: RelatedSetting): GridItem {
  const slug = setting.url.split('/').pop() || '';
  return {
    slug,
    href: setting.url,
    metadata: {
      title: setting.title,
      category: setting.setting_category || '',
      subject: setting.micro || '',
    },
  };
}