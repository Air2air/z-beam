// app/components/PropertiesTable/PropertiesTable.tsx
import React from 'react';
import { toSentenceCase } from '../../utils/formatting';
import { MarkdownRenderer } from '../Base/MarkdownRenderer';
import { PropertiesTableProps } from '@/types/centralized';
import SimpleMetricsCard, { CardData } from '../MetricsCard/MetricsCard';
import "./styles.css";

/**
 * Extracts key-value pairs from table content and converts to CardData format
 */
function extractTableData(htmlContent: string): CardData[] {
  if (!htmlContent.includes("<table")) {
    return [];
  }

  // Function to apply title case formatting for specific properties
  const formatPropertyValue = (key: string, value: string): string => {
    const titleCaseProperties = ["Material Symbol", "Material Type", "Category"];
    
    if (titleCaseProperties.includes(key)) {
      return toSentenceCase(value);
    }
    
    return value;
  };

  // Find only the first table
  const firstTableMatch = htmlContent.match(/<table[^>]*>[\s\S]*?<\/table>/i);
  if (!firstTableMatch) {
    return [];
  }

  const tableHtml = firstTableMatch[0];
  
  // Extract all key-value pairs from the first table
  const cardData: CardData[] = [];
  const rowMatches = tableHtml.matchAll(
    /<tr[^>]*>\s*<td[^>]*>([^<]+)<\/td>\s*<td[^>]*>([^<]+)<\/td>\s*<\/tr>/gi
  );

  for (const match of rowMatches) {
    const cleanKey = match[1].trim();
    let cleanValue = match[2].trim();

    // Apply formatting based on property type
    cleanValue = formatPropertyValue(cleanKey, cleanValue);

    cardData.push({
      key: cleanKey.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      title: cleanKey,
      value: cleanValue,
      href: `/search?property=${encodeURIComponent(cleanKey)}&value=${encodeURIComponent(cleanValue)}`
    });
  }

  return cardData;
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
 * Custom PropertiesTable component that uses MetricsCard for display
 */
export function PropertiesTable({ content, config }: PropertiesTableProps) {
  const { className = "", caption } = config || {};

  // Convert markdown to HTML, then extract card data
  const cardData = React.useMemo(() => {
    if (!content) return [];
    const htmlContent = convertMarkdownTableToHtml(content);
    return extractTableData(htmlContent);
  }, [content]);

  if (!content || cardData.length === 0) return null;

  return (
    <div className={`properties-table ${className}`}>
      <SimpleMetricsCard 
        cards={cardData}
        title="" // No title for properties tables
        gridCols="grid-cols-2 md:grid-cols-4 lg:grid-cols-4"
        className="properties-metrics-card"
      />
      {caption && <div className="caption">{caption}</div>}
    </div>
  );
}