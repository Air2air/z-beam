/**
 * Unified Frontmatter Relationships Schema
 * 
 * All relationship data organized under 'relationships' parent key
 * with standardized entry structure across all types.
 */

import type { MachineSettings } from './centralized';

// ============================================
// UNIFIED RELATIONSHIP ENTRY
// ============================================

/**
 * Base structure for ALL relationship entries.
 * Required fields: id, title, url
 * All other fields are optional and type-specific.
 */
export interface RelationshipEntry {
  // Required fields (every entry)
  id: string;
  title: string;
  url: string;

  // Common optional fields
  image?: string;
  description?: string;
  notes?: string;

  // Relationship metadata
  frequency?: 'common' | 'uncommon' | 'rare' | 'very_common';
  severity?: 'high' | 'moderate' | 'low' | 'critical';
  typical_context?: string;

  // Chemical/Compound specific
  cas_number?: string;
  hazard_class?: string;
  concentration_range?: string;
  chemical_formula?: string;
  molecular_weight?: number;

  // Regulatory/Standards specific
  authority?: string;
  compliance_level?: 'mandatory' | 'recommended' | 'optional';
  applicability?: string;
  effective_date?: string;

  // Production/Source specific
  production_mechanism?: string;
  decomposition_temp?: string;
  typical_conditions?: string;

  // Compatibility specific
  compatibility?: 'high' | 'moderate' | 'low' | 'incompatible';
  reason?: string;

  // Settings/Equipment specific
  success_rate?: 'high' | 'moderate' | 'low';
  power_range?: string;
  recommended_for?: string[];

  // Safety/PPE specific
  equipment_type?: string;
  protection_level?: string;
  standard?: string;
  condition?: string;
}

// ============================================
// LASER PROPERTIES
// ============================================

export interface LaserProperties {
  laser_parameters?: {
    beam_profile?: string;
    fluence_range?: {
      min_j_cm2?: number;
      max_j_cm2?: number;
      recommended_j_cm2?: number;
    };
    overlap_percentage?: number;
    pulse_duration?: string;
    scan_speed?: string;
  };

  optical_properties?: {
    absorption_coefficient?: number;
    reflectivity?: number;
    wavelength?: number;
    thermal_diffusivity?: number;
  };

  removal_characteristics?: {
    primary_mechanism?: string;
    byproducts?: string[];
    damage_risk_to_substrate?: string;
    optimal_pulse_energy?: string;
    removal_rate?: string;
    power_adjustment?: string;
    passes_required?: number | string;
    optimal_wavelength?: number;
    power_density?: string;
  };

  safety_data?: {
    fire_explosion_risk?: string;
    fumes_generated?: string[];
    particulate_generation?: {
      size_range?: string;
      concentration?: string;
      control_required?: boolean;
    };
  };

  effectiveness_by_substrate?: Record<string, {
    removal_rate?: string;
    damage_risk?: string;
    power_adjustment?: string;
  }>;
}

// ============================================
// MACHINE SETTINGS
// ============================================

// Note: MachineSettings interface moved to types/settings.ts to avoid duplication
// Import with: import type { MachineSettings } from '@/types/settings';
// This prevents type conflicts and ensures consistent naming (camelCase)

// Legacy MachineSetting interface kept for backward compatibility in relationships
export interface MachineSetting {
  value: number;
  unit: string;
  range?: number[] | string;
  description?: string;
  min?: number;
  max?: number;
  temperature?: string;
  fahrenheit?: number;
  reference?: string;
  condition?: string;
  typical_range?: string;
  confidence?: number;
  scale?: string;
  wavelength?: string | number;
  lel?: number;
  uel?: number;
  percentage?: string;
}

// ============================================
// MATERIAL PROPERTIES
// ============================================

export interface MaterialProperties {
  physical?: {
    density?: MachineSetting;
    porosity?: MachineSetting;
    surface_roughness?: MachineSetting;
    [key: string]: MachineSetting | undefined;
  };
  mechanical?: {
    tensile_strength?: MachineSetting;
    hardness?: MachineSetting;
    yield_strength?: MachineSetting;
    [key: string]: MachineSetting | undefined;
  };
  thermal?: {
    thermal_conductivity?: MachineSetting;
    melting_point?: MachineSetting;
    thermal_expansion?: MachineSetting;
    [key: string]: MachineSetting | undefined;
  };
  optical?: {
    reflectivity?: MachineSetting;
    absorption?: MachineSetting;
    [key: string]: MachineSetting | undefined;
  };
}

// ============================================
// PPE REQUIREMENTS
// ============================================

export interface PPERequirements {
  respiratory?: {
    equipment?: string;
    standard?: string;
    condition?: string;
    protection_level?: string;
    upgraded_equipment?: string;
  };
  eye?: {
    equipment?: string;
    standard?: string;
    condition?: string;
    protection_level?: string;
    additional?: string;
  };
  skin?: {
    equipment?: string;
    condition?: string;
    protection_level?: string;
    additional?: string;
    standard?: string;
  };
  special_notes?: string;
}

// ============================================
// COMPOSITION & CHARACTERISTICS
// ============================================

export interface CompositionEntry {
  compound: string;
  percentage?: string;
  role?: string;
}

export interface VisualCharacteristics {
  appearance_on_categories?: Record<string, {
    appearance?: string;
    coverage?: string;
    pattern?: string;
    thickness?: string;
  }>;
  identification_markers?: string[];
}

// ============================================
// CHEMICAL & ENVIRONMENTAL
// ============================================

// Re-export ChemicalProperties from centralized types to avoid duplication
export type { ChemicalProperties } from './centralized';


export interface Reactivity {
  stability?: string;
  polymerization?: string;
  incompatible_materials?: string[];
  hazardous_decomposition?: string[];
  conditions_to_avoid?: string[];
  reactivity_hazard?: string;
}

export interface EnvironmentalImpact {
  aquatic_toxicity?: {
    description?: string;
    lc50_fish_96h?: string;
  };
  biodegradability?: {
    rating?: string;
    percentage?: string;
    pathway?: string;
  };
  bioaccumulation?: {
    potential?: string;
    log_kow?: number;
    description?: string;
  };
  soil_mobility?: string;
  soil_behavior?: string;
  atmospheric_fate?: {
    degradation?: string;
    products?: string;
    half_life?: string;
  };
  ozone_depletion?: boolean;
  global_warming_potential?: number | null;
  reportable_releases?: {
    water?: string;
    air?: string;
  };
}

// ============================================
// REGULATORY & SAFETY
// ============================================

export interface RegulatoryClassification {
  un_number?: string;
  dot_hazard_class?: string | number;
  dot_label?: string;
  nfpa_codes?: {
    health?: number;
    flammability?: number;
    reactivity?: number;
    special?: string | null;
  };
  epa_hazard_categories?: string[];
  sara_title_iii?: boolean;
  cercla_rq?: string;
  rcra_code?: string;
}

export interface ExposureLimits {
  osha_pel_ppm?: number | null;
  osha_pel_mg_m3?: number | null;
  niosh_rel_ppm?: number | null;
  niosh_rel_mg_m3?: number | null;
  acgih_tlv_ppm?: number | null;
  acgih_tlv_mg_m3?: number | null;
}

export interface WorkplaceExposure {
  osha_pel?: {
    twa_8hr?: string;
    stel_15min?: string | null;
    ceiling?: string | null;
  };
  niosh_rel?: {
    twa_8hr?: string | null;
    stel_15min?: string | null;
    ceiling?: string;
    ceiling_basis?: string;
    idlh?: string;
  };
  acgih_tlv?: {
    twa_8hr?: string | null;
    stel_15min?: string | null;
    ceiling?: string;
    classification?: string;
  };
  biological_exposure_indices?: any[];
}

export interface EmergencyResponse {
  fire_hazard?: string;
  fire_suppression?: string;
  spill_procedures?: string;
  exposure_immediate_actions?: string;
  environmental_hazards?: string;
  special_hazards?: string;
}

export interface StorageRequirements {
  temperature_range?: string;
  ventilation?: string;
  incompatibilities?: string[];
  container_material?: string;
  segregation?: string;
  quantity_limits?: string;
  special_requirements?: string;
}

// ============================================
// APPLICATIONS & CHARACTERISTICS
// ============================================

export interface Application {
  industry?: string;
  use_cases?: string[];
  frequency?: string;
}

export interface Characteristics {
  advantages?: string[];
  limitations?: string[];
  typical_applications?: string[];
}

// ============================================
// MAIN RELATIONSHIPS CONTAINER
// ============================================

/**
 * Complete relationships structure.
 * All technical, safety, regulatory, and cross-reference data
 * lives under this parent key.
 */
export interface FrontmatterRelationships {
  // Cross-references (use RelationshipEntry[])
  related_materials?: RelationshipEntry[];
  related_contaminants?: RelationshipEntry[];
  related_compounds?: RelationshipEntry[];
  related_settings?: RelationshipEntry[];
  produced_by_contaminants?: RelationshipEntry[];
  produced_by_materials?: RelationshipEntry[];
  produces_compounds?: RelationshipEntry[];
  compatible_materials?: RelationshipEntry[];
  prohibited_materials?: RelationshipEntry[];
  recommended_settings?: RelationshipEntry[];
  ppe_requirements_list?: RelationshipEntry[];  // When PPE is array of entries

  // Technical properties
  laser_properties?: LaserProperties;
  machine_settings?: MachineSettings;
  material_properties?: MaterialProperties;
  materialProperties?: MaterialProperties;  // Legacy name support
  optical_properties?: any;

  // Safety & PPE
  ppe_requirements?: PPERequirements;
  emergency_response?: EmergencyResponse;
  storage_requirements?: StorageRequirements;

  // Exposure & monitoring
  workplace_exposure?: WorkplaceExposure;
  exposure_limits?: ExposureLimits;
  detection_monitoring?: any;

  // Chemical data
  physical_properties?: any;
  chemical_properties?: any; // TODO: Define proper ChemicalProperties type
  reactivity?: Reactivity;
  environmental_impact?: EnvironmentalImpact;

  // Regulatory & standards
  regulatory_standards?: RelationshipEntry[];
  regulatory_classification?: RegulatoryClassification;

  // Identifiers & metadata
  synonyms_identifiers?: any;
  health_effects_keywords?: string[];
  sources_in_laser_cleaning?: string[];

  // Applications
  applications?: Application[];
  characteristics?: Characteristics;
  challenges?: any;

  // Composition (Contaminants)
  composition?: CompositionEntry[];
  visual_characteristics?: VisualCharacteristics;
}

// ============================================
// COMPLETE FRONTMATTER STRUCTURE
// ============================================

export interface FrontmatterData {
  // Page identity & content (top-level only)
  id: string;
  name?: string;
  display_name?: string;
  title?: string;
  slug?: string;
  category?: string;
  subcategory?: string;
  contentType?: 'materials' | 'contaminants' | 'compounds' | 'settings' | 'applications';
  schema_version?: string;
  datePublished?: string;
  dateModified?: string;
  description?: string;
  micro?: {
    before?: string;
    after?: string;
  };
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  author?: {
    id: number;
  };
  images?: {
    hero?: {
      url: string;
      alt: string;
    };
    micro?: {
      url: string;
      alt: string;
    };
  };
  breadcrumb?: Array<{
    label: string;
    href: string;
  }>;
  breadcrumb_text?: string;

  // ALL other data under relationships
  relationships?: FrontmatterRelationships;
}
