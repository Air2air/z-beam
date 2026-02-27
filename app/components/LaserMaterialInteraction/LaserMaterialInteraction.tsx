import React from 'react';
import { BaseSection } from '../BaseSection/BaseSection';
import { PropertyBars } from '../PropertyBars/PropertyBars';
import { getSectionIcon } from '@/app/config/sectionIcons';

interface LaserMaterialInteractionProps {
  materialName: string;
  materialProperties: any;
  category?: string;
  subcategory?: string;
  slug?: string;
  className?: string;
}

/**
 * LaserMaterialInteraction Component
 * 
 * Displays laser-material interaction properties using PropertyGrid with:
 * - Thermal Conductivity
 * - Thermal Diffusivity
 * - Absorption Coefficient
 * - Laser Reflectivity
 * - Ablation Threshold
 * - And other laser interaction parameters
 */
export function LaserMaterialInteraction({
  materialName,
  materialProperties,
  category,
  subcategory,
  slug,
  className = ''
}: LaserMaterialInteractionProps) {
  // Extract only laser-material interaction section
  const laserInteractionData = materialProperties?.laserMaterialInteraction;
  
  // Use _section/frontmatter-provided section fields only
  const sectionData = laserInteractionData?._section;
  const title = sectionData?.sectionTitle;
  const description = sectionData?.sectionDescription;
  
  // If laserMaterialInteraction is a string, render it as description only
  if (typeof laserInteractionData === 'string') {
    return (
      <BaseSection
        title={title}
        description={description}
        icon={getSectionIcon('zap')}
        spacing="loose"
      >
        <div className="text-muted italic">Detailed interaction metrics will be available soon.</div>
      </BaseSection>
    );
  }
  
  // Check for actual property data (not just 'label' or 'percentage' metadata fields)
  const hasActualProperties = laserInteractionData && Object.keys(laserInteractionData).some(
    key => key !== 'label' && key !== 'percentage' && key !== 'description' &&
           key !== '_section' && key !== '_metadata' && key !== 'title' &&
           laserInteractionData[key]?.value !== undefined
  );
  
  // If has _section metadata but no property data, show placeholder
  const hasSection = laserInteractionData?._section?.sectionTitle && laserInteractionData?._section?.sectionDescription;
  
  if (hasSection && !hasActualProperties) {
    return (
      <BaseSection
        title={title}
        description={description}
        icon={getSectionIcon('zap')}
        spacing="loose"
        className={className}
      >
        <div className="text-muted italic">Detailed interaction metrics will be available soon.</div>
      </BaseSection>
    );
  }

  // If no actual property data and no section metadata, don't render the section
  if (!hasActualProperties && !hasSection) {
    return null;
  }

  if (!title || !description) {
    throw new Error(`Missing laserMaterialInteraction._section.sectionTitle/sectionDescription for ${materialName}`);
  }

  // Prepare metadata for PropertyBars (expects specific structure)
  const metadata = {
    slug,
    category,
    subcategory,
    title: materialName,
    description: '',
    materialProperties: {
      laserMaterialInteraction: laserInteractionData
    }
  };

  // Generate settings URL if we have the required info
  const settingsUrl = (category && subcategory && slug)
    ? `/settings/${category}/${subcategory}/${slug.replace('-laser-cleaning', '')}-settings`
    : undefined;

  return (
    <BaseSection
      title={title}
      description={description}
      icon={getSectionIcon('zap')}
      spacing="loose"
      className={className}
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
