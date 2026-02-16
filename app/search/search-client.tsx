"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { CardGrid } from "../components/CardGrid/CardGrid";
import { Article, MaterialType, SearchClientProps } from "@/types";
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

// Flatten object into searchable text (replaces deep recursive search)
function flattenToSearchableText(obj: any, maxDepth: number = 3, currentDepth: number = 0): string {
  if (!obj || currentDepth > maxDepth) return '';
  
  // Skip image/url fields
  const skipKeys = ['image', 'imageUrl', 'imageAlt', 'url', 'href', 'id', 'slug', 'filepath', 'path'];
  
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return String(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => flattenToSearchableText(item, maxDepth, currentDepth + 1)).join(' ');
  }
  
  if (typeof obj === 'object' && obj !== null) {
    return Object.entries(obj)
      .filter(([key]) => !skipKeys.includes(key))
      .map(([_, value]) => flattenToSearchableText(value, maxDepth, currentDepth + 1))
      .join(' ');
  }
  
  return '';
}

// Simple synchronous property parser for client-side filtering
function _parsePropertiesFromContent(content: string): Array<{property: string, value: string}> {
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
  
  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);
  
  // Cache: Pre-parse properties once per article
  const propertyCache = useMemo(() => {
    const cache = new Map<string, Array<{property: string, value: string}>>();
    
    articles.forEach(article => {
      const slug = article.slug || String(Math.random());
      cache.set(slug, parsePropertiesFromMetadata(article.frontmatter));
    });
    
    return cache;
  }, [articles]);
  
  // Cache: Build searchable index once
  const searchIndex = useMemo(() => {
    return articles.map(article => {
      const metadata = article.frontmatter as any;
      
      // Build flat searchable text
      const searchableFields = [
        article.title,
        article.name,
        article.description,
        article.tags?.join(' '),
        metadata?.category,
        metadata?.subcategory,
        metadata?.author?.name || metadata?.author_object?.name,
        metadata?.subtitle,
        metadata?.keywords?.join(' '),
        // Flatten complex objects
        flattenToSearchableText(metadata?.materialProperties),
        flattenToSearchableText(metadata?.machineSettings),
        flattenToSearchableText(metadata?.applications),
        flattenToSearchableText(metadata?.micro),
        flattenToSearchableText(metadata?.regulatoryStandards),
      ];
      
      const searchText = searchableFields
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      
      return {
        article,
        searchText,
        slug: article.slug || ''
      };
    });
  }, [articles]);
  
  // Property search logic
  const _isPropertySearch = propertyName && propertyValue;
  
  // Normalize property name for comparison (remove spaces, convert to lowercase)
  const normalizePropertyName = (name: string): string => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
  };
  
  const normalizedSearchProperty = propertyName ? normalizePropertyName(propertyName) : '';
  
  // Track extracted unit from properties
  const [extractedUnit, setExtractedUnit] = useState<string>('');
  
  // Extract unit from first matching property across all articles
  useEffect(() => {
    if (propertyName && propertyValue && searchIndex.length > 0) {
      const normalizedSearchProperty = normalizePropertyName(propertyName);
      
      for (const { slug } of searchIndex) {
        const allProperties = propertyCache.get(slug) || [];
        
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
  }, [propertyName, propertyValue, searchIndex, propertyCache]);
  
  // Memoized filter: Only re-compute when inputs change
  const filteredArticles = useMemo(() => {
    return searchIndex.filter(({ article: _article, searchText, slug }) => {
      // Check property filter first (more specific)
      if (propertyName && propertyValue) {
        const allProperties = propertyCache.get(slug) || [];
        
        // Check for matching property with normalized property name matching
        const hasMatchingProperty = allProperties.some(prop => {
          // Normalize both property names for comparison
          const normalizedPropName = normalizePropertyName(prop.property);
          const propNameMatch = normalizedPropName === normalizedSearchProperty;
          
          if (!propNameMatch) return false;
          
          // Flexible value matching
          const searchVal = String(propertyValue).toLowerCase().trim();
          const actualVal = String(prop.value).toLowerCase().trim();
          
          const exactMatch = actualVal === searchVal;
          
          // Numeric matching with tolerance
          let numericMatch = false;
          const searchNum = parseFloat(searchVal.match(/[\d.]+/)?.[0] || searchVal);
          const propNum = parseFloat(actualVal.match(/[\d.]+/)?.[0] || actualVal);
          
          if (!isNaN(searchNum) && !isNaN(propNum)) {
            const rangeMatch = actualVal.match(/([\d.]+)\s*[-–]\s*([\d.]+)/);
            
            if (rangeMatch) {
              const rangeMin = parseFloat(rangeMatch[1]);
              const rangeMax = parseFloat(rangeMatch[2]);
              numericMatch = searchNum >= rangeMin && searchNum <= rangeMax;
            } else {
              const tolerance = Math.max(Math.abs(searchNum * 0.1), 0.1);
              numericMatch = Math.abs(propNum - searchNum) <= tolerance;
            }
          }
          
          return exactMatch || numericMatch;
        });
        
        if (!hasMatchingProperty) return false;
      }
      
      // Then check search query using pre-built index
      if (!debouncedQuery) return true;
      
      const searchTerm = debouncedQuery.toLowerCase();
      return searchText.includes(searchTerm);
    }).map(({ article }) => article);
  }, [searchIndex, debouncedQuery, propertyName, propertyValue, propertyCache, normalizedSearchProperty]);
  
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
        <div className="p-6 bg-gray-100 rounded-md">
          <p className="text-gray-700">No articles found matching your criteria.</p>
        </div>
      ) : (
        <CardGrid
          items={filteredArticles.map((article) => ({
            slug: article.slug || 'unknown',
            title: article.name || article.title || 'Untitled Article',
            description: article.description || '',
            href: (article.frontmatter as any)?.fullPath || (article as any).fullPath || `/${article.slug}`,
            imageUrl: article.image,
            imageAlt: article.imageAlt || article.name || article.title || '',
            badge: (article as any).badgeSymbolData || {
              symbol: (article.frontmatter as any)?.chemicalSymbol,
              formula: (article.frontmatter as any)?.chemicalFormula,
              atomicNumber: (article.frontmatter as any)?.atomicNumber,
              materialType: toMaterialType(
                article.frontmatter && 'category' in article.frontmatter && typeof article.frontmatter.category === 'string' 
                  ? article.frontmatter.category 
                  : undefined
              ),
            },
            metadata: (article.frontmatter ?? article.metadata) as Record<string, unknown>,
            frontmatter: (article.frontmatter ?? article.metadata) as Record<string, unknown>,
          }))}
          columns={3}
        />
      )}
    </>
  );
}
