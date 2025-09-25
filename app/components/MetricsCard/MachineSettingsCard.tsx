// MachineSettingsCard component - extends MetricsCard for laser parameters
"use client";

import React from 'react';
import { MetricsCard, MetricsCardProps } from './MetricsCard';
import { ArticleMetadata } from '../../../types';

export interface MachineSettingsCardProps {
  metadata: ArticleMetadata;
  title?: string;
  description?: string;
  className?: string;
  mode?: 'simple' | 'advanced';
  maxCards?: number;
}

export function MachineSettingsCard({
  metadata,
  title = "Laser Parameters",
  description = "Optimized laser settings for material processing",
  className,
  mode = 'simple',
  maxCards = 6
}: MachineSettingsCardProps) {
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

export default MachineSettingsCard;