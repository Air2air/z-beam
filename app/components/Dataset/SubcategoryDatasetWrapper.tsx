// app/components/Dataset/SubcategoryDatasetWrapper.tsx
'use client';

import React from 'react';
import { SectionContainer } from '@/app/components/SectionContainer/SectionContainer';
import { getSectionIcon } from '@/app/config/sectionIcons';
import DatasetSection from './DatasetSection';
import { trackDatasetDownload } from '@/app/utils/analytics';
import { triggerBlobDownload } from '@/app/utils/downloadUtils';

interface Material {
  name: string;
  slug: string;
}

interface SubcategoryDatasetWrapperProps {
  category: string;
  categoryLabel: string;
  subcategory: string;
  subcategoryLabel: string;
  materials: Material[];
}

export default function SubcategoryDatasetWrapper({
  category,
  categoryLabel,
  subcategory,
  subcategoryLabel,
  materials
}: SubcategoryDatasetWrapperProps) {
  
  const handleDownload = async (format: 'json' | 'csv' | 'txt') => {
    // Fetch full data for all materials in this subcategory
    const materialDataPromises = materials.map(async (m) => {
      try {
        const fullSlug = m.slug.endsWith('-laser-cleaning') ? m.slug : `${m.slug}-laser-cleaning`;
        const response = await fetch(`/datasets/materials/${fullSlug}-material-dataset.json`);
        if (!response.ok) throw new Error(`Failed to fetch ${fullSlug}`);
        return await response.json();
      } catch (error) {
        console.error(`Error fetching data for ${m.name}:`, error);
        return null;
      }
    });

    const materialsData = await Promise.all(materialDataPromises);
    const validMaterialsData = materialsData.filter(d => d !== null);

    // Generate dataset for this subcategory
    let content = '';
    let mimeType = '';
    let fileName = '';

    if (format === 'json') {
      const data = {
        category: categoryLabel,
        subcategory: subcategoryLabel,
        totalMaterials: materials.length,
        materials: validMaterialsData
      };
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
      fileName = `${category}-${subcategory}-dataset.json`;
    } else if (format === 'csv') {
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
      fileName = `${category}-${subcategory}-dataset.csv`;
    } else if (format === 'txt') {
      content = `${subcategoryLabel} Dataset\n`;
      content += `Category: ${categoryLabel}\n`;
      content += `${'='.repeat(80)}\n\n`;
      content += `Total Materials: ${materials.length}\n\n`;
      
      validMaterialsData.forEach((material, index) => {
        content += `MATERIAL ${index + 1}: ${material.name || 'Unknown'}\n`;
        content += `${'-'.repeat(40)}\n`;
        content += `Slug: ${material.slug}\n\n`;
      });
      
      mimeType = 'text/plain';
      fileName = `${category}-${subcategory}-dataset.txt`;
    }

    // Trigger download
    const blob = new Blob([content], { type: mimeType });
    
    // Track download event
    trackDatasetDownload({
      format,
      category,
      subcategory,
      materialName: undefined,
      fileSize: blob.size
    });
    
    triggerBlobDownload(content, fileName, mimeType);
  };

  const getDirectLink = (format: 'json' | 'csv' | 'txt') => {
    return `/datasets/materials/${category}-${subcategory}-dataset.${format}`;
  };

  const stats = [
    { label: 'Materials', value: materials.length.toString() },
    { label: 'Category', value: categoryLabel },
    { label: 'Subcategory', value: subcategoryLabel },
    { label: 'Format', value: 'JSON/CSV/TXT' },
    { label: 'License', value: 'CC BY 4.0' }
  ];

  return (
    <SectionContainer
      variant="dark"
      title={`${subcategoryLabel} Dataset Download`}
      icon={getSectionIcon('dataset')}
    >
      <DatasetSection
        title={`${subcategoryLabel} ${categoryLabel} Dataset`}
        description={`Download comprehensive laser cleaning parameters for ${materials.length} ${subcategoryLabel.toLowerCase()} ${categoryLabel.toLowerCase()} materials. Includes wavelength, power, fluence, thermal properties, and machine settings.`}
        stats={stats}
        formats={['json', 'csv', 'txt']}
        onDownload={handleDownload}
        getDirectLink={getDirectLink}
        categoryLink={{
          href: `/materials/${category}`,
          label: `View all ${categoryLabel} materials`
        }}
      />
    </SectionContainer>
  );
}
