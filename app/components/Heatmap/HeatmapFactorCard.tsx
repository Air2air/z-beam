// app/components/Heatmap/HeatmapFactorCard.tsx
'use client';

import React from 'react';
import { FactorCardConfig } from './types';

// Re-export for backward compatibility
export type { FactorCardConfig } from './types';

interface HeatmapFactorCardProps {
  config: FactorCardConfig;
  analysis: any;
}

// Color mappings for backgrounds and borders
const colorStyles = {
  red: {
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'border-red-500/40',
    text: 'text-red-400',
  },
  orange: {
    bg: 'rgba(249, 115, 22, 0.15)',
    border: 'border-orange-500/40',
    text: 'text-orange-400',
  },
  yellow: {
    bg: 'rgba(234, 179, 8, 0.15)',
    border: 'border-yellow-500/40',
    text: 'text-yellow-400',
  },
  green: {
    bg: 'rgba(34, 197, 94, 0.15)',
    border: 'border-green-500/40',
    text: 'text-green-400',
  },
  blue: {
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'border-blue-500/40',
    text: 'text-blue-400',
  },
  lime: {
    bg: 'rgba(163, 230, 53, 0.15)',
    border: 'border-lime-500/40',
    text: 'text-lime-400',
  },
};

const statusColors = {
  green: 'bg-green-500/20 text-green-300',
  yellow: 'bg-yellow-500/20 text-yellow-300',
  orange: 'bg-orange-500/20 text-orange-300',
  red: 'bg-red-500/20 text-red-300',
  lime: 'bg-lime-500/20 text-lime-300',
};

/**
 * HeatmapFactorCard - Reusable factor analysis card for heatmap panels
 * Matches the parameter-detail-card styling pattern
 */
export const HeatmapFactorCard: React.FC<HeatmapFactorCardProps> = ({ config, analysis }) => {
  const { label, weight, description, color, getValue, dataRows, getStatus } = config;
  const styles = colorStyles[color];
  const score = getValue(analysis);
  const status = getStatus?.(analysis);

  // Determine progress bar color based on score
  const getProgressColor = () => {
    if (score > 0.7) return 'bg-green-500';
    if (score > 0.4) return color === 'blue' ? 'bg-blue-400' : `bg-${color}-500`;
    return score < 0.3 ? 'bg-red-500' : `bg-${color}-500`;
  };

  return (
    <article
      className={`heatmap-factor-card rounded-md p-4 transition-colors duration-300 border ${styles.border} mt-3 first:mt-0`}
      style={{ backgroundColor: styles.bg }}
      aria-label={`${label} factor analysis`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-secondary font-bold text-base">{label}</span>
        <span className={`${styles.text} font-bold text-base`}>{weight}</span>
      </div>

      {/* Description */}
      <p className="text-sm text-muted mb-2">{description}</p>

      {/* Status indicator (if provided) */}
      {status && (
        <div className={`mb-2 px-3 py-1.5 rounded-md text-sm font-semibold text-center ${statusColors[status.color]}`}>
          {status.text}
        </div>
      )}

      {/* Data rows (if provided) */}
      {dataRows?.map((row, idx) => (
        <div key={idx} className="flex justify-between text-sm mb-1">
          <span className="text-muted">{row.label}</span>
          <span className={row.getColor?.(analysis) || 'text-primary font-medium'}>
            {row.getValue(analysis)}
          </span>
        </div>
      ))}

      {/* Progress bar */}
      <div className={`${dataRows?.length ? 'mt-3' : 'mt-3'} bg-gray-950 rounded-full h-2 overflow-hidden`}>
        <div
          className={`h-full transition-all ${getProgressColor()}`}
          style={{ width: `${score * 100}%` }}
        />
      </div>
    </article>
  );
};

export default HeatmapFactorCard;
