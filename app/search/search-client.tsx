"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CardGrid } from "../components/CardGrid/CardGrid";
import { Article, MaterialType, SearchClientProps } from "@/types";
import { extractSafeValue, safeIncludes } from "../utils/client-safe";
import { capitalizeWords } from "../utils/formatting";

// Helper function to safely cast material types
function toMaterialType(value?: string): MaterialType {
  if (!value) return 'other';
  
  const normalizedValue = value.toLowerCase();
  const validTypes: MaterialType[] = [
    'element', 'compound', 'ceramic', 'polymer', 'alloy', 'composite', 'semiconductor', 'other'
  ];
  
  // Check for exact matches first
  if (validTypes.includes(normalizedValue as MaterialType)) {
    return normalizedValue as MaterialType;
  }
  
  // Map common aliases
  const typeMap: Record<string, MaterialType> = {
    'metal': 'alloy',
    'metalloid': 'semiconductor',
    'plastic': 'polymer',
    'material': 'other'
  };
  
  return typeMap[normalizedValue] || 'other';
}

// Simple synchronous property parser for client-side filtering
function parsePropertiesFromContent(content: string): Array<{property: string, value: string}> {
  if (!content) return [];
  
  const lines = content.split('\n').filter(line => line.trim());
  const properties: Array<{property: string, value: string}> = [];
  
  for (const line of lines) {
    // Check if this is a table row (contains |)
    if (line.includes('|')) {
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
      
      // Process data row
      if (cells.length >= 2) {
        const property = cells[0];
        const value = cells[1];
        
        if (property && value) {
          properties.push({ property, value });
        }
      }
    }
  }
  
  return properties;
}

// Parse properties from article metadata/frontmatter
function parsePropertiesFromMetadata(metadata: any): Array<{property: string, value: string}> {
  if (!metadata || typeof metadata !== 'object') return [];
  
  const properties: Array<{property: string, value: string}> = [];
  
  // Helper function to extract property data (handles nested properties)
  const extractProperty = (key: string, data: any, parentKey?: string) => {
    if (!data) return;
    
    if (typeof data === 'object' && data !== null) {
      // Check if this is a leaf node with a value
      if (data.value !== undefined || data.numeric !== undefined) {
        // This is a property with a value - use just the key name (not the full path)
        // This allows searching for "specificHeat" instead of "laser_material_interaction.properties.specificHeat"
        const propertyName = key;
        const value = data.value !== undefined
          ? (data.unit ? `${data.value} ${data.unit}` : String(data.value))
          : (data.units ? `${data.numeric} ${data.units}` : String(data.numeric));
        properties.push({ property: propertyName, value });
      } else {
        // This is a grouping object - determine if it's a category container
        // Categories have 'label', 'properties', 'description', and 'percentage' keys
        const hasCategoryStructure = 
          data.hasOwnProperty('label') && 
          data.hasOwnProperty('properties') && 
          typeof data.properties === 'object';
        
        // Known non-property metadata keys to skip
        const metadataKeys = ['label', 'description', 'percentage'];
        const isMetadataKey = metadataKeys.includes(key);
        
        Object.entries(data).forEach(([nestedKey, nestedValue]) => {
          if (hasCategoryStructure || isMetadataKey) {
            // This is a category container or metadata - don't include in property path
            // Pass the current key as the parent only if we're inside a 'properties' container
            extractProperty(nestedKey, nestedValue, key === 'properties' ? parentKey : key);
          } else {
            // Include this key in the path (for nested properties like thermalDestruction.point)
            const newParentKey = parentKey ? `${parentKey}.${key}` : key;
            extractProperty(nestedKey, nestedValue, newParentKey);
          }
        });
      }
    } else if (data !== null && data !== undefined) {
      // Handle primitive values
      const propertyName = parentKey ? `${parentKey}.${key}` : key;
      properties.push({ property: propertyName, value: String(data) });
    }
  };
  
  // Check material properties - only extract what actually exists
  if (metadata.materialProperties) {
    Object.entries(metadata.materialProperties).forEach(([key, value]) => {
      extractProperty(key, value);
    });
  }
  
  // Check machine settings - only extract what actually exists
  if (metadata.machineSettings) {
    Object.entries(metadata.machineSettings).forEach(([key, value]) => {
      extractProperty(key, value);
    });
  }
  
  // Check properties field (alternative structure) - only extract what actually exists
  if (metadata.properties) {
    Object.entries(metadata.properties).forEach(([key, value]) => {
      extractProperty(key, value);
    });
  }
  
  return properties;
}

export default function SearchClient({ initialArticles }: SearchClientProps) {
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';
  const propertyName = searchParams?.get('property') || '';
  const propertyValue = searchParams?.get('value') || '';
  
  const [articles] = useState<Article[]>(initialArticles);
  
  // Property search logic
  const isPropertySearch = propertyName && propertyValue;
  
  // Normalize property name for comparison (remove spaces, convert to lowercase)
  const normalizePropertyName = (name: string): string => {
    return name.toLowerCase().replace(/[^\w]/g, '');
  };
  
  const normalizedSearchProperty = propertyName ? normalizePropertyName(propertyName) : '';
  
  // Track extracted unit from properties
  const [extractedUnit, setExtractedUnit] = useState<string>('');
  
  // Extract unit from first matching property across all articles
  useEffect(() => {
    if (propertyName && propertyValue && articles.length > 0) {
      const normalizedSearchProperty = normalizePropertyName(propertyName);
      
      for (const article of articles) {
        const metadata = article.metadata || {};
        const allProperties = parsePropertiesFromMetadata(metadata);
        
        const matchingProp = allProperties.find(prop => {
          const normalizedPropName = normalizePropertyName(prop.property);
          return normalizedPropName === normalizedSearchProperty;
        });
        
        if (matchingProp) {
          // Extract unit from value string (e.g., "840 J/(kg·K)" -> "J/(kg·K)")
          const unitMatch = matchingProp.value.match(/[\d.]+\s*(.+)/);
          if (unitMatch && unitMatch[1]) {
            setExtractedUnit(unitMatch[1].trim());
            break;
          }
        }
      }
    } else {
      setExtractedUnit('');
    }
  }, [propertyName, propertyValue, articles]);
  
  // Filter articles based on search query and property filters
  const filteredArticles = articles.filter(article => {
    // Check property filter
    if (propertyName && propertyValue) {
      // Get properties from both content and metadata
      const contentProperties = article.content ? parsePropertiesFromContent(article.content) : [];
      const metadataProperties = parsePropertiesFromMetadata(article.metadata);
      const allProperties = [...contentProperties, ...metadataProperties];
      
      // Check for matching property with normalized property name matching
      const hasMatchingProperty = allProperties.some(prop => {
        // Normalize both property names for comparison (handles tensileStrength vs "Tensile Strength")
        const normalizedPropName = normalizePropertyName(prop.property);
        const propNameMatch = normalizedPropName === normalizedSearchProperty;
        
        // Early exit if property name doesn't match
        if (!propNameMatch) {
          return false;
        }
        
        // Flexible value matching
        const searchVal = String(propertyValue).toLowerCase().trim();
        const actualVal = String(prop.value).toLowerCase().trim();
        
        // Try multiple value matching strategies
        const exactMatch = actualVal === searchVal;
        
        // Numeric matching with reasonable tolerance
        let numericMatch = false;
        
        // Extract numeric values more carefully, preserving decimals
        const searchNum = parseFloat(searchVal.match(/[\d.]+/)?.[0] || searchVal);
        const propValString = actualVal.match(/[\d.]+/)?.[0] || actualVal;
        const propNum = parseFloat(propValString);
        
        if (!isNaN(searchNum) && !isNaN(propNum)) {
          // Check if property value is a range (e.g., "400-600" or "400–600")
          const rangeMatch = actualVal.match(/([\d.]+)\s*[-–]\s*([\d.]+)/);
          
          if (rangeMatch) {
            // Value is a range - check if search value falls within it
            const rangeMin = parseFloat(rangeMatch[1]);
            const rangeMax = parseFloat(rangeMatch[2]);
            numericMatch = searchNum >= rangeMin && searchNum <= rangeMax;
          } else {
            // Single numeric value - check with 10% tolerance
            const tolerance = Math.max(Math.abs(searchNum * 0.1), 0.1);
            numericMatch = Math.abs(propNum - searchNum) <= tolerance;
          }
        }
        
        // Value matching - exact or numeric within tolerance/range
        return exactMatch || numericMatch;
      });
      
      if (!hasMatchingProperty) {
        return false;
      }
    }
    
    // Then check search query
    if (!query) return true;
    
    const searchTerm = query.toLowerCase();
    
    // Helper function to recursively search through any object/array structure
    const deepSearch = (obj: any, searchTerm: string, maxDepth: number = 10, currentDepth: number = 0): boolean => {
      // Prevent infinite recursion
      if (currentDepth > maxDepth || !obj) return false;
      
      // Handle primitives (string, number, boolean)
      if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
        return safeIncludes(extractSafeValue(obj), searchTerm);
      }
      
      // Handle arrays
      if (Array.isArray(obj)) {
        return obj.some(item => deepSearch(item, searchTerm, maxDepth, currentDepth + 1));
      }
      
      // Handle objects
      if (typeof obj === 'object' && obj !== null) {
        // Skip certain metadata keys that shouldn't be searched
        const skipKeys = ['image', 'imageUrl', 'imageAlt', 'url', 'href', 'id', 'slug', 'filepath', 'path'];
        
        return Object.entries(obj).some(([key, value]) => {
          // Skip image/url fields to avoid false matches
          if (skipKeys.includes(key)) return false;
          
          // Recursively search the value
          return deepSearch(value, searchTerm, maxDepth, currentDepth + 1);
        });
      }
      
      return false;
    };
    
    // Helper function to safely extract and check author information
    const checkAuthorMatch = (article: any, searchTerm: string): boolean => {
      const authorObj = article.metadata?.author_object || article.metadata?.author || article.author;
      return deepSearch(authorObj, searchTerm);
    };
    
    // Search in multiple fields with priority
    const metadata = article.metadata as any;
    
    // High-priority fields (direct matches)
    const titleMatch = article.title && safeIncludes(extractSafeValue(article.title), searchTerm);
    const nameMatch = article.name && safeIncludes(extractSafeValue(article.name), searchTerm);
    const descriptionMatch = article.description && safeIncludes(extractSafeValue(article.description), searchTerm);
    
    // Check for high-priority matches first
    if (titleMatch || nameMatch || descriptionMatch) return true;
    
    // Author search
    const authorMatch = checkAuthorMatch(article, searchTerm);
    if (authorMatch) return true;
    
    // Tags search
    const tagsMatch = article.tags && Array.isArray(article.tags) && 
      article.tags.some(tag => safeIncludes(extractSafeValue(tag), searchTerm));
    if (tagsMatch) return true;
    
    // Category/subcategory search
    const categoryMatch = metadata?.category && safeIncludes(extractSafeValue(metadata.category), searchTerm);
    const subcategoryMatch = metadata?.subcategory && safeIncludes(extractSafeValue(metadata.subcategory), searchTerm);
    if (categoryMatch || subcategoryMatch) return true;
    
    // Dynamic deep search through ALL metadata fields
    // This will automatically search machineSettings, materialProperties, and any other frontmatter fields
    if (metadata) {
      // Define fields to search deeply (will adapt to any frontmatter structure)
      const deepSearchFields = [
        'subtitle',
        'applications',
        'machineSettings',        // Dynamic search through all machine parameters
        'materialProperties',     // Dynamic search through all material properties (all categories)
        'environmentalImpact',
        'outcomeMetrics',
        'caption',
        'regulatoryStandards',
        'processing',
        'keywords',
        'meta_tags',
        // Any future frontmatter fields will be automatically included
      ];
      
      for (const field of deepSearchFields) {
        if (metadata[field] && deepSearch(metadata[field], searchTerm)) {
          return true;
        }
      }
      
      // Fallback: search through any remaining metadata fields not explicitly listed
      // This ensures complete coverage even if new fields are added
      const searchedFields = new Set([...deepSearchFields, 'author', 'author_object', 'category', 'subcategory']);
      const remainingFields = Object.keys(metadata).filter(key => !searchedFields.has(key));
      
      for (const field of remainingFields) {
        if (deepSearch(metadata[field], searchTerm)) {
          return true;
        }
      }
    }
    
    return false;
  });
  
  // Build subtitle based on search parameters (not used, handled by wrapper)
  const getSubtitle = () => {
    if (propertyName && propertyValue) {
      const formattedProperty = capitalizeWords(propertyName.replace(/([A-Z])/g, ' $1').trim());
      return `${filteredArticles.length} ${filteredArticles.length === 1 ? 'material' : 'materials'} found with ${formattedProperty} of ${propertyValue}:`;
    }
    if (query) {
      return `Search results for "${query}"`;
    }
    return 'Browse all available materials and articles';
  };
  
  // Expose result count to parent via custom event
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('searchResultsUpdated', { 
        detail: { 
          count: filteredArticles.length,
          unit: extractedUnit,
          subtitle: getSubtitle()
        } 
      });
      window.dispatchEvent(event);
    }
  }, [filteredArticles.length, extractedUnit]);
  
  return (
    <>
      {filteredArticles.length === 0 ? (
        <div className="p-6 bg-gray-100 rounded-lg">
          <p className="text-gray-700">No articles found matching your criteria.</p>
        </div>
      ) : (
        <CardGrid
          items={filteredArticles.map((article) => ({
            slug: article.slug || 'unknown',
            title: article.name || article.title || 'Untitled Article',
            description: article.description || article.excerpt || '',
            href: `/${article.slug}`,
            imageUrl: article.image,
            imageAlt: article.imageAlt || article.name || article.title || '',
            badge: (article as any).badgeSymbolData || {
              symbol: (article.metadata as any)?.chemicalSymbol,
              formula: (article.metadata as any)?.chemicalFormula,
              atomicNumber: (article.metadata as any)?.atomicNumber,
              materialType: toMaterialType(
                article.metadata && 'category' in article.metadata && typeof article.metadata.category === 'string' 
                  ? article.metadata.category 
                  : undefined
              ),
            },
            metadata: article.metadata as unknown as Record<string, unknown>,
          }))}
          columns={3}
          variant="default"
        />
      )}
    </>
  );
}
