'use client';

import React, { useState } from 'react';
import { SectionTitle } from '../SectionTitle/SectionTitle';
import { SectionContainer } from '../SectionContainer/SectionContainer';
import { Badge } from '../Badge/Badge';
import Link from 'next/link';
import { 
  FiInfo, 
  FiTrendingUp, 
  FiLayers, 
  FiZap, 
  FiBarChart2,
  FiFilter,
  FiDownload,
  FiCheck,
  FiAlertCircle
} from 'react-icons/fi';

interface ComparisonPageProps {
  data: any;
  category: string;
  subcategory: string;
  materialSlug: string;
}

export function ComparisonPage({ data, category, subcategory, materialSlug }: ComparisonPageProps) {
  const [selectedProperties, setSelectedProperties] = useState<string[]>([
    'density', 'hardness', 'thermal_conductivity', 'laser_absorption'
  ]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(
    data.comparison_materials?.map((m: any) => m.name) || []
  );
  const [viewMode, setViewMode] = useState<'absolute' | 'relative'>('relative');
  
  // Material Suitability Score state
  const [speedWeight, setSpeedWeight] = useState(33);
  const [qualityWeight, setQualityWeight] = useState(33);
  const [costWeight, setCostWeight] = useState(34);

  const granite = data.granite_baseline;
  const materials = data.comparison_materials || [];

  const toggleProperty = (property: string) => {
    setSelectedProperties(prev => 
      prev.includes(property) 
        ? prev.filter(p => p !== property)
        : [...prev, property]
    );
  };

  const toggleMaterial = (material: string) => {
    if (material === granite.name) return; // Can't deselect baseline
    setSelectedMaterials(prev =>
      prev.includes(material)
        ? prev.filter(m => m !== material)
        : [...prev, material]
    );
  };

  // Calculate material suitability scores based on weights
  const calculateSuitabilityScore = (material: any) => {
    // Speed score (0-100): based on scan speed and ease of cleaning
    const speedScore = material.name === granite.name ? 70 :
      material.properties?.laser_absorption?.value > 0.5 ? 85 :
      material.properties?.laser_absorption?.value > 0.4 ? 70 :
      material.properties?.laser_absorption?.value > 0.3 ? 55 : 40;
    
    // Quality score (0-100): based on damage threshold and durability
    const qualityScore = material.name === granite.name ? 90 :
      material.properties?.laser_damage_threshold?.value > 8 ? 95 :
      material.properties?.laser_damage_threshold?.value > 5 ? 80 :
      material.properties?.laser_damage_threshold?.value > 3 ? 60 : 35;
    
    // Cost score (0-100): inverse of power requirements (lower power = better cost)
    const costScore = material.name === granite.name ? 70 :
      material.laser_settings?.power_range?.value < 70 ? 90 :
      material.laser_settings?.power_range?.value < 90 ? 75 :
      material.laser_settings?.power_range?.value < 110 ? 60 : 45;
    
    // Weighted average
    const total = (speedScore * speedWeight + qualityScore * qualityWeight + costScore * costWeight) / 100;
    return Math.round(total);
  };

  return (
    <div className="comparison-page">
      {/* Breadcrumb */}
      {data.breadcrumb && (
        <nav className="mb-8 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 flex-wrap">
            {data.breadcrumb.map((item: any, index: number) => (
              <li key={index} className="flex items-center">
                {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                <Link 
                  href={item.href}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="primary">
            <FiBarChart2 className="w-4 h-4" />
            Material Comparison
          </Badge>
          {data.comparison_version && (
            <Badge variant="secondary">v{data.comparison_version}</Badge>
          )}
        </div>
        
        {data.subtitle && (
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            {data.subtitle}
          </p>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {materials.length + 1}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Materials</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {Object.keys(granite.properties || {}).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Properties</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {Object.keys(granite.laser_settings || {}).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Parameters</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {data.decision_support?.scenarios?.length || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Scenarios</div>
          </div>
        </div>
      </div>

      {/* Filters & Controls */}
      <SectionContainer
        title="Comparison Controls"
        icon={<FiFilter className="w-6 h-6" />}
        bgColor="gray-50"
        horizPadding={true}
        radius={true}
      >
        <div className="space-y-6">
          {/* Property Selector */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
              Properties to Compare
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(granite.properties || {}).map((prop) => (
                <button
                  key={prop}
                  onClick={() => toggleProperty(prop)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    selectedProperties.includes(prop)
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-900 dark:text-blue-200'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                  }`}
                >
                  {selectedProperties.includes(prop) && <FiCheck className="inline w-4 h-4 mr-1" />}
                  {prop.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>

          {/* Material Filter */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
              Materials to Include
            </h3>
            <div className="flex flex-wrap gap-2">
              {/* Baseline (always selected) */}
              <button
                className="px-4 py-2 rounded-lg border-2 bg-blue-600 border-blue-600 text-white cursor-not-allowed"
              >
                <FiCheck className="inline w-4 h-4 mr-1" />
                {granite.name} (Baseline)
              </button>
              
              {materials.map((material: any) => (
                <button
                  key={material.name}
                  onClick={() => toggleMaterial(material.name)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    selectedMaterials.includes(material.name)
                      ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-900 dark:text-green-200'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                  }`}
                >
                  {selectedMaterials.includes(material.name) && <FiCheck className="inline w-4 h-4 mr-1" />}
                  {material.name}
                </button>
              ))}
            </div>
          </div>

          {/* View Mode Toggle */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
              View Mode
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('absolute')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'absolute'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                }`}
              >
                Absolute Values
              </button>
              <button
                onClick={() => setViewMode('relative')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'relative'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                }`}
              >
                Relative to {granite.name}
              </button>
            </div>
          </div>
        </div>
      </SectionContainer>

      {/* Property Comparison Bars - Chart 1 */}
      <SectionContainer
        title="Property Comparison"
        icon={<FiBarChart2 className="w-6 h-6" />}
        bgColor="gray-50"
        horizPadding={true}
        radius={true}
      >
        <div className="space-y-8">
          {selectedProperties.map((propKey) => {
            const graniteProp = granite.properties[propKey];
            if (!graniteProp) return null;

            const allMaterials = [
              { name: granite.name, ...graniteProp, isBaseline: true },
              ...materials
                .filter((m: any) => selectedMaterials.includes(m.name))
                .map((m: any) => ({
                  name: m.name,
                  ...m.properties[propKey],
                  isBaseline: false
                }))
            ];

            const maxValue = Math.max(...allMaterials.map((m: any) => m.value || 0));

            return (
              <div key={propKey} className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
                  {propKey.replace(/_/g, ' ')}
                  {graniteProp.unit && <span className="text-sm font-normal text-gray-500 ml-2">({graniteProp.unit})</span>}
                </h3>
                
                {allMaterials.map((material: any) => {
                  const percentage = (material.value / maxValue) * 100;
                  const vsGranite = material.vs_granite;
                  
                  return (
                    <div key={material.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className={`font-medium ${material.isBaseline ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          {material.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 dark:text-gray-100 font-semibold">
                            {material.value} {material.unit}
                          </span>
                          {vsGranite && viewMode === 'relative' && (
                            <Badge 
                              variant={
                                material.advantage === 'granite' ? 'danger' :
                                material.advantage === 'neutral' ? 'secondary' :
                                'success'
                              }
                              size="sm"
                            >
                              {vsGranite}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all ${
                            material.isBaseline
                              ? 'bg-blue-600 dark:bg-blue-400'
                              : material.advantage === 'granite'
                              ? 'bg-red-500 dark:bg-red-400'
                              : material.advantage === 'neutral'
                              ? 'bg-gray-400 dark:bg-gray-500'
                              : 'bg-green-500 dark:bg-green-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      {material.notes && viewMode === 'relative' && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                          {material.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </SectionContainer>

      {/* Thermal Properties Grouped Bar Chart - Chart 4 */}
      {data.comparison_charts?.thermal_properties_comparison && (
        <SectionContainer
          title="Thermal Properties Impact on Laser Cleaning"
          icon={<FiZap className="w-6 h-6" />}
          bgColor="gray-50"
          horizPadding={true}
          radius={true}
        >
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {data.comparison_charts.thermal_properties_comparison.description}
          </p>
          
          {/* Grouped Bar Chart - All materials side by side for each property */}
          <div className="space-y-12">
            {data.comparison_charts.thermal_properties_comparison.properties?.map((prop: any, propIndex: number) => {
              // Build material data array with proper value extraction
              const allMaterialsData = [
                { name: granite.name, value: prop.granite || 0, isBaseline: true },
                ...data.comparison_materials
                  .filter((m: any) => selectedMaterials.includes(m.name))
                  .map((m: any) => {
                    // The YAML has lowercase material names as keys (e.g., "marble", "steel")
                    const key = m.name.toLowerCase();
                    let value = prop[key] || 0;
                    
                    return {
                      name: m.name,
                      value: value,
                      isBaseline: false
                    };
                  })
              ];
              
              // Find max value for scaling
              let maxValue = Math.max(...allMaterialsData.map((m: any) => m.value || 0), 1); // Ensure at least 1
              
              // Special handling for extreme values
              const hasExtreme = prop.property === 'thermal_conductivity' && maxValue > 100;
              let displayMaxValue = maxValue;
              if (hasExtreme) {
                const filteredValues = allMaterialsData.filter((m: any) => m.value < 100).map((m: any) => m.value);
                displayMaxValue = filteredValues.length > 0 ? Math.max(...filteredValues) : maxValue;
              }
              
              const barColor = propIndex === 0 ? 'purple' : propIndex === 1 ? 'green' : 'orange';
              
              return (
                <div key={propIndex}>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {prop.label}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Unit: {prop.unit}
                    </p>
                  </div>
                  
                  {/* Grouped bars - horizontal layout */}
                  <div className="relative bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-end justify-around gap-2" style={{ height: '320px' }}>
                      {allMaterialsData.map((material: any) => {
                        const isExtreme = hasExtreme && material.value > 100;
                        const heightPercent = isExtreme ? 100 : (material.value / displayMaxValue) * 100;
                        // Convert percentage to pixels for proper display
                        const heightPx = (heightPercent / 100) * 280; // 280px max height (320 - padding for labels)
                        
                        return (
                          <div key={material.name} className="flex flex-col items-center flex-1 min-w-0">
                            {/* Value label on top */}
                            <div className="text-xs font-bold text-gray-900 dark:text-gray-100 mb-1 text-center">
                              {material.value}
                              {isExtreme && (
                                <div className="text-[10px] text-orange-600 dark:text-orange-400">⚠️ Extreme</div>
                              )}
                            </div>
                            
                            {/* Bar */}
                            <div className="relative w-full h-full flex items-end">
                              <div 
                                className={`w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer ${
                                  material.isBaseline
                                    ? 'bg-blue-600 dark:bg-blue-500'
                                    : barColor === 'purple'
                                    ? 'bg-purple-500 dark:bg-purple-400'
                                    : barColor === 'green'
                                    ? 'bg-green-500 dark:bg-green-400'
                                    : 'bg-orange-500 dark:bg-orange-400'
                                } ${material.isBaseline ? 'border-2 border-blue-800 dark:border-blue-300' : ''}`}
                                style={{ 
                                  height: `${Math.max(heightPx, 4)}px`
                                }}
                              />
                            </div>
                            
                            {/* Material name label */}
                            <div className={`text-xs font-medium text-center mt-2 px-1 break-words ${
                              material.isBaseline 
                                ? 'text-blue-600 dark:text-blue-400 font-bold' 
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {material.name}
                              {material.isBaseline && (
                                <div className="text-[9px] text-blue-500 dark:text-blue-400">BASELINE</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Interpretation */}
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <FiInfo className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-900 dark:text-blue-200">
                        <strong>Interpretation:</strong> {prop.interpretation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionContainer>
      )}

      {/* Laser Parameter Matrix - Chart 4 */}
      {data.comparison_charts?.laser_parameters_heatmap && (
        <SectionContainer
          title="Laser Parameter Requirements"
          icon={<FiZap className="w-6 h-6" />}
          bgColor="gray-50"
          horizPadding={true}
          radius={true}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="p-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                    Material
                  </th>
                  <th className="p-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                    Power (W)
                  </th>
                  <th className="p-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                    Fluence (J/cm²)
                  </th>
                  <th className="p-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                    Speed (mm/s)
                  </th>
                  <th className="p-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                    Wavelength
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Baseline */}
                <tr className="bg-blue-50 dark:bg-blue-900/20">
                  <td className="p-3 font-semibold text-blue-900 dark:text-blue-200 border border-gray-300 dark:border-gray-600">
                    {granite.name}
                  </td>
                  <td className="p-3 text-center border border-gray-300 dark:border-gray-600">
                    <div className="font-bold text-gray-900 dark:text-gray-100">
                      {granite.laser_settings?.power_range?.value}
                    </div>
                    <div className="text-xs text-gray-500">
                      {granite.laser_settings?.power_range?.min}-{granite.laser_settings?.power_range?.max}
                    </div>
                  </td>
                  <td className="p-3 text-center font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                    {granite.laser_settings?.fluence?.value}
                  </td>
                  <td className="p-3 text-center font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                    {granite.laser_settings?.scan_speed?.value}
                  </td>
                  <td className="p-3 text-center text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                    {granite.laser_settings?.wavelength?.primary}nm
                  </td>
                </tr>
                
                {/* Comparison Materials */}
                {materials
                  .filter((m: any) => selectedMaterials.includes(m.name))
                  .map((material: any) => {
                    const powerDiff = material.laser_settings?.power_range?.vs_granite;
                    const fluenceDiff = material.laser_settings?.fluence?.vs_granite;
                    
                    return (
                      <tr key={material.name} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="p-3 font-medium text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                          {material.name}
                        </td>
                        <td className="p-3 text-center border border-gray-300 dark:border-gray-600">
                          <div className="font-bold text-gray-900 dark:text-gray-100">
                            {material.laser_settings?.power_range?.value}
                          </div>
                          {powerDiff && (
                            <div className={`text-xs ${
                              powerDiff.includes('-') ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {powerDiff}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-center border border-gray-300 dark:border-gray-600">
                          <div className="font-bold text-gray-900 dark:text-gray-100">
                            {material.laser_settings?.fluence?.value}
                          </div>
                          {fluenceDiff && (
                            <div className={`text-xs ${
                              fluenceDiff.includes('-') ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {fluenceDiff}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-center font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                          {material.laser_settings?.scan_speed?.value}
                        </td>
                        <td className="p-3 text-center text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                          {material.laser_settings?.wavelength?.primary || 
                           material.laser_settings?.wavelength_preference ||
                           '1064'}nm
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          
          {/* Legend */}
          <div className="mt-6 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Lower power/fluence needed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Higher power/fluence needed</span>
            </div>
          </div>
        </SectionContainer>
      )}

      {/* Material Suitability Score Timeline */}
      <SectionContainer
        title="Material Suitability Score Calculator"
        icon={<FiTrendingUp className="w-6 h-6" />}
        bgColor="gray-50"
        horizPadding={true}
        radius={true}
      >
        <div className="space-y-6">
          {/* Weight Sliders */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Adjust Priority Factors
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Move the sliders to weight factors based on your application needs. Scores update in real-time.
            </p>
            
            <div className="space-y-6">
              {/* Speed Weight */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Processing Speed Priority
                  </label>
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {speedWeight}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={speedWeight}
                  onChange={(e) => {
                    const newSpeed = parseInt(e.target.value);
                    const remaining = 100 - newSpeed;
                    setSpeedWeight(newSpeed);
                    // Distribute remaining between quality and cost proportionally
                    const currentQualityCostTotal = qualityWeight + costWeight;
                    if (currentQualityCostTotal > 0) {
                      const qualityRatio = qualityWeight / currentQualityCostTotal;
                      setQualityWeight(Math.round(remaining * qualityRatio));
                      setCostWeight(remaining - Math.round(remaining * qualityRatio));
                    } else {
                      setQualityWeight(Math.round(remaining / 2));
                      setCostWeight(remaining - Math.round(remaining / 2));
                    }
                  }}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Higher = Faster cleaning time more important
                </p>
              </div>

              {/* Quality Weight */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Result Quality Priority
                  </label>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {qualityWeight}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={qualityWeight}
                  onChange={(e) => {
                    const newQuality = parseInt(e.target.value);
                    const remaining = 100 - newQuality;
                    setQualityWeight(newQuality);
                    const currentSpeedCostTotal = speedWeight + costWeight;
                    if (currentSpeedCostTotal > 0) {
                      const speedRatio = speedWeight / currentSpeedCostTotal;
                      setSpeedWeight(Math.round(remaining * speedRatio));
                      setCostWeight(remaining - Math.round(remaining * speedRatio));
                    } else {
                      setSpeedWeight(Math.round(remaining / 2));
                      setCostWeight(remaining - Math.round(remaining / 2));
                    }
                  }}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Higher = Surface quality and durability more important
                </p>
              </div>

              {/* Cost Weight */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Operating Cost Priority
                  </label>
                  <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {costWeight}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={costWeight}
                  onChange={(e) => {
                    const newCost = parseInt(e.target.value);
                    const remaining = 100 - newCost;
                    setCostWeight(newCost);
                    const currentSpeedQualityTotal = speedWeight + qualityWeight;
                    if (currentSpeedQualityTotal > 0) {
                      const speedRatio = speedWeight / currentSpeedQualityTotal;
                      setSpeedWeight(Math.round(remaining * speedRatio));
                      setQualityWeight(remaining - Math.round(remaining * speedRatio));
                    } else {
                      setSpeedWeight(Math.round(remaining / 2));
                      setQualityWeight(remaining - Math.round(remaining / 2));
                    }
                  }}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-600"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Higher = Energy efficiency and power consumption more important
                </p>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Quick Presets:
              </h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSpeedWeight(33);
                    setQualityWeight(33);
                    setCostWeight(34);
                  }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium transition-colors"
                >
                  Balanced
                </button>
                <button
                  onClick={() => {
                    setSpeedWeight(60);
                    setQualityWeight(25);
                    setCostWeight(15);
                  }}
                  className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 text-sm font-medium transition-colors"
                >
                  Speed Focus
                </button>
                <button
                  onClick={() => {
                    setSpeedWeight(15);
                    setQualityWeight(70);
                    setCostWeight(15);
                  }}
                  className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 text-sm font-medium transition-colors"
                >
                  Quality Focus
                </button>
                <button
                  onClick={() => {
                    setSpeedWeight(15);
                    setQualityWeight(20);
                    setCostWeight(65);
                  }}
                  className="px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 text-sm font-medium transition-colors"
                >
                  Cost Focus
                </button>
              </div>
            </div>
          </div>

          {/* Score Results */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Material Rankings (Based on Your Priorities)
            </h3>
            
            <div className="space-y-3">
              {[
                { name: granite.name, ...granite, isBaseline: true },
                ...materials.filter((m: any) => selectedMaterials.includes(m.name))
              ]
                .map(material => ({
                  ...material,
                  score: calculateSuitabilityScore(material)
                }))
                .sort((a, b) => b.score - a.score)
                .map((material, index) => {
                  const rankColors = [
                    'bg-gradient-to-r from-yellow-400 to-yellow-500 border-yellow-500',
                    'bg-gradient-to-r from-gray-300 to-gray-400 border-gray-400',
                    'bg-gradient-to-r from-orange-400 to-orange-500 border-orange-500',
                  ];
                  const rankColor = index < 3 ? rankColors[index] : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600';
                  
                  return (
                    <div
                      key={material.name}
                      className={`p-4 rounded-lg border-2 ${rankColor} ${
                        material.isBaseline ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`text-3xl font-bold ${
                            index === 0 ? 'text-yellow-900 dark:text-yellow-100' :
                            index === 1 ? 'text-gray-700 dark:text-gray-200' :
                            index === 2 ? 'text-orange-900 dark:text-orange-100' :
                            'text-gray-600 dark:text-gray-400'
                          }`}>
                            #{index + 1}
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                              {material.name}
                              {material.isBaseline && (
                                <Badge variant="primary" size="sm">BASELINE</Badge>
                              )}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {material.category} • {material.subcategory}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                            {material.score}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Suitability Score
                          </div>
                        </div>
                      </div>
                      
                      {/* Score breakdown bar */}
                      <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                        <div 
                          className="bg-purple-500"
                          style={{ width: `${speedWeight}%` }}
                          title={`Speed: ${speedWeight}%`}
                        />
                        <div 
                          className="bg-green-500"
                          style={{ width: `${qualityWeight}%` }}
                          title={`Quality: ${qualityWeight}%`}
                        />
                        <div 
                          className="bg-orange-500"
                          style={{ width: `${costWeight}%` }}
                          title={`Cost: ${costWeight}%`}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Interpretation Guide */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <FiInfo className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200">
                  How to Use This Tool:
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• <strong>Speed Priority</strong>: Higher scores favor materials with better laser absorption and faster processing</li>
                  <li>• <strong>Quality Priority</strong>: Higher scores favor materials with high damage thresholds and durability</li>
                  <li>• <strong>Cost Priority</strong>: Higher scores favor materials requiring lower power settings (less energy consumption)</li>
                  <li>• Rankings update instantly as you adjust the sliders</li>
                  <li>• Use quick presets for common scenarios or fine-tune manually</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </SectionContainer>

      {/* FAQ Section */}
      {data.faq && data.faq.length > 0 && (
        <SectionContainer
          title="Frequently Asked Questions"
          bgColor="transparent"
          horizPadding={true}
          radius={true}
        >
          <div className="space-y-6">
            {data.faq.map((item: any, index: number) => (
              <div 
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {item.question}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </SectionContainer>
      )}
    </div>
  );
}
