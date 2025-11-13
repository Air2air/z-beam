/**
 * @component EnvironmentalImpact
 * @purpose Displays environmental impact metrics and safety data
 * @dependencies PropertyBars, @/types (EnvironmentalImpactProps)
 * @related Layout.tsx
 * @complexity Simple (uses PropertyBars for categorized metrics)
 * @aiContext Pass frontmatter.environmentalImpact object. Component renders
 *           categorized environmental metrics including emissions, energy, and safety.
 */
// app/components/EnvironmentalImpact/EnvironmentalImpact.tsx

import { PropertyBars } from '../PropertyBars/PropertyBars';

export interface EnvironmentalImpactProps {
  environmentalImpact: Record<string, any>;
  className?: string;
}

/**
 * Displays environmental impact metrics using PropertyBars
 * PropertyBars automatically handles grouped properties with labels
 */
export function EnvironmentalImpact({
  environmentalImpact,
  className = ''
}: EnvironmentalImpactProps) {
  if (!environmentalImpact || Object.keys(environmentalImpact).length === 0) return null;

  // PropertyBars handles grouped properties automatically
  // It will render each category with its label and properties
  return (
    <div className={className}>
      <PropertyBars 
        metadata={{ environmental_impact: environmentalImpact }}
        dataSource="materialProperties"
      />
      
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
    </div>
  );
}
