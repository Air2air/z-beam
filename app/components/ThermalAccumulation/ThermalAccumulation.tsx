// app/components/ThermalAccumulation/ThermalAccumulation.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { SectionContainer } from '@/app/components/SectionContainer/SectionContainer';
import { SectionTitle } from '@/app/components/SectionTitle/SectionTitle';
import { getSectionIcon } from '@/app/config/sectionIcons';

interface ThermalAccumulationProps {
  materialName?: string;
  power: number; // W
  repRate: number; // Hz
  scanSpeed: number; // mm/s
  passCount: number;
  thermalDiffusivity?: number; // mm²/s (aluminum = 97)
  heroImage?: string;
  materialLink?: string;
}

/**
 * Simulates thermal accumulation across multiple laser passes
 * Shows temperature buildup and cooling between passes
 */
export const ThermalAccumulation: React.FC<ThermalAccumulationProps> = ({
  materialName,
  power,
  repRate,
  scanSpeed,
  passCount,
  thermalDiffusivity = 97, // Aluminum default
  heroImage,
  materialLink,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentPass, setCurrentPass] = useState(0);
  const [speed, setSpeed] = useState(1); // Animation speed multiplier
  const [ripples, setRipples] = useState<Array<{ id: number; threshold: 'safe' | 'damage'; time: number }>>([]);
  const [lastThresholdState, setLastThresholdState] = useState<'safe' | 'warning' | 'danger'>('safe');
  
  // Editable process parameters
  const [editablePower, setEditablePower] = useState(power);
  const [editableRepRate, setEditableRepRate] = useState(repRate);
  const [editableScanSpeed, setEditableScanSpeed] = useState(scanSpeed);
  const [editablePassCount, setEditablePassCount] = useState(passCount);
  const [editableCoolingTime, setEditableCoolingTime] = useState(30);

  // Calculate thermal parameters using editable values
  const pulseEnergy = (editablePower / editableRepRate) * 1000; // mJ
  const pulseSpacing = editableScanSpeed / (editableRepRate / 1000); // μm
  const passTime = 100 / editableScanSpeed; // seconds for 100mm scan
  const totalSimTime = (passTime + editableCoolingTime) * editablePassCount;

  // Simplified temperature calculation
  const calculateTemperature = (time: number): number => {
    const pass = Math.floor(time / (passTime + editableCoolingTime));
    const timeInPass = time % (passTime + editableCoolingTime);
    
    let temp = 20; // Ambient temperature (°C)
    
    // Add temperature from each previous pass (with residual heat)
    for (let i = 0; i <= pass; i++) {
      const timeSincePass = time - (i * (passTime + editableCoolingTime));
      
      if (timeSincePass >= 0) {
        if (i === pass && timeInPass < passTime) {
          // Currently heating during this pass
          const heatingProgress = timeInPass / passTime;
          const peakTemp = 50 + (editablePower / 2) * (i + 1) * 0.3; // Accumulates with each pass
          temp += peakTemp * heatingProgress;
        } else {
          // Cooling phase
          const coolingProgress = (timeSincePass - passTime) / editableCoolingTime;
          const peakTemp = 50 + (editablePower / 2) * (i + 1) * 0.3;
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
    setCurrentPass(Math.floor(currentTime / (passTime + editableCoolingTime)));
  }, [currentTime, passTime, editableCoolingTime]);

  // Detect threshold crossings and create ripple effects
  useEffect(() => {
    const newState = 
      currentTemp >= damageTemp ? 'danger' :
      currentTemp >= maxSafeTemp ? 'warning' : 'safe';
    
    // Only trigger on actual state changes
    if (lastThresholdState === newState) return;
    
    // Crossing into danger zone
    if (lastThresholdState !== 'danger' && newState === 'danger') {
      setRipples(prev => [...prev, { id: Date.now(), threshold: 'damage', time: Date.now() }]);
    }
    // Crossing into warning zone
    else if (lastThresholdState === 'safe' && newState === 'warning') {
      setRipples(prev => [...prev, { id: Date.now(), threshold: 'safe', time: Date.now() }]);
    }
    
    setLastThresholdState(newState);
  }, [currentTemp, damageTemp, maxSafeTemp, lastThresholdState]);

  // Clean up old ripples periodically
  useEffect(() => {
    if (ripples.length === 0) return;
    
    const cleanup = setInterval(() => {
      setRipples(prev => prev.filter(r => Date.now() - r.time < 2000));
    }, 500);
    
    return () => clearInterval(cleanup);
  }, [ripples.length]);

  const handleReset = () => {
    setCurrentTime(0);
    setCurrentPass(0);
    setIsPlaying(false);
    setRipples([]);
    setLastThresholdState('safe');
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

  const title = materialName ? `${materialName} Thermal Accumulation` : "Thermal Accumulation Simulator";
  
  return (
    <SectionContainer
      bgColor="transparent"
      className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg mb-8"
      horizPadding={true}
    >
      <SectionTitle
        title={title}
        icon={getSectionIcon('technical')}
        description="See if your multi-pass cleaning will overheat and damage the material"
        thumbnail={heroImage}
        thumbnailLink={materialLink}
      />

      <div className="grid lg:grid-cols-[1fr,350px] gap-6">
        {/* Temperature Graph */}
        <div className="bg-tertiary rounded-lg p-6 border">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm text-secondary font-semibold">Temperature vs. Time</h4>
            <div className="flex gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-tertiary">Safe (&lt;{maxSafeTemp}°C)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-tertiary">Damage (&gt;{damageTemp}°C)</span>
              </div>
            </div>
          </div>

          {/* SVG Graph - Increased height */}
          <svg viewBox="0 0 600 600" className="w-full h-auto bg-gray-950 rounded">
            {/* Grid lines */}
            {[0, 100, 200, 300].map((temp) => (
              <g key={temp}>
                <line
                  x1={50}
                  y1={550 - (temp / 400) * 500}
                  x2={580}
                  y2={550 - (temp / 400) * 500}
                  stroke="#374151"
                  strokeWidth={1}
                  strokeDasharray="4,4"
                />
                <text
                  x={40}
                  y={550 - (temp / 400) * 500 + 5}
                  textAnchor="end"
                  fill="#9CA3AF"
                  fontSize="10"
                >
                  {temp}°C
                </text>
              </g>
            ))}

            {/* Safe temperature threshold - Animated */}
            <line
              x1={50}
              y1={550 - (maxSafeTemp / 400) * 500}
              x2={580}
              y2={550 - (maxSafeTemp / 400) * 500}
              stroke="#10B981"
              strokeWidth={2}
              strokeDasharray="8,4"
              opacity={0.8}
              className="animate-pulse"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="12"
                dur="2s"
                repeatCount="indefinite"
              />
            </line>
            <text
              x={585}
              y={550 - (maxSafeTemp / 400) * 500 + 4}
              fill="#10B981"
              fontSize="11"
              fontWeight="bold"
              className="animate-pulse"
            >
              ✓ Safe
            </text>
            
            {/* Ripple effects on safe threshold */}
            {ripples.filter(r => r.threshold === 'safe').map(ripple => {
              const age = (Date.now() - ripple.time) / 2000; // 0 to 1
              const currentX = 50 + (currentTime / totalSimTime) * 530;
              return (
                <g key={ripple.id}>
                  <circle
                    cx={currentX}
                    cy={550 - (maxSafeTemp / 400) * 500}
                    r={age * 50}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth={3 * (1 - age)}
                    opacity={1 - age}
                  />
                  <circle
                    cx={currentX}
                    cy={550 - (maxSafeTemp / 400) * 500}
                    r={age * 30}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth={2 * (1 - age)}
                    opacity={0.5 * (1 - age)}
                  />
                </g>
              );
            })}

            {/* Damage temperature threshold - Animated */}
            <line
              x1={50}
              y1={550 - (damageTemp / 400) * 500}
              x2={580}
              y2={550 - (damageTemp / 400) * 500}
              stroke="#EF4444"
              strokeWidth={3}
              strokeDasharray="8,4"
              opacity={0.9}
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="12"
                dur="1s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.7;1;0.7"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </line>
            <text
              x={585}
              y={550 - (damageTemp / 400) * 500 + 4}
              fill="#EF4444"
              fontSize="11"
              fontWeight="bold"
            >
              <animate
                attributeName="opacity"
                values="0.7;1;0.7"
                dur="1s"
                repeatCount="indefinite"
              />
              🚨 Damage
            </text>
            
            {/* Ripple effects on damage threshold */}
            {ripples.filter(r => r.threshold === 'damage').map(ripple => {
              const age = (Date.now() - ripple.time) / 2000; // 0 to 1
              const currentX = 50 + (currentTime / totalSimTime) * 530;
              return (
                <g key={ripple.id}>
                  {/* Outer ripple */}
                  <circle
                    cx={currentX}
                    cy={550 - (damageTemp / 400) * 500}
                    r={age * 70}
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth={4 * (1 - age)}
                    opacity={0.8 * (1 - age)}
                  />
                  {/* Middle ripple */}
                  <circle
                    cx={currentX}
                    cy={550 - (damageTemp / 400) * 500}
                    r={age * 50}
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth={3 * (1 - age)}
                    opacity={0.6 * (1 - age)}
                  />
                  {/* Inner ripple */}
                  <circle
                    cx={currentX}
                    cy={550 - (damageTemp / 400) * 500}
                    r={age * 30}
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth={2 * (1 - age)}
                    opacity={1 - age}
                  />
                  {/* Flash effect */}
                  <circle
                    cx={currentX}
                    cy={550 - (damageTemp / 400) * 500}
                    r={10}
                    fill="#EF4444"
                    opacity={Math.max(0, (1 - age * 3))}
                  />
                </g>
              );
            })}

            {/* Pass dividers */}
            {Array.from({ length: editablePassCount + 1 }, (_, i) => (
              <line
                key={i}
                x1={50 + (i / editablePassCount) * 530}
                y1={30}
                x2={50 + (i / editablePassCount) * 530}
                y2={550}
                stroke="#6B7280"
                strokeWidth={1}
                opacity={0.5}
              />
            ))}

            {/* SVG Definitions */}
            <defs>
              {/* Dynamic color gradient based on temperature zones */}
              <linearGradient id="tempGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8">
                  <animate attributeName="stopOpacity" values="0.5;0.8;0.5" dur="2s" repeatCount="indefinite" />
                </stop>
                <stop offset="50%" stopColor={currentTemp > maxSafeTemp ? '#F59E0B' : '#3B82F6'} stopOpacity="0.9">
                  <animate attributeName="stopOpacity" values="0.7;0.9;0.7" dur="2s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%" stopColor={currentTemp > damageTemp ? '#EF4444' : currentTemp > maxSafeTemp ? '#F59E0B' : '#3B82F6'} stopOpacity="1">
                  <animate attributeName="stopOpacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
                </stop>
              </linearGradient>
            </defs>

            {/* DANGER ZONE - Animated fill between thresholds */}
            <rect
              x={50}
              y={550 - (damageTemp / 400) * 500}
              width={530}
              height={(damageTemp - maxSafeTemp) / 400 * 500}
              fill="#F59E0B"
              opacity={currentTemp > maxSafeTemp && currentTemp < damageTemp ? 0.15 : 0.08}
            >
              <animate
                attributeName="opacity"
                values={currentTemp > maxSafeTemp && currentTemp < damageTemp ? "0.1;0.2;0.1" : "0.05;0.08;0.05"}
                dur="2s"
                repeatCount="indefinite"
              />
            </rect>
            
            {/* CRITICAL ZONE - Above damage threshold */}
            <rect
              x={50}
              y={30}
              width={530}
              height={550 - (damageTemp / 400) * 500 - 30}
              fill="#EF4444"
              opacity={currentTemp > damageTemp ? 0.2 : 0.05}
            >
              <animate
                attributeName="opacity"
                values={currentTemp > damageTemp ? "0.15;0.25;0.15" : "0.03;0.05;0.03"}
                dur="1s"
                repeatCount="indefinite"
              />
            </rect>

            {/* Temperature curve with dynamic color */}
            <polyline
              points={tempHistory
                .map((point) => {
                  const x = 50 + (point.time / totalSimTime) * 530;
                  const y = 550 - (point.temp / 400) * 500;
                  return `${x},${y}`;
                })
                .join(' ')}
              fill="none"
              stroke="url(#tempGradient)"
              strokeWidth={3}
            />
            
            {/* Multi-layer temperature curve for depth */}
            <polyline
              points={tempHistory
                .map((point) => {
                  const x = 50 + (point.time / totalSimTime) * 530;
                  const y = 550 - (point.temp / 400) * 500;
                  return `${x},${y}`;
                })
                .join(' ')}
              fill="none"
              stroke={currentTemp > damageTemp ? '#EF4444' : currentTemp > maxSafeTemp ? '#F59E0B' : '#3B82F6'}
              strokeWidth={1}
              opacity={0.4}
            />

            {/* Current position marker - Enhanced with glow */}
            <g>
              {/* Outer glow ring */}
              <circle
                cx={50 + (currentTime / totalSimTime) * 530}
                cy={550 - (currentTemp / 400) * 500}
                r={12}
                fill={tempColor}
                opacity={0.2}
              >
                <animate
                  attributeName="r"
                  values="8;15;8"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.3;0.1;0.3"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
              {/* Main marker */}
              <circle
                cx={50 + (currentTime / totalSimTime) * 530}
                cy={550 - (currentTemp / 400) * 500}
                r={6}
                fill={tempColor}
                stroke="white"
                strokeWidth={2}
              >
                <animate
                  attributeName="r"
                  values="6;7;6"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
              {/* Temperature label */}
              <text
                x={50 + (currentTime / totalSimTime) * 530}
                y={550 - (currentTemp / 400) * 500 - 15}
                textAnchor="middle"
                fill={tempColor}
                fontSize="14"
                fontWeight="bold"
              >
                {Math.round(currentTemp)}°C
              </text>
            </g>

            {/* Pass labels - Enhanced current pass */}
            {Array.from({ length: editablePassCount }, (_, i) => {
              const isCurrent = currentPass === i;
              const x = 50 + ((i + 0.5) / editablePassCount) * 530;
              return (
                <g key={i}>
                  {isCurrent && (
                    <>
                      {/* Highlight background for current pass */}
                      <rect
                        x={x - 30}
                        y={560}
                        width={60}
                        height={20}
                        fill="#3B82F6"
                        opacity={0.2}
                        rx={4}
                      >
                        <animate
                          attributeName="opacity"
                          values="0.1;0.3;0.1"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </rect>
                      {/* Glow effect under current pass */}
                      <circle
                        cx={x}
                        cy={570}
                        r={20}
                        fill="#3B82F6"
                        opacity={0.1}
                      >
                        <animate
                          attributeName="r"
                          values="15;25;15"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </>
                  )}
                  <text
                    x={x}
                    y={575}
                    textAnchor="middle"
                    fill={isCurrent ? '#3B82F6' : '#9CA3AF'}
                    fontSize={isCurrent ? 14 : 12}
                    fontWeight={isCurrent ? 'bold' : 'normal'}
                  >
                    Pass {i + 1}
                  </text>
                </g>
              );
            })}

            {/* Axes */}
            <line x1={50} y1={550} x2={580} y2={550} stroke="#9CA3AF" strokeWidth={2} />
            <line x1={50} y1={30} x2={50} y2={550} stroke="#9CA3AF" strokeWidth={2} />
          </svg>
        </div>

        {/* Controls & Info Panel */}
        <div className="space-y-4">
          {/* Process Parameters - MOVED TO TOP */}
          <div className="bg-tertiary rounded-lg p-4 border">
            <h4 className="text-sm text-secondary font-semibold mb-3">⚙️ Process Parameters</h4>
            <div className="space-y-3">
              {/* Power */}
              <div>
                <label className="text-xs text-tertiary block mb-1">
                  Power: <span className="text-primary font-semibold">{editablePower}W</span>
                </label>
                <input
                  type="range"
                  min={50}
                  max={500}
                  step={10}
                  value={editablePower}
                  onChange={(e) => {
                    setEditablePower(parseInt(e.target.value));
                    setCurrentTime(0);
                    setCurrentPass(0);
                    setIsPlaying(false);
                  }}
                  className="w-full h-2 bg-primary rounded-lg appearance-none cursor-pointer 
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                />
              </div>

              {/* Rep Rate */}
              <div>
                <label className="text-xs text-tertiary block mb-1">
                  Rep Rate: <span className="text-primary font-semibold">{(editableRepRate / 1000).toFixed(0)} kHz</span>
                </label>
                <input
                  type="range"
                  min={10000}
                  max={100000}
                  step={5000}
                  value={editableRepRate}
                  onChange={(e) => {
                    setEditableRepRate(parseInt(e.target.value));
                    setCurrentTime(0);
                    setCurrentPass(0);
                    setIsPlaying(false);
                  }}
                  className="w-full h-2 bg-primary rounded-lg appearance-none cursor-pointer 
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                />
              </div>

              {/* Scan Speed */}
              <div>
                <label className="text-xs text-tertiary block mb-1">
                  Scan Speed: <span className="text-primary font-semibold">{editableScanSpeed} mm/s</span>
                </label>
                <input
                  type="range"
                  min={100}
                  max={5000}
                  step={100}
                  value={editableScanSpeed}
                  onChange={(e) => {
                    setEditableScanSpeed(parseInt(e.target.value));
                    setCurrentTime(0);
                    setCurrentPass(0);
                    setIsPlaying(false);
                  }}
                  className="w-full h-2 bg-primary rounded-lg appearance-none cursor-pointer 
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                />
              </div>

              {/* Pass Count */}
              <div>
                <label className="text-xs text-tertiary block mb-1">
                  Pass Count: <span className="text-primary font-semibold">{editablePassCount}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={editablePassCount}
                  onChange={(e) => {
                    setEditablePassCount(parseInt(e.target.value));
                    setCurrentTime(0);
                    setCurrentPass(0);
                    setIsPlaying(false);
                  }}
                  className="w-full h-2 bg-primary rounded-lg appearance-none cursor-pointer 
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                />
              </div>

              {/* Cooling Time */}
              <div>
                <label className="text-xs text-tertiary block mb-1">
                  Cooling Time: <span className="text-primary font-semibold">{editableCoolingTime}s</span>
                </label>
                <input
                  type="range"
                  min={5}
                  max={120}
                  step={5}
                  value={editableCoolingTime}
                  onChange={(e) => {
                    setEditableCoolingTime(parseInt(e.target.value));
                    setCurrentTime(0);
                    setCurrentPass(0);
                    setIsPlaying(false);
                  }}
                  className="w-full h-2 bg-primary rounded-lg appearance-none cursor-pointer 
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                />
              </div>

              {/* Calculated values */}
              <div className="pt-2 border-t space-y-1 text-xs">
                <div className="flex justify-between text-tertiary">
                  <span>Pulse Energy:</span>
                  <span className="text-primary">{pulseEnergy.toFixed(2)} mJ</span>
                </div>
                <div className="flex justify-between text-tertiary">
                  <span>Total Sim Time:</span>
                  <span className="text-primary">{totalSimTime.toFixed(1)}s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Temperature Display */}
          <div
            className={`bg-gradient-to-br from-gray-900 to-gray-950 rounded-lg p-6 border-2 transition-all duration-300 ${
              currentTemp > damageTemp ? 'animate-pulse shadow-2xl shadow-red-500/50' : 
              currentTemp > maxSafeTemp ? 'shadow-xl shadow-yellow-500/30' : 
              'shadow-lg shadow-blue-500/20'
            }`}
            style={{ borderColor: tempColor }}
          >
            <div className="text-center">
              <div 
                className={`text-6xl font-bold mb-2 transition-all duration-300 ${
                  currentTemp > damageTemp ? 'animate-bounce' : ''
                }`}
                style={{ 
                  color: tempColor,
                  textShadow: currentTemp > maxSafeTemp ? `0 0 20px ${tempColor}` : 'none'
                }}
              >
                {currentTemp.toFixed(0)}°C
              </div>
              <div className={`text-lg font-semibold mb-1 ${
                currentTemp > damageTemp ? 'text-red-400 animate-pulse' :
                currentTemp > maxSafeTemp ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {tempStatus}
              </div>
              <div className="text-sm text-tertiary">
                Pass {currentPass + 1} of {editablePassCount}
              </div>
              <div className="text-xs text-muted mt-2">
                Time: {currentTime.toFixed(1)}s / {totalSimTime.toFixed(1)}s
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-tertiary rounded-lg p-4 border space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-colors ${
                  isPlaying
                    ? 'bg-orange-600 hover:bg-orange-500'
                    : 'bg-green-600 hover:bg-green-500'
                }`}
              >
                {isPlaying ? '⏸️ Pause' : '▶️ Play'}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-3 bg-primary hover:bg-tertiary rounded-lg text-sm font-semibold transition-colors"
              >
                🔄 Reset
              </button>
            </div>

            {/* Speed Control */}
            <div>
              <label className="text-xs text-tertiary block mb-2">Animation Speed: {speed}×</label>
              <input
                type="range"
                min={0.5}
                max={3}
                step={0.5}
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full h-2 bg-primary rounded-lg appearance-none cursor-pointer 
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
              />
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
                  <div className="text-secondary">
                    {currentTemp > damageTemp
                      ? 'Material damage is likely. Reduce pass count or increase cooling time.'
                      : 'Approaching damage threshold. Consider adjusting parameters.'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SectionContainer>
  );
};
