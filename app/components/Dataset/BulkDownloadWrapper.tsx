// app/components/Dataset/BulkDownloadWrapper.tsx
'use client';

import React from 'react';

interface BulkDownloadWrapperProps {
  materials: any[];
  children: (downloadHandler: (type: 'all' | string, format: 'json' | 'csv') => Promise<void>) => React.ReactNode;
}

export default function BulkDownloadWrapper({ materials, children }: BulkDownloadWrapperProps) {
  const handleBulkDownload = async (type: 'all' | string, format: 'json' | 'csv') => {
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
    }
  };

  const formatCategoryName = (category: string) => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return <>{children(handleBulkDownload)}</>;
}
