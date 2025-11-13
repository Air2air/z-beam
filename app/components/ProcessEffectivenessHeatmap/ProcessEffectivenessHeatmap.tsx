// app/components/ProcessEffectivenessHeatmap/ProcessEffectivenessHeatmap.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { SectionContainer } from '@/app/components/SectionContainer/SectionContainer';
import { getSectionIcon } from '@/app/config/sectionIcons';

interface MaterialProperties {
  // Core thermal properties
  thermalConductivity?: number;  // W/m·K
  thermalDiffusivity?: number;    // m²/s
  heatCapacity?: number;          // J/(kg·K) or specificHeat
  specificHeat?: number;          // J/(kg·K) - alternative name
  
  // Temperature thresholds
  meltingPoint?: number;          // K
  boilingPoint?: number;          // K
  oxidationTemperature?: number;  // K
  thermalDestructionPoint?: number; // K
  
  // Laser interaction properties
  ablationThreshold?: number;     // J/cm²
  laserDamageThreshold?: number;  // J/cm²
  absorptivity?: number;          // dimensionless
  absorptionCoefficient?: number; // m^-1
  laserReflectivity?: number;     // dimensionless
  
  // Thermal dynamics
  thermalRelaxationTime?: number; // s
  thermalExpansionCoefficient?: number; // 1/K
  thermalShockResistance?: number; // K
  heatAffectedZoneDepth?: number; // μm
}

interface HeatmapProps {
  powerRange: { min: number; max: number; current: number };
  pulseRange: { min: number; max: number; current: number };
  optimalPower: [number, number];
  optimalPulse: [number, number];
  materialProperties?: MaterialProperties;
}

/**
 * Process Effectiveness Heatmap - Shows CLEANING PERFORMANCE ONLY
 * Answers: "Will this clean effectively?"
 * - Too low fluence = RED (ineffective/slow)
 * - Optimal fluence = GREEN (efficient cleaning)
 * - Too high fluence = YELLOW (wasteful/overkill but works)
 */
export const ProcessEffectivenessHeatmap: React.FC<HeatmapProps> = ({
  powerRange,
  pulseRange,
  optimalPower,
  optimalPulse,
  materialProperties,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ power: number; pulse: number } | null>(null);

  const gridRows = 20;
  const gridCols = 20;
  
  const powerStep = (powerRange.max - powerRange.min) / gridCols;
  const pulseStep = (pulseRange.max - pulseRange.min) / gridRows;

  /**
   * Calculate EFFECTIVENESS score based ONLY on cleaning performance
   * Higher score = MORE EFFECTIVE (better cleaning)
   */
  const calculateEffectivenessScore = useMemo(() => {
    return (power: number, pulse: number): number => {
      if (!materialProperties) {
        return 15; // Neutral if no data
      }

      // Energy calculations
      const repRateHz = 80000;
      const pulseEnergyJ = power / repRateHz;
      const spotDiameterUm = 300;
      const spotDiameterCm = spotDiameterUm / 10000;
      const spotAreaCm2 = Math.PI * Math.pow(spotDiameterCm / 2, 2);
      const fluence = pulseEnergyJ / spotAreaCm2;

      const ablationThresh = materialProperties.ablationThreshold || 1.0;
      const fluenceRatio = fluence / ablationThresh;

      // ABLATION EFFECTIVENESS - Primary factor (50% weight)
      // Peak effectiveness at 1.2-1.5x ablation threshold
      let ablationScore = 0.0;
      if (fluenceRatio < 0.5) {
        // Too low: minimal ablation
        ablationScore = fluenceRatio / 0.5 * 0.3;
      } else if (fluenceRatio < 0.8) {
        // Sub-optimal: some ablation
        ablationScore = 0.3 + ((fluenceRatio - 0.5) / 0.3) * 0.3;
      } else if (fluenceRatio < 1.2) {
        // Good: near threshold
        ablationScore = 0.6 + ((fluenceRatio - 0.8) / 0.4) * 0.25;
      } else if (fluenceRatio < 1.8) {
        // OPTIMAL: peak performance (1.2-1.8x)
        const distFromPeak = Math.abs(fluenceRatio - 1.5);
        ablationScore = 1.0 - (distFromPeak / 0.3) * 0.15;
      } else if (fluenceRatio < 2.5) {
        // High but effective: overkill but works
        ablationScore = 0.75 - ((fluenceRatio - 1.8) / 0.7) * 0.15;
      } else {
        // Very high: wasteful energy
        ablationScore = Math.max(0.3, 0.6 - ((fluenceRatio - 2.5) * 0.1));
      }

      // REMOVAL RATE - Secondary factor (30% weight)
      // Higher power generally means faster removal
      const powerNormalized = (power - powerRange.min) / (powerRange.max - powerRange.min);
      let removalScore = 0.0;
      if (fluenceRatio < 0.5) {
        // Below threshold: very slow
        removalScore = 0.2;
      } else if (fluenceRatio < 0.8) {
        // Near threshold: slow
        removalScore = 0.4;
      } else if (fluenceRatio < 1.2) {
        // At threshold: good rate
        removalScore = 0.7;
      } else if (fluenceRatio < 2.0) {
        // Above threshold: excellent rate
        removalScore = 0.9 + (powerNormalized * 0.1);
      } else {
        // Very high: maximum rate but wasteful
        removalScore = 0.85;
      }

      // ENERGY EFFICIENCY - Tertiary factor (20% weight)
      // Reward operating near optimal, penalize extremes
      const optimalPowerCenter = (optimalPower[0] + optimalPower[1]) / 2;
      const optimalPulseCenter = (optimalPulse[0] + optimalPulse[1]) / 2;
      const powerDist = Math.abs(power - optimalPowerCenter) / (powerRange.max - powerRange.min);
      const pulseDist = Math.abs(pulse - optimalPulseCenter) / (pulseRange.max - pulseRange.min);
      const distFromOptimal = Math.sqrt(powerDist * powerDist + pulseDist * pulseDist);
      
      const efficiencyScore = Math.max(0.3, 1.0 - (distFromOptimal * 1.5));

      // Weighted combination (pure effectiveness focus)
      const finalScore = (
        ablationScore * 0.50 +
        removalScore * 0.30 +
        efficiencyScore * 0.20
      );

      // Convert to 1-25 level
      const level = Math.max(1, Math.min(25, finalScore * 25));
      return Math.round(level);
    };
  }, [materialProperties, powerRange, pulseRange, optimalPower, optimalPulse]);

  const interpolateColor = (color1: string, color2: string, factor: number): string => {
    const c1 = parseInt(color1.slice(1), 16);
    const c2 = parseInt(color2.slice(1), 16);
    
    const r1 = (c1 >> 16) & 0xff;
    const g1 = (c1 >> 8) & 0xff;
    const b1 = c1 & 0xff;
    
    const r2 = (c2 >> 16) & 0xff;
    const g2 = (c2 >> 8) & 0xff;
    const b2 = c2 & 0xff;
    
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  const getEffectivenessColor = (level: number): string => {
    // RED (ineffective) → YELLOW (suboptimal) → GREEN (optimal)
    const colorStops = [
      { level: 25, color: '#047857' },  // emerald-700 - Maximum effectiveness
      { level: 24, color: '#059669' },  // emerald-600
      { level: 23, color: '#10B981' },  // green-500
      { level: 22, color: '#34D399' },  // green-400
      { level: 21, color: '#6EE7B7' },  // green-300
      { level: 20, color: '#A7F3D0' },  // green-200
      { level: 19, color: '#D1FAE5' },  // green-100
      { level: 18, color: '#ECFDF5' },  // green-50
      { level: 17, color: '#FEFCE8' },  // yellow-50
      { level: 16, color: '#FEF9C3' },  // yellow-100
      { level: 15, color: '#FEF08A' },  // yellow-200
      { level: 14, color: '#FDE047' },  // yellow-300
      { level: 13, color: '#FACC15' },  // yellow-400
      { level: 12, color: '#EAB308' },  // yellow-500
      { level: 11, color: '#F59E0B' },  // amber-500
      { level: 10, color: '#F97316' },  // orange-500
      { level: 9, color: '#FB923C' },   // orange-400
      { level: 8, color: '#FB8C00' },   // deep orange
      { level: 7, color: '#F97316' },   // orange-500
      { level: 6, color: '#EA580C' },   // orange-600
      { level: 5, color: '#EF4444' },   // red-500
      { level: 4, color: '#DC2626' },   // red-600
      { level: 3, color: '#B91C1C' },   // red-700
      { level: 2, color: '#991B1B' },   // red-800
      { level: 1, color: '#7F1D1D' },   // red-900
    ];
    
    for (let i = 0; i < colorStops.length - 1; i++) {
      const upper = colorStops[i];
      const lower = colorStops[i + 1];
      
      if (level >= lower.level && level <= upper.level) {
        const range = upper.level - lower.level;
        const position = level - lower.level;
        const factor = position / range;
        return interpolateColor(lower.color, upper.color, factor);
      }
    }
    
    if (level >= 25) return colorStops[0].color;
    return colorStops[colorStops.length - 1].color;
  };

  const getEffectivenessLabel = (level: number): string => {
    if (level >= 23) return 'OPTIMAL - Peak Cleaning Performance';
    if (level >= 20) return 'EXCELLENT - Highly Effective';
    if (level >= 17) return 'GOOD - Effective Cleaning';
    if (level >= 15) return 'ADEQUATE - Acceptable Performance';
    if (level >= 12) return 'SUBOPTIMAL - Slower Cleaning';
    if (level >= 9) return 'POOR - Marginal Effectiveness';
    if (level >= 6) return 'INEFFECTIVE - Very Slow';
    if (level >= 3) return 'MINIMAL - Nearly Ineffective';
    return 'NEGLIGIBLE - No Significant Cleaning';
  };

  const currentPowerIndex = Math.round((powerRange.current - powerRange.min) / powerStep);
  const currentPulseIndex = Math.round((pulseRange.current - pulseRange.min) / pulseStep);

  return (
    <SectionContainer
      title="Process Effectiveness Analysis"
      icon={getSectionIcon('effectiveness')}
      bgColor="transparent"
      className="card-background rounded-lg"
      horizPadding={true}
    >
      <p className="text-sm text-gray-400 mb-6">
        Cleaning performance assessment showing how parameter combinations affect process effectiveness.
        Focus: <strong className="text-green-400">Will this clean effectively?</strong>
      </p>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Heatmap Grid */}
        <div className="flex-1 max-w-2xl"> {/* 30% size reduction via max-width */}
          {/* Y-axis label */}
          <div className="flex items-center gap-4 mb-2">
            <div className="w-24 text-sm text-gray-100 font-bold text-right">
              Pulse Duration (ns)
            </div>
            <div className="flex-1"></div>
          </div>

          <div className="flex gap-2">
            <div className="flex flex-col justify-between text-sm text-gray-100 font-semibold w-12 text-right pr-2">
              {Array.from({ length: 5 }).map((_, i) => {
                const value = pulseRange.max - (i * (pulseRange.max - pulseRange.min)) / 4;
                return <div key={i}>{value.toFixed(0)}</div>;
              })}
            </div>

            <div className="flex-1 relative">
              <div className="grid gap-0.5 bg-gray-950 p-2 rounded-lg max-w-md mx-auto" style={{ 
                gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                gridTemplateRows: `repeat(${gridRows}, 1fr)`,
                width: '70%', // 30% size reduction
                maxWidth: '450px'
              }}>
                {Array.from({ length: gridRows }).map((_, rowIdx) => (
                  Array.from({ length: gridCols }).map((_, colIdx) => {
                    const power = powerRange.min + colIdx * powerStep;
                    const pulse = pulseRange.max - rowIdx * pulseStep;
                    const level = calculateEffectivenessScore(power, pulse);
                    const isCurrentSetting = Math.abs(colIdx - currentPowerIndex) <= 1 && 
                                            Math.abs(rowIdx - (gridRows - currentPulseIndex)) <= 1;
                    
                    const effectivenessColor = getEffectivenessColor(level);
                    const displayColor = isCurrentSetting 
                      ? interpolateColor(effectivenessColor, '#3B82F6', 0.5)
                      : effectivenessColor;
                    
                    return (
                      <div
                        key={`${rowIdx}-${colIdx}`}
                        className="aspect-square relative group cursor-pointer transition-transform hover:scale-125 hover:z-10"
                        style={{ 
                          backgroundColor: displayColor,
                          opacity: 0.9
                        }}
                        onMouseEnter={() => setHoveredCell({ power, pulse })}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        {hoveredCell?.power === power && hoveredCell?.pulse === pulse && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-xs whitespace-nowrap z-50 shadow-xl">
                            <div className="font-semibold text-white mb-1">
                              {power.toFixed(0)}W × {pulse.toFixed(1)}ns
                            </div>
                            <div className={`font-medium ${
                              level >= 20 ? 'text-green-400' :
                              level >= 15 ? 'text-yellow-400' :
                              level >= 9 ? 'text-orange-400' :
                              'text-red-400'
                            }`}>
                              {getEffectivenessLabel(level)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ))}
              </div>

              <div className="flex justify-between text-sm text-gray-100 font-semibold mt-2 px-2">
                {Array.from({ length: 5 }).map((_, i) => {
                  const value = powerRange.min + (i * (powerRange.max - powerRange.min)) / 4;
                  return <div key={i}>{value.toFixed(0)}</div>;
                })}
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-100 font-bold mt-2">
            Power (W)
          </div>
        </div>

        <div className="lg:w-64 space-y-4">
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/50">
            <h4 className="text-sm font-semibold text-blue-400 mb-2">Current Settings</h4>
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
                <div className="text-xs text-gray-400 mb-1">Effectiveness Status:</div>
                <div className={`font-semibold ${
                  calculateEffectivenessScore(powerRange.current, pulseRange.current) >= 20 ? 'text-green-400' :
                  calculateEffectivenessScore(powerRange.current, pulseRange.current) >= 15 ? 'text-yellow-400' :
                  calculateEffectivenessScore(powerRange.current, pulseRange.current) >= 9 ? 'text-orange-400' :
                  'text-red-400'
                }`}>
                  {getEffectivenessLabel(calculateEffectivenessScore(powerRange.current, pulseRange.current))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h4 className="text-xs font-semibold text-gray-300 mb-2">Color Legend</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-400">Optimal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                <span className="text-gray-400">Adequate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-gray-400">Poor</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-gray-400">Ineffective</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-800/50 rounded border border-gray-700">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Effectiveness Assessment Factors</h4>
        <div className="grid md:grid-cols-3 gap-4 text-xs text-gray-400">
          <div>
            <span className="font-semibold text-green-400">Ablation Effectiveness (50%):</span> Fluence vs ablation threshold
          </div>
          <div>
            <span className="font-semibold text-blue-400">Removal Rate (30%):</span> Speed of contamination removal
          </div>
          <div>
            <span className="font-semibold text-purple-400">Energy Efficiency (20%):</span> Optimal energy utilization
          </div>
        </div>
      </div>
    </SectionContainer>
  );
};
