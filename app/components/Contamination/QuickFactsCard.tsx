/**
 * @component QuickFactsCard
 * @purpose Display quick metrics for contamination pattern removal
 * @extends SectionContainer for consistent styling
 */
'use client';

import { BaseSection } from '../BaseSection/BaseSection';
import { getSectionIcon } from '@/app/config/sectionIcons';
import { getGridClasses } from '@/app/utils/gridConfig';
import { GRID_GAP_RESPONSIVE } from '@/app/config/site';

interface QuickFact {
  removal_efficiency: string;
  process_speed: string;
  substrate_safety: string;
  key_benefit: string;
  typical_applications: string[];
}

interface QuickFactsCardProps {
  facts: QuickFact;
}

export function QuickFactsCard({ facts }: QuickFactsCardProps) {
  return (
    <BaseSection 
      variant="dark" 
      spacing="tight"
      title="Quick Facts"
      description="Key information and important facts"
      icon={getSectionIcon('zap')}
    >
      <div className="container-custom px-4">
        <div className="bg-gray-800/50 border border-orange-500/30 rounded-md p-6">
          
          {/* Metrics Grid */}
          <div className={`grid grid-cols-2 md:grid-cols-4 ${GRID_GAP_RESPONSIVE} mb-6`}>
            <div className="text-center">
              <div className="text-3xl mb-1">⚡</div>
              <div className="text-sm text-gray-400 mb-1">Removal Efficiency</div>
              <div className="text-lg font-semibold text-white">{facts.removal_efficiency}</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-1">🚀</div>
              <div className="text-sm text-gray-400 mb-1">Process Speed</div>
              <div className="text-lg font-semibold text-white">{facts.process_speed}</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-1">✓</div>
              <div className="text-sm text-gray-400 mb-1">Substrate Safety</div>
              <div className="text-lg font-semibold text-white">{facts.substrate_safety}</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-1">🌱</div>
              <div className="text-sm text-gray-400 mb-1">Key Benefit</div>
              <div className="text-lg font-semibold text-white">{facts.key_benefit}</div>
            </div>
          </div>
          
          {/* Applications */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Typical Applications:</h3>
            <ul className={getGridClasses({ columns: 2, gap: 'md' })}>
              {facts.typical_applications.map((app, i) => (
                <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">•</span>
                  <span>{app}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </BaseSection>
  );
}
