'use client';

// app/components/Table/SmartTable.tsx
import React, { useState } from 'react';
import { TableProps, SmartTableData, SmartField, TableSection, DisplayMode } from '@/types';
import { SectionTitle } from '../SectionTitle/SectionTitle';
import './styles.css';

/**
 * Enhanced Smart Table component with intelligent frontmatter organization
 */
export function SmartTable({ content, config, frontmatterData }: TableProps & { frontmatterData?: SmartTableData }) {
  if (!frontmatterData && !content) return null;
  
  const {
    showHeader = true,
    className = '',
    caption,
    variant = 'default',
    includedFields,
    excludedFields,
    tableType = 'auto'
  } = config || {};

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
    const identityKeys = ['name', 'category', 'subcategory', 'chemicalSymbol', 'chemicalFormula', 'atomicNumber'];
    identityKeys.forEach(key => {
      if (data[key] !== undefined) {
        identityFields.push(categorizeField(key, data[key]));
      }
    });
    
    if (identityFields.length > 0) {
      sections.push({
        id: 'core-identity',
        title: 'Material Identity',
        description: 'Core material identification and classification',
        priority: 1,
        fields: identityFields,
        badge: 'Essential',
        modes: ['content', 'technical', 'hybrid']
      });
    }

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
      if (data.materialProperties) {
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

      // Research & Validation - Technical mode only
      const researchFields: SmartField[] = [];
      const researchKeys = ['research_basis', 'validation_method', 'source', 'confidence', 'description'];
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
      ['title', 'description', 'applications'].forEach(key => {
        if (data[key] !== undefined) {
          contentInfoFields.push(categorizeField(key, data[key]));
        }
      });
      
      if (contentInfoFields.length > 0) {
        sections.push({
          id: 'content-summary',
          title: 'Content Summary',
          description: 'Key content information',
          priority: 2,
          fields: contentInfoFields,
          modes: ['hybrid']
        });
      }
      
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
      
      // Technical summary (expanded)
      if (data.materialProperties) {
        const technicalFields: SmartField[] = [];
        
        Object.entries(data.materialProperties).forEach(([categoryKey, categoryData]: [string, any]) => {
          if (categoryData && typeof categoryData === 'object' && categoryData.properties) {
            // Take top 3 properties from each category
            const props = Object.entries(categoryData.properties).slice(0, 3);
            props.forEach(([propKey, propValue]: [string, any]) => {
              technicalFields.push(categorizeField(`${categoryKey}.${propKey}`, propValue));
            });
          }
        });
        
        if (technicalFields.length > 0) {
          sections.push({
            id: 'technical-summary',
            title: 'Key Properties',
            description: 'Essential technical characteristics',
            priority: 3,
            fields: technicalFields.slice(0, 9), // Max 9 for readability
            badge: 'Technical',
            modes: ['hybrid']
          });
        }
      }
      
      // Outcome Metrics Summary (hybrid)
      if (data.outcomeMetrics) {
        const outcomeFields: SmartField[] = [];
        
        if (Array.isArray(data.outcomeMetrics)) {
          outcomeFields.push(categorizeField('outcomeMetrics', data.outcomeMetrics.slice(0, 3))); // Top 3 outcomes
        } else if (typeof data.outcomeMetrics === 'object') {
          const nestedOutcomes = extractNestedFields(data.outcomeMetrics, 'outcomeMetrics');
          outcomeFields.push(...nestedOutcomes.slice(0, 3));
        }
        
        if (outcomeFields.length > 0) {
          sections.push({
            id: 'outcomes-summary',
            title: 'Key Outcomes',
            description: 'Primary performance metrics',
            priority: 3.5,
            fields: outcomeFields,
            badge: 'Metrics',
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
        className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        {/* Section Header */}
        <div 
          className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {section.title}
              </h3>
              {section.badge && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {section.badge}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {section.fields.length} {section.fields.length === 1 ? 'field' : 'fields'}
              </span>
            </div>
          </div>
          {section.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
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
        return <span className="text-gray-400 italic">Not specified</span>;
      }

      if (Array.isArray(value)) {
        // Special handling for outcomeMetrics array
        if (value.length > 0 && value[0] && typeof value[0] === 'object' && 'metric' in value[0]) {
          return (
            <div className="space-y-3">
              {value.map((metric: any, index: number) => (
                <div key={index} className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    {metric.metric}
                  </div>
                  {metric.description && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {metric.description}
                    </p>
                  )}
                  {metric.typicalRanges && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      <strong>Range:</strong> {metric.typicalRanges}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    {metric.units && metric.units.length > 0 && (
                      <div>
                        <strong className="text-gray-700 dark:text-gray-300">Units:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {metric.units.map((unit: string, i: number) => (
                            <span key={i} className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">
                              {unit}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {metric.measurementMethods && metric.measurementMethods.length > 0 && (
                      <div>
                        <strong className="text-gray-700 dark:text-gray-300">Methods:</strong>
                        <div className="mt-1">
                          {metric.measurementMethods.map((method: string, i: number) => (
                            <div key={i} className="text-gray-600 dark:text-gray-400">• {method}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    {metric.factorsAffecting && metric.factorsAffecting.length > 0 && (
                      <div>
                        <strong className="text-gray-700 dark:text-gray-300">Factors:</strong>
                        <div className="mt-1">
                          {metric.factorsAffecting.map((factor: string, i: number) => (
                            <div key={i} className="text-gray-600 dark:text-gray-400">• {factor}</div>
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
        
        // Default array handling for non-outcomeMetrics arrays
        return (
          <div className="flex flex-wrap gap-1">
            {value.map((item, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
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
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                {value.metric}
              </div>
              {value.description && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {value.description}
                </p>
              )}
              {value.typicalRanges && (
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <strong>Range:</strong> {value.typicalRanges}
                </div>
              )}
            </div>
          );
        }
        
        // Default object handling
        return (
          <div className="text-sm font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded border">
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
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {value ? 'Yes' : 'No'}
          </span>
        );
      }

      return <span className="text-gray-900 dark:text-gray-100">{String(value)}</span>;
    };

    return (
      <div key={field.key} className="flex items-start justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
        <div className="flex-1 min-w-0 mr-4">
          <div className="flex items-center space-x-2">
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {field.label}
            </dt>
            {field.unit && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({field.unit})
              </span>
            )}
            {field.confidence && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                {Math.round(field.confidence * 100)}% confidence
              </span>
            )}
          </div>
          {field.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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

  // Main render logic
  const renderSmartFrontmatterTable = (data: SmartTableData, sectionTitle?: string) => {
    const sections = organizeFrontmatterSections(data);
    
    if (sections.length === 0) {
      return (
        <div className="enhanced-table-container">
          {sectionTitle && (
            <SectionTitle title={`${sectionTitle} - Properties`} className="mb-4" />
          )}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-gray-500 dark:text-gray-400 text-center">
              No displayable {displayMode} data available
            </p>
          </div>
        </div>
      );
    }

    const getModeTitle = () => {
      switch (displayMode) {
        case 'content': return 'Content Overview';
        case 'technical': return 'Technical Specifications';
        case 'hybrid': return 'Comprehensive Overview';
        default: return 'Properties';
      }
    };

    return (
      <div className="enhanced-table-container">
        {sectionTitle && (
          <SectionTitle 
            title={`${sectionTitle} - ${getModeTitle()}`} 
            className="mb-4" 
          />
        )}
        
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Viewing: <span className="font-medium capitalize">{displayMode} Mode</span>
            {displayMode === 'hybrid' && (
              <span className="ml-2 text-xs text-gray-500">• Expandable sections</span>
            )}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {sections.length} {sections.length === 1 ? 'section' : 'sections'}
          </div>
        </div>
        
        <div className="space-y-4">
          {sections.map(section => renderSection(section))}
        </div>
      </div>
    );
  };

  // Main component render
  try {
    // Handle frontmatter data if available
    if (frontmatterData && Object.keys(frontmatterData).length > 0) {
      return renderSmartFrontmatterTable(frontmatterData, caption);
    }

    // Fallback to basic table rendering
    return (
      <div className={`enhanced-table-container ${className}`}>
        {showHeader && caption && (
          <SectionTitle title={caption} className="mb-4" />
        )}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-gray-500 dark:text-gray-400 text-center">
            No table data available
          </p>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering Smart Table:', error);
    return (
      <div className={`enhanced-table-container ${className}`}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">
            Error rendering table data. Please check the console for details.
          </p>
        </div>
      </div>
    );
  }
}