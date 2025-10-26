/**
 * @component EnvironmentalImpact
 * @purpose Displays environmental impact metrics and safety data
 * @dependencies @/types (EnvironmentalImpactProps), MetricsCard
 * @related Layout.tsx, MetricsGrid.tsx
 * @complexity Medium (categorized metrics with icons and descriptions)
 * @aiContext Pass frontmatter.environmentalImpact object. Component renders
 *           categorized environmental metrics including emissions, energy, and safety.
 */
// app/components/EnvironmentalImpact/EnvironmentalImpact.tsx
"use client";

import { SectionTitle } from '../SectionTitle/SectionTitle';
import { MetricsCard } from '../MetricsCard/MetricsCard';

interface PropertyValue {
  value: number;
  min?: number;
  max?: number;
  unit: string;
  research_basis?: string;
  description?: string;
}

interface PropertyCategory {
  label: string;
  description: string;
  [key: string]: any;
}

export interface EnvironmentalImpactProps {
  environmentalImpact: {
    [categoryKey: string]: PropertyCategory;
  };
  className?: string;
  showTitle?: boolean;
  title?: string;
  layout?: 'grid' | 'auto' | 'compact';
}

// Category icons and colors
const getCategoryIcon = (categoryKey: string) => {
  if (categoryKey.includes('emission')) {
    return { icon: '💨', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' };
  }
  if (categoryKey.includes('energy')) {
    return { icon: '⚡', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' };
  }
  if (categoryKey.includes('safety')) {
    return { icon: '🛡️', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' };
  }
  if (categoryKey.includes('waste')) {
    return { icon: '♻️', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' };
  }
  return { icon: '🌍', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
};

export function EnvironmentalImpact({
  environmentalImpact,
  className = '',
  showTitle = true,
  title = 'Environmental Impact & Safety',
  layout = 'auto'
}: EnvironmentalImpactProps) {
  if (!environmentalImpact || Object.keys(environmentalImpact).length === 0) return null;

  // Extract categories
  const categories = Object.entries(environmentalImpact).filter(
    ([key, value]) => typeof value === 'object' && value.label
  );

  if (categories.length === 0) return null;

  return (
    <section 
      className={`environmental-impact ${className}`}
      aria-labelledby="environmental-impact-heading"
    >
      {showTitle && (
        <SectionTitle 
          title={title}
          subtitle="Environmental footprint, emissions, and safety metrics for laser cleaning operations"
          id="environmental-impact-heading"
        />
      )}

      <div className="space-y-8">
        {categories.map(([categoryKey, category]) => {
          const { icon, color, bg } = getCategoryIcon(categoryKey);
          
          // Extract properties from this category
          const properties = Object.entries(category).filter(
            ([key, value]) => 
              key !== 'label' && 
              key !== 'description' && 
              typeof value === 'object' && 
              'value' in value
          ) as [string, PropertyValue][];

          if (properties.length === 0) return null;

          return (
            <section key={categoryKey} className="category-section">
              {/* Category header */}
              <div className={`category-header flex items-center gap-3 mb-4 p-3 rounded-lg ${bg}`}>
                <span className="text-3xl" role="img" aria-hidden="true">
                  {icon}
                </span>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${color}`}>
                    {category.label}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Properties grid */}
              <div className={`metrics-grid ${
                layout === 'compact' 
                  ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'
                  : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              }`}>
                {properties.map(([propKey, propValue], index) => {
                  // Format property name for display
                  const title = propKey
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase())
                    .trim();
                  
                  return (
                    <MetricsCard
                      key={`${categoryKey}-${propKey}`}
                      title={title}
                      value={propValue.value}
                      unit={propValue.unit || ''}
                      color={icon === '💨' ? '#FF6B6B' : icon === '⚡' ? '#FFD93D' : icon === '🛡️' ? '#10B981' : '#6C5CE7'}
                      min={propValue.min}
                      max={propValue.max}
                      confidence={propValue.research_basis ? 90 : undefined}
                      description={propValue.description}
                      categoryId={categoryKey}
                      categoryLabel={category.label}
                      animationDelay={index * 50}
                    />
                );
              })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Environmental commitment footer */}
      <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-start gap-3">
          <span className="text-2xl" role="img" aria-label="Leaf">🌱</span>
          <div className="flex-1">
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">
              Sustainable Technology
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              Laser cleaning is an environmentally friendly alternative to chemical cleaning methods, 
              significantly reducing hazardous waste, water consumption, and chemical emissions. 
              All measurements based on industrial research standards and field data.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
