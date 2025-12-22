// app/components/MachineSettings/MachineSettings.tsx
import React from 'react';
import { PropertyBars } from '../PropertyBars/PropertyBars';
import { SectionContainer } from '../SectionContainer/SectionContainer';
import { SectionTitle } from '../SectionTitle/SectionTitle';
import { getSectionIcon } from '@/app/config/sectionIcons';

interface MachineSettingsProps {
  metadata: any;
  materialName?: string;
  materialLink?: string;
}

/**
 * MachineSettings - Dedicated component for displaying machine settings parameters
 * 
 * Displays machine configuration parameters using PropertyBars component with
 * three-bar visualization (value, min, max) for all settings properties.
 * 
 * Designed for Settings pages to show equipment parameters and operating ranges.
 * Includes "Material" button in top-right to navigate back to the material page.
 * 
 * @param metadata - Settings metadata containing machineSettings data
 * @param materialName - Optional material name for title context
 * @param materialLink - Optional link back to material page (creates "Material" button)
 */
export function MachineSettings({ metadata, materialName, materialLink }: MachineSettingsProps) {
  // Check if we have machine settings data
  const hasMachineSettings = metadata?.machineSettings && 
    Object.keys(metadata.machineSettings).length > 0;

  if (!hasMachineSettings) {
    return null;
  }

  const title = materialName 
    ? `${materialName} Machine Settings`
    : 'Machine Settings';

  return (
    <SectionContainer
      title={title}
      icon={getSectionIcon('machine-settings')}
      actionText={materialLink ? "Material" : undefined}
      actionUrl={materialLink}
      className="mb-8"
    >
      <PropertyBars 
        metadata={metadata}
        dataSource="machineSettings"
        columns={{ xs: 2, sm: 3, md: 4, lg: 5 }}
        height={70}
      />
    </SectionContainer>
  );
}
