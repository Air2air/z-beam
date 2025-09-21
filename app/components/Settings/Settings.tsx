// app/components/Settings/Settings.tsx
import React from 'react';
import { MarkdownRenderer } from '../Base/MarkdownRenderer';
import './styles.css';

interface SettingsProps {
  content: string;
  config?: {
    showHeader?: boolean;
    caption?: string;
    className?: string;
    variant?: 'default' | 'sectioned' | 'compact';
  };
}

interface SettingsParameter {
  parameter: string;
  value: string;
  unit?: string;
  description?: string;
  category?: string;
}

/**
 * Settings component for machine parameters and laser settings
 * Renders tabular data similar to Table component but optimized for settings/parameters
 */
export function Settings({ content, config }: SettingsProps) {
  if (!content) return null;
  
  const {
    showHeader = true,
    className = '',
    caption,
    variant = 'default'
  } = config || {};

  // Function to parse markdown table and extract structured data
  const parseMarkdownTable = (tableContent: string): { headers: string[], rows: SettingsParameter[] } | null => {
    const lines = tableContent.trim().split('\n');
    if (lines.length < 3) return null;
    
    const headerLine = lines.find(line => line.includes('|') && !line.includes('---'));
    const separatorIndex = lines.findIndex(line => line.includes('---'));
    
    if (!headerLine || separatorIndex === -1) return null;
    
    const headers = headerLine.split('|').map(h => h.trim()).filter(h => h);
    const dataLines = lines.slice(separatorIndex + 1).filter(line => line.includes('|'));
    
    const rows: SettingsParameter[] = dataLines.map(line => {
      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      const row: SettingsParameter = { parameter: '', value: '' };
      
      headers.forEach((header, index) => {
        const cell = cells[index] || '';
        switch (header.toLowerCase()) {
          case 'parameter':
          case 'setting':
          case 'property':
            row.parameter = cell;
            break;
          case 'value':
            row.value = cell;
            break;
          case 'unit':
            row.unit = cell;
            break;
          case 'description':
            row.description = cell;
            break;
          case 'category':
            row.category = cell;
            break;
        }
      });
      
      return row;
    });
    
    return { headers, rows };
  };

  // Enhanced rendering function for settings tables
  const renderEnhancedSettingsTable = (content: string, sectionTitle?: string) => {
    const tableData = parseMarkdownTable(content);
    
    if (!tableData) {
      // Fallback to markdown renderer
      return (
        <div className="enhanced-settings-container">
          {sectionTitle && (
            <h3 className="text-lg font-semibold text-white mb-4">
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
    
    return (
      <div className="enhanced-settings-container">
        {sectionTitle && (
          <h3 className="text-lg font-semibold text-white mb-4">
            {sectionTitle}
          </h3>
        )}
        
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Parameter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Value
                  </th>
                  {tableData.headers.find(h => h.toLowerCase() === 'unit') && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Unit
                    </th>
                  )}
                  {tableData.headers.find(h => h.toLowerCase() === 'description') && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Description
                    </th>
                  )}
                  {tableData.headers.find(h => h.toLowerCase() === 'category') && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {tableData.rows.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {row.parameter}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {row.value}
                    </td>
                    {row.unit !== undefined && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {row.unit}
                      </td>
                    )}
                    {row.description !== undefined && (
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                        {row.description}
                      </td>
                    )}
                    {row.category !== undefined && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {row.category}
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
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

  // Check if content contains multiple settings sections
  const isSectionedContent = content.includes('## Core Laser Parameters') || 
                            content.includes('## Material-Specific Settings') ||
                            content.includes('## Technical Specifications') ||
                            content.includes('## Safety') ||
                            content.includes('## Process') ||
                            content.includes('## Quality Control') ||
                            content.includes('## Laser Parameters') ||
                            content.includes('## Operating Parameters');

  if (isSectionedContent && variant !== 'compact') {
    const sections = parseSectionedContent(cleanContent(content));
    
    return (
      <div className={`settings-sections-container ${className}`}>
        {caption && (
          <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            {caption}
          </div>
        )}
        
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div key={index} className="settings-section-group">
              {renderEnhancedSettingsTable(section.content, section.title)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default single settings table rendering
  return (
    <div className={`settings-section ${className}`}>
      {caption && (
        <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {caption}
        </div>
      )}
      
      {renderEnhancedSettingsTable(cleanContent(content))}
    </div>
  );
}
