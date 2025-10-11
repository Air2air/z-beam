// app/components/Table/Table.tsx
import React from 'react';
import { TableProps, TableRow } from '@/types';
import { SectionTitle } from '../SectionTitle/SectionTitle';
import './styles.css';

interface FrontmatterTableData {
  [key: string]: any;
}

// TableRow interface now comes from centralized types

/**
 * Frontmatter-focused Table component for displaying structured frontmatter data
 */
export function Table({ content, config, frontmatterData }: TableProps & { frontmatterData?: FrontmatterTableData }) {
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

  // Extract displayable frontmatter data
  const extractFrontmatterRows = (data: FrontmatterTableData): TableRow[] => {
    const rows: TableRow[] = [];
    
    if (!data) return rows;

    // Helper function to format values
    const formatValue = (value: any): string => {
      if (value === null || value === undefined) return 'N/A';
      if (typeof value === 'boolean') return value ? 'Yes' : 'No';
      if (typeof value === 'number') return value.toString();
      if (Array.isArray(value)) return value.join(', ');
      if (typeof value === 'object') {
        // Handle nested objects like materialProperties
        return Object.keys(value).length > 0 ? `${Object.keys(value).length} properties` : 'N/A';
      }
      return String(value);
    };

    // Simple frontmatter fields that can be displayed directly
    const simpleFields = [
      { key: 'name', label: 'Name' },
      { key: 'category', label: 'Category' },
      { key: 'subcategory', label: 'Subcategory' },
      { key: 'title', label: 'Title' },
      { key: 'description', label: 'Description' },
      { key: 'author_id', label: 'Author ID' },
    ];

    // Add simple fields
    simpleFields.forEach(field => {
      if (data[field.key] !== undefined) {
        const shouldInclude = includedFields ? includedFields.includes(field.key) : true;
        const shouldExclude = excludedFields ? excludedFields.includes(field.key) : false;
        
        if (shouldInclude && !shouldExclude) {
          rows.push({
            property: field.label,
            value: formatValue(data[field.key]),
            description: `${field.label} information`
          });
        }
      }
    });

    // Handle applications array
    if (data.applications && Array.isArray(data.applications)) {
      const shouldInclude = includedFields ? includedFields.includes('applications') : true;
      const shouldExclude = excludedFields ? excludedFields.includes('applications') : false;
      
      if (shouldInclude && !shouldExclude) {
        rows.push({
          property: 'Applications',
          value: `${data.applications.length} applications`,
          description: 'Number of defined applications'
        });
      }
    }

    // Handle regulatory standards
    if (data.regulatoryStandards && Array.isArray(data.regulatoryStandards)) {
      const shouldInclude = includedFields ? includedFields.includes('regulatoryStandards') : true;
      const shouldExclude = excludedFields ? excludedFields.includes('regulatoryStandards') : false;
      
      if (shouldInclude && !shouldExclude) {
        rows.push({
          property: 'Regulatory Standards',
          value: `${data.regulatoryStandards.length} standards`,
          description: 'Number of regulatory standards'
        });
      }
    }

    // Handle environmental impact
    if (data.environmentalImpact && Array.isArray(data.environmentalImpact)) {
      const shouldInclude = includedFields ? includedFields.includes('environmentalImpact') : true;
      const shouldExclude = excludedFields ? excludedFields.includes('environmentalImpact') : false;
      
      if (shouldInclude && !shouldExclude) {
        rows.push({
          property: 'Environmental Benefits',
          value: `${data.environmentalImpact.length} benefits`,
          description: 'Number of environmental benefits'
        });
      }
    }

    // Handle application types
    if (data.applicationTypes && Array.isArray(data.applicationTypes)) {
      const shouldInclude = includedFields ? includedFields.includes('applicationTypes') : true;
      const shouldExclude = excludedFields ? excludedFields.includes('applicationTypes') : false;
      
      if (shouldInclude && !shouldExclude) {
        rows.push({
          property: 'Application Types',
          value: `${data.applicationTypes.length} types`,
          description: 'Number of application types'
        });
      }
    }

    // Handle outcome metrics
    if (data.outcomeMetrics && Array.isArray(data.outcomeMetrics)) {
      const shouldInclude = includedFields ? includedFields.includes('outcomeMetrics') : true;
      const shouldExclude = excludedFields ? excludedFields.includes('outcomeMetrics') : false;
      
      if (shouldInclude && !shouldExclude) {
        rows.push({
          property: 'Outcome Metrics',
          value: `${data.outcomeMetrics.length} metrics`,
          description: 'Number of tracked metrics'
        });
      }
    }

    // Handle author object
    if (data.author_object && typeof data.author_object === 'object') {
      const shouldInclude = includedFields ? includedFields.includes('author_object') : true;
      const shouldExclude = excludedFields ? excludedFields.includes('author_object') : false;
      
      if (shouldInclude && !shouldExclude) {
        const author = data.author_object;
        rows.push({
          property: 'Author',
          value: author.name || 'Unknown',
          description: `${author.title || ''} from ${author.country || 'Unknown'}`
        });
      }
    }

    return rows;
  };

  // Render frontmatter table
  const renderFrontmatterTable = (data: FrontmatterTableData, sectionTitle?: string) => {
    const rows = extractFrontmatterRows(data);
    
    if (rows.length === 0) {
      return (
        <div className="enhanced-table-container">
          {sectionTitle && (
            <SectionTitle title={`${sectionTitle} - Properties`} className="mb-4" />
          )}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-gray-500 dark:text-gray-400 text-center">
              No displayable frontmatter data available
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="enhanced-table-container">
        {sectionTitle && (
          <SectionTitle title={`${sectionTitle} - Properties`} className="mb-4" />
        )}
        
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                <tr>
                  <th className="table-header px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="table-header px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Value
                  </th>
                  {variant !== 'compact' && (
                    <th className="table-header px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Description
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {rows.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {row.property}
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-600 dark:text-blue-400">
                      <div className="max-w-xs overflow-hidden text-ellipsis">
                        <strong>{row.value}</strong>
                      </div>
                      {row.unit && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          {row.unit}
                        </span>
                      )}
                      {row.confidence && (
                        <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Confidence: {row.confidence}%
                        </div>
                      )}
                    </td>
                    {variant !== 'compact' && (
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                        <div className="max-w-sm">
                          {row.description}
                        </div>
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

  // Handle legacy content (fallback for existing YAML table files)
  const renderLegacyContent = (content: string) => {
    return (
      <div className="enhanced-table-container">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-gray-500 dark:text-gray-400">
            <p className="mb-2">Legacy Table Content:</p>
            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto">
              {content.substring(0, 500)}...
            </pre>
          </div>
        </div>
      </div>
    );
  };

  // Main render logic
  if (frontmatterData) {
    return (
      <div className={`frontmatter-table-section ${className}`}>
        {caption && (
          <div className="mb-4 text-lg text-gray-900 dark:text-white">
            {caption}
          </div>
        )}
        {renderFrontmatterTable(frontmatterData, caption)}
      </div>
    );
  }

  // Fallback to legacy content rendering
  if (content) {
    return (
      <div className={`table-section ${className}`}>
        {caption && (
          <div className="mb-4 text-lg text-gray-900 dark:text-white">
            {caption}
          </div>
        )}
        {renderLegacyContent(content)}
      </div>
    );
  }

  return null;
}
