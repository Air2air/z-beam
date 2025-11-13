import { SettingsMetadata } from '@/types';

/**
 * Prepared settings data for component consumption
 */
export interface PreparedSettingsData {
  parametersRaw: any;
  materialProps: any;
  safetyHeatmapConfig: any;
  thermalConfig: any;
  diagnosticConfig: any;
  paramData: Array<{
    id: string;
    name: string;
    value: any;
    unit: string;
    min?: number;
    max?: number;
    optimal_range?: [number, number];
    criticality: 'critical' | 'high' | 'medium' | 'low';
    rationale: string;
    material_interaction?: any;
    damage_threshold?: any;
    relationships?: any;
    [key: string]: any;
  }> | null;
  findParam: (id: string) => any;
}

/**
 * Extract and prepare settings data for components
 * Supports both hybrid format (components.parameter_relationships) 
 * and legacy format (machineSettings.essential_parameters)
 */
export function prepareSettingsData(
  settings: SettingsMetadata,
  materialProperties?: any
): PreparedSettingsData {
  // Extract parameters from hybrid or legacy format
  const parametersRaw = settings.components?.parameter_relationships?.parameters 
    || settings.machineSettings?.essential_parameters;
  
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
      ? Object.entries(settings.machineSettings).map(([key, param]: [string, any]) => ({
          id: key,
          name: param.name || key,
          value: param.value,
          unit: param.unit,
          min: param.min,
          max: param.max,
          criticality: inferCriticality(key),
          rationale: `Operating range: ${param.min}-${param.max} ${param.unit}`,
          material_interaction: null
        })) 
      : null
  );

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
 * Infer criticality level from parameter key
 */
function inferCriticality(key: string): 'critical' | 'high' | 'medium' | 'low' {
  const criticalKeys = ['powerRange', 'energyDensity', 'pulseWidth'];
  return criticalKeys.includes(key) ? 'high' : 'medium';
}
