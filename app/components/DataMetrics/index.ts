// app/components/DataMetrics/index.ts
// Unified DataMetrics component - consolidates MetricsCard, MetricsGrid, and StatCard

export {
  DataMetrics,
  DataMetricsGrid,
  DataMetricsStats,
  type DataMetricsPropsType as DataMetricsProps,
  type StatDataType as StatData,
  GenericMetricsCard,
  CustomMetricsCard,
  createMetricConfigs
} from './DataMetrics';

// Default export
export { DataMetrics as default } from './DataMetrics';