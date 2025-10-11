/**
 * @component BenefitsSection
 * @purpose Renders benefits/features from YAML data in a card grid
 * @dependencies @/types (BenefitItem), SectionTitle
 * @aiContext Use this to display product/service benefits from YAML config
 *           Automatically renders benefits in responsive grid with category labels
 *           Uses same styling as Callout component for consistency
 * 
 * @usage
 * <BenefitsSection benefits={pageConfig.benefits} theme="navbar" />
 */
import React from 'react';
import { SectionTitle } from '@/app/components/SectionTitle/SectionTitle';
import type { BenefitItem } from '@/types';

export interface BenefitsSectionProps {
  benefits: BenefitItem[];
  title?: string;
  theme?: 'body' | 'navbar';
}

export function BenefitsSection({ 
  benefits, 
  title = "Why Choose Z-Beam",
  theme = 'navbar'
}: BenefitsSectionProps) {
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
    <section className="benefits-section py-12">
      <SectionTitle title={title} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {benefits.map((benefit, index) => (
          <div 
            key={index} 
            className={`benefit-card p-4 md:p-6 ${currentTheme.container} rounded-lg shadow-lg hover:shadow-xl transition-shadow`}
          >
            {/* Category Label */}
            <div className="text-sm text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">
              <strong>{benefit.category}</strong>
            </div>
            
            {/* Title */}
            <h3 className={`mb-2 ${currentTheme.heading}`}>
              {benefit.title}
            </h3>
            
            {/* Description */}
            <p className={`leading-normal ${currentTheme.text}`}>
              {benefit.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
