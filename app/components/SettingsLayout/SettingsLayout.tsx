// app/components/SettingsLayout/SettingsLayout.tsx
import React from 'react';
import { Layout } from '@/app/components/Layout/Layout';
import { ParameterRelationships } from '@/app/components/ParameterRelationships/ParameterRelationships';
import { MaterialSafetyHeatmap, ProcessEffectivenessHeatmap } from '@/app/components/Heatmap';
import { ThermalAccumulation } from '@/app/components/ThermalAccumulation';
import { DiagnosticCenter } from '@/app/components/DiagnosticCenter';
import { Citations } from '@/app/components/Citations';
import { FAQSettings } from '@/app/components/FAQ/FAQSettings';
import MaterialDatasetCardWrapper from '@/app/components/Dataset/MaterialDatasetCardWrapper';
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
 * Infer criticality level from parameter key
 */
function inferCriticality(key: string): 'critical' | 'high' | 'medium' | 'low' {
  const criticalKeys = ['powerRange', 'energyDensity', 'pulseWidth'];
  return criticalKeys.includes(key) ? 'high' : 'medium';
}

/**
 * Extract and prepare settings data for components
 * Supports both hybrid format (components.parameter_relationships) 
 * and legacy format (machineSettings.essential_parameters)
 */
function prepareSettingsData(
  settings: SettingsMetadata,
  materialProperties?: any
) {
  // Extract parameters from hybrid or legacy format
  const parametersRaw = settings.components?.parameter_relationships?.parameters 
    || settings.machineSettings?.essential_parameters;
  
  console.log('SettingsLayout machineSettings:', JSON.stringify(settings.machineSettings, null, 2));
  
  // Use materialRef-loaded properties or passed properties
  const materialProps = settings._materialProperties || materialProperties;
  
  // Extract component-specific configs
  const safetyHeatmapConfig = settings.components?.safety_heatmap;
  const thermalConfig = settings.components?.thermal_accumulation;
  const diagnosticConfig = settings.components?.diagnostic_center;

  // Convert parameters to consistent array format
  const paramData = parametersRaw ? (
    Array.isArray(parametersRaw) 
      ? parametersRaw 
      : Object.entries(parametersRaw).map(([key, param]: [string, any]) => ({
          id: key,
          name: param.name || key,
          value: param.value,
          unit: param.unit,
          criticality: param.criticality as 'critical' | 'high' | 'medium' | 'low',
          rationale: param.rationale,
          material_interaction: param.material_interaction || null,
          ...param
        }))
  ) : (
    // Fallback: Convert simple machineSettings to parameter format
    settings.machineSettings 
      ? Object.entries(settings.machineSettings)
          .filter(([key]) => !['material_challenges', 'common_issues'].includes(key))
          .map(([key, param]: [string, any]) => {
            // Only process if param has value and unit (actual parameters)
            if (param && typeof param === 'object' && param.value !== undefined && param.unit) {
              return {
                id: key,
                name: param.name || key,
                value: param.value,
                unit: param.unit,
                min: param.min ?? null,
                max: param.max ?? null,
                criticality: inferCriticality(key),
                rationale: param.min && param.max 
                  ? `Operating range: ${param.min}-${param.max} ${param.unit}`
                  : `Typical value: ${param.value} ${param.unit}`,
                material_interaction: null
              };
            }
            return null;
          })
          .filter(Boolean) 
      : []
  );
  
  console.log('SettingsLayout paramData:', paramData?.length, 'items');

  // Helper function to find parameter by id
  const findParam = (id: string) => {
    if (parametersRaw) {
      if (Array.isArray(parametersRaw)) {
        return parametersRaw.find((p: any) => p.id === id);
      }
      return (parametersRaw as any)[id];
    }
    // Fallback: Check simple machineSettings
    if (settings.machineSettings) {
      return (settings.machineSettings as any)[id];
    }
    return null;
  };

  return {
    parametersRaw,
    materialProps,
    safetyHeatmapConfig,
    thermalConfig,
    diagnosticConfig,
    paramData,
    findParam
  };
}

/**
 * SettingsLayout - Simplified wrapper adding settings-specific visualizations
 * 
 * Leverages base Layout component for header/metadata, adds:
 * - Parameter Relationships visualization
 * - Material Safety & Process Effectiveness Heatmaps
 * - Thermal Accumulation Simulator
 * - Diagnostic & Prevention Center (tabbed)
 * - Research Citations (if research_library present)
 * - Dataset download card
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
  
  // Prepare enriched metadata for Layout component (includes all fields Layout expects)
  const metadata = {
    ...settings,
    slug,
    category,
    subcategory,
    machineSettings: settings.machineSettings, // Explicitly ensure machineSettings is passed
    materialProperties: materialProperties || settings._materialProperties, // Explicitly pass material properties
  } as any;

  // Extract and prepare settings data using utility
  const {
    parametersRaw,
    materialProps,
    safetyHeatmapConfig,
    thermalConfig,
    diagnosticConfig,
    paramData,
    findParam
  } = prepareSettingsData(settings, materialProperties);

  // Extract heatmap configuration (check hybrid format first, then legacy, then simple machineSettings)
  const powerParam = safetyHeatmapConfig?.power_range || findParam('powerRange');
  const pulseParam = safetyHeatmapConfig?.pulse_range || findParam('pulseWidth') || findParam('pulseDuration');

  // Extract thermal simulation parameters
  const thermalParams = thermalConfig?.defaults || {
    power: findParam('powerRange')?.value || 100,
    rep_rate: findParam('repetitionRate')?.value || 50,
    scan_speed: findParam('scanSpeed')?.value || 500,
    pass_count: findParam('passCount')?.value || 2
  };

  // Extract diagnostic data
  const challenges = diagnosticConfig?.challenges || settings.machineSettings?.material_challenges;
  const issues = diagnosticConfig?.troubleshooting || settings.machineSettings?.common_issues;
  
  // Generate default challenges if none provided
  const defaultChallenges = !challenges && settings.machineSettings ? {
    thermal_management: [
      {
        challenge: 'Heat accumulation',
        severity: 'medium',
        impact: 'Excessive heat can damage substrate or alter material properties',
        solutions: [
          'Reduce repetition rate',
          'Increase scan speed',
          'Add cooling time between passes'
        ],
        prevention: 'Monitor surface temperature and adjust parameters accordingly'
      }
    ],
    surface_characteristics: [
      {
        challenge: 'Variable surface roughness',
        severity: 'medium',
        impact: 'Inconsistent cleaning results across different surface textures',
        solutions: [
          'Adjust energy density based on surface condition',
          'Use multiple passes with progressive settings',
          'Pre-characterize surface before cleaning'
        ],
        prevention: 'Standardize surface preparation procedures'
      }
    ]
  } : challenges;
  
  // Generate default issues if none provided
  const defaultIssues = !issues && settings.machineSettings ? [
    {
      symptom: 'Incomplete contamination removal',
      causes: [
        'Energy density too low',
        'Insufficient overlap',
        'Scan speed too high'
      ],
      solutions: [
        'Increase laser power by 10-20%',
        'Reduce scan speed by 20-30%',
        'Add an additional pass'
      ],
      verification: 'Visual inspection under magnification',
      prevention: 'Verify parameters on test piece before production'
    },
    {
      symptom: 'Surface discoloration or damage',
      causes: [
        'Power too high',
        'Excessive energy density',
        'Too many passes'
      ],
      solutions: [
        'Reduce laser power by 15-20%',
        'Increase scan speed',
        'Limit to 2-3 passes maximum'
      ],
      verification: 'Surface inspection and roughness measurement',
      prevention: 'Start with conservative parameters and increase gradually'
    }
  ] : issues;

  return (
    <Layout 
      metadata={metadata}
      slug={slug}
      title={settings.title}
      components={{ _settings: { content: '' } }} // Enable author section with dummy component
    >
      {/* Settings-specific visualizations below */}
      
      {/* Parameter Interaction Network */}
      <ParameterRelationships 
        parameters={paramData || []}
        materialName={settings.name}
      />

      {/* Material Safety Heatmap */}
      <div className="mb-8">
        <MaterialSafetyHeatmap 
              materialName={settings.name}
              powerRange={{
                min: powerParam?.min || 0,
                max: powerParam?.max || 200,
                current: powerParam?.current || powerParam?.value || 100,
              }}
              pulseRange={{
                min: pulseParam?.min || 0,
                max: pulseParam?.max || 1000,
                current: pulseParam?.current || pulseParam?.value || 100,
              }}
              optimalPower={powerParam?.optimal_range || [powerParam?.min || 50, powerParam?.max || 150]}
              optimalPulse={pulseParam?.optimal_range || [pulseParam?.min || 10, pulseParam?.max || 500]}
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

        {/* Process Effectiveness Heatmap */}
        <div className="mb-8">
            <ProcessEffectivenessHeatmap 
              materialName={settings.name}
              powerRange={{
                min: powerParam.min || 0,
                max: powerParam.max || 200,
                current: powerParam.current || powerParam.value || 100,
              }}
              pulseRange={{
                min: pulseParam.min || 0,
                max: pulseParam.max || 1000,
                current: pulseParam.current || pulseParam.value || 100,
              }}
              optimalPower={powerParam.optimal_range || [powerParam.min || 50, powerParam.max || 150]}
              optimalPulse={pulseParam.optimal_range || [pulseParam.min || 10, pulseParam.max || 500]}
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

        {/* Thermal Accumulation Simulator */}
        <ThermalAccumulation 
            materialName={settings.name}
            power={thermalParams.power}
            repRate={thermalParams.rep_rate}
            scanSpeed={thermalParams.scan_speed}
            passCount={thermalParams.pass_count}
          />

        {/* Diagnostic & Prevention Center - Tabbed Interface */}
        <DiagnosticCenter 
            materialName={settings.name}
            challenges={defaultChallenges!}
            issues={defaultIssues!}
          />

      {/* Research Citations - NEW */}
      {settings.research_library && (
        <Citations 
          research_library={settings.research_library}
          materialName={settings.name}
        />
      )}

      {/* Settings FAQ and Troubleshooting */}
      {(settings.help || settings.machineSettings?.material_challenges) && (
        <div className="mb-8">
          <FAQSettings
            materialName={settings.name}
            help={settings.help}
            material_challenges={settings.machineSettings?.material_challenges}
          />
        </div>
      )}

      {/* Dataset Download Section */}
      <MaterialDatasetCardWrapper
        materialName={settings.name}
        slug={slug}
        category={category}
        subcategory={subcategory}
        machineSettings={settings.machineSettings}
        materialProperties={materialProps || {}}
        faq={(settings as any).faq || []}
        regulatoryStandards={(settings as any).regulatoryStandards || []}
        showFullDataset={true}
      />

      {/* Custom content slot */}
      {children}
    </Layout>
  );
}
