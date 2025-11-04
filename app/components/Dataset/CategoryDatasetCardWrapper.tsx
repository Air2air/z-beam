// app/components/Dataset/CategoryDatasetCardWrapper.tsx
'use client';

import DatasetSection from './DatasetSection';
import type { CategoryDatasetCardWrapperProps } from '@/types/centralized';

export default function CategoryDatasetCardWrapper({
  category,
  categoryLabel,
  materials,
  subcategoryCount
}: CategoryDatasetCardWrapperProps) {
  
  const handleDownload = async (format: 'json' | 'csv' | 'txt') => {
    // Fetch full data for all materials in parallel
    const materialDataPromises = materials.map(async (m) => {
      try {
        const response = await fetch(`/datasets/materials/${m.slug}.json`);
        if (!response.ok) throw new Error(`Failed to fetch ${m.slug}`);
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
      fileName = `${category}-category.json`;
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
      fileName = `${category}-category.csv`;
    } else {
      // txt format with full material summaries
      content = `${categoryLabel} Category Dataset\n`;
      content += `${'='.repeat(50)}\n\n`;
      content += `Total Materials: ${materials.length}\n`;
      content += `Subcategories: ${subcategoryCount}\n\n`;
      
      validMaterialsData.forEach((material, index) => {
        content += `${index + 1}. ${material.name || 'Unknown'}\n`;
        content += `   Category: ${material.category || 'N/A'}\n`;
        content += `   Subcategory: ${material.subcategory || 'N/A'}\n`;
        if (material.description) {
          content += `   Description: ${material.description}\n`;
        }
        content += '\n';
      });
      
      mimeType = 'text/plain';
      fileName = `${category}-category.txt`;
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
