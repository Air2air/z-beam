// app/components/MetricsGrid/MetricsGrid.tsx
import React from 'react';
import { QualityMetrics, MetricsGridProps } from '@/types';
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
    <div className={`metrics-grid grid gap-2 w-full ${maxCards === 2 ? 'grid-cols-2' : `grid-cols-${maxCards}`} ${className}`}>
      {filteredMetrics.map(([key, value]) => (
        <div key={key} className="metric-card">
          <dt>
            {key.replace(/_/g, ' ')}
          </dt>
          <dd>
            {String(value)}
          </dd>
        </div>
      ))}
    </div>
  );
}

export type { QualityMetrics, MetricsGridProps };
