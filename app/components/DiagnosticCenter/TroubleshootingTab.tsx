// app/components/DiagnosticCenter/TroubleshootingTab.tsx

interface Issue {
  symptom: string;
  causes: string[];
  solutions: string[];
  verification: string;
  prevention: string;
}

interface TroubleshootingTabProps {
  issues: Issue[];
}

/**
 * TroubleshootingTab - Symptom-based problem diagnosis and resolution
 * Focus: Reactive problem-solving when issues occur
 */
export function TroubleshootingTab({ issues }: TroubleshootingTabProps) {
  if (!issues || issues.length === 0) {
    return (
      <div className="text-center py-12 text-tertiary">
        <p>No troubleshooting guides available for this material.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {issues.map((issue, idx) => (
        <div key={idx} className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg overflow-hidden border">
          {/* Symptom Header - Prominent Display */}
          <div className="bg-gradient-to-r from-red-900/30 to-transparent px-4 py-3 border-l-4 border-red-500">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
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
            <div className="bg-orange-900/10 rounded-lg p-3 border border-orange-900/30">
              <h4 className="text-sm text-secondary font-semibold text-secondary mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
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
            <div className="bg-green-900/10 rounded-lg p-3 border border-green-900/30">
              <h4 className="text-sm text-secondary font-semibold text-secondary mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
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
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-blue-900/10 rounded-lg p-3 border border-blue-900/30">
                <h4 className="text-sm text-secondary font-semibold text-secondary mb-1.5 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Verify Fix
                </h4>
                <p className="text-xs">{issue.verification}</p>
              </div>
              
              <div className="bg-purple-900/10 rounded-lg p-3 border border-purple-900/30">
                <h4 className="text-sm text-secondary font-semibold text-secondary mb-1.5 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
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
}
