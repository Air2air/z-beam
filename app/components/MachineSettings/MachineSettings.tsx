// app/components/MachineSettings/MachineSettings.tsx
import React from 'react';
import { PropertyBars } from '../PropertyBars/PropertyBars';
import { SectionContainer } from '../SectionContainer/SectionContainer';
import { SectionTitle } from '../SectionTitle/SectionTitle';
import { getSectionIcon } from '@/app/config/sectionIcons';

interface MachineSettingsProps {
  metadata: any;
  materialName?: string;
  heroImage?: string;
  materialLink?: string;
}

/**
 * MachineSettings - Dedicated component for displaying machine settings parameters
 * 
 * Displays machine configuration parameters using PropertyBars component with
 * three-bar visualization (value, min, max) for all settings properties.
 * 
 * Designed for Settings pages to show equipment parameters and operating ranges.
 * 
 * @param metadata - Settings metadata containing machineSettings data
 * @param materialName - Optional material name for title context
 * @param heroImage - Optional hero image URL for thumbnail
 */
export function MachineSettings({ metadata, materialName, heroImage, materialLink }: MachineSettingsProps) {
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
      className="mb-8"
    >
      <SectionTitle
        title={title}
        icon={getSectionIcon('machine-settings')}
        thumbnail={heroImage}
        thumbnailLink={materialLink}
      />
      <PropertyBars 
        metadata={metadata}
        dataSource="machineSettings"
        columns={{ xs: 2, sm: 3, md: 4, lg: 5 }}
        height={70}
      />
    </SectionContainer>
  );
}
