// app/components/Micro/TechnicalDetails.tsx
"use client";

import { FrontmatterType } from '@/types';
import { SITE_CONFIG } from '@/config/site';

interface TechnicalDetailsProps {
  laserParams?: {
    wavelength?: number;
    power?: number;
    pulse_duration?: number;
    spot_size?: number;
    frequency?: number;
    energy_density?: number;
  };
  show: boolean;
  frontmatter?: FrontmatterType;
}

export function TechnicalDetails({ laserParams, show, frontmatter }: TechnicalDetailsProps) {
  if (!show || !laserParams) return null;

  return (
    <div 
      className="text-xs text-tertiary border-l-2 pl-3 mt-2"
      itemScope
      itemType={`${SITE_CONFIG.schema.context}/TechnicalSpecification`}
      role="complementary"
      aria-label="Technical laser parameters"
    >
      <div className="mb-1" itemProp="name">Laser Parameters:</div>
      <div className="space-y-1">
        {laserParams.wavelength && (
          <div itemProp="wavelength">
            <span className="text-blue-400">λ:</span> {laserParams.wavelength} nm
          </div>
        )}
        {laserParams.power && (
          <div itemProp="power">
            <span className="text-green-400">P:</span> {laserParams.power} W
          </div>
        )}
        {laserParams.pulse_duration && (
          <div itemProp="pulseDuration">
            <span className="text-yellow-400">τ:</span> {laserParams.pulse_duration} ns
          </div>
        )}
        {laserParams.spot_size && (
          <div itemProp="spotSize">
            <span className="text-purple-400">Ø:</span> {laserParams.spot_size} μm
          </div>
        )}
        {laserParams.frequency && (
          <div itemProp="frequency">
            <span className="text-red-400">f:</span> {laserParams.frequency} Hz
          </div>
        )}
        {laserParams.energy_density && (
          <div itemProp="energyDensity">
            <span className="text-orange-400">E:</span> {laserParams.energy_density} J/cm²
          </div>
        )}
      </div>
      
      {/* Enhanced SEO metadata */}
      <meta itemProp="description" content={`Laser cleaning parameters: wavelength ${laserParams.wavelength}nm, power ${laserParams.power}W`} />
      <meta itemProp="category" content="Laser Processing Equipment" />
      <meta itemProp="applicationArea" content="Surface Cleaning, Materials Processing" />
      {frontmatter?.technicalSpecifications?.material && (
        <meta itemProp="targetMaterial" content={frontmatter.technicalSpecifications.material} />
      )}
    </div>
  );
}
