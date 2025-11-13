'use client';

import React, { useState } from 'react';
import { SectionTitle } from '../SectionTitle/SectionTitle';
import { SectionContainer } from '../SectionContainer/SectionContainer';
import { Badge } from '../Badge/Badge';
import { PropertyBars } from '../PropertyBars/PropertyBars';
import Link from 'next/link';
import { 
  InfoIcon, 
  TrendingUpIcon, 
  LayersIcon, 
  ZapIcon, 
  BarChartIcon,
  FilterIcon,
  DownloadIcon,
  CheckCircleIcon,
  AlertCircleIcon
} from '@/app/components/Buttons';

interface ComparisonPageProps {
  data: any;
  category: string;
  subcategory: string;
  materialSlug: string;
}

export function ComparisonPage({ data, category, subcategory, materialSlug }: ComparisonPageProps) {
  const [selectedProperties, setSelectedProperties] = useState<string[]>([
    'density', 'hardness', 'thermal_conductivity', 'specific_heat', 'thermal_expansion', 'laser_absorption'
  ]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(
    data.comparison_materials?.map((m: any) => m.name) || []
  );
  const [viewMode, setViewMode] = useState<'absolute' | 'relative'>('relative');
  
  // Material Suitability Score state
  const [speedWeight, setSpeedWeight] = useState(33);
  const [qualityWeight, setQualityWeight] = useState(33);
  const [costWeight, setCostWeight] = useState(34);
  
  // Tooltip state
  const [hoveredBar, setHoveredBar] = useState<{material: string, property: string, value: string, x: number, y: number} | null>(null);

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
            <BarChartIcon className="w-4 h-4" />
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
        icon={<FilterIcon className="w-6 h-6" />}
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
                  {selectedProperties.includes(prop) && <CheckCircleIcon className="inline w-4 h-4 mr-1" />}
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
                <CheckCircleIcon className="inline w-4 h-4 mr-1" />
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
                  {selectedMaterials.includes(material.name) && <CheckCircleIcon className="inline w-4 h-4 mr-1" />}
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

      {/* Grouped Property Comparison - Works with ALL selected properties */}
      {selectedProperties.length > 0 && (
        <SectionContainer
          title="Grouped Property Comparison"
          icon={<BarChartIcon className="w-6 h-6" />}
          bgColor="gray-50"
          horizPadding={true}
          radius={true}
        >
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Compare multiple properties side-by-side for each material. Each material shows bars for all selected properties.
          </p>
          
          {/* Grouped bars - All selected materials with multiple properties per material */}
          <div className="relative bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Tooltip */}
            {hoveredBar && (
              <div 
                className="absolute z-50 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none"
                style={{ 
                  left: `${hoveredBar.x}px`, 
                  top: `${hoveredBar.y}px`,
                  transform: 'translate(-50%, -100%)',
                  marginTop: '-8px'
                }}
              >
                <div className="font-semibold">{hoveredBar.material}</div>
                <div className="text-xs">{hoveredBar.property}</div>
                <div className="text-xs font-bold">{hoveredBar.value}</div>
              </div>
            )}
            
            <div className="flex items-end justify-around gap-8" style={{ height: '280px' }}>
              {/* Baseline Material */}
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div className="relative w-full h-full flex items-end justify-center gap-0.5">
                  {selectedProperties.map((propKey, propIndex) => {
                    const propData = granite.properties?.[propKey];
                    if (!propData) return null;
                    
                    const value = propData.value || 0;
                    
                    let normalizedHeight, heightPx;
                    
                    if (viewMode === 'relative') {
                      // Relative mode: Baseline is always 100% (full height)
                      normalizedHeight = 100;
                      heightPx = 200;
                    } else {
                      // Absolute mode: Use percentile for display
                      normalizedHeight = propData.percentile || 50;
                      heightPx = (normalizedHeight / 100) * 200;
                    }
                    
                    // Cycle through colors
                    const colors = ['purple', 'green', 'orange', 'blue', 'red', 'yellow', 'pink', 'indigo'];
                    const barColor = colors[propIndex % colors.length];
                    const colorClass = barColor === 'purple' ? 'bg-purple-600 dark:bg-purple-500' :
                                      barColor === 'green' ? 'bg-green-600 dark:bg-green-500' :
                                      barColor === 'orange' ? 'bg-orange-600 dark:bg-orange-500' :
                                      barColor === 'blue' ? 'bg-blue-600 dark:bg-blue-500' :
                                      barColor === 'red' ? 'bg-red-600 dark:bg-red-500' :
                                      barColor === 'yellow' ? 'bg-yellow-600 dark:bg-yellow-500' :
                                      barColor === 'pink' ? 'bg-pink-600 dark:bg-pink-500' :
                                      'bg-indigo-600 dark:bg-indigo-500';
                      
                    return (
                      <div key={propKey} className="flex flex-col items-center flex-1">
                        <div 
                          className={`w-full rounded-lg transition-all hover:opacity-80 cursor-pointer border-2 border-blue-800 dark:border-blue-300 ${colorClass}`}
                          style={{ height: `${Math.max(heightPx, 4)}px`, minWidth: '6px', maxWidth: '12px' }}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const containerRect = e.currentTarget.closest('.relative.bg-white')?.getBoundingClientRect();
                            if (containerRect) {
                              setHoveredBar({
                                material: granite.name,
                                property: propKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                                value: `${value}${propData.unit && propData.unit !== 'dimensionless' ? ` ${propData.unit}` : ''}`,
                                x: rect.left + rect.width / 2 - containerRect.left,
                                y: rect.top - containerRect.top
                              });
                            }
                          }}
                          onMouseLeave={() => setHoveredBar(null)}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="text-sm font-bold text-center mt-2 px-1 break-words text-blue-600 dark:text-blue-400">
                  {granite.name}
                </div>
              </div>

              {/* Comparison Materials */}
              {data.comparison_materials
                .filter((m: any) => selectedMaterials.includes(m.name))
                .map((material: any) => (
                  <div key={material.name} className="flex flex-col items-center flex-1 min-w-0">
                    <div className="relative w-full h-full flex items-end justify-center gap-0.5">
                      {selectedProperties.map((propKey, propIndex) => {
                        const propData = material.properties?.[propKey];
                        const baselineData = granite.properties?.[propKey];
                        if (!propData || !baselineData) return null;
                        
                        const value = propData.value || 0;
                        const baselineValue = baselineData.value || 1;
                        
                        let normalizedHeight: number, heightPx: number, relativePercent: number | undefined;
                        
                        if (viewMode === 'relative') {
                          // Relative mode: Calculate height as percentage of baseline (capped at 0-150%)
                          relativePercent = Math.min(Math.max((value / baselineValue) * 100, 0), 150);
                          // Then normalize to 0-100 for display (150% baseline = 100% height)
                          normalizedHeight = (relativePercent / 150) * 100;
                          heightPx = (normalizedHeight / 100) * 200;
                        } else {
                          // Absolute mode: Use percentile if available, otherwise calculate from all values
                          if (propData.percentile) {
                            normalizedHeight = propData.percentile;
                          } else {
                            // Fallback: use same relative calculation but show as absolute
                            relativePercent = (value / baselineValue) * 100;
                            normalizedHeight = Math.min(Math.max(relativePercent, 0), 100);
                          }
                          heightPx = (normalizedHeight / 100) * 200;
                        }
                        
                        // Cycle through colors (same as baseline)
                        const colors = ['purple', 'green', 'orange', 'blue', 'red', 'yellow', 'pink', 'indigo'];
                        const barColor = colors[propIndex % colors.length];
                        const colorClass = barColor === 'purple' ? 'bg-purple-500 dark:bg-purple-400' :
                                          barColor === 'green' ? 'bg-green-500 dark:bg-green-400' :
                                          barColor === 'orange' ? 'bg-orange-500 dark:bg-orange-400' :
                                          barColor === 'blue' ? 'bg-blue-500 dark:bg-blue-400' :
                                          barColor === 'red' ? 'bg-red-500 dark:bg-red-400' :
                                          barColor === 'yellow' ? 'bg-yellow-500 dark:bg-yellow-400' :
                                          barColor === 'pink' ? 'bg-pink-500 dark:bg-pink-400' :
                                          'bg-indigo-500 dark:bg-indigo-400';
                        
                        return (
                          <div key={propKey} className="flex flex-col items-center flex-1">
                            <div 
                              className={`w-full rounded-lg transition-all hover:opacity-80 cursor-pointer ${colorClass}`}
                              style={{ height: `${Math.max(heightPx, 4)}px`, minWidth: '6px', maxWidth: '12px' }}
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const containerRect = e.currentTarget.closest('.relative.bg-white')?.getBoundingClientRect();
                                if (containerRect) {
                                  setHoveredBar({
                                    material: material.name,
                                    property: propKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                                    value: `${value}${propData.unit && propData.unit !== 'dimensionless' ? ` ${propData.unit}` : ''}${viewMode === 'relative' && relativePercent ? ` (${relativePercent.toFixed(0)}% of baseline)` : ''}`,
                                    x: rect.left + rect.width / 2 - containerRect.left,
                                    y: rect.top - containerRect.top
                                  });
                                }
                              }}
                              onMouseLeave={() => setHoveredBar(null)}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-sm font-medium text-center mt-2 px-1 break-words text-gray-700 dark:text-gray-300">
                      {material.name}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Legend - Dynamic based on selected properties */}
          <div className="mt-6 flex items-center justify-center flex-wrap gap-4 text-sm">
            {selectedProperties.map((propKey, propIndex) => {
              const colors = ['purple', 'green', 'orange', 'blue', 'red', 'yellow', 'pink', 'indigo'];
              const barColor = colors[propIndex % colors.length];
              const bgClass = barColor === 'purple' ? 'bg-purple-500' :
                            barColor === 'green' ? 'bg-green-500' :
                            barColor === 'orange' ? 'bg-orange-500' :
                            barColor === 'blue' ? 'bg-blue-500' :
                            barColor === 'red' ? 'bg-red-500' :
                            barColor === 'yellow' ? 'bg-yellow-500' :
                            barColor === 'pink' ? 'bg-pink-500' :
                            'bg-indigo-500';
              
              return (
                <div key={propKey} className="flex items-center gap-2">
                  <div className={`w-4 h-4 ${bgClass} rounded`}></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {propKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
              );
            })}
          </div>
        </SectionContainer>
      )}

      {/* Laser Parameter Matrix */}
      {data.comparison_charts?.laser_parameters_heatmap && (
        <SectionContainer
          title="Laser Parameter Requirements"
          icon={<ZapIcon className="w-6 h-6" />}
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
        icon={<TrendingUpIcon className="w-6 h-6" />}
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
              <InfoIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
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

      {/* Visualization Evolution Proposal */}
      <SectionContainer
        title="Future Enhancement: Replace MetricsCards with Grouped Charts"
        bgColor="transparent"
        horizPadding={true}
        radius={true}
      >
        <div className="space-y-8">
          {/* Introduction */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-start gap-4">
              <LayersIcon className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-200 mb-3">
                  Proposal: System-Wide Adoption of Grouped Property Charts
                </h3>
                <p className="text-purple-800 dark:text-purple-300 leading-relaxed mb-4">
                  The grouped bar charts above demonstrate a more powerful way to visualize material properties 
                  compared to the traditional MetricsCard grid system. This proposal outlines how we could extend 
                  this visualization approach across all material pages.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">68%</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">Space Savings</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">640px → 200px height</div>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">Native</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">Comparison</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Multi-material in one view</div>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">2× More</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">Interactive</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Tooltips, filters, modes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current vs Proposed Comparison */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Current State */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <BarChartIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                Current: MetricsCard Grid
              </h4>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">▸</span>
                  <span><strong>5 cards</strong> = 640px vertical space</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">▸</span>
                  <span>Single material view only</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">▸</span>
                  <span>Limited interactivity (progress bars)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">▸</span>
                  <span>2-5 column responsive grid</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">▸</span>
                  <span>Category-based organization</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">▸</span>
                  <span>Good for: dashboards, widgets, single-material focus</span>
                </div>
              </div>
            </div>

            {/* Proposed State */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4 flex items-center gap-2">
                <TrendingUpIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                Proposed: Grouped Property Charts
              </h4>
              <div className="space-y-3 text-sm text-green-800 dark:text-green-300">
                <div className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span><strong>Same properties</strong> = 200px vertical space (-68%)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Multi-material comparison built-in</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Interactive tooltips with detailed values</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>View mode toggle (absolute/relative)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Dynamic property selection (unlimited)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Good for: comparisons, analytics, property exploration</span>
                </div>
              </div>
            </div>
          </div>

          {/* Implementation Plan */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <ZapIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              4-Phase Implementation Plan
            </h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  phase: 'Week 1',
                  title: 'Component Creation',
                  tasks: ['Create PropertyGroupChart', 'Interface definition', 'Base functionality', 'Color themes']
                },
                {
                  phase: 'Week 2',
                  title: 'A/B Testing',
                  tasks: ['Test on 2-3 pages', 'Collect metrics', 'User feedback', 'Bug fixes']
                },
                {
                  phase: 'Week 3',
                  title: 'Gradual Rollout',
                  tasks: ['50% → 100% users', 'Monitor performance', 'Optimize rendering', 'Mobile refinement']
                },
                {
                  phase: 'Week 4',
                  title: 'Cleanup & Docs',
                  tasks: ['Deprecate old cards', 'Update documentation', 'API reference', 'Best practices']
                }
              ].map((item, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                  <div className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-1">{item.phase}</div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{item.title}</div>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    {item.tasks.map((task, i) => (
                      <li key={i}>• {task}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Feature Comparison Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Feature</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-gray-100">MetricsCard</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-gray-100">Grouped Chart</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {[
                    { feature: 'Vertical Space (5 props)', before: '640px', after: '200px', impact: '68% reduction' },
                    { feature: 'Multi-material View', before: '❌ No', after: '✅ Yes', impact: 'Native comparison' },
                    { feature: 'Property Selection', before: 'Fixed', after: 'Dynamic', impact: 'User control' },
                    { feature: 'View Modes', before: '1 (absolute)', after: '2 (abs/rel)', impact: 'Flexibility' },
                    { feature: 'Interactive Tooltips', before: 'Static text', after: 'Rich data', impact: 'Better UX' },
                    { feature: 'Mobile Performance', before: 'Good', after: 'Excellent', impact: 'Less scrolling' },
                    { feature: 'Data Density', before: 'Low', after: 'High', impact: 'More info/space' },
                    { feature: 'Comparison Speed', before: 'Slow', after: 'Instant', impact: 'Visual scanning' }
                  ].map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{row.feature}</td>
                      <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{row.before}</td>
                      <td className="px-4 py-3 text-center text-green-600 dark:text-green-400 font-medium">{row.after}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-4">
              <AlertCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">
                  Hybrid Approach Recommendation
                </h4>
                <div className="space-y-3 text-blue-800 dark:text-blue-300">
                  <p>
                    <strong>Keep MetricsCards for:</strong> Dashboard widgets, single-material focus pages, 
                    at-a-glance summaries where space is less critical and visual separation is valuable.
                  </p>
                  <p>
                    <strong>Use Grouped Charts for:</strong> Material property displays, machine settings, 
                    comparison pages, and anywhere multi-material analysis is needed. The space savings and 
                    native comparison features make them ideal for data-heavy pages.
                  </p>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg mt-4">
                    <div className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                      Success Metrics to Track:
                    </div>
                    <ul className="text-sm space-y-1">
                      <li>• Time on page (expect +15-25% increase)</li>
                      <li>• Scroll depth (expect better engagement)</li>
                      <li>• Property interaction rate (filters, tooltips)</li>
                      <li>• Mobile bounce rate (expect decrease)</li>
                      <li>• User feedback and qualitative insights</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Creative Design Alternative */}
          <div className="mt-12 pt-12 border-t-2 border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-3">
              <ZapIcon className="w-7 h-7 text-yellow-500" />
              PropertyBars Component: Compact Three-Bar Visualization
            </h3>
            
            <PropertyBars 
              properties={[
                { name: 'Density', value: 2650, min: 1800, max: 3200, unit: 'kg/m³', color: 'from-purple-500 to-pink-500' },
                { name: 'Hardness', value: 6.5, min: 3, max: 10, unit: 'Mohs', color: 'from-blue-500 to-cyan-500' },
                { name: 'Thermal Conductivity', value: 2.8, min: 0.5, max: 5.0, unit: 'W/mK', color: 'from-orange-500 to-red-500' },
                { name: 'Laser Absorption', value: 0.45, min: 0.1, max: 0.9, unit: '', color: 'from-green-500 to-emerald-500' },
                { name: 'Specific Heat', value: 790, min: 400, max: 1200, unit: 'J/kgK', color: 'from-indigo-500 to-purple-500' },
                { name: 'Damage Threshold', value: 5.5, min: 2, max: 10, unit: 'J/cm²', color: 'from-yellow-500 to-orange-500' },
                { name: 'Porosity', value: 0.5, min: 0.1, max: 2.0, unit: '%', color: 'from-pink-500 to-rose-500' },
                { name: 'Reflectivity', value: 0.35, min: 0.1, max: 0.8, unit: '', color: 'from-cyan-500 to-blue-500' },
                { name: 'Thermal Expansion', value: 8.2, min: 4, max: 15, unit: '10⁻⁶/K', color: 'from-red-500 to-orange-500' }
              ]}
              columns={{ mobile: 3, tablet: 4, desktop: 6 }}
              height={70}
            />
            
            {/* Design notes */}
            <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <h4 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-3 flex items-center gap-2">
                <InfoIcon className="w-5 h-5" />
                Design Features
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-indigo-800 dark:text-indigo-300">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Three-bar design</strong> shows min/value/max instantly</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Color gradients</strong> distinguish properties at a glance</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Unit badges</strong> overlay prevents text wrapping</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span><strong>89% space savings</strong> vs traditional MetricsCard grid</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Responsive grid</strong> adapts to 3/4/6 columns</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Drop-in replacement</strong> for MetricsGrid component</span>
                  </div>
                </div>
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
