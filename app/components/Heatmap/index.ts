// app/components/Heatmap/index.ts

export { BaseHeatmap } from './BaseHeatmap';
export { MaterialSafetyHeatmap } from './MaterialSafetyHeatmap';
export { ProcessEffectivenessHeatmap } from './ProcessEffectivenessHeatmap';
export { EnergyCouplingHeatmap } from './EnergyCouplingHeatmap';
export { ThermalStressHeatmap } from './ThermalStressHeatmap';
export { HeatmapFactorCard } from './HeatmapFactorCard';
export { HeatmapStatusSummary } from './HeatmapStatusSummary';
export { AnalysisCards, AnalysisCard, StatusSummaryCard } from './AnalysisCards';
export type { FactorCardConfig } from './HeatmapFactorCard';
export type { 
  MaterialProperties,
  HeatmapRange,
  CellAnalysis,
  HoveredCell,
  ColorAnchor,
  LegendItem,
  BaseHeatmapProps
} from './types';
