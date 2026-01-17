// app/components/MaterialCharacteristics/MaterialCharacteristics.tsx
import React from 'react';
import { BaseSection } from '../BaseSection/BaseSection';
import { PropertyBars } from '../PropertyBars/PropertyBars';
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
  // Debug logging to understand data structure
  console.log('[MaterialCharacteristics] materialProperties:', JSON.stringify(materialProperties, null, 2));
  console.log('[MaterialCharacteristics] materialProperties?.materialCharacteristics:', JSON.stringify(materialProperties?.materialCharacteristics, null, 2));
  
  // Handle both structured object and text-only formats
  const materialChars = materialProperties?.materialCharacteristics;
  
  // 🚨 DEBUG: Log the data structure we're receiving
  console.log('🔬 MaterialCharacteristics DEBUG:');
  console.log('📊 materialProperties:', JSON.stringify(materialProperties, null, 2));
  console.log('📝 materialCharacteristics:', JSON.stringify(materialChars, null, 2));
  console.log('🔍 _section:', JSON.stringify(materialChars?._section, null, 2));
  
  // If materialCharacteristics is a string, render it as description only (no _section required)
  if (typeof materialChars === 'string') {
    return (
      <BaseSection
        title="Material Characteristics"
        description="Core physical and chemical properties"
        spacing="loose"
      >
        <div className="text-muted italic">Detailed property metrics will be available soon.</div>
      </BaseSection>
    );
  }
  
  // 🔥 ULTIMATE SIMPLICITY: For object data, section metadata is MANDATORY
  if (!materialChars || !materialChars._section?.sectionTitle || !materialChars._section?.sectionDescription) {
    throw new Error(`MaterialCharacteristics: _section metadata with sectionTitle and sectionDescription is required for object data. Found: ${JSON.stringify(materialChars?._section)}`);
  }
  
  // Check for actual property data (not just 'label' or 'percentage' metadata fields)
  const hasActualProperties = materialChars && Object.keys(materialChars).some(
    key => key !== 'label' && key !== 'percentage' && key !== 'description' &&
           materialChars[key]?.value !== undefined
  );

  if (!hasActualProperties) {
    return null;
  }

  // Prepare metadata with ONLY material_characteristics for PropertyBars
  // This ensures we display only core material properties, not laser interaction properties
  const metadata = {
    slug: slug || '',
    category: category || '',
    subcategory: subcategory || '',
    title: materialName,
    description: '',
    materialProperties: {
      materialCharacteristics: materialChars
    }
  };

  return (
    <BaseSection
      section={materialChars._section}
      spacing="loose"
    >
      <PropertyBars
        metadata={metadata}
        dataSource="materialProperties"
        columns={{ xs: 3, sm: 4, md: 5, lg: 6 }}
        height={70}
      />
    </BaseSection>
  );
}
