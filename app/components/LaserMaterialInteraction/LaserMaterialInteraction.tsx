import React from 'react';
import { SectionContainer } from '../SectionContainer/SectionContainer';
import { PropertyBars } from '../PropertyBars/PropertyBars';

interface LaserMaterialInteractionProps {
  materialName: string;
  materialProperties: any;
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
    slug: '',
    title: materialName,
    description: '',
    materialProperties: {
      laser_material_interaction: laserInteractionData
    }
  };

  return (
    <SectionContainer
      title="Laser-Material Interaction"
      className={`mb-8 ${className}`}
    >
      <PropertyBars
        metadata={metadata}
        dataSource="materialProperties"
        showTitle={false}
        searchable
      />
    </SectionContainer>
  );
}
