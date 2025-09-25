// app/components/Card/index.ts
// Export all Card-related components

export { Card } from './Card';
export type { CardProps } from './Card';

export { StatCard } from './StatCard';
export type { StatCardProps, StatData, StatCardConfig } from './StatCard';

// Re-export examples for development/testing
export { StatCardExamples, BasicStatCard, AdvancedStatCard } from './StatCard.example';

// Re-export alabaster examples
export { 
  AlabasterDensityCard, 
  AlabasterPropertiesCard, 
  AlabasterLaserSettingsCard, 
  AlabasterStatDashboard,
  createPropertyStatCard,
  createMachineSettingStatCard
} from './StatCard.alabaster.example';