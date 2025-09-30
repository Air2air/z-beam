// Test file to verify Generic MetricsCard functionality
import React from 'react';
import { GenericMetricsCard, CustomMetricsCard, createMetricConfigs } from '../app/components/MetricsCard/MetricsCard';
import type { ArticleMetadata } from '../types';

// Sample metadata with various numeric properties
const sampleMetadata: ArticleMetadata = {
  title: "Test Material",
  slug: "test-material",
  // Numeric properties that should be auto-discovered
  density: {
    numeric: 2.7,
    units: "g/cm³",
    min: 2.5,
    max: 2.9
  },
  meltingPoint: {
    numeric: 1200,
    units: "°C",
    range: { min: 1000, max: 1500 }
  },
  thermalConductivity: 150,
  hardness: "85 HB",
  cost: "$45.50/kg",
  // Properties that should be excluded
  id: "test-123",
  description: "This should not appear as a metric",
  tags: ["metal", "aluminum"],
  // Nested properties (if includeNested is true)
  properties: {
    tensileStrength: {
      numeric: 276,
      units: "MPa"
    },
    yieldStrength: {
      numeric: 240,
      units: "MPa"
    }
  }
};

// Test auto-discovery
export function TestAutoDiscovery() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Auto-Discovery Test</h2>
      <GenericMetricsCard
        metadata={sampleMetadata}
        title="Material Properties (Auto-Discovered)"
        maxCards={8}
        excludeKeys={['tags']}
      />
    </div>
  );
}

// Test custom configuration
export function TestCustomConfiguration() {
  const customConfigs = [
    {
      key: 'density',
      title: 'Material Density',
      description: 'Physical density measurement',
      priority: 1,
      colorScheme: 'blue' as const
    },
    {
      key: 'meltingPoint',
      title: 'Melting Point',
      description: 'Temperature at which material melts',
      priority: 1,
      colorScheme: 'red' as const
    },
    {
      key: 'thermalConductivity',
      title: 'Thermal Conductivity',
      description: 'Rate of heat transfer',
      priority: 2,
      colorScheme: 'green' as const,
      defaultUnit: 'W/m·K'
    }
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Custom Configuration Test</h2>
      <CustomMetricsCard
        metadata={sampleMetadata}
        metricConfigs={customConfigs}
        title="Custom Material Properties"
        layout="grid-3"
      />
    </div>
  );
}

// Test helper function
export function TestMetricConfigsHelper() {
  const configs = createMetricConfigs(
    ['density', 'meltingPoint', 'thermalConductivity', 'hardness'],
    {
      defaultPriority: 2,
      titleFormatter: (key) => key.replace(/([A-Z])/g, ' $1').toUpperCase(),
      descriptionFormatter: (key) => `Measurement of material ${key.toLowerCase()}`
    }
  );

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Helper Function Test</h2>
      <CustomMetricsCard
        metadata={sampleMetadata}
        metricConfigs={configs}
        title="Properties from Helper Function"
        layout="auto"
      />
    </div>
  );
}

// Combined test page
export default function MetricsCardTest() {
  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Generic MetricsCard Tests
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Testing automatic discovery and custom configuration of numeric frontmatter properties
        </p>
      </div>
      
      <TestAutoDiscovery />
      <TestCustomConfiguration />
      <TestMetricConfigsHelper />
    </div>
  );
}