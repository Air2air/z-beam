// app/components/MachineSettings/MachineSettings.tsx
import React from 'react';
import { BaseSection } from '../BaseSection/BaseSection';
import { PropertyBars } from '../PropertyBars/PropertyBars';
import { getSectionIcon } from '@/app/config/sectionIcons';

interface MachineSettingsProps {
  metadata: any;
  materialName?: string;
  materialLink?: string;
  heroImage?: string;
  sectionDescription?: string;
}

/**
 * MachineSettings - Dedicated component for displaying machine settings parameters
 * 
 * Displays machine configuration parameters using PropertyGrid component with
 * three-bar visualization (value, min, max) for all settings properties.
 * 
 * Designed for Settings pages to show equipment parameters and operating ranges.
 * Includes "Material" button in top-right to navigate back to the material page.
 * 
 * @param metadata - Settings metadata containing machineSettings data
 * @param materialName - Optional material name for title context
 * @param materialLink - Optional link back to material page (creates "Material" button)
 */
export function MachineSettings({ metadata, materialName, materialLink, sectionDescription }: MachineSettingsProps) {
  // Check if we have machine settings data
  const hasMachineSettings = metadata?.machineSettings && 
    Object.keys(metadata.machineSettings).length > 0;

  if (!hasMachineSettings) {
    return null;
  }

  const title = materialName 
    ? `${materialName} Machine Settings`
    : 'Machine Settings';

  // Use passed sectionDescription or fall back to default
  const description = sectionDescription 
    || "Optimal laser parameters and operating ranges for effective cleaning";

  return (
    <BaseSection
      title={title}
      description={description}
      icon={getSectionIcon('settings')}
      spacing="loose"
    >
      <PropertyBars
        metadata={metadata}
        dataSource="machineSettings"
        columns={{ xs: 2, sm: 3, md: 4, lg: 5 }}
        height={70}
      />
    </BaseSection>
  );
}
