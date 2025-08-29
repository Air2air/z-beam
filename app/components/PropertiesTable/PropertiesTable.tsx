// app/components/PropertiesTable/PropertiesTable.tsx
import React from 'react';
import { MarkdownRenderer } from '../Base/MarkdownRenderer';
import "./styles.css";

interface PropertiesTableProps {
  content: string;
  config?: {
    caption?: string;
    className?: string;
  };
}

/**
 * Transforms any table to convert ALL key-value pairs into cards
 */
function transformTableStructure(htmlContent: string): string {
  if (!htmlContent.includes("<table")) {
    return htmlContent;
  }

  // Function to convert property names to CSS class names
  const getPropertyClassName = (propertyName: string): string => {
    return propertyName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  };

  // Function to apply title case formatting for specific properties
  const formatPropertyValue = (key: string, value: string): string => {
    const titleCaseProperties = ["Material Symbol", "Material Type", "Category"];
    
    if (titleCaseProperties.includes(key)) {
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    }
    
    return value;
  };

  // Find only the first table
  const firstTableMatch = htmlContent.match(/<table[^>]*>[\s\S]*?<\/table>/i);
  if (!firstTableMatch) {
    return htmlContent;
  }

  const tableHtml = firstTableMatch[0];
  
  // Extract all key-value pairs from the first table
  const keyValuePairs: Array<{
    key: string;
    value: string;
    className: string;
  }> = [];
  const rowMatches = tableHtml.matchAll(
    /<tr[^>]*>\s*<td[^>]*>([^<]+)<\/td>\s*<td[^>]*>([^<]+)<\/td>\s*<\/tr>/gi
  );

  for (const match of rowMatches) {
    const cleanKey = match[1].trim();
    let cleanValue = match[2].trim();

    // Apply formatting based on property type
    cleanValue = formatPropertyValue(cleanKey, cleanValue);

    // Generate CSS class name dynamically
    const className = getPropertyClassName(cleanKey);
    keyValuePairs.push({ key: cleanKey, value: cleanValue, className });
  }

  // If we found key-value pairs, create a flex row of cards
  if (keyValuePairs.length > 0) {
    const cardCells = keyValuePairs
      .map(
        ({ key, value, className }) =>
          `<div class="property-card ${className}">
        <a href="/search?property=${encodeURIComponent(key)}&value=${encodeURIComponent(value)}" class="property-link">
          <h3 class="property-value">${value}</h3>
          <div class="property-key">${key}</div>
        </a>
      </div>`
      )
      .join("\n        ");

    return `<div class="properties-flex-container">
      ${cardCells}
    </div>`;
  }

  // Return empty if no properties found
  return "";
}

/**
 * Converts markdown table to HTML table
 */
function convertMarkdownTableToHtml(markdown: string): string {
  if (!markdown) return "";
  
  try {
    const lines = markdown.split('\n').filter(line => line.trim());
    let tableHtml = '';
    let inTable = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if this is a table row (contains |)
      if (line.includes('|')) {
        if (!inTable) {
          tableHtml += '<table>\n';
          inTable = true;
        }
        
        // Skip separator lines (contains only |, -, :, and spaces)
        if (/^[\|\-\:\s]+$/.test(line)) {
          continue;
        }
        
        // Skip header row (contains "Property" and "Value")
        const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
        if (cells.length >= 2 && 
            cells[0].toLowerCase().includes('property') && 
            cells[1].toLowerCase().includes('value')) {
          continue;
        }
        
        // Process table row
        if (cells.length >= 2) {
          tableHtml += '<tr>';
          cells.forEach(cell => {
            tableHtml += `<td>${cell}</td>`;
          });
          tableHtml += '</tr>\n';
        }
      } else if (inTable) {
        // End of table
        tableHtml += '</table>\n';
        inTable = false;
      }
    }
    
    if (inTable) {
      tableHtml += '</table>\n';
    }
    
    return tableHtml || markdown;
  } catch (error) {
    console.error("Error converting markdown table:", error);
    return markdown;
  }
}

/**
 * Custom PropertiesTable component that processes raw markdown content
 */
export function PropertiesTable({ content, config }: PropertiesTableProps) {
  if (!content) return null;

  const { className = "", caption } = config || {};

  // Convert markdown to HTML, then transform the table structure
  const processedContent = React.useMemo(() => {
    const htmlContent = convertMarkdownTableToHtml(content);
    return transformTableStructure(htmlContent);
  }, [content]);

  return (
    <div className={`properties-table ${className}`}>
      <div dangerouslySetInnerHTML={{ __html: processedContent }} />
      {caption && <div className="caption">{caption}</div>}
    </div>
  );
}