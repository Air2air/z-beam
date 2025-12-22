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
import { RiskCard } from '../RiskCard/RiskCard';
import { InfoCard } from '../InfoCard/InfoCard';
import { EnhancedCompound } from '@/app/utils/gridMappers';
import { AlertTriangle, Wind, Eye, Shield, Flame } from 'lucide-react';
import { getGridClasses } from '@/app/utils/gridConfig';

interface SafetyDataPanelProps {
  safetyData: any;
  compounds?: EnhancedCompound[];  // Enhanced compound data from produces_compounds field
  className?: string;
}

export function SafetyDataPanel({ 
  safetyData, 
  compounds = [],  // Enhanced compound data from produces_compounds top-level field
  className = '' 
}: SafetyDataPanelProps) {
  if (!safetyData) return null;

  // Check if safetyData has any actual data (not just undefined fields)
  const hasAnySafetyData = Object.values(safetyData).some(value => value !== undefined && value !== null);
  if (!hasAnySafetyData) return null;

  // Check if this is compound data (has storage_requirements, regulatory_classification, etc.)
  // vs contaminant data (has fire_explosion_risk, toxic_gas_risk, etc.)
  const isCompoundData = !!(safetyData.storage_requirements || safetyData.regulatory_classification || safetyData.workplace_exposure);

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
          {safetyData.ppe_requirements && (
            <InfoCard
              icon={Shield}
              title="PPE Requirements"
              data={[
                safetyData.ppe_requirements.respiratory && {
                  label: 'Respiratory',
                  value: safetyData.ppe_requirements.respiratory
                },
                (safetyData.ppe_requirements.eye_protection || safetyData.ppe_requirements.eye) && {
                  label: 'Eye Protection',
                  value: safetyData.ppe_requirements.eye_protection || safetyData.ppe_requirements.eye
                },
                (safetyData.ppe_requirements.skin_protection || safetyData.ppe_requirements.skin) && {
                  label: 'Skin Protection',
                  value: safetyData.ppe_requirements.skin_protection || safetyData.ppe_requirements.skin
                },
                safetyData.ppe_requirements.minimum_level && {
                  label: 'Minimum Level',
                  value: safetyData.ppe_requirements.minimum_level
                }
              ].filter(Boolean) as Array<{ label: string; value: string | number }>}
            />
          )}

          {/* Storage Requirements Card - Compound-specific */}
          {isCompoundData && safetyData.storage_requirements && (
            <InfoCard
              icon={Shield}
              title="Storage Requirements"
              data={[
                safetyData.storage_requirements.temperature_range && {
                  label: 'Temperature',
                  value: safetyData.storage_requirements.temperature_range
                },
                safetyData.storage_requirements.ventilation && {
                  label: 'Ventilation',
                  value: safetyData.storage_requirements.ventilation
                },
                safetyData.storage_requirements.container_material && {
                  label: 'Container Material',
                  value: safetyData.storage_requirements.container_material
                }
              ].filter(Boolean) as Array<{ label: string; value: string | number }>}
            />
          )}

          {/* Regulatory Classification Card - Compound-specific */}
          {isCompoundData && safetyData.regulatory_classification && (
            <InfoCard
              icon={AlertTriangle}
              title="Regulatory Classification"
              data={[
                safetyData.regulatory_classification.un_number && {
                  label: 'UN Number',
                  value: safetyData.regulatory_classification.un_number
                },
                safetyData.regulatory_classification.dot_hazard_class && {
                  label: 'DOT Hazard Class',
                  value: safetyData.regulatory_classification.dot_hazard_class
                },
                safetyData.regulatory_classification.nfpa_codes && {
                  label: 'NFPA',
                  value: `H:${safetyData.regulatory_classification.nfpa_codes.health} F:${safetyData.regulatory_classification.nfpa_codes.flammability} R:${safetyData.regulatory_classification.nfpa_codes.reactivity}`
                }
              ].filter(Boolean) as Array<{ label: string; value: string | number }>}
            />
          )}

          {/* Workplace Exposure Card - Compound-specific */}
          {isCompoundData && safetyData.workplace_exposure && (
            <InfoCard
              icon={Wind}
              title="Exposure Limits"
              data={[
                safetyData.workplace_exposure.osha_pel?.twa_8hr && {
                  label: 'OSHA PEL (8hr)',
                  value: `${safetyData.workplace_exposure.osha_pel.twa_8hr} ppm`
                },
                safetyData.workplace_exposure.niosh_rel?.twa_8hr && {
                  label: 'NIOSH REL (8hr)',
                  value: `${safetyData.workplace_exposure.niosh_rel.twa_8hr} ppm`
                },
                safetyData.workplace_exposure.niosh_rel?.idlh && {
                  label: 'IDLH',
                  value: `${safetyData.workplace_exposure.niosh_rel.idlh} ppm`
                }
              ].filter(Boolean) as Array<{ label: string; value: string | number }>}
            />
          )}

          {/* Detection/Monitoring Card */}
          {safetyData.detection_monitoring && (
            <InfoCard
              icon={Eye}
              title="Detection & Monitoring"
              data={[
                safetyData.detection_monitoring.sensor_types && {
                  label: 'Sensors',
                  value: Array.isArray(safetyData.detection_monitoring.sensor_types) 
                    ? safetyData.detection_monitoring.sensor_types.join(', ')
                    : safetyData.detection_monitoring.sensor_types
                },
                safetyData.detection_monitoring.detection_range && {
                  label: 'Range',
                  value: safetyData.detection_monitoring.detection_range
                },
                safetyData.detection_monitoring.alarm_setpoints?.low && {
                  label: 'Low Alarm',
                  value: `${safetyData.detection_monitoring.alarm_setpoints.low} ppm`
                }
              ].filter(Boolean) as Array<{ label: string; value: string | number }>}
            />
          )}

          {/* Reactivity Card - Compound-specific */}
          {isCompoundData && safetyData.reactivity && (
            <InfoCard
              icon={Flame}
              title="Reactivity"
              data={[
                safetyData.reactivity.stability && {
                  label: 'Stability',
                  value: safetyData.reactivity.stability
                },
                safetyData.reactivity.polymerization && {
                  label: 'Polymerization',
                  value: safetyData.reactivity.polymerization
                },
                safetyData.reactivity.reactivity_hazard && {
                  label: 'Hazard',
                  value: safetyData.reactivity.reactivity_hazard
                }
              ].filter(Boolean) as Array<{ label: string; value: string | number }>}
            />
          )}

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
