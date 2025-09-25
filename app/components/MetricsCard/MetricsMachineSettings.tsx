// MetricsMachineSettings component - extends MetricsCard for laser parameters
"use client";

import React from 'react';
import { MetricsCard, MetricsCardProps } from './MetricsCard';
import { ArticleMetadata } from '../../../types';

export interface MetricsMachineSettingsProps {
  metadata: ArticleMetadata;
  title?: string;
  description?: string;
  className?: string;
  mode?: 'simple' | 'advanced';
  maxCards?: number;
}

export function MetricsMachineSettings({
  metadata,
  title = "Laser Parameters",
  description = "Optimized laser settings for material processing",
  className,
  mode = 'simple',
  maxCards = 6
}: MetricsMachineSettingsProps) {
  return (
    <MetricsCard
      metadata={metadata}
      title={title}
      description={description}
      className={className}
      mode={mode}
      maxCards={maxCards}
      dataSource="machineSettings" // Tell MetricsCard to use machineSettings data
    />
  );
}

export default MetricsMachineSettings;