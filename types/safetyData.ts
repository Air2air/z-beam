/**
 * Normalized Safety Data Type Definitions
 * 
 * This file defines the complete type system for normalized safety data
 * across all content types (contaminants, compounds, materials).
 * 
 * All safety data should be located at: relationships.safety.*
 */

// ============================================================================
// Base Types
// ============================================================================

export type Severity = 'low' | 'moderate' | 'high' | 'critical';
export type HazardClass = 'carcinogenic' | 'toxic' | 'irritant' | 'corrosive';
export type Presentation = 'card' | 'descriptive';

// ============================================================================
// Safety Section Wrapper
// ============================================================================

/**
 * Section metadata for display purposes
 */
export interface SectionMetadata {
  section_title: string;
  section_description?: string;
  icon?: string;
  order?: number;
}

/**
 * All safety data fields use this wrapper structure for consistency
 */
export interface SafetySection<T> {
  presentation: Presentation;
  items: T[];
  _section?: SectionMetadata;
}

// ============================================================================
// Risk Assessment Types (Contaminants Primary)
// ============================================================================

export interface RiskAssessment {
  severity: Severity;
  description: string;
  mitigation: string;
  conditions?: string;
}

/**
 * Hazardous compound data structure
 * Used for both toxic_gas_risk.primary_hazards and fumes_generated
 * Provides consistent table format across safety data
 */
export interface HazardousCompound {
  compound: string;
  concentration_mg_m3: number;
  exposure_limit_mg_m3: number;
  hazard_class: HazardClass;
}

export interface ToxicGasRisk extends RiskAssessment {
  primary_hazards?: HazardousCompound[];
}

export interface VisibilityHazard extends RiskAssessment {
  source?: string;
}

// ============================================================================
// Universal Safety Requirements
// ============================================================================

export interface PPERequirements {
  respiratory: string;
  eye_protection: string;
  skin_protection: string;
  minimum_level?: string;
  special_notes?: string;
  rationale?: string;
}

export interface VentilationRequirements {
  minimum_air_changes_per_hour: number;
  exhaust_velocity_m_s: number;
  filtration_type: string;
  capture_efficiency_required?: number;
  rationale?: string;
}

export interface DetectionMethod {
  method: string;
  detection_limit_ppm: number;
  response_time: string;
}

export interface AlarmSetpoints {
  warning_ppm: number;
  danger_ppm: number;
}

export interface DetectionMonitoring {
  detection_methods: DetectionMethod[];
  monitoring_locations: string;
  alarm_setpoints: AlarmSetpoints;
  calibration_frequency: string;
}

export interface EmergencyResponse {
  fire_hazard: string;
  fire_suppression: string;
  spill_procedures: string;
  exposure_immediate_actions: string;
  environmental_hazards: string;
  special_hazards?: string;
}

// ============================================================================
// Contaminant-Specific Types
// ============================================================================

export interface ParticulateGeneration {
  respirable_fraction: number;  // 0.0-1.0
  size_range_um: [number, number];
  generation_rate_mg_min?: number;
}

// Note: Fumes generated uses HazardousCompound (same as primary_hazards)
// This ensures consistent table structure across all hazardous compound data

// ============================================================================
// Compound-Specific Types
// ============================================================================

export interface ExposureLimits {
  osha_pel_ppm?: number | null;
  osha_pel_mg_m3?: number | null;
  niosh_rel_ppm?: number | null;
  niosh_rel_mg_m3?: number | null;
  acgih_tlv_ppm?: number | null;
  acgih_tlv_mg_m3?: number | null;
  idlh_ppm?: number | null;
  stel_ppm?: number | null;
  ceiling_ppm?: number | null;
}

export interface WorkplaceExposure {
  monitoring_required: boolean;
  monitoring_frequency: string;
  detection_methods: string[];
  action_level_ppm?: number;
  exposure_assessment: string;
}

export interface StorageRequirements {
  container_type: string;
  temperature_range: string;
  humidity_control: string;
  segregation: string;
  ventilation: string;
  special_precautions: string;
}

export interface Reactivity {
  stability: string;
  conditions_to_avoid: string;
  incompatible_materials: string;
  hazardous_decomposition: string;
  hazardous_polymerization: string;
}

export interface EnvironmentalImpact {
  persistence: string;
  bioaccumulation: string;
  aquatic_toxicity: string;
  soil_mobility: string;
  atmospheric_impact: string;
}

export interface RegulatoryClassification {
  dot_hazard_class: string;
  dot_packing_group: string;
  dot_label: string;
  nfpa_health: number;
  nfpa_flammability: number;
  nfpa_reactivity: number;
  nfpa_special?: string;
  ghs_classification: string;
  ghs_pictograms: string[];
}

// ============================================================================
// Complete Normalized Safety Data
// ============================================================================

/**
 * Normalized safety data structure for all content types.
 * 
 * Location: relationships.safety
 * 
 * Contaminants typically include:
 * - fire_explosion_risk, toxic_gas_risk, visibility_hazard
 * - ppe_requirements, ventilation_requirements
 * - particulate_generation, fumes_generated
 * 
 * Compounds typically include:
 * - ppe_requirements, exposure_limits, storage_requirements
 * - workplace_exposure, reactivity, environmental_impact
 * - regulatory_classification
 * 
 * TABLE STRUCTURE NORMALIZATION:
 * - toxic_gas_risk.primary_hazards and fumes_generated both use HazardousCompound[]
 * - This ensures consistent table format for hazardous compound data
 */
export interface NormalizedSafetyData {
  // ========================================================================
  // Risk Assessments (Contaminants Primary)
  // ========================================================================
  fire_explosion_risk?: SafetySection<RiskAssessment>;
  toxic_gas_risk?: SafetySection<ToxicGasRisk>;  // Contains primary_hazards: HazardousCompound[]
  visibility_hazard?: SafetySection<VisibilityHazard>;
  
  // ========================================================================
  // Universal Requirements
  // ========================================================================
  ppe_requirements?: SafetySection<PPERequirements>;
  ventilation_requirements?: SafetySection<VentilationRequirements>;
  emergency_response?: SafetySection<EmergencyResponse>;
  detection_monitoring?: SafetySection<DetectionMonitoring>;
  
  // ========================================================================
  // Contaminant-Specific
  // ========================================================================
  particulate_generation?: SafetySection<ParticulateGeneration>;
  fumes_generated?: SafetySection<HazardousCompound>;  // Same table structure as primary_hazards
  
  // ========================================================================
  // Compound-Specific
  // ========================================================================
  exposure_limits?: SafetySection<ExposureLimits>;
  workplace_exposure?: SafetySection<WorkplaceExposure>;
  storage_requirements?: SafetySection<StorageRequirements>;
  reactivity?: SafetySection<Reactivity>;
  environmental_impact?: SafetySection<EnvironmentalImpact>;
  regulatory_classification?: SafetySection<RegulatoryClassification>;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isSafetySection<T>(value: any): value is SafetySection<T> {
  return (
    value &&
    typeof value === 'object' &&
    'presentation' in value &&
    'items' in value &&
    Array.isArray(value.items)
  );
}

export function isRiskAssessment(value: any): value is RiskAssessment {
  return (
    value &&
    typeof value === 'object' &&
    'severity' in value &&
    'description' in value &&
    'mitigation' in value
  );
}

export function isToxicGasRisk(value: any): value is ToxicGasRisk {
  return isRiskAssessment(value);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract safety data from normalized structure
 */
export function extractSafetySection<T>(
  safetyData: NormalizedSafetyData | undefined,
  field: keyof NormalizedSafetyData
): T | undefined {
  if (!safetyData || !safetyData[field]) return undefined;
  
  const section = safetyData[field] as SafetySection<T>;
  if (!isSafetySection(section)) return undefined;
  
  return section.items[0];
}

/**
 * Get all items from a safety section
 */
export function getAllSafetyItems<T>(
  safetyData: NormalizedSafetyData | undefined,
  field: keyof NormalizedSafetyData
): T[] {
  if (!safetyData || !safetyData[field]) return [];
  
  const section = safetyData[field] as SafetySection<T>;
  if (!isSafetySection(section)) return [];
  
  return section.items;
}

/**
 * Check if safety field exists and has data
 */
export function hasSafetyData(
  safetyData: NormalizedSafetyData | undefined,
  field: keyof NormalizedSafetyData
): boolean {
  return !!(safetyData && safetyData[field] && 
    (safetyData[field] as SafetySection<any>).items?.length > 0);
}
