// app/components/Heatmap/HeatmapStatusSummary.tsx
'use client';

import React from 'react';

interface HeatmapStatusSummaryProps {
  power: number;
  pulse: number;
  level: number;
  finalScore: number;
  scoreLabel: string;
  scoreType: 'safety' | 'effectiveness';
}

/**
 * HeatmapStatusSummary - Reusable status summary card for heatmap panels
 * Shows current parameters, score, and progress bar
 */
export const HeatmapStatusSummary: React.FC<HeatmapStatusSummaryProps> = ({
  power,
  pulse,
  level,
  finalScore,
  scoreLabel,
  scoreType,
}) => {
  // Determine color based on level
  const getColorClass = () => {
    if (scoreType === 'effectiveness') {
      if (level >= 20) return 'text-green-400';
      if (level >= 15) return 'text-lime-400';
      if (level >= 10) return 'text-yellow-400';
      return 'text-red-400';
    }
    // Safety
    if (level >= 20) return 'text-green-400';
    if (level >= 15) return 'text-yellow-400';
    if (level >= 9) return 'text-orange-400';
    return 'text-red-400';
  };

  const getBgClass = () => {
    if (scoreType === 'effectiveness') {
      if (level >= 20) return 'bg-green-900/20 border-green-500/50';
      if (level >= 15) return 'bg-lime-900/20 border-lime-500/50';
      if (level >= 10) return 'bg-yellow-900/20 border-yellow-500/50';
      return 'bg-red-900/20 border-red-500/50';
    }
    // Safety
    if (level >= 20) return 'bg-green-900/20 border-green-500/50';
    if (level >= 15) return 'bg-yellow-900/20 border-yellow-500/50';
    if (level >= 9) return 'bg-orange-900/20 border-orange-500/50';
    return 'bg-red-900/20 border-red-500/50';
  };

  const getProgressGradient = () => {
    if (scoreType === 'effectiveness') {
      if (finalScore > 0.7) return 'bg-gradient-to-r from-green-500 to-emerald-400';
      if (finalScore > 0.4) return 'bg-gradient-to-r from-lime-500 to-green-400';
      return 'bg-gradient-to-r from-yellow-500 to-amber-400';
    }
    // Safety
    if (finalScore > 0.7) return 'bg-gradient-to-r from-green-500 to-emerald-400';
    if (finalScore > 0.4) return 'bg-gradient-to-r from-yellow-500 to-amber-400';
    return 'bg-gradient-to-r from-red-500 to-orange-400';
  };

  const colorClass = getColorClass();
  const bgClass = getBgClass();
  const progressGradient = getProgressGradient();
  const scoreTypeLabel = scoreType === 'safety' ? 'safe' : 'effective';

  return (
    <article
      className={`heatmap-status-summary mb-4 p-4 rounded-lg border-2 transition-colors duration-300 ${bgClass}`}
      aria-label={`${scoreType === 'safety' ? 'Safety' : 'Effectiveness'} status summary`}
    >
      {/* Power × Pulse and Score */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-lg">
          <span className="text-primary font-bold">
            {power.toFixed(0)}W × {pulse.toFixed(1)}ns
          </span>
        </div>
        <span className={`text-base font-bold ${colorClass}`}>
          {level}/25
        </span>
      </div>

      {/* Score Label */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-base font-semibold ${colorClass}`}>
          {scoreLabel}
        </span>
      </div>

      {/* Progress bar */}
      <div className="bg-gray-950 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all ${progressGradient}`}
          style={{ width: `${finalScore * 100}%` }}
        />
      </div>
      <div className="text-sm text-tertiary mt-2 text-right">
        {Math.round(finalScore * 100)}% {scoreTypeLabel}
      </div>
    </article>
  );
};

export default HeatmapStatusSummary;
