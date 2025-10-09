/**
 * @component EquipmentSection
 * @purpose Renders equipment/product listings from YAML data
 * @dependencies @/types (EquipmentItem)
 * @aiContext Use this to display available equipment/products from YAML config
 *           Automatically renders equipment in responsive grid with type labels
 * 
 * @usage
 * <EquipmentSection equipment={pageConfig.equipment} />
 */
import React from 'react';
import type { EquipmentItem } from '@/types';

export interface EquipmentSectionProps {
  equipment: EquipmentItem[];
  title?: string;
}

export function EquipmentSection({ 
  equipment, 
  title = "Available Equipment" 
}: EquipmentSectionProps) {
  return (
    <section className="equipment-section py-12">
      <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {equipment.map((item, index) => (
          <div 
            key={index} 
            className="equipment-card p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
          >
            {/* Type Label */}
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              {item.type}
            </div>
            
            {/* Equipment Name */}
            <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
              {item.name}
            </h3>
            
            {/* Description */}
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
