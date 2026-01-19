// app/components/Heatmap/AnalysisCards.tsx
'use client';

import React from 'react';
import { FactorCardConfig } from './types';
import { GRID_GAP_RESPONSIVE } from '@/app/config/site';

interface StatusSummaryData {
  power: number;
  pulse: number;
  level: number;
  finalScore: number;
  scoreLabel: string;
  scoreType: 'safety' | 'effectiveness';
}

interface AnalysisCardsProps {
  factorCards: FactorCardConfig[];
  analysis: any;
  statusSummary?: StatusSummaryData;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  className?: string;
}

// Color mappings matching HeatmapFactorCard
const colorStyles = {
  red: {
    bg: 'rgba(239, 68, 68, 0.15)',
    bgSolid: 'rgb(127, 29, 29)',  // red-900
    border: 'border-red-500/40',
    text: 'text-red-400',
    gradient: 'from-red-500 to-rose-500',
  },
  orange: {
    bg: 'rgba(249, 115, 22, 0.15)',
    bgSolid: 'rgb(124, 45, 18)',  // orange-900
    border: 'border-orange-500/40',
    text: 'text-orange-400',
    gradient: 'from-orange-500 to-amber-500',
  },
  yellow: {
    bg: 'rgba(234, 179, 8, 0.15)',
    bgSolid: 'rgb(113, 63, 18)',  // yellow-900
    border: 'border-yellow-500/40',
    text: 'text-yellow-400',
    gradient: 'from-yellow-500 to-amber-400',
  },
  green: {
    bg: 'rgba(34, 197, 94, 0.15)',
    bgSolid: 'rgb(20, 83, 45)',  // green-900
    border: 'border-green-500/40',
    text: 'text-green-400',
    gradient: 'from-green-500 to-emerald-500',
  },
  blue: {
    bg: 'rgba(59, 130, 246, 0.15)',
    bgSolid: 'rgb(30, 58, 138)',  // blue-900
    border: 'border-blue-500/40',
    text: 'text-blue-400',
    gradient: 'from-blue-500 to-cyan-500',
  },
  lime: {
    bg: 'rgba(163, 230, 53, 0.15)',
    bgSolid: 'rgb(54, 83, 20)',  // lime-900
    border: 'border-lime-500/40',
    text: 'text-lime-400',
    gradient: 'from-lime-500 to-green-400',
  },
};

const _statusColors = {
  green: 'bg-green-500/20 text-green-300',
  yellow: 'bg-yellow-500/20 text-yellow-300',
  orange: 'bg-orange-500/20 text-orange-300',
  red: 'bg-red-500/20 text-red-300',
  lime: 'bg-lime-500/20 text-lime-300',
};

/**
 * AnalysisCards - Grid-based factor analysis cards following PropertyBars design
 * 
 * Displays heatmap factor analysis in a responsive grid layout with:
 * - Status summary card first (optional)
 * - Compact card design matching PropertyBars styling
 * - Three-bar visualization for score
 * - Status indicator and data rows
 * 
 * @param factorCards - Array of FactorCardConfig defining each analysis factor
 * @param analysis - Current analysis data from heatmap calculations
 * @param statusSummary - Optional status summary data to show as first card
 * @param columns - Responsive column counts (default: xs:2, sm:3, md:4, lg:5)
 * @param className - Additional CSS classes
 */
export const AnalysisCards: React.FC<AnalysisCardsProps> = ({
  factorCards,
  analysis,
  statusSummary,
  columns = { xs: 2, sm: 3, md: 4, lg: 5 },
  className = '',
}) => {
  // Only return null if there's nothing to show
  if ((!factorCards || factorCards.length === 0) && !statusSummary) {
    return null;
  }

  // Map column numbers to explicit Tailwind classes
  const xsColsMap: Record<number, string> = {
    1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3',
    4: 'grid-cols-4', 5: 'grid-cols-5', 6: 'grid-cols-6',
  };
  const smColsMap: Record<number, string> = {
    1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4', 5: 'sm:grid-cols-5', 6: 'sm:grid-cols-6',
  };
  const mdColsMap: Record<number, string> = {
    1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3',
    4: 'md:grid-cols-4', 5: 'md:grid-cols-5', 6: 'md:grid-cols-6',
  };
  const lgColsMap: Record<number, string> = {
    1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5', 6: 'lg:grid-cols-6',
  };

  const xsClass = xsColsMap[columns.xs || 2] || 'grid-cols-2';
  const smClass = smColsMap[columns.sm || 3] || 'sm:grid-cols-3';
  const mdClass = mdColsMap[columns.md || 4] || 'md:grid-cols-4';
  const lgClass = lgColsMap[columns.lg || 5] || 'lg:grid-cols-5';

  const gridClasses = `${xsClass} ${smClass} ${mdClass} ${lgClass}`;

  return (
    <div className={`grid ${GRID_GAP_RESPONSIVE} ${gridClasses} ${className}`}>
      {statusSummary && (
        <StatusSummaryCard key={`summary-${statusSummary.power}-${statusSummary.pulse}-${statusSummary.level}`} {...statusSummary} />
      )}
      {factorCards?.map((config) => (
        <AnalysisCard key={config.id} config={config} analysis={analysis} />
      ))}
    </div>
  );
};

/**
 * StatusSummaryCard - Summary card showing overall score status
 * 
 * Displays as the first card in the AnalysisCards grid with:
 * - Score label as header (e.g., "SAFE - Low Risk")
 * - Percentage display and level indicator
 * - Horizontal progress bar showing score
 * - Color-coded background matching the selected heatmap cell
 * 
 * Background color (bgSolid) changes based on score:
 * - Green (80%+), Lime (60-79%), Yellow (40-59%), Orange (20-39%), Red (<20%)
 * 
 * The background updates immediately (150ms transition) when hovering over grid cells.
 * 
 * @param power - Current power value (W)
 * @param pulse - Current pulse duration (ns)
 * @param level - Score level (1-25)
 * @param finalScore - Final score as decimal (0-1), converted to percentage internally
 * @param scoreLabel - Human-readable score label
 * @param scoreType - 'safety' or 'effectiveness' for color interpretation
 */
export const StatusSummaryCard: React.FC<StatusSummaryData> = ({
  power: _power,
  pulse: _pulse,
  level,
  finalScore,
  scoreLabel,
  scoreType,
}) => {
  // Determine color based on score and type
  // finalScore comes in as 0-1 decimal, convert to percentage
  const scoreAsPercent = finalScore * 100;
  
  const getScoreColor = () => {
    if (scoreType === 'safety') {
      // Safety: Higher is safer (green), lower is dangerous (red)
      if (scoreAsPercent >= 80) return 'green';
      if (scoreAsPercent >= 60) return 'lime';
      if (scoreAsPercent >= 40) return 'yellow';
      if (scoreAsPercent >= 20) return 'orange';
      return 'red';
    } else {
      // Effectiveness: Higher is better
      if (scoreAsPercent >= 80) return 'green';
      if (scoreAsPercent >= 60) return 'lime';
      if (scoreAsPercent >= 40) return 'yellow';
      if (scoreAsPercent >= 20) return 'orange';
      return 'red';
    }
  };

  const color = getScoreColor();
  const styles = colorStyles[color];
  const scorePercentage = Math.max(5, Math.min(100, scoreAsPercent));

  // Strip keyword from label (e.g., "SAFE - Low Risk" -> "Low Risk")
  const displayLabel = scoreLabel.includes(' - ') 
    ? scoreLabel.split(' - ').slice(1).join(' - ') 
    : scoreLabel;

  return (
    <article
      className="relative p-3 rounded-md transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg border"
      style={{ backgroundColor: styles.bgSolid, transition: 'background-color 150ms ease-out' }}
      aria-label={`${scoreLabel} status summary`}
      role="region"
    >
      {/* Header */}
      <header>
        <h4 className="text-sm font-semibold text-center mb-2 text-secondary">
          {displayLabel}
        </h4>
      </header>

      {/* Horizontal bar visualization */}
      <figure className="relative px-2" role="img" aria-label={`Score: ${Math.round(scoreAsPercent)} percent`}>
        {/* Labels row */}
        <div className="flex justify-between items-center mb-1">
          <data value={scoreAsPercent} className={`text-xs font-semibold ${styles.text}`}>
            {Math.round(scoreAsPercent)}%
          </data>
          <data value={level} className="text-xs text-muted" aria-label={`Level ${level}`}>
            L{level}
          </data>
        </div>
        
        {/* Horizontal bar */}
        <div className="w-full" role="meter" aria-valuenow={scoreAsPercent} aria-valuemin={0} aria-valuemax={100} aria-label="Score meter">
          <div className="w-full h-3 bg-secondary rounded-md overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${styles.gradient} rounded-md transition-all duration-150`}
              style={{ width: `${scorePercentage}%` }}
            />
          </div>
        </div>
      </figure>

    </article>
  );
};

/**
 * AnalysisCard - Individual factor card with PropertyBars-style design
 * 
 * Displays a single analysis factor in a compact card format with:
 * - Header showing factor label
 * - Weight indicator (e.g., "50%")
 * - Horizontal progress bar showing score as percentage
 * - Optional status indicator
 * 
 * Background color is always bg-primary (consistent with PropertyCards).
 * Bar gradient color is determined by the `color` property in config.
 * 
 * @param config - FactorCardConfig defining the factor's display properties
 * @param analysis - Current analysis data from heatmap calculations
 */
export const AnalysisCard: React.FC<{ config: FactorCardConfig; analysis: any }> = ({
  config,
  analysis,
}) => {
  const { label, weight, getValue, getStatus } = config;
  const score = getValue(analysis);
  const _status = getStatus?.(analysis);
  
  // Calculate bar width percentage (score is 0-1)
  const scorePercentage = Math.max(5, Math.min(100, score * 100));
  
  // Dynamic color based on score value (matches StatusSummaryCard logic)
  // Higher score = better = greener
  const getDynamicColor = () => {
    if (scorePercentage >= 80) return 'green';
    if (scorePercentage >= 60) return 'lime';
    if (scorePercentage >= 40) return 'yellow';
    if (scorePercentage >= 20) return 'orange';
    return 'red';
  };
  const dynamicColor = getDynamicColor();
  const styles = colorStyles[dynamicColor];
  
  return (
    <article
      className="relative bg-primary p-3 rounded-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
      aria-label={`${label} analysis factor`}
      role="region"
    >
      {/* Header with label */}
      <header>
        <h4 className="text-sm font-semibold text-center mb-2 text-secondary">
          {label}
        </h4>
      </header>
      
      {/* Horizontal bar visualization */}
      <figure className="relative px-2 h-full" role="img" aria-label={`${label} score: ${Math.round(score * 100)} percent`}>
        {/* Labels row */}
        <div className="flex justify-between items-center mb-1">
          <data value={score * 100} className={`text-xs font-semibold ${styles.text}`}>
            {Math.round(score * 100)}%
          </data>
          <data value={weight} className="text-xs text-muted" aria-label={`Weight: ${weight}`}>
            {weight}
          </data>
        </div>
        
        {/* Horizontal bar */}
        <div className="w-full" role="meter" aria-valuenow={score * 100} aria-valuemin={0} aria-valuemax={100} aria-label={`${label} meter`}>
          <div className="w-full h-3 bg-secondary rounded-md overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${styles.gradient} rounded-md transition-all duration-500`}
              style={{ width: `${scorePercentage}%` }}
            />
          </div>
        </div>
      </figure>
    </article>
  );
};

export default AnalysisCards;
