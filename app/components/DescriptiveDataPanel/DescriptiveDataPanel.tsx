import React from 'react';
import { SectionContainer } from '@/app/components/SectionContainer/SectionContainer';
import type { RelationshipSection } from '@/types';
import { GRID_GAP_RESPONSIVE } from '@/app/config/site';

interface DescriptiveDataItem {
  [key: string]: string | number | boolean | string[] | null | undefined;
}

interface DescriptiveDataPanelProps {
  items: DescriptiveDataItem[];
  sectionMetadata?: RelationshipSection;
  className?: string;
}

/**
 * DescriptiveDataPanel - Display descriptive/technical data in structured format
 * 
 * Used for relationship fields that contain technical specifications rather than
 * cross-references to other entities. Examples:
 * - exposure_limits (OSHA PEL, TWA values)
 * - ppe_requirements (equipment specifications)
 * - physical_properties (density, melting point, etc.)
 * - visual_characteristics (color, appearance)
 * 
 * NOT for linkage data with `id` fields - use CardGrid for those.
 */
export function DescriptiveDataPanel({ 
  items, 
  sectionMetadata,
  className = '' 
}: DescriptiveDataPanelProps) {
  
  if (!items || items.length === 0) {
    return null;
  }

  const content = (
    <div className={`space-y-4 ${className}`}>
      {items.map((item, index) => (
        <div 
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
        >
          <dl className={`grid grid-cols-1 md:grid-cols-2 ${GRID_GAP_RESPONSIVE}`}>
            {Object.entries(item).map(([key, value]) => {
              // Skip internal fields or null values
              if (key.startsWith('_') || value === null || value === undefined) {
                return null;
              }

              const displayKey = key
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

              return (
                <div key={key} className="flex flex-col">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {displayKey}
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">
                    {Array.isArray(value) ? (
                      <ul className="list-disc list-inside space-y-1">
                        {value.map((item, i) => (
                          <li key={i}>{String(item)}</li>
                        ))}
                      </ul>
                    ) : typeof value === 'object' ? (
                      <div className="space-y-2 mt-1">
                        {Object.entries(value as Record<string, any>).map(([nestedKey, nestedValue]) => (
                          <div key={nestedKey} className="pl-3 border-l-2 border-gray-300 dark:border-gray-600">
                            <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                              {nestedKey.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </div>
                            {typeof nestedValue === 'object' && nestedValue !== null ? (
                              <div className="space-y-1">
                                {Object.entries(nestedValue).map(([k, v]) => (
                                  <div key={k} className="text-xs">
                                    <span className="font-medium text-gray-500 dark:text-gray-400">{k}:</span>{' '}
                                    <span>{String(v)}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs">{String(nestedValue)}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="font-medium">{String(value)}</span>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      ))}
    </div>
  );

  // If section metadata provided, wrap in SectionContainer
  if (sectionMetadata) {
    return (
      <SectionContainer
        title={sectionMetadata.sectionTitle}
        description={sectionMetadata.sectionDescription}
        variant={sectionMetadata.variant as 'default' | 'dark' | undefined}
        className="mb-8"
      >
        {content}
      </SectionContainer>
    );
  }

  // Return unwrapped content
  return content;
}

export default DescriptiveDataPanel;
