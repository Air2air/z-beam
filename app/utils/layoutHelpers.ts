// app/utils/layoutHelpers.ts
// Shared utilities for layout data preparation

/**
 * Infer criticality level from parameter key
 */
export function inferCriticality(key: string): 'critical' | 'important' | 'standard' | 'medium' | 'high' | 'low' {
  const lowerKey = key.toLowerCase();
  
  // Critical parameters - directly affect laser safety and substrate integrity
  const criticalKeys = ['power', 'wavelength', 'pulse_duration', 'fluence'];
  if (criticalKeys.some(k => lowerKey.includes(k))) {
    return 'critical';
  }
  
  // Important parameters - significantly affect process quality
  const importantKeys = ['spot_size', 'beam_quality', 'repetition_rate', 'pulse_energy'];
  if (importantKeys.some(k => lowerKey.includes(k))) {
    return 'important';
  }
  
  // Legacy compatibility - map to new values
  const legacyCritical = ['powerRange', 'energyDensity', 'pulseWidth'];
  if (legacyCritical.includes(key)) {
    return 'high';
  }
  
  // Default to standard for unknown parameters
  return 'standard';
}

/**
 * Extract and prepare settings data for components
 * Supports both hybrid format (components.parameter_relationships) 
 * and legacy format (machineSettings.essential_parameters)
 */
export function prepareSettingsData(
  settings: any,
  materialProperties?: any
) {
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
      ? Object.entries(settings.machineSettings)
          .filter(([key]) => !['material_challenges', 'common_issues'].includes(key))
          .map(([key, param]: [string, any]) => {
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

  // Helper function to find parameter by id
  const findParam = (id: string) => {
    if (parametersRaw) {
      if (Array.isArray(parametersRaw)) {
        return parametersRaw.find((p: any) => p.id === id);
      }
      return (parametersRaw as any)[id];
    }
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
 * Convert E-E-A-T citations to regulatory standards format
 */
export function convertCitationsToStandards(metadata: any) {
  const citations = metadata?.eeat?.citations || [];
  const isBasedOn = metadata?.eeat?.isBasedOn;
  
  return citations
    .filter((citation: any) => typeof citation === 'string')
    .map((citation: string) => {
      const parts = citation.split(' - ');
      const name = parts[0]?.trim() || citation;
      const description = parts[1]?.trim() || citation;
      
      return {
        name,
        description,
        longName: name,
        image: `/images/logo/logo-org-${name.toLowerCase().replace(/\s+/g, '-')}.png`,
        url: isBasedOn?.url || '#'
      };
    });
}

/**
 * Generate default material challenges when not provided
 */
export function generateDefaultChallenges(settings: any) {
  if (!settings.machineSettings) return null;
  
  return {
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
  };
}

/**
 * Generate default common issues when not provided
 */
export function generateDefaultIssues(settings: any) {
  if (!settings.machineSettings) return null;
  
  return [
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
  ];
}

/**
 * Get risk color styling based on severity level
 * Supports schema-defined severity levels: critical, high, moderate, medium, low, none
 * @see docs/specs/SAFETY_RISK_SEVERITY_SCHEMA.md
 */
export function getRiskColor(risk: string) {
  switch (risk?.toLowerCase()) {
    case 'high':
    case 'critical':
      return 'text-red-400 bg-red-900/40 border-red-500';
    case 'moderate':
    case 'medium':
      return 'text-yellow-400 bg-yellow-900/40 border-yellow-500';
    case 'low':
      return 'text-green-400 bg-green-900/40 border-green-500';
    case 'none':
      return 'text-gray-400 bg-gray-800/50 border-gray-600';
    default:
      return 'text-gray-400 bg-gray-800/50 border-gray-600';
  }
}

/**
 * Calculate sensible optimal ranges (middle 30% of range) if not explicitly provided
 */
export function getOptimalRange(
  param: any, 
  defaultMin: number, 
  defaultMax: number
): [number, number] {
  if (param?.optimal_range) return param.optimal_range;
  const min = param?.min ?? defaultMin;
  const max = param?.max ?? defaultMax;
  const range = max - min;
  const optMin = min + range * 0.35;
  const optMax = min + range * 0.65;
  return [optMin, optMax];
}

/**
 * Get enrichment metadata from article metadata
 * Extracts title and description from enrichments object
 */
export function getEnrichmentMetadata(
  metadata: any,
  enrichmentKey: string,
  defaultTitle: string,
  defaultDescription: string
): { title: string; description: string } {
  const enrichments = metadata?.enrichments;
  
  if (!enrichments || !enrichments[enrichmentKey]) {
    return {
      title: defaultTitle,
      description: defaultDescription,
    };
  }
  
  const enrichment = enrichments[enrichmentKey];
  
  return {
    title: enrichment.title || defaultTitle,
    description: enrichment.description || defaultDescription,
  };
}
