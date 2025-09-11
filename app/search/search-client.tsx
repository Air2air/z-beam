"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ArticleGridClient } from "../components/ArticleGrid/ArticleGridClient";
import { Article, MaterialType } from "@/types/core";

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

interface SearchClientProps {
  initialArticles: Article[];
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

export default function SearchClient({ initialArticles }: SearchClientProps) {
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';
  const propertyName = searchParams?.get('property') || '';
  const propertyValue = searchParams?.get('value') || '';
  
  const [articles] = useState<Article[]>(initialArticles);
  
  // Filter articles based on search query and property filters
  const filteredArticles = articles.filter(article => {
    // Check property filter
    if (propertyName && propertyValue && article.content) {
      const properties = parsePropertiesFromContent(article.content);
      const hasMatchingProperty = properties.some(prop => 
        prop.property.toLowerCase() === propertyName.toLowerCase() && 
        prop.value.toLowerCase() === propertyValue.toLowerCase()
      );
      if (!hasMatchingProperty) {
        return false;
      }
    }
    
    // Then check search query
    if (!query) return true;
    
    const searchTerm = query.toLowerCase();
    return (
      (article.title && String(article.title).toLowerCase().includes(searchTerm)) ||
      (article.description && String(article.description).toLowerCase().includes(searchTerm))
    );
  });
  
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">
          {propertyName && propertyValue ? 
            `Materials with ${propertyName}: "${propertyValue}"` :
            query ? `Search Results for "${query}"` : 'All Articles'
          }
        </h2>
        <p className="text-gray-600">{filteredArticles.length} results found</p>
      </div>
      
      {filteredArticles.length === 0 ? (
        <div className="p-6 bg-gray-100 rounded-lg">
          <p className="text-gray-700">No articles found matching your criteria.</p>
        </div>
      ) : (
        <ArticleGridClient
          items={filteredArticles.map((article) => ({
            slug: article.slug || 'unknown',
            title: article.metadata?.subject || article.title || 'Untitled Article',
            description: article.description || article.excerpt || '',
            href: `/${article.slug}`,
            imageUrl: article.image,
            imageAlt: article.imageAlt || article.title || '',
            badge: (article as any).badgeSymbolData || {
              symbol: article.metadata?.chemicalSymbol,
              formula: article.metadata?.chemicalFormula,
              atomicNumber: article.metadata?.atomicNumber,
              materialType: toMaterialType(article.metadata?.category),
            },
            metadata: article.metadata,
          }))}
          columns={3}
          variant="search"
        />
      )}
    </div>
  );
}
