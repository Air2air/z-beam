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
    </div>
  );
}
