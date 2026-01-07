// app/components/Micro/MicroHeader.tsx
"use client";

import { FrontmatterType, ParsedMicroData } from '@/types';
import React from 'react';
import { capitalizeFirst } from '../../utils/formatting';
import { SectionTitle } from '../SectionTitle/SectionTitle';
import { Title } from '../Title/Title';

interface MicroHeaderProps {
  materialName: string;
  frontmatter?: FrontmatterType;
  microData?: ParsedMicroData;
}

export function MicroHeader({ materialName, frontmatter, microData }: MicroHeaderProps) {
  const capitalizedMaterial = capitalizeFirst(materialName);
  const materialType = frontmatter?.chemicalProperties?.materialType || 'material';

  return (
    <header className="micro-header mb-4">
      <SectionTitle 
        title={`${capitalizedMaterial} Surface Topography`}
        className="micro-heading mb-2"
        id="surface-analysis-heading"
      />
      <p className="text-sm text-tertiary mb-3" itemProp="description">
        Microscopic analysis of {materialType} surface before and after laser cleaning treatment
        {microData?.laserParams?.wavelength && ` at ${microData.laserParams.wavelength} nm`}
      </p>
    </header>
  );
}
