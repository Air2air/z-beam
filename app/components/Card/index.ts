// app/components/Card/index.ts
// Export all Card-related components

export { Card } from './Card';
export type { CardProps } from './Card';

// StatCard exports - maintain backward compatibility
export { StatCard } from './StatCard';
export type { StatCardProps, StatData, StatCardConfig } from './StatCard';

// Also export from DataMetrics for unified access
export { StatCard as DataMetricsStatCard, type StatCardProps as DataMetricsStatCardProps } from '../DataMetrics/DataMetrics';