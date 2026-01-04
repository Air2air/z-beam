// app/components/DiagnosticCenter/PreventionPanel.tsx
'use client';

import { GRID_GAP_RESPONSIVE } from '@/app/config/site';
import { CheckCircle, ChevronDown } from 'lucide-react';

interface Challenge {
  challenge: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  impact: string;
  solutions: string[];
  prevention: string;
}

interface PreventionPanelProps {
  challenges: {
    [category: string]: Challenge[];
  };
}

/**
 * PreventionPanel - Material-specific challenges organized by category
 * Rendered as independent collapsible section
 */
export function PreventionPanel({ challenges }: PreventionPanelProps) {
  if (!challenges || Object.keys(challenges).length === 0) {
    return (
      <details className="bg-secondary rounded-lg overflow-hidden">
        <summary className="cursor-pointer px-4 py-3 font-semibold flex items-center gap-2 hover:bg-gray-800/50 transition-colors">
          <CheckCircle className="w-5 h-5 text-green-500" />
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
      {Object.entries(challenges).flatMap(([category, challengeList]: [string, Challenge[]]) =>
        challengeList.map((challenge, idx) => (
          <details key={`${category}-${idx}`} className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-md overflow-hidden group">
            <summary className="cursor-pointer px-4 py-3 border-l-4 border-green-500 hover:bg-gray-800/50 transition-colors list-none flex items-center justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm text-secondary font-semibold">
                    {challenge.challenge}
                  </h3>
                  <div className="text-xs text-tertiary capitalize mt-0.5">{category.replace(/_/g, ' ')} • {challenge.severity} severity</div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-tertiary transition-transform group-open:rotate-180 flex-shrink-0" />
            </summary>
            
            <div className="p-4 space-y-3">
              <div className="bg-orange-900/10 rounded-md p-3">
                <h4 className="text-sm text-secondary font-semibold mb-2">Impact</h4>
                <p className="text-xs text-tertiary">{challenge.impact}</p>
              </div>
              
              <div className="bg-green-900/10 rounded-md p-3">
                <h4 className="text-sm text-secondary font-semibold mb-2">Prevention Solutions</h4>
                <ul className="space-y-1.5">
                  {challenge.solutions.map((solution: string, sidx: number) => (
                    <li key={sidx} className="text-xs flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center text-green-400 font-semibold text-[10px]">
                        {sidx + 1}
                      </span>
                      <span className="flex-1 pt-0.5 text-tertiary">{solution}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {challenge.prevention && (
                <div className="bg-purple-900/10 rounded-md p-3">
                  <h4 className="text-sm text-secondary font-semibold mb-2">Threshold</h4>
                  <p className="text-xs text-tertiary">{challenge.prevention}</p>
                </div>
              )}
            </div>
          </details>
        ))
      )}
    </div>
  );

  return (
    <details className="bg-secondary rounded-lg overflow-hidden group" open>
      <summary className="cursor-pointer px-4 py-3 font-semibold flex items-center gap-2 hover:bg-gray-800/50 transition-colors list-none">
        <CheckCircle className="w-5 h-5 text-green-500" />
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
  );
}
