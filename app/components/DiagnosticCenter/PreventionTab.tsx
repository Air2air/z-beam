// app/components/DiagnosticCenter/PreventionTab.tsx

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
    <div className="grid md:grid-cols-2 gap-4">
      {Object.entries(challenges).map(([category, challengeList]: [string, Challenge[]]) => (
        <div key={category} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-md border overflow-hidden">
          {/* Category Header with Icon */}
          <div className="bg-tertiary px-4 py-2 border-b">
            <h3 className="text-lg text-secondary font-semibold flex items-center gap-2">
              <span className="text-blue-400">
                {category === 'surface_characteristics' && '🔍'}
                {category === 'thermal_management' && '🌡️'}
                {category === 'contamination_challenges' && '🧹'}
                {category === 'safety_compliance' && '⚠️'}
                {category === 'surface_contamination' && '🧹'}
                {category === 'thermal_effects' && '🌡️'}
                {category === 'mechanical_stress' && '⚙️'}
                {category === 'optical_issues' && '👁️'}
              </span>
              <span className="capitalize">{category.replace(/_/g, ' ')}</span>
            </h3>
          </div>
          
          {/* Challenges List */}
          <div className="p-3 space-y-2">
            {Array.isArray(challengeList) && challengeList.map((challenge, idx) => (
              <details key={idx} className="group bg-secondary rounded border hover:border-gray-600 transition-colors">
                <summary className="cursor-pointer p-2 flex items-center gap-2 select-none">
                  {/* Severity Indicator - Visual Dot */}
                  <span className={`flex-shrink-0 w-2 h-2 rounded-full ${
                    challenge.severity === 'critical' ? 'bg-red-500 shadow-lg shadow-red-500/50' :
                    challenge.severity === 'high' ? 'bg-orange-500 shadow-lg shadow-orange-500/50' :
                    challenge.severity === 'medium' ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' :
                    'bg-green-500 shadow-lg shadow-green-500/50'
                  }`} />
                  
                  {/* Challenge Title */}
                  <h4 className="font-semibold text-sm text-secondary flex-1 transition-colors">
                    {challenge.challenge}
                  </h4>
                  
                  {/* Expand Icon */}
                  <svg className="w-4 h-4 text-tertiary group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                
                {/* Expanded Content */}
                <div className="px-3 pb-2 space-y-2 border-t/50 pt-2 mt-1">
                  {/* Impact */}
                  <div className="bg-red-900/10 border-l-2 border-red-500 pl-2 py-1">
                    <p className="text-xs">
                      <span className="font-semibold text-red-400">Impact:</span> {challenge.impact}
                    </p>
                  </div>
                  
                  {/* Solutions */}
                  <div className="bg-green-900/10 border-l-2 border-green-500 pl-2 py-1">
                    <p className="text-xs font-semibold text-green-400 mb-1">Solutions:</p>
                    <ul className="space-y-0.5">
                      {challenge.solutions.map((solution: string, sidx: number) => (
                        <li key={sidx} className="text-xs flex items-start gap-1">
                          <span className="text-green-400 mt-0.5">✓</span>
                          <span>{solution}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Prevention */}
                  <div className="bg-orange-900/10 border-l-2 border-orange-500 pl-2 py-1">
                    <p className="text-xs">
                      <span className="font-semibold text-blue-400">Prevention:</span> {challenge.prevention}
                    </p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
