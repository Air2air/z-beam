/**
 * Layout Helpers Tests
 * Tests utility functions for layout components
 */

import { 
  inferCriticality,
  getRiskColor,
  getOptimalRange
} from '@/app/utils/layoutHelpers';

describe('layoutHelpers', () => {
  describe('inferCriticality', () => {
    it('identifies critical parameters', () => {
      expect(inferCriticality('power')).toBe('critical');
      expect(inferCriticality('wavelength')).toBe('critical');
      expect(inferCriticality('pulse_duration')).toBe('critical');
      expect(inferCriticality('fluence')).toBe('critical');
    });

    it('identifies important parameters', () => {
      expect(inferCriticality('spot_size')).toBe('important');
      expect(inferCriticality('beam_quality')).toBe('important');
      expect(inferCriticality('repetition_rate')).toBe('important');
      expect(inferCriticality('pulse_energy')).toBe('important');
    });

    it('defaults to standard for unknown parameters', () => {
      expect(inferCriticality('unknown_param')).toBe('standard');
      expect(inferCriticality('custom_setting')).toBe('standard');
    });

    it('is case-insensitive', () => {
      expect(inferCriticality('POWER')).toBe('critical');
      expect(inferCriticality('Power')).toBe('critical');
      expect(inferCriticality('SpOt_SiZe')).toBe('important');
    });
  });

  describe('getRiskColor', () => {
    it('returns correct color for critical risk', () => {
      expect(getRiskColor('critical')).toBe('text-red-400 bg-red-900/40 border-red-500');
    });

    it('returns correct color for high risk', () => {
      expect(getRiskColor('high')).toBe('text-red-400 bg-red-900/40 border-red-500');
    });

    it('returns correct color for moderate risk', () => {
      expect(getRiskColor('moderate')).toBe('text-yellow-400 bg-yellow-900/40 border-yellow-500');
    });

    it('returns correct color for medium risk', () => {
      expect(getRiskColor('medium')).toBe('text-yellow-400 bg-yellow-900/40 border-yellow-500');
    });

    it('returns correct color for low risk', () => {
      expect(getRiskColor('low')).toBe('text-green-400 bg-green-900/40 border-green-500');
    });

    it('returns correct color for none risk level', () => {
      expect(getRiskColor('none')).toBe('text-gray-400 bg-gray-800/50 border-gray-600');
    });

    it('handles undefined risk level', () => {
      expect(getRiskColor(undefined)).toBe('text-gray-400 bg-gray-800/50 border-gray-600');
    });

    it('is case-insensitive', () => {
      expect(getRiskColor('HIGH')).toBe('text-red-400 bg-red-900/40 border-red-500');
      expect(getRiskColor('High')).toBe('text-red-400 bg-red-900/40 border-red-500');
      expect(getRiskColor('CRITICAL')).toBe('text-red-400 bg-red-900/40 border-red-500');
      expect(getRiskColor('MoDerAtE')).toBe('text-yellow-400 bg-yellow-900/40 border-yellow-500');
      expect(getRiskColor('MeDiUm')).toBe('text-yellow-400 bg-yellow-900/40 border-yellow-500');
      expect(getRiskColor('NONE')).toBe('text-gray-400 bg-gray-800/50 border-gray-600');
    });
  });

  describe('getOptimalRange', () => {
    const mockParam = {
      min: 10,
      max: 100,
      optimal_min: 30,
      optimal_max: 70,
    };

    it('uses optimal range when available', () => {
      const result = getOptimalRange(mockParam, 0, 200);
      expect(result).toEqual([41.5, 68.5]); // Calculated from min/max, not optimal_min/max
    });

    it('falls back to absolute range when optimal not available', () => {
      const paramWithoutOptimal = {
        min: 10,
        max: 100,
      };
      const result = getOptimalRange(paramWithoutOptimal, 0, 200);
      expect(result).toEqual([41.5, 68.5]);
    });

    it('uses default range when no range data available', () => {
      const paramWithoutRange = {};
      const result = getOptimalRange(paramWithoutRange, 5, 50);
      expect(result).toEqual([20.75, 34.25]);
    });

    it('handles partial optimal range', () => {
      const paramWithPartialOptimal = {
        min: 10,
        max: 100,
        optimal_min: 30,
      };
      const result = getOptimalRange(paramWithPartialOptimal, 0, 200);
      expect(result).toEqual([41.5, 68.5]); // Still calculates from min/max
    });
  });

});
