// app/components/Dataset/DatasetsContent.tsx
'use client';

import React from 'react';
import { SectionContainer } from '@/app/components/SectionContainer';
import MaterialBrowserWithFilters from '@/app/components/Dataset/MaterialBrowserWithFilters';
import DatasetSection from '@/app/components/Dataset/DatasetSection';
import CategoryBundles from '@/app/components/Dataset/CategoryBundles';
import { PackageIcon } from '@/app/components/Buttons';
import { trackDatasetDownload } from '@/app/utils/analytics';

interface DatasetsContentProps {
  materials: any[];
  categoryStats: Record<string, number>;
}

export default function DatasetsContent({ materials, categoryStats }: DatasetsContentProps) {
  const handleBulkDownload = async (type: 'all' | string, format: 'json' | 'csv' | 'txt') => {
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
      } else if (format === 'csv') {
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
      } else if (format === 'txt') {
        // TXT format - fetch full data and format as readable text
        const materialDataPromises = targetMaterials.map(async (m) => {
          const response = await fetch(m.downloads.json);
          return response.json();
        });
        
        const fullMaterialData = await Promise.all(materialDataPromises);
        
        // Create header
        content = type === 'all' 
          ? 'Z-Beam Complete Materials Database\n'
          : `Z-Beam ${formatCategoryName(type)} Materials Database\n`;
        content += `${'='.repeat(80)}\n`;
        content += `License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)\n`;
        content += `Source: Z-Beam Laser Cleaning Research Lab\n`;
        content += `Contact: info@z-beam.com\n`;
        content += `Last Updated: ${new Date().toISOString().split('T')[0]}\n`;
        content += `${'='.repeat(80)}\n\n`;
        content += `Total Materials: ${targetMaterials.length}\n`;
        if (type !== 'all') {
          content += `Category: ${formatCategoryName(type)}\n`;
        }
        content += `\n`;
        
        // Add material data
        fullMaterialData.forEach((materialData, index) => {
          const material = materialData.material;
          
          content += `\n${'-'.repeat(80)}\n`;
          content += `MATERIAL ${index + 1}: ${material.name}\n`;
          content += `${'-'.repeat(80)}\n\n`;
          
          content += `Category: ${material.classification?.category || 'N/A'}\n`;
          content += `Subcategory: ${material.classification?.subcategory || 'N/A'}\n`;
          content += `Slug: ${material.slug}\n\n`;
          
          // Material Properties
          const props = material.materialProperties;
          if (props) {
            const materialChars = props.material_characteristics || {};
            const laserInteraction = props.laser_material_interaction || {};
            
            if (Object.keys(materialChars).length > 0) {
              content += `MATERIAL CHARACTERISTICS:\n`;
              content += `${'-'.repeat(40)}\n`;
              if (materialChars.density?.value) content += `  Density: ${materialChars.density.value} ${materialChars.density.unit || ''}\n`;
              if (materialChars.porosity?.value) content += `  Porosity: ${materialChars.porosity.value} ${materialChars.porosity.unit || ''}\n`;
              if (materialChars.surfaceRoughness?.value) content += `  Surface Roughness: ${materialChars.surfaceRoughness.value} ${materialChars.surfaceRoughness.unit || ''}\n`;
              if (materialChars.tensileStrength?.value) content += `  Tensile Strength: ${materialChars.tensileStrength.value} ${materialChars.tensileStrength.unit || ''}\n`;
              if (materialChars.youngsModulus?.value) content += `  Young's Modulus: ${materialChars.youngsModulus.value} ${materialChars.youngsModulus.unit || ''}\n`;
              if (materialChars.hardness?.value) content += `  Hardness: ${materialChars.hardness.value} ${materialChars.hardness.unit || ''}\n`;
              content += '\n';
            }
            
            if (Object.keys(laserInteraction).length > 0) {
              content += `LASER-MATERIAL INTERACTION:\n`;
              content += `${'-'.repeat(40)}\n`;
              if (laserInteraction.thermalConductivity?.value) content += `  Thermal Conductivity: ${laserInteraction.thermalConductivity.value} ${laserInteraction.thermalConductivity.unit || ''}\n`;
              if (laserInteraction.thermalExpansion?.value) content += `  Thermal Expansion: ${laserInteraction.thermalExpansion.value} ${laserInteraction.thermalExpansion.unit || ''}\n`;
              if (laserInteraction.laserReflectivity?.value) content += `  Laser Reflectivity: ${laserInteraction.laserReflectivity.value}\n`;
              if (laserInteraction.absorptionCoefficient?.value) content += `  Absorption Coefficient: ${laserInteraction.absorptionCoefficient.value} ${laserInteraction.absorptionCoefficient.unit || ''}\n`;
              if (laserInteraction.ablationThreshold?.value) content += `  Ablation Threshold: ${laserInteraction.ablationThreshold.value} ${laserInteraction.ablationThreshold.unit || ''}\n`;
              content += '\n';
            }
          }
        });
        
        content += `\n${'='.repeat(80)}\n`;
        content += `END OF DATASET\n`;
        content += `${'='.repeat(80)}\n`;
        
        filename = type === 'all'
          ? 'z-beam-materials-complete.txt'
          : `z-beam-${type}-materials.txt`;
        mimeType = 'text/plain';
      }

      // Create and trigger download
      const blob = new Blob([content], { type: mimeType });
      
      // Track download event
      trackDatasetDownload({
        format,
        category: type === 'all' ? 'complete-database' : type,
        subcategory: undefined,
        materialName: type === 'all' ? 'Complete Database' : `${formatCategoryName(type)} Bundle`,
        fileSize: blob.size
      });
      
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

  const completeDbStats = [
    {
      value: materials.length,
      label: 'Materials'
    },
    {
      value: Object.keys(categoryStats).length,
      label: 'Categories'
    },
    {
      value: materials.length * 17, // Average 17 variables per material
      label: 'Variables'
    },
    {
      value: materials.length * 9, // Average 9 parameters per material
      label: 'Parameters'
    },
    {
      value: materials.length * 7, // Average 7 FAQs per material
      label: 'FAQs'
    },
    {
      value: 3,
      label: 'Formats'
    }
  ];

  const handleCompleteDbDownload = async (format: 'json' | 'csv' | 'txt') => {
    await handleBulkDownload('all', format);
  };

  return (
    <>
      {/* Complete Database */}
      <div className="mb-8">
        <SectionContainer 
          title="Complete Database" 
          bgColor="navbar" 
          horizPadding={true} 
          radius={true}
          icon={<PackageIcon className="w-6 h-6" />}
        >
          <DatasetSection
            title="Complete Materials Database"
            description={`Download the entire materials database including all laser cleaning parameters, material properties, and specifications for all ${materials.length} materials.`}
            stats={completeDbStats}
            formats={['json', 'csv', 'txt']}
            onDownload={handleCompleteDbDownload}
            note="This comprehensive dataset includes full data for all materials across all categories, combining properties, specifications, and parameters into a single file."
          />
        </SectionContainer>
      </div>

      {/* Search & Filter + Results */}
      <MaterialBrowserWithFilters materials={materials} />
    </>
  );
}
