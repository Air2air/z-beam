// types/domain-linkages.ts
// Type definitions for domain linkages system

/**
 * Base linkage interface - all domain linkages include these fields
 */
export interface BaseDomainLinkage {
  id: string;
  title: string;
  url: string;
  image: string;
  category?: string;
  subcategory?: string;
}

/**
 * Material linkage - used by contaminants, settings, compounds
 */
export interface MaterialLinkage extends BaseDomainLinkage {
  frequency?: 'very_high' | 'high' | 'common' | 'moderate' | 'low' | 'rare';
  severity?: 'low' | 'moderate' | 'high' | 'severe';
  typical_context?: 'manufacturing' | 'shipping' | 'outdoor' | 'industrial' | 'marine' | 'aerospace' | 'general';
}

/**
 * Contaminant linkage - used by materials, settings, compounds
 */
export interface ContaminantLinkage extends BaseDomainLinkage {
  frequency?: 'very_high' | 'high' | 'common' | 'moderate' | 'low' | 'rare';
  severity?: 'low' | 'moderate' | 'high' | 'severe';
  typical_context?: string;
}

/**
 * Compound linkage - used by contaminants
 */
export interface CompoundLinkage extends BaseDomainLinkage {
  source?: 'thermal_decomposition' | 'laser_ablation' | 'chemical_breakdown' | 'vaporization' | 'combustion';
  concentration_range_mg_m3?: string;
  hazard_level?: 'low' | 'moderate' | 'high' | 'severe';
  phase?: 'solid' | 'liquid' | 'gas';
}

/**
 * Settings linkage - used by materials, contaminants
 */
export interface SettingsLinkage extends BaseDomainLinkage {
  frequency?: 'very_high' | 'high' | 'common' | 'moderate' | 'low' | 'rare';
  applicability?: 'very_high' | 'high' | 'moderate' | 'low';
  laser_type?: string;
}

/**
 * Regulatory compliance linkage
 */
export interface RegulatoryLinkage extends BaseDomainLinkage {
  applicability?: 'laser_operation' | 'ppe_requirements' | 'chemical_handling' | 'exposure_limits' | 'transportation' | 'waste_management';
  requirement?: string;
}

/**
 * PPE requirement linkage
 */
export interface PPELinkage extends BaseDomainLinkage {
  reason?: 'particulate_generation' | 'toxic_fumes' | 'chemical_contact' | 'laser_exposure' | 'thermal_hazard';
  required?: boolean;
  context?: 'all_operations' | 'carcinogenic_compounds_present' | 'high_concentration' | 'enclosed_spaces' | 'poor_ventilation';
}

/**
 * Union type for all possible linkage types
 */
export type DomainLinkage = 
  | MaterialLinkage 
  | ContaminantLinkage 
  | CompoundLinkage 
  | SettingsLinkage 
  | RegulatoryLinkage 
  | PPELinkage;

/**
 * Complete domain_linkages structure as it appears in frontmatter
 */
export interface DomainLinkages {
  related_materials?: MaterialLinkage[];
  related_contaminants?: ContaminantLinkage[];
  related_compounds?: CompoundLinkage[];
  related_settings?: SettingsLinkage[];
  regulatory_compliance?: RegulatoryLinkage[];
  ppe_requirements?: PPELinkage[];
  produced_by_contaminants?: ContaminantLinkage[]; // For compounds
}

/**
 * Props for DomainLinkageSection component
 */
export interface DomainLinkageSectionProps {
  title: string;
  items: DomainLinkage[];
  domain: 'materials' | 'contaminants' | 'compounds' | 'settings' | 'regulatory' | 'ppe';
  className?: string;
}

/**
 * Domain type for badge mapping
 */
export type DomainType = 'materials' | 'contaminants' | 'compounds' | 'settings' | 'regulatory' | 'ppe';
