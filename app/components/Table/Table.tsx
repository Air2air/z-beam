// app/components/Table/Table.tsx
import React from 'react';
import { MarkdownRenderer } from '../Base/MarkdownRenderer';
import './styles.css';

interface TableProps {
  content: string;
  config?: {
    showHeader?: boolean;
    caption?: string;
    className?: string;
    variant?: 'default' | 'sectioned' | 'compact';
  };
}

interface TableRow {
  property: string;
  unit?: string;
  min?: string;
  value: string;
  max?: string;
}

/**
 * Enhanced Table component with visual range indicators for Min/Value/Max relationships
 */
export function Table({ content, config }: TableProps) {
  if (!content) return null;
  
  const {
    showHeader = true,
    className = '',
    caption,
    variant = 'default'
  } = config || {};

  // Function to calculate position percentage for range indicators
  const calculatePosition = (min: string, value: string, max: string): number => {
    const minNum = parseFloat(min.replace(/[^\d.-]/g, ''));
    const valueNum = parseFloat(value.replace(/[^\d.-]/g, ''));
    const maxNum = parseFloat(max.replace(/[^\d.-]/g, ''));
    
    if (isNaN(minNum) || isNaN(valueNum) || isNaN(maxNum) || maxNum === minNum) {
      return 50; // Default to center if calculation fails
    }
    
    const position = ((valueNum - minNum) / (maxNum - minNum)) * 100;
    return Math.max(0, Math.min(100, position));
  };

  // Function to parse value ranges and calculate positions
  const parseValueRange = (value: string, min: string, max: string): { 
    isRange: boolean, 
    startPosition?: number, 
    endPosition?: number, 
    singlePosition?: number 
  } => {
    // Handle ranges like "5-10", "2.5-4.2", "5 - 10"
    const rangeMatch = value.match(/^(\d+\.?\d*)\s*[-–—]\s*(\d+\.?\d*)$/);
    if (rangeMatch) {
      const startValue = rangeMatch[1];
      const endValue = rangeMatch[2];
      
      return {
        isRange: true,
        startPosition: calculatePosition(min, startValue, max),
        endPosition: calculatePosition(min, endValue, max)
      };
    }
    
    // Single value
    return {
      isRange: false,
      singlePosition: calculatePosition(min, value, max)
    };
  };

  // Function to parse markdown table and extract structured data
  const parseMarkdownTable = (tableContent: string): { headers: string[], rows: TableRow[] } | null => {
    const lines = tableContent.trim().split('\n');
    if (lines.length < 3) return null;
    
    const headerLine = lines.find(line => line.includes('|') && !line.includes('---'));
    const separatorIndex = lines.findIndex(line => line.includes('---'));
    
    if (!headerLine || separatorIndex === -1) return null;
    
    const headers = headerLine.split('|').map(h => h.trim()).filter(h => h);
    const dataLines = lines.slice(separatorIndex + 1).filter(line => line.includes('|'));
    
    const rows: TableRow[] = dataLines.map(line => {
      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      const row: TableRow = { property: '', value: '' };
      
      headers.forEach((header, index) => {
        const cell = cells[index] || '';
        switch (header.toLowerCase()) {
          case 'property':
            row.property = cell;
            break;
          case 'unit':
            row.unit = cell;
            break;
          case 'min':
            row.min = cell;
            break;
          case 'value':
            row.value = cell;
            break;
          case 'max':
            row.max = cell;
            break;
        }
      });
      
      return row;
    });
    
    return { headers, rows };
  };

  // Enhanced rendering function with range indicators
  const renderEnhancedTable = (content: string, sectionTitle?: string) => {
    const tableData = parseMarkdownTable(content);
    
    if (!tableData) {
      // Fallback to markdown renderer
      return (
        <div className="enhanced-table-container">
          {sectionTitle && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              {sectionTitle}
            </h3>
          )}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <MarkdownRenderer content={content} convertMarkdown={true} />
            </div>
          </div>
        </div>
      );
    }
    
    const isPropertyTable = tableData.headers.length === 5 && 
                           tableData.headers.includes('Min') && 
                           tableData.headers.includes('Max');
    
    return (
      <div className="enhanced-table-container">
        {sectionTitle && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            {sectionTitle}
          </h3>
        )}
        
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                <tr>
                  {/* Render headers in the desired order: Property | Unit | Value | Min | Range Indicator | Max */}
                  {tableData.headers.map((header, index) => {
                    const headerName = header.toLowerCase();
                    
                    if (headerName === 'property') {
                      return (
                        <th key="property" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {header}
                        </th>
                      );
                    }
                    return null; // Don't render other headers here
                  }).filter(Boolean)}
                  
                  {/* Unit column */}
                  {tableData.headers.find(h => h.toLowerCase() === 'unit') && (
                    <th key="unit" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {tableData.headers.find(h => h.toLowerCase() === 'unit')}
                    </th>
                  )}
                  
                  {/* Value column */}
                  {tableData.headers.find(h => h.toLowerCase() === 'value') && (
                    <th key="value" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {tableData.headers.find(h => h.toLowerCase() === 'value')}
                    </th>
                  )}
                  
                  {/* Min column */}
                  {tableData.headers.find(h => h.toLowerCase() === 'min') && (
                    <th key="min" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {tableData.headers.find(h => h.toLowerCase() === 'min')}
                    </th>
                  )}
                  
                  {/* Range Indicator column */}
                  {isPropertyTable && (
                    <th key="range-indicator" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      
                    </th>
                  )}
                  
                  {/* Max column */}
                  {tableData.headers.find(h => h.toLowerCase() === 'max') && (
                    <th key="max" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {tableData.headers.find(h => h.toLowerCase() === 'max')}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {tableData.rows.map((row, index) => {
                  const rangeData = isPropertyTable && row.min && row.max ? 
                    parseValueRange(row.value, row.min, row.max) : null;
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {row.property}
                      </td>
                      {row.unit !== undefined && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {row.unit}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {row.value}
                      </td>
                      {row.min !== undefined && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {row.min}
                        </td>
                      )}
                      {isPropertyTable && rangeData !== null && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-sm h-4 relative">
                              {rangeData.isRange ? (
                                <>
                                  {/* Range visualization - shaded area */}
                                  <div 
                                    className="bg-gradient-to-r from-blue-200 to-blue-300 dark:from-blue-800 dark:to-blue-700 h-4 rounded-sm absolute transition-all duration-300"
                                    style={{ 
                                      left: `${Math.min(rangeData.startPosition!, rangeData.endPosition!)}%`, 
                                      width: `${Math.abs(rangeData.endPosition! - rangeData.startPosition!)}%` 
                                    }}
                                  />
                                  {/* Start boundary indicator */}
                                  <div 
                                    className="absolute top-0 w-1 h-4 bg-green-600 shadow-sm"
                                    style={{ left: `${rangeData.startPosition}%`, transform: 'translateX(-50%)' }}
                                  />
                                  {/* End boundary indicator */}
                                  <div 
                                    className="absolute top-0 w-1 h-4 bg-red-600 shadow-sm"
                                    style={{ left: `${rangeData.endPosition}%`, transform: 'translateX(-50%)' }}
                                  />
                                </>
                              ) : (
                                <>
                                  {/* Single value visualization */}
                                  <div 
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-sm transition-all duration-300"
                                    style={{ width: `${rangeData.singlePosition}%` }}
                                  />
                                  <div 
                                    className="absolute top-0 w-1 h-4 bg-red-500 shadow-sm"
                                    style={{ left: `${rangeData.singlePosition}%`, transform: 'translateX(-50%)' }}
                                  />
                                </>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 min-w-fit">
                              {rangeData.isRange 
                                ? `${Math.min(rangeData.startPosition!, rangeData.endPosition!).toFixed(1)}-${Math.max(rangeData.startPosition!, rangeData.endPosition!).toFixed(1)}%`
                                : `${rangeData.singlePosition!.toFixed(1)}%`
                              }
                            </span>
                          </div>
                        </td>
                      )}
                      {isPropertyTable && rangeData === null && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {/* Empty cell for rows without valid min/max values (like headings) */}
                        </td>
                      )}
                      {row.max !== undefined && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {row.max}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Parse sectioned content into individual sections
  const parseSectionedContent = (content: string) => {
    const sections = content.split(/^## /gm).filter(Boolean);
    return sections.map(section => {
      const lines = section.split('\n');
      const title = lines[0];
      const sectionContent = lines.slice(1).join('\n').trim();
      return { title, content: sectionContent };
    });
  };

  // Remove version log sections from content
  const cleanContent = (content: string) => {
    return content.split('---\nVersion Log')[0].trim();
  };

  // Check if content contains multiple table sections (material data pattern)
  const isSectionedContent = content.includes('## Material Properties') || 
                            content.includes('## Material Grades') ||
                            content.includes('## Performance Metrics') ||
                            content.includes('## Physical Properties') ||
                            content.includes('## Thermal Properties') ||
                            content.includes('## Optical Properties') ||
                            content.includes('## Mechanical Properties');

  if (isSectionedContent && variant !== 'compact') {
    const sections = parseSectionedContent(cleanContent(content));
    
    return (
      <div className={`table-sections-container ${className}`}>
        {caption && (
          <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            {caption}
          </div>
        )}
        
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div key={index} className="table-section-group">
              {renderEnhancedTable(section.content, section.title)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default single table rendering
  return (
    <div className={`table-section ${className}`}>
      {caption && (
        <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {caption}
        </div>
      )}
      
      {renderEnhancedTable(cleanContent(content))}
    </div>
  );
}
