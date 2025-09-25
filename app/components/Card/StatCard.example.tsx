// app/components/Card/StatCard.example.tsx
// Example usage of StatCard component

import React from 'react';
import { StatCard } from './StatCard';

// Example data for different use cases
export const StatCardExamples = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      
      {/* Basic Performance Stat Card */}
      <StatCard
        href="/performance/laser-efficiency"
        title="Laser Efficiency"
        name="Laser Efficiency"
        primaryStat={{
          value: 94.5,
          label: "Efficiency Rate",
          unit: "%",
          change: 5.2,
          trend: "up",
          format: "decimal",
          precision: 1
        }}
        secondaryStats={[
          {
            value: 1200,
            label: "Power Output",
            unit: "W",
            format: "number"
          },
          {
            value: 15.3,
            label: "Energy Cost",
            unit: "$/hr",
            change: -2.1,
            format: "decimal",
            precision: 1
          }
        ]}
        colorScheme="success"
        statLayout="vertical"
      />

      {/* Material Properties Stat Card */}
      <StatCard
        href="/materials/aluminum-properties"
        title="Aluminum Properties"
        name="Aluminum Alloy 6061"
        primaryStat={{
          value: 276,
          label: "Tensile Strength",
          unit: "MPa",
          comparison: {
            label: "Industry Average",
            value: 250,
            unit: "MPa"
          },
          format: "number"
        }}
        secondaryStats={[
          {
            value: 69,
            label: "Young's Modulus",
            unit: "GPa",
            format: "number"
          },
          {
            value: 2.7,
            label: "Density",
            unit: "g/cm³",
            format: "decimal",
            precision: 1
          }
        ]}
        colorScheme="info"
        statLayout="grid"
        badge={{
          symbol: "Al",
          materialType: "element",
          atomicNumber: 13,
          formula: "Al"
        }}
      />

      {/* Process Monitoring Stat Card */}
      <StatCard
        href="/monitoring/cleaning-process"
        title="Cleaning Process"
        name="Surface Cleaning Rate"
        primaryStat={{
          value: 85,
          label: "Completion Rate",
          unit: "%",
          change: -1.5,
          trend: "down",
          format: "decimal",
          precision: 1
        }}
        secondaryStats={[
          {
            value: 45,
            label: "Processing Speed",
            unit: "cm²/min",
            format: "number"
          },
          {
            value: 99.2,
            label: "Quality Score",
            unit: "%",
            trend: "up",
            format: "decimal",
            precision: 1
          }
        ]}
        colorScheme="warning"
        statLayout="horizontal"
      />

      {/* Cost Analysis Stat Card */}
      <StatCard
        href="/analysis/cost-efficiency"
        title="Cost Efficiency"
        name="Operating Costs"
        primaryStat={{
          value: 125.50,
          label: "Daily Operating Cost",
          format: "currency",
          precision: 2,
          change: -8.3,
          trend: "down"
        }}
        secondaryStats={[
          {
            value: 0.35,
            label: "Cost per m²",
            format: "currency",
            precision: 2
          }
        ]}
        colorScheme="success"
        statLayout="vertical"
      />

      {/* Temperature Monitoring Stat Card */}
      <StatCard
        href="/monitoring/temperature"
        title="Temperature Control"
        name="System Temperature"
        primaryStat={{
          value: 42.8,
          label: "Current Temp",
          unit: "°C",
          trend: "stable",
          format: "decimal",
          precision: 1
        }}
        secondaryStats={[
          {
            value: 45,
            label: "Max Temp",
            unit: "°C",
            format: "number"
          },
          {
            value: 38,
            label: "Min Temp",
            unit: "°C",
            format: "number"
          }
        ]}
        colorScheme="default"
        statLayout="grid"
      />

      {/* Error Rate Monitoring */}
      <StatCard
        href="/monitoring/error-rate"
        title="Error Monitoring"
        name="System Reliability"
        primaryStat={{
          value: 0.03,
          label: "Error Rate",
          unit: "%",
          change: 15.2,
          trend: "up",
          format: "decimal",
          precision: 2
        }}
        secondaryStats={[
          {
            value: 99.97,
            label: "Uptime",
            unit: "%",
            format: "decimal",
            precision: 2
          }
        ]}
        colorScheme="error"
        statLayout="vertical"
      />
    </div>
  );
};

// Individual examples for testing
export const BasicStatCard = () => (
  <StatCard
    href="/test"
    title="Test Stat"
    primaryStat={{
      value: 42,
      label: "Test Value",
      unit: "units"
    }}
  />
);

export const AdvancedStatCard = () => (
  <StatCard
    href="/advanced-test"
    title="Advanced Test"
    primaryStat={{
      value: 98.5,
      label: "Performance Score",
      unit: "%",
      change: 12.3,
      trend: "up",
      format: "decimal",
      precision: 1
    }}
    secondaryStats={[
      {
        value: 1500,
        label: "Total Processed",
        format: "number"
      },
      {
        value: 2.45,
        label: "Average Rate",
        unit: "items/min",
        format: "decimal",
        precision: 2
      }
    ]}
    colorScheme="success"
    statLayout="grid"
  />
);