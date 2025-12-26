// app/components/HeatBuildup/HeatAnalysisCards.tsx
'use client';

import React from 'react';
import { GRID_GAP_RESPONSIVE } from '@/app/config/site';

interface HeatStatusData {
  peakTemp: number;
  currentTemp: number;
  maxSafeTemp: number;
  damageTemp: number;
  passCount: number;
  currentPass: number;
}

interface HeatFactorData {
  label: string;
  score: number;  // 0-100
  weight: string;
}

interface HeatAnalysisCardsProps {
  statusData: HeatStatusData;
  factors: HeatFactorData[];
  className?: string;
}

// Color mappings matching AnalysisCards
const colorStyles = {
  red: {
    bgSolid: 'rgb(127, 29, 29)',  // red-900
    text: 'text-red-400',
    gradient: 'from-red-500 to-rose-500',
  },
  orange: {
    bgSolid: 'rgb(124, 45, 18)',  // orange-900
    text: 'text-orange-400',
    gradient: 'from-orange-500 to-amber-500',
  },
  yellow: {
    bgSolid: 'rgb(113, 63, 18)',  // yellow-900
    text: 'text-yellow-400',
    gradient: 'from-yellow-500 to-amber-400',
  },
  lime: {
    bgSolid: 'rgb(54, 83, 20)',  // lime-900
    text: 'text-lime-400',
    gradient: 'from-lime-500 to-green-400',
  },
  green: {
    bgSolid: 'rgb(20, 83, 45)',  // green-900
    text: 'text-green-400',
    gradient: 'from-green-500 to-emerald-500',
  },
};

/**
 * Get color based on score (0-100)
 * Higher score = better = greener
 */
const getScoreColor = (score: number) => {
  if (score >= 80) return 'green';
  if (score >= 60) return 'lime';
  if (score >= 40) return 'yellow';
  if (score >= 20) return 'orange';
  return 'red';
};

/**
 * HeatStatusCard - Summary card showing current heat status
 */
export const HeatStatusCard: React.FC<HeatStatusData> = ({
  peakTemp,
  currentTemp: _currentTemp,
  maxSafeTemp,
  damageTemp,
}) => {
  // Calculate safety score: 100% at maxSafeTemp, 0% at damageTemp
  const safetyScore = peakTemp <= maxSafeTemp 
    ? 100 
    : Math.max(0, Math.min(100, 
        (1 - (peakTemp - maxSafeTemp) / (damageTemp - maxSafeTemp)) * 100
      ));
  
  const color = getScoreColor(safetyScore);
  const styles = colorStyles[color];
  
  // Status label
  const getStatusLabel = () => {
    if (peakTemp <= maxSafeTemp * 0.8) return 'Excellent';
    if (peakTemp <= maxSafeTemp) return 'Safe';
    if (peakTemp <= (maxSafeTemp + damageTemp) / 2) return 'Caution';
    if (peakTemp <= damageTemp) return 'Warning';
    return 'Critical';
  };

  const safetyMargin = damageTemp - peakTemp;

  return (
    <article
      className="relative bg-primary p-3 rounded-md transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg"
      style={{ backgroundColor: styles.bgSolid, transition: 'background-color 150ms ease-out' }}
      aria-label={`Heat status: ${getStatusLabel()}`}
      role="region"
    >
      <header>
        <h4 className="text-sm font-semibold text-center mb-2 text-secondary">
          {getStatusLabel()}
        </h4>
      </header>

      <figure className="relative px-2" role="img" aria-label={`Peak temperature: ${Math.round(peakTemp)}°C`}>
        <div className="flex justify-between items-center mb-1">
          <data value={peakTemp} className={`text-xs font-semibold ${styles.text}`}>
            {Math.round(peakTemp)}°C
          </data>
          <data value={safetyMargin} className="text-xs text-muted" aria-label={`Safety margin: ${Math.round(safetyMargin)}°C`}>
            +{Math.round(safetyMargin)}°C
          </data>
        </div>
        
        <div className="w-full" role="meter" aria-valuenow={safetyScore} aria-valuemin={0} aria-valuemax={100} aria-label="Safety meter">
          <div className="w-full h-3 bg-secondary rounded-md overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${styles.gradient} rounded-md transition-all duration-150`}
              style={{ width: `${Math.max(5, safetyScore)}%` }}
            />
          </div>
        </div>
      </figure>
    </article>
  );
};

/**
 * HeatFactorCard - Individual factor card for heat analysis
 */
export const HeatFactorCard: React.FC<HeatFactorData> = ({
  label,
  score,
  weight,
}) => {
  const color = getScoreColor(score);
  const styles = colorStyles[color];
  const scorePercentage = Math.max(5, Math.min(100, score));

  return (
    <article
      className="relative bg-primary p-3 rounded-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
      aria-label={`${label} analysis factor`}
      role="region"
    >
      <header>
        <h4 className="text-sm font-semibold text-center mb-2 text-secondary">
          {label}
        </h4>
      </header>
      
      <figure className="relative px-2 h-full" role="img" aria-label={`${label} score: ${Math.round(score)} percent`}>
        <div className="flex justify-between items-center mb-1">
          <data value={score} className={`text-xs font-semibold ${styles.text}`}>
            {Math.round(score)}%
          </data>
          <data value={weight} className="text-xs text-muted" aria-label={`Weight: ${weight}`}>
            {weight}
          </data>
        </div>
        
        <div className="w-full" role="meter" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} aria-label={`${label} meter`}>
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

/**
 * HeatAnalysisCards - Grid of heat analysis factor cards
 * 
 * Displays heat simulation analysis in a responsive grid layout with:
 * - Status summary card first showing peak temp and safety margin
 * - Factor cards for heat safety, heat accumulation, cooling efficiency, pass optimization
 */
export const HeatAnalysisCards: React.FC<HeatAnalysisCardsProps> = ({
  statusData,
  factors,
  className = '',
}) => {
  return (
    <div className={`grid ${GRID_GAP_RESPONSIVE} grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 ${className}`}>
      <HeatStatusCard {...statusData} />
      {factors.map((factor) => (
        <HeatFactorCard key={factor.label} {...factor} />
      ))}
    </div>
  );
};

export default HeatAnalysisCards;
