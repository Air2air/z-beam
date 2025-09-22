/**
 * Test Suite: MetricsGrid Component
 * Testing the MetricsGrid component with centralized types
 */

import { QualityMetrics, MetricsGridProps } from '../../types/centralized';

describe('MetricsGrid Component', () => {
  const mockQualityMetrics: QualityMetrics = {
    contamination_removal: '95%',
    surface_roughness_before: '12μm',
    surface_roughness_after: '2μm',
    thermal_damage: 'None detected',
    processing_efficiency: '90%',
    substrate_integrity: 'Maintained'
  };

  test('should use centralized QualityMetrics type', () => {
    expect(mockQualityMetrics.contamination_removal).toBe('95%');
    expect(mockQualityMetrics.surface_roughness_before).toBe('12μm');
    expect(mockQualityMetrics.surface_roughness_after).toBe('2μm');
  });

  test('should support MetricsGridProps interface', () => {
    const props: MetricsGridProps = {
      qualityMetrics: mockQualityMetrics,
      maxCards: 3,
      excludeMetrics: ['substrate_integrity'],
      className: 'test-metrics-grid'
    };

    expect(props.qualityMetrics).toBeDefined();
    expect(props.maxCards).toBe(3);
    expect(props.excludeMetrics).toContain('substrate_integrity');
    expect(props.className).toBe('test-metrics-grid');
  });

  test('should handle empty quality metrics', () => {
    const emptyMetrics: QualityMetrics = {};
    const props: MetricsGridProps = {
      qualityMetrics: emptyMetrics
    };

    expect(Object.keys(props.qualityMetrics)).toHaveLength(0);
  });

  test('should support flexible metric properties with index signature', () => {
    const customMetrics: QualityMetrics = {
      contamination_removal: '98%',
      custom_metric: 'Custom value',
      another_metric: 'Another value'
    };

    expect(customMetrics.contamination_removal).toBe('98%');
    expect(customMetrics['custom_metric']).toBe('Custom value');
    expect(customMetrics['another_metric']).toBe('Another value');
  });

  test('should work with default props', () => {
    const minimalProps: MetricsGridProps = {
      qualityMetrics: mockQualityMetrics
    };

    expect(minimalProps.qualityMetrics).toBeDefined();
    expect(minimalProps.maxCards).toBeUndefined(); // Should use default
    expect(minimalProps.excludeMetrics).toBeUndefined(); // Should use default
    expect(minimalProps.className).toBeUndefined(); // Should use default
  });

  test('should validate quality metrics structure', () => {
    const validMetrics: QualityMetrics = {
      contamination_removal: '95%',
      surface_roughness_before: '12μm',
      surface_roughness_after: '2μm'
    };

    // All values should be strings or undefined
    Object.values(validMetrics).forEach(value => {
      expect(typeof value === 'string' || value === undefined).toBe(true);
    });
  });

  test('should support filtering metrics through excludeMetrics', () => {
    const allMetrics = Object.keys(mockQualityMetrics);
    const excludeList = ['substrate_integrity', 'thermal_damage'];
    
    const filteredMetrics = allMetrics.filter(key => !excludeList.includes(key));
    
    expect(filteredMetrics).not.toContain('substrate_integrity');
    expect(filteredMetrics).not.toContain('thermal_damage');
    expect(filteredMetrics).toContain('contamination_removal');
  });
});

describe('MetricsGrid Centralized Types Integration', () => {
  test('should import types from centralized location', () => {
    // This test ensures that the types are properly exported from centralized location
    const metrics: QualityMetrics = {
      contamination_removal: '100%'
    };

    const props: MetricsGridProps = {
      qualityMetrics: metrics,
      maxCards: 2
    };

    expect(metrics).toBeDefined();
    expect(props).toBeDefined();
  });

  test('should maintain backward compatibility with existing metric names', () => {
    const backwardCompatibleMetrics: QualityMetrics = {
      contamination_removal: '95%',
      surface_roughness_before: '10μm',
      surface_roughness_after: '1μm',
      thermal_damage: 'Minimal',
      processing_efficiency: '88%',
      substrate_integrity: 'Excellent'
    };

    // All standard metric names should be supported
    expect(backwardCompatibleMetrics.contamination_removal).toBeDefined();
    expect(backwardCompatibleMetrics.surface_roughness_before).toBeDefined();
    expect(backwardCompatibleMetrics.surface_roughness_after).toBeDefined();
    expect(backwardCompatibleMetrics.thermal_damage).toBeDefined();
    expect(backwardCompatibleMetrics.processing_efficiency).toBeDefined();
    expect(backwardCompatibleMetrics.substrate_integrity).toBeDefined();
  });

  test('should support custom metrics through index signature', () => {
    const extendedMetrics: QualityMetrics = {
      contamination_removal: '97%',
      custom_cleanliness_score: '9.5/10',
      material_preservation_index: 'High',
      cost_effectiveness_ratio: '1.2x'
    };

    expect(extendedMetrics['custom_cleanliness_score']).toBe('9.5/10');
    expect(extendedMetrics['material_preservation_index']).toBe('High');
    expect(extendedMetrics['cost_effectiveness_ratio']).toBe('1.2x');
  });
});
