// app/components/MaterialCharacteristics/MaterialCharacteristics.tsx
import React from 'react';
import { PropertyGrid } from '../PropertyGrid/PropertyGrid';
import { getSectionIcon } from '@/app/config/sectionIcons';

interface MaterialCharacteristicsProps {
  materialProperties: any;
  materialName?: string;
  category?: string;
  subcategory?: string;
  slug?: string;
}

/**
 * MaterialCharacteristics - Dedicated component for displaying material characteristics
 * 
 * Displays core material properties using PropertyGrid component with
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
export function MaterialCharacteristics({ materialProperties, materialName, category, subcategory, slug }: MaterialCharacteristicsProps) {
  // Check for actual property data (not just 'label' or 'percentage' metadata fields)
  const materialChars = materialProperties?.material_characteristics || {};
  const hasActualProperties = Object.keys(materialChars).some(
    key => key !== 'label' && key !== 'percentage' && 
           materialChars[key]?.value !== undefined
  );

  if (!hasActualProperties) {
    return null;
  }

  const title = materialName 
    ? `${materialName} physical characteristics`
    : 'Physical characteristics';

  // Generate settings URL if we have the required info
  const settingsUrl = (category && subcategory && slug)
    ? `/settings/${category}/${subcategory}/${slug.replace('-laser-cleaning', '')}-settings`
    : undefined;

  // Prepare metadata with ONLY material_characteristics for PropertyBars
  // This ensures we display only core material properties, not laser interaction properties
  const metadata = {
    slug: slug || '',
    category: category || '',
    subcategory: subcategory || '',
    title: materialName,
    description: '',
    materialProperties: {
      material_characteristics: materialChars
    }
  };

  return (
    <PropertyGrid
      metadata={metadata}
      dataSource="materialProperties"
      title={title}
      icon={getSectionIcon('material-properties')}
      actionText={settingsUrl && materialName ? `${materialName} machine settings` : undefined}
      actionUrl={settingsUrl}
      columns={{ xs: 3, sm: 4, md: 5, lg: 6 }}
      height={70}
      className="mb-8"
    />
  );
}
