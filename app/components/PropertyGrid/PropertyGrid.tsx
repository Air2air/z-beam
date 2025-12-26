// app/components/PropertyGrid/PropertyGrid.tsx
import React from 'react';
import { PropertyBars } from '../PropertyBars/PropertyBars';
import { SectionContainer } from '../SectionContainer/SectionContainer';
import { getSectionIcon } from '@/app/config/sectionIcons';

interface PropertyGridProps {
  metadata: any;
  dataSource?: 'materialProperties' | 'machineSettings';
  title?: string;
  materialName?: string;
  icon?: React.ReactNode;
  actionText?: string;
  actionUrl?: string;
  columns?: { xs?: number; sm?: number; md?: number; lg?: number };
  height?: number;
  className?: string;
  variant?: 'default' | 'dark';
}

/**
 * PropertyGrid - Normalized component combining PropertyBars with SectionContainer
 * 
 * This component provides a standardized way to display property grids with consistent
 * title, icon, and action button layout. It wraps PropertyBars in a SectionContainer
 * for uniform presentation across the application.
 * 
 * Usage:
 * ```tsx
 * <PropertyGrid
 *   metadata={metadata}
 *   dataSource="materialProperties"
 *   title="Material Properties"
 *   icon={getSectionIcon('material-properties')}
 *   actionText="View Settings"
 *   actionUrl="/settings/..."
 * />
 * ```
 * 
 * @param metadata - Material/machine metadata containing property data
 * @param dataSource - Which properties to extract ('materialProperties' or 'machineSettings')
 * @param title - Section title (auto-generated from materialName if not provided)
 * @param materialName - Material name for auto-generating title
 * @param icon - Optional icon for the section header
 * @param actionText - Optional text for action button
 * @param actionUrl - Optional URL for action button
 * @param columns - Responsive column counts (default: xs:3, sm:4, md:5, lg:6)
 * @param height - Bar height in pixels (default: 70px)
 * @param className - Additional CSS classes for SectionContainer
 * @param variant - SectionContainer variant ('default' | 'dark')
 */
export function PropertyGrid({
  metadata,
  dataSource = 'materialProperties',
  title,
  materialName,
  icon,
  actionText,
  actionUrl,
  columns = { xs: 3, sm: 4, md: 5, lg: 6 },
  height = 70,
  className = 'mb-8',
  variant = 'default'
}: PropertyGridProps) {
  // Check if we have property data
  const hasData = dataSource === 'machineSettings'
    ? metadata?.machineSettings && Object.keys(metadata.machineSettings).length > 0
    : metadata?.materialProperties && Object.keys(metadata.materialProperties).length > 0;

  if (!hasData) {
    return null;
  }

  // Auto-generate title if not provided
  const displayTitle = title || (
    dataSource === 'machineSettings'
      ? (materialName ? `${materialName} Machine Settings` : 'Machine Settings')
      : (materialName ? `${materialName} Properties` : 'Properties')
  );

  // Auto-generate icon if not provided
  const displayIcon = icon || getSectionIcon(
    dataSource === 'machineSettings' ? 'machine-settings' : 'material-properties'
  );

  return (
    <SectionContainer
      title={displayTitle}
      icon={displayIcon}
      actionText={actionText}
      actionUrl={actionUrl}
      className={className}
      variant={variant}
    >
      <PropertyBars
        metadata={metadata}
        dataSource={dataSource}
        columns={columns}
        height={height}
      />
    </SectionContainer>
  );
}
