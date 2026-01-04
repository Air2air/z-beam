// app/components/DiagnosticCenter/PreventionPanel.tsx
'use client';

import { PreventionPanel as PreventionDataPanel } from '../PreventionPanel';
import { GRID_GAP_RESPONSIVE } from '@/app/config/site';
import type { RelationshipSection } from '@/types/safetyData';

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
      <details className="bg-secondary rounded-lg border overflow-hidden">
        <summary className="cursor-pointer px-4 py-3 font-semibold flex items-center gap-2 hover:bg-gray-800/50 transition-colors">
          <span className="text-lg">✅</span>
          <div className="flex-1">
            <h3 className="text-base text-secondary">Prevention First</h3>
            <p className="text-sm text-tertiary font-normal">Proactive strategies to avoid problems before they occur</p>
          </div>
          <svg className="w-5 h-5 text-tertiary transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
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
    <div className={`grid md:grid-cols-2 ${GRID_GAP_RESPONSIVE}`}>
      {Object.entries(challenges).map(([category, challengeList]: [string, Challenge[]]) => {
        // Map category to icon
        const categoryIcons: Record<string, string> = {
          surface_characteristics: 'search',
          thermal_management: 'temperature',
          contamination_challenges: 'clean',
          safety_compliance: 'alert',
          surface_contamination: 'clean',
          thermal_effects: 'temperature',
          mechanical_stress: 'gear',
          optical_issues: 'eye'
        };

        const sectionMetadata: RelationshipSection = {
          section_title: category.replace(/_/g, ' '),
          section_description: undefined,
          icon: categoryIcons[category] || 'info',
          order: 0
        };

        // Transform challenges to items array for PreventionPanel
        const items = Array.isArray(challengeList) ? challengeList.map(challenge => ({
          challengeName: challenge.challenge,
          challengeDesc: challenge.impact,
          severity: challenge.severity,
          solutions: challenge.solutions,
          prevention: challenge.prevention
        })) : [];

        return (
          <PreventionDataPanel
            key={category}
            sectionMetadata={sectionMetadata}
            items={items}
          />
        );
      })}
    </div>
  );

  return (
    <details className="bg-secondary rounded-lg border overflow-hidden group" open>
      <summary className="cursor-pointer px-4 py-3 font-semibold flex items-center gap-2 hover:bg-gray-800/50 transition-colors list-none">
        <span className="text-lg">✅</span>
        <div className="flex-1">
          <h3 className="text-base text-secondary">Prevention First</h3>
          <p className="text-sm text-tertiary font-normal">Proactive strategies to avoid problems before they occur</p>
        </div>
        <svg className="w-5 h-5 text-tertiary transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="p-4">
        {content}
      </div>
    </details>
  );
}
