"use client";

import React, { useState } from 'react';
import { MetricsCard as SingleMetricsCard } from './MetricsCard';
import { ArticleMetadata, PropertyCategory, MetricsCardProps, MetricsGridProps } from '../../../types';
import { getIntelligentSectionHeader } from '../../utils/gridTitleMapping';
import { SectionTitle } from '../SectionTitle/SectionTitle';
import './accessibility.css';

// Category configuration for visual distinction
// Standardized to 3 categories used in frontmatter files
const CATEGORY_CONFIG = {
  material_properties: { icon: '📊', color: '#A8DADC', label: 'Material Properties', order: 1 },
  structural_response: { icon: '⚙️', color: '#4ECDC4', label: 'Structural Response', order: 2 },
  energy_coupling: { icon: '💡', color: '#FFE66D', label: 'Energy Coupling', order: 3 }
} as const;

// Grid layout configurations
const GRID_LAYOUTS = {
  'auto': 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7',
  'grid-2': 'grid-cols-4 sm:grid-cols-5',
  'grid-3': 'grid-cols-4 sm:grid-cols-5 lg:grid-cols-6',
  'grid-4': 'grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7'
} as const;

// Property title mappings for display
const TITLE_MAPPING: Record<string, string> = {
  'thermalConductivity': 'Thermal Conductivity',
  'thermalExpansion': 'Thermal Expansion',
  'thermalDiffusivity': 'Thermal Diffusivity',
  'thermalDestructionPoint': 'Thermal Destruction Point',
  'thermalDestruction': 'Thermal Destruction',
  'meltingPoint': 'Melting Point',
  'boilingPoint': 'Boiling Point',
  'specificHeat': 'Specific Heat',
  'tensileStrength': 'Tensile Strength',
  'youngsModulus': 'Youngs Modulus',
  'compressiveStrength': 'Compressive Strength',
  'flexuralStrength': 'Flexural Strength',
  'laserAbsorption': 'Laser Absorption',
  'laserReflectivity': 'Laser Reflectivity',
  'ablationThreshold': 'Ablation Threshold',
  'laserDamageThreshold': 'Laser Damage Threshold',
  'absorptionCoefficient': 'Absorption Coefficient',
  'refractiveIndex': 'Refractive Index',
  'crystallineStructure': 'Crystalline Structure',
  'oxidationResistance': 'Oxidation Resistance',
  'chemicalStability': 'Chemical Stability',
  'electricalConductivity': 'Electrical Conductivity',
  'electricalResistivity': 'Electrical Resistivity',
  'dielectricConstant': 'Dielectric Constant',
  'surfaceRoughness': 'Surface Roughness',
  'surfaceEnergy': 'Surface Energy',
  'moistureContent': 'Moisture Content',
  'waterSolubility': 'Water Solubility',
  'weatherResistance': 'Weather Resistance',
  'celluloseContent': 'Cellulose Content',
  'grainSize': 'Grain Size',
  'reflectivity': 'Reflectivity',
  // Machine Settings fields
  'laserType': 'Laser Type',
  'fluenceThreshold': 'Fluence Threshold',
  'laserWavelength': 'Laser Wavelength',
  'pulseWidth': 'Pulse Width',
  'repetitionRate': 'Repetition Rate',
  'scanSpeed': 'Scan Speed',
  'spotSize': 'Spot Size',
  'fluence': 'Fluence',
  'powerDensity': 'Power Density'
};

// Complex property nested key mappings
const NESTED_KEY_LABELS: Record<string, string> = {
  'at_1064nm': '@ 1064nm',
  'at_532nm': '@ 532nm',
  'at_355nm': '@ 355nm',
  'at_10640nm': '@ 10.6μm',
  'nanosecond': '(ns)',
  'picosecond': '(ps)',
  'femtosecond': '(fs)',
  'point': ''
};

// Helper: Check if property is a complex nested structure
function isComplexProperty(propertyValue: any): boolean {
  // Complex if it has nested objects but no top-level 'value'
  if (!propertyValue.value && typeof propertyValue === 'object') {
    // Check if it has nested properties with value/min/max
    const nestedKeys = Object.keys(propertyValue).filter(key => 
      !['source', 'confidence', 'measurement_context', 'notes', 'type'].includes(key)
    );
    
    return nestedKeys.some(key => {
      const nested = propertyValue[key];
      return typeof nested === 'object' && 
             (nested.value !== undefined || 
              nested.min !== undefined || 
              nested.max !== undefined);
    });
  }
  return false;
}

// Helper: Extract cards from complex nested property
function extractComplexPropertyCards(
  propertyName: string,
  propertyValue: any,
  categoryColor: string,
  categoryId: string,
  categoryLabel: string
): MetricsCardProps[] {
  const cards: MetricsCardProps[] = [];
  const baseTitle = TITLE_MAPPING[propertyName] || 
    propertyName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  
  // Get metadata fields
  const confidence = propertyValue.confidence;
  const source = propertyValue.source;
  
  // Process each nested property
  Object.entries(propertyValue).forEach(([nestedKey, nestedValue]: [string, any]) => {
    // Skip metadata fields
    if (['source', 'confidence', 'measurement_context', 'notes', 'type'].includes(nestedKey)) {
      return;
    }
    
    if (!nestedValue || typeof nestedValue !== 'object') return;
    
    // Extract value from nested structure
    let displayValue: number | string;
    let unit = nestedValue.unit || '';
    let min = nestedValue.min;
    let max = nestedValue.max;
    let description = nestedValue.description || '';
    
    // Handle special case: thermalDestruction.point
    if (propertyName === 'thermalDestruction' && nestedKey === 'point') {
      displayValue = nestedValue.value;
      // Add destruction type to description if available
      if (propertyValue.type) {
        description = `Thermal destruction point (${propertyValue.type})`;
      }
    }
    // Calculate midpoint for range-only values
    else if (nestedValue.value !== undefined) {
      displayValue = nestedValue.value;
    } else if (min !== undefined && max !== undefined) {
      displayValue = (parseFloat(String(min)) + parseFloat(String(max))) / 2;
    } else {
      return; // Skip if no valid value
    }
    
    // Format title with nested key label
    const nestedLabel = NESTED_KEY_LABELS[nestedKey] || nestedKey;
    const fullTitle = nestedLabel ? `${baseTitle} ${nestedLabel}` : baseTitle;
    
    // Convert to numeric if possible
    const numericValue = typeof displayValue === 'number' 
      ? displayValue 
      : parseFloat(String(displayValue));
    
    cards.push({
      title: fullTitle,
      value: !isNaN(numericValue) ? numericValue : displayValue,
      unit,
      min,
      max,
      color: categoryColor,
      confidence: nestedValue.confidence || confidence,
      description: description || `${fullTitle} measurement`,
      fullPropertyName: `${propertyName}.${nestedKey}`,
      categoryId,
      categoryLabel
    } as MetricsCardProps);
  });
  
  return cards;
}

// Extract cards from NEW categorized structure
function extractCardsFromCategorizedProperties(
  materialProperties: Record<string, PropertyCategory>,
  categoryFilter?: string[]
): { categoryId: string; category: PropertyCategory; cards: MetricsCardProps[] }[] {
  const categorizedCards: { categoryId: string; category: PropertyCategory; cards: MetricsCardProps[] }[] = [];
  
  // Get category entries and sort by percentage (importance)
  const categoryEntries = Object.entries(materialProperties)
    .filter(([categoryId, category]) => {
      // Validate category structure
      if (!category || typeof category !== 'object') return false;
      if (!('label' in category) || !('properties' in category)) return false;
      
      // Apply category filter if provided
      if (categoryFilter && categoryFilter.length > 0) {
        return categoryFilter.includes(categoryId);
      }
      
      return true;
    })
    .sort(([, a], [, b]) => (b.percentage || 0) - (a.percentage || 0));
  
  // Extract cards for each category
  categoryEntries.forEach(([categoryId, category]) => {
    const cards: MetricsCardProps[] = [];
    const categoryConfig = CATEGORY_CONFIG[categoryId as keyof typeof CATEGORY_CONFIG];
    const categoryColor = categoryConfig?.color || '#6B7280';
    
    // Extract cards from properties with category color
    Object.entries(category.properties).forEach(([propertyName, propertyValue]) => {
      if (!propertyValue || typeof propertyValue !== 'object') return;
      
      // Check if this is a complex nested property
      if (isComplexProperty(propertyValue)) {
        const complexCards = extractComplexPropertyCards(
          propertyName,
          propertyValue,
          categoryColor,
          categoryId,
          category.label
        );
        cards.push(...complexCards);
        return;
      }
      
      // Handle simple properties (original logic)
      // Skip if value is null/undefined
      if (propertyValue.value === null || propertyValue.value === undefined) return;
      
      // Format title using mapping or convert camelCase
      const title = TITLE_MAPPING[propertyName] || 
        propertyName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      
      // Extract numeric value
      const numericValue = typeof propertyValue.value === 'number' 
        ? propertyValue.value 
        : parseFloat(String(propertyValue.value));
      
      cards.push({
        title,
        value: !isNaN(numericValue) ? numericValue : propertyValue.value,
        unit: propertyValue.unit || '',
        min: propertyValue.min,
        max: propertyValue.max,
        color: categoryColor, // Category color applied to each card
        confidence: propertyValue.confidence,
        description: propertyValue.description,
        fullPropertyName: propertyName,
        categoryId,
        categoryLabel: category.label
      } as MetricsCardProps);
    });
    
    if (cards.length > 0) {
      categorizedCards.push({ categoryId, category, cards });
    }
  });
  
  return categorizedCards;
}

// Extract cards from machine settings (flat structure)
function extractCardsFromMachineSettings(
  machineSettings: Record<string, any>
): MetricsCardProps[] {
  const cards: MetricsCardProps[] = [];
  const defaultColor = '#EF4444';
  
  Object.entries(machineSettings).forEach(([key, value]) => {
    if (!value || typeof value !== 'object') return;
    
    // Skip if no value present
    if (value.value === null || value.value === undefined) return;
    
    // Extract value and unit
    const numericValue = typeof value.value === 'number' 
      ? value.value 
      : parseFloat(String(value.value));
    
    // Format title
    const title = TITLE_MAPPING[key] || 
      key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    
    // Determine final value (keep as string if non-numeric, like laserType)
    const finalValue = !isNaN(numericValue) ? numericValue : value.value;
    
    cards.push({
      title,
      value: finalValue,
      unit: value.unit || '',
      min: value.min,
      max: value.max,
      color: defaultColor,
      confidence: value.confidence,
      description: value.description,
      fullPropertyName: key
    } as MetricsCardProps);
  });
  
  return cards;
}

// Category Header Component
interface CategoryHeaderProps {
  categoryId: string;
  category: PropertyCategory;
  cardCount: number;
}

function CategoryHeader({ categoryId, category, cardCount }: CategoryHeaderProps) {
  const config = CATEGORY_CONFIG[categoryId as keyof typeof CATEGORY_CONFIG];
  
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {category.label}
      </h3>
    </div>
  );
}

// MetricsGrid component - NEW CATEGORIZED VERSION
export function MetricsGrid({
  metadata,
  dataSource = 'machineSettings',
  title,
  description,
  titleFormat = 'default',
  layout = 'auto',
  showTitle = true,
  className = '',
  baseHref,
  searchable = true,
  categoryFilter,
  defaultExpandedCategories = ['thermal', 'mechanical', 'optical_laser']
}: MetricsGridProps) {
  
  // Generate intelligent title
  const displayTitle = titleFormat === 'comparison' && !title
    ? getIntelligentSectionHeader(dataSource, 'comparison', metadata)
    : title;
  
  // Generate unique IDs for accessibility
  const sectionId = `metrics-section-${dataSource}`;
  const titleId = `metrics-title-${dataSource}`;
  
  // Handle material properties with NEW categorized structure
  if (dataSource === 'materialProperties' && metadata.materialProperties) {
    const categorizedData = extractCardsFromCategorizedProperties(
      metadata.materialProperties as Record<string, PropertyCategory>,
      categoryFilter
    );
    
    if (categorizedData.length === 0) {
      return (
        <section 
          id={sectionId}
          className="text-center py-8 text-gray-500 dark:text-gray-400"
          role="status"
          aria-live="polite"
        >
          <p>No material properties available</p>
        </section>
      );
    }
    
    return (
      <section 
        id={sectionId}
        className={`metrics-grid-container ${className}`}
        role="region"
        aria-labelledby={showTitle && displayTitle ? titleId : undefined}
      >
        {/* Header */}
        {showTitle && displayTitle && (
          <div className="mb-6">
            <SectionTitle title={displayTitle} />
          </div>
        )}
        
        {/* Categorized Property Groups */}
        <div className="space-y-8">
          {categorizedData.map(({ categoryId, category, cards }) => {
            return (
              <div key={categoryId} className="category-section">
                <CategoryHeader
                  categoryId={categoryId}
                  category={category}
                  cardCount={cards.length}
                />
                
                <div 
                  className={`grid gap-2 ${GRID_LAYOUTS[layout]}`}
                  role="list"
                  aria-label={`${category.label} properties`}
                >
                  {cards.map((card, index) => (
                    <div 
                      key={`${card.title}-${index}`}
                      role="listitem"
                    >
                      <SingleMetricsCard
                        {...card}
                        searchable={searchable}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }
  
  // Handle machine settings (flat structure)
  if (dataSource === 'machineSettings' && metadata.machineSettings) {
    const cards = extractCardsFromMachineSettings(metadata.machineSettings);
    
    if (cards.length === 0) {
      return (
        <section 
          id={sectionId}
          className="text-center py-8 text-gray-500 dark:text-gray-400"
          role="status"
          aria-live="polite"
        >
          <p>No machine settings available</p>
        </section>
      );
    }
    
    return (
      <section 
        id={sectionId}
        className={`metrics-grid-container ${className}`}
        role="region"
        aria-labelledby={showTitle && displayTitle ? titleId : undefined}
      >
        {/* Header */}
        {showTitle && displayTitle && (
          <div className="mb-6">
            <SectionTitle title={displayTitle} />
          </div>
        )}
        
        {/* Grid */}
        <div 
          className={`grid gap-2 ${GRID_LAYOUTS[layout]}`}
          role="list"
          aria-label={`${displayTitle || 'Machine Settings'} grid containing ${cards.length} settings`}
        >
          {cards.map((card, index) => (
            <div 
              key={`${card.title}-${index}`}
              role="listitem"
            >
              <SingleMetricsCard
                {...card}
                searchable={searchable}
              />
            </div>
          ))}
        </div>
      </section>
    );
  }
  
  // No data available
  return (
    <section 
      id={sectionId}
      className="text-center py-8 text-gray-500 dark:text-gray-400"
      role="status"
      aria-live="polite"
    >
      <p>No data available</p>
    </section>
  );
}
