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

  return (
    <SectionContainer variant="default" className={`py-12 ${className}`}>
      <div className="container-custom px-4">
        <SectionTitle 
          title="Safety Information"
          subtitle="Critical safety data for laser removal operations"
          alignment="left"
          className="mb-8"
        />

        {/* Unified Safety & Control Measures Grid */}
        <div className={`${getGridClasses({ columns: 3, gap: 'md' })} mb-8`}>
          {/* Risk Cards */}
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

          {/* PPE Requirements Card */}
          {safetyData.ppe_requirements && (
            <InfoCard
              icon={Shield}
              title="PPE Requirements"
              data={[
                safetyData.ppe_requirements.respiratory && {
                  label: 'Respiratory Protection',
                  value: safetyData.ppe_requirements.respiratory
                },
                safetyData.ppe_requirements.eye_protection && {
                  label: 'Eye Protection',
                  value: safetyData.ppe_requirements.eye_protection
                },
                safetyData.ppe_requirements.skin_protection && {
                  label: 'Skin Protection',
                  value: safetyData.ppe_requirements.skin_protection
                }
              ].filter(Boolean) as Array<{ label: string; value: string | number }>}
            />
          )}

          {/* Ventilation Requirements Card */}
          {safetyData.ventilation_requirements && (
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

          {/* Particulate Generation Card */}
          {safetyData.particulate_generation && (
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
