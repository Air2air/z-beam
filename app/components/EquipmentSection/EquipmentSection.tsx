/**
 * @component EquipmentSection
 * @purpose Renders equipment/product listings from YAML data
 * @dependencies @/types (EquipmentItem), SectionTitle
 * @aiContext Use this to display available equipment/products from YAML config
 *           Automatically renders equipment in responsive grid with type labels
 *           Uses same styling as Callout component for consistency
 * 
 * @usage
 * <EquipmentSection equipment={pageConfig.equipment} theme="navbar" />
 */
import React from 'react';
import { SectionTitle } from '@/app/components/SectionTitle/SectionTitle';
import type { EquipmentItem } from '@/types';

export interface EquipmentSectionProps {
  equipment: EquipmentItem[];
  title?: string;
  theme?: 'body' | 'navbar';
}

export function EquipmentSection({ 
  equipment, 
  title = "Available Equipment",
  theme = 'navbar'
}: EquipmentSectionProps) {
  // Theme-based styling matching Callout component
  const themeClasses = {
    body: {
      container: 'bg-gray-700',
      heading: 'text-white',
      text: 'text-gray-100',
    },
    navbar: {
      container: 'bg-white dark:bg-gray-800',
      heading: 'text-gray-900 dark:text-white',
      text: 'text-gray-700 dark:text-gray-300',
    },
  };

  const currentTheme = themeClasses[theme];

  return (
    <section className="equipment-section py-12">
      <SectionTitle title={title} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {equipment.map((item, index) => (
          <div 
            key={index} 
            className={`equipment-card p-4 md:p-6 ${currentTheme.container} rounded-lg shadow-lg hover:shadow-xl transition-shadow`}
          >
            {/* Type Label */}
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">
              {item.type}
            </div>
            
            {/* Equipment Name */}
            <h3 className={`text-xl md:text-2xl font-bold mb-2 ${currentTheme.heading}`}>
              {item.name}
            </h3>
            
            {/* Description */}
            <p className={`text-base md:text-lg leading-normal ${currentTheme.text}`}>
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
