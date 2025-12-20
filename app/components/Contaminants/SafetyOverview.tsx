// app/components/Contaminants/SafetyOverview.tsx
// Contaminant safety overview with unified safety grid
//
// Schema Compliance:
// - Implements SAFETY_RISK_SEVERITY_SCHEMA.md v1.2 for all safety data
// - Risk fields support dual format:
//   - Simple string: fire_explosion_risk: "moderate"
//   - Nested object: fire_explosion_risk: { severity: "moderate", description: "...", mitigation: "..." }
// - Component automatically detects format and extracts severity string
// - PPE fields: respiratory, eye_protection, skin_protection
// - Ventilation fields: minimum_air_changes_per_hour, exhaust_velocity_m_s, filtration_type
// - Particulate fields: respirable_fraction (0.0-1.0), size_range_um [min, max]
// - Substrate warnings: array of warning strings
//
// @see docs/specs/SAFETY_RISK_SEVERITY_SCHEMA.md

import React from 'react';
import { AlertTriangle, Wind, Eye, Shield, Flame } from 'lucide-react';
import { RiskCard } from '../RiskCard/RiskCard';
import { InfoCard } from '../InfoCard/InfoCard';
import { SectionContainer } from '../SectionContainer/SectionContainer';
import { getGridClasses } from '@/app/utils/gridConfig';

interface SafetyOverviewProps {
  safetyData: any;
}

export function SafetyOverview({ safetyData }: SafetyOverviewProps) {
  if (!safetyData) return null;

  return (
    <>
      {/* Unified Safety & Control Measures Grid */}
      <SectionContainer title="Safety Information">
        <div className={getGridClasses({ columns: 3, gap: 'md' })}>
          {/* Risk Cards */}
          {safetyData.fire_explosion_risk && (
            <RiskCard
              icon={Flame}
              label="Fire/Explosion Risk"
              severity={typeof safetyData.fire_explosion_risk === 'string' 
                ? safetyData.fire_explosion_risk 
                : safetyData.fire_explosion_risk.severity}
            />
          )}
          {safetyData.toxic_gas_risk && (
            <RiskCard
              icon={AlertTriangle}
              label="Toxic Gas Risk"
              severity={typeof safetyData.toxic_gas_risk === 'string' 
                ? safetyData.toxic_gas_risk 
                : safetyData.toxic_gas_risk.severity}
            />
          )}
          {safetyData.visibility_hazard && (
            <RiskCard
              icon={Eye}
              label="Visibility Hazard"
              severity={typeof safetyData.visibility_hazard === 'string' 
                ? safetyData.visibility_hazard 
                : safetyData.visibility_hazard.severity}
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
      </SectionContainer>

      {/* Substrate Compatibility Warnings */}
      {safetyData.substrate_compatibility_warnings && safetyData.substrate_compatibility_warnings.length > 0 && (
        <SectionContainer title="Substrate Compatibility Warnings">
          <div className="bg-yellow-900/20 border border-yellow-500 rounded-md p-6">
            <ul className="space-y-2">
              {safetyData.substrate_compatibility_warnings.map((warning: string, i: number) => (
                <li key={i} className="text-yellow-200 flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        </SectionContainer>
      )}
    </>
  );
}

export default SafetyOverview;
