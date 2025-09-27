// app/components/Caption/MetricsGrid/MetricsGrid.tsx
import React from 'react';
import { QualityMetrics, MetricsGridProps } from '../../../../types/centralized';
import './styles.css';

export function MetricsGrid({ 
  qualityMetrics, 
  maxCards = 2, 
  excludeMetrics = ['substrate_integrity'],
  className = ''
}: MetricsGridProps) {
  if (!qualityMetrics || Object.keys(qualityMetrics).length === 0) {
    return null;
  }

  const filteredMetrics = Object.entries(qualityMetrics)
    .filter(([key]) => !excludeMetrics.includes(key))
    .slice(0, maxCards);

  if (filteredMetrics.length === 0) {
    return null;
  }

  return (
    <div className={`metrics-grid grid w-full min-w-0 overflow-hidden ${maxCards === 2 ? 'grid-cols-2' : `grid-cols-${maxCards}`} ${className}`}>
      {filteredMetrics.map(([key, value]) => (
        <div key={key} className="flex justify-start items-start min-w-0 overflow-hidden">
          <div className="metric-card bg-gray-800 inline-flex flex-col justify-center items-center text-center backdrop-blur-lg p-2 rounded-lg shadow-lg min-w-0 max-w-full ml-6">
            <dt className="text-xs font-medium text-gray-400 uppercase tracking-wider leading-tight truncate w-full">
              {key.replace(/_/g, ' ')}
            </dt>
            <dd className="text-lg font-bold text-gray-100 mt-1 leading-tight -tracking-wide truncate w-full">
              {String(value)}
            </dd>
          </div>
        </div>
      ))}
    </div>
  );
}

export type { QualityMetrics, MetricsGridProps };
