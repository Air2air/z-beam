// types/core/badge.ts
// Consolidated badge types - single source of truth for all badge-related interfaces

import React from 'react';

export type MaterialType = 
  | 'element' 
  | 'compound' 
  | 'ceramic' 
  | 'polymer' 
  | 'alloy' 
  | 'composite' 
  | 'semiconductor'
  | 'other';

export type BadgeVariant = 'card' | 'large' | 'small' | 'inline';

export type BadgePosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/**
 * Core badge data structure
 * Contains all chemical and material properties
 */
export interface BadgeData {
  /** Chemical symbol (e.g., "Al", "Si", "Au") */
  symbol?: string;
  
  /** Chemical formula (e.g., "Al2O3", "SiC", "Si3N4") */
  formula?: string;
  
  /** Atomic number for elements */
  atomicNumber?: number | string;
  
  /** Material classification */
  materialType?: MaterialType;
  
  /** Badge color theme */
  color?: string;
  
  /** Associated content slug */
  slug?: string;
  
  /** Whether to show the badge */
  show?: boolean;
  
  /** Additional description */
  description?: string;
}

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
  /** Visual variant */
  variant?: BadgeVariant;
  
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
  defaultVariant: BadgeVariant;
  
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
