// app/components/SettingsLayout/SettingsLayout.tsx
import React from 'react';
import { Layout } from '@/app/components/Layout/Layout';
import { Title } from '@/app/components/Title';
import { Author } from '@/app/components/Author/Author';
import { ParameterRelationships } from '@/app/components/ParameterRelationships/ParameterRelationships';
import { MaterialSafetyHeatmap, ProcessEffectivenessHeatmap } from '@/app/components/Heatmap';
import { ThermalAccumulation } from '@/app/components/ThermalAccumulation';
import { DiagnosticCenter } from '@/app/components/DiagnosticCenter';
import { Citations } from '@/app/components/Citations';
import SettingsDatasetCardWrapper from '@/app/components/Dataset/SettingsDatasetCardWrapper';
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
    breadcrumb: settings.breadcrumb,
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
  ) : (
    // FALLBACK: Convert simple machineSettings to parameter format
    settings.machineSettings ? Object.entries(settings.machineSettings).map(([key, param]: [string, any]) => ({
      id: key,
      name: param.name || key,
      value: param.value,
      unit: param.unit,
      min: param.min,
      max: param.max,
      criticality: (key === 'powerRange' || key === 'energyDensity' || key === 'pulseWidth' ? 'high' : 'medium') as 'critical' | 'high' | 'medium' | 'low',
      rationale: `Operating range: ${param.min}-${param.max} ${param.unit}`,
      material_interaction: null
    })) : null
  );

  // Helper function to find parameter by id
  const findParam = (id: string) => {
    if (parametersRaw) {
      if (Array.isArray(parametersRaw)) {
        return parametersRaw.find((p: any) => p.id === id);
      }
      return (parametersRaw as any)[id];
    }
    // FALLBACK: Check simple machineSettings
    if (settings.machineSettings) {
      return (settings.machineSettings as any)[id];
    }
    return null;
  };

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
    >
      {/* Header - Title and Author (matching materials pages) */}
      <header className="header-section mb-6">
        <Title 
          level="page" 
          title={settings.title} 
          subtitle={settings.subtitle}
        />
        <Author 
          frontmatter={metadata}
          showAvatar showCredentials showCountry showSpecialties
          className="mt-2 mb-4"
        />
      </header>

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
        )}

        {/* Thermal Accumulation Simulator */}
        {settings.machineSettings && (
          <ThermalAccumulation 
            materialName={settings.name}
            power={thermalParams.power}
            repRate={thermalParams.rep_rate}
            scanSpeed={thermalParams.scan_speed}
            passCount={thermalParams.pass_count}
          />
        )}

        {/* Diagnostic & Prevention Center - Tabbed Interface */}
        {(defaultChallenges || defaultIssues) && (
          <DiagnosticCenter 
            materialName={settings.name}
            challenges={defaultChallenges!}
            issues={defaultIssues!}
          />
        )}

      {/* Research Citations - NEW */}
      {settings.research_library && (
        <Citations 
          research_library={settings.research_library}
          materialName={settings.name}
        />
      )}

      {/* Dataset Download Section */}
      <SettingsDatasetCardWrapper
        settings={{
          name: settings.name,
          slug,
          category,
          subcategory,
          machineSettings: settings.machineSettings,
          research_library: settings.research_library,
          components: settings.components
        }}
        showFullDataset={true}
      />

      {/* Custom content slot */}
      {children}
    </Layout>
  );
}
