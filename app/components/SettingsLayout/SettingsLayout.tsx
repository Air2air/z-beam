// app/components/SettingsLayout/SettingsLayout.tsx
import React from 'react';
import { Layout } from '@/app/components/Layout/Layout';
import { ParameterRelationships } from '@/app/components/ParameterRelationships/ParameterRelationships';
import { MaterialSafetyHeatmap, ProcessEffectivenessHeatmap } from '@/app/components/Heatmap';
import { ThermalAccumulation } from '@/app/components/ThermalAccumulation';
import { DiagnosticCenter } from '@/app/components/DiagnosticCenter';
import { Citations } from '@/app/components/Citations';
import { SettingsMetadata } from '@/types/centralized';

interface SettingsLayoutProps {
  settings: SettingsMetadata;
  materialProperties?: any;
  category: string;
  subcategory: string;
  slug: string;
  children?: React.ReactNode;
}

/**
 * SettingsLayout - Reusable template for all settings pages
 * 
 * Provides consistent structure and automatic rendering of standard components:
 * - Parameter Relationships visualization
 * - Material Safety & Process Effectiveness Heatmaps
 * - Thermal Accumulation Simulator
 * - Diagnostic & Prevention Center (tabbed)
 * - Research Citations (if research_library present)
 * 
 * NEW: Supports Hybrid Approach with component-specific data structure
 * NEW: Auto-loads material properties via materialRef
 * NEW: Renders Citations component for research library
 * 
 * Usage:
 * ```tsx
 * <SettingsLayout settings={settings} materialProperties={props} category={cat} subcategory={subcat} slug={slug}>
 *   // Optional: Additional custom content
 * </SettingsLayout>
 * ```
 */
export function SettingsLayout({
  settings,
  materialProperties,
  category,
  subcategory,
  slug,
  children
}: SettingsLayoutProps) {
  
  // Prepare metadata for Layout component
  const metadata = {
    name: settings.name,
    title: settings.title,
    subtitle: settings.subtitle,
    description: settings.description,
    author: settings.author,
    slug,
    category,
    subcategory,
  };

  // NEW: Support both legacy (machineSettings.essential_parameters) and hybrid (components.parameter_relationships)
  const parametersRaw = settings.components?.parameter_relationships?.parameters 
    || settings.machineSettings?.essential_parameters;
  
  // NEW: Use materialRef-loaded properties or passed properties
  const materialProps = settings._materialProperties || materialProperties;
  
  // NEW: Extract component-specific configs
  const safetyHeatmapConfig = settings.components?.safety_heatmap;
  const thermalConfig = settings.components?.thermal_accumulation;
  const diagnosticConfig = settings.components?.diagnostic_center;

  // Extract data for components (support both formats)
  const paramData = parametersRaw ? (
    Array.isArray(parametersRaw) ? parametersRaw : Object.entries(parametersRaw).map(([key, param]: [string, any]) => ({
      id: key,
      name: param.name || key,
      value: param.value,
      unit: param.unit,
      criticality: param.criticality as 'critical' | 'high' | 'medium' | 'low',
      rationale: param.rationale,
      material_interaction: param.material_interaction
    }))
  ) : null;

  // Helper function to find parameter by id
  const findParam = (id: string) => {
    if (!parametersRaw) return null;
    if (Array.isArray(parametersRaw)) {
      return parametersRaw.find((p: any) => p.id === id);
    }
    return (parametersRaw as any)[id];
  };

  // Extract heatmap configuration (check hybrid format first, then legacy)
  const powerParam = safetyHeatmapConfig?.power_range || findParam('powerRange');
  const pulseParam = safetyHeatmapConfig?.pulse_range || findParam('pulseWidth');

  // Extract thermal simulation parameters
  const thermalParams = thermalConfig?.defaults || {
    power: findParam('powerRange')?.value,
    rep_rate: findParam('repetitionRate')?.value,
    scan_speed: findParam('scanSpeed')?.value,
    pass_count: findParam('passCount')?.value
  };

  // Extract diagnostic data
  const challenges = diagnosticConfig?.challenges || settings.machineSettings?.material_challenges;
  const issues = diagnosticConfig?.troubleshooting || settings.machineSettings?.common_issues;

  return (
    <Layout 
      metadata={metadata}
      slug={slug}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        {/* Parameter Interaction Network */}
        {paramData && paramData.length > 0 && (
          <ParameterRelationships 
            parameters={paramData}
            materialName={settings.name}
          />
        )}

        {/* Material Safety Heatmap */}
        {powerParam && pulseParam && (
          <div className="mb-8">
            <MaterialSafetyHeatmap 
              materialName={settings.name}
              powerRange={{
                min: powerParam.min,
                max: powerParam.max,
                current: powerParam.current || powerParam.value,
              }}
              pulseRange={{
                min: pulseParam.min,
                max: pulseParam.max,
                current: pulseParam.current || pulseParam.value,
              }}
              optimalPower={powerParam.optimal_range || [powerParam.min, powerParam.max]}
              optimalPulse={pulseParam.optimal_range || [pulseParam.min, pulseParam.max]}
              materialProperties={{
                // Core thermal properties
                thermalConductivity: materialProps?.laser_material_interaction?.thermalConductivity?.value,
                thermalDiffusivity: materialProps?.laser_material_interaction?.thermalDiffusivity?.value || materialProps?.physical_properties?.thermalDiffusivity?.value,
                heatCapacity: materialProps?.physical_properties?.heatCapacity?.value,
                specificHeat: materialProps?.laser_material_interaction?.specificHeat?.value || materialProps?.physical_properties?.specificHeat?.value,
                
                // Temperature thresholds
                meltingPoint: materialProps?.physical_properties?.meltingPoint?.value,
                boilingPoint: materialProps?.physical_properties?.boilingPoint?.value,
                oxidationTemperature: materialProps?.physical_properties?.oxidationTemperature?.value,
                thermalDestructionPoint: materialProps?.physical_properties?.thermalDestructionPoint?.value,
                
                // Laser interaction
                ablationThreshold: materialProps?.laser_material_interaction?.ablationThreshold?.value || materialProps?.physical_properties?.ablationThreshold?.value,
                laserDamageThreshold: materialProps?.laser_material_interaction?.laserDamageThreshold?.value,
                absorptivity: materialProps?.laser_material_interaction?.absorptivity?.value || materialProps?.physical_properties?.absorptivity?.value,
                absorptionCoefficient: materialProps?.laser_material_interaction?.absorptionCoefficient?.value,
                laserReflectivity: materialProps?.laser_material_interaction?.laserReflectivity?.value || materialProps?.physical_properties?.reflectivity?.value,
                
                // Thermal dynamics
                thermalRelaxationTime: materialProps?.physical_properties?.thermalRelaxationTime?.value,
                thermalExpansionCoefficient: materialProps?.physical_properties?.thermalExpansionCoefficient?.value,
                thermalShockResistance: materialProps?.laser_material_interaction?.thermalShockResistance?.value,
                heatAffectedZoneDepth: materialProps?.physical_properties?.heatAffectedZoneDepth?.value,
              }}
            />
          </div>
        )}

        {/* Process Effectiveness Heatmap */}
        {powerParam && pulseParam && (
          <div className="mb-8">
            <ProcessEffectivenessHeatmap 
              materialName={settings.name}
              powerRange={{
                min: powerParam.min,
                max: powerParam.max,
                current: powerParam.current || powerParam.value,
              }}
              pulseRange={{
                min: pulseParam.min,
                max: pulseParam.max,
                current: pulseParam.current || pulseParam.value,
              }}
              optimalPower={powerParam.optimal_range || [powerParam.min, powerParam.max]}
              optimalPulse={pulseParam.optimal_range || [pulseParam.min, pulseParam.max]}
              materialProperties={{
                // Same properties as MaterialSafetyHeatmap
                thermalConductivity: materialProps?.laser_material_interaction?.thermalConductivity?.value,
                thermalDiffusivity: materialProps?.laser_material_interaction?.thermalDiffusivity?.value || materialProps?.physical_properties?.thermalDiffusivity?.value,
                heatCapacity: materialProps?.physical_properties?.heatCapacity?.value,
                specificHeat: materialProps?.laser_material_interaction?.specificHeat?.value || materialProps?.physical_properties?.specificHeat?.value,
                meltingPoint: materialProps?.physical_properties?.meltingPoint?.value,
                boilingPoint: materialProps?.physical_properties?.boilingPoint?.value,
                oxidationTemperature: materialProps?.physical_properties?.oxidationTemperature?.value,
                thermalDestructionPoint: materialProps?.physical_properties?.thermalDestructionPoint?.value,
                ablationThreshold: materialProps?.laser_material_interaction?.ablationThreshold?.value || materialProps?.physical_properties?.ablationThreshold?.value,
                laserDamageThreshold: materialProps?.laser_material_interaction?.laserDamageThreshold?.value,
                absorptivity: materialProps?.laser_material_interaction?.absorptivity?.value || materialProps?.physical_properties?.absorptivity?.value,
                absorptionCoefficient: materialProps?.laser_material_interaction?.absorptionCoefficient?.value,
                laserReflectivity: materialProps?.laser_material_interaction?.laserReflectivity?.value || materialProps?.physical_properties?.reflectivity?.value,
                thermalRelaxationTime: materialProps?.physical_properties?.thermalRelaxationTime?.value,
                thermalExpansionCoefficient: materialProps?.physical_properties?.thermalExpansionCoefficient?.value,
                thermalShockResistance: materialProps?.laser_material_interaction?.thermalShockResistance?.value,
                heatAffectedZoneDepth: materialProps?.physical_properties?.heatAffectedZoneDepth?.value,
              }}
            />
          </div>
        )}

        {/* Thermal Accumulation Simulator */}
        {thermalParams.power && thermalParams.rep_rate && thermalParams.scan_speed && thermalParams.pass_count && (
          <ThermalAccumulation 
            power={thermalParams.power}
            repRate={thermalParams.rep_rate}
            scanSpeed={thermalParams.scan_speed}
            passCount={thermalParams.pass_count}
          />
        )}

        {/* Diagnostic & Prevention Center - Tabbed Interface */}
        {challenges && issues && (
          <DiagnosticCenter 
            materialName={settings.name}
            challenges={challenges}
            issues={issues}
          />
        )}

        {/* Research Citations - NEW */}
        {settings.research_library && (
          <Citations 
            research_library={settings.research_library}
            materialName={settings.name}
          />
        )}

        {/* Custom content slot */}
        {children}
        
      </div>
    </Layout>
  );
}
