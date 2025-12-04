// app/components/Heatmap/MaterialSafetyHeatmap.tsx
'use client';

import React, { useMemo } from 'react';
import { BaseHeatmap } from './BaseHeatmap';
import { getSectionIcon } from '@/app/config/sectionIcons';
import { MaterialProperties, HeatmapRange, CellAnalysis, FactorCardConfig } from './types';

interface MaterialSafetyHeatmapProps {
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
 * Material Safety Heatmap - Shows DAMAGE RISK ONLY
 * Answers: "Will this damage my material?"
 * - Low fluence = GREEN (safe from damage)
 * - High fluence = RED (damage danger)
 * 
 * Extends BaseHeatmap with material safety-specific:
 * - Fluence-based damage scoring
 * - Physics-informed modifiers
 * - Detailed analysis panel with weighted factors
 */
export const MaterialSafetyHeatmap: React.FC<MaterialSafetyHeatmapProps> = (props) => {
  const { powerRange, pulseRange, materialProperties } = props;

  /**
   * Calculate SAFETY score based ONLY on damage risk
   * Higher score = SAFER (less damage risk)
   * Lower score = MORE DANGEROUS (red zones at high power)
   */
  const calculateScore = useMemo(() => {
    return (power: number, pulse: number, matProps?: MaterialProperties): { level: number; analysis: CellAnalysis } => {
      if (!matProps) {
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

      // Energy calculations - use machine parameters from settings (with sensible defaults)
      const repRateHz = matProps.repetitionRate || 80000;  // Hz (default 80kHz)
      const spotDiameterUm = matProps.spotDiameter || 300; // μm (default 300μm)
      
      const pulseEnergyJ = power / repRateHz;
      const spotDiameterCm = spotDiameterUm / 10000;
      const spotAreaCm2 = Math.PI * Math.pow(spotDiameterCm / 2, 2);
      const fluence = pulseEnergyJ / spotAreaCm2;

      const damageThresh = matProps.laserDamageThreshold || 5.0;
      const fluenceRatio = fluence / damageThresh;

      // Calculate position in parameter space (normalized 0-1)
      // EXPANDED: Use wider effective ranges to spread colors across full parameter space
      const _powerNormalized = (power - powerRange.min) / (powerRange.max - powerRange.min);
      const _pulseNormalized = (pulse - pulseRange.min) / (pulseRange.max - pulseRange.min);
      
      // FLUENCE-BASED DAMAGE RISK (primary factor)
      // Expanded to use full 0.0-1.0 range for better color distribution
      let damageScore = 1.0;
      
      if (fluenceRatio >= 1.0) {
        // EXTREME DANGER: At or above damage threshold - use lowest scores (0.0-0.05)
        const excessRatio = Math.min((fluenceRatio - 1.0) / 0.5, 1.0); // Cap at 1.5x threshold
        damageScore = 0.05 * (1 - excessRatio); // 0.05 → 0.0
      } else if (fluenceRatio >= 0.80) {
        // CRITICAL: 80-100% of threshold - very dangerous (0.05-0.15)
        const t = (fluenceRatio - 0.80) / 0.20;
        damageScore = 0.05 + (1 - t) * 0.10;
      } else if (fluenceRatio >= 0.60) {
        // HIGH DANGER: 60-80% of threshold (0.15-0.30)
        const t = (fluenceRatio - 0.60) / 0.20;
        damageScore = 0.15 + (1 - t) * 0.15;
      } else if (fluenceRatio >= 0.40) {
        // MODERATE DANGER: 40-60% of threshold (0.30-0.50)
        const t = (fluenceRatio - 0.40) / 0.20;
        damageScore = 0.30 + (1 - t) * 0.20;
      } else if (fluenceRatio >= 0.20) {
        // CAUTION: 20-40% of threshold (0.50-0.75)
        const t = (fluenceRatio - 0.20) / 0.20;
        damageScore = 0.50 + (1 - t) * 0.25;
      } else {
        // SAFE ZONE: Below 20% of threshold (0.75-1.0)
        // Linear gradient from 0.75 at 20% down to 1.0 at 0%
        damageScore = 0.75 + (0.20 - fluenceRatio) / 0.20 * 0.25;
      }

      // SPATIAL POWER SCORE - Direct score contribution (0.0-1.0)
      // Lower power = safer, higher power = more dangerous
      let powerScore = 0.0;
      const powerNorm = (power - powerRange.min) / (powerRange.max - powerRange.min);
      
      if (powerNorm < 0.50) {
        // Low power = safer (0-50% range: 0.5-1.0 score)
        powerScore = 0.5 + (0.50 - powerNorm) * 1.0;
      } else {
        // High power = more dangerous (50-100% range: 0.0-0.5 score)
        powerScore = 0.5 - (powerNorm - 0.50) * 1.0;
      }

      // PULSE DURATION SCORE - Direct score contribution (0.0-1.0)
      // Shorter pulse = safer, longer pulse = more dangerous
      let pulseScore = 0.0;
      const pulseNorm = (pulse - pulseRange.min) / (pulseRange.max - pulseRange.min);
      
      if (pulseNorm < 0.50) {
        // Short pulse = safer (0-50% range: 0.5-1.0 score)
        pulseScore = 0.5 + (0.50 - pulseNorm) * 1.0;
      } else {
        // Long pulse = more dangerous (50-100% range: 0.0-0.5 score)
        pulseScore = 0.5 - (pulseNorm - 0.50) * 1.0;
      }

      // CALCULATE FINAL SAFETY SCORE - Direct weighted sum (all factors 0-1)
      const baseScore = (
        damageScore * 0.55 +      // Fluence-based damage risk (primary factor)
        powerScore * 0.25 +       // Spatial power contribution
        pulseScore * 0.20         // Temporal pulse contribution
      );

      // Apply moderate expansion for better color distribution
      const expandedScore = Math.pow(baseScore, 0.85);
      const finalScore = Math.max(0.0, Math.min(1.0, expandedScore));

      // Direct linear mapping to 1-25 range
      const levelFloat = 1 + (finalScore * 24);
      
      return { 
        level: Math.round(levelFloat),
        analysis: {
          fluence,
          fluenceRatio,
          damageScore,
          powerScore,
          pulseScore,
          finalScore,
          level: levelFloat
        }
      };
    };
  }, [powerRange, pulseRange]);

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

  // Factor card configurations for Material Safety
  const factorCards: FactorCardConfig[] = useMemo(() => [
    {
      id: 'damageRisk',
      label: 'Material Safety',
      weight: '55%',
      description: 'Safety margin from damage threshold',
      color: 'red',
      getValue: (analysis) => analysis.damageScore || 0,
      getStatus: (analysis) => {
        const ratio = analysis.fluenceRatio || 0;
        if (ratio < 0.5) return { text: '✓ SAFE - Well below damage threshold', color: 'green' };
        if (ratio < 0.8) return { text: '⚠ CAUTION - Approaching damage threshold', color: 'yellow' };
        if (ratio < 1.0) return { text: '⚠ WARNING - Near damage threshold', color: 'orange' };
        return { text: '✗ DANGER - Exceeds damage threshold', color: 'red' };
      },
      dataRows: [
        {
          label: 'Current Energy:',
          getValue: (analysis) => `${(analysis.fluence || 0).toFixed(2)} J/cm²`,
        },
        {
          label: 'Damage Threshold:',
          getValue: (analysis) => {
            const fluence = analysis.fluence || 0;
            const ratio = analysis.fluenceRatio || 1;
            return `${(fluence / ratio).toFixed(2)} J/cm²`;
          },
          getColor: () => 'text-secondary font-medium',
        },
      ],
    },
    {
      id: 'powerFactor',
      label: 'Power Safety',
      weight: '25%',
      description: 'Safety at current power level',
      color: 'orange',
      getValue: (analysis) => analysis.powerScore || 0,
    },
    {
      id: 'pulseFactor',
      label: 'Pulse Safety',
      weight: '20%',
      description: 'Safety at current pulse duration',
      color: 'yellow',
      getValue: (analysis) => analysis.pulseScore || 0,
    },
  ], []);

  return (
    <BaseHeatmap
      {...props}
      title={props.materialName ? `${props.materialName} Material Safety` : "Material Safety Analysis"}
      description="Shows damage risk across parameter space. Green = safe, Red = damage danger."
      icon={getSectionIcon('safety')}
      calculateScore={calculateScore}
      getScoreLabel={getSafetyLabel}
      factorCards={factorCards}
      scoreType="safety"
    />
  );
};
