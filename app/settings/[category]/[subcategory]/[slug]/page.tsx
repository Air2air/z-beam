// app/settings/[category]/[subcategory]/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getAllCategories } from '@/app/utils/materialCategories';
import { getSettingsArticle, getArticleBySlug } from '@/app/utils/contentAPI';
import { Layout } from '@/app/components/Layout/Layout';
import { SettingsJsonLD } from '@/app/components/JsonLD/SettingsJsonLD';
import { SectionContainer } from '@/app/components/SectionContainer/SectionContainer';
import { ChallengeSeverityMatrix } from '@/app/components/ChallengeSeverityMatrix/ChallengeSeverityMatrix';
import { MaterialSafetyHeatmap, ProcessEffectivenessHeatmap } from '@/app/components/Heatmap';
import { ParameterRelationships } from '@/app/components/ParameterRelationships/ParameterRelationships';
import { ThermalAccumulationSimulator } from '@/app/components/ThermalAccumulationSimulator/ThermalAccumulationSimulator';
import { OverlapPatternVisualizer } from '@/app/components/OverlapPatternVisualizer/OverlapPatternVisualizer';

interface SettingsPageProps {
  params: Promise<{
    category: string;
    subcategory: string;
    slug: string;
  }>;
}

/**
 * Generate static paths for all settings pages (mirrors materials taxonomy)
 */
export async function generateStaticParams() {
  const categories = await getAllCategories();
  
  return categories.flatMap((cat) =>
    cat.subcategories.flatMap((subcat) =>
      subcat.materials.map((material) => ({
        category: cat.slug,
        subcategory: subcat.slug,
        slug: material.slug,
      }))
    )
  );
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: SettingsPageProps) {
  const { slug } = await params;
  const settings = await getSettingsArticle(`${slug}-laser-cleaning`);

  if (!settings) {
    return {
      title: 'Settings Not Found',
      description: 'Machine settings page not found.',
    };
  }

  return {
    title: settings.seo_settings_page?.title || settings.title,
    description: settings.seo_settings_page?.description || settings.description,
    keywords: settings.seo_settings_page?.keywords?.join(', '),
  };
}

/**
 * Settings page component
 */
export default async function SettingsPage({ params }: SettingsPageProps) {
  const { category, subcategory, slug } = await params;
  const settingsSlug = `${slug}-laser-cleaning`;
  const settings = await getSettingsArticle(settingsSlug);

  if (!settings) {
    notFound();
  }

  // Load material properties from frontmatter for data interpolation
  const materialArticle = await getArticleBySlug(`materials/${category}/${subcategory}/${settingsSlug}`) as any;
  const materialProps = materialArticle?.materialProperties;

  // Prepare metadata for Layout (no components - we'll use children instead)
  const metadata = {
    name: settings.name,
    title: settings.title,
    subtitle: settings.subtitle,
    description: settings.description,
    author: settings.author,
    slug: settingsSlug,
    category,
    subcategory,
  };

  return (
    <>
      {/* Schema.org JSON-LD */}
      <SettingsJsonLD 
        settings={settings} 
        category={category}
        subcategory={subcategory}
        slug={settingsSlug}
      />

      {/* Layout handles: Nav, Title, Footer */}
      <Layout 
        metadata={metadata}
        slug={settingsSlug}
      >
        {/* Settings page content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          
          {/* Parameter Interaction Network - Physics-Based Dependencies */}
          {settings.machineSettings?.essential_parameters && (
            <ParameterRelationships 
                parameters={Object.entries(settings.machineSettings.essential_parameters).map(([key, param]) => ({
                  id: key,
                  name: key,
                  value: param.value,
                  unit: param.unit,
                  criticality: param.criticality as 'critical' | 'high' | 'medium' | 'low',
                  rationale: param.rationale,
                  material_interaction: param.material_interaction
                }))}
                materialName={settings.name}
              />
          )}

          {/* Material Safety & Process Effectiveness - Dual Heatmaps */}
          {settings.machineSettings?.essential_parameters?.powerRange && 
           settings.machineSettings?.essential_parameters?.pulseWidth && (
            <>
              {/* Material Safety Heatmap - Damage Risk Only */}
              <div className="mb-8">
                <MaterialSafetyHeatmap 
                  materialName={settings.name}
                  powerRange={{
                    min: settings.machineSettings.essential_parameters.powerRange.min,
                    max: settings.machineSettings.essential_parameters.powerRange.max,
                    current: settings.machineSettings.essential_parameters.powerRange.value,
                  }}
                  pulseRange={{
                    min: settings.machineSettings.essential_parameters.pulseWidth.min,
                    max: settings.machineSettings.essential_parameters.pulseWidth.max,
                    current: settings.machineSettings.essential_parameters.pulseWidth.value,
                  }}
                  optimalPower={settings.machineSettings.essential_parameters.powerRange.optimal_range || [
                    settings.machineSettings.essential_parameters.powerRange.min,
                    settings.machineSettings.essential_parameters.powerRange.max
                  ]}
                  optimalPulse={settings.machineSettings.essential_parameters.pulseWidth.optimal_range || [
                    settings.machineSettings.essential_parameters.pulseWidth.min,
                    settings.machineSettings.essential_parameters.pulseWidth.max
                  ]}
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

              {/* Process Effectiveness Heatmap - Cleaning Performance Only */}
              <div className="mb-8">
                <ProcessEffectivenessHeatmap 
                  materialName={settings.name}
                  powerRange={{
                    min: settings.machineSettings.essential_parameters.powerRange.min,
                    max: settings.machineSettings.essential_parameters.powerRange.max,
                    current: settings.machineSettings.essential_parameters.powerRange.value,
                  }}
                  pulseRange={{
                    min: settings.machineSettings.essential_parameters.pulseWidth.min,
                    max: settings.machineSettings.essential_parameters.pulseWidth.max,
                    current: settings.machineSettings.essential_parameters.pulseWidth.value,
                  }}
                  optimalPower={settings.machineSettings.essential_parameters.powerRange.optimal_range || [
                    settings.machineSettings.essential_parameters.powerRange.min,
                    settings.machineSettings.essential_parameters.powerRange.max
                  ]}
                  optimalPulse={settings.machineSettings.essential_parameters.pulseWidth.optimal_range || [
                    settings.machineSettings.essential_parameters.pulseWidth.min,
                    settings.machineSettings.essential_parameters.pulseWidth.max
                  ]}
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
            </>
          )}

          {/* Thermal Accumulation Simulator - Multi-Pass Heat Buildup */}
          {settings.machineSettings?.essential_parameters?.powerRange &&
           settings.machineSettings?.essential_parameters?.repetitionRate &&
           settings.machineSettings?.essential_parameters?.scanSpeed &&
           settings.machineSettings?.essential_parameters?.passCount && (
            <ThermalAccumulationSimulator 
                power={settings.machineSettings.essential_parameters.powerRange.value}
                repRate={settings.machineSettings.essential_parameters.repetitionRate.value}
                scanSpeed={settings.machineSettings.essential_parameters.scanSpeed.value}
                passCount={settings.machineSettings.essential_parameters.passCount.value}
              />
          )}

          {/* Overlap Pattern Visualizer - Scan Geometry */}
          {settings.machineSettings?.essential_parameters?.spotSize &&
           settings.machineSettings?.essential_parameters?.scanSpeed &&
           settings.machineSettings?.essential_parameters?.repetitionRate &&
           settings.machineSettings?.essential_parameters?.overlapRatio && (
            <OverlapPatternVisualizer 
                spotSize={settings.machineSettings.essential_parameters.spotSize.value}
                scanSpeed={settings.machineSettings.essential_parameters.scanSpeed.value}
                repRate={settings.machineSettings.essential_parameters.repetitionRate.value}
                overlapRatio={settings.machineSettings.essential_parameters.overlapRatio.value}
              />
          )}

          {/* Material Challenges - Enhanced Visual Display */}
          {settings.machineSettings?.material_challenges && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-3">Material-Specific Challenges</h2>
              <p className="text-gray-400 text-sm mb-4">
                Common issues and their solutions when working with {settings.name.toLowerCase()}
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(settings.machineSettings.material_challenges).map(([category, challenges]: [string, any]) => (
                  <div key={category} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                    {/* Category Header with Icon */}
                    <div className="bg-gray-900/50 px-4 py-2 border-b border-gray-700">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <span className="text-blue-400">
                          {category === 'surface_contamination' && '🧹'}
                          {category === 'thermal_effects' && '🌡️'}
                          {category === 'mechanical_stress' && '⚙️'}
                          {category === 'optical_issues' && '👁️'}
                        </span>
                        <span className="capitalize">{category.replace(/_/g, ' ')}</span>
                      </h3>
                    </div>
                    
                    {/* Challenges List */}
                    <div className="p-3 space-y-2">
                      {Array.isArray(challenges) && challenges.map((challenge, idx) => (
                        <details key={idx} className="group bg-gray-800 rounded border border-gray-700 hover:border-gray-600 transition-colors">
                          <summary className="cursor-pointer p-2 flex items-center gap-2 select-none">
                            {/* Severity Indicator - Visual Dot */}
                            <span className={`flex-shrink-0 w-2 h-2 rounded-full ${
                              challenge.severity === 'critical' ? 'bg-red-500 shadow-lg shadow-red-500/50' :
                              challenge.severity === 'high' ? 'bg-orange-500 shadow-lg shadow-orange-500/50' :
                              challenge.severity === 'medium' ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' :
                              'bg-green-500 shadow-lg shadow-green-500/50'
                            }`} />
                            
                            {/* Challenge Title */}
                            <h4 className="font-semibold text-sm text-white flex-1 group-hover:text-blue-300 transition-colors">
                              {challenge.challenge}
                            </h4>
                            
                            {/* Expand Icon */}
                            <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </summary>
                          
                          {/* Expanded Content */}
                          <div className="px-3 pb-2 space-y-2 border-t border-gray-700/50 pt-2 mt-1">
                            {/* Impact */}
                            <div className="bg-red-900/10 border-l-2 border-red-500 pl-2 py-1">
                              <p className="text-xs text-gray-300">
                                <span className="font-semibold text-red-400">Impact:</span> {challenge.impact}
                              </p>
                            </div>
                            
                            {/* Solutions */}
                            <div className="bg-green-900/10 border-l-2 border-green-500 pl-2 py-1">
                              <p className="text-xs font-semibold text-green-400 mb-1">Solutions:</p>
                              <ul className="space-y-0.5">
                                {challenge.solutions.map((solution: string, sidx: number) => (
                                  <li key={sidx} className="text-xs text-gray-300 flex items-start gap-1">
                                    <span className="text-green-400 mt-0.5">✓</span>
                                    <span>{solution}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            {/* Prevention */}
                            <div className="bg-blue-900/10 border-l-2 border-blue-500 pl-2 py-1">
                              <p className="text-xs text-gray-300">
                                <span className="font-semibold text-blue-400">Prevention:</span> {challenge.prevention}
                              </p>
                            </div>
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Troubleshooting Guide - Enhanced Decision Tree Style */}
          {settings.machineSettings?.common_issues && settings.machineSettings.common_issues.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-3">Troubleshooting Guide</h2>
              <p className="text-gray-400 text-sm mb-4">
                Common symptoms and their diagnostic pathways
              </p>
              
              <div className="space-y-3">
                {settings.machineSettings.common_issues.map((issue, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg overflow-hidden border border-gray-700">
                    {/* Symptom Header - Prominent Display */}
                    <div className="bg-gradient-to-r from-red-900/30 to-transparent px-4 py-3 border-l-4 border-red-500">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-white mb-1">
                            {issue.symptom}
                          </h3>
                          <div className="text-xs text-gray-400">Issue #{idx + 1} • Common Problem</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Diagnostic Flow */}
                    <div className="p-4 space-y-3">
                      {/* Possible Causes - With Icons */}
                      <div className="bg-orange-900/10 rounded-lg p-3 border border-orange-900/30">
                        <h4 className="text-sm font-semibold text-orange-400 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Possible Causes
                        </h4>
                        <ul className="space-y-1">
                          {issue.causes.map((cause: string, cidx: number) => (
                            <li key={cidx} className="text-xs text-gray-300 flex items-start gap-2">
                              <span className="text-orange-400 font-bold mt-0.5">{cidx + 1}.</span>
                              <span>{cause}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Solutions - Action Steps */}
                      <div className="bg-green-900/10 rounded-lg p-3 border border-green-900/30">
                        <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Solution Steps
                        </h4>
                        <ol className="space-y-1.5">
                          {issue.solutions.map((solution: string, sidx: number) => (
                            <li key={sidx} className="text-xs text-gray-300 flex items-start gap-2">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center text-green-400 font-semibold text-[10px]">
                                {sidx + 1}
                              </span>
                              <span className="flex-1 pt-0.5">{solution}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      
                      {/* Verification & Prevention - Side by Side */}
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="bg-blue-900/10 rounded-lg p-3 border border-blue-900/30">
                          <h4 className="text-sm font-semibold text-blue-400 mb-1.5 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            Verify Fix
                          </h4>
                          <p className="text-xs text-gray-300">{issue.verification}</p>
                        </div>
                        
                        <div className="bg-purple-900/10 rounded-lg p-3 border border-purple-900/30">
                          <h4 className="text-sm font-semibold text-purple-400 mb-1.5 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Prevention
                          </h4>
                          <p className="text-xs text-gray-300">{issue.prevention}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </Layout>
    </>
  );
}
