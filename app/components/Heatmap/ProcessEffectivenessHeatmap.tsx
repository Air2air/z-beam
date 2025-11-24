// app/components/Heatmap/ProcessEffectivenessHeatmap.tsx
'use client';

import React, { useMemo } from 'react';
import { BaseHeatmap } from './BaseHeatmap';
import { getSectionIcon } from '@/app/config/sectionIcons';
import { BaseHeatmapProps, MaterialProperties, HeatmapRange, CellAnalysis } from './types';

interface ProcessEffectivenessHeatmapProps {
  powerRange: HeatmapRange;
  pulseRange: HeatmapRange;
  optimalPower: [number, number];
  optimalPulse: [number, number];
  materialProperties?: MaterialProperties;
  materialName?: string;
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

      // Energy calculations
      const repRateHz = 80000;
      const pulseEnergyJ = power / repRateHz;
      const spotDiameterUm = 300;
      const spotDiameterCm = spotDiameterUm / 10000;
      const spotAreaCm2 = Math.PI * Math.pow(spotDiameterCm / 2, 2);
      const fluence = pulseEnergyJ / spotAreaCm2;

      const ablationThresh = matProps.ablationThreshold || 1.0;
      const fluenceRatio = fluence / ablationThresh;

      // ABLATION EFFECTIVENESS - Primary factor (50% weight)
      // EXPANDED: Use full range with more gradual transitions
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

      // Apply moderate expansion for better color distribution
      const expandedScore = Math.pow(baseScore, 0.85);
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

  const renderAnalysisPanel = (hoveredCell: any | null, currentPower: number, currentPulse: number) => {
    const result = hoveredCell?.analysis || calculateScore(currentPower, currentPulse, materialProperties).analysis;
    const level = Math.round(result.level);
    const materialLabel = props.materialName || 'Process';
    
    return (
      <section>
        {/* Status Summary */}
        <article className={`mb-4 p-3 rounded-lg border-2 ${
          level >= 20 ? 'bg-green-900/20 border-green-500/50' :
          level >= 15 ? 'bg-lime-900/20 border-lime-500/50' :
          level >= 10 ? 'bg-yellow-900/20 border-yellow-500/50' :
          'bg-red-900/20 border-red-500/50'
        }`} aria-label="Effectiveness status summary">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-base">
              <span className="text-primary font-bold">
                {hoveredCell ? hoveredCell.power.toFixed(0) : currentPower}W
                {' × '}
                {hoveredCell ? hoveredCell.pulse.toFixed(1) : currentPulse}ns
              </span>
            </div>
            <span className={`text-sm font-bold ${
              level >= 20 ? 'text-green-400' :
              level >= 15 ? 'text-lime-400' :
              level >= 10 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {level}/25
            </span>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-sm font-semibold ${
              level >= 20 ? 'text-green-400' :
              level >= 15 ? 'text-lime-400' :
              level >= 10 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {getEffectivenessLabel(level)}
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="bg-gray-950 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all ${
                result.finalScore > 0.7 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                result.finalScore > 0.4 ? 'bg-gradient-to-r from-lime-500 to-green-400' :
                'bg-gradient-to-r from-yellow-500 to-amber-400'
              }`}
              style={{ width: `${result.finalScore * 100}%` }}
            />
          </div>
          <div className="text-[10px] text-tertiary mt-1 text-right">
            {Math.round(result.finalScore * 100)}% effective
          </div>
        </article>
        
        {/* Ablation Effectiveness Factor */}
        <article className="bg-tertiary rounded p-2 border border-green-500/30 text-xs" aria-label="Ablation effectiveness factor analysis">
          <div className="flex justify-between items-center mb-1">
                  <span className="text-tertiary font-medium">Ablation</span>
                  <span className="text-green-400 font-bold">50%</span>
                </div>
                <div className="text-[10px] text-muted mb-1.5">
                  Fluence vs ablation threshold effectiveness
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted">Fluence:</span>
                  <span className="text-primary">{result.fluence?.toFixed(3)} J/cm²</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted">vs Threshold:</span>
                  <span className={`font-semibold ${
                    result.fluenceRatio > 1.0 && result.fluenceRatio < 1.5 ? 'text-green-400' :
                    result.fluenceRatio > 0.7 && result.fluenceRatio < 2.0 ? 'text-lime-400' :
                    result.fluenceRatio < 0.5 ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {(result.fluenceRatio * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="mt-1.5 bg-gray-950 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      result.ablationScore > 0.8 ? 'bg-green-500' :
                      result.ablationScore > 0.5 ? 'bg-lime-500' :
                      result.ablationScore > 0.3 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${result.ablationScore * 100}%` }}
                />
              </div>
            </article>

            {/* Removal Rate Factor */}
            <article className="bg-tertiary rounded p-2 border border-blue-500/30 text-xs mt-2.5" aria-label="Removal rate factor analysis">
              <div className="flex justify-between items-center mb-1">
                  <span className="text-tertiary font-medium">Removal Rate</span>
                  <span className="text-blue-400 font-bold">30%</span>
                </div>
                <div className="text-[10px] text-muted mb-1.5">
                  Speed of material removal
                </div>
                <div className="mt-1.5 bg-gray-950 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      result.removalScore > 0.8 ? 'bg-green-500' :
                      result.removalScore > 0.5 ? 'bg-blue-400' :
                      'bg-blue-600'
                    }`}
                    style={{ width: `${result.removalScore * 100}%` }}
                />
              </div>
            </article>

            {/* Process Efficiency Factor */}
            <article className="bg-tertiary rounded p-2 border border-yellow-500/30 text-xs mt-2.5" aria-label="Process efficiency factor analysis">
              <div className="flex justify-between items-center mb-1">
                  <span className="text-tertiary font-medium">Efficiency</span>
                  <span className="text-yellow-400 font-bold">20%</span>
                </div>
                <div className="text-[10px] text-muted mb-1.5">
                  Energy optimization
                </div>
                <div className="mt-1.5 bg-gray-950 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      result.efficiencyScore > 0.7 ? 'bg-green-500' :
                      result.efficiencyScore > 0.4 ? 'bg-yellow-500' :
                      'bg-orange-500'
                    }`}
                    style={{ width: `${result.efficiencyScore * 100}%` }}
                />
              </div>
            </article>
      </section>
    );
  };

  const baseHeatmapProps: Omit<BaseHeatmapProps, 'calculateScore' | 'colorAnchors' | 'getScoreLabel' | 'legendItems' | 'renderAnalysisPanel'> = {
    ...props,
    title: props.materialName ? `${props.materialName} Cleaning Efficiency` : "Cleaning Efficiency Analysis",
    description: "Shows cleaning performance across parameter space. Green = optimal effectiveness, Red = ineffective.",
    icon: getSectionIcon('effectiveness')
  };

  return (
    <BaseHeatmap
      {...baseHeatmapProps}
      calculateScore={calculateScore}
      getScoreLabel={getEffectivenessLabel}
      renderAnalysisPanel={renderAnalysisPanel}
      colorAnchors={[
        { level: 1, color: '#7F1D1D' },  // red-900 - Completely ineffective
        { level: 3, color: '#B91C1C' },  // red-700 - Very poor
        { level: 6, color: '#DC2626' },  // red-600 - Poor
        { level: 9, color: '#F97316' },  // orange-500 - Suboptimal
        { level: 12, color: '#FB923C' }, // orange-400 - Below optimal
        { level: 15, color: '#FACC15' }, // yellow-400 - Moderate
        { level: 18, color: '#A3E635' }, // lime-400 - Good
        { level: 21, color: '#10B981' }, // green-500 - Excellent
        { level: 24, color: '#047857' }, // emerald-700 - Near optimal
        { level: 25, color: '#065F46' }  // emerald-800 - Peak performance
      ]}
      legendItems={[
        { color: '#047857', label: 'Optimal', range: '23-25' },
        { color: '#10B981', label: 'Excellent', range: '20-23' },
        { color: '#FACC15', label: 'Moderate', range: '15-20' },
        { color: '#F97316', label: 'Suboptimal', range: '10-15' },
        { color: '#DC2626', label: 'Ineffective', range: '1-10' }
      ]}
    />
  );
};
