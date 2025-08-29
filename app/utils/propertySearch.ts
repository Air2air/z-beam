// app/utils/propertySearch.ts
'use server';

import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { cache } from 'react';
import { Article } from '../../types/core';
import { loadAllArticles } from './contentAPI';
import { stripParenthesesFromSlug } from './formatting';

// Constants
const PROPERTIES_DIRECTORY = path.join(process.cwd(), 'content', 'components', 'propertiestable');

// Types
export interface PropertyValue {
  property: string;  // e.g., "Material Symbol"
  value: string;     // e.g., "GR"
  slug: string;      // The article slug
}

export interface PropertySearchResult {
  value: string;
  property: string;
  articles: Article[];
  count: number;
}

// Cache
let _propertyCache: {
  allPropertyValues: PropertyValue[];
  propertyIndex: Record<string, PropertyValue[]>; // key: "property:value"
  lastUpdated: number;
} | null = null;

const CACHE_EXPIRATION = 15 * 60 * 1000; // 15 minutes

/**
 * Parse property table content from markdown
 */
export async function parsePropertyTableFromContent(content: string): Promise<Array<{property: string, value: string}>> {
  if (!content) return [];
  
  try {
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
        
        // Process property row
        if (cells.length >= 2) {
          const property = cells[0].trim();
          const value = cells[1].trim();
          
          if (property && value && value !== 'N/A') {
            properties.push({ property, value });
          }
        }
      }
    }
    
    return properties;
  } catch (error) {
    console.error("Error parsing property table content:", error);
    return [];
  }
}

/**
 * Get properties for a specific article from propertiestable file
 */
export async function getArticleProperties(slug: string): Promise<Array<{property: string, value: string}>> {
  try {
    const propertyPath = path.join(PROPERTIES_DIRECTORY, `${slug}.md`);
    
    if (!existsSync(propertyPath)) {
      return [];
    }
    
    const content = await fs.readFile(propertyPath, 'utf8');
    return await parsePropertyTableFromContent(content);
  } catch (error) {
    console.error(`Error loading properties for ${slug}:`, error);
    return [];
  }
}

/**
 * Get all property files
 */
export async function getAllPropertyFiles(): Promise<string[]> {
  try {
    if (!existsSync(PROPERTIES_DIRECTORY)) {
      return [];
    }
    
    const files = await fs.readdir(PROPERTIES_DIRECTORY);
    return files.filter(file => file.endsWith('.md'));
  } catch (error) {
    console.error('Error reading properties directory:', error);
    return [];
  }
}

// Cache initialization
async function initializePropertyCache() {
  // Skip if cache is still valid
  if (_propertyCache && (Date.now() - _propertyCache.lastUpdated < CACHE_EXPIRATION)) {
    return _propertyCache;
  }
  
  // Get all property files
  const propertyFiles = await getAllPropertyFiles();
  const allPropertyValues: PropertyValue[] = [];
  const propertyIndex: Record<string, PropertyValue[]> = {};
  
  // Process each property file
  for (const file of propertyFiles) {
    const slug = stripParenthesesFromSlug(file.replace('.md', ''));
    const properties = await getArticleProperties(slug);
    
    for (const { property, value } of properties) {
      const propertyValue: PropertyValue = { property, value, slug };
      allPropertyValues.push(propertyValue);
      
      // Index by property:value for quick lookup
      const key = `${property}:${value}`;
      if (!propertyIndex[key]) {
        propertyIndex[key] = [];
      }
      propertyIndex[key].push(propertyValue);
    }
  }
  
  // Create cache
  _propertyCache = {
    allPropertyValues,
    propertyIndex,
    lastUpdated: Date.now()
  };
  
  return _propertyCache;
}

/**
 * Get all unique property values
 */
export const getAllPropertyValues = cache(async (): Promise<PropertyValue[]> => {
  await initializePropertyCache();
  return _propertyCache?.allPropertyValues || [];
});

/**
 * Get all unique property names
 */
export const getAllPropertyNames = cache(async (): Promise<string[]> => {
  const propertyValues = await getAllPropertyValues();
  const propertyNames = new Set(propertyValues.map(pv => pv.property));
  return Array.from(propertyNames).sort();
});

/**
 * Get all unique values for a specific property
 */
export const getValuesForProperty = cache(async (propertyName: string): Promise<string[]> => {
  const propertyValues = await getAllPropertyValues();
  const values = new Set(
    propertyValues
      .filter(pv => pv.property === propertyName)
      .map(pv => pv.value)
  );
  return Array.from(values).sort();
});

/**
 * Search articles by property value
 */
export const searchByPropertyValue = cache(async (property: string, value: string): Promise<Article[]> => {
  await initializePropertyCache();
  
  const key = `${property}:${value}`;
  const propertyValues = _propertyCache?.propertyIndex[key] || [];
  
  // Get all articles
  const allArticles = await loadAllArticles();
  
  // Filter articles that have this property value
  const matchingSlugs = new Set(propertyValues.map(pv => pv.slug));
  return allArticles.filter(article => article.slug && matchingSlugs.has(article.slug));
});

/**
 * Get popular property values by usage count
 */
export const getPopularPropertyValues = cache(async (limit: number = 20): Promise<Array<{property: string, value: string, count: number}>> => {
  await initializePropertyCache();
  
  const valueCounts: Record<string, {property: string, value: string, count: number}> = {};
  
  if (_propertyCache) {
    for (const [key, propertyValues] of Object.entries(_propertyCache.propertyIndex)) {
      const [property, value] = key.split(':');
      valueCounts[key] = {
        property,
        value,
        count: propertyValues.length
      };
    }
  }
  
  // Convert to array and sort by count
  const sortedValues = Object.values(valueCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
  
  return sortedValues;
});

/**
 * Search articles by any property value (fuzzy search)
 */
export const searchByAnyProperty = cache(async (searchTerm: string): Promise<Article[]> => {
  const searchLower = searchTerm.toLowerCase();
  const propertyValues = await getAllPropertyValues();
  
  // Find property values that match the search term
  const matchingPropertyValues = propertyValues.filter(pv => 
    pv.value.toLowerCase().includes(searchLower) ||
    pv.property.toLowerCase().includes(searchLower)
  );
  
  // Get unique slugs
  const matchingSlugs = new Set(matchingPropertyValues.map(pv => pv.slug));
  
  // Get all articles and filter
  const allArticles = await loadAllArticles();
  return allArticles.filter(article => article.slug && matchingSlugs.has(article.slug));
});

/**
 * Get property summary for an article
 */
export const getArticlePropertySummary = cache(async (slug: string): Promise<Array<{property: string, value: string}>> => {
  return await getArticleProperties(slug);
});

/**
 * Invalidate the property cache
 */
export async function invalidatePropertyCache(): Promise<void> {
  _propertyCache = null;
}
