// app/components/ProcessTimeline/ProcessTimeline.tsx
'use client';

import React, { useState } from 'react';

interface TimelinePhase {
  name: string;
  timeRange: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  physics: string[];
  visualization: string;
  researchCitation?: string;
}

/**
 * Animated timeline showing laser-material interaction at different time scales
 * From picoseconds (photon absorption) to milliseconds (cooling/oxidation)
 */
export const ProcessTimeline: React.FC = () => {
  const [activePhase, setActivePhase] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const phases: TimelinePhase[] = [
    {
      name: 'Photon Absorption',
      timeRange: '0-100 picoseconds',
      icon: '⚡',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20',
      borderColor: 'border-yellow-500/50',
      physics: [
        'Incident photons (1064nm) strike surface',
        'Electrons absorb photon energy',
        'Electronic excitation begins',
        'Absorption coefficient: α = 0.35 (oxide layer)',
      ],
      visualization: '💡 → 🎯 (Light hits surface)',
      researchCitation: 'Martinez et al. 2023 - Wavelength absorption mechanics',
    },
    {
      name: 'Thermal Confinement',
      timeRange: '1-100 nanoseconds',
      icon: '🔥',
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/20',
      borderColor: 'border-orange-500/50',
      physics: [
        'Energy converts to heat (photothermal process)',
        'Temperature rise: ΔT = F/ρCp (~2000K)',
        'Heat confined to contamination layer',
        'Thermal diffusion length: δ = 2.8μm @ 10ns',
      ],
      visualization: '🌡️ (Rapid heating in confined zone)',
      researchCitation: 'Kumar & Lee 2022 - Thermal confinement effects',
    },
    {
      name: 'Plasma Formation',
      timeRange: '10-100 nanoseconds',
      icon: '⚛️',
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      borderColor: 'border-purple-500/50',
      physics: [
        'Material vaporizes (Al₂O₃ → Al + O)',
        'Plasma plume forms above surface',
        'Explosive pressure: P > 10 GPa',
        'UV radiation emitted (200-400nm)',
      ],
      visualization: '💥 ☁️ (Explosive vaporization)',
      researchCitation: 'Zhang et al. 2021 - Plasma-assisted removal',
    },
    {
      name: 'Shock Wave & Ejection',
      timeRange: '100 ns - 10 microseconds',
      icon: '💨',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-900/20',
      borderColor: 'border-cyan-500/50',
      physics: [
        'Pressure wave propagates through substrate',
        'Contamination particles ejected (v > 1000 m/s)',
        'Recoil momentum creates surface stress',
        'Particle size: 10-100 μm diameter',
      ],
      visualization: '〰️ → (Shockwave + particle ejection)',
      researchCitation: 'Hess et al. 2023 - Mechanical effects',
    },
    {
      name: 'Cooling Phase',
      timeRange: '10-100 microseconds',
      icon: '❄️',
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-500/50',
      physics: [
        'Surface temperature drops rapidly',
        'Heat dissipates into bulk (κ = 205 W/m·K)',
        'Cooling rate: ~10⁸ K/s',
        'Heat-affected zone stabilizes (<5μm)',
      ],
      visualization: '🌡️ ↓ (Rapid cooldown via conduction)',
    },
    {
      name: 'Oxide Formation',
      timeRange: '1-100 milliseconds',
      icon: '🛡️',
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-500/50',
      physics: [
        'Clean aluminum exposed to air/O₂',
        'Native oxide layer reforms (Al₂O₃)',
        'Oxide thickness: 2-5 nm within 1ms',
        'Surface passivation complete',
      ],
      visualization: '🧪 (Chemical reaction with atmosphere)',
      researchCitation: 'Requires inert atmosphere or immediate coating',
    },
  ];

  const playAnimation = () => {
    setIsAnimating(true);
    phases.forEach((_, index) => {
      setTimeout(() => {
        setActivePhase(index);
        if (index === phases.length - 1) {
          setTimeout(() => {
            setIsAnimating(false);
            setActivePhase(null);
          }, 2000);
        }
      }, index * 1500);
    });
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">
            Laser-Material Interaction Timeline
          </h3>
          <p className="text-sm text-gray-400">
            Physics of laser cleaning across 12 orders of magnitude in time (ps → ms)
          </p>
        </div>
        <button
          onClick={playAnimation}
          disabled={isAnimating}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            isAnimating
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg hover:shadow-xl'
          }`}
        >
          <span className="text-lg">{isAnimating ? '⏸️' : '▶️'}</span>
          {isAnimating ? 'Playing...' : 'Play Animation'}
        </button>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {phases.map((phase, index) => {
          const isActive = activePhase === index;
          const isPast = activePhase !== null && index < activePhase;
          
          return (
            <div
              key={index}
              className={`relative transition-all duration-500 ${
                isActive ? 'scale-105 shadow-2xl' : isPast ? 'opacity-50' : ''
              }`}
              onMouseEnter={() => !isAnimating && setActivePhase(index)}
              onMouseLeave={() => !isAnimating && setActivePhase(null)}
            >
              {/* Connecting Line */}
              {index < phases.length - 1 && (
                <div className={`absolute left-6 top-16 w-0.5 h-6 transition-colors ${
                  isPast ? 'bg-green-500' : 'bg-gray-700'
                }`} />
              )}

              {/* Phase Card */}
              <div className={`flex gap-4 p-4 rounded-lg border-2 transition-all ${
                isActive
                  ? `${phase.bgColor} ${phase.borderColor} border-2`
                  : isPast
                  ? 'bg-gray-900/50 border-gray-700/50'
                  : 'bg-gray-900/30 border-gray-700/30 hover:bg-gray-900/50'
              }`}>
                {/* Icon & Timeline Position */}
                <div className="flex flex-col items-center">
                  <div className={`text-4xl ${isActive ? 'animate-bounce' : ''}`}>
                    {phase.icon}
                  </div>
                  <div className="text-xs text-gray-500 mt-2 text-center w-20">
                    {phase.timeRange}
                  </div>
                  {isPast && (
                    <div className="mt-2 text-green-500">✓</div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h4 className={`text-lg font-bold mb-2 ${phase.color}`}>
                    Phase {index + 1}: {phase.name}
                  </h4>
                  
                  {/* Visualization */}
                  <div className="mb-3 p-2 bg-gray-950/50 rounded border border-gray-700">
                    <div className="text-2xl text-center font-mono">
                      {phase.visualization}
                    </div>
                  </div>

                  {/* Physics Details */}
                  <div className={`transition-all duration-300 ${
                    isActive || activePhase === null ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                  }`}>
                    <div className="space-y-1.5">
                      {phase.physics.map((detail, idx) => (
                        <div key={idx} className="flex gap-2 text-sm">
                          <span className={`${phase.color} flex-shrink-0`}>•</span>
                          <span className="text-gray-300">{detail}</span>
                        </div>
                      ))}
                    </div>

                    {/* Research Citation */}
                    {phase.researchCitation && (
                      <div className="mt-3 p-2 bg-blue-900/10 border border-blue-500/30 rounded text-xs text-blue-300">
                        <span className="font-semibold">🔬 Research:</span> {phase.researchCitation}
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Indicator */}
                {isActive && (
                  <div className="flex items-center">
                    <div className={`w-1 h-full rounded-full animate-pulse ${phase.borderColor.replace('border-', 'bg-')}`} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/50 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🎓</div>
          <div>
            <div className="font-semibold text-purple-300 mb-1">Complete Process Duration</div>
            <div className="text-sm text-gray-300">
              Total time from photon impact to stable oxide formation: <span className="font-bold text-white">~100 milliseconds</span>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Between laser pulses at 30 kHz repetition rate: 33 microseconds cooling time available
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
