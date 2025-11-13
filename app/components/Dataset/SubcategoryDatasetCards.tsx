// app/components/Dataset/SubcategoryDatasetCards.tsx
// Server Component - no client-side interactivity

import React from 'react';
import { DatasetCard } from './DatasetCard';
import { getGridClasses } from '@/app/config/site';
import { capitalizeWords } from '@/app/utils/formatting';
import { triggerBlobDownload } from '@/app/utils/downloadUtils';

interface SubcategoryData {
  slug: string;
  label: string;
  materials: Array<{
    name: string;
    slug: string;
    category: string;
    subcategory: string;
  }>;
}

interface SubcategoryDatasetCardsProps {
  category: string;
  categoryLabel: string;
  subcategories: SubcategoryData[];
}

export default function SubcategoryDatasetCards({
  category,
  categoryLabel,
  subcategories
}: SubcategoryDatasetCardsProps) {
  
  const formatCategoryName = (name: string) => {
    return capitalizeWords(name.replace(/-/g, ' '));
  };

  const handleQuickDownload = async (subcategorySlug: string, format: string, materials: any[]) => {
    // Fetch full data for all materials in this subcategory
    const materialDataPromises = materials.map(async (m) => {
      try {
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

    // Generate dataset for this subcategory
    let content = '';
    let mimeType = '';
    let fileName = '';
    const subcategory = subcategories.find(s => s.slug === subcategorySlug);

    if (format === 'json') {
      const data = {
        category: categoryLabel,
        subcategory: subcategory?.label,
        totalMaterials: materials.length,
        materials: validMaterialsData
      };
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
      fileName = `${category}-${subcategorySlug}-dataset.json`;
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
      fileName = `${category}-${subcategorySlug}-dataset.csv`;
    } else if (format === 'txt') {
      content = `${subcategory?.label} Dataset\n`;
      content += `Category: ${categoryLabel}\n`;
      content += `${'='.repeat(80)}\n\n`;
      content += `Total Materials: ${materials.length}\n\n`;
      
      validMaterialsData.forEach((material, index) => {
        content += `MATERIAL ${index + 1}: ${material.name || 'Unknown'}\n`;
        content += `${'-'.repeat(40)}\n`;
        content += `Slug: ${material.slug}\n\n`;
      });
      
      mimeType = 'text/plain';
      fileName = `${category}-${subcategorySlug}-dataset.txt`;
    }

    // Trigger download
    triggerBlobDownload(content, fileName, mimeType);
  };

  return (
    <div className={getGridClasses({ columns: 3, gap: "md" })}>
      {subcategories.map((subcategory) => (
        <DatasetCard
          key={subcategory.slug}
          frontmatter={{
            title: subcategory.label,
            subject: subcategory.label,
            slug: subcategory.slug,
            description: `${subcategory.materials.length} materials available`,
            category: category,
            subcategory: subcategory.slug,
            images: {
              hero: {
                url: `/images/category/${category}-${subcategory.slug}-hero.jpg`,
                alt: subcategory.label
              }
            }
          }}
          href={`/materials/${category}/${subcategory.slug}`}
          formats={[
            { 
              format: 'JSON', 
              url: `/datasets/materials/${category}-${subcategory.slug}-dataset.json` 
            },
            { 
              format: 'CSV', 
              url: `/datasets/materials/${category}-${subcategory.slug}-dataset.csv` 
            },
            { 
              format: 'TXT', 
              url: `/datasets/materials/${category}-${subcategory.slug}-dataset.txt` 
            },
          ]}
          category={formatCategoryName(category)}
          subcategory={formatCategoryName(subcategory.slug)}
          onQuickDownload={(format: string, url: string) => {
            handleQuickDownload(subcategory.slug, format.toLowerCase(), subcategory.materials);
          }}
        />
      ))}
    </div>
  );
}
