// app/components/Heatmap/types.ts

export interface MaterialProperties {
  // Core thermal properties
  thermalConductivity?: number;  // W/m·K
  thermalDiffusivity?: number;    // m²/s
  heatCapacity?: number;          // J/(kg·K) or specificHeat
  specificHeat?: number;          // J/(kg·K) - alternative name
  
  // Temperature thresholds
  meltingPoint?: number;          // K
  boilingPoint?: number;          // K
  oxidationTemperature?: number;  // K
  thermalDestructionPoint?: number; // K
  
  // Laser interaction properties
  ablationThreshold?: number;     // J/cm²
  laserDamageThreshold?: number;  // J/cm²
  absorptivity?: number;          // dimensionless
  absorptionCoefficient?: number; // m^-1
  laserReflectivity?: number;     // dimensionless
  
  // Thermal dynamics
  thermalRelaxationTime?: number; // s
  thermalExpansionCoefficient?: number; // 1/K
  thermalShockResistance?: number; // K
  heatAffectedZoneDepth?: number; // μm
}

export interface HeatmapRange {
  min: number;
  max: number;
  current: number;
}

export interface CellAnalysis {
  level: number;
  finalScore: number;
  [key: string]: any; // Allow arbitrary analysis data
}

export interface HoveredCell {
  power: number;
  pulse: number;
  analysis?: CellAnalysis;
}

export interface ColorAnchor {
  level: number;
  color: string;
}

export interface LegendItem {
  color: string;
  label: string;
  range?: string;
}

export interface BaseHeatmapProps {
  powerRange: HeatmapRange;
  pulseRange: HeatmapRange;
  optimalPower: [number, number];
  optimalPulse: [number, number];
  materialProperties?: MaterialProperties;
  title: string;
  description?: string;
  gridRows?: number;
  gridCols?: number;
  
  // Required callback for calculating cell scores
  calculateScore: (power: number, pulse: number, materialProperties?: MaterialProperties) => { level: number; analysis: CellAnalysis };
  
  // Color mapping configuration
  colorAnchors: ColorAnchor[];
  
  // UI customization
  getScoreLabel: (level: number) => string;
  legendItems: LegendItem[];
  
  // Optional: Custom analysis panel renderer
  renderAnalysisPanel?: (hoveredCell: HoveredCell | null, currentPower: number, currentPulse: number) => React.ReactNode;
  
  // Optional: Footer description
  footerDescription?: React.ReactNode;
}
