// app/components/MaterialCharacteristics/MaterialCharacteristics.tsx
import React from 'react';
import { PropertyBars } from '../PropertyBars/PropertyBars';
import { SectionContainer } from '../SectionContainer/SectionContainer';
import { getSectionIcon } from '@/app/config/sectionIcons';

interface MaterialCharacteristicsProps {
  materialProperties: any;
  materialName?: string;
}

/**
 * MaterialCharacteristics - Dedicated component for displaying material characteristics
 * 
 * Displays core material properties using PropertyBars component with
 * three-bar visualization (value, min, max) for characteristics like:
 * - Density, hardness, tensile strength
 * - Melting point, thermal destruction
 * - Electrical/thermal properties
 * - Surface characteristics
 * 
 * Designed for Materials pages to show fundamental material properties
 * separate from laser-material interaction properties.
 * 
 * @param materialProperties - Material metadata containing material_characteristics data
 * @param materialName - Optional material name for title context
 */
export function MaterialCharacteristics({ materialProperties, materialName }: MaterialCharacteristicsProps) {
  // Check if we have material characteristics data
  const hasMaterialCharacteristics = materialProperties?.material_characteristics && 
    Object.keys(materialProperties.material_characteristics).length > 0;

  if (!hasMaterialCharacteristics) {
    return null;
  }

  const title = materialName 
    ? `${materialName} Material Characteristics`
    : 'Material Characteristics';

  return (
    <SectionContainer
      title={title}
      icon={getSectionIcon('material-properties')}
      className="mb-8"
    >
      <PropertyBars 
        metadata={{ properties: materialProperties }}
        dataSource="materialProperties"
        columns={{ xs: 3, sm: 4, md: 5, lg: 6 }}
        height={70}
      />
    </SectionContainer>
  );
}
