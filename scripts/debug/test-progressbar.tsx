// Test script for MetricsCard progress bar visualization
// This script demonstrates the progress bar functionality with sample data

import React from 'react';
import { MetricsCard } from '../../app/components/MetricsCard/MetricsCard';

// Sample metadata with Min/Max values for testing progress bars
const testMetadata = {
  title: "Aluminum Laser Cleaning Test",
  machineSettings: {
    // Power settings with min/max for progress bar
    powerRange: "500W",
    powerRangeUnit: "W",
    powerMin: "100",
    powerMax: "1000",
    
    // Wavelength settings with min/max
    wavelength: "1064nm",
    wavelengthUnit: "nm", 
    wavelengthMin: "800",
    wavelengthMax: "1200",
    
    // Pulse duration with min/max
    pulseDuration: "100ns",
    pulseDurationUnit: "ns",
    pulseDurationMin: "10",
    pulseDurationMax: "500",
    
    // Repetition rate with min/max
    repetitionRate: "50kHz",
    repetitionRateUnit: "kHz",
    repetitionRateMin: "1",
    repetitionRateMax: "100",
    
    // Spot size with min/max  
    spotSize: "2mm",
    spotSizeUnit: "mm",
    spotSizeMin: "0.5",
    spotSizeMax: "5",
    
    // Fluence with min/max
    fluenceRange: "10J/cm²",
    fluenceRangeUnit: "J/cm²",
    fluenceMin: "1",
    fluenceMax: "50"
  }
};

// Test component to render MetricsCard with progress bars
export function TestProgressBar() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-4">MetricsCard Progress Bar Test</h1>
      
      {/* Simple mode with progress bars */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Simple Mode with Progress Bars</h2>
        <MetricsCard 
          metadata={testMetadata}
          baseHref="#"
          mode="simple"
          title="Laser Parameters with Progress Visualization"
        />
      </div>
      
      {/* Advanced mode should also show progress bars if min/max available */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Advanced Mode with Progress Bars</h2>
        <MetricsCard 
          metadata={testMetadata}
          baseHref="#"
          mode="advanced"
          title="Advanced Laser Settings"
          layout="grid-3"
        />
      </div>
    </div>
  );
}

export default TestProgressBar;