// app/components/Heatmap/EnergyCouplingHeatmap.tsx
'use client';

import React, { useMemo } from 'react';
import { BaseHeatmap } from './BaseHeatmap';
import { getSectionIcon } from '@/app/config/sectionIcons';
import { MaterialProperties, HeatmapRange, CellAnalysis, FactorCardConfig } from './types';

interface EnergyCouplingHeatmapProps {
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
 * Energy Coupling Heatmap - Shows ENERGY TRANSFER EFFICIENCY
 * Answers: "How much laser energy actually reaches the material?"
 * 
 * Key insight: High reflectivity metals (aluminum, copper, silver) reflect
 * most laser energy. This heatmap shows where energy coupling is optimized.
 * 
 * - Green = High coupling efficiency (more energy absorbed)
 * - Red = Poor coupling (energy reflected/wasted)
 * 
 * Uses:
 * - reflectivity: Fraction reflected (high = bad)
 * - absorptivity: Fraction absorbed (high = good)
 * - absorptionCoefficient: Penetration depth factor
 * - density: Thermal mass affecting heat distribution
 */
export const EnergyCouplingHeatmap: React.FC<EnergyCouplingHeatmapProps> = (props) => {
  const { powerRange, pulseRange, materialProperties } = props;

  /**
   * Calculate ENERGY COUPLING score
   * Higher score = better energy transfer into material
   */
  const calculateScore = useMemo(() => {
    return (power: number, pulse: number, matProps?: MaterialProperties): { level: number; analysis: CellAnalysis } => {
      if (!matProps) {
        return { 
          level: 15,
          analysis: {
            level: 15,
            finalScore: 0.6,
            couplingEfficiency: 0.6,
            reflectivityPenalty: 0.0,
            absorptionScore: 0.5,
            penetrationScore: 0.5
          }
        };
      }

      // Get reflectivity (0-1, higher = more reflected = worse coupling)
      const reflectivity = matProps.laserReflectivity || matProps.absorptivity 
        ? (1 - (matProps.absorptivity || 0.1)) 
        : 0.5;
      
      // Get absorptivity (0-1, higher = better coupling)
      const absorptivity = matProps.absorptivity || (1 - reflectivity);
      
      // Absorption coefficient affects penetration depth
      // Higher coefficient = shallower penetration = surface-focused energy
      const absorptionCoeff = matProps.absorptionCoefficient || 1e6; // m^-1
      
      // Density affects thermal mass - higher density spreads energy more
      const density = matProps.density || 2.7; // Use provided density or default to aluminum
      
      // Porosity affects energy trapping - porous materials can trap more energy
      const porosity = matProps.porosity || 0; // % void fraction
      
      // Surface roughness affects absorption - rougher surfaces absorb better
      const surfaceRoughness = matProps.surfaceRoughness || 0.8; // μm
      
      // Normalize parameters
      const powerNorm = (power - powerRange.min) / (powerRange.max - powerRange.min);
      const pulseNorm = (pulse - pulseRange.min) / (pulseRange.max - pulseRange.min);

      // REFLECTIVITY PENALTY (35% weight)
      // High reflectivity = poor coupling
      // Power matters significantly: higher power can overcome reflectivity
      // Use power/pulse to create more dramatic variation
      const roughnessBonus = Math.min(0.15, surfaceRoughness / 10);
      const powerOvercome = powerNorm * 0.5; // Power can overcome up to 50% of reflectivity
      const reflectivityPenalty = reflectivity * (1 - powerOvercome - roughnessBonus);
      const reflectivityScore = Math.max(0, Math.min(1, 1 - reflectivityPenalty));

      // ABSORPTION EFFICIENCY (30% weight)
      // Dramatically affected by power and pulse
      // Low power/pulse = poor absorption, High = good absorption
      const absorptionBase = absorptivity * 0.4; // Base contribution from material
      const pulseBonus = pulseNorm * 0.35; // Pulse contributes up to 35%
      const powerBonus = powerNorm * 0.25; // Power contributes up to 25%
      const porosityBonus = porosity / 100 * 0.05;
      const absorptionScore = Math.min(1.0, absorptionBase + pulseBonus + powerBonus + porosityBonus);

      // SURFACE INTERACTION (20% weight)
      // Power and pulse have opposite effects for more variation
      // High power + low pulse = best surface concentration
      const penetrationNorm = Math.min(1.0, Math.log10(absorptionCoeff) / 8);
      const surfaceConcentration = penetrationNorm * (0.5 + powerNorm * 0.3 - pulseNorm * 0.2);
      const roughnessTrapping = Math.min(0.3, surfaceRoughness / 50);
      const surfaceInteractionScore = Math.max(0, Math.min(1, surfaceConcentration * 0.7 + roughnessTrapping * 0.3 + powerNorm * 0.2));

      // THERMAL MASS FACTOR (15% weight)
      // Add power/pulse variation
      const effectiveDensity = density * (1 - porosity / 100);
      const densityNorm = Math.max(0, Math.min(1, 1 - (effectiveDensity - 2.7) / 20));
      // Higher power helps overcome thermal mass
      const thermalMassScore = Math.max(0, Math.min(1, densityNorm * 0.6 + powerNorm * 0.4));

      // Calculate coupling efficiency (combined)
      const couplingEfficiency = 1 - reflectivity + absorptivity * powerNorm + roughnessBonus;

      // FINAL WEIGHTED SCORE (rebalanced with new surface interaction factor)
      const baseScore = (
        reflectivityScore * 0.35 +       // Reflectivity penalty
        absorptionScore * 0.30 +          // Absorption efficiency
        surfaceInteractionScore * 0.20 +  // Surface interaction (NEW)
        thermalMassScore * 0.15           // Thermal mass factor
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
          couplingEfficiency,
          reflectivity,
          absorptivity,
          reflectivityScore,
          absorptionScore,
          surfaceInteractionScore,
          thermalMassScore,
          porosity,
          surfaceRoughness,
          density: effectiveDensity
        }
      };
    };
  }, [powerRange, pulseRange]);

  const getCouplingLabel = (level: number): string => {
    if (level >= 23) return 'EXCELLENT - Maximum Energy Transfer';
    if (level >= 20) return 'VERY GOOD - High Coupling';
    if (level >= 17) return 'GOOD - Efficient Transfer';
    if (level >= 15) return 'MODERATE - Acceptable Coupling';
    if (level >= 12) return 'SUBOPTIMAL - Reduced Efficiency';
    if (level >= 9) return 'POOR - High Reflection Losses';
    if (level >= 6) return 'VERY POOR - Significant Energy Loss';
    if (level >= 3) return 'MINIMAL - Most Energy Reflected';
    return 'INEFFECTIVE - Energy Not Coupling';
  };

  // Factor card configurations for Energy Coupling
  const factorCards: FactorCardConfig[] = useMemo(() => [
    {
      id: 'reflectivity',
      label: 'Energy Absorption',
      weight: '35%',
      description: 'Energy absorbed vs reflected',
      color: 'red',
      getValue: (analysis) => analysis.reflectivityScore || 0,
      getStatus: (analysis) => {
        const refl = analysis.reflectivity || 0;
        if (refl < 0.3) return { text: '✓ LOW - Good absorption', color: 'green' };
        if (refl < 0.6) return { text: '◐ MODERATE - Some reflection', color: 'yellow' };
        if (refl < 0.8) return { text: '⚠ HIGH - Significant loss', color: 'orange' };
        return { text: '✗ VERY HIGH - Most energy reflected', color: 'red' };
      },
      dataRows: [
        {
          label: 'Reflectivity:',
          getValue: (analysis) => `${((analysis.reflectivity || 0) * 100).toFixed(1)}%`,
          getColor: (analysis) => {
            const refl = analysis.reflectivity || 0;
            if (refl < 0.3) return 'text-green-400 font-semibold';
            if (refl < 0.6) return 'text-yellow-400 font-semibold';
            return 'text-red-400 font-semibold';
          },
        },
        {
          label: 'Energy Absorbed:',
          getValue: (analysis) => `${((analysis.absorptivity || 0) * 100).toFixed(1)}%`,
        },
      ],
    },
    {
      id: 'absorption',
      label: 'Absorption Efficiency',
      weight: '30%',
      description: 'How effectively energy enters material',
      color: 'green',
      getValue: (analysis) => analysis.absorptionScore || 0,
    },
    {
      id: 'surface',
      label: 'Surface Interaction',
      weight: '20%',
      description: 'Surface texture & penetration effects',
      color: 'blue',
      getValue: (analysis) => analysis.surfaceInteractionScore || 0,
      dataRows: [
        {
          label: 'Roughness:',
          getValue: (analysis) => `${(analysis.surfaceRoughness || 0).toFixed(1)} μm`,
        },
        {
          label: 'Porosity:',
          getValue: (analysis) => `${(analysis.porosity || 0).toFixed(1)}%`,
        },
      ],
    },
    {
      id: 'thermalMass',
      label: 'Thermal Mass',
      weight: '15%',
      description: 'Effective density impact on heating',
      color: 'yellow',
      getValue: (analysis) => analysis.thermalMassScore || 0,
      dataRows: [
        {
          label: 'Eff. Density:',
          getValue: (analysis) => `${(analysis.density || 0).toFixed(2)} g/cm³`,
        },
      ],
    },
  ], []);

  return (
    <BaseHeatmap
      {...props}
      title={props.materialName ? `${props.materialName} Energy Coupling` : "Energy Coupling Analysis"}
      description="Shows laser energy transfer efficiency. Green = high coupling (energy absorbed), Red = poor coupling (energy reflected)."
      icon={getSectionIcon('effectiveness')}
      calculateScore={calculateScore}
      getScoreLabel={getCouplingLabel}
      factorCards={factorCards}
      scoreType="effectiveness"
    />
  );
};
