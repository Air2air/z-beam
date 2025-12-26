/**
 * Card Schema Types for Frontmatter
 * 
 * Defines card presentation structure for all entities (materials, compounds, contaminants, settings).
 * Cards support context-specific variants (default, contamination_context, material_context, etc.)
 * to render appropriately based on where they're displayed.
 */

// ============================================
// CARD SCHEMA TYPES
// ============================================

/**
 * Badge configuration for card
 */
export interface CardBadge {
  text: string;
  variant: 'success' | 'warning' | 'danger' | 'info' | 'technical';
}

/**
 * Metric display (bold numerical value with legend)
 */
export interface CardMetric {
  value: string;           // Bold numerical value (e.g., "0.1", "1064", "Fe₂O₃")
  unit?: string;           // Optional unit (e.g., "ppm", "nm", "°C")
  legend: string;          // Legend explaining the metric (e.g., "OSHA PEL", "Wavelength")
}

/**
 * Severity level determines background color gradient
 */
export type CardSeverity = 'critical' | 'high' | 'moderate' | 'low';

/**
 * Single card variant configuration
 */
export interface CardVariant {
  heading: string;         // Displays at bottom of card
  subtitle: string;        // Displays under heading
  badge: CardBadge;        // Color-coded badge
  metric: CardMetric;      // Bold numerical value with legend
  severity: CardSeverity;  // Maps to background color
  icon?: string;           // Optional lucide icon name
}

/**
 * Complete card schema with context variants
 */
export interface CardSchema {
  default: CardVariant;                       // Required - fallback card appearance
  contamination_context?: CardVariant;        // When referenced from contamination page
  compound_context?: CardVariant;             // When referenced from compound page
  material_context?: CardVariant;             // When referenced from material page
  setting_context?: CardVariant;              // When referenced from settings page
  [key: string]: CardVariant | undefined;     // Allow custom contexts
}

// ============================================
// SEVERITY COLOR MAPPINGS
// ============================================

/**
 * Maps severity levels to Tailwind CSS classes
 */
export const SEVERITY_COLORS: Record<CardSeverity, { bg: string; text: string; border: string }> = {
  critical: {
    bg: 'bg-gradient-to-br from-red-600 to-red-800',
    text: 'text-white',
    border: 'border-red-500',
  },
  high: {
    bg: 'bg-gradient-to-br from-orange-500 to-orange-700',
    text: 'text-white',
    border: 'border-orange-500',
  },
  moderate: {
    bg: 'bg-gradient-to-br from-yellow-500 to-yellow-700',
    text: 'text-white',
    border: 'border-yellow-500',
  },
  low: {
    bg: 'bg-gradient-to-br from-blue-500 to-blue-700',
    text: 'text-white',
    border: 'border-blue-500',
  },
};

// ============================================
// RELATIONSHIP STRUCTURE (NEW)
// ============================================

/**
 * Presentation type for relationship items
 */
export type PresentationType = 'card' | 'badge' | 'list' | 'inline' | 'banner';

/**
 * Section metadata (optional)
 */
export interface RelationshipSection {
  title: string;
  description?: string;
  order?: number;
  variant?: string;
  icon?: string;
}

/**
 * Individual relationship item (ID-based lookup)
 */
export interface RelationshipItem {
  id: string;                    // Entity ID (used for lookup)
  
  // Relationship-specific metadata (not entity intrinsic properties)
  frequency?: 'very_common' | 'common' | 'uncommon' | 'rare';
  severity?: 'critical' | 'high' | 'moderate' | 'low';
  typical_context?: string;
  
  // Override data (when relationship needs to provide context-specific info)
  overrides?: Record<string, any>;
  
  // NO presentation field here (moved to key level)
  // NO url field here (derived from entity's full_path)
}

/**
 * Relationship key structure (NEW FORMAT)
 */
export interface RelationshipKey {
  presentation: PresentationType;  // Applies to all items in this relationship
  _section?: RelationshipSection;  // Optional section metadata
  items: RelationshipItem[];       // Array of entity references
}

/**
 * Complete relationships structure
 */
export interface FrontmatterRelationshipsNew {
  [key: string]: RelationshipKey | null;
}

// ============================================
// ENTITY FRONTMATTER (with card)
// ============================================

/**
 * Base entity frontmatter (materials, compounds, contaminants)
 */
export interface EntityFrontmatter {
  id: string;
  name: string;
  full_path: string;              // Used for URL generation
  card: CardSchema;                // Card presentation data
  relationships?: FrontmatterRelationshipsNew;
  [key: string]: any;              // Allow other frontmatter fields
}

// ============================================
// CONTEXT DETECTION
// ============================================

/**
 * Detect appropriate card context from current page type
 */
export function detectCardContext(pageType: string): string {
  const contextMap: Record<string, string> = {
    'contaminants': 'contamination_context',
    'contamination': 'contamination_context',
    'compounds': 'compound_context',
    'compound': 'compound_context',
    'materials': 'material_context',
    'material': 'material_context',
    'settings': 'setting_context',
    'setting': 'setting_context',
  };
  
  return contextMap[pageType.toLowerCase()] || 'default';
}

// ============================================
// TYPE GUARDS
// ============================================

/**
 * Check if object is valid CardSchema
 */
export function isCardSchema(obj: any): obj is CardSchema {
  return (
    obj &&
    typeof obj === 'object' &&
    'default' in obj &&
    isCardVariant(obj.default)
  );
}

/**
 * Check if object is valid CardVariant
 */
export function isCardVariant(obj: any): obj is CardVariant {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.heading === 'string' &&
    typeof obj.subtitle === 'string' &&
    obj.badge &&
    typeof obj.badge.text === 'string' &&
    typeof obj.badge.variant === 'string' &&
    obj.metric &&
    typeof obj.metric.value === 'string' &&
    typeof obj.metric.legend === 'string' &&
    typeof obj.severity === 'string'
  );
}

/**
 * Check if object is valid RelationshipKey (new structure)
 */
export function isRelationshipKey(obj: any): obj is RelationshipKey {
  return (
    obj &&
    typeof obj === 'object' &&
    'presentation' in obj &&
    'items' in obj &&
    Array.isArray(obj.items)
  );
}
