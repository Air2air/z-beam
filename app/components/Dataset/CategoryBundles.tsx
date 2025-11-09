'use client';
// app/components/Dataset/CategoryBundles.tsx

import React from 'react';
import { DatasetCard } from './DatasetCard';
import { getGridClasses } from '@/app/config/site';

interface CategoryBundlesProps {
  materials: any[];
  categoryStats: Record<string, number>;
  onDownload: (category: string, format: 'json' | 'csv') => Promise<void>;
}

export default function CategoryBundles({ materials, categoryStats, onDownload }: CategoryBundlesProps) {
  const formatCategoryName = (category: string) => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleQuickDownload = async (category: string, format: string) => {
    if (format.toLowerCase() === 'json') {
      await onDownload(category, 'json');
    } else if (format.toLowerCase() === 'csv') {
      await onDownload(category, 'csv');
    }
  };

  const categories = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]);

  return (
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
            onQuickDownload={(format: string) => handleQuickDownload(category, format)}
          />
        );
      })}
    </div>
  );
}
