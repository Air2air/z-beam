/**
 * @component SafetyDataPanel
 * @purpose Comprehensive safety information display for contaminant laser removal
 * @extends GridSection, CompoundSafetyGrid components
 * 
 * Updated to use:
 * - GridSection: Universal section wrapper
 * - CompoundSafetyGrid: Enhanced compound display with safety metadata
 * - Data from produces_compounds (flattened structure)
 */

import { SectionContainer } from '../SectionContainer/SectionContainer';
import { SectionTitle } from '../SectionTitle/SectionTitle';
import { GridSection } from '../GridSection';
import { CompoundSafetyGrid } from '../CompoundSafetyGrid';
import { EnhancedCompound } from '@/app/utils/gridMappers';
import { AlertTriangle, Wind, Eye, Shield, Flame } from 'lucide-react';

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

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'text-red-400 bg-red-900/20 border-red-500';
      case 'moderate':
      case 'medium':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-500';
      case 'low':
        return 'text-green-400 bg-green-900/20 border-green-500';
      default:
        return 'text-gray-400 bg-gray-800/50 border-gray-600';
    }
  };

  return (
    <SectionContainer variant="default" className={`py-12 ${className}`}>
      <div className="container-custom px-4">
        <SectionTitle 
          title="Safety Information"
          subtitle="Critical safety data for laser removal operations"
          alignment="left"
          className="mb-8"
        />

        {/* Risk Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Fire/Explosion Risk */}
          {safetyData.fire_explosion_risk && (
            <div className={`rounded-md border p-4 ${getRiskColor(safetyData.fire_explosion_risk)}`}>
              <div className="flex items-center gap-3 mb-2">
                <Flame className="w-6 h-6" />
                <div>
                  <div className="text-sm text-gray-400">Fire/Explosion Risk</div>
                  <div className="text-xl font-semibold capitalize">{safetyData.fire_explosion_risk}</div>
                </div>
              </div>
            </div>
          )}

          {/* Toxic Gas Risk */}
          {safetyData.toxic_gas_risk && (
            <div className={`rounded-md border p-4 ${getRiskColor(safetyData.toxic_gas_risk)}`}>
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-6 h-6" />
                <div>
                  <div className="text-sm text-gray-400">Toxic Gas Risk</div>
                  <div className="text-xl font-semibold capitalize">{safetyData.toxic_gas_risk}</div>
                </div>
              </div>
            </div>
          )}

          {/* Visibility Hazard */}
          {safetyData.visibility_hazard && (
            <div className={`rounded-md border p-4 ${getRiskColor(safetyData.visibility_hazard)}`}>
              <div className="flex items-center gap-3 mb-2">
                <Eye className="w-6 h-6" />
                <div>
                  <div className="text-sm text-gray-400">Visibility Hazard</div>
                  <div className="text-xl font-semibold capitalize">{safetyData.visibility_hazard}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PPE Requirements */}
        {safetyData.ppe_requirements && (
          <div className="bg-gray-800/50 rounded-md p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Required Personal Protective Equipment</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {safetyData.ppe_requirements.respiratory && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">Respiratory Protection</div>
                  <div className="text-white font-medium uppercase">{safetyData.ppe_requirements.respiratory}</div>
                </div>
              )}
              {safetyData.ppe_requirements.eye_protection && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">Eye Protection</div>
                  <div className="text-white font-medium uppercase">{safetyData.ppe_requirements.eye_protection}</div>
                </div>
              )}
              {safetyData.ppe_requirements.skin_protection && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">Skin Protection</div>
                  <div className="text-white font-medium uppercase">{safetyData.ppe_requirements.skin_protection}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hazardous Compounds Grid - Enhanced Safety Display */}
        {compounds && compounds.length > 0 && (
          <GridSection
            title="Hazardous Compounds Generated"
            subtitle="Critical compound safety information with exposure limits and control measures"
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

        {/* Ventilation Requirements */}
        {safetyData.ventilation_requirements && (
          <div className="bg-gray-800/50 rounded-md p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Wind className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Ventilation Requirements</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {safetyData.ventilation_requirements.minimum_air_changes_per_hour && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">Air Changes Per Hour</div>
                  <div className="text-white text-2xl font-bold">{safetyData.ventilation_requirements.minimum_air_changes_per_hour}</div>
                </div>
              )}
              {safetyData.ventilation_requirements.exhaust_velocity_m_s && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">Exhaust Velocity</div>
                  <div className="text-white text-2xl font-bold">{safetyData.ventilation_requirements.exhaust_velocity_m_s} m/s</div>
                </div>
              )}
              {safetyData.ventilation_requirements.filtration_type && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">Filtration Type</div>
                  <div className="text-white text-xl font-medium uppercase">{safetyData.ventilation_requirements.filtration_type}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Particulate Generation */}
        {safetyData.particulate_generation && (
          <div className="bg-gray-800/50 rounded-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Particulate Generation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safetyData.particulate_generation.respirable_fraction !== undefined && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">Respirable Fraction</div>
                  <div className="text-white text-2xl font-bold">{(safetyData.particulate_generation.respirable_fraction * 100).toFixed(0)}%</div>
                </div>
              )}
              {safetyData.particulate_generation.size_range_um && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">Size Range</div>
                  <div className="text-white text-2xl font-bold">
                    {safetyData.particulate_generation.size_range_um[0]} - {safetyData.particulate_generation.size_range_um[1]} μm
                  </div>
                </div>
              )}
            </div>
          </div>
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
