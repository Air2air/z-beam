// app/components/Heatmap/BaseHeatmap.tsx
'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SectionContainer } from '@/app/components/SectionContainer/SectionContainer';
import { BaseHeatmapProps, HoveredCell } from './types';

/**
 * BaseHeatmap - Reusable heatmap visualization component
 * Provides:
 * - Grid layout with responsive sizing
 * - Hover interactions and tooltips
 * - Color interpolation
 * - Current setting indicators
 * - Flexible analysis panel
 * 
 * Extensions customize:
 * - Score calculation logic
 * - Color mapping
 * - Analysis panel content
 * - Labels and legends
 */
export const BaseHeatmap: React.FC<BaseHeatmapProps> = ({
  powerRange,
  pulseRange,
  optimalPower,
  optimalPulse,
  materialProperties,
  title,
  description,
  gridRows = 20,
  gridCols = 20,
  calculateScore,
  colorAnchors,
  getScoreLabel,
  legendItems,
  renderAnalysisPanel,
  footerDescription,
}) => {
  // Immediate hover state for tooltips
  const [hoveredCell, setHoveredCell] = useState<HoveredCell | null>(null);
  
  // Debounced hover state for analysis panel (reduces flicker)
  const [debouncedCell, setDebouncedCell] = useState<HoveredCell | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const powerStep = (powerRange.max - powerRange.min) / gridCols;
  const pulseStep = (pulseRange.max - pulseRange.min) / gridRows;

  // Calculate grid indices for current settings
  const currentPowerIndex = Math.round((powerRange.current - powerRange.min) / powerStep);
  const currentPulseIndex = Math.round((powerRange.current - pulseRange.min) / pulseStep);

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
   * Color interpolation between two hex colors
   */
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
    
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  /**
   * Map level (1-25) to color using configured anchors
   * Smoothly interpolates between anchor points
   */
  const getColor = (level: number): string => {
    const clampedLevel = Math.max(1, Math.min(25, level));
    
    // Find surrounding anchor points
    let lowerAnchor = colorAnchors[0];
    let upperAnchor = colorAnchors[colorAnchors.length - 1];
    
    for (let i = 0; i < colorAnchors.length - 1; i++) {
      if (clampedLevel >= colorAnchors[i].level && clampedLevel <= colorAnchors[i + 1].level) {
        lowerAnchor = colorAnchors[i];
        upperAnchor = colorAnchors[i + 1];
        break;
      }
    }
    
    // If exact match, return that color
    if (clampedLevel === lowerAnchor.level) return lowerAnchor.color;
    if (clampedLevel === upperAnchor.level) return upperAnchor.color;
    
    // Interpolate between anchors
    const range = upperAnchor.level - lowerAnchor.level;
    const position = clampedLevel - lowerAnchor.level;
    const factor = position / range;
    
    return interpolateColor(lowerAnchor.color, upperAnchor.color, factor);
  };

  return (
    <SectionContainer
      title={title}
      bgColor="transparent"
      className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg mb-8"
      horizPadding={true}
    >
      {description && (
        <p className="mb-6 text-gray-300">{description}</p>
      )}

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Heatmap Grid */}
        <figure className="w-full sm:w-3/5 order-2 sm:order-1 max-w-2xl" aria-label={`${title} interactive heatmap`}>
          <div className="flex gap-2">
            {/* Y-axis label - rotated vertically */}
            <div className="flex items-center justify-center" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              <div className="text-sm text-gray-100 font-bold whitespace-nowrap">
                Pulse Duration (ns)
              </div>
            </div>

            {/* Y-axis scale */}
            <div className="flex flex-col justify-between text-sm text-gray-100 font-semibold w-12 text-right pr-2" role="list" aria-label="Pulse duration scale">
              {Array.from({ length: 5 }).map((_, i) => {
                const value = pulseRange.max - (i * (pulseRange.max - pulseRange.min)) / 4;
                return <div key={i} role="listitem">{value.toFixed(0)}</div>;
              })}
            </div>

            <div className="flex-1 relative">
              <div
                className="grid gap-1"
                style={{
                  gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                  gridTemplateRows: `repeat(${gridRows}, 1fr)`,
                  aspectRatio: '1 / 1'
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
                        className="aspect-square relative group cursor-pointer transition-transform hover:scale-125 hover:z-10"
                        style={{ 
                          backgroundColor: displayColor,
                          opacity: 0.9
                        }}
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
              <div className="flex justify-between text-sm text-gray-100 font-semibold px-1 mt-1" role="list" aria-label="Power scale">
                {Array.from({ length: 5 }).map((_, i) => {
                  const value = powerRange.min + (i * (powerRange.max - powerRange.min)) / 4;
                  return <div key={i} role="listitem">{value.toFixed(0)}</div>;
                })}
              </div>
              
              {/* X-axis label */}
              <figcaption className="text-center text-sm text-gray-100 font-bold mt-1">
                Power (W)
              </figcaption>
            </div>
          </div>
        </figure>

        {/* Right: Analysis and Legend */}
        <aside className="w-full sm:w-2/5 order-1 sm:order-2 space-y-4" role="complementary" aria-label="Analysis panels">
          {/* Render custom analysis panel or default banner-style panel */}
          {/* Use debouncedCell for analysis panel to prevent flicker */}
          {renderAnalysisPanel ? (
            renderAnalysisPanel(debouncedCell, powerRange.current, pulseRange.current)
          ) : (
            <section className="bg-gray-800/80 rounded-lg p-4 border border-gray-700" aria-labelledby="default-analysis-heading">
              <h4 id="default-analysis-heading" className="text-xs font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <span className="text-purple-400" aria-hidden="true">⚙️</span>
                Analysis
              </h4>
              
              {/* Status Banner */}
              <div className={`mb-4 p-3 rounded-lg border-2 ${
                (() => {
                  const analysis = debouncedCell?.analysis || calculateScore(powerRange.current, pulseRange.current, materialProperties).analysis;
                  const level = Math.round(analysis.level);
                  if (level >= 20) return 'bg-green-900/20 border-green-500/50';
                  if (level >= 15) return 'bg-yellow-900/20 border-yellow-500/50';
                  if (level >= 9) return 'bg-orange-900/20 border-orange-500/50';
                  return 'bg-red-900/20 border-red-500/50';
                })()
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">📍</span>
                    <span className="text-white font-semibold">
                      {debouncedCell ? debouncedCell.power.toFixed(0) : powerRange.current}W
                      {' × '}
                      {debouncedCell ? debouncedCell.pulse.toFixed(1) : pulseRange.current}ns
                    </span>
                  </div>
                  <span className={`text-xs font-bold ${
                    (() => {
                      const analysis = debouncedCell?.analysis || calculateScore(powerRange.current, pulseRange.current, materialProperties).analysis;
                      const level = Math.round(analysis.level);
                      if (level >= 20) return 'text-green-400';
                      if (level >= 15) return 'text-yellow-400';
                      if (level >= 9) return 'text-orange-400';
                      return 'text-red-400';
                    })()
                  }`}>
                    {Math.round((debouncedCell?.analysis || calculateScore(powerRange.current, pulseRange.current, materialProperties).analysis).level)}/25
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-400 text-xs">📊</span>
                  <span className={`text-sm font-semibold ${
                    (() => {
                      const analysis = debouncedCell?.analysis || calculateScore(powerRange.current, pulseRange.current, materialProperties).analysis;
                      const level = Math.round(analysis.level);
                      if (level >= 20) return 'text-green-400';
                      if (level >= 15) return 'text-yellow-400';
                      if (level >= 9) return 'text-orange-400';
                      return 'text-red-400';
                    })()
                  }`}>
                    {getScoreLabel(Math.round((debouncedCell?.analysis || calculateScore(powerRange.current, pulseRange.current, materialProperties).analysis).level))}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="bg-gray-950 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      (() => {
                        const finalScore = (debouncedCell?.analysis || calculateScore(powerRange.current, pulseRange.current, materialProperties).analysis).finalScore;
                        if (finalScore > 0.7) return 'bg-gradient-to-r from-green-500 to-emerald-400';
                        if (finalScore > 0.4) return 'bg-gradient-to-r from-yellow-500 to-amber-400';
                        return 'bg-gradient-to-r from-red-500 to-orange-400';
                      })()
                    }`}
                    style={{ width: `${((debouncedCell?.analysis || calculateScore(powerRange.current, pulseRange.current, materialProperties).analysis).finalScore * 100)}%` }}
                  />
                </div>
                <div className="text-[10px] text-gray-400 mt-1 text-right">
                  {Math.round((debouncedCell?.analysis || calculateScore(powerRange.current, pulseRange.current, materialProperties).analysis).finalScore * 100)}% score
                </div>
              </div>
            </section>
          )}

          {/* Color Legend - Commented Out */}
          {/* <aside className="bg-gray-800 rounded-lg p-4 border border-gray-700" role="complementary" aria-labelledby="legend-heading">
            <h4 id="legend-heading" className="text-xs font-semibold text-gray-300 mb-2">Color Legend</h4>
            <div className="space-y-2 text-xs">
              {legendItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-400">
                    {item.label} {item.range && `(${item.range})`}
                  </span>
                </div>
              ))}
            </div>
          </aside> */}
        </aside>
      </div>

    </SectionContainer>
  );
};
