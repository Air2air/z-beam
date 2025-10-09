"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CardGrid } from "../components/CardGrid/CardGrid";
import { Article, MaterialType, SearchClientProps } from "@/types";
import { extractSafeValue, safeIncludes } from "../utils/client-safe";
import { Title } from "../components/Title";
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
  
  // Helper function to extract property data
  const extractProperty = (key: string, data: any, propertyName?: string) => {
    if (!data) return;
    
    // Use original key as property name unless override provided
    const displayName = propertyName || key;
    
    if (typeof data === 'object' && data !== null) {
      // Handle nested objects with value/unit structure
      if (data.value !== undefined) {
        const value = data.unit ? `${data.value} ${data.unit}` : String(data.value);
        properties.push({ property: displayName, value });
      } else if (data.numeric !== undefined) {
        const value = data.units ? `${data.numeric} ${data.units}` : String(data.numeric);
        properties.push({ property: displayName, value });
      }
    } else if (data !== null && data !== undefined) {
      // Handle primitive values
      properties.push({ property: displayName, value: String(data) });
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
  const propertyUnit = searchParams?.get('unit') || '';
  
  const [articles] = useState<Article[]>(initialArticles);
  
  // Property search logic
  const isPropertySearch = propertyName && propertyValue;
  
  // Filter articles based on search query and property filters
  const filteredArticles = articles.filter(article => {
    // Check property filter
    if (propertyName && propertyValue) {
      // Get properties from both content and metadata
      const contentProperties = article.content ? parsePropertiesFromContent(article.content) : [];
      const metadataProperties = parsePropertiesFromMetadata(article.metadata);
      const allProperties = [...contentProperties, ...metadataProperties];
      
      // Check for matching property with exact property name matching
      const hasMatchingProperty = allProperties.some(prop => {
        // Direct exact property name matching (most reliable)
        const exactPropertyMatch = prop.property === propertyName;
        
        // More restrictive flexible matching - only if exact match fails
        const searchPropLower = propertyName.toLowerCase().replace(/[^\w]/g, '');
        const actualPropLower = prop.property.toLowerCase().replace(/[^\w]/g, '');
        const flexibleNameMatch = !exactPropertyMatch && actualPropLower === searchPropLower;
        
        // Only allow exact matches or very close flexible matches
        const propNameMatch = exactPropertyMatch || flexibleNameMatch;
        
        // Early exit if property name doesn't match
        if (!propNameMatch) {
          return false;
        }
        
        // Flexible value matching
        const searchVal = String(propertyValue).toLowerCase().trim();
        const actualVal = String(prop.value).toLowerCase().trim();
        
        // Clean values for numeric comparison (remove units and extra formatting)
        const cleanPropValue = prop.value.replace(/[^\d.-]/g, '');
        const cleanSearchValue = propertyValue.replace(/[^\d.-]/g, '');
        
        // Try multiple value matching strategies
        const exactMatch = actualVal === searchVal;
        const containsValueMatch = actualVal.includes(searchVal) || searchVal.includes(actualVal);
        
        // Numeric matching with tighter tolerance
        let numericMatch = false;
        if (cleanPropValue && cleanSearchValue) {
          const propNum = parseFloat(cleanPropValue);
          const searchNum = parseFloat(cleanSearchValue);
          if (!isNaN(propNum) && !isNaN(searchNum)) {
            // Tighter tolerance: 5% for better precision (reduced from 10%)
            const tolerance = Math.max(Math.abs(searchNum * 0.05), 0.1);
            numericMatch = Math.abs(propNum - searchNum) <= tolerance;
          }
        }
        
        // More restrictive value matching - prioritize exact matches
        const valueMatch = exactMatch || numericMatch; // Removed containsValueMatch for precision
        const isMatch = propNameMatch && valueMatch;
        
        return isMatch;
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
  
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <Title level="section" title={
          propertyName && propertyValue ? 
            `Materials with ${capitalizeWords(propertyName.replace(/([A-Z])/g, ' $1').trim())}: ${propertyValue}${propertyUnit ? ' ' + propertyUnit : ''}` :
            query ? `Materials with "${query}"` : 'All Articles'
        } />
        <p className="text-gray-400 text-sm whitespace-nowrap">{filteredArticles.length} results found</p>
      </div>
      
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
    </div>
  );
}
