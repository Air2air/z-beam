// MetricsProperties component - extends MetricsCard for material properties
"use client";

import React from 'react';
import { MetricsCard, MetricsCardProps } from './MetricsCard';
import { ArticleMetadata } from '../../../types';

export interface MetricsPropertiesProps {
  metadata: ArticleMetadata;
  title?: string;
  description?: string;
  className?: string;
  mode?: 'simple' | 'advanced';
  maxCards?: number;
}

export function MetricsProperties({
  metadata,
  title = "Material Properties",
  description = "Physical and chemical characteristics",
  className,
  mode = 'simple',
  maxCards = 6
}: MetricsPropertiesProps) {
  return (
    <MetricsCard
      metadata={metadata}
      title={title}
      description={description}
      className={className}
      mode={mode}
      maxCards={maxCards}
      dataSource="properties" // Tell MetricsCard to use properties data
    />
  );
}

export default MetricsProperties;