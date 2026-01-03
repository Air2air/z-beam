// app/components/DiagnosticCenter/PreventionTab.tsx

import { PreventionPanel } from '../PreventionPanel';
import { GRID_GAP_RESPONSIVE } from '@/app/config/site';
import type { RelationshipSection } from '@/types/safetyData';

interface Challenge {
  challenge: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  impact: string;
  solutions: string[];
  prevention: string;
}

interface PreventionTabProps {
  challenges: {
    [category: string]: Challenge[];
  };
}

/**
 * PreventionTab - Material-specific challenges organized by category
 * Focus: Proactive planning and awareness before starting work
 * Uses PreventionPanel for normalized collapsible UI
 */
export function PreventionTab({ challenges }: PreventionTabProps) {
  if (!challenges || Object.keys(challenges).length === 0) {
    return (
      <div className="text-center py-12 text-tertiary">
        <p>No prevention strategies available for this material.</p>
      </div>
    );
  }

  return (
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
          <PreventionPanel
            key={category}
            sectionMetadata={sectionMetadata}
            items={items}
          />
        );
      })}
    </div>
  );
}
