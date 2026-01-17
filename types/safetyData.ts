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
  sectionTitle: string;
  sectionDescription?: string;
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
  concentrationMgM3: number;
  exposureLimitMgM3: number;
  hazardClass: HazardClass;
}

export interface ToxicGasRisk extends RiskAssessment {
  primaryHazards?: HazardousCompound[];
}

export interface VisibilityHazard extends RiskAssessment {
  source?: string;
}

// ============================================================================
// Universal Safety Requirements
// ============================================================================

export interface PPERequirements {
  respiratory: string;
  eyeProtection: string;
  skinProtection: string;
  minimumLevel?: string;
  specialNotes?: string;
  rationale?: string;
}

export interface VentilationRequirements {
  minimumAirChangesPerHour: number;
  exhaustVelocityMS: number;
  filtrationType: string;
  captureEfficiencyRequired?: number;
  rationale?: string;
}

export interface DetectionMethod {
  method: string;
  detectionLimitPpm: number;
  responseTime: string;
}

export interface AlarmSetpoints {
  warningPpm: number;
  dangerPpm: number;
}

export interface DetectionMonitoring {
  detectionMethods: DetectionMethod[];
  monitoringLocations: string;
  alarmSetpoints: AlarmSetpoints;
  calibrationFrequency: string;
}

export interface EmergencyResponse {
  fireHazard: string;
  fireSuppression: string;
  spillProcedures: string;
  exposureImmediateActions: string;
  environmentalHazards: string;
  specialHazards?: string;
}

// ============================================================================
// Contaminant-Specific Types
// ============================================================================

export interface ParticulateGeneration {
  respirableFraction: number;  // 0.0-1.0
  sizeRangeUm: [number, number];
  generationRateMgMin?: number;
}

// Note: Fumes generated uses HazardousCompound (same as primary_hazards)
// This ensures consistent table structure across all hazardous compound data

// ============================================================================
// Compound-Specific Types
// ============================================================================

export interface ExposureLimits {
  oshaPelPpm?: number | null;
  oshaPelMgM3?: number | null;
  nioshRelPpm?: number | null;
  nioshRelMgM3?: number | null;
  acgihTlvPpm?: number | null;
  acgihTlvMgM3?: number | null;
  idlhPpm?: number | null;
  stelPpm?: number | null;
  ceilingPpm?: number | null;
}

export interface WorkplaceExposure {
  monitoringRequired: boolean;
  monitoringFrequency: string;
  detectionMethods: string[];
  actionLevelPpm?: number;
  exposureAssessment: string;
}

export interface StorageRequirements {
  containerType: string;
  temperatureRange: string;
  humidityControl: string;
  segregation: string;
  ventilation: string;
  specialPrecautions: string;
}

export interface Reactivity {
  stability: string;
  conditionsToAvoid: string;
  incompatibleMaterials: string;
  hazardousDecomposition: string;
  hazardousPolymerization: string;
}

export interface EnvironmentalImpact {
  persistence: string;
  bioaccumulation: string;
  aquaticToxicity: string;
  soilMobility: string;
  atmosphericImpact: string;
}

export interface RegulatoryClassification {
  dotHazardClass: string;
  dotPackingGroup: string;
  dotLabel: string;
  nfpaHealth: number;
  nfpaFlammability: number;
  nfpaReactivity: number;
  nfpaSpecial?: string;
  ghsClassification: string;
  ghsPictograms: string[];
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
  toxicGasRisk?: SafetySection<ToxicGasRisk>;  // Contains primaryHazards: HazardousCompound[]
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
