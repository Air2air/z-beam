// app/components/DiagnosticCenter/QuickReferencePanel.tsx
'use client';

import { GRID_GAP_RESPONSIVE } from '@/app/config/site';

interface Challenge {
  challenge: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  impact: string;
  solutions: string[];
  prevention: string;
}

interface Issue {
  symptom: string;
  causes: string[];
  solutions: string[];
  verification: string;
  prevention: string;
}

interface QuickReferencePanelProps {
  challenges: {
    [category: string]: Challenge[];
  };
  issues: Issue[];
}

/**
 * QuickReferencePanel - Combined overview with severity matrix and quick access
 * Rendered as independent collapsible section
 */
export function QuickReferencePanel({ challenges, issues }: QuickReferencePanelProps) {
  // Flatten all challenges with their category
  const allChallenges = Object.entries(challenges || {}).flatMap(([category, challengeList]) =>
    challengeList.map(challenge => ({ ...challenge, category }))
  );

  // Group by severity
  const bySeverity = {
    critical: allChallenges.filter(c => c.severity === 'critical'),
    high: allChallenges.filter(c => c.severity === 'high'),
    medium: allChallenges.filter(c => c.severity === 'medium'),
    low: allChallenges.filter(c => c.severity === 'low'),
  };

  const content = (
    <div className={`grid md:grid-cols-2 ${GRID_GAP_RESPONSIVE}`}>
      {/* Left Column: Challenges by Severity */}
      <div className="bg-secondary rounded-md p-4 border">
        <h3 className="text-lg text-secondary font-semibold mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Challenges by Severity
        </h3>
        
        <div className="space-y-3">
          {/* Critical */}
          {bySeverity.critical.length > 0 && (
            <div className="bg-red-900/20 rounded-md p-3 border border-red-900/50">
              <h4 className="text-sm text-secondary font-semibold text-secondary mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
                Critical ({bySeverity.critical.length})
              </h4>
              <ul className="space-y-1">
                {bySeverity.critical.map((challenge, idx) => (
                  <li key={idx} className="text-xs">
                    • {challenge.challenge}
                    <span className="text-muted ml-1">({challenge.category.replace(/_/g, ' ')})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* High */}
          {bySeverity.high.length > 0 && (
            <div className="bg-orange-900/20 rounded-md p-3 border border-orange-900/50">
              <h4 className="text-sm text-secondary font-semibold text-secondary mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50" />
                High Priority ({bySeverity.high.length})
              </h4>
              <ul className="space-y-1">
                {bySeverity.high.map((challenge, idx) => (
                  <li key={idx} className="text-xs">
                    • {challenge.challenge}
                    <span className="text-muted ml-1">({challenge.category.replace(/_/g, ' ')})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Medium */}
          {bySeverity.medium.length > 0 && (
            <div className="bg-yellow-900/20 rounded-md p-3 border border-yellow-900/50">
              <h4 className="text-sm text-secondary font-semibold text-secondary mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50" />
                Medium Priority ({bySeverity.medium.length})
              </h4>
              <ul className="space-y-1">
                {bySeverity.medium.slice(0, 3).map((challenge, idx) => (
                  <li key={idx} className="text-xs">
                    • {challenge.challenge}
                  </li>
                ))}
                {bySeverity.medium.length > 3 && (
                  <li className="text-xs text-muted italic">
                    + {bySeverity.medium.length - 3} more...
                  </li>
                )}
              </ul>
            </div>
          )}
          
          {/* Low */}
          {bySeverity.low.length > 0 && (
            <div className="bg-green-900/20 rounded-md p-3 border border-green-900/50">
              <h4 className="text-sm text-secondary font-semibold text-secondary mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
                Low Priority ({bySeverity.low.length})
              </h4>
              <p className="text-xs text-tertiary">
                Minor concerns - see Prevention tab for details
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Right Column: Common Issues by Symptom */}
      <div className="bg-secondary rounded-md p-4 border">
        <h3 className="text-lg text-secondary font-semibold mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Common Issues
        </h3>
        
        {issues && issues.length > 0 ? (
          <div className="space-y-2">
            {issues.map((issue, idx) => (
              <div key={idx} className="bg-tertiary rounded-md p-3 border hover:border-orange-500/50 transition-colors">
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500 flex items-center justify-center text-orange-400 font-semibold text-xs">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <h4 className="text-sm text-secondary font-semibold mb-1">
                      {issue.symptom}
                    </h4>
                    <p className="text-xs text-tertiary">
                      {issue.causes.length} possible cause{issue.causes.length !== 1 ? 's' : ''} • {issue.solutions.length} solution{issue.solutions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-tertiary">No common issues documented.</p>
        )}
        
        {/* Quick Decision Helper */}
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm text-secondary font-semibold text-secondary mb-2">Quick Decision Helper</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <span className="text-purple-400">→</span>
              <span>Start with <strong>Prevention First</strong> tab before beginning work</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400">→</span>
              <span>Use <strong>Fix Issues</strong> tab when problems occur</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400">→</span>
              <span>Focus on <strong className="text-red-400">Critical</strong> and <strong className="text-orange-400">High</strong> severity items first</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <details className="bg-secondary rounded-lg border overflow-hidden group">
      <summary className="cursor-pointer px-4 py-3 font-semibold flex items-center gap-2 hover:bg-gray-800/50 transition-colors list-none">
        <span className="text-lg">📊</span>
        <div className="flex-1">
          <h3 className="text-base text-secondary">Quick Reference</h3>
          <p className="text-sm text-tertiary font-normal">At-a-glance overview with severity matrix and decision support</p>
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
