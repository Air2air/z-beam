// app/components/BadgeSymbol/BadgeSymbol.tsx
"use client";

import { useMemo } from 'react';
import { MaterialType } from '../../types/materials';
import { getMaterialGradient } from '../../utils/materialBadgeUtils';

export interface BadgeSymbolProps {
  chemicalSymbol: string;
  atomicNumber?: number;
  chemicalFormula?: string;
  variant?: 'card' | 'inline' | 'featured';
  className?: string;
  materialType?: MaterialType;
  color?: string; // Optional custom color
}

export function BadgeSymbol({
  chemicalSymbol,
  atomicNumber,
  chemicalFormula,
  variant = 'card',
  className = '',
  materialType = 'element',
  color
}: BadgeSymbolProps) {
  // Predefined styles based on common use cases
  const variantStyles = {
    card: 'absolute top-2 right-2 w-8 h-8 text-xs',
    inline: 'inline-flex w-6 h-6 text-xs mr-2',
    featured: 'w-16 h-16 text-base'
  };
  
  // Get the gradient style based on material type
  const gradientStyle = useMemo(() => {
    if (color) {
      // Custom color takes precedence
      return `bg-${color}-500`;
    }
    return getMaterialGradient(materialType);
  }, [materialType, color]);

  // Format chemical formula with subscripts
  const formattedFormula = useMemo(() => {
    if (!chemicalFormula) return null;
    
    // Replace numbers with subscript HTML
    return chemicalFormula.replace(/(\d+)/g, '<sub>$1</sub>');
  }, [chemicalFormula]);
  
  return (
    <div className={`${variantStyles[variant]} ${className}`}>
      <div className={`flex items-center justify-center ${gradientStyle} text-white font-bold rounded-md h-full`}>
        <div className="flex flex-col items-center">
          {/* Display atomic number for elements */}
          {materialType === 'element' && atomicNumber && (
            <span className="text-xs opacity-80">{atomicNumber}</span>
          )}
          
          {/* Display chemical symbol */}
          <span>{chemicalSymbol}</span>
          
          {/* Display chemical formula for compounds */}
          {formattedFormula && ['compound', 'ceramic', 'polymer'].includes(materialType) && (
            <span 
              className="text-xs mt-1" 
              dangerouslySetInnerHTML={{ __html: formattedFormula }}
            />
          )}
        </div>
      </div>
    </div>
  );
}