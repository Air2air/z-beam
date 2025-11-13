// app/components/DamageThresholdHeatmap/DamageThresholdHeatmap.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { SectionContainer } from '@/app/components/SectionContainer/SectionContainer';
import type { HeatmapProps } from '@/types/centralized';
import { interpolateColor } from '@/app/utils/colorUtils';

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
   * Uses RANGE-DEPENDENT property weighting - different factors dominate in different regions
   * Returns a score from 1-25 representing processing quality/safety
   */
  const calculateInterpolatedScore = useMemo(() => {
    return (power: number, pulse: number): number => {
      // If no material properties, fall back to distance-based calculation
      if (!materialProperties) {
        return calculateDistanceBasedScore(power, pulse);
      }

      // ===== ENERGY CALCULATIONS =====
      // Power is average power (W), pulse is pulse width (ns)
      // For pulsed fiber lasers used in cleaning:
      // - High rep rate (50-100 kHz) keeps fluence manageable
      // - Larger spot sizes (200-500μm) for safe cleaning
      const repRateHz = 80000; // 80 kHz - high rep rate for cleaning
      const pulseDurationSeconds = pulse / 1e9; // Convert ns to seconds
      const pulseEnergyJ = power / repRateHz; // Energy per pulse = Avg Power / Rep Rate
      
      // Calculate fluence (J/cm²) - energy density on surface
      // Use realistic larger spot size for safe laser cleaning
      const spotDiameterUm = 300; // 300μm diameter for cleaning applications
      const spotDiameterCm = spotDiameterUm / 10000; // Convert μm to cm
      const spotAreaCm2 = Math.PI * Math.pow(spotDiameterCm / 2, 2); // Area in cm²
      const fluence = pulseEnergyJ / spotAreaCm2; // J/cm²

      // ===== RANGE-DEPENDENT PROPERTY ANALYSIS =====
      // Calculate how far we are from optimal in each dimension
      const optimalPowerCenter = (optimalPower[0] + optimalPower[1]) / 2;
      const optimalPulseCenter = (optimalPulse[0] + optimalPulse[1]) / 2;
      
      const powerDeviation = Math.abs(power - optimalPowerCenter) / (powerRange.max - powerRange.min);
      const pulseDeviation = Math.abs(pulse - optimalPulseCenter) / (pulseRange.max - pulseRange.min);
      
      // HIGH POWER regions: Thermal properties dominate
      const thermalK = materialProperties.thermalConductivity || 100;
      const thermalDiff = materialProperties.thermalDiffusivity || 1e-5;
      const heatCap = materialProperties.heatCapacity || materialProperties.specificHeat || 900;
      
      const thermalDiffusionFactor = Math.min(1, thermalDiff / 1e-4);
      const conductionFactor = Math.min(1, thermalK / 200);
      const thermalManagementScore = (thermalDiffusionFactor * 0.4 + conductionFactor * 0.6);

      // LONG PULSE regions: Heat accumulation matters most
      const pulseDuration = pulse / 1e9;
      const relaxationTime = materialProperties.thermalRelaxationTime || 5e-9;
      const accumulationRisk = Math.min(1, pulseDuration / relaxationTime);
      const accumulationFactor = 1 - (accumulationRisk * 0.5);

      // HIGH FLUENCE regions: Temperature and damage thresholds critical
      const absorptionDepth = materialProperties.absorptionCoefficient 
        ? 1 / materialProperties.absorptionCoefficient * 1e6
        : 10;
      const volumetricHeat = fluence / (heatCap * absorptionDepth * 1e-4);
      
      const meltPoint = materialProperties.meltingPoint || 1000;
      const oxidationTemp = materialProperties.oxidationTemperature || meltPoint * 0.7;
      const thermalDestruction = materialProperties.thermalDestructionPoint || meltPoint;
      
      let temperatureSafetyFactor = 1.0;
      if (volumetricHeat > thermalDestruction * 0.8) {
        temperatureSafetyFactor = 0.1;
      } else if (volumetricHeat > oxidationTemp) {
        temperatureSafetyFactor = 0.5;
      } else if (volumetricHeat > oxidationTemp * 0.7) {
        temperatureSafetyFactor = 0.8;
      }

      // OPTIMAL region: Ablation efficiency matters
      const ablationThresh = materialProperties.ablationThreshold || 1.0;
      const ablationRatio = fluence / ablationThresh;
      let ablationFactor = 0.5;
      if (ablationRatio >= 0.8 && ablationRatio <= 2.0) {
        ablationFactor = 1.0 - Math.abs(ablationRatio - 1.2) / 2;
      } else if (ablationRatio < 0.8) {
        ablationFactor = ablationRatio / 0.8 * 0.6;
      } else {
        ablationFactor = Math.max(0.1, 1.0 / (ablationRatio - 1.0));
      }

      // ALL REGIONS: Damage threshold proximity
      const damageThresh = materialProperties.laserDamageThreshold || 5.0;
      let damageFactor = 1.0;
      if (fluence >= damageThresh) {
        damageFactor = 0.05;
      } else if (fluence >= damageThresh * 0.9) {
        damageFactor = 0.3;
      } else if (fluence >= damageThresh * 0.7) {
        damageFactor = 0.6;
      } else {
        damageFactor = Math.min(1.0, (damageThresh - fluence) / damageThresh);
      }

      // Absorption and thermal stress
      const absorption = materialProperties.absorptivity || 0.1;
      const reflectivity = materialProperties.laserReflectivity || (1 - absorption);
      const absorptionFactor = absorption / (1 - reflectivity + 0.01);
      
      const thermalShock = materialProperties.thermalShockResistance || 200;
      const thermalStressFactor = Math.min(1, thermalShock / 300);

      // ===== ADAPTIVE WEIGHTING BASED ON PARAMETER REGION =====
      // In high-power regions, thermal management dominates
      const thermalWeight = 0.15 + (powerDeviation * 0.25); // 15-40%
      // In long-pulse regions, accumulation matters more
      const accumulationWeight = 0.05 + (pulseDeviation * 0.20); // 5-25%
      // In extreme fluence regions, temperature safety is critical
      const fluenceRatio = Math.min(1, fluence / damageThresh);
      const temperatureWeight = 0.15 + (fluenceRatio * 0.25); // 15-40%
      // Near optimal, ablation efficiency matters
      const distanceFromOptimal = Math.sqrt(powerDeviation * powerDeviation + pulseDeviation * pulseDeviation);
      const ablationWeight = 0.25 * (1 - distanceFromOptimal); // 0-25%, highest at center
      // Damage always important
      const damageWeight = 0.20; // constant 20%
      // Others fill remaining
      const remainingWeight = Math.max(0.05, 1.0 - (thermalWeight + accumulationWeight + temperatureWeight + ablationWeight + damageWeight));
      const absorptionWeight = remainingWeight * 0.5;
      const stressWeight = remainingWeight * 0.5;

      const physicsScore = (
        thermalManagementScore * thermalWeight +
        accumulationFactor * accumulationWeight +
        temperatureSafetyFactor * temperatureWeight +
        ablationFactor * ablationWeight +
        damageFactor * damageWeight +
        absorptionFactor * absorptionWeight +
        thermalStressFactor * stressWeight
      );

      // Also get distance from optimal for spatial context
      const distanceScore = calculateDistanceBasedScore(power, pulse);
      const distanceNormalized = (distanceScore - 1) / 24; // 0-1 scale
      
      // PURE PHYSICS-DRIVEN MODEL with distance modulation
      // The physics score (0-1) determines safety, distance creates spatial structure
      
      // Use distance to modulate the physics score slightly
      // Near optimal: trust physics more, allow higher scores
      // Far from optimal: apply safety penalty even if physics says it's okay
      const distanceModulation = 0.85 + (distanceNormalized * 0.15); // 0.85 to 1.0 (lighter penalty)
      
      //Final score is physics-driven but spatially aware
      const finalScore = physicsScore * distanceModulation;

      // BIDIRECTIONAL RISK MODEL - both extremes are bad!
      // - Too LOW fluence = ineffective cleaning (yellow/orange)
      // - Too HIGH fluence = material damage (red/orange)
      // - OPTIMAL fluence = safe and effective (green/emerald)
      
      const fluenceToThresholdRatio = fluence / damageThresh;
      
      // Calculate distance from optimal ablation threshold (sweet spot at ~34% of damage threshold)
      const optimalFluenceRatio = ablationThresh / damageThresh; // ~0.34 for aluminum (1.2/3.5)
      const deviationFromOptimal = Math.abs(fluenceToThresholdRatio - optimalFluenceRatio);
      
      let amplificationFactor;
      
      if (fluenceToThresholdRatio >= 0.70) {
        // TOO HIGH: Damage danger zone (RED/ORANGE)
        const excessRatio = (fluenceToThresholdRatio - 0.70) / 0.30;
        amplificationFactor = 16 - (excessRatio * 8); // 16 → 8 (RED)
      } else if (fluenceToThresholdRatio >= 0.50) {
        // MODERATE-HIGH: Acceptable but risky (YELLOW/ORANGE)
        const t = (fluenceToThresholdRatio - 0.50) / 0.20;
        amplificationFactor = 32 - (t * 16); // 32 → 16 (YELLOW/ORANGE)
      } else if (fluenceToThresholdRatio >= 0.25) {
        // OPTIMAL RANGE: Safe and effective (GREEN/CYAN)
        // Peak at ~0.34 (ablation threshold), graceful degradation
        const distFromPeak = Math.abs(fluenceToThresholdRatio - 0.34) / 0.09;
        amplificationFactor = 65 - (distFromPeak * 33); // Peak 65, edges 32 (GREEN/CYAN)
      } else {
        // TOO LOW: Ineffective cleaning (YELLOW/ORANGE)
        const inefficiencyRatio = (0.25 - fluenceToThresholdRatio) / 0.25;
        amplificationFactor = 32 - (inefficiencyRatio * 16); // 32 → 16 (YELLOW/ORANGE)
      }
      
      const level = Math.max(1, Math.min(25, Math.pow(finalScore, 2) * amplificationFactor));
      
      return Math.round(level);
    };
  }, [materialProperties, powerRange, pulseRange, optimalPower, optimalPulse]);

  const calculateDistanceBasedScore = (power: number, pulse: number): number => {
    // Check if in optimal range
    const inOptimalPower = power >= optimalPower[0] && power <= optimalPower[1];
    const inOptimalPulse = pulse >= optimalPulse[0] && pulse <= optimalPulse[1];
    
    if (inOptimalPower && inOptimalPulse) return 25;
    
    // Calculate distance from optimal CENTER (not edges) for radial pattern
    const optimalPowerCenter = (optimalPower[0] + optimalPower[1]) / 2;
    const optimalPulseCenter = (optimalPulse[0] + optimalPulse[1]) / 2;
    
    // Normalized distances (0 to 1)
    const powerDist = Math.abs(power - optimalPowerCenter) / (powerRange.max - powerRange.min);
    const pulseDist = Math.abs(pulse - optimalPulseCenter) / (pulseRange.max - pulseRange.min);
    
    // Use Euclidean distance for circular/radial pattern
    const totalDist = Math.sqrt(powerDist * powerDist + pulseDist * pulseDist);
    
    // Adjusted thresholds for Euclidean distance (creates smaller values than Manhattan)
    // ULTRA aggressive - tiny safe zone, massive red danger zones
    if (totalDist < 0.02) return 24;   // Micro green zone
    if (totalDist < 0.04) return 21;   // Small cyan
    if (totalDist < 0.06) return 18;
    if (totalDist < 0.08) return 15;   // Yellow
    if (totalDist < 0.10) return 12;
    if (totalDist < 0.12) return 9;    // Orange/amber
    if (totalDist < 0.14) return 7;    // Orange
    if (totalDist < 0.16) return 5;    // Red
    if (totalDist < 0.18) return 4;
    if (totalDist < 0.20) return 3;    // Dark red
    if (totalDist < 0.25) return 2;    // Darker red
    return 1;  // Deep red/near-black for far edges
  };

  const getSafetyLevel = (power: number, pulse: number): number => {
    return calculateInterpolatedScore(power, pulse);
  };

  const getSafetyColor = (level: number): string => {
    // Define anchor colors for continuous gradient - many more stops for ultra-smooth radial blending
    const colorStops = [
      { level: 25, color: '#047857' },  // emerald-700 - Peak optimal
      { level: 24.5, color: '#059669' },// green-600
      { level: 24, color: '#10B981' },  // green-500
      { level: 23.5, color: '#1FC995' },// green-cyan blend
      { level: 23, color: '#27D399' }, // 
      { level: 22.5, color: '#34D399' },// green-400
      { level: 22, color: '#42DA9F' }, // 
      { level: 21.5, color: '#4FDEA5' },// 
      { level: 21, color: '#5DE4B4' }, // mint
      { level: 20.5, color: '#6BE7C2' },// teal
      { level: 20, color: '#79EBD0' }, // 
      { level: 19.5, color: '#87EFDE' },// cyan
      { level: 19, color: '#95F3EC' }, // pale cyan
      { level: 18.5, color: '#A3F5E8' },// 
      { level: 18, color: '#B1F7E4' }, // very pale cyan
      { level: 17.5, color: '#C0F8E0' },// 
      { level: 17, color: '#CEF9DC' }, // cyan-yellow transition
      { level: 16.5, color: '#DCFAD8' },// 
      { level: 16, color: '#E9FBD4' }, // yellow-green
      { level: 15.5, color: '#F2FCC8' },// 
      { level: 15, color: '#FEF08A' }, // yellow-200
      { level: 14.5, color: '#FEF180' },// 
      { level: 14, color: '#FDE876' }, // 
      { level: 13.5, color: '#FDE66C' },// 
      { level: 13, color: '#FDE047' }, // yellow-300
      { level: 12.5, color: '#FCD840' },// 
      { level: 12, color: '#FBCF38' }, // 
      { level: 11.5, color: '#FBC730' },// 
      { level: 11, color: '#FBBF24' }, // yellow-400
      { level: 10.5, color: '#FAB520' },// 
      { level: 10, color: '#F9AB1C' }, // 
      { level: 9.5, color: '#F7A218' }, // 
      { level: 9, color: '#F59E0B' },  // amber-500
      { level: 8.5, color: '#F6941A' },// 
      { level: 8, color: '#F78A29' },  // 
      { level: 7.5, color: '#F88038' },// 
      { level: 7, color: '#FB923C' },  // orange-400
      { level: 6.5, color: '#FA8539' },// 
      { level: 6, color: '#F97316' },  // orange-500
      { level: 5.5, color: '#F56511' },// 
      { level: 5, color: '#EA580C' },  // orange-600
      { level: 4.5, color: '#EF4E3E' },// 
      { level: 4, color: '#EF4444' },  // red-500
      { level: 3.5, color: '#E63E3E' },// 
      { level: 3, color: '#DC2626' },  // red-600
      { level: 2.5, color: '#C72020' },// 
      { level: 2, color: '#B91C1C' },  // red-700
      { level: 1.5, color: '#A51C1C' },// 
      { level: 1, color: '#991B1B' },  // red-800
    ];
    
    // Find the two color stops to interpolate between for silky-smooth gradients
    for (let i = 0; i < colorStops.length - 1; i++) {
      const upper = colorStops[i];
      const lower = colorStops[i + 1];
      
      if (level >= lower.level && level <= upper.level) {
        // Calculate interpolation factor (0 to 1) with high precision
        const range = upper.level - lower.level;
        const position = level - lower.level;
        const factor = position / range;
        
        return interpolateColor(lower.color, upper.color, factor);
      }
    }
    
    // Edge cases
    if (level >= 25) return colorStops[0].color;
    return colorStops[colorStops.length - 1].color;
  };

  const getSafetyLabel = (level: number): string => {
    if (level >= 23) return 'OPTIMAL - Peak Performance Zone';
    if (level >= 21) return 'SAFE - Excellent Parameters';
    if (level >= 19) return 'SAFE - Good Parameters';
    if (level >= 17) return 'ACCEPTABLE - Minor Caution';
    if (level >= 15) return 'CAUTION - Monitor Closely';
    if (level >= 13) return 'CAUTION - Elevated Risk';
    if (level >= 11) return 'WARNING - Significant Risk';
    if (level >= 9) return 'RISKY - High Damage Risk';
    if (level >= 7) return 'DANGER - Material Stress';
    if (level >= 5) return 'DANGER - Substrate Damage Likely';
    if (level >= 3) return 'EXTREME DANGER - Material Failure';
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
                    
                    // Get the base safety color
                    const safetyColor = getSafetyColor(level);
                    
                    // If current setting, blend with blue-cyan for smooth integration
                    const displayColor = isCurrentSetting 
                      ? interpolateColor(safetyColor, '#3B82F6', 0.5) // 50-50 blend
                      : safetyColor;
                    
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
                        {/* Tooltip on hover */}
                        {hoveredCell?.power === power && hoveredCell?.pulse === pulse && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-xs whitespace-nowrap z-50 shadow-xl">
                            <div className="font-semibold text-white mb-1">
                              {power.toFixed(0)}W × {pulse.toFixed(1)}ns
                            </div>
                            <div className={`font-medium ${
                              level >= 21 ? 'text-green-400' :
                              level >= 19 ? 'text-green-300' :
                              level >= 17 ? 'text-lime-400' :
                              level >= 15 ? 'text-yellow-300' :
                              level >= 13 ? 'text-yellow-400' :
                              level >= 11 ? 'text-amber-500' :
                              level >= 9 ? 'text-orange-400' :
                              level >= 7 ? 'text-red-400' :
                              level >= 5 ? 'text-red-500' :
                              level >= 3 ? 'text-red-600' : 'text-red-800'
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
                  getSafetyLevel(powerRange.current, pulseRange.current) >= 23 ? 'text-emerald-400' :
                  getSafetyLevel(powerRange.current, pulseRange.current) >= 21 ? 'text-green-400' :
                  getSafetyLevel(powerRange.current, pulseRange.current) >= 19 ? 'text-green-300' :
                  getSafetyLevel(powerRange.current, pulseRange.current) >= 17 ? 'text-lime-400' :
                  getSafetyLevel(powerRange.current, pulseRange.current) >= 15 ? 'text-yellow-300' :
                  getSafetyLevel(powerRange.current, pulseRange.current) >= 13 ? 'text-yellow-400' :
                  getSafetyLevel(powerRange.current, pulseRange.current) >= 11 ? 'text-amber-500' :
                  getSafetyLevel(powerRange.current, pulseRange.current) >= 9 ? 'text-orange-400' :
                  getSafetyLevel(powerRange.current, pulseRange.current) >= 7 ? 'text-red-400' :
                  getSafetyLevel(powerRange.current, pulseRange.current) >= 5 ? 'text-red-500' :
                  getSafetyLevel(powerRange.current, pulseRange.current) >= 3 ? 'text-red-600' :
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

      {/* Physics-Based Model Features */}
      <div className="mt-8 pt-6 border-t border-gray-700">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Pure Physics-Driven Model</h4>
        <div className="grid md:grid-cols-2 gap-4 text-xs text-gray-400">
          <div>
            <h5 className="font-semibold text-gray-300 mb-2">Range-Dependent Factors</h5>
            <ul className="space-y-1 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span><strong className="text-gray-300">High Power Regions (15-40%):</strong> Thermal management dominates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400">•</span>
                <span><strong className="text-gray-300">Long Pulse Regions (5-25%):</strong> Heat accumulation risk increases</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                <span><strong className="text-gray-300">High Fluence Regions (15-40%):</strong> Temperature safety critical</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-semibold text-gray-300 mb-2">Universal Factors</h5>
            <ul className="space-y-1 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                <span><strong className="text-gray-300">Near Optimal (0-25%):</strong> Ablation efficiency matters most</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span><strong className="text-gray-300">Damage Threshold (constant 20%):</strong> Safety always matters</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                <span><strong className="text-gray-300">Spatial Modulation (70-100%):</strong> Distance provides context</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-800/50 rounded text-xs text-gray-400">
          <p><strong className="text-gray-300">How it works:</strong> Physics calculations evaluate thermal management, heat accumulation, temperature safety, ablation effectiveness, and damage risk. Each factor's weight adapts based on parameter location. Distance from optimal provides 0-30% penalty for spatial awareness.</p>
        </div>
        
        <div className="mt-4 p-3 bg-gray-800/50 rounded border border-gray-700">
          <p className="text-xs text-gray-400 mb-2">
            <span className="font-semibold text-gray-300">Material Properties:</span> Thermal conductivity ({materialProperties?.thermalConductivity?.toFixed(0) || 'N/A'} W/m·K), 
            reflectivity ({materialProperties?.laserReflectivity?.toFixed(2) || 'N/A'}), 
            ablation threshold ({materialProperties?.ablationThreshold?.toFixed(2) || 'N/A'} J/cm²), 
            damage threshold ({materialProperties?.laserDamageThreshold?.toFixed(1) || 'N/A'} J/cm²)
          </p>
          <p className="text-xs text-gray-400">
            <span className="font-semibold text-gray-300">Physics-Driven:</span> Material properties drive the entire visualization.
            Different factors dominate in different parameter regions (power, pulse, fluence).
            Spatial distance modulates physics score by 0-30% based on proximity to optimal.
          </p>
        </div>
      </div>
    </SectionContainer>
  );
};
