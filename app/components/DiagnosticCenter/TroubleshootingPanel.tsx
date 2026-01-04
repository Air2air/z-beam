// app/components/DiagnosticCenter/TroubleshootingPanel.tsx
'use client';

import { GRID_GAP_RESPONSIVE } from '@/app/config/site';
import { AlertTriangle, ChevronDown, ClipboardList, CheckCircle, ClipboardCheck, Lock } from 'lucide-react';

interface Issue {
  symptom: string;
  causes: string[];
  solutions: string[];
  verification: string;
  prevention: string;
}

interface TroubleshootingPanelProps {
  issues: Issue[];
}

/**
 * TroubleshootingPanel - Symptom-based problem diagnosis and resolution
 * Rendered as independent collapsible section
 */
export function TroubleshootingPanel({ issues }: TroubleshootingPanelProps) {
  const content = !issues || issues.length === 0 ? (
    <div className="text-center py-8 text-tertiary">
      <p>No troubleshooting guides available for this material.</p>
    </div>
  ) : (
    <div className="space-y-3">
      {issues.map((issue, idx) => (
        <div key={idx} className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-md overflow-hidden">
          {/* Symptom Header - Prominent Display */}
          <div className="bg-gradient-to-r from-red-900/30 to-transparent px-4 py-3 border-l-4 border-red-500">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-base text-secondary font-semibold mb-1">
                  {issue.symptom}
                </h3>
                <div className="text-xs text-tertiary">Issue #{idx + 1} • Common Problem</div>
              </div>
            </div>
          </div>
          
          {/* Diagnostic Flow */}
          <div className="p-4 space-y-3">
            {/* Possible Causes - With Icons */}
            <div className="bg-orange-900/10 rounded-md p-3">
              <h4 className="text-sm text-secondary font-semibold text-secondary mb-2 flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Possible Causes
              </h4>
              <ul className="space-y-1">
                {issue.causes.map((cause: string, cidx: number) => (
                  <li key={cidx} className="text-xs flex items-start gap-2">
                    <span className="text-orange-400 font-bold mt-0.5">{cidx + 1}.</span>
                    <span>{cause}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Solutions - Action Steps */}
            <div className="bg-green-900/10 rounded-md p-3">
              <h4 className="text-sm text-secondary font-semibold text-secondary mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Solution Steps
              </h4>
              <ol className="space-y-1.5">
                {issue.solutions.map((solution: string, sidx: number) => (
                  <li key={sidx} className="text-xs flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center text-green-400 font-semibold text-[10px]">
                      {sidx + 1}
                    </span>
                    <span className="flex-1 pt-0.5">{solution}</span>
                  </li>
                ))}
              </ol>
            </div>
            
            {/* Verification & Prevention - Side by Side */}
            <div className={`grid md:grid-cols-2 ${GRID_GAP_RESPONSIVE}`}>
              <div className="bg-orange-900/10 rounded-md p-3">
                <h4 className="text-sm text-secondary font-semibold text-secondary mb-1.5 flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4" />
                  Verify Fix
                </h4>
                <p className="text-xs">{issue.verification}</p>
              </div>
              
              <div className="bg-purple-900/10 rounded-md p-3">
                <h4 className="text-sm text-secondary font-semibold text-secondary mb-1.5 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Prevention
                </h4>
                <p className="text-xs">{issue.prevention}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <details className="bg-secondary rounded-lg overflow-hidden group">
      <summary className="cursor-pointer px-4 py-3 font-semibold flex items-center gap-2 hover:bg-gray-800/50 transition-colors list-none">
        <AlertTriangle className="w-5 h-5 text-orange-500" />
        <div className="flex-1">
          <h3 className="text-base text-secondary">Fix Issues</h3>
          <p className="text-sm text-tertiary font-normal">Symptom-based diagnosis and solutions for active problems</p>
        </div>
        <ChevronDown className="w-5 h-5 text-tertiary transition-transform group-open:rotate-180" />
      </summary>
      <div className="p-4">
        {content}
      </div>
    </details>
  );
}
