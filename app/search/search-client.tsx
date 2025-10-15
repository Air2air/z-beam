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
        // This is a property with a value - use the current key as property name
        const propertyName = parentKey ? `${parentKey}.${key}` : key;
        const value = data.value !== undefined
          ? (data.unit ? `${data.value} ${data.unit}` : String(data.value))
          : (data.units ? `${data.numeric} ${data.units}` : String(data.numeric));
        properties.push({ property: propertyName, value });
      } else {
        // This is a grouping object - skip organizational/metadata keys
        // Grouping keys are structural containers, not part of property names
        const groupingKeys = ['properties', 'label', 'description', 'percentage', 
                             'material_properties', 'structural_response', 'energy_coupling',
                             'optical_properties', 'chemical_properties'];
        const isGrouping = groupingKeys.includes(key);
        
        Object.entries(data).forEach(([nestedKey, nestedValue]) => {
          if (isGrouping) {
            // Don't include grouping key in path
            extractProperty(nestedKey, nestedValue, parentKey);
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
        const searchNum = parseFloat(String(propertyValue).replace(/[^\d.-]/g, ''));
        
        if (!isNaN(searchNum)) {
          // Check if value is a range (e.g., "400-600" or "400–600")
          const rangeMatch = String(prop.value).match(/(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)/);
          
          if (rangeMatch) {
            // Value is a range - check if search value falls within it
            const rangeMin = parseFloat(rangeMatch[1]);
            const rangeMax = parseFloat(rangeMatch[2]);
            numericMatch = searchNum >= rangeMin && searchNum <= rangeMax;
          } else {
            // Single numeric value - check with tolerance
            const propNum = parseFloat(String(prop.value).replace(/[^\d.-]/g, ''));
            if (!isNaN(propNum)) {
              // 10% tolerance for numeric comparison
              const tolerance = Math.max(Math.abs(searchNum * 0.1), 1);
              numericMatch = Math.abs(propNum - searchNum) <= tolerance;
            }
          }
        }
        
        // Value matching - exact or numeric within tolerance/range
        const valueMatch = exactMatch || numericMatch;
        
        return valueMatch;
      });
      
      if (!hasMatchingProperty) {
        return false;
      }
    }
    
    // Then check search query
    if (!query) return true;
    
    const searchTerm = query.toLowerCase();
    
    // Helper function to safely extract and check author information
    const checkAuthorMatch = (article: any, searchTerm: string): boolean => {
      // Check simple author field
      if (article.author && safeIncludes(extractSafeValue(article.author), searchTerm)) {
        return true;
      }
      
      // Check author in metadata
      if (article.metadata?.author && safeIncludes(extractSafeValue(article.metadata.author), searchTerm)) {
        return true;
      }
      
      // Check author_object structure
      const authorObj = article.metadata?.author_object || article.metadata?.author;
      if (authorObj) {
        if (authorObj.name && safeIncludes(extractSafeValue(authorObj.name), searchTerm)) {
          return true;
        }
        if (authorObj.title && safeIncludes(extractSafeValue(authorObj.title), searchTerm)) {
          return true;
        }
        if (authorObj.expertise && Array.isArray(authorObj.expertise)) {
          if (authorObj.expertise.some((exp: string) => safeIncludes(extractSafeValue(exp), searchTerm))) {
            return true;
          }
        }
        if (authorObj.country && safeIncludes(extractSafeValue(authorObj.country), searchTerm)) {
          return true;
        }
      }
      
      return false;
    };
    
    // Search in multiple fields
    const titleMatch = article.title && safeIncludes(extractSafeValue(article.title), searchTerm);
    const descriptionMatch = article.description && safeIncludes(extractSafeValue(article.description), searchTerm);
    const authorMatch = checkAuthorMatch(article, searchTerm);
    
    // Search in tags
    const tagsMatch = article.tags && Array.isArray(article.tags) && 
      article.tags.some(tag => safeIncludes(extractSafeValue(tag), searchTerm));
    
    // Search in category/subcategory - use type-safe access
    const metadata = article.metadata as any;
    const categoryMatch = metadata?.category && 
      safeIncludes(extractSafeValue(metadata.category), searchTerm);
    const subcategoryMatch = metadata?.subcategory && 
      safeIncludes(extractSafeValue(metadata.subcategory), searchTerm);
    
    // Search in keywords (from metadata/metatags)
    let keywordsMatch = false;
    if (metadata?.keywords) {
      const keywords = metadata.keywords;
      if (Array.isArray(keywords)) {
        keywordsMatch = keywords.some((keyword: any) => safeIncludes(extractSafeValue(keyword), searchTerm));
      }
    }
    
    // Search in meta_tags keywords if present
    let metaTagsKeywordsMatch = false;
    if (metadata?.meta_tags && Array.isArray(metadata.meta_tags)) {
      const keywordsTag = metadata.meta_tags.find(
        (tag: any) => tag?.name === 'keywords' && tag?.content
      );
      if (keywordsTag?.content) {
        const keywordsContent = keywordsTag.content;
        if (Array.isArray(keywordsContent)) {
          metaTagsKeywordsMatch = keywordsContent.some((keyword: any) => 
            safeIncludes(extractSafeValue(keyword), searchTerm)
          );
        }
      }
    }
    
    // Search in name field (material name)
    const nameMatch = article.name && safeIncludes(extractSafeValue(article.name), searchTerm);
    
    return (
      titleMatch ||
      descriptionMatch ||
      authorMatch ||
      tagsMatch ||
      categoryMatch ||
      subcategoryMatch ||
      keywordsMatch ||
      metaTagsKeywordsMatch ||
      nameMatch
    );
  });
  
  // Build subtitle based on search parameters
  const getSubtitle = () => {
    if (propertyName && propertyValue) {
      return `Materials with ${capitalizeWords(propertyName.replace(/([A-Z])/g, ' $1').trim())}: ${propertyValue}`;
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
          subtitle: getSubtitle()
        } 
      });
      window.dispatchEvent(event);
    }
  }, [filteredArticles.length, query, propertyName, propertyValue]);
  
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
