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
    // Generate aggregated dataset on the fly
    let content = '';
    let mimeType = '';
    let fileName = '';

    if (format === 'json') {
      const data = {
        category: categoryLabel,
        totalMaterials: materials.length,
        subcategories: subcategoryCount,
        materials: materials.map(m => ({
          name: m.name,
          slug: m.slug,
          category: m.category,
          subcategory: m.subcategory,
          datasetUrl: `/datasets/materials/${m.slug}.json`
        }))
      };
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
      fileName = `${category}-category.json`;
    } else if (format === 'csv') {
      const headers = ['Name', 'Slug', 'Category', 'Subcategory', 'Dataset URL'];
      const rows = materials.map(m => [
        m.name,
        m.slug,
        m.category,
        m.subcategory,
        `/datasets/materials/${m.slug}.json`
      ]);
      content = [headers, ...rows].map(row => row.join(',')).join('\n');
      mimeType = 'text/csv';
      fileName = `${category}-category.csv`;
    } else {
      // txt format
      content = `${categoryLabel} Category Dataset\n\n`;
      content += `Total Materials: ${materials.length}\n`;
      content += `Subcategories: ${subcategoryCount}\n\n`;
      content += `Materials:\n`;
      materials.forEach(m => {
        content += `- ${m.name} (${m.category}/${m.subcategory})\n`;
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

  return (
    <DatasetSection
      title={`${categoryLabel} Category Dataset`}
      description="Download aggregated data for all materials in this category"
      stats={[
        {
          value: materials.length,
          label: 'Materials'
        },
        {
          value: subcategoryCount,
          label: 'Subcategories'
        }
      ]}
      formats={['json', 'csv', 'txt']}
      onDownload={handleDownload}
      note="This aggregated dataset includes references to all individual material datasets in this category. Download individual material datasets for detailed properties and specifications."
      fullDatasetLink={true}
    />
  );
}
