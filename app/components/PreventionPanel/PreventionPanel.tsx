/**
 * PreventionPanel Component - Consolidated re-export
 * 
 * Consolidated from duplicate implementations:
 * - DiagnosticCenter/PreventionPanel: Slim native <details> implementation (112 lines)
 * - PreventionPanel/PreventionPanel: Collapsible wrapper (was 181 lines)
 * 
 * Architecture: Core implementation uses native <details> elements
 * Wrapper adapts data for Collapsible component compatibility when needed
 * 
 * @module components/PreventionPanel
 */

'use client';

import { CheckCircle, ChevronDown } from 'lucide-react';

interface Challenge {
  challenge: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  impact: string;
  solutions: string[];
  prevention: string | string[];
}

interface PreventionData {
  [category: string]: Challenge[];
}

interface PreventionPanelProps {
  challenges: PreventionData;
  title?: string;
  description?: string;
  className?: string;
}

/**
 * Slim, direct PreventionPanel - Consolidated core implementation
 * Uses native <details> elements with consistent styling
 */
export function PreventionPanel({ 
  challenges, 
  className = '' 
}: PreventionPanelProps) {
  if (!challenges || Object.keys(challenges).length === 0) {
    return (
      <details className="bg-secondary rounded-lg overflow-hidden group" open>
        <summary className="cursor-pointer px-4 py-3 font-semibold flex items-center gap-2 hover:bg-gray-800/50 transition-colors list-none">
          <CheckCircle className="w-5 h-5 text-orange-500" />
          <div className="flex-1">
            <h3 className="text-base text-secondary">Prevention First</h3>
            <p className="text-sm text-tertiary font-normal">Proactive strategies to avoid problems before they occur</p>
          </div>
          <ChevronDown className="w-5 h-5 text-tertiary transition-transform group-open:rotate-180" />
        </summary>
        <div className="p-4">
          <div className="text-center py-8 text-tertiary">
            <p>No prevention strategies available for this material.</p>
          </div>
        </div>
      </details>
    );
  }

  const content = (
    <div className="space-y-2">
      {Object.entries(challenges).flatMap(([category, challengeList]: [string, Challenge[]]) => {
        // Skip non-array values
        if (!Array.isArray(challengeList)) {
          return [];
        }
        return challengeList.map((challenge, idx) => (
          <details key={`${category}-${idx}`} className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-md overflow-hidden group">
            <summary className="cursor-pointer px-4 py-3 hover:bg-gray-800/50 transition-colors list-none flex items-center justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-base text-secondary font-semibold">
                    {challenge.challenge}
                  </h3>
                  <div className="text-base text-tertiary capitalize mt-0.5">
                    {category.replace(/_/g, ' ')} {challenge.severity ? `• ${challenge.severity} severity` : ''}
                  </div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-tertiary transition-transform group-open:rotate-180 flex-shrink-0" />
            </summary>
            
            <div className="p-4 space-y-3">
              {challenge.impact && (
                <div className="bg-orange-900/10 rounded-md p-3">
                  <h4 className="text-base text-secondary font-semibold mb-2">Impact</h4>
                  <p className="text-base text-tertiary">{challenge.impact}</p>
                </div>
              )}
              
              {challenge.solutions && challenge.solutions.length > 0 && (
                <div className="bg-green-900/10 rounded-md p-3">
                  <h4 className="text-base text-secondary font-semibold mb-2">Prevention Solutions</h4>
                  <ul className="space-y-1.5">
                    {challenge.solutions.map((solution: string, sidx: number) => (
                      <li key={sidx} className="text-base flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-semibold text-xs">
                          {sidx + 1}
                        </span>
                        <span className="flex-1 pt-0.5 text-tertiary">{solution}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {challenge.prevention && (
                <div className="bg-purple-900/10 rounded-md p-3">
                  <h4 className="text-base text-secondary font-semibold mb-2">Threshold</h4>
                  <p className="text-base text-tertiary">
                    {Array.isArray(challenge.prevention) 
                      ? challenge.prevention.join('; ') 
                      : challenge.prevention}
                  </p>
                </div>
              )}
            </div>
          </details>
        ));
      })}
    </div>
  );

  return (
    <div className={className}>
      <details className="bg-secondary rounded-lg overflow-hidden group" open>
        <summary className="cursor-pointer px-4 py-3 font-semibold flex items-center gap-2 hover:bg-gray-800/50 transition-colors list-none">
          <CheckCircle className="w-5 h-5 text-orange-500" />
          <div className="flex-1">
            <h3 className="text-base text-secondary">Prevention First</h3>
            <p className="text-sm text-tertiary font-normal">Proactive strategies to avoid problems before they occur</p>
          </div>
          <ChevronDown className="w-5 h-5 text-tertiary transition-transform group-open:rotate-180" />
        </summary>
        <div className="p-4">
          {content}
        </div>
      </details>
    </div>
  );
}

/**
 * Export types for use in other components
 */
export type { Challenge, PreventionData };
