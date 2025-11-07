// app/components/Dataset/CategoryDatasetCardWrapper.tsx
'use client';

import { useState, useEffect } from 'react';
import DatasetSection from './DatasetSection';
import type { CategoryDatasetCardWrapperProps } from '@/types/centralized';

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

  // Calculate aggregate statistics by sampling a few materials
  useEffect(() => {
    const calculateStats = async () => {
      try {
        // Sample first 3 materials to estimate averages
        const sampleSize = Math.min(3, materials.length);
        const sampleMaterials = materials.slice(0, sampleSize);
        
        let totalVars = 0;
        let totalParams = 0;
        let totalFAQs = 0;
        
        for (const material of sampleMaterials) {
          try {
            const fullSlug = material.slug.endsWith('-laser-cleaning') 
              ? material.slug 
              : `${material.slug}-laser-cleaning`;
            const response = await fetch(`/datasets/materials/${fullSlug}.json`);
            
            if (response.ok) {
              const data = await response.json();
              
              // Count variables (machine settings)
              if (data.machineSettings) {
                totalVars += Object.keys(data.machineSettings).length;
              }
              
              // Count parameters (material properties)
              if (data.materialProperties) {
                Object.values(data.materialProperties).forEach((category: any) => {
                  if (category && typeof category === 'object') {
                    totalParams += Object.keys(category).length;
                  }
                });
              }
              
              // Count FAQs
              if (data.faq) {
                totalFAQs += Array.isArray(data.faq) 
                  ? data.faq.length 
                  : (data.faq.questions?.length || 0);
              }
            }
          } catch (error) {
            console.error(`Error fetching ${material.slug}:`, error);
          }
        }
        
        // Calculate averages and extrapolate to all materials
        const avgVars = Math.round(totalVars / sampleSize);
        const avgParams = Math.round(totalParams / sampleSize);
        const avgFAQs = Math.round(totalFAQs / sampleSize);
        
        setAggregateStats({
          totalVariables: avgVars * materials.length,
          totalParameters: avgParams * materials.length,
          totalFAQs: avgFAQs * materials.length
        });
      } catch (error) {
        console.error('Error calculating aggregate stats:', error);
        // Fallback to estimates if fetch fails
        setAggregateStats({
          totalVariables: materials.length * 9,
          totalParameters: materials.length * 17,
          totalFAQs: materials.length * 7
        });
      }
    };
    
    calculateStats();
  }, [materials]);
  
  const handleDownload = async (format: 'json' | 'csv' | 'txt') {
    // Fetch full data for all materials in parallel
    const materialDataPromises = materials.map(async (m) => {
      try {
        // Ensure slug has -laser-cleaning suffix
        const fullSlug = m.slug.endsWith('-laser-cleaning') ? m.slug : `${m.slug}-laser-cleaning`;
        const response = await fetch(`/datasets/materials/${fullSlug}.json`);
        if (!response.ok) throw new Error(`Failed to fetch ${fullSlug}`);
        return await response.json();
      } catch (error) {
        console.error(`Error fetching data for ${m.name}:`, error);
        return null;
      }
    });

    const materialsData = await Promise.all(materialDataPromises);
    const validMaterialsData = materialsData.filter(d => d !== null);

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
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
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
    <DatasetSection
      title={`${categoryLabel} Category Dataset`}
      description="Download complete aggregated data for all materials in this category"
      stats={stats}
      formats={['json', 'csv', 'txt']}
      onDownload={handleDownload}
      note="This aggregated dataset includes full data for all materials in this category, combining properties, specifications, and parameters into a single comprehensive file."
      fullDatasetLink={true}
    />
  );
}
