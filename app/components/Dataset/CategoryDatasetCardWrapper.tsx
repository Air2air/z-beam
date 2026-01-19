// app/components/Dataset/CategoryDatasetCardWrapper.tsx
'use client';

import { useState, useEffect } from 'react';
import { BaseSection } from '@/app/components/BaseSection/BaseSection';
import { getSectionIcon } from '@/app/config/sectionIcons';
import DatasetSection from './DatasetSection';
import type { CategoryDatasetCardWrapperProps } from '@/types/centralized';
import { calculateAggregateStats, loadMaterialDatasets } from '@/app/utils/datasetAggregator';
import { trackDatasetDownload } from '@/app/utils/analytics';
import { triggerBlobDownload } from '@/app/utils/downloadUtils';

export default function CategoryDatasetCardWrapper({
  category,
  categoryLabel,
  materials,
  subcategoryCount
}: CategoryDatasetCardWrapperProps) {
  const [aggregateStats, setAggregateStats] = useState({
    totalVariables: 0,
    totalParameters: 0,
    totalFAQs: 0
  });

  // Calculate aggregate statistics using utility
  useEffect(() => {
    const loadStats = async () => {
      const materialSlugs = materials.map(m => m.slug);
      const materialDatasets = await loadMaterialDatasets(materialSlugs);
      const stats = calculateAggregateStats(materialDatasets);
      setAggregateStats(stats);
    };
    
    loadStats();
  }, [materials]);
  
  const handleDownload = async (format: 'json' | 'csv' | 'txt') => {
    // Use utility to fetch all material datasets
    const materialSlugs = materials.map(m => m.slug);
    const validMaterialsData = await loadMaterialDatasets(materialSlugs);

    // Generate aggregated dataset on the fly
    let content = '';
    let mimeType = '';
    let fileName = '';

    if (format === 'json') {
      const data = {
        category: categoryLabel,
        totalMaterials: materials.length,
        subcategories: subcategoryCount,
        materials: validMaterialsData
      };
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
      fileName = `${category}-category-laser-cleaning.json`;
    } else if (format === 'csv') {
      // Create comprehensive CSV with all material properties
      const allFields = new Set<string>();
      validMaterialsData.forEach(material => {
        Object.keys(material).forEach(key => allFields.add(key));
      });
      
      const headers = Array.from(allFields);
      const rows = validMaterialsData.map(material => 
        headers.map(header => {
          const value = material[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          return String(value);
        })
      );
      
      content = [headers, ...rows].map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ).join('\n');
      mimeType = 'text/csv';
      fileName = `${category}-category-laser-cleaning.csv`;
    } else {
      // txt format with full material data
      content = `${categoryLabel} Category Dataset\n`;
      content += `${'='.repeat(80)}\n`;
      content += `License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)\n`;
      content += `Source: Z-Beam Laser Cleaning Research Lab\n`;
      content += `Contact: info@z-beam.com\n`;
      content += `Last Updated: ${new Date().toISOString().split('T')[0]}\n`;
      content += `${'='.repeat(80)}\n\n`;
      content += `Total Materials: ${materials.length}\n`;
      content += `Subcategories: ${subcategoryCount}\n\n`;
      
      validMaterialsData.forEach((material, index) => {
        content += `\n${'='.repeat(80)}\n`;
        content += `MATERIAL ${index + 1}: ${material.name || 'Unknown'}\n`;
        content += `${'='.repeat(80)}\n\n`;
        
        // Basic Info
        content += `Category: ${material.category || 'N/A'}\n`;
        content += `Subcategory: ${material.subcategory || 'N/A'}\n`;
        content += `Slug: ${material.slug || 'N/A'}\n`;
        if (material.description) {
          content += `Description: ${material.description}\n`;
        }
        content += '\n';
        
        // Machine Settings
        if (material.machineSettings && Object.keys(material.machineSettings).length > 0) {
          content += `MACHINE SETTINGS:\n`;
          content += `${'-'.repeat(40)}\n`;
          Object.entries(material.machineSettings).forEach(([key, value]: [string, any]) => {
            if (value && typeof value === 'object') {
              const unit = value.unit || '';
              const val = value.value !== undefined ? value.value : '';
              const min = value.min !== undefined ? value.min : '';
              const max = value.max !== undefined ? value.max : '';
              content += `  ${key}: ${val} ${unit}`;
              if (min !== '' || max !== '') {
                content += ` (Range: ${min}-${max} ${unit})`;
              }
              content += '\n';
            }
          });
          content += '\n';
        }
        
        // Material Properties
        if (material.materialProperties && Object.keys(material.materialProperties).length > 0) {
          content += `MATERIAL PROPERTIES:\n`;
          content += `${'-'.repeat(40)}\n`;
          Object.entries(material.materialProperties).forEach(([key, value]: [string, any]) => {
            if (value && typeof value === 'object' && key === 'material_characteristics') {
              Object.entries(value).forEach(([propKey, propValue]: [string, any]) => {
                if (propValue && typeof propValue === 'object' && propValue.value !== undefined) {
                  const unit = propValue.unit || '';
                  content += `  ${propKey}: ${propValue.value} ${unit}\n`;
                }
              });
            }
          });
          content += '\n';
        }
        
        // Applications
        if (material.applications && Array.isArray(material.applications) && material.applications.length > 0) {
          content += `APPLICATIONS:\n`;
          content += `${'-'.repeat(40)}\n`;
          material.applications.forEach((app: string) => {
            content += `  • ${app}\n`;
          });
          content += '\n';
        }
        
        // Regulatory Standards
        if (material.regulatoryStandards && Array.isArray(material.regulatoryStandards) && material.regulatoryStandards.length > 0) {
          content += `REGULATORY STANDARDS:\n`;
          content += `${'-'.repeat(40)}\n`;
          material.regulatoryStandards.forEach((std: any) => {
            if (typeof std === 'object') {
              content += `  • ${std.name || 'N/A'}: ${std.description || ''}\n`;
            }
          });
          content += '\n';
        }
        
        // FAQ Count
        if (material.faq) {
          const faqCount = Array.isArray(material.faq) 
            ? material.faq.length 
            : (material.faq.questions?.length || 0);
          if (faqCount > 0) {
            content += `FAQ Questions Available: ${faqCount}\n\n`;
          }
        }
      });
      
      content += `\n${'='.repeat(80)}\n`;
      content += `END OF DATASET\n`;
      content += `${'='.repeat(80)}\n`;
      
      mimeType = 'text/plain';
      fileName = `${category}-category-laser-cleaning.txt`;
    }

    // Trigger download
    const blob = new Blob([content], { type: mimeType });
    
    // Track download event
    trackDatasetDownload({
      format,
      category,
      materialName: undefined,
      fileSize: blob.size
    });
    
    triggerBlobDownload(content, fileName, mimeType);
  };

  const stats = [
    {
      value: materials?.length || 0,
      label: 'Materials'
    },
    {
      value: subcategoryCount || 0,
      label: 'Subcategories'
    },
    {
      value: aggregateStats.totalVariables,
      label: 'Variables'
    },
    {
      value: aggregateStats.totalParameters,
      label: 'Parameters'
    },
    {
      value: aggregateStats.totalFAQs,
      label: 'FAQs'
    },
    {
      value: 3,
      label: 'Formats'
    }
  ];

  return (
    <BaseSection
      variant="dark"
      title={`${categoryLabel} Dataset Download`}
      icon={getSectionIcon('dataset')}
    >
      <DatasetSection
        title={`${categoryLabel} Category Dataset`}
        description="Download complete aggregated data for all materials in this category"
        stats={stats}
        formats={['json', 'csv', 'txt']}
        onDownload={handleDownload}
        note="This aggregated dataset includes full data for all materials in this category, combining properties, specifications, and parameters into a single comprehensive file."
        fullDatasetLink={true}
      />
    </BaseSection>
  );
}
