// app/components/MaterialSafetyHeatmap/MaterialSafetyHeatmap.tsx
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
 * Material Safety Heatmap - Shows DAMAGE RISK ONLY
 * Answers: "Will this damage my material?"
 * - Low fluence = GREEN (safe from damage)
 * - High fluence = RED (damage danger)
 */
export const MaterialSafetyHeatmap: React.FC<HeatmapProps> = ({
  powerRange,
  pulseRange,
  optimalPower,
  optimalPulse,
  materialProperties,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ 
    power: number; 
    pulse: number;
    analysis?: {
      fluence: number;
      fluenceRatio: number;
      damageScore: number;
      powerModifier: number;
      pulseModifier: number;
      shockScore: number;
      finalScore: number;
      level: number;
    };
  } | null>(null);

  const gridRows = 20;
  const gridCols = 20;
  
  const powerStep = (powerRange.max - powerRange.min) / gridCols;
  const pulseStep = (pulseRange.max - pulseRange.min) / gridRows;

  /**
   * Calculate SAFETY score based ONLY on damage risk
   * Higher score = SAFER (less damage risk)
   * Lower score = MORE DANGEROUS (red zones at high power)
   * Returns detailed analysis for visualization
   */
  const calculateSafetyScore = useMemo(() => {
    return (power: number, pulse: number): { level: number; analysis: any } => {
      if (!materialProperties) {
        return { 
          level: 15, 
          analysis: {
            fluence: 0,
            fluenceRatio: 0,
            damageScore: 0.5,
            powerModifier: 1.0,
            pulseModifier: 1.0,
            shockScore: 0.5,
            finalScore: 0.5,
            level: 15
          }
        };
      }

      // Energy calculations
      const repRateHz = 80000;
      const pulseEnergyJ = power / repRateHz;
      const spotDiameterUm = 300;
      const spotDiameterCm = spotDiameterUm / 10000;
      const spotAreaCm2 = Math.PI * Math.pow(spotDiameterCm / 2, 2);
      const fluence = pulseEnergyJ / spotAreaCm2;

      const damageThresh = materialProperties.laserDamageThreshold || 5.0;
      const fluenceRatio = fluence / damageThresh;

      // CRITICAL: Create VIVID color contrast between safe and dangerous zones
      // Goal: BRIGHT CYAN/BLUE in safe zones (low power), BRIGHT RED in danger zones (high power)
      
      // Calculate position in parameter space (normalized 0-1)
      const powerNormalized = (power - powerRange.min) / (powerRange.max - powerRange.min);
      const pulseNormalized = (pulse - pulseRange.min) / (pulseRange.max - pulseRange.min);
      
      // FLUENCE-BASED DAMAGE RISK (primary factor)
      let damageScore = 1.0;
      
      if (fluenceRatio >= 0.90) {
        // CRITICAL DANGER: 90%+ of damage threshold
        damageScore = 0.05;
      } else if (fluenceRatio >= 0.75) {
        // HIGH DANGER: 75-90% of threshold
        const t = (fluenceRatio - 0.75) / 0.15;
        damageScore = 0.05 + (1 - t) * 0.15; // 0.05 → 0.20
      } else if (fluenceRatio >= 0.60) {
        // MODERATE DANGER: 60-75% of threshold
        const t = (fluenceRatio - 0.60) / 0.15;
        damageScore = 0.20 + (1 - t) * 0.20; // 0.20 → 0.40
      } else if (fluenceRatio >= 0.45) {
        // CAUTION: 45-60% of threshold
        const t = (fluenceRatio - 0.45) / 0.15;
        damageScore = 0.40 + (1 - t) * 0.20; // 0.40 → 0.60
      } else if (fluenceRatio >= 0.25) {
        // LOW RISK: 25-45% of threshold
        const t = (fluenceRatio - 0.25) / 0.20;
        damageScore = 0.60 + (1 - t) * 0.25; // 0.60 → 0.85
      } else {
        // SAFE ZONE: Below 25% of threshold - MAXIMIZE SCORE
        // Linear boost from 0.85 to 1.00 as fluence decreases
        damageScore = 0.85 + (0.25 - fluenceRatio) / 0.25 * 0.15; // 0.85 → 1.00
      }

      // SPATIAL POWER MODIFIER: Only penalize at truly high power
      // Reduce penalty effect to preserve safe zone brightness
      let powerModifier = 1.0;
      if (powerNormalized > 0.7) {
        // Only penalize power beyond 70% of range
        const highPowerFactor = (powerNormalized - 0.7) / 0.3;
        powerModifier = 1.0 - Math.pow(highPowerFactor, 2.0) * 0.3; // Max 30% penalty
      } else if (powerNormalized < 0.3) {
        // BOOST low power regions to make safe zones MORE VISIBLE
        const lowPowerBoost = (0.3 - powerNormalized) / 0.3;
        powerModifier = 1.0 + lowPowerBoost * 0.15; // Up to 15% boost
      }

      // THERMAL ACCUMULATION: Penalize long pulses moderately
      let pulseModifier = 1.0;
      if (pulseNormalized > 0.6) {
        const longPulseFactor = (pulseNormalized - 0.6) / 0.4;
        pulseModifier = 1.0 - Math.pow(longPulseFactor, 1.5) * 0.2; // Max 20% penalty
      }

      // THERMAL SHOCK RESISTANCE (minor factor)
      const thermalShock = materialProperties.thermalShockResistance || 200;
      const shockScore = Math.min(1.0, thermalShock / 400);

      // CALCULATE FINAL SAFETY SCORE
      // Emphasize fluence-based damage risk, apply spatial modifiers conservatively
      const finalScore = (
        damageScore * 0.60 +           // 60% on fluence-based damage risk (PRIMARY)
        (damageScore * powerModifier) * 0.25 +  // 25% on power-modified risk
        (damageScore * pulseModifier) * 0.10 +  // 10% on pulse-modified risk
        shockScore * 0.05              // 5% on thermal shock resistance
      );

      // PHASE 1 IMPROVEMENT: Perceptually-uniform mapping
      // Use cube root transform for even visual distribution
      const perceptualScore = finalScore > 0.008856
        ? Math.pow(finalScore, 1/3)
        : 7.787 * finalScore + 16/116;
      
      // Map to 1-25 scale (keeping as float for smooth interpolation)
      const levelFloat = Math.max(1, Math.min(25, perceptualScore * 25));
      const level = Math.round(levelFloat);
      
      return { 
        level,
        analysis: {
          fluence,
          fluenceRatio,
          damageScore,
          powerModifier,
          pulseModifier,
          shockScore,
          finalScore,
          level: levelFloat // Keep float for color interpolation
        }
      };
    };
  }, [materialProperties, powerRange, pulseRange]);

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

  const getSafetyColor = (level: number): string => {
    // PHASE 1 IMPROVEMENT: 6-anchor continuous gradient with smooth interpolation
    // Allows floating-point levels for smooth color transitions
    const colorAnchors = [
      { level: 25, color: '#10B981', label: 'Maximum Safety' },      // emerald-500
      { level: 20, color: '#06B6D4', label: 'Safe Zone' },          // cyan-500
      { level: 15, color: '#FBBF24', label: 'Caution' },            // yellow-400
      { level: 10, color: '#F97316', label: 'Warning' },            // orange-500
      { level: 5,  color: '#DC2626', label: 'Danger' },             // red-600
      { level: 1,  color: '#7C2D12', label: 'Catastrophic' }        // orange-950
    ];
    
    // Find surrounding anchors for smooth interpolation
    for (let i = 0; i < colorAnchors.length - 1; i++) {
      const upper = colorAnchors[i];
      const lower = colorAnchors[i + 1];
      
      if (level >= lower.level && level <= upper.level) {
        const range = upper.level - lower.level;
        const position = level - lower.level;
        const factor = position / range;
        return interpolateColor(lower.color, upper.color, factor);
      }
    }
    
    // Handle edge cases
    if (level >= 25) return colorAnchors[0].color;
    return colorAnchors[colorAnchors.length - 1].color;
  };

  const getSafetyLabel = (level: number): string => {
    if (level >= 23) return 'SAFE - No Damage Risk';
    if (level >= 20) return 'SAFE - Minimal Risk';
    if (level >= 17) return 'SAFE - Low Risk';
    if (level >= 15) return 'CAUTION - Moderate Risk';
    if (level >= 12) return 'WARNING - Elevated Risk';
    if (level >= 9) return 'DANGER - High Damage Risk';
    if (level >= 6) return 'DANGER - Material Damage Likely';
    if (level >= 3) return 'EXTREME - Severe Damage';
    return 'CATASTROPHIC - Material Failure';
  };

  const currentPowerIndex = Math.round((powerRange.current - powerRange.min) / powerStep);
  const currentPulseIndex = Math.round((pulseRange.current - pulseRange.min) / pulseStep);

  return (
    <SectionContainer
      title="Material Safety Analysis"
      icon={getSectionIcon('safety')}
      bgColor="transparent"
      className="card-background rounded-lg"
      horizPadding={true}
    >
      <p className="text-sm text-gray-400 mb-6">
        Damage risk assessment showing how parameter combinations affect material safety.
        Focus: <strong className="text-red-400">Will this damage my material?</strong>
      </p>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Heatmap Grid */}
        <div className="w-full sm:w-3/5 order-2 sm:order-1 max-w-2xl"> {/* 30% size reduction via max-width */}
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
                    const { level, analysis } = calculateSafetyScore(power, pulse);
                    const isCurrentSetting = Math.abs(colIdx - currentPowerIndex) <= 1 && 
                                            Math.abs(rowIdx - (gridRows - currentPulseIndex)) <= 1;
                    
                    // Use float level for smoother color gradients
                    const safetyColor = getSafetyColor(analysis.level);
                    const displayColor = isCurrentSetting 
                      ? interpolateColor(safetyColor, '#3B82F6', 0.5)
                      : safetyColor;
                    
                    return (
                      <div
                        key={`${rowIdx}-${colIdx}`}
                        className="aspect-square relative group cursor-pointer transition-transform hover:scale-125 hover:z-10"
                        style={{ 
                          backgroundColor: displayColor,
                          opacity: 0.9
                        }}
                        onMouseEnter={() => setHoveredCell({ power, pulse, analysis })}
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
                              {getSafetyLabel(level)}
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

        <div className="w-full sm:w-2/5 order-1 sm:order-2 space-y-4">
          {/* Current Settings or Hovered Cell Analysis */}
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/50">
            <h4 className="text-sm font-semibold text-blue-400 mb-2">
              {hoveredCell ? 'Cell Analysis' : 'Current Settings'}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Power:</span>
                <span className="text-white font-semibold">
                  {hoveredCell ? hoveredCell.power.toFixed(0) : powerRange.current}W
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Pulse:</span>
                <span className="text-white font-semibold">
                  {hoveredCell ? hoveredCell.pulse.toFixed(1) : pulseRange.current}ns
                </span>
              </div>
              {(hoveredCell?.analysis || calculateSafetyScore(powerRange.current, pulseRange.current)) && (() => {
                const analysis = hoveredCell?.analysis || calculateSafetyScore(powerRange.current, pulseRange.current).analysis;
                const level = Math.round(analysis.level);
                return (
                  <>
                    <div className="pt-2 border-t border-blue-500/30">
                      <div className="text-xs text-gray-400 mb-1">Safety Status:</div>
                      <div className={`font-semibold ${
                        level >= 20 ? 'text-green-400' :
                        level >= 15 ? 'text-yellow-400' :
                        level >= 9 ? 'text-orange-400' :
                        'text-red-400'
                      }`}>
                        {getSafetyLabel(level)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Level {level}/25
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Detailed Analysis Panel */}
          {hoveredCell?.analysis && (
            <div className="bg-gray-800/80 rounded-lg p-4 border border-gray-700">
              <h4 className="text-xs font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <span className="text-purple-400">⚙️</span>
                Analysis Breakdown
              </h4>
              <div className="space-y-2.5 text-xs">
                {/* Sorted by weight: Damage Score (60%) */}
                <div className="bg-gray-900/50 rounded p-2 border border-red-500/30">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400 font-medium">Damage Risk</span>
                    <span className="text-red-400 font-bold">60%</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500">Fluence:</span>
                    <span className="text-white">{hoveredCell.analysis.fluence.toFixed(3)} J/cm²</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500">vs Threshold:</span>
                    <span className={`font-semibold ${
                      hoveredCell.analysis.fluenceRatio < 0.5 ? 'text-green-400' :
                      hoveredCell.analysis.fluenceRatio < 0.8 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {(hoveredCell.analysis.fluenceRatio * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-1.5 bg-gray-950 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        hoveredCell.analysis.damageScore > 0.7 ? 'bg-green-500' :
                        hoveredCell.analysis.damageScore > 0.4 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${hoveredCell.analysis.damageScore * 100}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">
                    Score: {hoveredCell.analysis.damageScore.toFixed(3)}
                  </div>
                </div>

                {/* Power Modifier (25%) */}
                <div className="bg-gray-900/50 rounded p-2 border border-orange-500/30">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400 font-medium">Power Factor</span>
                    <span className="text-orange-400 font-bold">25%</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500">Spatial Modifier:</span>
                    <span className={`font-semibold ${
                      hoveredCell.analysis.powerModifier > 1.0 ? 'text-green-400' :
                      hoveredCell.analysis.powerModifier < 0.9 ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {hoveredCell.analysis.powerModifier.toFixed(3)}x
                    </span>
                  </div>
                  <div className="mt-1.5 bg-gray-950 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 transition-all"
                      style={{ width: `${Math.min(100, hoveredCell.analysis.powerModifier * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Pulse Modifier (10%) */}
                <div className="bg-gray-900/50 rounded p-2 border border-yellow-500/30">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400 font-medium">Pulse Factor</span>
                    <span className="text-yellow-400 font-bold">10%</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500">Thermal Modifier:</span>
                    <span className={`font-semibold ${
                      hoveredCell.analysis.pulseModifier > 0.95 ? 'text-green-400' :
                      hoveredCell.analysis.pulseModifier < 0.85 ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {hoveredCell.analysis.pulseModifier.toFixed(3)}x
                    </span>
                  </div>
                  <div className="mt-1.5 bg-gray-950 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 transition-all"
                      style={{ width: `${hoveredCell.analysis.pulseModifier * 100}%` }}
                    />
                  </div>
                </div>

                {/* Thermal Shock (5%) */}
                <div className="bg-gray-900/50 rounded p-2 border border-blue-500/30">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400 font-medium">Shock Resistance</span>
                    <span className="text-blue-400 font-bold">5%</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500">Material Factor:</span>
                    <span className="text-white font-semibold">
                      {hoveredCell.analysis.shockScore.toFixed(3)}
                    </span>
                  </div>
                  <div className="mt-1.5 bg-gray-950 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${hoveredCell.analysis.shockScore * 100}%` }}
                    />
                  </div>
                </div>

                {/* Final Score */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded p-2 border-2 border-purple-500/50 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 font-semibold">Final Score</span>
                    <span className="text-purple-400 font-bold text-base">
                      {hoveredCell.analysis.finalScore.toFixed(3)}
                    </span>
                  </div>
                  <div className="mt-1.5 bg-gray-950 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        hoveredCell.analysis.finalScore > 0.7 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                        hoveredCell.analysis.finalScore > 0.4 ? 'bg-gradient-to-r from-yellow-500 to-amber-400' :
                        'bg-gradient-to-r from-red-500 to-orange-400'
                      }`}
                      style={{ width: `${hoveredCell.analysis.finalScore * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Color Legend */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h4 className="text-xs font-semibold text-gray-300 mb-2">Color Legend</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                <span className="text-gray-400">Safe (20-25)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-cyan-500 rounded"></div>
                <span className="text-gray-400">Low Risk (15-20)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                <span className="text-gray-400">Caution (10-15)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-gray-400">Warning (5-10)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded"></div>
                <span className="text-gray-400">Danger (1-5)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-800/50 rounded border border-gray-700">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Safety Assessment Methodology</h4>
        <div className="grid md:grid-cols-4 gap-4 text-xs text-gray-400">
          <div>
            <span className="font-semibold text-red-400">Damage Risk (60%):</span> Fluence vs material damage threshold
          </div>
          <div>
            <span className="font-semibold text-orange-400">Power Factor (25%):</span> Spatial power modifiers
          </div>
          <div>
            <span className="font-semibold text-yellow-400">Pulse Factor (10%):</span> Thermal accumulation effects
          </div>
          <div>
            <span className="font-semibold text-blue-400">Shock Resistance (5%):</span> Material thermal shock tolerance
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500 italic">
          Phase 1 Enhancement: Perceptually-uniform color mapping with continuous gradient interpolation for accurate visual representation across full 1-25 safety scale.
        </div>
      </div>
    </SectionContainer>
  );
};
