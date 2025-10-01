// app/components/Caption/CaptionHeader.tsx
"use client";

import { FrontmatterType, ParsedCaptionData } from '@/types';
import { Header } from '../Header';

interface CaptionHeaderProps {
  materialName: string;
  frontmatter?: FrontmatterType;
  captionData?: ParsedCaptionData;
}

export function CaptionHeader({ materialName, frontmatter, captionData }: CaptionHeaderProps) {
  const capitalizedMaterial = materialName.charAt(0).toUpperCase() + materialName.slice(1).toLowerCase();
  const materialType = frontmatter?.chemicalProperties?.materialType || 'material';

  return (
    <header className="caption-header mb-4">
      <Header 
        level="card"
        title={`${capitalizedMaterial} Surface Topography`}
        className="caption-heading text-xl font-semibold mb-2 text-gray-100"
        id="surface-analysis-heading"
      />
      <p className="text-sm text-gray-400 mb-3" itemProp="description">
        Microscopic analysis of {materialType} surface before and after laser cleaning treatment
        {captionData?.laserParams?.wavelength && ` at ${captionData.laserParams.wavelength} nm`}
      </p>
    </header>
  );
}
