// app/components/DamageThresholdHeatmap/DamageThresholdHeatmap.tsx
'use client';

import React, { useState } from 'react';

interface HeatmapProps {
  powerRange: { min: number; max: number; current: number };
  pulseRange: { min: number; max: number; current: number };
  optimalPower: [number, number];
  optimalPulse: [number, number];
}

/**
 * Interactive 2D heatmap showing safe/unsafe parameter combinations
 * Green = safe, Yellow = caution, Orange = risky, Red = damage
 */
export const DamageThresholdHeatmap: React.FC<HeatmapProps> = ({
  powerRange,
  pulseRange,
  optimalPower,
  optimalPulse,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ power: number; pulse: number } | null>(null);

  // Generate grid data
  const gridRows = 20; // Y-axis: pulse duration
  const gridCols = 20; // X-axis: power
  
  const powerStep = (powerRange.max - powerRange.min) / gridCols;
  const pulseStep = (pulseRange.max - pulseRange.min) / gridRows;

  const getSafetyLevel = (power: number, pulse: number): number => {
    // Check if in optimal range
    const inOptimalPower = power >= optimalPower[0] && power <= optimalPower[1];
    const inOptimalPulse = pulse >= optimalPulse[0] && pulse <= optimalPulse[1];
    
    if (inOptimalPower && inOptimalPulse) return 4; // Safe (green)
    
    // Calculate distance from optimal range
    const powerDist = Math.min(
      Math.abs(power - optimalPower[0]),
      Math.abs(power - optimalPower[1])
    ) / (powerRange.max - powerRange.min);
    
    const pulseDist = Math.min(
      Math.abs(pulse - optimalPulse[0]),
      Math.abs(pulse - optimalPulse[1])
    ) / (pulseRange.max - pulseRange.min);
    
    const totalDist = powerDist + pulseDist;
    
    if (totalDist < 0.1) return 3; // Caution (yellow)
    if (totalDist < 0.2) return 2; // Risky (orange)
    return 1; // Danger (red)
  };

  const getSafetyColor = (level: number): string => {
    switch (level) {
      case 4: return '#10B981'; // green-500
      case 3: return '#FBBF24'; // yellow-400
      case 2: return '#F97316'; // orange-500
      case 1: return '#EF4444'; // red-500
      default: return '#6B7280'; // gray-500
    }
  };

  const getSafetyLabel = (level: number): string => {
    switch (level) {
      case 4: return 'SAFE - Optimal Range';
      case 3: return 'CAUTION - Monitor Closely';
      case 2: return 'RISKY - High Damage Risk';
      case 1: return 'DANGER - Substrate Damage';
      default: return 'Unknown';
    }
  };

  const currentPowerIndex = Math.round((powerRange.current - powerRange.min) / powerStep);
  const currentPulseIndex = Math.round((pulseRange.current - pulseRange.min) / pulseStep);

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6">
      {/* Title */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2">
          Parameter Combination Safety Map
        </h3>
        <p className="text-sm text-gray-400">
          Interactive heatmap showing safe/unsafe combinations of power and pulse duration.
          Current settings marked with ⊕ crosshair.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Heatmap Grid */}
        <div className="flex-1">
          {/* Y-axis label */}
          <div className="flex items-center gap-4 mb-2">
            <div className="w-24 text-xs text-gray-400 font-semibold text-right">
              Pulse Duration (ns)
            </div>
            <div className="flex-1"></div>
          </div>

          <div className="flex gap-2">
            {/* Y-axis values */}
            <div className="flex flex-col justify-between text-xs text-gray-400 w-12 text-right pr-2">
              {Array.from({ length: 5 }).map((_, i) => {
                const value = pulseRange.max - (i * (pulseRange.max - pulseRange.min)) / 4;
                return <div key={i}>{value.toFixed(0)}</div>;
              })}
            </div>

            {/* Grid */}
            <div className="flex-1 relative">
              <div className="grid gap-0.5 bg-gray-950 p-2 rounded-lg" style={{ 
                gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                gridTemplateRows: `repeat(${gridRows}, 1fr)`
              }}>
                {Array.from({ length: gridRows }).map((_, rowIdx) => (
                  Array.from({ length: gridCols }).map((_, colIdx) => {
                    const power = powerRange.min + colIdx * powerStep;
                    const pulse = pulseRange.max - rowIdx * pulseStep; // Reverse for top-to-bottom
                    const level = getSafetyLevel(power, pulse);
                    const isCurrentSetting = Math.abs(colIdx - currentPowerIndex) <= 1 && 
                                            Math.abs(rowIdx - (gridRows - currentPulseIndex)) <= 1;
                    
                    return (
                      <div
                        key={`${rowIdx}-${colIdx}`}
                        className="aspect-square rounded-sm relative group cursor-pointer transition-transform hover:scale-125 hover:z-10"
                        style={{ 
                          backgroundColor: getSafetyColor(level),
                          opacity: isCurrentSetting ? 1 : 0.85
                        }}
                        onMouseEnter={() => setHoveredCell({ power, pulse })}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        {/* Current setting crosshair */}
                        {isCurrentSetting && (
                          <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
                            ⊕
                          </div>
                        )}
                        
                        {/* Tooltip on hover */}
                        {hoveredCell?.power === power && hoveredCell?.pulse === pulse && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-xs whitespace-nowrap z-50 shadow-xl">
                            <div className="font-semibold text-white mb-1">
                              {power.toFixed(0)}W × {pulse.toFixed(1)}ns
                            </div>
                            <div className={`font-medium ${
                              level === 4 ? 'text-green-400' :
                              level === 3 ? 'text-yellow-400' :
                              level === 2 ? 'text-orange-400' : 'text-red-400'
                            }`}>
                              {getSafetyLabel(level)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ))}
              </div>

              {/* X-axis values */}
              <div className="flex justify-between text-xs text-gray-400 mt-2 px-2">
                {Array.from({ length: 5 }).map((_, i) => {
                  const value = powerRange.min + (i * (powerRange.max - powerRange.min)) / 4;
                  return <div key={i}>{value.toFixed(0)}</div>;
                })}
              </div>
            </div>
          </div>

          {/* X-axis label */}
          <div className="text-center text-xs text-gray-400 font-semibold mt-2">
            Power (W)
          </div>
        </div>

        {/* Legend & Info */}
        <div className="lg:w-64 space-y-4">
          {/* Color Legend */}
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-semibold text-white mb-3">Safety Zones</h4>
            <div className="space-y-2">
              {[
                { level: 4, label: 'Optimal Range', desc: 'Research-validated safe zone' },
                { level: 3, label: 'Caution Zone', desc: 'Monitor for signs of stress' },
                { level: 2, label: 'Risk Zone', desc: 'High damage probability' },
                { level: 1, label: 'Danger Zone', desc: 'Substrate damage likely' },
              ].map(({ level, label, desc }) => (
                <div key={level} className="flex items-start gap-2">
                  <div 
                    className="w-6 h-6 rounded flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: getSafetyColor(level) }}
                  />
                  <div>
                    <div className="text-sm font-medium text-white">{label}</div>
                    <div className="text-xs text-gray-400">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Settings */}
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/50">
            <h4 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <span className="text-xl">⊕</span>
              Current Settings
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Power:</span>
                <span className="text-white font-semibold">{powerRange.current}W</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Pulse:</span>
                <span className="text-white font-semibold">{pulseRange.current}ns</span>
              </div>
              <div className="pt-2 border-t border-blue-500/30">
                <div className="text-xs text-gray-400 mb-1">Safety Status:</div>
                <div className={`font-semibold ${
                  getSafetyLevel(powerRange.current, pulseRange.current) === 4 ? 'text-green-400' :
                  getSafetyLevel(powerRange.current, pulseRange.current) === 3 ? 'text-yellow-400' :
                  getSafetyLevel(powerRange.current, pulseRange.current) === 2 ? 'text-orange-400' :
                  'text-red-400'
                }`}>
                  {getSafetyLabel(getSafetyLevel(powerRange.current, pulseRange.current))}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Tip */}
          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/50">
            <div className="text-xs text-purple-300">
              <span className="font-semibold">💡 Tip:</span> Hover over cells to see exact values and safety ratings for different parameter combinations.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
