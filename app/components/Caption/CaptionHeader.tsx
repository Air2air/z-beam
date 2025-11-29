// app/components/Caption/CaptionHeader.tsx
"use client";

import { FrontmatterType, ParsedCaptionData } from '@/types';
import React from 'react';
import { CaptionData } from './useCaptionParsing';
import { capitalizeWords, capitalizeFirst } from '../../utils/formatting';
import { Title } from '../Title';

interface CaptionHeaderProps {
  materialName: string;
  frontmatter?: FrontmatterType;
  captionData?: ParsedCaptionData;
}

export function CaptionHeader({ materialName, frontmatter, captionData }: CaptionHeaderProps) {
  const capitalizedMaterial = capitalizeFirst(materialName);
  const materialType = frontmatter?.chemicalProperties?.materialType || 'material';

  return (
    <header className="caption-header mb-4">
      <Title 
        level="card"
        title={`${capitalizedMaterial} Surface Topography`}
        className="caption-heading text-xl mb-2"
        id="surface-analysis-heading"
      />
      <p className="text-tertiary mb-3" itemProp="description">
        Microscopic analysis of {materialType} surface before and after laser cleaning treatment
        {captionData?.laserParams?.wavelength && ` at ${captionData.laserParams.wavelength} nm`}
      </p>
    </header>
  );
}
