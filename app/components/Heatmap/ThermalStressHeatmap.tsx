// app/components/Heatmap/ThermalStressHeatmap.tsx
'use client';

import React, { useMemo } from 'react';
import { BaseHeatmap } from './BaseHeatmap';
import { getSectionIcon } from '@/app/config/sectionIcons';
import { MaterialProperties, HeatmapRange, CellAnalysis, FactorCardConfig } from './types';

interface ThermalStressHeatmapProps {
  powerRange: HeatmapRange;
  pulseRange: HeatmapRange;
  optimalPower: [number, number];
  optimalPulse: [number, number];
  materialProperties?: MaterialProperties;
  materialName?: string;
  thumbnail?: string;
  materialLink?: string;
}

/**
 * Thermal Stress Heatmap - Shows THERMAL STRESS AND DISTORTION RISK
 * Answers: "Will this cause warping, cracking, or dimensional changes?"
 * 
 * Key factors:
 * - Thermal expansion coefficient: High = more stress from temperature gradients
 * - Thermal diffusivity: Low = heat concentrates locally (bad)
 * - Temperature margin to melting: Safety buffer before phase change
 * - Thermal shock resistance: Material's ability to handle rapid temperature changes
 * 
 * - Green = LOW thermal stress risk
 * - Red = HIGH thermal stress risk (warping/cracking likely)
 */
export const ThermalStressHeatmap: React.FC<ThermalStressHeatmapProps> = (props) => {
  const { powerRange, pulseRange, materialProperties: _materialProperties } = props;

  /**
   * Calculate THERMAL STRESS RISK score
   * Higher score = LOWER stress risk (safer)
   */
  const calculateScore = useMemo(() => {
    return (power: number, pulse: number, matProps?: MaterialProperties): { level: number; analysis: CellAnalysis } => {
      if (!matProps) {
        return { 
          level: 15,
          analysis: {
            level: 15,
            finalScore: 0.5,
            expansionRisk: 0.5,
            diffusionScore: 0.5,
            temperatureMargin: 0.5,
            shockResistanceScore: 0.5
          }
        };
      }

      // Get thermal properties
      // Thermal expansion (×10^{-6}/K) - typical range 0.5-33
      const thermalExpansion = matProps.thermalExpansionCoefficient || 23.1; // Default aluminum
      
      // Thermal diffusivity (m²/s) - how fast heat spreads
      const thermalDiffusivity = matProps.thermalDiffusivity || 97e-6; // Default aluminum
      
      // Melting point (K)
      const meltingPoint = matProps.meltingPoint || 933; // Default aluminum
      
      // Boiling point (K) - for extreme heat scenarios
      const boilingPoint = matProps.boilingPoint || 2792; // Default aluminum
      
      // Thermal shock resistance (K) - temp change material can handle
      const shockResistance = matProps.thermalShockResistance || 250;
      
      // Thermal conductivity (W/m·K)
      const thermalConductivity = matProps.thermalConductivity || 237;
      
      // Specific heat (J/kg·K) - energy needed to raise temperature
      const specificHeat = matProps.specificHeat || 900; // Default aluminum
      
      // Density (g/cm³) - affects thermal mass
      const density = matProps.density || 2.7; // Default aluminum

      // Normalize parameters - these drive the score variation
      const powerNorm = (power - powerRange.min) / (powerRange.max - powerRange.min);
      const pulseNorm = (pulse - pulseRange.min) / (pulseRange.max - pulseRange.min);

      // Calculate thermal mass factor (density × specificHeat)
      const thermalMass = density * specificHeat / 1000;
      const thermalMassFactor = Math.min(1, thermalMass / 5);

      // Estimate temperature rise (used in multiple calculations)
      const energyFactor = powerNorm * 0.6 + pulseNorm * 0.4;
      const estimatedTempRise = energyFactor * 500 / (thermalMassFactor + 0.5);

      // THERMAL EXPANSION RISK (35% weight)
      // High power and high pulse = highest expansion risk
      // Create dramatic variation: corners of grid should be very different
      const expansionNorm = Math.min(1, thermalExpansion / 35);
      const parameterRisk = powerNorm * 0.5 + pulseNorm * 0.5; // 0 at min, 1 at max
      // Make parameter risk more impactful - use higher weight for dynamic component
      const expansionRisk = (expansionNorm * 0.3) + (parameterRisk * 0.7); // 30% material, 70% parameters
      const expansionScore = Math.max(0, Math.min(1, 1 - expansionRisk));

      // HEAT DIFFUSION (25% weight)
      // Low power = heat can diffuse (good), High power = overwhelms diffusion (bad)
      const diffusivityNorm = Math.min(1, thermalDiffusivity * 1e5 / 200);
      const conductivityNorm = Math.min(1, thermalConductivity / 400);
      const combinedDiffusion = (diffusivityNorm * 0.6 + conductivityNorm * 0.4);
      // High power reduces effective diffusion score
      const diffusionScore = Math.max(0, Math.min(1, combinedDiffusion * (1.0 - powerNorm * 0.6)));

      // TEMPERATURE MARGIN (25% weight)
      // High power/pulse = closer to melting = lower margin
      const tempMarginK = meltingPoint - 300 - estimatedTempRise;
      const tempMarginNorm = Math.max(0, Math.min(1, tempMarginK / meltingPoint));
      const boilMarginK = boilingPoint - 300 - estimatedTempRise;
      const boilMarginNorm = Math.max(0, Math.min(1, boilMarginK / boilingPoint));
      // Reduce by parameter intensity
      const parameterPenalty = parameterRisk * 0.5;
      const temperatureMarginScore = Math.max(0, (tempMarginNorm * 0.8 + boilMarginNorm * 0.2) - parameterPenalty);

      // THERMAL SHOCK RESISTANCE (15% weight)
      // Short pulses with high power = worst shock
      // Long pulses with low power = best (gentler heating)
      const shockNorm = Math.min(1, shockResistance / 500);
      const shockRisk = powerNorm * (1 - pulseNorm * 0.5); // High power + short pulse = high risk
      const thermalMassBonus = thermalMassFactor * 0.15;
      const shockResistanceScore = Math.max(0, Math.min(1, shockNorm * (1 - shockRisk * 0.5) + thermalMassBonus));

      // Calculate stress gradient (for display)
      const stressGradient = thermalExpansion * estimatedTempRise / 1000; // Simplified strain

      // FINAL WEIGHTED SCORE (higher = less stress risk = safer)
      const baseScore = (
        expansionScore * 0.35 +         // Thermal expansion risk
        diffusionScore * 0.25 +         // Heat diffusion capability
        temperatureMarginScore * 0.25 + // Distance from melting
        shockResistanceScore * 0.15     // Shock resistance
      );

      // Apply moderate expansion for color distribution
      const expandedScore = Math.pow(baseScore, 0.85);
      const finalScore = Math.max(0.0, Math.min(1.0, expandedScore));

      // Map to 1-25 scale
      const levelFloat = 1 + (finalScore * 24);
      
      return { 
        level: Math.round(levelFloat),
        analysis: {
          level: levelFloat,
          finalScore,
          expansionRisk,
          expansionScore,
          diffusionScore,
          temperatureMarginScore,
          shockResistanceScore,
          estimatedTempRise,
          stressGradient,
          tempMarginK,
          thermalExpansion,
          thermalDiffusivity,
          specificHeat,
          density,
          thermalMass
        }
      };
    };
  }, [powerRange, pulseRange]);

  const getStressLabel = (level: number): string => {
    if (level >= 23) return 'MINIMAL RISK - Safe Parameters';
    if (level >= 20) return 'LOW RISK - Minor Thermal Effects';
    if (level >= 17) return 'LOW-MODERATE - Acceptable Stress';
    if (level >= 15) return 'MODERATE - Monitor for Distortion';
    if (level >= 12) return 'ELEVATED - Potential Warping';
    if (level >= 9) return 'HIGH RISK - Likely Distortion';
    if (level >= 6) return 'VERY HIGH - Cracking Risk';
    if (level >= 3) return 'SEVERE - Material Failure Risk';
    return 'CRITICAL - Thermal Damage Certain';
  };

  // Factor card configurations for Thermal Stress
  const factorCards: FactorCardConfig[] = useMemo(() => [
    {
      id: 'expansion',
      label: 'Expansion Tolerance',
      weight: '35%',
      description: 'Tolerance for thermal expansion',
      color: 'red',
      getValue: (analysis) => analysis.expansionScore || 0,
      getStatus: (analysis) => {
        const risk = analysis.expansionRisk || 0;
        if (risk < 0.3) return { text: '✓ LOW - Minimal expansion', color: 'green' };
        if (risk < 0.5) return { text: '◐ MODERATE - Some expansion', color: 'yellow' };
        if (risk < 0.7) return { text: '⚠ HIGH - Significant expansion', color: 'orange' };
        return { text: '✗ SEVERE - Major dimensional change', color: 'red' };
      },
      dataRows: [
        {
          label: 'Thermal Expansion:',
          getValue: (analysis) => `${(analysis.thermalExpansion || 0).toFixed(1)} μm/m·K`,
        },
        {
          label: 'Est. Stress:',
          getValue: (analysis) => `${((analysis.stressGradient || 0) * 1000).toFixed(2)} μm/m`,
          getColor: (analysis) => {
            const stress = analysis.stressGradient || 0;
            if (stress < 0.5) return 'text-green-400 font-semibold';
            if (stress < 2) return 'text-yellow-400 font-semibold';
            return 'text-red-400 font-semibold';
          },
        },
      ],
    },
    {
      id: 'diffusion',
      label: 'Heat Spreading',
      weight: '25%',
      description: 'How quickly heat distributes (higher = better)',
      color: 'blue',
      getValue: (analysis) => analysis.diffusionScore || 0,
      dataRows: [
        {
          label: 'Diffusivity:',
          getValue: (analysis) => {
            const diff = analysis.thermalDiffusivity || 0;
            return `${(diff * 1e6).toFixed(1)} mm²/s`;
          },
        },
      ],
    },
    {
      id: 'tempMargin',
      label: 'Temperature Margin',
      weight: '25%',
      description: 'Safety buffer to melting point',
      color: 'yellow',
      getValue: (analysis) => analysis.temperatureMarginScore || 0,
      dataRows: [
        {
          label: 'Margin:',
          getValue: (analysis) => `${(analysis.tempMarginK || 0).toFixed(0)} K`,
          getColor: (analysis) => {
            const margin = analysis.tempMarginK || 0;
            if (margin > 500) return 'text-green-400 font-semibold';
            if (margin > 200) return 'text-yellow-400 font-semibold';
            return 'text-red-400 font-semibold';
          },
        },
        {
          label: 'Est. Temp Rise:',
          getValue: (analysis) => `+${(analysis.estimatedTempRise || 0).toFixed(0)} K`,
        },
      ],
    },
    {
      id: 'shockResistance',
      label: 'Shock Tolerance',
      weight: '15%',
      description: 'Resistance to rapid temperature changes',
      color: 'green',
      getValue: (analysis) => analysis.shockResistanceScore || 0,
      dataRows: [
        {
          label: 'Thermal Mass:',
          getValue: (analysis) => `${(analysis.thermalMass || 0).toFixed(2)} kJ/kg·K`,
        },
        {
          label: 'Specific Heat:',
          getValue: (analysis) => `${(analysis.specificHeat || 0).toFixed(0)} J/kg·K`,
        },
      ],
    },
  ], []);

  return (
    <BaseHeatmap
      {...props}
      title={props.materialName ? `${props.materialName} Thermal Stress Risk` : "Thermal Stress Analysis"}
      description="Shows thermal stress and distortion risk. Green = low stress risk, Red = high stress/warping/cracking risk."
      icon={getSectionIcon('warning')}
      calculateScore={calculateScore}
      getScoreLabel={getStressLabel}
      factorCards={factorCards}
      scoreType="safety"
    />
  );
};
