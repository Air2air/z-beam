// app/components/PropertiesTable/PropertiesTable.tsx
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
        <h3 class="property-value">${value}</h3>
        <div class="property-key">${key}</div>
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

export function PropertiesTable({ content, config }: PropertiesTableProps) {
  if (!content) return null;

  const { className = "", caption } = config || {};

  // Transform table structure to stack values on keys
  const transformedContent = transformTableStructure(content);

  return (
    <div className={`properties-table ${className}`}>
      <div dangerouslySetInnerHTML={{ __html: transformedContent }} />

      {caption && <div className="caption">{caption}</div>}
    </div>
  );
}