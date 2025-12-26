/**
 * @component EnvironmentalImpact
 * @purpose Displays environmental impact metrics and safety data
 * @dependencies PropertyGrid, @/types (EnvironmentalImpactProps)
 * @related Layout.tsx
 * @complexity Simple (uses PropertyGrid for categorized metrics)
 * @aiContext Pass frontmatter.environmentalImpact object. Component renders
 *           categorized environmental metrics including emissions, energy, and safety.
 */
// app/components/EnvironmentalImpact/EnvironmentalImpact.tsx

import { PropertyGrid } from '../PropertyGrid/PropertyGrid';
import { Leaf } from 'lucide-react';

export interface EnvironmentalImpactProps {
  environmentalImpact: Record<string, any>;
  className?: string;
}

/**
 * Displays environmental impact metrics using PropertyGrid
 * with consistent title and layout styling
 */
export function EnvironmentalImpact({
  environmentalImpact,
  className = ''
}: EnvironmentalImpactProps) {
  if (!environmentalImpact || Object.keys(environmentalImpact).length === 0) return null;

  return (
    <PropertyGrid
      metadata={{ environmental_impact: environmentalImpact }}
      dataSource="materialProperties"
      title="Environmental Impact"
      icon={<Leaf className="w-5 h-5 text-green-500" />}
      className={className}
    />
  );
}
