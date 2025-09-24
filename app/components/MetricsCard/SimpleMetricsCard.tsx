// app/components/MetricsCard/SimpleMetricsCard.tsx
// Simple card-based visualization of machine settings from frontmatter
// Adheres to GROK_INSTRUCTIONS.md: minimal, no mocks/fallbacks, fail-fast

import React from 'react';
import { ArticleMetadata } from '@/types';

export interface MetricsCardProps {
  metadata: ArticleMetadata;
  title?: string;
  className?: string;
}

export default function MetricsCard({
  metadata,
  title = "Laser Parameters",
  className = ""
}: MetricsCardProps) {
  const machineSettings = metadata.machineSettings;
  
  // Fail-fast: no fallbacks or defaults
  if (!machineSettings) {
    return null;
  }

  // Direct mapping from frontmatter to cards - no complex transformations
  const cards = [
    { 
      key: 'power', 
      title: 'Power', 
      value: machineSettings.powerRange, 
      unit: machineSettings.powerRangeUnit,
      color: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-100'
    },
    { 
      key: 'wavelength', 
      title: 'Wavelength', 
      value: machineSettings.wavelength, 
      unit: machineSettings.wavelengthUnit,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-900 dark:bg-indigo-900/20 dark:border-indigo-700 dark:text-indigo-100'
    },
    { 
      key: 'pulseDuration', 
      title: 'Pulse Duration', 
      value: machineSettings.pulseDuration, 
      unit: machineSettings.pulseDurationUnit,
      color: 'bg-green-50 border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-700 dark:text-green-100'
    },
    { 
      key: 'repetitionRate', 
      title: 'Repetition Rate', 
      value: machineSettings.repetitionRate, 
      unit: machineSettings.repetitionRateUnit,
      color: 'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-100'
    },
    { 
      key: 'spotSize', 
      title: 'Spot Size', 
      value: machineSettings.spotSize, 
      unit: machineSettings.spotSizeUnit,
      color: 'bg-purple-50 border-purple-200 text-purple-900 dark:bg-purple-900/20 dark:border-purple-700 dark:text-purple-100'
    },
    { 
      key: 'fluence', 
      title: 'Fluence', 
      value: machineSettings.fluenceRange, 
      unit: machineSettings.fluenceRangeUnit,
      color: 'bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-700 dark:text-red-100'
    }
  ].filter(card => card.value !== undefined);

  return (
    <div className={`metrics-card-container ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => {
          // Handle both simple values and PropertyWithUnits objects
          const displayValue = typeof card.value === 'object' && card.value?.text 
            ? card.value.text 
            : String(card.value);
          const displayUnit = typeof card.unit === 'object' && card.unit?.text 
            ? card.unit.text 
            : String(card.unit || '');

          return (
            <div 
              key={card.key} 
              className={`border-2 rounded-lg p-4 ${card.color}`}
            >
              <h3 className="font-semibold text-lg mb-2">{card.title}</h3>
              <div className="font-bold text-2xl">
                {displayValue}
                {displayUnit && <span className="text-sm font-normal ml-1">{displayUnit}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}