/**
 * Layout Helpers Tests
 * Tests utility functions for layout components
 */

import { 
  inferCriticality,
  getRiskColor,
  getOptimalRange,
  getEnrichmentMetadata
} from '@/app/utils/layoutHelpers';
import { ArticleMetadata } from '@/types/centralized';

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
    it('returns correct color for high risk', () => {
      expect(getRiskColor('high')).toBe('bg-red-100 border-red-200 text-red-900');
    });

    it('returns correct color for medium risk', () => {
      expect(getRiskColor('medium')).toBe('bg-amber-100 border-amber-200 text-amber-900');
    });

    it('returns correct color for low risk', () => {
      expect(getRiskColor('low')).toBe('bg-emerald-100 border-emerald-200 text-emerald-900');
    });

    it('handles undefined risk level', () => {
      expect(getRiskColor(undefined)).toBe('bg-zinc-100 border-zinc-200 text-zinc-900');
    });

    it('is case-insensitive', () => {
      expect(getRiskColor('HIGH')).toBe('bg-red-100 border-red-200 text-red-900');
      expect(getRiskColor('High')).toBe('bg-red-100 border-red-200 text-red-900');
      expect(getRiskColor('MeDiUm')).toBe('bg-amber-100 border-amber-200 text-amber-900');
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
      expect(result).toEqual({ min: 30, max: 70 });
    });

    it('falls back to absolute range when optimal not available', () => {
      const paramWithoutOptimal = {
        min: 10,
        max: 100,
      };
      const result = getOptimalRange(paramWithoutOptimal, 0, 200);
      expect(result).toEqual({ min: 10, max: 100 });
    });

    it('uses default range when no range data available', () => {
      const paramWithoutRange = {};
      const result = getOptimalRange(paramWithoutRange, 5, 50);
      expect(result).toEqual({ min: 5, max: 50 });
    });

    it('handles partial optimal range', () => {
      const paramWithPartialOptimal = {
        min: 10,
        max: 100,
        optimal_min: 30,
      };
      const result = getOptimalRange(paramWithPartialOptimal, 0, 200);
      expect(result).toEqual({ min: 30, max: 100 });
    });
  });

  describe('getEnrichmentMetadata', () => {
    const mockMetadata: ArticleMetadata = {
      title: 'Test Material',
      slug: 'test-material',
      description: 'Test description',
      enrichments: {
        material_linkage: {
          title: 'Custom Material Title',
          description: 'Custom material description',
        },
        contaminant_linkage: {
          title: 'Custom Contaminant Title',
          // No description provided
        },
      },
    };

    it('returns enrichment metadata when available', () => {
      const result = getEnrichmentMetadata(
        mockMetadata,
        'material_linkage',
        'Default Title',
        'Default description'
      );

      expect(result).toEqual({
        title: 'Custom Material Title',
        description: 'Custom material description',
      });
    });

    it('falls back to default title when enrichment title missing', () => {
      const result = getEnrichmentMetadata(
        mockMetadata,
        'contaminant_linkage',
        'Default Title',
        'Default description'
      );

      expect(result).toEqual({
        title: 'Custom Contaminant Title',
        description: 'Default description',
      });
    });

    it('uses defaults when enrichment key not found', () => {
      const result = getEnrichmentMetadata(
        mockMetadata,
        'settings_linkage',
        'Default Title',
        'Default description'
      );

      expect(result).toEqual({
        title: 'Default Title',
        description: 'Default description',
      });
    });

    it('uses defaults when enrichments object missing', () => {
      const metadataWithoutEnrichments: ArticleMetadata = {
        title: 'Test',
        slug: 'test',
        description: 'Test',
      };

      const result = getEnrichmentMetadata(
        metadataWithoutEnrichments,
        'material_linkage',
        'Default Title',
        'Default description'
      );

      expect(result).toEqual({
        title: 'Default Title',
        description: 'Default description',
      });
    });

    it('handles undefined metadata', () => {
      const result = getEnrichmentMetadata(
        undefined as any,
        'material_linkage',
        'Default Title',
        'Default description'
      );

      expect(result).toEqual({
        title: 'Default Title',
        description: 'Default description',
      });
    });

    it('handles partial enrichment data', () => {
      const partialMetadata: ArticleMetadata = {
        title: 'Test',
        slug: 'test',
        description: 'Test',
        enrichments: {
          material_linkage: {
            title: 'Only Title Provided',
          },
        },
      };

      const result = getEnrichmentMetadata(
        partialMetadata,
        'material_linkage',
        'Default Title',
        'Default description'
      );

      expect(result).toEqual({
        title: 'Only Title Provided',
        description: 'Default description',
      });
    });
  });
});
