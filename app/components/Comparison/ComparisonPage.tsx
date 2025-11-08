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
