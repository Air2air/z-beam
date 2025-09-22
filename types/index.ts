// types/index.ts
// UNIFIED TYPE EXPORTS - Single import source for all Z-Beam types
// This file consolidates all types from centralized.ts

// Re-export everything from centralized.ts (SINGLE SOURCE OF TRUTH)
export * from './centralized';

// Also export YAML component types
export * from './yaml-components';

// Note: ALL IMPORTS SHOULD USE:
// import { TypeName } from '@/types'
// 
// This provides access to all centralized types including:
// - Caption system types
// - MetricsGrid types  
// - Component props
// - Article and content types
// - Badge and UI types