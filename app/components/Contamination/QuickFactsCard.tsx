/**
 * @component QuickFactsCard
 * @purpose Display quick metrics for contamination pattern removal
 * @extends SectionContainer for consistent styling
 */
'use client';

import { SectionContainer } from '../SectionContainer/SectionContainer';
import { getGridClasses } from '@/app/utils/gridConfig';

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
    <SectionContainer variant="dark" className="py-8 mb-8">
      <div className="container-custom px-4">
        <div className="bg-gray-800/50 border border-blue-500/30 rounded-md p-6">
          <h2 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
            <span>⚡</span> Quick Facts
          </h2>
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>{app}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
