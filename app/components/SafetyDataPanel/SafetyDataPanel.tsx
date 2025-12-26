/**
 * @component SafetyDataPanel
 * @purpose Comprehensive safety information display for contaminant laser removal
 * @extends GridSection, CompoundSafetyGrid components
 * 
 * Updated to use:
 * - GridSection: Universal section wrapper
 * - CompoundSafetyGrid: Enhanced compound display with safety metadata
 * - Data from produces_compounds (flattened structure)
 * - Unified safety grid: Integrates RiskCard and InfoCard components
 * 
 * Schema Compliance:
 * - Follows SAFETY_RISK_SEVERITY_SCHEMA.md for all risk/severity levels
 * - Supports: fire_explosion_risk, toxic_gas_risk, visibility_hazard
 * - PPE fields: respiratory, eye_protection, skin_protection
 * - Ventilation fields: minimum_air_changes_per_hour, exhaust_velocity_m_s, filtration_type
 * - Particulate fields: respirable_fraction (0.0-1.0), size_range_um [min, max]
 * 
 * @see docs/specs/SAFETY_RISK_SEVERITY_SCHEMA.md
 */

import { SectionContainer } from '../SectionContainer/SectionContainer';
import { SectionTitle } from '../SectionTitle/SectionTitle';
import { GridSection } from '../GridSection';
import { CompoundSafetyGrid } from '../CompoundSafetyGrid';
import { Collapsible } from '../Collapsible';
import { RiskCard } from '../RiskCard/RiskCard';
import { InfoCard } from '../InfoCard/InfoCard';
import { EnhancedCompound } from '@/app/utils/gridMappers';
import { AlertTriangle, Wind, Eye, Shield, Flame } from 'lucide-react';
import { getGridClasses } from '@/app/utils/gridConfig';

interface SafetyDataPanelProps {
  safetyData: any;
  compounds?: EnhancedCompound[];  // Enhanced compound data from produces_compounds field
  className?: string;
  collapsible?: boolean;  // NEW: Enable collapsible mode for risk cards
  entityName?: string;  // Name of contaminant/compound for title
}

export function SafetyDataPanel({ 
  safetyData, 
  compounds = [],  // Enhanced compound data from produces_compounds top-level field
  className = '',
  collapsible = false,  // NEW: Default to false for backward compatibility
  entityName  // Name of contaminant/compound for title
}: SafetyDataPanelProps) {
  if (!safetyData) return null;

  // Check if safetyData has any actual data (not just undefined fields)
  const hasAnySafetyData = Object.values(safetyData).some(value => value !== undefined && value !== null);
  if (!hasAnySafetyData) return null;

  // Check if this is compound data (has storage_requirements, regulatory_classification, etc.)
  // vs contaminant data (has fire_explosion_risk, toxic_gas_risk, etc.)
  const isCompoundData = !!(safetyData.storage_requirements || safetyData.regulatory_classification || safetyData.workplace_exposure);

  // Convert safety data to collapsible format
  const collapsibleItems = [];
  
  if (collapsible) {
    const safetyDataObj: Record<string, any> = {};
    
    if (safetyData.fire_explosion_risk) {
      safetyDataObj.fire_explosion_risk = {
        severity: safetyData.fire_explosion_risk.severity || safetyData.fire_explosion_risk,
        description: safetyData.fire_explosion_risk.description,
        mitigation: safetyData.fire_explosion_risk.mitigation
      };
    }
    
    if (safetyData.toxic_gas_risk) {
      safetyDataObj.toxic_gas_risk = {
        severity: safetyData.toxic_gas_risk.severity || safetyData.toxic_gas_risk,
        description: safetyData.toxic_gas_risk.description,
        mitigation: safetyData.toxic_gas_risk.mitigation
      };
    }
    
    if (safetyData.visibility_hazard) {
      safetyDataObj.visibility_hazard = {
        severity: safetyData.visibility_hazard.severity || safetyData.visibility_hazard,
        description: safetyData.visibility_hazard.description,
        mitigation: safetyData.visibility_hazard.mitigation
      };
    }
    
    if (safetyData.ppe_requirements) {
      const ppeItem = safetyData.ppe_requirements.items?.[0] || safetyData.ppe_requirements;
      safetyDataObj.ppe_requirements = {
        respiratory: ppeItem.respiratory,
        eye_protection: ppeItem.eye_protection || ppeItem.eye,
        skin_protection: ppeItem.skin_protection || ppeItem.skin,
        rationale: ppeItem.rationale
      };
    }
    
    if (safetyData.ventilation_requirements) {
      const ventItem = safetyData.ventilation_requirements.items?.[0] || safetyData.ventilation_requirements;
      safetyDataObj.ventilation_requirements = {
        minimum_air_changes_per_hour: ventItem.minimum_air_changes_per_hour,
        exhaust_velocity_m_s: ventItem.exhaust_velocity_m_s,
        filtration_type: ventItem.filtration_type,
        rationale: ventItem.rationale
      };
    }
    
    if (safetyData.particulate_generation) {
      safetyDataObj.particulate_generation = {
        respirable_fraction: safetyData.particulate_generation.respirable_fraction,
        size_range_um: safetyData.particulate_generation.size_range_um
      };
    }
    
    // Add compound-specific safety data
    if (safetyData.storage_requirements) {
      const storageItem = safetyData.storage_requirements.items?.[0] || safetyData.storage_requirements;
      safetyDataObj.storage_requirements = storageItem;
    }
    
    if (safetyData.regulatory_classification) {
      const regItem = safetyData.regulatory_classification.items?.[0] || safetyData.regulatory_classification;
      safetyDataObj.regulatory_classification = regItem;
    }
    
    if (safetyData.workplace_exposure) {
      const workplaceItem = safetyData.workplace_exposure.items?.[0] || safetyData.workplace_exposure;
      safetyDataObj.workplace_exposure = workplaceItem;
    }
    
    if (safetyData.reactivity) {
      const reactivityItem = safetyData.reactivity.items?.[0] || safetyData.reactivity;
      safetyDataObj.reactivity = reactivityItem;
    }
    
    if (safetyData.environmental_impact) {
      const envItem = safetyData.environmental_impact.items?.[0] || safetyData.environmental_impact;
      safetyDataObj.environmental_impact = envItem;
    }
    
    if (safetyData.detection_monitoring) {
      const detectionItem = safetyData.detection_monitoring.items?.[0] || safetyData.detection_monitoring;
      safetyDataObj.detection_monitoring = detectionItem;
    }
    
    if (Object.keys(safetyDataObj).length > 0) {
      collapsibleItems.push(safetyDataObj);
    }
  }

  if (collapsible && collapsibleItems.length > 0) {
    return (
      <Collapsible
        items={collapsibleItems}
        sectionMetadata={{
          title: entityName ? `${entityName} safety information` : "Safety Information",
          description: isCompoundData ? "Comprehensive safety and handling requirements" : "Critical safety data for laser removal operations"
        }}
      />
    );
  }

  return (
    <SectionContainer variant="default" className={`py-12 ${className}`}>
      <div className="container-custom px-4">
        <SectionTitle 
          title="Safety Information"
          subtitle={isCompoundData ? "Comprehensive safety and handling requirements" : "Critical safety data for laser removal operations"}
          alignment="left"
          className="mb-8"
        />

        {/* Unified Safety & Control Measures Grid */}
        <div className={`${getGridClasses({ columns: 3, gap: 'md' })} mb-8`}>
          {/* Contaminant-style Risk Cards */}
          {!isCompoundData && (
            <>
              {safetyData.fire_explosion_risk && (
                <RiskCard
                  icon={Flame}
                  label="Fire/Explosion Risk"
                  severity={safetyData.fire_explosion_risk}
                />
              )}
              {safetyData.toxic_gas_risk && (
                <RiskCard
                  icon={AlertTriangle}
                  label="Toxic Gas Risk"
                  severity={safetyData.toxic_gas_risk}
                />
              )}
              {safetyData.visibility_hazard && (
                <RiskCard
                  icon={Eye}
                  label="Visibility Hazard"
                  severity={safetyData.visibility_hazard}
                />
              )}
            </>
          )}

          {/* PPE Requirements Card - Works for both contaminants and compounds */}
          {safetyData.ppe_requirements && (() => {
            const ppeItem = safetyData.ppe_requirements.items?.[0] || safetyData.ppe_requirements;
            return (
              <InfoCard
                icon={Shield}
                title={safetyData.ppe_requirements._section?.title || "PPE Requirements"}
                data={[
                  ppeItem.respiratory && {
                    label: 'Respiratory',
                    value: ppeItem.respiratory
                  },
                  (ppeItem.eye_protection || ppeItem.eye) && {
                    label: 'Eye Protection',
                    value: ppeItem.eye_protection || ppeItem.eye
                  },
                  (ppeItem.skin_protection || ppeItem.skin) && {
                    label: 'Skin Protection',
                    value: ppeItem.skin_protection || ppeItem.skin
                  },
                  ppeItem.minimum_level && {
                    label: 'Minimum Level',
                    value: ppeItem.minimum_level
                  },
                  ppeItem.additional_requirements && {
                    label: 'Additional',
                    value: ppeItem.additional_requirements
                  }
                ].filter(Boolean) as Array<{ label: string; value: string | number }>}
              />
            );
          })()}

          {/* Storage Requirements Card - Compound-specific */}
          {isCompoundData && safetyData.storage_requirements && (() => {
            const storageItem = safetyData.storage_requirements.items?.[0] || safetyData.storage_requirements;
            return (
              <InfoCard
                icon={Shield}
                title={safetyData.storage_requirements._section?.title || "Storage Requirements"}
                data={[
                  storageItem.temperature_range && {
                    label: 'Temperature',
                    value: storageItem.temperature_range
                  },
                  storageItem.ventilation && {
                    label: 'Ventilation',
                    value: storageItem.ventilation
                  },
                  storageItem.container_material && {
                    label: 'Container Material',
                    value: storageItem.container_material
                  },
                  storageItem.segregation && {
                    label: 'Segregation',
                    value: storageItem.segregation
                  },
                  storageItem.incompatibilities && storageItem.incompatibilities.length > 0 && {
                    label: 'Incompatibilities',
                    value: storageItem.incompatibilities.slice(0, 3).join(', ') + (storageItem.incompatibilities.length > 3 ? '...' : '')
                  }
                ].filter(Boolean) as Array<{ label: string; value: string | number }>}
              />
            );
          })()}

          {/* Regulatory Classification Card - Compound-specific */}
          {isCompoundData && safetyData.regulatory_classification && (() => {
            const regItem = safetyData.regulatory_classification.items?.[0] || safetyData.regulatory_classification;
            return (
              <InfoCard
                icon={AlertTriangle}
                title={safetyData.regulatory_classification._section?.title || "Regulatory Classification"}
                data={[
                  regItem.un_number && {
                    label: 'UN Number',
                    value: regItem.un_number
                  },
                  regItem.dot_hazard_class && {
                    label: 'DOT Hazard Class',
                    value: regItem.dot_hazard_class
                  },
                  regItem.dot_label && {
                    label: 'DOT Label',
                    value: regItem.dot_label
                  },
                  regItem.nfpa_codes && {
                    label: 'NFPA',
                    value: `H:${regItem.nfpa_codes.health} F:${regItem.nfpa_codes.flammability} R:${regItem.nfpa_codes.reactivity}`
                  }
                ].filter(Boolean) as Array<{ label: string; value: string | number }>}
              />
            );
          })()}

          {/* Workplace Exposure Card - Compound-specific */}
          {isCompoundData && safetyData.workplace_exposure && (() => {
            const expItem = safetyData.workplace_exposure.items?.[0] || safetyData.workplace_exposure;
            return (
              <InfoCard
                icon={Wind}
                title={safetyData.workplace_exposure._section?.title || "Workplace Exposure"}
                data={[
                  expItem.osha_pel?.twa_8hr && {
                    label: 'OSHA PEL (8hr TWA)',
                    value: `${expItem.osha_pel.twa_8hr} ${expItem.osha_pel.unit || 'ppm'}`
                  },
                  expItem.niosh_rel?.twa_8hr && {
                    label: 'NIOSH REL (8hr TWA)',
                    value: `${expItem.niosh_rel.twa_8hr} ${expItem.niosh_rel.unit || 'ppm'}`
                  },
                  expItem.niosh_rel?.ceiling && {
                    label: 'NIOSH Ceiling',
                    value: `${expItem.niosh_rel.ceiling} ${expItem.niosh_rel.unit || 'ppm'}`
                  },
                  expItem.niosh_rel?.idlh && {
                    label: 'IDLH',
                    value: `${expItem.niosh_rel.idlh} ${expItem.niosh_rel.unit || 'ppm'}`
                  },
                  expItem.acgih_tlv?.twa_8hr && {
                    label: 'ACGIH TLV (8hr TWA)',
                    value: `${expItem.acgih_tlv.twa_8hr} ${expItem.acgih_tlv.unit || 'ppm'}`
                  }
                ].filter(Boolean) as Array<{ label: string; value: string | number }>}
              />
            );
          })()}

          {/* Detection/Monitoring Card */}
          {safetyData.detection_monitoring && (() => {
            const detItem = safetyData.detection_monitoring.items?.[0] || safetyData.detection_monitoring;
            return (
              <InfoCard
                icon={Eye}
                title={safetyData.detection_monitoring._section?.title || "Detection & Monitoring"}
                data={[
                  (detItem.detection_method || detItem.sensor_types) && {
                    label: 'Detection Method',
                    value: detItem.detection_method || (Array.isArray(detItem.sensor_types) 
                      ? detItem.sensor_types.join(', ')
                      : detItem.sensor_types)
                  },
                  (detItem.monitoring_frequency || detItem.detection_range) && {
                    label: 'Monitoring',
                    value: detItem.monitoring_frequency || detItem.detection_range
                  },
                  detItem.alarm_setpoints?.low && {
                    label: 'Low Alarm',
                    value: `${detItem.alarm_setpoints.low} ${detItem.alarm_setpoints.unit || 'ppm'}`
                  },
                  detItem.alarm_setpoints?.high && {
                    label: 'High Alarm',
                    value: `${detItem.alarm_setpoints.high} ${detItem.alarm_setpoints.unit || 'ppm'}`
                  },
                  detItem.calibration_frequency && {
                    label: 'Calibration',
                    value: detItem.calibration_frequency
                  }
                ].filter(Boolean) as Array<{ label: string; value: string | number }>}
              />
            );
          })()}

          {/* Reactivity Card - Compound-specific */}
          {isCompoundData && safetyData.reactivity && (() => {
            const reactivityItem = safetyData.reactivity.items?.[0] || safetyData.reactivity;
            return (
              <InfoCard
                icon={Flame}
                title={safetyData.reactivity._section?.title || "Reactivity"}
                data={[
                  reactivityItem.stability && {
                    label: 'Stability',
                    value: reactivityItem.stability
                  },
                  reactivityItem.polymerization && {
                    label: 'Polymerization',
                    value: reactivityItem.polymerization
                  },
                  reactivityItem.reactivity_hazard && {
                    label: 'Hazard',
                    value: reactivityItem.reactivity_hazard
                  },
                  reactivityItem.incompatible_materials && reactivityItem.incompatible_materials.length > 0 && {
                    label: 'Incompatible Materials',
                    value: reactivityItem.incompatible_materials.slice(0, 3).join(', ') + (reactivityItem.incompatible_materials.length > 3 ? '...' : '')
                  },
                  reactivityItem.hazardous_decomposition && reactivityItem.hazardous_decomposition.length > 0 && {
                    label: 'Hazardous Decomposition',
                    value: reactivityItem.hazardous_decomposition.join(', ')
                  }
                ].filter(Boolean) as Array<{ label: string; value: string | number }>}
              />
            );
          })()}

          {/* Ventilation Requirements Card - Contaminant-specific */}
          {!isCompoundData && safetyData.ventilation_requirements && (
            <InfoCard
              icon={Wind}
              title="Ventilation Requirements"
              data={[
                safetyData.ventilation_requirements.minimum_air_changes_per_hour && {
                  label: 'Air Changes Per Hour',
                  value: safetyData.ventilation_requirements.minimum_air_changes_per_hour
                },
                safetyData.ventilation_requirements.exhaust_velocity_m_s && {
                  label: 'Exhaust Velocity',
                  value: `${safetyData.ventilation_requirements.exhaust_velocity_m_s} m/s`
                },
                safetyData.ventilation_requirements.filtration_type && {
                  label: 'Filtration Type',
                  value: safetyData.ventilation_requirements.filtration_type
                }
              ].filter(Boolean) as Array<{ label: string; value: string | number }>}
            />
          )}

          {/* Particulate Generation Card - Contaminant-specific */}
          {!isCompoundData && safetyData.particulate_generation && (
            <InfoCard
              icon={AlertTriangle}
              title="Particulate Generation"
              data={[
                safetyData.particulate_generation.respirable_fraction !== undefined && {
                  label: 'Respirable Fraction',
                  value: `${(safetyData.particulate_generation.respirable_fraction * 100).toFixed(0)}%`
                },
                safetyData.particulate_generation.size_range_um && {
                  label: 'Size Range',
                  value: `${safetyData.particulate_generation.size_range_um[0]}-${safetyData.particulate_generation.size_range_um[1]} μm`
                }
              ].filter(Boolean) as Array<{ label: string; value: string | number }>}
            />
          )}

          {/* Environmental Impact Card - Compound-specific */}
          {isCompoundData && safetyData.environmental_impact && (
            <InfoCard
              icon={Wind}
              title="Environmental Impact"
              data={[
                safetyData.environmental_impact.aquatic_toxicity && {
                  label: 'Aquatic Toxicity',
                  value: safetyData.environmental_impact.aquatic_toxicity
                },
                safetyData.environmental_impact.biodegradability && {
                  label: 'Biodegradability',
                  value: safetyData.environmental_impact.biodegradability
                },
                safetyData.environmental_impact.soil_mobility && {
                  label: 'Soil Mobility',
                  value: safetyData.environmental_impact.soil_mobility
                }
              ].filter(Boolean) as Array<{ label: string; value: string | number }>}
            />
          )}
        </div>

        {/* Hazardous Compounds Grid - Enhanced Safety Display */}
        {compounds && compounds.length > 0 && (
          <GridSection
            title="Hazardous Compounds Generated"
            description="Critical compound safety information with exposure limits and control measures"
          >
            <CompoundSafetyGrid
              compounds={compounds}
              sortBy="severity"
              showConcentrations={true}
              showExceedsWarnings={true}
              columns={3}
            />
          </GridSection>
        )}

        {/* Substrate Compatibility Warnings */}
        {safetyData.substrate_compatibility_warnings && safetyData.substrate_compatibility_warnings.length > 0 && (
          <div className="bg-yellow-900/20 border border-yellow-500 rounded-md p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-yellow-300">Substrate Compatibility Warnings</h3>
            </div>
            <ul className="space-y-2">
              {safetyData.substrate_compatibility_warnings.map((warning: string, i: number) => (
                <li key={i} className="text-yellow-200 flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </SectionContainer>
  );
}

export default SafetyDataPanel;
