/**
 * @component IndustriesGrid
 * @purpose Display industries served for contamination patterns
 * @extends SectionContainer, SectionTitle, Badge components
 */
'use client';

import { BaseSection } from '../BaseSection/BaseSection';
import { getSectionIcon } from '@/app/config/sectionIcons';
import { getGridClasses } from '@/app/utils/gridConfig';
import { Badge } from '../Badge/Badge';

interface Industry {
  name: string;
  use_cases: string[];
  materials: string[];
  frequency: 'very_high' | 'high' | 'moderate' | 'low';
}

interface IndustriesGridProps {
  industries: Industry[];
}

export function IndustriesGrid({ industries }: IndustriesGridProps) {
  const getFrequencyVariant = (frequency: string) => {
    switch (frequency) {
      case 'very_high': return 'success';
      case 'high': return 'info';
      case 'moderate': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <BaseSection 
      variant="dark" 
      spacing="loose"
      title="Industries Served"
      description="Primary applications for contamination removal"
      icon={getSectionIcon('building')}
    >
      <div className="container-custom px-4">
        
        <div className={getGridClasses({ columns: 1, gap: 'md' })}>
          {industries.map((industry, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-md p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">{industry.name}</h3>
                <Badge 
                  variant={getFrequencyVariant(industry.frequency) as any}
                  size="sm"
                >
                  {industry.frequency.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Common Use Cases:</h4>
                <ul className="space-y-1">
                  {industry.use_cases.map((useCase, j) => (
                    <li key={j} className="text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-orange-400 mt-0.5">•</span>
                      <span>{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Materials Processed:</h4>
                <div className="flex flex-wrap gap-2">
                  {industry.materials.map((material, j) => (
                    <Badge key={j} variant="secondary" size="sm">
                      {material}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BaseSection>
  );
}
