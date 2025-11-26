import React from 'react';
import { Zap } from 'lucide-react';
import { SectionContainer } from '../SectionContainer/SectionContainer';
import { PropertyBars } from '../PropertyBars/PropertyBars';

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
 * Displays laser-material interaction properties including:
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
  const laserInteractionData = materialProperties?.laser_material_interaction || {};
  
  // If no laser interaction data, don't render
  if (!laserInteractionData || Object.keys(laserInteractionData).length === 0) {
    return null;
  }

  // Prepare metadata for PropertyBars (expects specific structure)
  const metadata = {
    slug: slug || '',
    category: category || '',
    subcategory: subcategory || '',
    title: materialName,
    description: '',
    materialProperties: {
      laser_material_interaction: laserInteractionData
    }
  };

  // Generate settings URL if we have the required info
  const settingsUrl = (category && subcategory && slug)
    ? `/settings/${category}/${subcategory}/${slug.replace('-laser-cleaning', '')}-settings`
    : undefined;

  return (
    <SectionContainer
      title="Laser-Material Interaction"
      icon={<Zap className="w-5 h-5 text-muted" />}
      actionText={settingsUrl ? "Settings" : undefined}
      actionUrl={settingsUrl}
      className={`mb-8 ${className}`}
    >
      <PropertyBars
        metadata={metadata}
        dataSource="materialProperties"
      />
    </SectionContainer>
  );
}
