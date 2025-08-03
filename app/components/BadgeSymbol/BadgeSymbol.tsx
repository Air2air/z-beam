// app/components/BadgeSymbol/BadgeSymbol.tsx
"use client";

import React, { useMemo } from 'react';
import { MaterialType } from '../../types/materials';
import { getMaterialGradient } from '../../utils/materialBadgeUtils';

interface BadgeSymbolProps {
  chemicalSymbol?: string;
  atomicNumber?: number | string;
  chemicalFormula?: string;
  materialType?: string;
  variant?: 'card' | 'large' | 'small';
  color?: string;
}

export function BadgeSymbol({
  chemicalSymbol,
  atomicNumber,
  chemicalFormula,
  materialType,
  variant = 'card',
  color = 'blue'
}: BadgeSymbolProps) {
  // Add debugging to check incoming props
  console.log("BadgeSymbol props:", { 
    chemicalSymbol, atomicNumber, chemicalFormula, materialType, variant, color 
  });
  
  // If no symbol or formula is provided, don't render
  if (!chemicalSymbol && !chemicalFormula) return null;
  
  // Determine what to display - prefer formula for complex compounds
  const displaySymbol = chemicalFormula || chemicalSymbol || '';
  
  // Determine if we have a complex formula that needs special handling
  const isComplexFormula = displaySymbol.length > 2 || /[0-9]/.test(displaySymbol);
  
  // Configure sizes based on variant and complexity
  const sizeConfig = {
    card: {
      container: isComplexFormula ? 'w-14 h-14' : 'w-12 h-12',
      symbol: isComplexFormula ? 'text-lg' : 'text-xl',
      number: 'text-xs',
      type: 'text-[10px]'
    },
    large: {
      container: isComplexFormula ? 'w-20 h-20' : 'w-16 h-16',
      symbol: isComplexFormula ? 'text-xl' : 'text-2xl',
      number: 'text-sm',
      type: 'text-xs'
    },
    small: {
      container: isComplexFormula ? 'w-10 h-10' : 'w-8 h-8',
      symbol: isComplexFormula ? 'text-sm' : 'text-base',
      number: 'text-[8px]',
      type: 'text-[6px]'
    }
  };
  
  // Color configuration
  const colorConfig = {
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    green: 'bg-green-100 text-green-800 border-green-300',
    red: 'bg-red-100 text-red-800 border-red-300',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    purple: 'bg-purple-100 text-purple-800 border-purple-300',
    gray: 'bg-gray-100 text-gray-800 border-gray-300'
  };
  
  const sizes = sizeConfig[variant];
  const colors = colorConfig[color as keyof typeof colorConfig] || colorConfig.blue;
  
  return (
    <div 
      className={`
        ${sizes.container}
        ${colors}
        absolute top-2 right-2
        rounded-md border
        flex flex-col items-center justify-center
        shadow-sm
      `}
    >
      {/* Atomic number if available */}
      {atomicNumber && (
        <span className={`${sizes.number} font-medium`}>
          {atomicNumber}
        </span>
      )}
      
      {/* Symbol or Formula - Use subscripts for numbers in formulas */}
      <span className={`${sizes.symbol} font-bold leading-tight`}>
        {isComplexFormula ? (
          <span dangerouslySetInnerHTML={{ 
            __html: displaySymbol.replace(/([0-9]+)/g, '<sub>$1</sub>') 
          }} />
        ) : (
          displaySymbol
        )}
      </span>
      
      {/* Material type if available */}
      {materialType && (
        <span className={`${sizes.type} font-medium capitalize`}>
          {materialType}
        </span>
      )}
    </div>
  );
}

