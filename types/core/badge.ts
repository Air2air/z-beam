// types/core/badge.ts
// Badge types that extend centralized BadgeData

import React from 'react';
// Import core BadgeData from centralized source
import type { BadgeData, MaterialType, BadgeSize } from '../centralized';

// Re-export for convenience
export type { BadgeData, MaterialType, BadgeSize };

// Badge-specific variant type for display components (different from UI BadgeVariant)
export type BadgeComponentVariant = BadgeSize;

export type BadgePosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/**
 * Badge symbol specific data
 * Extends BadgeData with symbol-specific properties
 */
export interface BadgeSymbolData extends BadgeData {
  /** Required symbol for badge symbol components */
  symbol: string;
}

/**
 * Badge display properties
 * Controls how badges are rendered
 */
export interface BadgeDisplayProps {
  /** Visual variant (using BadgeSize for component sizing) */
  variant?: BadgeSize;
  
  /** Position when overlaying */
  position?: BadgePosition;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Custom styling */
  style?: React.CSSProperties;
}

/**
 * Complete badge props combining data and display
 */
export interface BadgeProps extends BadgeData, BadgeDisplayProps {
  /** Content string (for compatibility) */
  content?: string;
  
  /** Configuration object (for compatibility) */
  config?: BadgeSymbolData & BadgeDisplayProps;
}

/**
 * Badge configuration for different contexts
 */
export interface BadgeConfig {
  /** Default variant for context */
  defaultVariant: BadgeSize;
  
  /** Default position for context */
  defaultPosition: BadgePosition;
  
  /** Context-specific styling */
  contextClasses?: string;
  
  /** Whether badges are shown by default */
  showByDefault: boolean;
}

/**
 * Material badge data for materials system
 */
export interface MaterialBadgeData extends BadgeData {
  /** Material type is required for materials */
  materialType: MaterialType;
}
