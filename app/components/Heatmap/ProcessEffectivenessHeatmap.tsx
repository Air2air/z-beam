// app/components/Heatmap/ProcessEffectivenessHeatmap.tsx
'use client';

import React, { useMemo } from 'react';
import { BaseHeatmap } from './BaseHeatmap';
import { getSectionIcon } from '@/app/config/sectionIcons';
import { MaterialProperties, HeatmapRange, CellAnalysis, FactorCardConfig } from './types';

interface ProcessEffectivenessHeatmapProps {
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
 * Process Effectiveness Heatmap - Shows CLEANING PERFORMANCE ONLY
 * Answers: "Will this clean effectively?"
 * - Too low fluence = RED (ineffective/slow)
 * - Optimal fluence = GREEN (efficient cleaning)
 * - Too high fluence = YELLOW (wasteful/overkill but works)
 * 
 * Extends BaseHeatmap with process effectiveness-specific:
 * - Ablation threshold-based scoring
 * - Removal rate optimization
 * - Energy efficiency metrics
 */
export const ProcessEffectivenessHeatmap: React.FC<ProcessEffectivenessHeatmapProps> = (props) => {
  const { powerRange, pulseRange, optimalPower, optimalPulse, materialProperties } = props;

  /**
   * Calculate EFFECTIVENESS score based ONLY on cleaning performance
   * Higher score = MORE EFFECTIVE (better cleaning)
   */
  const calculateScore = useMemo(() => {
    return (power: number, pulse: number, matProps?: MaterialProperties): { level: number; analysis: CellAnalysis } => {
      if (!matProps) {
        return { 
          level: 15,
          analysis: {
            level: 15,
            finalScore: 0.6,
            ablationScore: 0.6,
            removalScore: 0.6,
            efficiencyScore: 0.6
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

      const ablationThresh = matProps.ablationThreshold || 1.0;
      const fluenceRatio = fluence / ablationThresh;

      // Pulse duration factor - shorter pulses = cleaner ablation, longer = more heat accumulation
      // Normalized pulse: 0 = min pulse (best for ablation), 1 = max pulse (worse)
      const pulseNorm = (pulse - pulseRange.min) / (pulseRange.max - pulseRange.min);
      // Pulse modifier: 1.0 at short pulses, decreasing to 0.7 at long pulses
      const pulseAblationModifier = 1.0 - (pulseNorm * 0.3);

      // ABLATION EFFECTIVENESS - Primary factor (50% weight)
      // EXPANDED: Use full range with more gradual transitions
      // Now includes pulse duration effect
      let ablationScore = 0.0;
      
      if (fluenceRatio < 0.4) {
        // Far below threshold: nearly ineffective (0.0-0.20)
        ablationScore = (fluenceRatio / 0.4) * 0.20;
      } else if (fluenceRatio < 0.7) {
        // Below threshold: minimal ablation (0.20-0.40)
        ablationScore = 0.20 + ((fluenceRatio - 0.4) / 0.3) * 0.20;
      } else if (fluenceRatio < 1.0) {
        // Approaching threshold: improving rapidly (0.40-0.70)
        ablationScore = 0.40 + ((fluenceRatio - 0.7) / 0.3) * 0.30;
      } else if (fluenceRatio < 1.3) {
        // OPTIMAL ZONE: 1.0-1.3x threshold - peak performance (0.70-1.0)
        const optimalProgress = (fluenceRatio - 1.0) / 0.3;
        ablationScore = 0.70 + optimalProgress * 0.30;
      } else if (fluenceRatio < 1.8) {
        // Above optimal: still very effective (0.85-0.95)
        ablationScore = 1.0 - ((fluenceRatio - 1.3) / 0.5) * 0.15;
      } else if (fluenceRatio < 2.5) {
        // High but declining effectiveness (0.65-0.85)
        ablationScore = 0.85 - ((fluenceRatio - 1.8) / 0.7) * 0.20;
      } else if (fluenceRatio < 3.5) {
        // Very high: diminishing returns (0.45-0.65)
        ablationScore = 0.65 - ((fluenceRatio - 2.5) / 1.0) * 0.20;
      } else {
        // Extremely high: wasteful (0.20-0.45)
        const excessFactor = Math.min((fluenceRatio - 3.5) / 2.0, 1.0);
        ablationScore = 0.45 - excessFactor * 0.25;
      }
      
      // Apply pulse duration modifier - shorter pulses are better for clean ablation
      ablationScore = ablationScore * pulseAblationModifier;

      // REMOVAL RATE - Secondary factor (30% weight)
      // EXPANDED: Utilize full parameter space more effectively
      const powerNormalized = (power - powerRange.min) / (powerRange.max - powerRange.min);
      let removalScore = 0.0;
      
      if (fluenceRatio < 0.3) {
        // Extremely slow removal (0.0-0.15)
        removalScore = (fluenceRatio / 0.3) * 0.15;
      } else if (fluenceRatio < 0.6) {
        // Very slow removal (0.15-0.35)
        removalScore = 0.15 + ((fluenceRatio - 0.3) / 0.3) * 0.20;
      } else if (fluenceRatio < 1.0) {
        // Improving removal rate (0.35-0.65)
        removalScore = 0.35 + ((fluenceRatio - 0.6) / 0.4) * 0.30;
      } else if (fluenceRatio < 1.5) {
        // Good removal rate (0.65-0.90)
        const rateBonus = powerNormalized * 0.10; // Power contributes
        removalScore = 0.65 + ((fluenceRatio - 1.0) / 0.5) * 0.25 + rateBonus;
      } else if (fluenceRatio < 2.5) {
        // Excellent removal rate (0.85-1.0)
        const rateBonus = powerNormalized * 0.15;
        removalScore = Math.min(1.0, 0.85 + ((fluenceRatio - 1.5) / 1.0) * 0.10 + rateBonus);
      } else {
        // Maximum rate plateau (0.90-0.98)
        removalScore = Math.min(0.98, 0.90 + powerNormalized * 0.08);
      }

      // ENERGY EFFICIENCY - Tertiary factor (20% weight)
      // EXPANDED: More dramatic efficiency variations across parameter space
      const optimalPowerCenter = (optimalPower[0] + optimalPower[1]) / 2;
      const optimalPulseCenter = (optimalPulse[0] + optimalPulse[1]) / 2;
      
      // Use Manhattan distance for more linear gradients
      const powerDist = Math.abs(power - optimalPowerCenter) / (powerRange.max - powerRange.min);
      const pulseDist = Math.abs(pulse - optimalPulseCenter) / (pulseRange.max - pulseRange.min);
      const totalDist = (powerDist + pulseDist) / 2; // Average of normalized distances
      
      // More aggressive efficiency penalty with expanded range
      let efficiencyScore = 1.0;
      if (totalDist < 0.15) {
        // Very close to optimal (0.92-1.0)
        efficiencyScore = 0.92 + (0.15 - totalDist) / 0.15 * 0.08;
      } else if (totalDist < 0.35) {
        // Close to optimal (0.70-0.92)
        efficiencyScore = 0.70 + (0.35 - totalDist) / 0.20 * 0.22;
      } else if (totalDist < 0.55) {
        // Moderate distance (0.45-0.70)
        efficiencyScore = 0.45 + (0.55 - totalDist) / 0.20 * 0.25;
      } else if (totalDist < 0.75) {
        // Far from optimal (0.20-0.45)
        efficiencyScore = 0.20 + (0.75 - totalDist) / 0.20 * 0.25;
      } else {
        // Very far - poor efficiency (0.0-0.20)
        efficiencyScore = Math.max(0.0, 0.20 - (totalDist - 0.75) * 0.80);
      }

      // Weighted combination - direct weighted sum (all factors 0-1)
      const baseScore = (
        ablationScore * 0.50 +      // Primary: ablation effectiveness
        removalScore * 0.30 +       // Secondary: removal rate
        efficiencyScore * 0.20      // Tertiary: energy efficiency
      );

      // Position-based variation for full color range across grid
      const pulseNormalized = (pulse - pulseRange.min) / (pulseRange.max - pulseRange.min);
      // Optimal is achieved in the center-right of the grid
      const positionFactor = 0.6 + (powerNormalized * 0.25) + ((1 - Math.abs(pulseNormalized - 0.5) * 2) * 0.15);
      
      // Blend material-based score with position factor
      const blendedScore = baseScore * 0.7 + positionFactor * 0.3;

      // Apply moderate expansion for better color distribution
      const expandedScore = Math.pow(blendedScore, 0.85);
      const finalScore = Math.max(0.0, Math.min(1.0, expandedScore));

      // Direct linear mapping to 1-25 range
      const levelFloat = 1 + (finalScore * 24);
      
      return { 
        level: Math.round(levelFloat),
        analysis: {
          level: levelFloat,
          finalScore,
          fluence,
          fluenceRatio,
          ablationScore,
          removalScore,
          efficiencyScore
        }
      };
    };
  }, [powerRange, pulseRange, optimalPower, optimalPulse]);

  const getEffectivenessLabel = (level: number): string => {
    if (level >= 23) return 'OPTIMAL - Maximum Effectiveness';
    if (level >= 20) return 'EXCELLENT - High Performance';
    if (level >= 17) return 'GOOD - Effective Cleaning';
    if (level >= 15) return 'MODERATE - Acceptable';
    if (level >= 12) return 'SUBOPTIMAL - Slow Removal';
    if (level >= 9) return 'POOR - Low Effectiveness';
    if (level >= 6) return 'VERY POOR - Minimal Effect';
    if (level >= 3) return 'INEFFECTIVE - Nearly Useless';
    return 'INEFFECTIVE - No Cleaning';
  };

  // Factor card configurations for Process Effectiveness
  const factorCards: FactorCardConfig[] = useMemo(() => [
    {
      id: 'ablation',
      label: 'Ablation',
      weight: '50%',
      description: 'Fluence vs ablation threshold effectiveness',
      color: 'green',
      getValue: (analysis) => analysis.ablationScore || 0,
      getStatus: (analysis) => {
        const ratio = analysis.fluenceRatio || 0;
        if (ratio >= 1.0 && ratio < 1.5) return { text: '✓ OPTIMAL - At threshold', color: 'green' };
        if (ratio >= 0.7 && ratio < 2.0) return { text: '◐ GOOD - Near threshold', color: 'lime' };
        if (ratio < 0.5) return { text: '✗ POOR - Below threshold', color: 'red' };
        return { text: '⚠ HIGH - Above optimal', color: 'yellow' };
      },
      dataRows: [
        {
          label: 'Fluence:',
          getValue: (analysis) => `${(analysis.fluence || 0).toFixed(3)} J/cm²`,
        },
        {
          label: 'vs Threshold:',
          getValue: (analysis) => `${((analysis.fluenceRatio || 0) * 100).toFixed(1)}%`,
          getColor: (analysis) => {
            const ratio = analysis.fluenceRatio || 0;
            if (ratio >= 1.0 && ratio < 1.5) return 'text-green-400 font-semibold';
            if (ratio >= 0.7 && ratio < 2.0) return 'text-lime-400 font-semibold';
            if (ratio < 0.5) return 'text-red-400 font-semibold';
            return 'text-yellow-400 font-semibold';
          },
        },
      ],
    },
    {
      id: 'removalRate',
      label: 'Removal Rate',
      weight: '30%',
      description: 'Speed of material removal',
      color: 'blue',
      getValue: (analysis) => analysis.removalScore || 0,
    },
    {
      id: 'efficiency',
      label: 'Efficiency',
      weight: '20%',
      description: 'Energy optimization',
      color: 'yellow',
      getValue: (analysis) => analysis.efficiencyScore || 0,
    },
  ], []);

  return (
    <BaseHeatmap
      {...props}
      title={props.materialName ? `${props.materialName} Cleaning Efficiency` : "Cleaning Efficiency Analysis"}
      description="Shows cleaning performance across parameter space. Green = optimal effectiveness, Red = ineffective."
      icon={getSectionIcon('effectiveness')}
      calculateScore={calculateScore}
      getScoreLabel={getEffectivenessLabel}
      factorCards={factorCards}
      scoreType="effectiveness"
    />
  );
};
