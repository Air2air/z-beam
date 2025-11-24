// app/components/Heatmap/MaterialSafetyHeatmap.tsx
'use client';

import React, { useMemo } from 'react';
import { BaseHeatmap } from './BaseHeatmap';
import { getSectionIcon } from '@/app/config/sectionIcons';
import { BaseHeatmapProps, MaterialProperties, HeatmapRange, CellAnalysis, HoveredCell } from './types';

interface MaterialSafetyHeatmapProps {
  powerRange: HeatmapRange;
  pulseRange: HeatmapRange;
  optimalPower: [number, number];
  optimalPulse: [number, number];
  materialProperties?: MaterialProperties;
  materialName?: string;
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

      // Energy calculations
      const repRateHz = 80000;
      const pulseEnergyJ = power / repRateHz;
      const spotDiameterUm = 300;
      const spotDiameterCm = spotDiameterUm / 10000;
      const spotAreaCm2 = Math.PI * Math.pow(spotDiameterCm / 2, 2);
      const fluence = pulseEnergyJ / spotAreaCm2;

      const damageThresh = matProps.laserDamageThreshold || 5.0;
      const fluenceRatio = fluence / damageThresh;

      // Calculate position in parameter space (normalized 0-1)
      // EXPANDED: Use wider effective ranges to spread colors across full parameter space
      const powerNormalized = (power - powerRange.min) / (powerRange.max - powerRange.min);
      const pulseNormalized = (pulse - pulseRange.min) / (pulseRange.max - pulseRange.min);
      
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

      // THERMAL SHOCK RESISTANCE
      const thermalShock = matProps.thermalShockResistance || 200;
      const shockScore = Math.min(1.0, thermalShock / 400);

      // CALCULATE FINAL SAFETY SCORE - Direct weighted sum (all factors 0-1)
      const baseScore = (
        damageScore * 0.50 +      // Fluence-based damage risk
        powerScore * 0.25 +       // Spatial power contribution
        pulseScore * 0.20 +       // Temporal pulse contribution
        shockScore * 0.05         // Thermal shock resistance
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
          shockScore,
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

  const renderAnalysisPanel = (hoveredCell: HoveredCell | null, currentPower: number, currentPulse: number) => {
    const result = hoveredCell?.analysis || calculateScore(currentPower, currentPulse, materialProperties).analysis;
    const level = Math.round(result.level);
    const materialLabel = props.materialName || 'Material';
    
    return (
      <section>
        {/* Status Summary */}
        <article className={`mb-4 p-3 rounded-lg border-2 ${
          level >= 20 ? 'bg-green-900/20 border-green-500/50' :
          level >= 15 ? 'bg-yellow-900/20 border-yellow-500/50' :
          level >= 9 ? 'bg-orange-900/20 border-orange-500/50' :
          'bg-red-900/20 border-red-500/50'
        }`} aria-label="Safety status summary">
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
              level >= 15 ? 'text-yellow-400' :
              level >= 9 ? 'text-orange-400' :
              'text-red-400'
            }`}>
              {level}/25
            </span>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-sm font-semibold ${
              level >= 20 ? 'text-green-400' :
              level >= 15 ? 'text-yellow-400' :
              level >= 9 ? 'text-orange-400' :
              'text-red-400'
            }`}>
              {getSafetyLabel(level)}
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="bg-gray-950 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all ${
                result.finalScore > 0.7 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                result.finalScore > 0.4 ? 'bg-gradient-to-r from-yellow-500 to-amber-400' :
                'bg-gradient-to-r from-red-500 to-orange-400'
              }`}
              style={{ width: `${result.finalScore * 100}%` }}
            />
          </div>
          <div className="text-[10px] text-tertiary mt-1 text-right">
            {Math.round(result.finalScore * 100)}% safe
          </div>
        </article>
        
        {/* Damage Risk Factor */}
        <article className="bg-tertiary rounded p-2 border border-red-500/30 text-xs" aria-label="Damage risk factor analysis">
          <div className="flex justify-between items-center mb-1">
            <span className="text-tertiary font-medium">Damage Risk</span>
            <span className="text-red-400 font-bold">50%</span>
          </div>
          <div className="text-[10px] text-muted mb-1.5">
            Will this damage the material?
          </div>
          
          {/* Clear status indicator */}
          <div className={`mb-1.5 px-2 py-1 rounded text-[10px] font-semibold text-center ${
            result.fluenceRatio < 0.5 ? 'bg-green-500/20 text-green-300' :
            result.fluenceRatio < 0.8 ? 'bg-yellow-500/20 text-yellow-300' :
            result.fluenceRatio < 1.0 ? 'bg-orange-500/20 text-orange-300' :
            'bg-red-500/20 text-red-300'
          }`}>
            {result.fluenceRatio < 0.5 ? '✓ SAFE - Well below damage threshold' :
             result.fluenceRatio < 0.8 ? '⚠ CAUTION - Approaching damage threshold' :
             result.fluenceRatio < 1.0 ? '⚠ WARNING - Near damage threshold' :
             '✗ DANGER - Exceeds damage threshold'}
          </div>
          
          <div className="flex justify-between text-[10px] mb-0.5">
            <span className="text-muted">Current Energy:</span>
            <span className="text-primary">{result.fluence.toFixed(2)} J/cm²</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-muted">Damage Threshold:</span>
            <span className="text-tertiary">{(result.fluence / result.fluenceRatio).toFixed(2)} J/cm²</span>
          </div>
          
          <div className="mt-1.5 bg-gray-950 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full transition-all ${
                result.damageScore > 0.7 ? 'bg-green-500' :
                result.damageScore > 0.4 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${result.damageScore * 100}%` }}
            />
          </div>
        </article>

        {/* Power Factor */}
        <article className="bg-tertiary rounded p-2 border border-orange-500/30 text-xs mt-2.5" aria-label="Power factor analysis">
          <div className="flex justify-between items-center mb-1">
            <span className="text-tertiary font-medium">Power Factor</span>
            <span className="text-orange-400 font-bold">25%</span>
          </div>
          <div className="text-[10px] text-muted mb-1.5">
            Spatial power distribution effects
          </div>
          <div className="mt-1.5 bg-gray-950 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full transition-all ${
                result.powerScore > 0.7 ? 'bg-green-500' :
                result.powerScore < 0.3 ? 'bg-red-500' :
                'bg-orange-500'
              }`}
              style={{ width: `${result.powerScore * 100}%` }}
            />
          </div>
        </article>

        {/* Pulse Duration Factor */}
        <article className="bg-tertiary rounded p-2 border border-yellow-500/30 text-xs mt-2.5" aria-label="Pulse duration factor analysis">
          <div className="flex justify-between items-center mb-1">
            <span className="text-tertiary font-medium">Pulse Factor</span>
            <span className="text-yellow-400 font-bold">20%</span>
          </div>
          <div className="text-[10px] text-muted mb-1.5">
            Thermal accumulation effects
          </div>
          <div className="mt-1.5 bg-gray-950 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full transition-all ${
                result.pulseScore > 0.7 ? 'bg-green-500' :
                result.pulseScore < 0.3 ? 'bg-red-500' :
                'bg-yellow-500'
              }`}
              style={{ width: `${result.pulseScore * 100}%` }}
            />
          </div>
        </article>

        {/* Thermal Shock Resistance Factor */}
        <article className="bg-tertiary rounded p-2 border border-blue-500/30 text-xs mt-2.5" aria-label="Thermal shock resistance factor analysis">
          <div className="flex justify-between items-center mb-1">
            <span className="text-tertiary font-medium">Shock Resistance</span>
            <span className="text-blue-400 font-bold">5%</span>
          </div>
          <div className="text-[10px] text-muted mb-1.5">
            Material thermal shock tolerance
          </div>
          <div className="mt-1.5 bg-gray-950 rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${result.shockScore * 100}%` }}
            />
          </div>
        </article>
      </section>
    );
  };

  const baseHeatmapProps: Omit<BaseHeatmapProps, 'calculateScore' | 'colorAnchors' | 'getScoreLabel' | 'legendItems'> = {
    ...props,
    title: props.materialName ? `${props.materialName} Material Safety` : "Material Safety Analysis",
    description: "Shows damage risk across parameter space. Green = safe, Red = damage danger.",
    icon: getSectionIcon('safety'),
    renderAnalysisPanel
  };

  return (
    <BaseHeatmap
      {...baseHeatmapProps}
      calculateScore={calculateScore}
      getScoreLabel={getSafetyLabel}
      colorAnchors={[
        { level: 1, color: '#7F1D1D' },  // red-900 - Catastrophic
        { level: 3, color: '#B91C1C' },  // red-700 - Extreme danger
        { level: 6, color: '#DC2626' },  // red-600 - High danger
        { level: 9, color: '#F97316' },  // orange-500 - Warning
        { level: 12, color: '#FB923C' }, // orange-400 - Moderate caution
        { level: 15, color: '#FACC15' }, // yellow-400 - Caution
        { level: 18, color: '#A3E635' }, // lime-400 - Low risk
        { level: 21, color: '#10B981' }, // green-500 - Safe
        { level: 24, color: '#047857' }, // emerald-700 - Very safe
        { level: 25, color: '#065F46' }  // emerald-800 - Optimal safety
      ]}
      legendItems={[
        { color: '#047857', label: 'Safe', range: '23-25' },
        { color: '#10B981', label: 'Low Risk', range: '20-23' },
        { color: '#FACC15', label: 'Caution', range: '15-20' },
        { color: '#F97316', label: 'Warning', range: '10-15' },
        { color: '#DC2626', label: 'Danger', range: '1-10' }
      ]}
    />
  );
};
