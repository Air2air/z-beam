// app/components/SettingsLayout/SettingsLayout.tsx
import React from 'react';
import { Layout } from '@/app/components/Layout/Layout';
import { ParameterRelationships } from '@/app/components/ParameterRelationships/ParameterRelationships';
import { MaterialSafetyHeatmap, ProcessEffectivenessHeatmap, EnergyCouplingHeatmap, ThermalStressHeatmap } from '@/app/components/Heatmap';
import { HeatBuildup } from '@/app/components/HeatBuildup';
import { DiagnosticCenter } from '@/app/components/DiagnosticCenter';
import { Citations } from '@/app/components/Citations';
import { FAQSettings } from '@/app/components/FAQ/FAQSettings';
import MaterialDatasetDownloader from '@/app/components/Dataset/MaterialDatasetDownloader';
import { MachineSettings } from '@/app/components/MachineSettings/MachineSettings';
import { ScheduleCards } from '@/app/components/Schedule/ScheduleCards';
import { GridSection } from '@/app/components/GridSection/GridSection';
import { CardGrid } from '@/app/components/CardGrid';
import { DataGrid } from '@/app/components/DataGrid/DataGrid';
import { DescriptiveDataPanel } from '@/app/components/DescriptiveDataPanel';
import { 
  contaminantLinkageToGridItem, 
  materialLinkageToGridItem, 
  settingsLinkageToGridItem 
} from '@/app/utils/gridMappers';
import { sortByFrequency, sortBySeverity } from '@/app/utils/gridSorters';
import { SettingsMetadata, LayoutProps, SettingsLayoutProps } from '@/types/centralized';

// Re-export for convenience
export type { SettingsLayoutProps };

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
  // Access relationships structure (supports both new and old structure)
  const relationships = (settings as any)?.relationships || {};
  
  // Extract parameters from hybrid or legacy format
  // New structure: operational.machine_settings, fallback: technical.machine_settings
  const parametersRaw = settings.components?.parameter_relationships?.parameters 
    || relationships?.operational?.machine_settings?.essential_parameters
    || relationships?.technical?.machine_settings?.essential_parameters
    || relationships?.machine_settings?.essential_parameters;
  
  // Use materialRef-loaded properties or passed properties
  const materialProps = (settings as any)?._materialProperties || materialProperties;
  
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
    findParam,
    relationships // Add relationships to returned object
  };
}

/**
 * SettingsLayout - Simplified wrapper adding settings-specific visualizations
 * 
 * Leverages base Layout component for header/metadata, adds:
 * - Parameter Relationships visualization
 * - Material Safety & Process Effectiveness Heatmaps
 * - Heat Buildup Simulator
 * - Diagnostic & Prevention Center (tabbed)
 * - Research Citations (if research_library present)
 * - Dataset download card
 * 
 * Usage:
 * ```tsx
 * <SettingsLayout metadata={settings} materialProperties={props} category={cat} subcategory={subcat} slug={slug}>
 *   // Optional: Additional custom content
 * </SettingsLayout>
 * ```
 */
export function SettingsLayout({
  metadata,
  materialProperties,
  category,
  subcategory,
  slug,
  children
}: SettingsLayoutProps) {
  // Cast metadata to SettingsMetadata for internal use
  const settings = metadata as SettingsMetadata;
  
  // Extract hero image URL for thumbnails
  const heroImage = settings.images?.hero?.url;
  console.log('SettingsLayout heroImage:', heroImage);
  
  // Construct material page link from settings slug
  // Settings URL: /settings/{category}/{subcategory}/{material}-settings
  // Material URL: /materials/{category}/{subcategory}/{material}-laser-cleaning
  const baseMaterialSlug = slug.replace(/-settings$/, '');
  const materialLink = `/materials/${category}/${subcategory}/${baseMaterialSlug}-laser-cleaning`;
  
  // Prepare enriched metadata for Layout component (includes all fields Layout expects)
  const enrichedMetadata = {
    ...settings,
    slug,
    category,
    subcategory,
    machineSettings: settings.machineSettings, // Explicitly ensure machineSettings is passed
    materialProperties: materialProperties || settings._materialProperties, // Explicitly pass material properties
  } as any;

  // Extract and prepare settings data using utility
  const {
    parametersRaw: _parametersRaw,
    materialProps,
    safetyHeatmapConfig,
    thermalConfig,
    diagnosticConfig,
    paramData,
    findParam,
    relationships // Destructure relationships from prepareSettingsData
  } = prepareSettingsData(settings, materialProperties);

  // Extract heatmap configuration (check hybrid format first, then legacy, then simple machineSettings)
  const powerParam = safetyHeatmapConfig?.power_range || findParam('powerRange');
  const pulseParam = safetyHeatmapConfig?.pulse_range || findParam('pulseWidth') || findParam('pulseDuration');

  // Calculate sensible optimal ranges (middle 30% of range) if not explicitly provided
  const getOptimalRange = (param: any, defaultMin: number, defaultMax: number): [number, number] => {
    if (param?.optimal_range) return param.optimal_range;
    const min = param?.min ?? defaultMin;
    const max = param?.max ?? defaultMax;
    const range = max - min;
    // Optimal zone is middle 30% of the range
    const optMin = min + range * 0.35;
    const optMax = min + range * 0.65;
    return [optMin, optMax];
  };
  
  const optimalPowerRange = getOptimalRange(powerParam, 50, 150);
  const optimalPulseRange = getOptimalRange(pulseParam, 10, 500);

  // Extract thermal simulation parameters
  const thermalParams = thermalConfig?.defaults || {
    power: findParam('powerRange')?.value || 100,
    rep_rate: findParam('repetitionRate')?.value || 50,
    scan_speed: findParam('scanSpeed')?.value || 500,
    pass_count: findParam('passCount')?.value || 4
  };

  // Extract diagnostic data from relationships.operational.prevention
  const preventionItems = relationships?.operational?.prevention?.items || [];
  
  console.log('SettingsLayout DiagnosticCenter data:', {
    materialName: settings.name,
    hasRelationships: !!relationships,
    relationshipKeys: relationships ? Object.keys(relationships) : [],
    hasOperational: !!relationships?.operational,
    operationalKeys: relationships?.operational ? Object.keys(relationships.operational) : [],
    hasPrevention: !!relationships?.operational?.prevention,
    preventionStructure: relationships?.operational?.prevention,
    preventionItemsCount: preventionItems.length,
    preventionItems: preventionItems.slice(0, 2) // Log first 2 items for debugging
  });
  
  // Transform prevention items to DiagnosticCenter challenges format
  // Group by category (Thermal Management, Contamination, etc.)
  const challenges = preventionItems.length > 0 ? preventionItems.reduce((acc: any, item: any) => {
    const category = (item.category || 'other')
      .toLowerCase()
      .replace(/\s+/g, '_');
    
    if (!acc[category]) acc[category] = [];
    
    acc[category].push({
      challenge: item.challenge || item.id,
      severity: item.severity || 'medium',
      impact: item.description || '',
      solutions: Array.isArray(item.solutions) ? item.solutions : [],
      prevention: item.threshold || ''
    });
    
    return acc;
  }, {} as Record<string, any[]>) : (
    diagnosticConfig?.challenges || 
    settings.machineSettings?.material_challenges || 
    {}
  );
  
  // Extract troubleshooting issues (not currently in relationships, use legacy if available)
  const issues = diagnosticConfig?.troubleshooting || 
    settings.machineSettings?.common_issues || 
    [];
  
  console.log('SettingsLayout DiagnosticCenter render check:', {
    materialName: settings.name,
    challengesCount: Object.keys(challenges).length,
    challengesKeys: Object.keys(challenges),
    issuesCount: issues.length,
    willRender: Object.keys(challenges).length > 0 || issues.length > 0
  });

  return (
    <Layout 
      metadata={enrichedMetadata}
      slug={slug}
      title={settings.title || settings.name}
      components={{ _settings: { content: '' } }} // Enable author section with dummy component
    >
      {/* Settings-specific visualizations below */}
      
      {/* Machine Settings Parameters Table */}
      <MachineSettings 
        metadata={enrichedMetadata}
        materialName={settings.name}
        heroImage={heroImage}
        materialLink={materialLink}
      />

      {/* Material Safety Heatmap */}
      <MaterialSafetyHeatmap 
              materialName={settings.name}
              thumbnail={heroImage}
              materialLink={materialLink}
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
              optimalPower={powerParam?.optimal_range || optimalPowerRange}
              optimalPulse={pulseParam?.optimal_range || optimalPulseRange}
              materialProperties={{
                // Core thermal properties - Priority: settings.thermalProperties > materialProps
                thermalConductivity: 
                  (settings as any).thermalProperties?.thermalConductivity?.value ||
                  materialProps?.laser_material_interaction?.thermalConductivity?.value,
                thermalDiffusivity: 
                  (settings as any).thermalProperties?.thermalDiffusivity?.value ||
                  materialProps?.laser_material_interaction?.thermalDiffusivity?.value || 
                  materialProps?.physical_properties?.thermalDiffusivity?.value,
                heatCapacity: materialProps?.physical_properties?.heatCapacity?.value,
                specificHeat: 
                  (settings as any).thermalProperties?.specificHeat?.value ||
                  materialProps?.laser_material_interaction?.specificHeat?.value || 
                  materialProps?.physical_properties?.specificHeat?.value,
                
                // Temperature thresholds - Priority: settings.thermalProperties > materialProps
                meltingPoint: materialProps?.physical_properties?.meltingPoint?.value,
                boilingPoint: materialProps?.physical_properties?.boilingPoint?.value,
                oxidationTemperature: materialProps?.physical_properties?.oxidationTemperature?.value,
                thermalDestructionPoint: 
                  (settings as any).thermalProperties?.thermalDestructionPoint?.value ||
                  materialProps?.physical_properties?.thermalDestructionPoint?.value,
                
                // Laser interaction - Priority: settings.laserMaterialInteraction > materialProps
                ablationThreshold: 
                  (settings as any).laserMaterialInteraction?.ablationThreshold?.value ||
                  materialProps?.laser_material_interaction?.ablationThreshold?.value || 
                  materialProps?.physical_properties?.ablationThreshold?.value,
                laserDamageThreshold: 
                  (settings as any).laserMaterialInteraction?.laserDamageThreshold?.value ||
                  materialProps?.laser_material_interaction?.laserDamageThreshold?.value,
                absorptivity: materialProps?.laser_material_interaction?.absorptivity?.value || materialProps?.physical_properties?.absorptivity?.value,
                absorptionCoefficient: materialProps?.laser_material_interaction?.absorptionCoefficient?.value,
                laserReflectivity: 
                  (settings as any).laserMaterialInteraction?.reflectivity?.value ||
                  materialProps?.laser_material_interaction?.laserReflectivity?.value || 
                  materialProps?.physical_properties?.reflectivity?.value,
                
                // Thermal dynamics
                thermalRelaxationTime: materialProps?.physical_properties?.thermalRelaxationTime?.value,
                thermalExpansionCoefficient: materialProps?.physical_properties?.thermalExpansionCoefficient?.value,
                thermalShockResistance: 
                  (settings as any).laserMaterialInteraction?.thermalShockResistance?.value ||
                  materialProps?.laser_material_interaction?.thermalShockResistance?.value,
                heatAffectedZoneDepth: materialProps?.physical_properties?.heatAffectedZoneDepth?.value,
                
                // Machine parameters for physics calculations (from settings)
                repetitionRate: (findParam('repetitionRate')?.value || 80) * 1000, // Convert kHz to Hz
                spotDiameter: findParam('spotSize')?.value || 300, // μm
              }}
            />

        {/* Energy Coupling Heatmap - Shows laser energy transfer efficiency */}
        <EnergyCouplingHeatmap 
              materialName={settings.name}
              thumbnail={heroImage}
              materialLink={materialLink}
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
              optimalPower={optimalPowerRange}
              optimalPulse={optimalPulseRange}
              materialProperties={{
                // Reflectivity and absorption properties
                laserReflectivity: 
                  (settings as any).laserMaterialInteraction?.reflectivity?.value ||
                  materialProps?.laser_material_interaction?.laserReflectivity?.value || 
                  materialProps?.physical_properties?.reflectivity?.value ||
                  materialProps?.material_characteristics?.reflectivity?.value,
                absorptivity: 
                  materialProps?.laser_material_interaction?.absorptivity?.value || 
                  materialProps?.physical_properties?.absorptivity?.value ||
                  materialProps?.material_characteristics?.absorptivity?.value,
                absorptionCoefficient: 
                  materialProps?.laser_material_interaction?.absorptionCoefficient?.value,
                // Additional properties for energy coupling analysis
                density: materialProps?.material_characteristics?.density?.value,
                porosity: materialProps?.material_characteristics?.porosity?.value,
                surfaceRoughness: materialProps?.material_characteristics?.surfaceRoughness?.value,
                // Machine parameters
                repetitionRate: (findParam('repetitionRate')?.value || 80) * 1000,
                spotDiameter: findParam('spotSize')?.value || 300,
              }}
            />

        {/* Thermal Stress Heatmap - Shows thermal stress and distortion risk */}
        <ThermalStressHeatmap 
              materialName={settings.name}
              thumbnail={heroImage}
              materialLink={materialLink}
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
              optimalPower={optimalPowerRange}
              optimalPulse={optimalPulseRange}
              materialProperties={{
                // Thermal expansion and stress properties
                thermalExpansionCoefficient: 
                  materialProps?.physical_properties?.thermalExpansionCoefficient?.value ||
                  materialProps?.laser_material_interaction?.thermalExpansion?.value,
                thermalDiffusivity: 
                  (settings as any).thermalProperties?.thermalDiffusivity?.value ||
                  materialProps?.laser_material_interaction?.thermalDiffusivity?.value || 
                  materialProps?.physical_properties?.thermalDiffusivity?.value,
                meltingPoint: 
                  materialProps?.physical_properties?.meltingPoint?.value ||
                  materialProps?.material_characteristics?.meltingPoint?.value,
                boilingPoint: 
                  materialProps?.physical_properties?.boilingPoint?.value ||
                  materialProps?.material_characteristics?.boilingPoint?.value,
                thermalShockResistance: 
                  (settings as any).laserMaterialInteraction?.thermalShockResistance?.value ||
                  materialProps?.laser_material_interaction?.thermalShockResistance?.value,
                thermalConductivity: 
                  (settings as any).thermalProperties?.thermalConductivity?.value ||
                  materialProps?.laser_material_interaction?.thermalConductivity?.value,
                specificHeat:
                  (settings as any).thermalProperties?.specificHeat?.value ||
                  materialProps?.laser_material_interaction?.specificHeat?.value ||
                  materialProps?.physical_properties?.specificHeat?.value,
                // Material density for thermal mass calculations
                density: materialProps?.material_characteristics?.density?.value,
              }}
            />

        {/* Process Effectiveness Heatmap */}
        <ProcessEffectivenessHeatmap 
              materialName={settings.name}
              thumbnail={heroImage}
              materialLink={materialLink}
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
              optimalPower={powerParam?.optimal_range || optimalPowerRange}
              optimalPulse={pulseParam?.optimal_range || optimalPulseRange}
              materialProperties={{
                // Core thermal properties - Priority: settings.thermalProperties > materialProps
                thermalConductivity: 
                  (settings as any).thermalProperties?.thermalConductivity?.value ||
                  materialProps?.laser_material_interaction?.thermalConductivity?.value,
                thermalDiffusivity: 
                  (settings as any).thermalProperties?.thermalDiffusivity?.value ||
                  materialProps?.laser_material_interaction?.thermalDiffusivity?.value || 
                  materialProps?.physical_properties?.thermalDiffusivity?.value,
                heatCapacity: materialProps?.physical_properties?.heatCapacity?.value,
                specificHeat: 
                  (settings as any).thermalProperties?.specificHeat?.value ||
                  materialProps?.laser_material_interaction?.specificHeat?.value || 
                  materialProps?.physical_properties?.specificHeat?.value,
                
                // Temperature thresholds
                meltingPoint: materialProps?.physical_properties?.meltingPoint?.value,
                boilingPoint: materialProps?.physical_properties?.boilingPoint?.value,
                oxidationTemperature: materialProps?.physical_properties?.oxidationTemperature?.value,
                thermalDestructionPoint: 
                  (settings as any).thermalProperties?.thermalDestructionPoint?.value ||
                  materialProps?.physical_properties?.thermalDestructionPoint?.value,
                
                // Laser interaction - Priority: settings.laserMaterialInteraction > materialProps
                ablationThreshold: 
                  (settings as any).laserMaterialInteraction?.ablationThreshold?.value ||
                  materialProps?.laser_material_interaction?.ablationThreshold?.value || 
                  materialProps?.physical_properties?.ablationThreshold?.value,
                laserDamageThreshold: 
                  (settings as any).laserMaterialInteraction?.laserDamageThreshold?.value ||
                  materialProps?.laser_material_interaction?.laserDamageThreshold?.value,
                absorptivity: materialProps?.laser_material_interaction?.absorptivity?.value || materialProps?.physical_properties?.absorptivity?.value,
                absorptionCoefficient: materialProps?.laser_material_interaction?.absorptionCoefficient?.value,
                laserReflectivity: 
                  (settings as any).laserMaterialInteraction?.reflectivity?.value ||
                  materialProps?.laser_material_interaction?.laserReflectivity?.value || 
                  materialProps?.physical_properties?.reflectivity?.value,
                
                // Thermal dynamics
                thermalRelaxationTime: materialProps?.physical_properties?.thermalRelaxationTime?.value,
                thermalExpansionCoefficient: materialProps?.physical_properties?.thermalExpansionCoefficient?.value,
                thermalShockResistance: 
                  (settings as any).laserMaterialInteraction?.thermalShockResistance?.value ||
                  materialProps?.laser_material_interaction?.thermalShockResistance?.value,
                heatAffectedZoneDepth: materialProps?.physical_properties?.heatAffectedZoneDepth?.value,
                
                // Machine parameters for physics calculations (from settings)
                repetitionRate: (findParam('repetitionRate')?.value || 80) * 1000, // Convert kHz to Hz
                spotDiameter: findParam('spotSize')?.value || 300, // μm
              }}
            />

        {/* Heat Buildup Simulator */}
        <HeatBuildup 
            materialName={settings.name}
            power={thermalParams.power}
            repRate={thermalParams.rep_rate}
            scanSpeed={thermalParams.scan_speed}
            passCount={thermalParams.pass_count}
            thermalDiffusivity={
              // Priority: settings.thermalProperties > materialProps.laser_material_interaction > materialProps.physical_properties
              (settings as any).thermalProperties?.thermalDiffusivity?.value ||
              materialProps?.laser_material_interaction?.thermalDiffusivity?.value ||
              materialProps?.physical_properties?.thermalDiffusivity?.value ||
              undefined  // Let component use its default (97 for aluminum) if no data
            }
            heroImage={heroImage}
            materialLink={materialLink}
          />

        {/* Diagnostic & Prevention Center - Tabbed Interface */}
        {/* Debug: Always show to see what's happening */}
        <div className="bg-yellow-900/20 border border-yellow-500 p-4 mb-4">
          <p className="text-sm text-yellow-300">DEBUG: DiagnosticCenter Check</p>
          <p className="text-xs">Material: {settings.name}</p>
          <p className="text-xs">Challenges keys: {Object.keys(challenges).join(', ') || 'none'}</p>
          <p className="text-xs">Challenges count: {Object.keys(challenges).length}</p>
          <p className="text-xs">Issues count: {issues.length}</p>
          <p className="text-xs">Will render: {(Object.keys(challenges).length > 0 || issues.length > 0).toString()}</p>
          <p className="text-xs mt-2">Sample challenge categories:</p>
          <pre className="text-[10px] bg-black/40 p-2 mt-1 overflow-auto max-h-40">
            {JSON.stringify(challenges, null, 2)}
          </pre>
        </div>
        
        {(Object.keys(challenges).length > 0 || issues.length > 0) && (
          <DiagnosticCenter 
            materialName={settings.name}
            challenges={challenges}
            issues={issues}
            heroImage={heroImage}
            materialLink={materialLink}
          />
        )}

      {/* Research Citations - NEW */}
      {settings.research_library && (
        <Citations 
          research_library={settings.research_library}
          materialName={settings.name}
          heroImage={heroImage}
          materialLink={materialLink}
        />
      )}

      {/* Settings FAQ and Troubleshooting */}
      {(settings.help || settings.machineSettings?.material_challenges) && (
        <FAQSettings
          materialName={settings.name}
          help={settings.help}
          material_challenges={settings.machineSettings?.material_challenges}
        />
      )}

      {/* Dataset Download Section */}
      <MaterialDatasetDownloader
        materialName={settings.name}
        slug={slug}
        category={category}
        subcategory={subcategory}
        machineSettings={(settings as any).machine_settings || settings.machineSettings || {}}
        materialProperties={materialProps || {}}
        faq={(settings as any).faq || []}
        regulatoryStandards={(settings as any).regulatoryStandards || []}
        showFullDataset={true}
      />

      {/* Parameter Interaction Network - at bottom for reference */}
      <ParameterRelationships 
        parameters={paramData || []}
        materialName={settings.name}
        heroImage={heroImage}
        materialLink={materialLink}
      />

      {/* Material groups (from relationships.materials.groups) */}
      {(relationships?.materials?.groups ? Object.values(relationships.materials.groups) : []).map((group: any, index: number) => (
        group?.items?.length > 0 && (
          <CardGrid
            key={`materials-group-${index}`}
            items={(group.items || []).filter((item: any) => item && item.frequency).sort(sortByFrequency).map(materialLinkageToGridItem)}
            title={group.title}
            description={group.description}
          />
        )
      ))}

      {/* Contaminant groups (from relationships.contaminants.groups) */}
      {(relationships?.contaminants?.groups ? Object.values(relationships.contaminants.groups) : []).map((group: any, index: number) => (
        group?.items?.length > 0 && (
          <CardGrid
            key={`contaminants-group-${index}`}
            items={(group.items || []).filter((item: any) => item && item.frequency).sort(sortByFrequency).map(contaminantLinkageToGridItem)}
            title={group.title}
            description={group.description}
            variant="relationship"
          />
        )
      ))}

      {/* Descriptive data sections (operational.common_challenges or technical.common_challenges) */}
      {(relationships?.operational?.common_challenges?.items?.length > 0 || relationships?.technical?.common_challenges?.items?.length > 0) && (
        <DescriptiveDataPanel
          items={(relationships?.operational?.common_challenges?.items || relationships?.technical?.common_challenges?.items)}
          sectionMetadata={(relationships?.operational?.common_challenges?._section || relationships?.technical?.common_challenges?._section)}
        />
      )}

      {/* Custom content slot */}
      {children}

      {/* Schedule Cards - always at bottom */}
      <ScheduleCards />
    </Layout>
  );
}
