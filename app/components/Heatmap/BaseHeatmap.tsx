// app/components/Heatmap/BaseHeatmap.tsx
'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SectionContainer } from '@/app/components/SectionContainer/SectionContainer';
import { SectionTitle } from '@/app/components/SectionTitle/SectionTitle';
import { HeatmapFactorCard } from './HeatmapFactorCard';
import { AnalysisCards } from './AnalysisCards';
import { BaseHeatmapProps, HoveredCell, ColorAnchor, LegendItem } from './types';
import { interpolateColor } from '@/app/utils/colorUtils';

// Default color anchors - smooth red-yellow-green gradient with even spacing
const DEFAULT_COLOR_ANCHORS: ColorAnchor[] = [
  { level: 1, color: '#991B1B' },   // red-800 (darkest red)
  { level: 5, color: '#DC2626' },   // red-600
  { level: 9, color: '#EA580C' },   // orange-600
  { level: 13, color: '#CA8A04' },  // yellow-600
  { level: 17, color: '#65A30D' },  // lime-600
  { level: 21, color: '#16A34A' },  // green-600
  { level: 25, color: '#047857' },  // emerald-700 (darkest green)
];

// Default legend items
const DEFAULT_LEGEND_ITEMS: LegendItem[] = [
  { color: '#047857', label: 'Optimal', range: '23-25' },
  { color: '#10B981', label: 'Good', range: '20-23' },
  { color: '#FACC15', label: 'Moderate', range: '15-20' },
  { color: '#F97316', label: 'Low', range: '10-15' },
  { color: '#DC2626', label: 'Poor', range: '1-10' },
];

/**
 * BaseHeatmap - Reusable heatmap visualization component
 * Provides:
 * - Grid layout with responsive sizing
 * - Hover interactions and tooltips
 * - Color interpolation (with sensible defaults)
 * - Current setting indicators
 * - Auto-generated analysis panel from factorCards OR custom renderer
 * 
 * Extensions customize:
 * - Score calculation logic
 * - Factor card configurations
 * - Labels (getScoreLabel)
 * - Optional: color mapping, custom analysis panel
 */
export const BaseHeatmap: React.FC<BaseHeatmapProps> = ({
  powerRange,
  pulseRange,
  optimalPower: _optimalPower,
  optimalPulse: _optimalPulse,
  materialProperties,
  title,
  description,
  icon,
  thumbnail,
  materialLink,
  gridRows = 13,
  gridCols = 13,
  calculateScore,
  colorAnchors = DEFAULT_COLOR_ANCHORS,
  getScoreLabel,
  legendItems: _legendItems = DEFAULT_LEGEND_ITEMS,
  factorCards,
  scoreType = 'safety',
  renderAnalysisPanel,
  footerDescription: _footerDescription,
  adaptiveColorScale = true,
}) => {
  // Immediate hover state for tooltips
  const [_hoveredCell, setHoveredCell] = useState<HoveredCell | null>(null);
  
  // Debounced hover state for analysis panel (reduces flicker)
  const [debouncedCell, setDebouncedCell] = useState<HoveredCell | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const powerStep = (powerRange.max - powerRange.min) / gridCols;
  const pulseStep = (pulseRange.max - pulseRange.min) / gridRows;

  // Calculate grid indices for current settings
  const currentPowerIndex = Math.round((powerRange.current - powerRange.min) / powerStep);
  const currentPulseIndex = Math.round((powerRange.current - pulseRange.min) / pulseStep);

  // Helper to extract status keyword from full label (e.g., "SAFE" from "SAFE - Low Risk")
  const getStatusKeyword = (label: string): string => {
    const parts = label.split(' - ');
    return parts[0] || label;
  };

  // Helper to calculate distance from optimal based on SCORE (not position)
  // Optimal = level 25 (100%), distance increases as level decreases
  // Returns 0% at level 25, 100% at level 1
  const getOptimalDistance = (level: number): number => {
    // Level 25 = optimal (0% distance), Level 1 = worst (100% distance)
    // Linear mapping: (25 - level) / 24 * 100
    const distance = ((25 - level) / 24) * 100;
    return Math.round(Math.max(0, Math.min(100, distance)));
  };

  // Get color class based on status keyword
  const getStatusColor = (keyword: string): string => {
    const k = keyword.toUpperCase();
    if (k.includes('OPTIMAL') || k.includes('EXCELLENT') || k.includes('SAFE')) return 'text-green-400';
    if (k.includes('GOOD')) return 'text-lime-400';
    if (k.includes('MODERATE') || k.includes('CAUTION')) return 'text-yellow-400';
    if (k.includes('SUBOPTIMAL') || k.includes('WARNING') || k.includes('POOR')) return 'text-orange-400';
    return 'text-red-400';
  };

  // Pre-compute score range for adaptive color scaling
  const { minLevel, maxLevel } = useMemo(() => {
    if (!adaptiveColorScale) return { minLevel: 1, maxLevel: 25 };
    
    let min = 25, max = 1;
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const power = powerRange.min + col * powerStep;
        const pulse = pulseRange.max - row * pulseStep;
        const { level } = calculateScore(power, pulse, materialProperties);
        min = Math.min(min, level);
        max = Math.max(max, level);
      }
    }
    // Ensure at least 3 levels of range for visible gradients
    if (max - min < 3) {
      const mid = (max + min) / 2;
      min = Math.max(1, mid - 2);
      max = Math.min(25, mid + 2);
    }
    return { minLevel: min, maxLevel: max };
  }, [adaptiveColorScale, gridRows, gridCols, powerRange, pulseRange, powerStep, pulseStep, calculateScore, materialProperties]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Handle cell hover with debouncing
   * - Tooltip updates immediately (hoveredCell)
   * - Analysis panel updates after 150ms pause (debouncedCell)
   */
  const handleCellHover = (power: number, pulse: number, analysis: any) => {
    const cellData = { power, pulse, analysis };
    
    // Immediate update for tooltip
    setHoveredCell(cellData);
    
    // Clear existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Debounced update for analysis panel (150ms delay)
    hoverTimeoutRef.current = setTimeout(() => {
      setDebouncedCell(cellData);
    }, 150);
  };

  /**
   * Handle cell leave
   * Clear immediate hover but keep debounced cell (prevents flicker)
   */
  const handleCellLeave = () => {
    setHoveredCell(null);
    // Don't clear timeout - let it complete naturally
    // Don't clear debouncedCell - keep last analyzed cell visible
  };

  /**
   * Map level to color using adaptive scaling with perceptually smooth gradient
   * Uses 16-stop interpolation through key color points for ultra-smooth transitions
   */
  const getColor = (level: number): string => {
    const clampedLevel = Math.max(minLevel, Math.min(maxLevel, level));
    
    // Normalize level to 0-1 range based on actual data range (adaptive scaling)
    const range = maxLevel - minLevel;
    const t = range > 0 ? (clampedLevel - minLevel) / range : 0.5;
    
    // 16-stop color gradient for ultra-smooth perceptual transitions
    // Carefully tuned RGB values to avoid banding and ensure even visual progression
    const colorStops = [
      // Deep reds (danger zone: 0-15%)
      { pos: 0.000, r: 127, g: 29, b: 29 },   // red-900 (darkest)
      { pos: 0.050, r: 153, g: 27, b: 27 },   // red-800
      { pos: 0.100, r: 185, g: 28, b: 28 },   // red-700
      { pos: 0.150, r: 220, g: 38, b: 38 },   // red-600
      
      // Reds to oranges (warning zone: 15-35%)
      { pos: 0.200, r: 239, g: 68, b: 68 },   // red-500
      { pos: 0.250, r: 249, g: 115, b: 22 },  // orange-500
      { pos: 0.300, r: 234, g: 88, b: 12 },   // orange-600
      { pos: 0.350, r: 217, g: 119, b: 6 },   // amber-600
      
      // Oranges to yellows (caution zone: 35-50%)
      { pos: 0.400, r: 202, g: 138, b: 4 },   // yellow-600
      { pos: 0.450, r: 234, g: 179, b: 8 },   // yellow-500
      { pos: 0.500, r: 250, g: 204, b: 21 },  // yellow-400 (midpoint)
      
      // Yellows to limes (improving zone: 50-70%)
      { pos: 0.550, r: 190, g: 190, b: 22 },  // yellow-lime blend
      { pos: 0.600, r: 163, g: 190, b: 16 },  // lime-500
      { pos: 0.650, r: 132, g: 204, b: 22 },  // lime-400
      { pos: 0.700, r: 101, g: 163, b: 13 },  // lime-600
      
      // Limes to greens (good zone: 70-85%)
      { pos: 0.750, r: 74, g: 163, b: 42 },   // green-lime blend
      { pos: 0.800, r: 34, g: 197, b: 94 },   // green-400
      { pos: 0.850, r: 22, g: 163, b: 74 },   // green-500
      
      // Deep greens (optimal zone: 85-100%)
      { pos: 0.900, r: 21, g: 128, b: 61 },   // green-600
      { pos: 0.950, r: 4, g: 120, b: 87 },    // emerald-700
      { pos: 1.000, r: 6, g: 95, b: 70 },     // emerald-800 (safest)
    ];
    
    // Find the two stops we're between
    let lower = colorStops[0];
    let upper = colorStops[colorStops.length - 1];
    
    for (let i = 0; i < colorStops.length - 1; i++) {
      if (t >= colorStops[i].pos && t <= colorStops[i + 1].pos) {
        lower = colorStops[i];
        upper = colorStops[i + 1];
        break;
      }
    }
    
    // Smooth interpolation between the two stops using ease function
    const localT = (t - lower.pos) / (upper.pos - lower.pos);
    // Apply smoothstep for perceptually even transitions
    const smoothT = localT * localT * (3 - 2 * localT);
    
    const r = Math.round(lower.r + (upper.r - lower.r) * smoothT);
    const g = Math.round(lower.g + (upper.g - lower.g) * smoothT);
    const b = Math.round(lower.b + (upper.b - lower.b) * smoothT);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  return (
    <SectionContainer
      bgColor="transparent"
      className="heatmap bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg mb-8"
      horizPadding={true}
    >
      <SectionTitle
        title={title}
        icon={icon}
        description={description}
        thumbnail={thumbnail}
        thumbnailLink={materialLink}
      />

      <div className="flex flex-col gap-6">
        {/* Heatmap Grid - Full width on top */}
        <figure className="w-full" aria-label={`${title} interactive heatmap`}>
          {/* Status Bar - Aligned with grid (offset by Y-axis label + scale width) */}
          <div className="flex gap-2">
            {/* Spacer for Y-axis label */}
            <div style={{ writingMode: 'vertical-rl' }} className="invisible">
              <div className="text-base font-bold whitespace-nowrap">Pulse</div>
            </div>
            {/* Spacer for Y-axis scale */}
            <div className="w-12"></div>
            {/* Status bar content */}
            {(() => {
              const currentAnalysis = debouncedCell?.analysis || calculateScore(powerRange.current, pulseRange.current, materialProperties).analysis;
              const currentPower = debouncedCell?.power ?? powerRange.current;
              const currentPulse = debouncedCell?.pulse ?? pulseRange.current;
              const currentLevel = Math.round(currentAnalysis.level);
              const fullLabel = getScoreLabel(currentLevel);
              const statusKeyword = getStatusKeyword(fullLabel);
              const fluence = currentAnalysis.fluence;
              const optimalDist = getOptimalDistance(currentLevel);
              const statusColorClass = getStatusColor(statusKeyword);
              
              return (
                <div 
                  key={`status-${currentPower}-${currentPulse}-${currentLevel}`}
                  className="flex-1 flex items-center justify-between bg-primary rounded-t-lg px-4 py-2 mb-0 border-b border-gray-600/50"
                  role="status"
                  aria-live="polite"
                >
                  {/* Status Keyword */}
                  <div className="flex items-center gap-2">
                    <span 
                      className={`text-lg font-bold ${statusColorClass}`}
                      style={{ transition: 'color 150ms ease-out' }}
                    >
                      {statusKeyword}
                    </span>
                  </div>
                  
                  {/* Fluence Value */}
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-gray-400">Fluence:</span>
                    <span className="font-mono font-semibold text-white">
                      {fluence !== undefined ? fluence.toFixed(2) : '—'} J/cm²
                    </span>
                  </div>
                  
                  {/* Distance from Optimal */}
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-gray-400">From optimal:</span>
                    <span 
                      className={`font-mono font-semibold ${optimalDist <= 10 ? 'text-green-400' : optimalDist <= 25 ? 'text-yellow-400' : 'text-orange-400'}`}
                      style={{ transition: 'color 150ms ease-out' }}
                    >
                      {optimalDist}%
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
          
          <div className="flex gap-2">
            {/* Y-axis label - rotated vertically */}
            <div className="flex items-center justify-center" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              <div className="text-base font-bold whitespace-nowrap">
                Pulse Duration (ns)
              </div>
            </div>

            {/* Y-axis scale */}
            <div className="flex flex-col justify-between text-base font-semibold w-12 text-right pr-2" role="list" aria-label="Pulse duration scale">
              {Array.from({ length: 5 }).map((_, i) => {
                const value = pulseRange.max - (i * (pulseRange.max - pulseRange.min)) / 4;
                return <div key={i} role="listitem">{value.toFixed(0)}</div>;
              })}
            </div>

            <div className="flex-1 relative">
              <div
                className="grid gap-0 w-full h-[120px] sm:h-[180px] md:h-[200px]"
                style={{
                  gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                  gridTemplateRows: `repeat(${gridRows}, 1fr)`
                }}
                role="grid"
                aria-label="Parameter effectiveness grid"
              >
                {Array.from({ length: gridRows }).map((_, rowIdx) =>
                  Array.from({ length: gridCols }).map((_, colIdx) => {
                    const power = powerRange.min + colIdx * powerStep;
                    const pulse = pulseRange.max - rowIdx * pulseStep;
                    const { level, analysis } = calculateScore(power, pulse, materialProperties);
                    
                    const isCurrentSetting = 
                      Math.abs(colIdx - currentPowerIndex) <= 1 && 
                      Math.abs(rowIdx - (gridRows - currentPulseIndex)) <= 1;
                    
                    const baseColor = getColor(level);
                    const displayColor = isCurrentSetting 
                      ? interpolateColor(baseColor, '#3B82F6', 0.5)
                      : baseColor;
                    
                    return (
                      <div
                        key={`${rowIdx}-${colIdx}`}
                        className="heatmap-cell"
                        style={{ backgroundColor: displayColor, opacity: 0.9 }}
                        onMouseEnter={() => handleCellHover(power, pulse, { ...analysis, level })}
                        onMouseLeave={handleCellLeave}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* X-axis scale and label */}
          <div className="flex gap-2">
            {/* Spacer for Y-axis label */}
            <div style={{ width: '1.5rem' }}></div>
            
            {/* Spacer for Y-axis scale */}
            <div className="w-12"></div>
            
            {/* X-axis scale values */}
            <div className="flex-1">
              <div className="flex justify-between text-base font-semibold px-1 mt-1" role="list" aria-label="Power scale">
                {Array.from({ length: 7 }).map((_, i) => {
                  const value = powerRange.min + (i * (powerRange.max - powerRange.min)) / 6;
                  return <div key={i} role="listitem">{value.toFixed(0)}</div>;
                })}
              </div>
              
              {/* X-axis label */}
              <figcaption className="text-center text-base font-bold mt-1">
                Power (W)
              </figcaption>
            </div>
          </div>
        </figure>

        {/* Analysis and Legend - Full width below */}
        <aside className="w-full space-y-4" role="complementary" aria-label="Analysis panels">
          {/* Priority 1: Custom renderAnalysisPanel if provided */}
          {/* Priority 2: Auto-generate from factorCards using AnalysisCards grid */}
          {/* Priority 3: Minimal default panel with just status summary */}
          {renderAnalysisPanel ? (
            renderAnalysisPanel(debouncedCell, powerRange.current, pulseRange.current)
          ) : factorCards && factorCards.length > 0 ? (
            // Auto-generated analysis panel using PropertyBars-style grid
            <section key={debouncedCell ? `${debouncedCell.power}-${debouncedCell.pulse}` : 'default'}>
              <AnalysisCards
                factorCards={factorCards}
                analysis={debouncedCell?.analysis || calculateScore(powerRange.current, pulseRange.current, materialProperties).analysis}
                statusSummary={{
                  power: debouncedCell ? debouncedCell.power : powerRange.current,
                  pulse: debouncedCell ? debouncedCell.pulse : pulseRange.current,
                  level: Math.round((debouncedCell?.analysis || calculateScore(powerRange.current, pulseRange.current, materialProperties).analysis).level),
                  finalScore: (debouncedCell?.analysis || calculateScore(powerRange.current, pulseRange.current, materialProperties).analysis).finalScore,
                  scoreLabel: getScoreLabel(Math.round((debouncedCell?.analysis || calculateScore(powerRange.current, pulseRange.current, materialProperties).analysis).level)),
                  scoreType: scoreType,
                }}
                columns={{ xs: 2, sm: 3, md: 4, lg: 5 }}
              />
            </section>
          ) : (
            // Minimal default panel when no factorCards provided - status summary only
            <section className="heatmap-analysis-panel" key={debouncedCell ? `${debouncedCell.power}-${debouncedCell.pulse}-min` : 'default-min'}>
              <AnalysisCards
                factorCards={[]}
                analysis={{}}
                statusSummary={{
                  power: debouncedCell ? debouncedCell.power : powerRange.current,
                  pulse: debouncedCell ? debouncedCell.pulse : pulseRange.current,
                  level: Math.round((debouncedCell?.analysis || calculateScore(powerRange.current, pulseRange.current, materialProperties).analysis).level),
                  finalScore: (debouncedCell?.analysis || calculateScore(powerRange.current, pulseRange.current, materialProperties).analysis).finalScore,
                  scoreLabel: getScoreLabel(Math.round((debouncedCell?.analysis || calculateScore(powerRange.current, pulseRange.current, materialProperties).analysis).level)),
                  scoreType: scoreType,
                }}
                columns={{ xs: 2, sm: 3, md: 4, lg: 5 }}
              />
            </section>
          )}
        </aside>
      </div>

    </SectionContainer>
  );
};
