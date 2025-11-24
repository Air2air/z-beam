// app/components/Dataset/BulkDownload.tsx
'use client';

import React, { useState } from 'react';
import { DownloadIcon, PackageIcon, CodeIcon, FileTextIcon, FileIcon } from '@/app/components/Buttons';
import { Button } from '@/app/components/Button';
import { DatasetCard } from './DatasetCard';
import { DownloadCard } from './DownloadCard';
import { getGridClasses } from '@/app/config/site';
import { capitalizeWords } from '@/app/utils/formatting';
import { triggerBlobDownload } from '@/app/utils/downloadUtils';
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
      triggerBlobDownload(content, filename, mimeType);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const formatCategoryName = (category: string) => {
    return capitalizeWords(category.replace(/-/g, ' '));
  };

  const categories = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]);

  return (
    <div id="bulk-downloads" className="space-y-6">
      {/* Complete Database */}
      <DownloadCard
        icon={<PackageIcon className="w-6 h-6" />}
        title="Complete Database"
        subtitle={`All ${materials.length} materials in one file`}
        description={`Download the entire materials database including all laser cleaning parameters, material properties, and specifications for all ${materials.length} materials.`}
      >
        <Button
          onClick={() => handleBulkDownload('all', 'json')}
          disabled={downloading === 'all-json'}
          variant="primary"
          size="md"
          iconLeft={<FileIcon className="w-5 h-5" />}
        >
          {downloading === 'all-json' ? 'Downloading...' : 'Download JSON'}
        </Button>
        <Button
          onClick={() => handleBulkDownload('all', 'csv')}
          disabled={downloading === 'all-csv'}
          variant="primary"
          size="md"
          iconLeft={<FileIcon className="w-5 h-5" />}
        >
          {downloading === 'all-csv' ? 'Downloading...' : 'Download CSV'}
        </Button>
      </DownloadCard>

      {/* Category Bundles - Using DatasetCard */}
      <div>
        <h3 className="text-xl text-secondary font-bold mb-4">
          Category Bundles
        </h3>
        <div className={getGridClasses({ columns: 3, gap: "md" })}>
          {categories.map(([category, count]) => {
            // Get first material from category for hero image
            const categoryMaterials = materials.filter(m => m.category === category);
            const firstMaterial = categoryMaterials[0];
            
            // Construct the hero image URL using the material's slug
            // Note: slug already includes "-laser-cleaning" suffix
            const heroImageUrl = firstMaterial?.slug 
              ? `/images/material/${firstMaterial.slug}-hero.jpg`
              : `/images/categories/${category}-category.jpg`;
            
            return (
              <DatasetCard
                key={category}
                frontmatter={{
                  title: formatCategoryName(category),
                  subject: formatCategoryName(category),
                  slug: category,
                  description: `${count} materials in ${formatCategoryName(category)} category`,
                  category: category,
                  subcategory: '',
                  images: {
                    hero: {
                      url: heroImageUrl,
                      alt: firstMaterial?.name || formatCategoryName(category)
                    }
                  }
                }}
                href={`/materials/${category}`}
                formats={[
                  { format: 'JSON', url: '#' },
                  { format: 'CSV', url: '#' }
                ]}
                category={formatCategoryName(category)}
                subcategory={`${count} materials`}
                onQuickDownload={(format: string) => {
                  if (format.toLowerCase() === 'json') {
                    handleBulkDownload(category, 'json');
                  } else if (format.toLowerCase() === 'csv') {
                    handleBulkDownload(category, 'csv');
                  }
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
