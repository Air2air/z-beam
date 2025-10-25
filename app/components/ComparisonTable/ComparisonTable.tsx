'use client';

import React from 'react';
import { SectionTitle } from '../SectionTitle/SectionTitle';

interface ComparisonTableProps {
  title?: string;
  caption?: string;
  model1Data: any;
  model2Data: any;
  model1Name?: string;
  model2Name?: string;
}

/**
 * ComparisonTable component - displays two models side-by-side for comparison
 */
export function ComparisonTable({ 
  title, 
  caption, 
  model1Data, 
  model2Data,
  model1Name = 'Model 1',
  model2Name = 'Model 2'
}: ComparisonTableProps) {
  if (!model1Data || !model2Data) {
    return null;
  }

  const formatFieldLabel = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ')
      .trim();
  };

  // Flatten nested objects and collect all unique keys
  const flattenObject = (obj: any, prefix: string = ''): Map<string, any> => {
    const result = new Map<string, any>();
    
    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      // Skip certain metadata fields
      if (['slug', 'keywords', 'content', 'name', 'category', 'subcategory', 'description'].includes(key)) {
        return;
      }
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Recursively flatten nested objects
        const nested = flattenObject(value, fullKey);
        nested.forEach((v, k) => result.set(k, v));
      } else if (value !== null && value !== undefined) {
        // Add simple values
        result.set(fullKey, value);
      }
    });
    
    return result;
  };

  const model1Flat = flattenObject(model1Data);
  const model2Flat = flattenObject(model2Data);

  // Get all unique keys from both models
  const allKeys = new Set([...model1Flat.keys(), ...model2Flat.keys()]);
  const sortedKeys = Array.from(allKeys).sort();

  // Group keys by section
  const groupKeys = (keys: string[]) => {
    const groups: { [section: string]: string[] } = {
      'Material Properties': [],
      'Machine Settings': [],
      'Other': []
    };

    keys.forEach(key => {
      if (key.startsWith('materialProperties.')) {
        groups['Material Properties'].push(key);
      } else if (key.startsWith('machineSettings.')) {
        groups['Machine Settings'].push(key);
      } else {
        groups['Other'].push(key);
      }
    });

    return groups;
  };

  const groupedKeys = groupKeys(sortedKeys);

  const renderValue = (value: any) => {
    if (value === null || value === undefined) return '—';
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  };

  const renderGroup = (sectionName: string, keys: string[]) => {
    if (keys.length === 0) return null;

    return (
      <React.Fragment key={sectionName}>
        <tr className="bg-gray-100 dark:bg-gray-800">
          <td colSpan={3} className="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
            {sectionName}
          </td>
        </tr>
        {keys.map((key, index) => {
          const label = formatFieldLabel(key.split('.').pop() || key);
          const value1 = model1Flat.get(key);
          const value2 = model2Flat.get(key);
          
          return (
            <tr 
              key={key} 
              className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}
            >
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                {label}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                {renderValue(value1)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                {renderValue(value2)}
              </td>
            </tr>
          );
        })}
      </React.Fragment>
    );
  };

  return (
    <div className="enhanced-table-container">
      {(title || caption) && (
        <SectionTitle title={title || caption || 'Comparison'} className="mb-4" />
      )}
      
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider w-1/3">
                Property
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider w-1/3">
                {model1Name}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider w-1/3">
                {model2Name}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {renderGroup('Material Properties', groupedKeys['Material Properties'])}
            {renderGroup('Machine Settings', groupedKeys['Machine Settings'])}
            {renderGroup('Other', groupedKeys['Other'])}
          </tbody>
        </table>
      </div>
    </div>
  );
}
