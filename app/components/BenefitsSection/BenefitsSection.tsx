/**
 * @component BenefitsSection
 * @purpose Renders benefits/features from YAML data in a card grid
 * @dependencies @/types (BenefitItem)
 * @aiContext Use this to display product/service benefits from YAML config
 *           Automatically renders benefits in responsive grid with category labels
 * 
 * @usage
 * <BenefitsSection benefits={pageConfig.benefits} />
 */
import React from 'react';
import type { BenefitItem } from '@/types';

export interface BenefitsSectionProps {
  benefits: BenefitItem[];
  title?: string;
}

export function BenefitsSection({ 
  benefits, 
  title = "Why Choose Z-Beam" 
}: BenefitsSectionProps) {
  return (
    <section className="benefits-section py-12">
      <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {benefits.map((benefit, index) => (
          <div 
            key={index} 
            className="benefit-card p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
          >
            {/* Category Label */}
            <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">
              {benefit.category}
            </div>
            
            {/* Title */}
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
              {benefit.title}
            </h3>
            
            {/* Description */}
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {benefit.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
