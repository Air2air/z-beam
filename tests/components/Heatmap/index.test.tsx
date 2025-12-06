// tests/components/Heatmap/index.test.tsx
/**
 * Heatmap Component Test Suite
 * 
 * Tests for the interactive heatmap visualization components used on settings pages.
 * These components help operators visualize safe operating zones, process effectiveness,
 * and thermal behavior during laser cleaning.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Test that all heatmap components are exported from index
describe('Heatmap Component Exports', () => {
  it('should export MaterialSafetyHeatmap', async () => {
    const module = await import('@/app/components/Heatmap');
    expect(module.MaterialSafetyHeatmap).toBeDefined();
  });

  it('should export ProcessEffectivenessHeatmap', async () => {
    const module = await import('@/app/components/Heatmap');
    expect(module.ProcessEffectivenessHeatmap).toBeDefined();
  });

  it('should export EnergyCouplingHeatmap', async () => {
    const module = await import('@/app/components/Heatmap');
    expect(module.EnergyCouplingHeatmap).toBeDefined();
  });

  it('should export ThermalStressHeatmap', async () => {
    const module = await import('@/app/components/Heatmap');
    expect(module.ThermalStressHeatmap).toBeDefined();
  });

  it('should export BaseHeatmap', async () => {
    const module = await import('@/app/components/Heatmap');
    expect(module.BaseHeatmap).toBeDefined();
  });
});
