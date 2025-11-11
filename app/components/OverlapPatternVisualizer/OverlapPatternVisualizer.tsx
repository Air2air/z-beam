// app/components/OverlapPatternVisualizer/OverlapPatternVisualizer.tsx
'use client';

import React, { useState } from 'react';

interface OverlapPatternVisualizerProps {
  spotSize: number; // mm
  scanSpeed: number; // mm/s
  repRate: number; // Hz
  overlapRatio: number; // %
}

/**
 * Interactive visualization of laser spot overlap patterns
 * Shows actual pulse positions and coverage uniformity
 */
export const OverlapPatternVisualizer: React.FC<OverlapPatternVisualizerProps> = ({
  spotSize,
  scanSpeed,
  repRate,
  overlapRatio,
}) => {
  const [viewMode, setViewMode] = useState<'spots' | 'heatmap' | 'crossSection'>('spots');
  const [zoom, setZoom] = useState(1);

  // Calculate pulse spacing
  const pulseSpacing = (scanSpeed / (repRate / 1000)); // mm between pulses
  const calculatedOverlap = (1 - pulseSpacing / spotSize) * 100;
  
  // Determine if overlap is correct
  const overlapMatch = Math.abs(calculatedOverlap - overlapRatio) < 5;
  
  // Generate pulse positions for visualization (10mm x 10mm area)
  const scanLines = 5;
  const pulsesPerLine = Math.floor(10 / pulseSpacing);
  const lineSpacing = spotSize * (1 - overlapRatio / 100); // Line spacing for desired overlap

  const generatePulses = () => {
    const pulses: Array<{ x: number; y: number; line: number; pulse: number }> = [];
    
    for (let line = 0; line < scanLines; line++) {
      const yPos = line * lineSpacing;
      for (let pulse = 0; pulse < pulsesPerLine; pulse++) {
        const xPos = pulse * pulseSpacing;
        pulses.push({ x: xPos, y: yPos, line, pulse });
      }
    }
    
    return pulses;
  };

  const pulses = generatePulses();

  // Calculate coverage map for heatmap view (simplified)
  const generateCoverageMap = () => {
    const gridSize = 50; // 50x50 grid
    const cellSize = 10 / gridSize;
    const coverage: number[][] = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));

    pulses.forEach((pulse) => {
      const centerX = Math.floor(pulse.x / cellSize);
      const centerY = Math.floor(pulse.y / cellSize);
      const radius = Math.ceil((spotSize / 2) / cellSize);

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const gridX = centerX + dx;
          const gridY = centerY + dy;
          
          if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
            const distance = Math.sqrt(dx * dx + dy * dy) * cellSize;
            if (distance <= spotSize / 2) {
              // Gaussian intensity profile
              const intensity = Math.exp(-Math.pow(distance / (spotSize / 4), 2));
              coverage[gridY][gridX] += intensity;
            }
          }
        }
      }
    });

    return coverage;
  };

  const coverageMap = viewMode === 'heatmap' ? generateCoverageMap() : [];

  // Calculate coverage statistics
  const flatCoverage = coverageMap.flat();
  const avgCoverage = flatCoverage.length > 0 ? flatCoverage.reduce((a, b) => a + b, 0) / flatCoverage.length : 0;
  const minCoverage = flatCoverage.length > 0 ? Math.min(...flatCoverage) : 0;
  const maxCoverage = flatCoverage.length > 0 ? Math.max(...flatCoverage) : 0;
  const uniformity = maxCoverage > 0 ? ((1 - (maxCoverage - minCoverage) / maxCoverage) * 100) : 0;

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">
          Scan Pattern Visualizer
        </h3>
        <p className="text-sm text-gray-400">
          See actual laser pulse positions and coverage uniformity for your scan parameters
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr,350px] gap-6">
        {/* Visualization Canvas */}
        <div className="bg-gray-950 rounded-lg p-4 border border-gray-700">
          {/* View Mode Tabs */}
          <div className="flex gap-2 mb-4">
            {(['spots', 'heatmap', 'crossSection'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {mode === 'spots' && '🎯 Spot Positions'}
                {mode === 'heatmap' && '🌡️ Coverage Map'}
                {mode === 'crossSection' && '📊 Cross Section'}
              </button>
            ))}
          </div>

          {/* SVG Canvas */}
          <svg
            viewBox={`0 0 ${10 * zoom + 2} ${10 * zoom + 2}`}
            className="w-full h-auto bg-black rounded"
            style={{ minHeight: '400px' }}
          >
            {/* Grid */}
            {Array.from({ length: 11 }, (_, i) => (
              <g key={i}>
                <line
                  x1={1}
                  y1={1 + i * zoom}
                  x2={11}
                  y2={1 + i * zoom}
                  stroke="#1F2937"
                  strokeWidth={0.02}
                />
                <line
                  x1={1 + i * zoom}
                  y1={1}
                  x2={1 + i * zoom}
                  y2={11}
                  stroke="#1F2937"
                  strokeWidth={0.02}
                />
              </g>
            ))}

            {viewMode === 'spots' && (
              <>
                {/* Draw laser spots */}
                {pulses.map((pulse, idx) => (
                  <circle
                    key={idx}
                    cx={1 + pulse.x}
                    cy={1 + pulse.y}
                    r={spotSize / 2}
                    fill={`hsl(${(pulse.line / scanLines) * 360}, 70%, 50%)`}
                    opacity={0.3}
                    stroke={`hsl(${(pulse.line / scanLines) * 360}, 70%, 60%)`}
                    strokeWidth={0.02}
                  />
                ))}
                {/* Center dots */}
                {pulses.map((pulse, idx) => (
                  <circle
                    key={`dot-${idx}`}
                    cx={1 + pulse.x}
                    cy={1 + pulse.y}
                    r={0.05}
                    fill="white"
                  />
                ))}
                {/* Scan direction arrows */}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="10"
                    refX="5"
                    refY="5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 5, 0 10" fill="#3B82F6" />
                  </marker>
                </defs>
                {Array.from({ length: scanLines }, (_, i) => (
                  <line
                    key={`arrow-${i}`}
                    x1={0.5}
                    y1={1 + i * lineSpacing}
                    x2={11.5}
                    y2={1 + i * lineSpacing}
                    stroke="#3B82F6"
                    strokeWidth={0.03}
                    opacity={0.5}
                    markerEnd="url(#arrowhead)"
                  />
                ))}
              </>
            )}

            {viewMode === 'heatmap' && (
              <>
                {/* Coverage heatmap */}
                {coverageMap.map((row, y) =>
                  row.map((value, x) => {
                    const cellSize = 10 / coverageMap.length;
                    const normalized = value / maxCoverage;
                    const hue = 120 - normalized * 120; // Green to Red
                    return (
                      <rect
                        key={`${x}-${y}`}
                        x={1 + x * cellSize}
                        y={1 + y * cellSize}
                        width={cellSize}
                        height={cellSize}
                        fill={`hsl(${hue}, 80%, ${40 + normalized * 30}%)`}
                        opacity={0.8}
                      />
                    );
                  })
                )}
              </>
            )}

            {viewMode === 'crossSection' && (
              <>
                {/* Cross-section view showing intensity profile */}
                <rect x={1} y={1} width={10} height={10} fill="#000" />
                
                {/* Draw intensity profile for center line */}
                <polyline
                  points={Array.from({ length: 100 }, (_, i) => {
                    const x = (i / 100) * 10;
                    let intensity = 0;
                    
                    // Calculate intensity at this x position
                    pulses.filter(p => Math.abs(p.y - 5) < spotSize / 2).forEach((pulse) => {
                      const distance = Math.abs(x - pulse.x);
                      if (distance < spotSize / 2) {
                        intensity += Math.exp(-Math.pow(distance / (spotSize / 4), 2));
                      }
                    });
                    
                    const y = 10 - (intensity / 3) * 9; // Scale to fit
                    return `${1 + x},${1 + y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth={0.05}
                />
                
                {/* Ideal uniform line */}
                <line
                  x1={1}
                  y1={6}
                  x2={11}
                  y2={6}
                  stroke="#10B981"
                  strokeWidth={0.03}
                  strokeDasharray="0.2,0.1"
                />
              </>
            )}

            {/* Scale */}
            <text x={11.2} y={1.5} fill="#9CA3AF" fontSize="0.3">
              0mm
            </text>
            <text x={11.2} y={6} fill="#9CA3AF" fontSize="0.3">
              5mm
            </text>
            <text x={11.2} y={10.5} fill="#9CA3AF" fontSize="0.3">
              10mm
            </text>
          </svg>

          {/* Zoom Control */}
          <div className="mt-4">
            <label className="text-xs text-gray-400 block mb-2">Zoom: {zoom.toFixed(1)}×</label>
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer 
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
            />
          </div>
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          {/* Calculated Parameters */}
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-semibold text-white mb-3">📏 Calculated Geometry</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Pulse Spacing:</span>
                <span className="font-semibold text-white">{pulseSpacing.toFixed(2)} mm</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Calculated Overlap:</span>
                <span className={`font-semibold ${
                  overlapMatch ? 'text-green-400' : 'text-orange-400'
                }`}>
                  {calculatedOverlap.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Target Overlap:</span>
                <span className="font-semibold text-white">{overlapRatio}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Line Spacing:</span>
                <span className="font-semibold text-white">{lineSpacing.toFixed(2)} mm</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Pulses/Line:</span>
                <span className="font-semibold text-white">{pulsesPerLine}</span>
              </div>
            </div>
          </div>

          {/* Coverage Statistics (for heatmap view) */}
          {viewMode === 'heatmap' && (
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <h4 className="text-sm font-semibold text-white mb-3">📊 Coverage Analysis</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Avg Coverage:</span>
                  <span className="font-semibold text-white">{avgCoverage.toFixed(2)}×</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Min Coverage:</span>
                  <span className="font-semibold text-white">{minCoverage.toFixed(2)}×</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Max Coverage:</span>
                  <span className="font-semibold text-white">{maxCoverage.toFixed(2)}×</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Uniformity:</span>
                  <span className={`font-semibold ${
                    uniformity > 90 ? 'text-green-400' :
                    uniformity > 80 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {uniformity.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Pattern Quality Assessment */}
          <div className={`rounded-lg p-4 border ${
            overlapMatch && (viewMode !== 'heatmap' || uniformity > 90)
              ? 'bg-green-900/20 border-green-500/50'
              : 'bg-orange-900/20 border-orange-500/50'
          }`}>
            <div className="flex items-start gap-2">
              <span className="text-xl">
                {overlapMatch && (viewMode !== 'heatmap' || uniformity > 90) ? '✅' : '⚠️'}
              </span>
              <div className="text-xs">
                <div className={`font-semibold mb-1 ${
                  overlapMatch && (viewMode !== 'heatmap' || uniformity > 90)
                    ? 'text-green-400'
                    : 'text-orange-400'
                }`}>
                  {overlapMatch && (viewMode !== 'heatmap' || uniformity > 90)
                    ? 'Optimal Pattern'
                    : 'Pattern Issues Detected'}
                </div>
                <div className="text-gray-300">
                  {!overlapMatch && (
                    <div className="mb-1">
                      Calculated overlap ({calculatedOverlap.toFixed(1)}%) differs from target ({overlapRatio}%). 
                      Adjust scan speed or rep rate.
                    </div>
                  )}
                  {viewMode === 'heatmap' && uniformity < 90 && (
                    <div>
                      Coverage uniformity below 90%. Increase overlap ratio to eliminate gaps.
                    </div>
                  )}
                  {overlapMatch && (viewMode !== 'heatmap' || uniformity > 90) && (
                    <div>
                      Scan pattern achieves uniform coverage with {calculatedOverlap.toFixed(0)}% overlap. 
                      {viewMode === 'heatmap' && ` Uniformity: ${uniformity.toFixed(0)}%`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Input Parameters */}
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/50">
            <h4 className="text-sm font-semibold text-blue-300 mb-3">⚙️ Input Parameters</h4>
            <div className="space-y-2 text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Spot Size:</span>
                <span className="font-semibold text-white">{spotSize} mm</span>
              </div>
              <div className="flex justify-between">
                <span>Scan Speed:</span>
                <span className="font-semibold text-white">{scanSpeed} mm/s</span>
              </div>
              <div className="flex justify-between">
                <span>Rep Rate:</span>
                <span className="font-semibold text-white">{(repRate / 1000).toFixed(0)} kHz</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-semibold text-white mb-3">🎨 View Modes</h4>
            <div className="space-y-2 text-xs text-gray-300">
              <div><span className="font-semibold">Spot Positions:</span> See actual laser pulse locations</div>
              <div><span className="font-semibold">Coverage Map:</span> Heat map of energy deposition</div>
              <div><span className="font-semibold">Cross Section:</span> Intensity profile along scan line</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
