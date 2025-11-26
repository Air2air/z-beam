'use client';

// app/components/Table/SmartTable.tsx
import React, { useState } from 'react';
import { TableProps, SmartTableData, SmartField, TableSection, DisplayMode } from '@/types';
import { SectionTitle } from '../SectionTitle/SectionTitle';

/**
 * Enhanced Smart Table component with intelligent frontmatter organization
 */
export function SmartTable({ content, config, frontmatterData }: TableProps & { frontmatterData?: SmartTableData }) {
  if (!frontmatterData && !content) return null;
  
  const {
    showHeader = true,
    className = '',
    caption: rawCaption,
    variant = 'default',
    includedFields,
    excludedFields,
    tableType = 'auto'
  } = config || {};

  // Handle caption - extract string if it's an object with {before, after}
  const caption = typeof rawCaption === 'object' && rawCaption !== null && 'before' in (rawCaption as any)
    ? (rawCaption as any).before
    : rawCaption;

  // Enhanced display mode with hybrid option
  const displayMode: DisplayMode = (config as any)?.displayMode || 'content';

  // Enhanced field categorization with stricter boundaries
  const getFieldCategory = (key: string): SmartField['category'] => {
    // Core identity fields - appear in all modes
    const identityFields = ['name', 'category', 'subcategory', 'chemicalSymbol', 'chemicalFormula', 'atomicNumber'];
    
    // Content-specific fields - educational and descriptive
    const contentFields = ['title', 'subtitle', 'description', 'excerpt', 'keywords', 'targetAudience', 'articleType', 'applications', 'safety_considerations', 'environmental_impact', 'environmentalImpact', 'materialCharacteristics'];
    
    // Technical-specific fields - specifications and measurements
    const technicalFields = ['materialProperties', 'machineSettings', 'density', 'thermalConductivity', 'laserAbsorption', 'powerRange', 'wavelength', 'quality_metrics', 'outcomeMetrics'];
    
    // Reference fields - research and validation (technical mode only)
    const referenceFields = ['research_basis', 'validation_method', 'source', 'confidence', 'references', 'regulatoryStandards'];
    
    if (identityFields.includes(key)) return 'identity';
    if (contentFields.includes(key)) return 'content';
    if (technicalFields.includes(key)) return 'technical';
    if (referenceFields.includes(key)) return 'reference';
    return 'identity'; // Safe default for shared fields
  };

  // Determine which modes a field should appear in
  const getFieldDisplayModes = (category: SmartField['category']): DisplayMode[] => {
    switch (category) {
      case 'identity':
        return ['content', 'technical', 'hybrid'];
      case 'content':
        return ['content', 'hybrid'];
      case 'technical':
        return ['technical', 'hybrid'];
      case 'reference':
        return ['technical']; // Research data only in technical mode
      default:
        return ['hybrid'];
    }
  };

  // Helper functions
  const formatFieldLabel = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ')
      .trim();
  };

  const getFieldType = (value: any): SmartField['type'] => {
    if (Array.isArray(value)) return 'array';
    if (value === null || value === undefined) return 'text';
    if (typeof value === 'object') return 'object';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    return 'text';
  };

  // Helper function to extract nested fields from complex objects
  const extractNestedFields = (obj: any, parentKey: string = '', maxDepth: number = 2, currentDepth: number = 0): SmartField[] => {
    const fields: SmartField[] = [];
    
    if (!obj || typeof obj !== 'object' || currentDepth >= maxDepth) {
      return fields;
    }

    Object.entries(obj).forEach(([key, value]: [string, any]) => {
      const fieldKey = parentKey ? `${parentKey}.${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Handle objects with properties (like materialProperties structure)
        if (value.properties && typeof value.properties === 'object') {
          Object.entries(value.properties).forEach(([propKey, propValue]: [string, any]) => {
            fields.push(categorizeField(`${fieldKey}.${propKey}`, propValue));
          });
        } else if (value.value !== undefined || value.unit || value.confidence) {
          // Handle value objects with metadata
          fields.push(categorizeField(fieldKey, value));
        } else if (currentDepth < maxDepth - 1) {
          // Recursively extract from nested objects
          fields.push(...extractNestedFields(value, fieldKey, maxDepth, currentDepth + 1));
        }
      } else {
        // Handle simple values and arrays
        fields.push(categorizeField(fieldKey, value));
      }
    });
    
    return fields;
  };

  // Smart field categorization and formatting
  const categorizeField = (key: string, value: any): SmartField => {
    const category = getFieldCategory(key);
    const field: SmartField = {
      key,
      label: formatFieldLabel(key),
      value,
      type: getFieldType(value),
      category,
      displayMode: getFieldDisplayModes(category)
    };

    // Add metadata if available
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      field.confidence = value.confidence;
      field.source = value.source || value.research_basis;
      field.unit = value.unit;
      field.description = value.description || value.research_basis;
      field.value = value.value !== undefined ? value.value : value;
    }

    return field;
  };

  // Extract and organize frontmatter data into sections
  const organizeFrontmatterSections = (data: SmartTableData): TableSection[] => {
    const sections: TableSection[] = [];
    
    if (!data) return sections;

    // Core Identity Section - appears in all modes
    const identityFields: SmartField[] = [];
    const identityKeys = ['name', 'material', 'category', 'subcategory', 'chemicalSymbol', 'chemicalFormula', 'atomicNumber'];
    identityKeys.forEach(key => {
      if (data[key] !== undefined) {
        identityFields.push(categorizeField(key, data[key]));
      }
    });

    // Mode-specific sections
    if (displayMode === 'content') {
      // Content-specific sections
      const contentInfoFields: SmartField[] = [];
      const contentKeys = ['title', 'subtitle', 'description', 'excerpt', 'targetAudience', 'articleType'];
      contentKeys.forEach(key => {
        if (data[key] !== undefined) {
          const field = categorizeField(key, data[key]);
          if (field.displayMode?.includes('content')) {
            contentInfoFields.push(field);
          }
        }
      });
      
      if (contentInfoFields.length > 0) {
        sections.push({
          id: 'content-overview',
          title: 'Content Overview',
          description: 'Article and educational content information',
          priority: 2,
          fields: contentInfoFields,
          modes: ['content', 'hybrid']
        });
      }

      // Material Characteristics - Content mode
      if (data.materialCharacteristics) {
        const characteristicFields = extractNestedFields(data.materialCharacteristics, 'materialCharacteristics');
        
        if (characteristicFields.length > 0) {
          sections.push({
            id: 'material-characteristics',
            title: 'Material Characteristics',
            description: 'Physical and structural material characteristics',
            priority: 2.5,
            fields: characteristicFields,
            badge: 'Characteristics',
            modes: ['content', 'hybrid']
          });
        }
      }

      // Applications & Usage - Content mode only
      const applicationFields: SmartField[] = [];
      const appKeys = ['applications', 'compatibility', 'outcomes'];
      appKeys.forEach(key => {
        if (data[key] !== undefined) {
          applicationFields.push(categorizeField(key, data[key]));
        }
      });
      
      if (applicationFields.length > 0) {
        sections.push({
          id: 'applications',
          title: 'Applications & Usage',
          description: 'Practical applications and use cases',
          priority: 3,
          fields: applicationFields,
          modes: ['content', 'hybrid']
        });
      }

      // Environmental Impact - Content mode
      if (data.environmentalImpact || data.environmental_impact) {
        const envData = data.environmentalImpact || data.environmental_impact;
        const envFields: SmartField[] = [];
        
        if (Array.isArray(envData)) {
          envFields.push(categorizeField('environmentalImpact', envData));
        } else if (typeof envData === 'object') {
          envFields.push(...extractNestedFields(envData, 'environmentalImpact'));
        } else {
          envFields.push(categorizeField('environmentalImpact', envData));
        }
        
        if (envFields.length > 0) {
          sections.push({
            id: 'environmental-impact',
            title: 'Environmental Impact',
            description: 'Environmental benefits and sustainability considerations',
            priority: 3.5,
            fields: envFields,
            badge: 'Sustainability',
            modes: ['content', 'hybrid']
          });
        }
      }

      // Safety & Regulatory - Content mode
      const safetyFields: SmartField[] = [];
      const safetyKeys = ['safety_considerations', 'regulatoryStandards'];
      safetyKeys.forEach(key => {
        if (data[key] !== undefined) {
          safetyFields.push(categorizeField(key, data[key]));
        }
      });
      
      if (safetyFields.length > 0) {
        sections.push({
          id: 'safety-regulatory',
          title: 'Safety & Regulatory',
          description: 'Safety guidelines and regulatory compliance',
          priority: 4,
          fields: safetyFields,
          badge: 'Important',
          modes: ['content', 'hybrid']
        });
      }

      // Keywords - Content mode only
      if (data.keywords && Array.isArray(data.keywords) && data.keywords.length > 0) {
        sections.push({
          id: 'keywords',
          title: 'Keywords & Topics',
          description: 'Content classification and search terms',
          priority: 5,
          fields: [categorizeField('keywords', data.keywords)],
          modes: ['content']
        });
      }

    } else if (displayMode === 'technical') {
      // Technical-specific sections
      
      // NEW STRUCTURE: Handle flat properties object (2025-10-22 frontmatter refresh)
      if (data.properties && typeof data.properties === 'object') {
        const materialFields: SmartField[] = [];
        const propEntries = Object.entries(data.properties);
        
        // Check if properties is empty object or has actual data
        if (propEntries.length > 0) {
          propEntries.forEach(([propKey, propValue]: [string, any]) => {
            // Each property has: value, unit, confidence, source, description
            materialFields.push(categorizeField(propKey, propValue));
          });
          
          if (materialFields.length > 0) {
            sections.push({
              id: 'material-properties',
              title: 'Material Properties',
              description: 'Physical, thermal, optical, and mechanical characteristics',
              priority: 2,
              fields: materialFields,
              badge: 'Technical Data',
              modes: ['technical', 'hybrid']
            });
          }
        }
      }
      // LEGACY STRUCTURE: Handle nested materialProperties (backward compatibility)
      else if (data.materialProperties) {
        const materialFields: SmartField[] = [];
        
        // Handle categorized properties
        Object.entries(data.materialProperties).forEach(([categoryKey, categoryData]: [string, any]) => {
          if (categoryData && typeof categoryData === 'object' && categoryData.properties) {
            Object.entries(categoryData.properties).forEach(([propKey, propValue]: [string, any]) => {
              materialFields.push(categorizeField(`${categoryKey}.${propKey}`, propValue));
            });
          }
        });
        
        if (materialFields.length > 0) {
          sections.push({
            id: 'material-properties',
            title: 'Material Properties',
            description: 'Physical, thermal, and mechanical characteristics',
            priority: 2,
            fields: materialFields.slice(0, 12), // Limit for readability
            badge: 'Technical',
            modes: ['technical', 'hybrid']
          });
        }
      }

      // Machine Settings - Technical mode only
      if (data.machineSettings) {
        const machineFields: SmartField[] = [];
        Object.entries(data.machineSettings).forEach(([key, value]: [string, any]) => {
          machineFields.push(categorizeField(key, value));
        });
        
        if (machineFields.length > 0) {
          sections.push({
            id: 'machine-settings',
            title: 'Laser Parameters',
            description: 'Recommended laser processing parameters',
            priority: 3,
            fields: machineFields,
            badge: 'Parameters',
            modes: ['technical']
          });
        }
      }

      // Outcome Metrics - Technical mode
      if (data.outcomeMetrics) {
        const outcomeFields: SmartField[] = [];
        
        if (Array.isArray(data.outcomeMetrics)) {
          data.outcomeMetrics.forEach((metric: any, index: number) => {
            if (typeof metric === 'object') {
              outcomeFields.push(...extractNestedFields(metric, `outcomeMetric${index + 1}`));
            } else {
              outcomeFields.push(categorizeField(`outcomeMetric${index + 1}`, metric));
            }
          });
        } else if (typeof data.outcomeMetrics === 'object') {
          outcomeFields.push(...extractNestedFields(data.outcomeMetrics, 'outcomeMetrics'));
        } else {
          outcomeFields.push(categorizeField('outcomeMetrics', data.outcomeMetrics));
        }
        
        if (outcomeFields.length > 0) {
          sections.push({
            id: 'outcome-metrics',
            title: 'Outcome Metrics',
            description: 'Performance measurements and success criteria',
            priority: 3.5,
            fields: outcomeFields,
            badge: 'Metrics',
            modes: ['technical', 'hybrid']
          });
        }
      }

      // NEW STRUCTURE: Category Info with ranges (for materials without individual properties)
      if (data.category_info && typeof data.category_info === 'object') {
        const categoryInfoFields: SmartField[] = [];
        
        // Add description
        if (data.category_info.description) {
          categoryInfoFields.push(categorizeField('category_description', data.category_info.description));
        }
        
        // Add properties count
        if (data.category_info.properties_count !== undefined) {
          categoryInfoFields.push(categorizeField('properties_count', data.category_info.properties_count));
        }
        
        // Add category ranges as a separate section if they exist
        if (data.category_info.category_ranges && Object.keys(data.category_info.category_ranges).length > 0) {
          const rangeFields: SmartField[] = [];
          Object.entries(data.category_info.category_ranges).forEach(([key, rangeData]: [string, any]) => {
            if (rangeData && typeof rangeData === 'object') {
              const rangeLabel = formatFieldLabel(key);
              const rangeValue = rangeData.min !== undefined && rangeData.max !== undefined
                ? `${rangeData.min} - ${rangeData.max} ${rangeData.unit || ''}`
                : rangeData;
              rangeFields.push(categorizeField(key, {
                value: rangeValue,
                unit: rangeData.unit,
                confidence: rangeData.confidence,
                source: rangeData.source,
                description: rangeData.notes || `Typical ${rangeLabel.toLowerCase()} range for ${data.category} materials`
              }));
            }
          });
          
          if (rangeFields.length > 0) {
            sections.push({
              id: 'category-ranges',
              title: `${data.category ? data.category.charAt(0).toUpperCase() + data.category.slice(1) : 'Category'} Property Ranges`,
              description: 'Typical property ranges for this material category',
              priority: 2.5,
              fields: rangeFields,
              badge: 'Category Data',
              modes: ['technical', 'hybrid']
            });
          }
        }
        
        if (categoryInfoFields.length > 0) {
          sections.push({
            id: 'category-info',
            title: 'Category Information',
            description: 'Material category classification',
            priority: 2.2,
            fields: categoryInfoFields,
            badge: 'Category',
            modes: ['technical', 'hybrid']
          });
        }
      }

      // Research & Validation - Technical mode only
      const researchFields: SmartField[] = [];
      const researchKeys = ['research_basis', 'validation_method', 'source', 'confidence', 'generated_date', 'data_completeness'];
      researchKeys.forEach(key => {
        if (data[key] !== undefined) {
          const field = categorizeField(key, data[key]);
          if (field.displayMode?.includes('technical')) {
            researchFields.push(field);
          }
        }
      });
      
      if (researchFields.length > 0) {
        sections.push({
          id: 'research-validation',
          title: 'Research & Validation',
          description: 'Data sources and validation methodology',
          priority: 4,
          fields: researchFields.slice(0, 8), // Limit duplicates
          badge: 'Research',
          modes: ['technical']
        });
      }
    } else if (displayMode === 'hybrid') {
      // Hybrid mode - intelligent combination
      // Add both content and technical sections but collapsed by default
      // This allows users to expand what they need
      
      // Content overview (collapsed)
      const contentInfoFields: SmartField[] = [];
      // Content Summary section removed - information displayed elsewhere
      
      // Material Characteristics (hybrid)
      if (data.materialCharacteristics) {
        const characteristicFields = extractNestedFields(data.materialCharacteristics, 'materialCharacteristics');
        
        if (characteristicFields.length > 0) {
          sections.push({
            id: 'characteristics-summary',
            title: 'Key Characteristics',
            description: 'Essential material characteristics',
            priority: 2.5,
            fields: characteristicFields.slice(0, 6), // Limit for hybrid view
            badge: 'Characteristics',
            modes: ['hybrid']
          });
        }
      }
      
      // Laser Parameters - High priority for operators
      if (data.machineSettings) {
        const laserFields: SmartField[] = [];
        Object.entries(data.machineSettings).forEach(([key, value]: [string, any]) => {
          laserFields.push(categorizeField(key, value));
        });
        
        if (laserFields.length > 0) {
          sections.push({
            id: 'laser-parameters',
            title: 'Laser Processing Parameters',
            description: 'Optimal settings for laser cleaning operations',
            priority: 2,
            fields: laserFields,
            badge: 'Critical',
            modes: ['hybrid']
          });
        }
      }
      
      // NEW STRUCTURE: Enhanced technical summary with flat properties
      if (data.properties && typeof data.properties === 'object' && Object.keys(data.properties).length > 0) {
        const technicalFields: SmartField[] = [];
        
        Object.entries(data.properties).forEach(([propKey, propValue]: [string, any]) => {
          technicalFields.push(categorizeField(propKey, propValue));
        });
        
        if (technicalFields.length > 0) {
          sections.push({
            id: 'technical-summary',
            title: 'Material Properties',
            description: 'Physical, thermal, optical, and mechanical characteristics',
            priority: 2.5,
            fields: technicalFields.slice(0, 9), // Max 9 for readability in hybrid mode
            badge: 'Technical',
            modes: ['hybrid']
          });
        }
      }
      // LEGACY STRUCTURE: Enhanced technical summary with subcategories
      else if (data.materialProperties) {
        const technicalFields: SmartField[] = [];
        const categorizedProps: { [key: string]: SmartField[] } = {
          physical: [],
          thermal: [],
          optical: [],
          mechanical: []
        };
        
        Object.entries(data.materialProperties).forEach(([categoryKey, categoryData]: [string, any]) => {
          if (categoryData && typeof categoryData === 'object' && categoryData.properties) {
            // Categorize properties for better organization
            Object.entries(categoryData.properties).forEach(([propKey, propValue]: [string, any]) => {
              const field = categorizeField(`${categoryKey}.${propKey}`, propValue);
              technicalFields.push(field);
              
              // Categorize by property type
              if (['density', 'hardness', 'porosity'].includes(propKey)) {
                categorizedProps.physical.push(field);
              } else if (['thermalConductivity', 'specificHeat', 'thermalExpansion', 'thermalDestruction'].includes(propKey)) {
                categorizedProps.thermal.push(field);
              } else if (['laserAbsorption', 'laserReflectivity'].includes(propKey)) {
                categorizedProps.optical.push(field);
              } else if (['tensileStrength', 'compressiveStrength', 'flexuralStrength', 'fractureToughness'].includes(propKey)) {
                categorizedProps.mechanical.push(field);
              }
            });
          }
        });
        
        if (technicalFields.length > 0) {
          sections.push({
            id: 'technical-summary',
            title: 'Material Properties',
            description: 'Physical, thermal, optical, and mechanical characteristics',
            priority: 2.5,
            fields: technicalFields.slice(0, 9), // Max 9 for readability
            badge: 'Technical',
            modes: ['hybrid']
          });
        }
      }
      
      // NEW STRUCTURE: Category ranges for hybrid mode (if no individual properties)
      if (data.category_info?.category_ranges && Object.keys(data.category_info.category_ranges).length > 0) {
        const rangeFields: SmartField[] = [];
        Object.entries(data.category_info.category_ranges).slice(0, 6).forEach(([key, rangeData]: [string, any]) => {
          if (rangeData && typeof rangeData === 'object') {
            const rangeLabel = formatFieldLabel(key);
            const rangeValue = rangeData.min !== undefined && rangeData.max !== undefined
              ? `${rangeData.min} - ${rangeData.max} ${rangeData.unit || ''}`
              : rangeData;
            rangeFields.push(categorizeField(key, {
              value: rangeValue,
              unit: rangeData.unit,
              description: `Typical ${rangeLabel.toLowerCase()} range`
            }));
          }
        });
        
        if (rangeFields.length > 0) {
          sections.push({
            id: 'category-ranges-hybrid',
            title: 'Typical Property Ranges',
            description: `Standard ranges for ${data.category} materials`,
            priority: 2.6,
            fields: rangeFields,
            badge: 'Reference',
            modes: ['hybrid']
          });
        }
      }
      
      // Enhanced Process Outcomes (hybrid)
      if (data.outcomeMetrics) {
        const outcomeFields: SmartField[] = [];
        
        if (Array.isArray(data.outcomeMetrics)) {
          outcomeFields.push(categorizeField('Process Results', data.outcomeMetrics.slice(0, 5))); // Top 5 outcomes
        } else if (typeof data.outcomeMetrics === 'object') {
          const nestedOutcomes = extractNestedFields(data.outcomeMetrics, 'outcomeMetrics');
          outcomeFields.push(...nestedOutcomes.slice(0, 5));
        }
        
        if (outcomeFields.length > 0) {
          sections.push({
            id: 'process-outcomes',
            title: 'Process Outcomes',
            description: 'Expected results and performance metrics',
            priority: 3,
            fields: outcomeFields,
            badge: 'Results',
            modes: ['hybrid']
          });
        }
      }
      
      // Environmental & Regulatory Summary (hybrid)
      const hybridEnvFields: SmartField[] = [];
      if (data.environmentalImpact || data.environmental_impact) {
        const envData = data.environmentalImpact || data.environmental_impact;
        if (Array.isArray(envData) && envData.length > 0) {
          hybridEnvFields.push(categorizeField('environmentalImpact', envData.slice(0, 3))); // Top 3 impacts
        }
      }
      if (data.regulatoryStandards && Array.isArray(data.regulatoryStandards)) {
        hybridEnvFields.push(categorizeField('regulatoryStandards', data.regulatoryStandards.slice(0, 3))); // Top 3 standards
      }
      
      if (hybridEnvFields.length > 0) {
        sections.push({
          id: 'environment-regulatory-summary',
          title: 'Environment & Compliance',
          description: 'Key environmental and regulatory information',
          priority: 4,
          fields: hybridEnvFields,
          badge: 'Compliance',
          modes: ['hybrid']
        });
      }
    }

    return sections
      .filter(section => section.modes.includes(displayMode))
      .sort((a, b) => a.priority - b.priority);
  };

  // Render individual section
  const renderSection = (section: TableSection) => {
    return (
      <div 
        key={section.id}
        className="bg-tertiary rounded-lg shadow-sm border overflow-hidden"
      >
        {/* Section Header */}
        <div 
          className="px-4 py-3 bg-secondary border-b"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm text-secondary font-semibold">
                {section.title}
              </h3>
              {section.badge && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-200">
                  {section.badge}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted">
                {section.fields.length} {section.fields.length === 1 ? 'field' : 'fields'}
              </span>
            </div>
          </div>
          {section.description && (
            <p className="text-xs text-muted mt-1">
              {section.description}
            </p>
          )}
        </div>

        {/* Section Content */}
        <div className="p-4">
          <div className="space-y-3">
            {section.fields.map(field => renderField(field))}
          </div>
        </div>
      </div>
    );
  };

  // Render individual field
  const renderField = (field: SmartField) => {
    const renderValue = (value: any) => {
      if (value === null || value === undefined) {
        return <span className="text-tertiary italic">Not specified</span>;
      }

      if (Array.isArray(value)) {
        // Enhanced handling for outcomeMetrics array with better visual organization
        if (value.length > 0 && value[0] && typeof value[0] === 'object' && 'metric' in value[0]) {
          return (
            <div className="space-y-3">
              {value.map((metric: any, index: number) => (
                <div key={index} className="bg-blue-900/20 p-3 rounded-lg border border-blue-200800 hover:shadow-sm transition-shadow">
                  <div className="font-medium text-blue-900100 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    {metric.metric}
                  </div>
                  {metric.description && (
                    <p className="text-sm mb-2">
                      {metric.description}
                    </p>
                  )}
                  {metric.typicalRanges && (
                    <div className="text-xs text-muted mb-2">
                      <strong>Range:</strong> {metric.typicalRanges}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    {metric.units && metric.units.length > 0 && (
                      <div>
                        <strong className="text-secondary">Units:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {metric.units.map((unit: string, i: number) => (
                            <span key={i} className="bg-primary px-1.5 py-0.5 rounded text-xs">
                              {unit}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {metric.measurementMethods && metric.measurementMethods.length > 0 && (
                      <div>
                        <strong className="text-secondary">Methods:</strong>
                        <div className="mt-1">
                          {metric.measurementMethods.map((method: string, i: number) => (
                            <div key={i} className="text-muted">• {method}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    {metric.factorsAffecting && metric.factorsAffecting.length > 0 && (
                      <div>
                        <strong className="text-secondary">Factors:</strong>
                        <div className="mt-1">
                          {metric.factorsAffecting.map((factor: string, i: number) => (
                            <div key={i} className="text-muted">• {factor}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        }
        
        // Enhanced array formatting for environmental benefits and compliance
        if (value.some((item: any) => typeof item === 'object' && (item.benefit || item.name))) {
          return (
            <div className="space-y-2">
              {value.map((item: any, index: number) => {
                const title = item.benefit || item.name || item.title;
                if (!title) return null;
                
                return (
                  <div key={index} className="bg-green-900/20 p-2 rounded border border-green-200800">
                    <div className="font-medium text-green-900100 text-sm flex items-center gap-1">
                      <span className="text-green-600">🌱</span>
                      {title}
                    </div>
                    {item.description && (
                      <p className="text-xs text-green-700300 mt-1">
                        {item.description}
                      </p>
                    )}
                    {item.quantifiedBenefits && (
                      <p className="text-xs font-medium text-green-800200 mt-1">
                        📊 {item.quantifiedBenefits}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          );
        }
        
        // Default array handling for non-outcomeMetrics arrays
        return (
          <div className="flex flex-wrap gap-1">
            {value.map((item, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-muted hover:bg-gray-200:bg-tertiary transition-colors"
              >
                {typeof item === 'object' ? JSON.stringify(item) : String(item)}
              </span>
            ))}
          </div>
        );
      }

      if (typeof value === 'object') {
        // Special handling for single outcome metric objects
        if (value && 'metric' in value) {
          return (
            <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-200800">
              <div className="font-medium text-blue-900100 mb-2">
                {value.metric}
              </div>
              {value.description && (
                <p className="text-sm mb-2">
                  {value.description}
                </p>
              )}
              {value.typicalRanges && (
                <div className="text-xs text-muted">
                  <strong>Range:</strong> {value.typicalRanges}
                </div>
              )}
            </div>
          );
        }
        
        // Default object handling
        return (
          <div className="text-sm font-mono bg-secondary p-2 rounded border">
            <pre className="whitespace-pre-wrap text-xs">
              {JSON.stringify(value, null, 2)}
            </pre>
          </div>
        );
      }

      if (typeof value === 'boolean') {
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            value 
              ? 'bg-green-900 text-green-200' 
              : 'bg-red-900 text-red-200'
          }`}>
            {value ? 'Yes' : 'No'}
          </span>
        );
      }

      return <span className="text-primary">{String(value)}</span>;
    };

    return (
      <div key={field.key} className="flex items-start justify-between py-2 border-b last:border-b-0">
        <div className="flex-1 min-w-0 mr-4">
          <div className="flex items-center space-x-2">
            <dt className="text-sm font-medium text-muted">
              {field.label}
            </dt>
            {field.unit && (
              <span className="text-xs text-muted">
                ({field.unit})
              </span>
            )}
            {field.confidence && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-16 h-2 bg-primary rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 rounded-full ${
                        field.confidence >= 0.95 ? 'bg-green-500' :
                        field.confidence >= 0.90 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${field.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                    field.confidence >= 0.95 ? 'bg-green-900 text-green-200' :
                    field.confidence >= 0.90 ? 'bg-yellow-900 text-yellow-200' :
                    'bg-red-900 text-red-200'
                  }`}>
                    {Math.round(field.confidence * 100)}% confidence
                  </span>
                </div>
              </div>
            )}
          </div>
          {field.description && (
            <p className="text-xs text-muted mt-1">
              {field.description}
            </p>
          )}
        </div>
        <dd className="text-sm text-right max-w-xs">
          {renderValue(field.value)}
        </dd>
      </div>
    );
  };

  // Simple table renderer - flatten all fields into key-value pairs
  const renderSimpleTable = (data: SmartTableData, sectionTitle?: string) => {
    if (!data || Object.keys(data).length === 0) {
      return (
        <div className="enhanced-table-container">
          {sectionTitle && (
            <SectionTitle title={sectionTitle} className="mb-4" />
          )}
          <div className="bg-tertiary rounded-lg shadow-sm border p-6">
            <p className="text-muted text-center">
              No table data available
            </p>
          </div>
        </div>
      );
    }

    // Flatten all nested objects into simple key-value pairs
    const flattenObject = (obj: any, prefix: string = ''): Array<{key: string, label: string, value: any}> => {
      const result: Array<{key: string, label: string, value: any}> = [];
      
      Object.entries(obj).forEach(([key, value]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        // Skip certain metadata fields
        if (['slug', 'keywords', 'content'].includes(key)) {
          return;
        }
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          // Recursively flatten nested objects
          result.push(...flattenObject(value, fullKey));
        } else if (value !== null && value !== undefined) {
          // Add simple values
          result.push({
            key: fullKey,
            label: formatFieldLabel(key),
            value: value
          });
        }
      });
      
      return result;
    };

    const rows = flattenObject(data);

    return (
      <div className="enhanced-table-container">
        {sectionTitle && (
          <SectionTitle title={sectionTitle} className="mb-4" />
        )}
        
        <div className="bg-tertiary rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200700">
              {rows.map((row, index) => (
                <tr key={row.key} className={index % 2 === 0 ? 'bg-tertiary' : 'bg-secondary'}>
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                    {row.label}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {Array.isArray(row.value) ? row.value.join(', ') : String(row.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Main component render
  try {
    // Handle frontmatter data if available
    if (frontmatterData && Object.keys(frontmatterData).length > 0) {
      return renderSimpleTable(frontmatterData, caption);
    }

    // Fallback to basic table rendering
    return (
      <div className={`enhanced-table-container ${className}`}>
        {showHeader && caption && (
          <SectionTitle title={caption} className="mb-4" />
        )}
        <div className="bg-tertiary rounded-lg shadow-sm border p-6">
          <p className="text-muted text-center">
            No table data available
          </p>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering Smart Table:', error);
    return (
      <div className={`enhanced-table-container ${className}`}>
        <div className="bg-red-900/20 border border-red-200800 rounded-lg p-4">
          <p className="text-red-800200 text-sm">
            Error rendering table data. Please check the console for details.
          </p>
        </div>
      </div>
    );
  }
}