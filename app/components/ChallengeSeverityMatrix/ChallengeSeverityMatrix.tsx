// app/components/ChallengeSeverityMatrix/ChallengeSeverityMatrix.tsx
'use client';

import React, { useState } from 'react';

interface Challenge {
  challenge: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  impact: string;
  solutions: string[];
  prevention: string;
}

interface ChallengeSeverityMatrixProps {
  challenges: Challenge[];
  categories: string[];
}

/**
 * Visual matrix showing challenges by severity and category
 * Bubble size indicates impact magnitude, color indicates time to fix
 */
export const ChallengeSeverityMatrix: React.FC<ChallengeSeverityMatrixProps> = ({
  challenges,
  categories,
}) => {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  const severityLevels: Array<'critical' | 'high' | 'medium' | 'low'> = [
    'critical',
    'high',
    'medium',
    'low',
  ];

  const severityLabels = {
    critical: { label: 'Critical', icon: '🔴', color: 'bg-red-500' },
    high: { label: 'High', icon: '🟠', color: 'bg-orange-500' },
    medium: { label: 'Medium', icon: '🟡', color: 'bg-yellow-500' },
    low: { label: 'Low', icon: '🟢', color: 'bg-green-500' },
  };

  const categoryIcons: Record<string, string> = {
    surface_characteristics: '🧹',
    thermal_management: '🌡️',
    contamination_challenges: '⚠️',
    safety_compliance: '🛡️',
    mechanical_stress: '⚙️',
    optical_issues: '👁️',
  };

  // Group challenges by severity and category
  const matrixData = severityLevels.map((severity) => ({
    severity,
    categories: categories.map((category) => {
      const categoryName = category.toLowerCase().replace(/\s+/g, '_');
      return challenges.filter(
        (c) => c.severity === severity && c.category === categoryName
      );
    }),
  }));

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {/* Title */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Challenge Severity Matrix</h3>
        <p className="text-sm text-gray-400">
          Visual overview of material challenges. Bubble size = impact magnitude. Click to view details.
        </p>
      </div>

      {/* Matrix Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header Row */}
          <div className="grid grid-cols-[120px_repeat(auto-fit,minmax(150px,1fr))] gap-2 mb-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Severity
            </div>
            {categories.map((category, idx) => (
              <div
                key={idx}
                className="text-xs font-semibold text-gray-300 text-center truncate"
                title={category}
              >
                <span className="text-lg">
                  {categoryIcons[category.toLowerCase().replace(/\s+/g, '_')] || '📋'}
                </span>
                <div className="mt-1">{category.replace(/_/g, ' ')}</div>
              </div>
            ))}
          </div>

          {/* Matrix Rows */}
          {matrixData.map(({ severity, categories: categoryGroups }) => (
            <div
              key={severity}
              className="grid grid-cols-[120px_repeat(auto-fit,minmax(150px,1fr))] gap-2 mb-3"
            >
              {/* Severity Label */}
              <div
                className={`flex items-center justify-center rounded-lg p-3 ${
                  severity === 'critical'
                    ? 'bg-red-900/30 border border-red-500/50'
                    : severity === 'high'
                    ? 'bg-orange-900/30 border border-orange-500/50'
                    : severity === 'medium'
                    ? 'bg-yellow-900/30 border border-yellow-500/50'
                    : 'bg-green-900/30 border border-green-500/50'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{severityLabels[severity].icon}</div>
                  <div className="text-xs font-bold text-white">
                    {severityLabels[severity].label}
                  </div>
                </div>
              </div>

              {/* Category Cells */}
              {categoryGroups.map((challenges, catIdx) => (
                <div
                  key={catIdx}
                  className="bg-gray-900/50 rounded-lg p-3 min-h-[100px] flex flex-wrap items-center justify-center gap-2"
                >
                  {challenges.length === 0 ? (
                    <div className="text-gray-600 text-xs">—</div>
                  ) : (
                    challenges.map((challenge, chIdx) => (
                      <button
                        key={chIdx}
                        onClick={() => setSelectedChallenge(challenge)}
                        className={`relative group ${
                          severity === 'critical'
                            ? 'w-10 h-10 bg-red-500'
                            : severity === 'high'
                            ? 'w-8 h-8 bg-orange-500'
                            : severity === 'medium'
                            ? 'w-6 h-6 bg-yellow-500'
                            : 'w-5 h-5 bg-green-500'
                        } rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer flex items-center justify-center text-white text-xs font-bold`}
                        title={challenge.challenge}
                      >
                        {challenges.length > 1 && chIdx + 1}
                        
                        {/* Pulse animation for critical */}
                        {severity === 'critical' && (
                          <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-red-500 rounded-full"></div>
          <span>Critical (Large)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-full"></div>
          <span>High (Medium)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-yellow-500 rounded-full"></div>
          <span>Medium (Small)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-green-500 rounded-full"></div>
          <span>Low (Tiny)</span>
        </div>
      </div>

      {/* Challenge Details Modal */}
      {selectedChallenge && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedChallenge(null)}
        >
          <div
            className="bg-gray-800 rounded-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">
                    {severityLabels[selectedChallenge.severity].icon}
                  </span>
                  <span
                    className={`px-3 py-1 rounded text-xs font-bold uppercase ${
                      selectedChallenge.severity === 'critical'
                        ? 'bg-red-900/30 text-red-300'
                        : selectedChallenge.severity === 'high'
                        ? 'bg-orange-900/30 text-orange-300'
                        : selectedChallenge.severity === 'medium'
                        ? 'bg-yellow-900/30 text-yellow-300'
                        : 'bg-green-900/30 text-green-300'
                    }`}
                  >
                    {selectedChallenge.severity} Severity
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  {selectedChallenge.challenge}
                </h3>
              </div>
              <button
                onClick={() => setSelectedChallenge(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* Impact */}
            <div className="mb-4 p-3 bg-red-900/10 border-l-2 border-red-500 rounded">
              <div className="text-xs font-semibold text-red-400 uppercase mb-1">
                Impact
              </div>
              <div className="text-sm text-gray-300">{selectedChallenge.impact}</div>
            </div>

            {/* Solutions */}
            <div className="mb-4 p-3 bg-green-900/10 border-l-2 border-green-500 rounded">
              <div className="text-xs font-semibold text-green-400 uppercase mb-2">
                Solutions
              </div>
              <ul className="space-y-2">
                {selectedChallenge.solutions.map((solution, idx) => (
                  <li key={idx} className="text-sm text-gray-300 flex gap-2">
                    <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                    <span>{solution}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prevention */}
            <div className="p-3 bg-blue-900/10 border-l-2 border-blue-500 rounded">
              <div className="text-xs font-semibold text-blue-400 uppercase mb-1">
                Prevention
              </div>
              <div className="text-sm text-gray-300">{selectedChallenge.prevention}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
