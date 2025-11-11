// app/components/ThermalAccumulationSimulator/ThermalAccumulationSimulator.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface ThermalAccumulationSimulatorProps {
  power: number; // W
  repRate: number; // Hz
  scanSpeed: number; // mm/s
  passCount: number;
  thermalDiffusivity?: number; // mm²/s (aluminum = 97)
}

/**
 * Simulates thermal accumulation across multiple laser passes
 * Shows temperature buildup and cooling between passes
 */
export const ThermalAccumulationSimulator: React.FC<ThermalAccumulationSimulatorProps> = ({
  power,
  repRate,
  scanSpeed,
  passCount,
  thermalDiffusivity = 97, // Aluminum default
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentPass, setCurrentPass] = useState(0);
  const [speed, setSpeed] = useState(1); // Animation speed multiplier

  // Calculate thermal parameters
  const pulseEnergy = (power / repRate) * 1000; // mJ
  const pulseSpacing = scanSpeed / (repRate / 1000); // μm
  const passTime = 100 / scanSpeed; // seconds for 100mm scan
  const coolingTime = 30; // seconds between passes
  const totalSimTime = (passTime + coolingTime) * passCount;

  // Simplified temperature calculation
  const calculateTemperature = (time: number): number => {
    const pass = Math.floor(time / (passTime + coolingTime));
    const timeInPass = time % (passTime + coolingTime);
    
    let temp = 20; // Ambient temperature (°C)
    
    // Add temperature from each previous pass (with residual heat)
    for (let i = 0; i <= pass; i++) {
      const timeSincePass = time - (i * (passTime + coolingTime));
      
      if (timeSincePass >= 0) {
        if (i === pass && timeInPass < passTime) {
          // Currently heating during this pass
          const heatingProgress = timeInPass / passTime;
          const peakTemp = 50 + (power / 2) * (i + 1) * 0.3; // Accumulates with each pass
          temp += peakTemp * heatingProgress;
        } else {
          // Cooling phase
          const coolingProgress = (timeSincePass - passTime) / coolingTime;
          const peakTemp = 50 + (power / 2) * (i + 1) * 0.3;
          const residualHeat = peakTemp * Math.exp(-coolingProgress * 2); // Exponential decay
          temp += residualHeat;
        }
      }
    }
    
    return Math.min(temp, 400); // Cap at 400°C
  };

  const currentTemp = calculateTemperature(currentTime);
  const maxSafeTemp = 150; // °C for aluminum
  const damageTemp = 250; // °C

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const newTime = prev + (0.1 * speed);
        if (newTime >= totalSimTime) {
          setIsPlaying(false);
          return totalSimTime;
        }
        return newTime;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, speed, totalSimTime]);

  // Update current pass
  useEffect(() => {
    setCurrentPass(Math.floor(currentTime / (passTime + coolingTime)));
  }, [currentTime, passTime, coolingTime]);

  const handleReset = () => {
    setCurrentTime(0);
    setCurrentPass(0);
    setIsPlaying(false);
  };

  const tempColor =
    currentTemp < maxSafeTemp ? '#10B981' :
    currentTemp < damageTemp ? '#F59E0B' : '#EF4444';

  const tempStatus =
    currentTemp < maxSafeTemp ? '✅ Safe' :
    currentTemp < damageTemp ? '⚠️ Caution' : '🚨 Danger';

  // Generate temperature history for graph
  const graphPoints = 100;
  const timeStep = totalSimTime / graphPoints;
  const tempHistory = Array.from({ length: graphPoints + 1 }, (_, i) => ({
    time: i * timeStep,
    temp: calculateTemperature(i * timeStep),
  }));

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">
          Thermal Accumulation Simulator
        </h3>
        <p className="text-sm text-gray-400">
          Watch temperature buildup across {passCount} passes with {coolingTime}s cooling between passes
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr,350px] gap-6">
        {/* Temperature Graph */}
        <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">Temperature vs. Time</h4>
            <div className="flex gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-400">Safe (&lt;{maxSafeTemp}°C)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-gray-400">Damage (&gt;{damageTemp}°C)</span>
              </div>
            </div>
          </div>

          {/* SVG Graph */}
          <svg viewBox="0 0 600 300" className="w-full h-auto bg-gray-950 rounded">
            {/* Grid lines */}
            {[0, 100, 200, 300].map((temp) => (
              <g key={temp}>
                <line
                  x1={50}
                  y1={250 - (temp / 400) * 200}
                  x2={580}
                  y2={250 - (temp / 400) * 200}
                  stroke="#374151"
                  strokeWidth={1}
                  strokeDasharray="4,4"
                />
                <text
                  x={40}
                  y={250 - (temp / 400) * 200 + 5}
                  textAnchor="end"
                  fill="#9CA3AF"
                  fontSize="10"
                >
                  {temp}°C
                </text>
              </g>
            ))}

            {/* Safe temperature threshold */}
            <line
              x1={50}
              y1={250 - (maxSafeTemp / 400) * 200}
              x2={580}
              y2={250 - (maxSafeTemp / 400) * 200}
              stroke="#10B981"
              strokeWidth={2}
              strokeDasharray="8,4"
            />

            {/* Damage temperature threshold */}
            <line
              x1={50}
              y1={250 - (damageTemp / 400) * 200}
              x2={580}
              y2={250 - (damageTemp / 400) * 200}
              stroke="#EF4444"
              strokeWidth={2}
              strokeDasharray="8,4"
            />

            {/* Pass dividers */}
            {Array.from({ length: passCount + 1 }, (_, i) => (
              <line
                key={i}
                x1={50 + (i / passCount) * 530}
                y1={30}
                x2={50 + (i / passCount) * 530}
                y2={250}
                stroke="#6B7280"
                strokeWidth={1}
                opacity={0.5}
              />
            ))}

            {/* Temperature curve */}
            <polyline
              points={tempHistory
                .map((point) => {
                  const x = 50 + (point.time / totalSimTime) * 530;
                  const y = 250 - (point.temp / 400) * 200;
                  return `${x},${y}`;
                })
                .join(' ')}
              fill="none"
              stroke="#3B82F6"
              strokeWidth={2}
            />

            {/* Current position marker */}
            <circle
              cx={50 + (currentTime / totalSimTime) * 530}
              cy={250 - (currentTemp / 400) * 200}
              r={5}
              fill={tempColor}
              className="animate-pulse"
            />

            {/* Pass labels */}
            {Array.from({ length: passCount }, (_, i) => (
              <text
                key={i}
                x={50 + ((i + 0.5) / passCount) * 530}
                y={270}
                textAnchor="middle"
                fill={currentPass === i ? '#3B82F6' : '#9CA3AF'}
                fontSize="12"
                fontWeight={currentPass === i ? 'bold' : 'normal'}
              >
                Pass {i + 1}
              </text>
            ))}

            {/* Axes */}
            <line x1={50} y1={250} x2={580} y2={250} stroke="#9CA3AF" strokeWidth={2} />
            <line x1={50} y1={30} x2={50} y2={250} stroke="#9CA3AF" strokeWidth={2} />
          </svg>
        </div>

        {/* Controls & Info Panel */}
        <div className="space-y-4">
          {/* Current Temperature Display */}
          <div
            className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-lg p-6 border-2"
            style={{ borderColor: tempColor }}
          >
            <div className="text-center">
              <div className="text-6xl font-bold mb-2" style={{ color: tempColor }}>
                {currentTemp.toFixed(0)}°C
              </div>
              <div className="text-lg font-semibold text-white mb-1">{tempStatus}</div>
              <div className="text-sm text-gray-400">
                Pass {currentPass + 1} of {passCount}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Time: {currentTime.toFixed(1)}s / {totalSimTime.toFixed(1)}s
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-colors ${
                  isPlaying
                    ? 'bg-orange-600 hover:bg-orange-500 text-white'
                    : 'bg-green-600 hover:bg-green-500 text-white'
                }`}
              >
                {isPlaying ? '⏸️ Pause' : '▶️ Play'}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                🔄 Reset
              </button>
            </div>

            {/* Speed Control */}
            <div>
              <label className="text-xs text-gray-400 block mb-2">Animation Speed: {speed}×</label>
              <input
                type="range"
                min={0.5}
                max={3}
                step={0.5}
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer 
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
              />
            </div>
          </div>

          {/* Process Parameters */}
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-semibold text-white mb-3">Process Parameters</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Power:</span>
                <span className="text-white font-semibold">{power}W</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rep Rate:</span>
                <span className="text-white font-semibold">{(repRate / 1000).toFixed(0)} kHz</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Scan Speed:</span>
                <span className="text-white font-semibold">{scanSpeed} mm/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Pulse Energy:</span>
                <span className="text-white font-semibold">{pulseEnergy.toFixed(2)} mJ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Cooling Time:</span>
                <span className="text-white font-semibold">{coolingTime}s</span>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {currentTemp > maxSafeTemp && (
            <div className={`rounded-lg p-4 border ${
              currentTemp > damageTemp
                ? 'bg-red-900/20 border-red-500/50'
                : 'bg-orange-900/20 border-orange-500/50'
            }`}>
              <div className="flex items-start gap-2">
                <span className="text-xl">{currentTemp > damageTemp ? '🚨' : '⚠️'}</span>
                <div className="text-xs">
                  <div className={`font-semibold mb-1 ${
                    currentTemp > damageTemp ? 'text-red-400' : 'text-orange-400'
                  }`}>
                    {currentTemp > damageTemp ? 'Damage Temperature Exceeded!' : 'Above Safe Temperature'}
                  </div>
                  <div className="text-gray-300">
                    {currentTemp > damageTemp
                      ? 'Substrate damage likely occurring. Increase cooling time or reduce power/rep rate.'
                      : 'Approaching damage threshold. Monitor carefully for oxidation or surface changes.'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
