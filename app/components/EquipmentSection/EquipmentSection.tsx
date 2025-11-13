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
import { getThemeClasses } from '@/app/config/themeConfig';
import type { EquipmentItem } from '@/types';
import type { ThemeVariant } from '@/app/config/themeConfig';

export interface EquipmentSectionProps {
  equipment: EquipmentItem[];
  title?: string;
  theme?: ThemeVariant;
}

export function EquipmentSection({ 
  equipment, 
  title = "Available Equipment",
  theme = 'navbar'
}: EquipmentSectionProps) {
  const currentTheme = getThemeClasses(theme);

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
            <div className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">
              {item.type}
            </div>
            
            {/* Equipment Name */}
            <h3 className={`mb-2 ${currentTheme.heading}`}>
              {item.name}
            </h3>
            
            {/* Description */}
            <p className={`leading-normal ${currentTheme.text}`}>
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
