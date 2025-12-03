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
      // Power matters: higher power can partially overcome reflectivity
      // Surface roughness helps: rougher surfaces reflect less
      const roughnessBonus = Math.min(0.15, surfaceRoughness / 10); // Up to 15% bonus for rough surfaces
      const reflectivityPenalty = reflectivity * (1 - powerNorm * 0.3 - roughnessBonus);
      const reflectivityScore = 1 - Math.max(0, reflectivityPenalty);

      // ABSORPTION EFFICIENCY (30% weight)
      // How well does the material absorb at this power/pulse combo?
      // Longer pulses allow more time for absorption
      // Higher power increases absorption through surface heating
      // Porosity helps trap energy in voids
      const absorptionBase = absorptivity;
      const pulseBonus = pulseNorm * 0.2; // Longer pulses help absorption
      const powerBonus = powerNorm * 0.15; // Higher power helps break through reflective barrier
      const porosityBonus = porosity / 100 * 0.1; // Small bonus for porous materials
      const absorptionScore = Math.min(1.0, absorptionBase + pulseBonus + powerBonus + porosityBonus);

      // SURFACE INTERACTION (20% weight) - NEW: combines penetration and roughness effects
      // For surface cleaning, we want energy concentrated at surface
      // Short pulses = better surface concentration
      // Rough surfaces trap more energy in micro-features
      const penetrationNorm = Math.min(1.0, Math.log10(absorptionCoeff) / 8);
      const surfaceConcentration = penetrationNorm * (1 - pulseNorm * 0.3);
      const roughnessTrapping = Math.min(0.3, surfaceRoughness / 50); // Rough surfaces trap energy
      const surfaceInteractionScore = (surfaceConcentration * 0.7 + roughnessTrapping * 0.3);

      // THERMAL MASS FACTOR (15% weight)
      // Lower density = easier to heat = better energy utilization
      // Porosity reduces effective density
      const effectiveDensity = density * (1 - porosity / 100);
      const densityNorm = Math.max(0, Math.min(1, 1 - (effectiveDensity - 2.7) / 20));
      const thermalMassScore = densityNorm;

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
      label: 'Reflectivity Impact',
      weight: '35%',
      description: 'Energy lost to reflection (lower is better)',
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
