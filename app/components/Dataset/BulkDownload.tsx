// app/components/Dataset/BulkDownload.tsx
'use client';

import React, { useState } from 'react';
import { FiDownload, FiPackage, FiCode, FiFileText } from 'react-icons/fi';
import { BsFiletypeJson, BsFiletypeCsv } from 'react-icons/bs';
import type { BulkDownloadProps } from '@/types/centralized';

export default function BulkDownload({ materials, categoryStats }: BulkDownloadProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleBulkDownload = async (type: 'all' | string, format: 'json' | 'csv') => {
    setDownloading(`${type}-${format}`);
    
    try {
      let content = '';
      let filename = '';
      let mimeType = '';

      // Get materials to include
      const targetMaterials = type === 'all' 
        ? materials 
        : materials.filter(m => m.category === type);

      if (format === 'json') {
        // Fetch full data for each material
        const materialDataPromises = targetMaterials.map(async (m) => {
          const response = await fetch(m.downloads.json);
          return response.json();
        });
        
        const fullMaterialData = await Promise.all(materialDataPromises);
        
        const data = {
          '@context': 'https://schema.org',
          '@type': 'DataCatalog',
          name: type === 'all' 
            ? 'Z-Beam Complete Materials Database'
            : `Z-Beam ${formatCategoryName(type)} Materials Database`,
          description: type === 'all'
            ? `Comprehensive laser cleaning parameters for ${targetMaterials.length} materials`
            : `Laser cleaning parameters for ${targetMaterials.length} ${formatCategoryName(type)} materials`,
          dateModified: new Date().toISOString().split('T')[0],
          license: 'https://creativecommons.org/licenses/by/4.0/',
          totalMaterials: targetMaterials.length,
          category: type === 'all' ? 'all' : type,
          materials: fullMaterialData
        };
        
        content = JSON.stringify(data, null, 2);
        filename = type === 'all' 
          ? 'z-beam-materials-complete.json'
          : `z-beam-${type}-materials.json`;
        mimeType = 'application/json';
      } else {
        // CSV format - fetch full data and flatten
        const materialDataPromises = targetMaterials.map(async (m) => {
          const response = await fetch(m.downloads.json);
          return response.json();
        });
        
        const fullMaterialData = await Promise.all(materialDataPromises);
        
        // Create comprehensive CSV headers
        const headers = [
          'Name',
          'Slug',
          'Category',
          'Subcategory',
          'Density (g/cm³)',
          'Porosity (%)',
          'Surface Roughness (μm)',
          'Tensile Strength (MPa)',
          'Youngs Modulus (GPa)',
          'Hardness (GPa)',
          'Flexural Strength (MPa)',
          'Oxidation Resistance (μm/year)',
          'Corrosion Resistance (mm/year)',
          'Thermal Conductivity (W/(m·K))',
          'Thermal Expansion (×10^-6/K)',
          'Thermal Diffusivity (×10^-5 m²/s)',
          'Specific Heat (J/(kg·K))',
          'Thermal Shock Resistance (K)',
          'Laser Reflectivity',
          'Absorption Coefficient (×10^7 m^-1)',
          'Ablation Threshold (J/cm²)',
          'Laser Damage Threshold (J/cm²)'
        ];
        
        const rows = fullMaterialData.map(materialData => {
          const material = materialData.material;
          const props = material.materialProperties;
          const materialChars = props.material_characteristics || {};
          const laserInteraction = props.laser_material_interaction || {};
          
          return [
            material.name,
            material.slug,
            material.classification.category,
            material.classification.subcategory,
            materialChars.density?.value || '',
            materialChars.porosity?.value || '',
            materialChars.surfaceRoughness?.value || '',
            materialChars.tensileStrength?.value || '',
            materialChars.youngsModulus?.value || '',
            materialChars.hardness?.value || '',
            materialChars.flexuralStrength?.value || '',
            materialChars.oxidationResistance?.value || '',
            materialChars.corrosionResistance?.value || '',
            laserInteraction.thermalConductivity?.value || '',
            laserInteraction.thermalExpansion?.value || '',
            laserInteraction.thermalDiffusivity?.value || '',
            laserInteraction.specificHeat?.value || '',
            laserInteraction.thermalShockResistance?.value || '',
            laserInteraction.laserReflectivity?.value || '',
            laserInteraction.absorptionCoefficient?.value || '',
            laserInteraction.ablationThreshold?.value || '',
            laserInteraction.laserDamageThreshold?.value || ''
          ];
        });
        
        content = [headers, ...rows].map(row => 
          row.map(cell => {
            // Escape cells with commas or quotes
            const cellStr = String(cell);
            if (cellStr.includes(',') || cellStr.includes('"')) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          }).join(',')
        ).join('\n');
        
        filename = type === 'all'
          ? 'z-beam-materials-complete.csv'
          : `z-beam-${type}-materials.csv`;
        mimeType = 'text/csv';
      }

      // Create and trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const formatCategoryName = (category: string) => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const categories = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]);

  return (
    <div id="bulk-downloads" className="space-y-6">
      {/* Complete Database */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-blue-200 dark:border-gray-700 p-6 md:p-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-600 rounded-lg">
              <FiPackage className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Complete Database
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All {materials.length} materials in one file
              </p>
            </div>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Download the entire materials database including all laser cleaning parameters, 
          material properties, and specifications for all {materials.length} materials.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleBulkDownload('all', 'json')}
            disabled={downloading === 'all-json'}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            <BsFiletypeJson className="w-5 h-5" />
            <span>{downloading === 'all-json' ? 'Downloading...' : 'Download JSON'}</span>
          </button>
          <button
            onClick={() => handleBulkDownload('all', 'csv')}
            disabled={downloading === 'all-csv'}
            className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            <BsFiletypeCsv className="w-5 h-5" />
            <span>{downloading === 'all-csv' ? 'Downloading...' : 'Download CSV'}</span>
          </button>
        </div>
      </div>

      {/* Category Bundles */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Category Bundles
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {categories.map(([category, count]) => (
            <div
              key={category}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {formatCategoryName(category)}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {count} materials
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkDownload(category, 'json')}
                  disabled={downloading === `${category}-json`}
                  className="flex-1 inline-flex items-center justify-center space-x-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  <BsFiletypeJson className="w-4 h-4" />
                  <span>{downloading === `${category}-json` ? 'Downloading...' : 'JSON'}</span>
                </button>
                <button
                  onClick={() => handleBulkDownload(category, 'csv')}
                  disabled={downloading === `${category}-csv`}
                  className="flex-1 inline-flex items-center justify-center space-x-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  <BsFiletypeCsv className="w-4 h-4" />
                  <span>{downloading === `${category}-csv` ? 'Downloading...' : 'CSV'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
