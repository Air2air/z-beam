// app/components/Dataset/CategoryDatasetCardWrapper.tsx
'use client';

import DatasetCard from './DatasetCard';

interface MaterialInfo {
  name: string;
  slug: string;
  category: string;
  subcategory: string;
}

interface CategoryDatasetCardWrapperProps {
  category: string;
  categoryLabel: string;
  materials: MaterialInfo[];
  subcategoryCount: number;
}

export default function CategoryDatasetCardWrapper({
  category,
  categoryLabel,
  materials,
  subcategoryCount
}: CategoryDatasetCardWrapperProps) {
  return (
    <DatasetCard
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
      formats={['json', 'csv']}
      onDownload={async (format: 'json' | 'csv' | 'txt') => {
        // Generate aggregated dataset on the fly
        let content = '';
        let mimeType = '';
        let fileName = '';

        if (format === 'json') {
          const data = {
            category: categoryLabel,
            materials: materials.map(m => ({
              name: m.name,
              slug: m.slug,
              category: m.category,
              subcategory: m.subcategory,
              datasetUrl: `/datasets/${m.category}/${m.subcategory}/${m.slug}.json`
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
            `/datasets/${m.category}/${m.subcategory}/${m.slug}.json`
          ]);
          content = [headers, ...rows].map(row => row.join(',')).join('\n');
          mimeType = 'text/csv';
          fileName = `${category}-category.csv`;
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }}
      note="This aggregated dataset includes references to all individual material datasets in this category. Download individual material datasets for detailed properties and specifications."
      fullDatasetLink={true}
    />
  );
}
