// app/components/DamageThresholdHeatmap/DamageThresholdHeatmap.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { SectionContainer } from '@/app/components/SectionContainer/SectionContainer';

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
 * Interactive 2D heatmap showing parameter space analysis
 * Uses material properties to interpolate processing outcomes
 */
export const DamageThresholdHeatmap: React.FC<HeatmapProps> = ({
  powerRange,
  pulseRange,
  optimalPower,
  optimalPulse,
  materialProperties,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ power: number; pulse: number } | null>(null);

  // Generate grid data
  const gridRows = 20; // Y-axis: pulse duration
  const gridCols = 20; // X-axis: power
  
  const powerStep = (powerRange.max - powerRange.min) / gridCols;
  const pulseStep = (pulseRange.max - pulseRange.min) / gridRows;

  /**
   * Calculate interpolated outcome score based on material properties
   * Returns a score from 1-25 representing processing quality/safety
   */
  const calculateInterpolatedScore = useMemo(() => {
    return (power: number, pulse: number): number => {
      // If no material properties, fall back to distance-based calculation
      if (!materialProperties) {
        return calculateDistanceBasedScore(power, pulse);
      }

      // ===== ENERGY CALCULATIONS =====
      // Calculate pulse energy (J) - simplified model
      const pulseEnergyJ = (power * (pulse / 1e9)); // Convert ns to s, assume 1kHz rep rate
      
      // Calculate fluence (J/cm²) - assuming normalized spot size
      const assumedSpotSize = 0.05; // 50μm diameter = 0.005cm radius
      const spotArea = Math.PI * Math.pow(assumedSpotSize / 2, 2); // cm²
      const fluence = pulseEnergyJ / spotArea;

      // ===== THERMAL FACTORS =====
      
      // Factor 1: Thermal diffusion efficiency
      // High thermal conductivity = better heat dissipation = safer
      const thermalK = materialProperties.thermalConductivity || 100;
      const thermalDiff = materialProperties.thermalDiffusivity || 1e-5;
      const thermalDiffusionFactor = Math.min(1, thermalDiff / 1e-4); // Normalize
      const conductionFactor = Math.min(1, thermalK / 200); // Better heat removal
      const thermalManagementScore = (thermalDiffusionFactor * 0.4 + conductionFactor * 0.6);

      // Factor 2: Thermal accumulation risk
      // Short pulse + good diffusivity = less heat buildup
      const heatCap = materialProperties.heatCapacity || materialProperties.specificHeat || 900;
      const thermalMass = heatCap * thermalDiff; // Effective thermal mass
      const pulseDuration = pulse / 1e9; // Convert to seconds
      const relaxationTime = materialProperties.thermalRelaxationTime || 5e-9;
      
      // If pulse is longer than relaxation time, more heat accumulates
      const accumulationRisk = Math.min(1, pulseDuration / relaxationTime);
      const accumulationFactor = 1 - (accumulationRisk * 0.5); // Penalize long pulses

      // Factor 3: Temperature rise estimation
      // ΔT ≈ Fluence / (ρ·c·d) where d is absorption depth
      const absorptionDepth = materialProperties.absorptionCoefficient 
        ? 1 / materialProperties.absorptionCoefficient * 1e6 // Convert to μm
        : 10; // Default 10μm
      const volumetricHeat = fluence / (heatCap * absorptionDepth * 1e-4); // Simplified
      
      // Check against thermal thresholds
      const meltPoint = materialProperties.meltingPoint || 1000;
      const oxidationTemp = materialProperties.oxidationTemperature || meltPoint * 0.7;
      const thermalDestruction = materialProperties.thermalDestructionPoint || meltPoint;
      
      let temperatureSafetyFactor = 1.0;
      if (volumetricHeat > thermalDestruction * 0.8) {
        temperatureSafetyFactor = 0.1; // Very dangerous - near melting
      } else if (volumetricHeat > oxidationTemp) {
        temperatureSafetyFactor = 0.5; // Risk of oxidation
      } else if (volumetricHeat > oxidationTemp * 0.7) {
        temperatureSafetyFactor = 0.8; // Caution zone
      }

      // Factor 4: Ablation efficiency
      const ablationThresh = materialProperties.ablationThreshold || 1.0;
      const ablationRatio = fluence / ablationThresh;
      
      let ablationFactor = 0.5;
      if (ablationRatio >= 0.8 && ablationRatio <= 2.0) {
        // Sweet spot: near ablation threshold for cleaning
        ablationFactor = 1.0 - Math.abs(ablationRatio - 1.2) / 2;
      } else if (ablationRatio < 0.8) {
        // Below threshold - ineffective cleaning
        ablationFactor = ablationRatio / 0.8 * 0.6;
      } else {
        // Too high - risk of damage
        ablationFactor = Math.max(0.1, 1.0 / (ablationRatio - 1.0));
      }

      // Factor 5: Damage threshold proximity
      const damageThresh = materialProperties.laserDamageThreshold || 5.0;
      const damageMargin = damageThresh - fluence;
      let damageFactor = 1.0;
      
      if (fluence >= damageThresh) {
        damageFactor = 0.05; // Critical damage risk
      } else if (fluence >= damageThresh * 0.9) {
        damageFactor = 0.3; // Very close to damage
      } else if (fluence >= damageThresh * 0.7) {
        damageFactor = 0.6; // Approaching limits
      } else {
        damageFactor = Math.min(1.0, damageMargin / damageThresh);
      }

      // Factor 6: Absorption efficiency
      const absorption = materialProperties.absorptivity || 0.1;
      const reflectivity = materialProperties.laserReflectivity || (1 - absorption);
      const absorptionFactor = absorption / (1 - reflectivity + 0.01); // Effective absorption

      // Factor 7: Thermal shock resistance
      const thermalShock = materialProperties.thermalShockResistance || 200;
      const thermalExpansion = materialProperties.thermalExpansionCoefficient || 10e-6;
      const thermalStressFactor = Math.min(1, thermalShock / 300); // Higher is better

      // ===== COMBINE ALL FACTORS =====
      const physicsScore = (
        thermalManagementScore * 0.20 +    // Heat dissipation
        accumulationFactor * 0.10 +        // Pulse duration appropriateness
        temperatureSafetyFactor * 0.25 +   // Temperature limits
        ablationFactor * 0.20 +            // Cleaning effectiveness
        damageFactor * 0.15 +              // Damage avoidance
        absorptionFactor * 0.05 +          // Energy coupling
        thermalStressFactor * 0.05         // Mechanical stability
      );

      // Also consider distance from optimal to bias toward known good parameters
      const distanceScore = calculateDistanceBasedScore(power, pulse);
      
      // Blend physics-based score with distance-based score
      // Weight physics more heavily when we have good material data
      const dataQuality = Object.keys(materialProperties).length / 20; // 0-1 scale
      const physicsWeight = 0.5 + (dataQuality * 0.3); // 0.5 to 0.8
      const distanceWeight = 1 - physicsWeight;
      
      const blendedScore = physicsScore * physicsWeight + (distanceScore / 25) * distanceWeight;

      // Map to 1-25 scale
      return Math.max(1, Math.min(25, Math.round(blendedScore * 25)));
    };
  }, [materialProperties, powerRange, pulseRange, optimalPower, optimalPulse]);

  const calculateDistanceBasedScore = (power: number, pulse: number): number => {
    // Check if in optimal range
    const inOptimalPower = power >= optimalPower[0] && power <= optimalPower[1];
    const inOptimalPulse = pulse >= optimalPulse[0] && pulse <= optimalPulse[1];
    
    if (inOptimalPower && inOptimalPulse) return 25;
    
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
    
    // 25 levels for ultra-smooth interpolation
    if (totalDist < 0.025) return 24;
    if (totalDist < 0.050) return 23;
    if (totalDist < 0.075) return 22;
    if (totalDist < 0.100) return 21;
    if (totalDist < 0.125) return 20;
    if (totalDist < 0.150) return 19;
    if (totalDist < 0.175) return 18;
    if (totalDist < 0.200) return 17;
    if (totalDist < 0.225) return 16;
    if (totalDist < 0.250) return 15;
    if (totalDist < 0.275) return 14;
    if (totalDist < 0.300) return 13;
    if (totalDist < 0.325) return 12;
    if (totalDist < 0.350) return 11;
    if (totalDist < 0.375) return 10;
    if (totalDist < 0.400) return 9;
    if (totalDist < 0.425) return 8;
    if (totalDist < 0.450) return 7;
    if (totalDist < 0.475) return 6;
    if (totalDist < 0.500) return 5;
    if (totalDist < 0.525) return 4;
    if (totalDist < 0.550) return 3;
    if (totalDist < 0.575) return 2;
    return 1;
  };

  const getSafetyLevel = (power: number, pulse: number): number => {
    return calculateInterpolatedScore(power, pulse);
  };

  // Helper function to interpolate between two hex colors
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
    const green = '#10B981';         // green-500 - Pure safe
    const lightGreen = '#34D399';    // green-400 - Still safe
    const yellow = '#FBBF24';        // yellow-400 - Caution zone
    const orange = '#F97316';        // orange-500 - Risk zone
    const deepOrange = '#EA580C';    // orange-600 - High risk
    const red = '#EF4444';           // red-500 - Danger
    const darkRed = '#DC2626';       // red-600 - Extreme danger
    const deepRed = '#B91C1C';       // red-700 - Critical
    const veryDarkRed = '#991B1B';   // red-800 - Catastrophic
    const nearBlack = '#7F1D1D';     // red-900 - Immediate damage
    
    // Keep pure green for truly safe range (14-25)
    if (level >= 14) return green;
    if (level >= 12) return interpolateColor(green, lightGreen, (14 - level) / 2);
    if (level >= 10) return interpolateColor(lightGreen, yellow, (12 - level) / 2);
    if (level >= 9) return interpolateColor(yellow, orange, (10 - level) / 1);
    if (level >= 7) return interpolateColor(orange, deepOrange, (9 - level) / 2);
    if (level >= 5) return interpolateColor(deepOrange, red, (7 - level) / 2);
    if (level >= 4) return interpolateColor(red, darkRed, (5 - level) / 1);
    if (level >= 3) return interpolateColor(darkRed, deepRed, (4 - level) / 1);
    if (level >= 2) return interpolateColor(deepRed, veryDarkRed, (3 - level) / 1);
    if (level >= 1) return interpolateColor(veryDarkRed, nearBlack, (2 - level) / 1);
    return nearBlack;
  };

  const getSafetyLabel = (level: number): string => {
    if (level >= 14) return 'SAFE - Optimal Range';
    if (level >= 12) return 'SAFE - Near Optimal';
    if (level >= 10) return 'CAUTION - Monitor Closely';
    if (level >= 7) return 'RISKY - High Damage Risk';
    if (level >= 4) return 'DANGER - Substrate Damage Likely';
    if (level >= 2) return 'EXTREME DANGER - Material Failure';
    return 'CATASTROPHIC - Immediate Damage';
  };

  const currentPowerIndex = Math.round((powerRange.current - powerRange.min) / powerStep);
  const currentPulseIndex = Math.round((pulseRange.current - pulseRange.min) / pulseStep);

  return (
    <SectionContainer
      title="Parameter Combination Safety Map"
      bgColor="transparent"
      className="card-background rounded-lg"
      horizPadding={true}
    >
      {/* Description */}
            {/* Description */}
      <p className="text-sm text-gray-400 mb-6">
        Interactive heatmap showing interpolated processing outcomes across power and pulse width combinations. 
        Colors represent predicted results based on material properties and laser-material interactions.
      </p>

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
                        className="aspect-square relative group cursor-pointer transition-transform hover:scale-125 hover:z-10"
                        style={{ 
                          backgroundColor: isCurrentSetting ? '#3B82F6' : getSafetyColor(level), // blue-500 for current
                          opacity: isCurrentSetting ? 1 : 0.85
                        }}
                        onMouseEnter={() => setHoveredCell({ power, pulse })}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        {/* Tooltip on hover */}
                        {hoveredCell?.power === power && hoveredCell?.pulse === pulse && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-xs whitespace-nowrap z-50 shadow-xl">
                            <div className="font-semibold text-white mb-1">
                              {power.toFixed(0)}W × {pulse.toFixed(1)}ns
                            </div>
                            <div className={`font-medium ${
                              level >= 14 ? 'text-green-400' :
                              level >= 12 ? 'text-green-300' :
                              level >= 10 ? 'text-yellow-400' :
                              level >= 7 ? 'text-orange-400' :
                              level >= 4 ? 'text-red-400' :
                              level >= 2 ? 'text-red-600' : 'text-red-800'
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
          {/* Current Settings */}
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/50">
            <h4 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
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
                  getSafetyLevel(powerRange.current, pulseRange.current) >= 14 ? 'text-green-400' :
                  getSafetyLevel(powerRange.current, pulseRange.current) >= 12 ? 'text-green-300' :
                  getSafetyLevel(powerRange.current, pulseRange.current) >= 10 ? 'text-yellow-400' :
                  getSafetyLevel(powerRange.current, pulseRange.current) >= 7 ? 'text-orange-400' :
                  getSafetyLevel(powerRange.current, pulseRange.current) >= 4 ? 'text-red-400' :
                  getSafetyLevel(powerRange.current, pulseRange.current) >= 2 ? 'text-red-600' :
                  'text-red-800'
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
    </SectionContainer>
  );
};
