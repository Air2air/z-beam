// app/components/ParameterSliderLab/ParameterSliderLab.tsx
'use client';

import React, { useState, useMemo } from 'react';

interface Parameter {
  id: string;
  name: string;
  value: number;
  min: number;
  max: number;
  optimal_min: number;
  optimal_max: number;
  unit: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
}

interface ParameterSliderLabProps {
  parameters: Parameter[];
}

/**
 * Interactive parameter adjustment with real-time risk calculation
 * Users can drag sliders to see how changing parameters affects safety
 */
export const ParameterSliderLab: React.FC<ParameterSliderLabProps> = ({ parameters }) => {
  const [adjustedParams, setAdjustedParams] = useState<Record<string, number>>(
    parameters.reduce((acc, p) => ({ ...acc, [p.id]: p.value }), {})
  );
  const [activeParam, setActiveParam] = useState<string | null>(null);

  // Calculate overall risk score (0-100, lower is better)
  const calculateRiskScore = (params: Record<string, number>): number => {
    let totalRisk = 0;
    let criticalityWeight = 0;

    parameters.forEach((param) => {
      const value = params[param.id];
      const range = param.max - param.min;
      const optimalRange = param.optimal_max - param.optimal_min;
      
      // Calculate distance from optimal range (normalized 0-1)
      let distanceFromOptimal = 0;
      if (value < param.optimal_min) {
        distanceFromOptimal = (param.optimal_min - value) / range;
      } else if (value > param.optimal_max) {
        distanceFromOptimal = (value - param.optimal_max) / range;
      }
      
      // Weight by criticality
      const weight = 
        param.criticality === 'critical' ? 4 :
        param.criticality === 'high' ? 3 :
        param.criticality === 'medium' ? 2 : 1;
      
      totalRisk += distanceFromOptimal * weight * 100;
      criticalityWeight += weight;
    });

    return Math.min(100, totalRisk / criticalityWeight);
  };

  // Calculate parameter interactions
  const calculateInteractions = (params: Record<string, number>) => {
    const power = params['powerRange'] || 100;
    const pulseWidth = params['pulseWidth'] || 10;
    const scanSpeed = params['scanSpeed'] || 1000;
    const repRate = params['repetitionRate'] || 30000;
    const overlapRatio = params['overlapRatio'] || 60;

    // Peak power density (simplified)
    const peakPowerDensity = (power / pulseWidth) * 1000; // kW/ns approximation

    // Pulse spacing
    const pulseSpacing = scanSpeed / (repRate / 1000); // μm

    // Effective fluence with overlap
    const effectiveFluence = (power / 100) * (overlapRatio / 50); // Simplified J/cm²

    // Thermal accumulation risk
    const thermalRisk = (power * repRate) / (scanSpeed * 1000); // Simplified metric

    return {
      peakPowerDensity: peakPowerDensity.toFixed(1),
      pulseSpacing: pulseSpacing.toFixed(0),
      effectiveFluence: effectiveFluence.toFixed(2),
      thermalRisk: thermalRisk.toFixed(3),
    };
  };

  const riskScore = useMemo(() => calculateRiskScore(adjustedParams), [adjustedParams]);
  const interactions = useMemo(() => calculateInteractions(adjustedParams), [adjustedParams]);

  const getRiskLevel = (score: number): { label: string; color: string; emoji: string } => {
    if (score < 15) return { label: 'SAFE', color: 'text-green-400', emoji: '✅' };
    if (score < 35) return { label: 'CAUTION', color: 'text-yellow-400', emoji: '⚠️' };
    if (score < 60) return { label: 'HIGH RISK', color: 'text-orange-400', emoji: '🔶' };
    return { label: 'DANGER', color: 'text-red-400', emoji: '🚨' };
  };

  const handleSliderChange = (paramId: string, value: number) => {
    setAdjustedParams(prev => ({ ...prev, [paramId]: value }));
  };

  const handleReset = () => {
    setAdjustedParams(parameters.reduce((acc, p) => ({ ...acc, [p.id]: p.value }), {}));
    setActiveParam(null);
  };

  const riskLevel = getRiskLevel(riskScore);

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">
            Interactive Parameter Lab
          </h3>
          <p className="text-sm text-gray-400">
            Adjust sliders to see real-time risk calculations and parameter interactions
          </p>
        </div>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          🔄 Reset All
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr,400px] gap-6">
        {/* Sliders Section */}
        <div className="space-y-4">
          {parameters.map((param) => {
            const currentValue = adjustedParams[param.id];
            const percentPosition = ((currentValue - param.min) / (param.max - param.min)) * 100;
            const optimalStartPercent = ((param.optimal_min - param.min) / (param.max - param.min)) * 100;
            const optimalEndPercent = ((param.optimal_max - param.min) / (param.max - param.min)) * 100;
            
            const isInOptimal = currentValue >= param.optimal_min && currentValue <= param.optimal_max;
            const hasChanged = currentValue !== param.value;

            return (
              <div
                key={param.id}
                className={`bg-gray-900/50 rounded-lg p-4 border transition-all ${
                  activeParam === param.id
                    ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                    : hasChanged
                    ? 'border-yellow-500/50'
                    : 'border-gray-700'
                }`}
                onMouseEnter={() => setActiveParam(param.id)}
                onMouseLeave={() => setActiveParam(null)}
              >
                {/* Parameter Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white">{param.name}</h4>
                    {hasChanged && (
                      <span className="text-xs px-2 py-0.5 bg-yellow-900/30 text-yellow-400 rounded border border-yellow-500/50">
                        Modified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${isInOptimal ? 'text-green-400' : 'text-red-400'}`}>
                      {currentValue.toFixed(param.unit === 'W' || param.unit === 'mm/s' ? 0 : 1)} {param.unit}
                    </span>
                  </div>
                </div>

                {/* Slider Track with Optimal Zone */}
                <div className="relative h-8 mb-2">
                  {/* Background track */}
                  <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-gray-800 rounded-full">
                    {/* Danger zones (red) */}
                    <div
                      className="absolute h-full bg-red-500/30 rounded-l-full"
                      style={{ width: `${optimalStartPercent}%` }}
                    />
                    <div
                      className="absolute h-full bg-red-500/30 rounded-r-full right-0"
                      style={{ width: `${100 - optimalEndPercent}%` }}
                    />
                    {/* Optimal zone (green) */}
                    <div
                      className="absolute h-full bg-green-500/50"
                      style={{
                        left: `${optimalStartPercent}%`,
                        width: `${optimalEndPercent - optimalStartPercent}%`,
                      }}
                    />
                  </div>

                  {/* Slider Input */}
                  <input
                    type="range"
                    min={param.min}
                    max={param.max}
                    step={(param.max - param.min) / 100}
                    value={currentValue}
                    onChange={(e) => handleSliderChange(param.id, parseFloat(e.target.value))}
                    className="absolute top-1/2 -translate-y-1/2 w-full h-8 appearance-none bg-transparent cursor-pointer z-10 
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 
                      [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white 
                      [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-grab 
                      [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform
                      [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full 
                      [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white 
                      [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-grab"
                  />
                </div>

                {/* Range Labels */}
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{param.min} {param.unit}</span>
                  <span className="text-green-400">
                    Optimal: {param.optimal_min}-{param.optimal_max}
                  </span>
                  <span>{param.max} {param.unit}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          {/* Overall Risk Score */}
          <div className={`bg-gradient-to-br from-gray-900 to-gray-950 rounded-lg p-6 border-2 ${
            riskScore < 15 ? 'border-green-500' :
            riskScore < 35 ? 'border-yellow-500' :
            riskScore < 60 ? 'border-orange-500' : 'border-red-500'
          }`}>
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{riskLevel.emoji}</div>
              <div className={`text-2xl font-bold mb-1 ${riskLevel.color}`}>
                {riskLevel.label}
              </div>
              <div className="text-sm text-gray-400">Overall Risk Assessment</div>
            </div>

            {/* Risk Score Bar */}
            <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden mb-2">
              <div
                className={`absolute h-full transition-all duration-300 ${
                  riskScore < 15 ? 'bg-green-500' :
                  riskScore < 35 ? 'bg-yellow-500' :
                  riskScore < 60 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${riskScore}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                {riskScore.toFixed(0)}% Risk
              </div>
            </div>

            <div className="text-xs text-gray-400 text-center">
              0% = Perfect • 100% = Maximum Danger
            </div>
          </div>

          {/* Calculated Interactions */}
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-semibold text-white mb-3">
              📊 Calculated Interactions
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                <span className="text-gray-400">Peak Power Density:</span>
                <span className="font-semibold text-white">{interactions.peakPowerDensity} kW/ns</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                <span className="text-gray-400">Pulse Spacing:</span>
                <span className="font-semibold text-white">{interactions.pulseSpacing} μm</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                <span className="text-gray-400">Effective Fluence:</span>
                <span className="font-semibold text-white">{interactions.effectiveFluence} J/cm²</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                <span className="text-gray-400">Thermal Accumulation:</span>
                <span className={`font-semibold ${
                  parseFloat(interactions.thermalRisk) < 0.1 ? 'text-green-400' :
                  parseFloat(interactions.thermalRisk) < 0.2 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {interactions.thermalRisk}
                </span>
              </div>
            </div>
          </div>

          {/* Warning Messages */}
          {riskScore >= 35 && (
            <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <span className="text-xl">⚠️</span>
                <div className="text-sm">
                  <div className="font-semibold text-orange-400 mb-1">High Risk Configuration</div>
                  <div className="text-gray-300 text-xs">
                    {riskScore >= 60
                      ? 'Current settings are likely to cause substrate damage. Return parameters to optimal ranges immediately.'
                      : 'Settings outside optimal ranges. Monitor for warning signs: discoloration, surface roughness changes, or thermal effects.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
            <div className="text-xs text-blue-300">
              <span className="font-semibold">💡 How it works:</span> Risk score combines distance from optimal ranges weighted by parameter criticality. Calculated interactions show physics-based relationships between parameters.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
