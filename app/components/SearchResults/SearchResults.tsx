"use client";

import { useState, useEffect, useMemo } from "react";
import { SearchResultsGrid } from "./SearchResultsGrid";
import { SearchHeader } from "./SearchHeader";
import { SearchResultsCount } from "./SearchResultsCount";
import { EmptySearchResults } from "./EmptySearchResults";
import { Article, EnrichedArticle } from "../../types/Article";

interface SearchResultsProps {
  items: EnrichedArticle[];
  initialTag?: string;
  placeholder?: string;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  showTagFilter?: boolean;
}

export function SearchResults({
  items,
  initialTag = "",
  placeholder = "Search materials, articles, and more...",
  columns = 3,
  className = "",
  showTagFilter = true,
}: SearchResultsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  
  // Extract all unique tags from the items
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    
    items.forEach(item => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach(tag => {
          if (tag) tagSet.add(tag);
        });
      }
    });
    
    return Array.from(tagSet).sort();
  }, [items]);
  
  // Set initial tag from prop
  useEffect(() => {
    if (initialTag) {
      // Decode and normalize the initial tag
      const decodedTag = decodeURIComponent(initialTag)
        .replace(/\+/g, ' ')
        .trim();
      
      // Check if this tag exists in our items
      const tagExists = items.some(item => 
        item.tags && item.tags.some(t => t.toLowerCase() === decodedTag.toLowerCase())
      );
      
      // Try finding a capitalized version of the tag if it exists in our items
      if (!tagExists && decodedTag) {
        const allItemTags = new Set<string>();
        items.forEach(item => {
          if (item.tags) {
            item.tags.forEach(tag => {
              if (tag) allItemTags.add(tag);
            });
          }
        });
        
        // Find the tag with the matching lowercase form
        const matchingTag = Array.from(allItemTags).find(
          tag => tag.toLowerCase() === decodedTag.toLowerCase()
        );
        
        if (matchingTag) {
          setSelectedTag(matchingTag); // Use the version that exists in the items
          return;
        }
      }
      
      setSelectedTag(decodedTag);
    }
  }, [initialTag, items]);
  
  // Simple tag matching function
  function itemMatchesTag(item: any, tag: string): boolean {
    if (!tag) return true;
    if (!item.tags || !Array.isArray(item.tags)) return false;
    
    const tagLower = tag.toLowerCase();
    
    // Enhanced matching logic for tags
    const hasMatch = item.tags.some(t => {
      if (!t) return false;
      
      // Direct match (case-insensitive)
      if (t.toLowerCase() === tagLower) return true;
      
      return false;
    });
    
    return hasMatch;
  }
  
  // Count items matching each tag
  const tagItemCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    // Initialize all tags with zero count
    allTags.forEach(tag => {
      counts[tag] = 0;
    });
    
    // Count items for each tag
    items.forEach(item => {
      allTags.forEach(tag => {
        if (itemMatchesTag(item, tag)) {
          counts[tag] = (counts[tag] || 0) + 1;
        }
      });
    });
    
    return counts;
  }, [items, allTags]);
  
  // Filter to only show tags that have at least one matching item
  const filteredTags = useMemo(() => {
    return allTags.filter(tag => tagItemCounts[tag] > 0);
  }, [allTags, tagItemCounts]);
  
  // Simple search matching function
  function itemMatchesSearch(item: EnrichedArticle, query: string): boolean {
    if (!query) return true;
    
    const queryLower = query.toLowerCase();
    
    return (
      // Title
      (item.title && item.title.toLowerCase().includes(queryLower)) ||
      // Description
      (item.description && item.description.toLowerCase().includes(queryLower)) ||
      // Frontmatter title
      (item.frontmatter?.title && item.frontmatter.title.toLowerCase().includes(queryLower)) ||
      // Frontmatter description
      (item.frontmatter?.description && item.frontmatter.description.toLowerCase().includes(queryLower)) ||
      // Tags
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(queryLower)))
    );
  }

  // Filter items based on search query and selected tag
  const filteredItems = useMemo(() => {
    return items.filter(item => 
      itemMatchesSearch(item, searchQuery) && 
      itemMatchesTag(item, selectedTag)
    );
  }, [items, searchQuery, selectedTag]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search header */}
      <SearchHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        tags={filteredTags}
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
        placeholder={placeholder}
        showTagFilter={showTagFilter}
        tagItemCounts={tagItemCounts}
      />
      
      {/* Results count */}
      <SearchResultsCount
        count={filteredItems.length}
        selectedTag={selectedTag || undefined}
        searchQuery={searchQuery || undefined}
      />
      
      {/* Results grid or empty state */}
      {filteredItems.length > 0 ? (
        <SearchResultsGrid 
          items={filteredItems} 
          columns={columns} 
        />
      ) : (
        <EmptySearchResults />
      )}
      
      {/* Development-only debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 p-4 rounded-md mt-8 text-sm">
          <h3 className="font-bold mb-2">Debug Info</h3>
          <p>Total items: {items.length}</p>
          <p>Filtered items: {filteredItems.length}</p>
          <p>Selected tag: {selectedTag || 'None'}</p>
          <p>Search query: {searchQuery || 'None'}</p>
          
              <div className="mt-3">
                <h4 className="font-semibold">Available Tags:</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {filteredTags.map(tag => (
                    <span 
                      key={tag} 
                      className={`px-2 py-1 text-xs rounded ${
                        tag.toLowerCase() === selectedTag.toLowerCase() 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200'
                      }`}
                    >
                      {tag} <span className="text-xs opacity-75">({tagItemCounts[tag]})</span>
                    </span>
                  ))}
                </div>
              </div>          {/* Show hidden tags */}
          {allTags.length !== filteredTags.length && (
            <div className="mt-3">
              <h4 className="font-semibold text-gray-500">Hidden Tags (No Matching Articles):</h4>
              <div className="flex flex-wrap gap-1 mt-1">
                {allTags
                  .filter(tag => !filteredTags.includes(tag))
                  .map(tag => (
                    <span 
                      key={tag} 
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-400 rounded"
                    >
                      {tag} (0)
                    </span>
                  ))
                }
              </div>
            </div>
          )}
          
          <div className="mt-3">
            <h4 className="font-semibold">Item Details:</h4>
            <ul className="list-disc pl-5 mt-1">
              {items.slice(0, 5).map((item, index) => (
                <li key={index} className="mb-2">
                  <div>
                    <strong>Item {index + 1}:</strong> {item.frontmatter?.name || item.name || 'Unnamed'}
                  </div>
                  <div className="text-xs ml-4">
                    <div><span className="font-semibold">frontmatter.name:</span> {item.frontmatter?.name || 'N/A'}</div>
                    <div><span className="font-semibold">name:</span> {item.name || 'N/A'}</div>
                    <div><span className="font-semibold">title:</span> {item.title || 'N/A'}</div>
                    <div><span className="font-semibold">frontmatter.title:</span> {item.frontmatter?.title || 'N/A'}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Selected Tag Matching */}
          <div className="mt-3">
            <h4 className="font-semibold">Selected Tag Matching:</h4>
            <div className="bg-white p-2 rounded mt-1">
              {selectedTag ? (
                <>
                  <p>Looking for tag: <span className="font-mono bg-yellow-100 px-1">{selectedTag}</span></p>
                  <p>Tag lowercase: <span className="font-mono bg-yellow-100 px-1">{selectedTag.toLowerCase()}</span></p>
                  
                  {/* Compound tag analysis */}
                  {selectedTag.includes(' ') && (
                    <div className="mt-2 p-2 bg-blue-50 rounded">
                      <p className="text-sm font-semibold">Compound Tag Analysis:</p>
                      <p className="text-xs">This is a compound tag with parts:</p>
                      <ul className="list-disc pl-5 text-xs">
                        {selectedTag.toLowerCase().split(' ').map((part, i) => (
                          <li key={i}>{part}</li>
                        ))}
                      </ul>
                      <p className="text-xs mt-1">
                        Items with any of these individual tags will match.
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-2">
                    <p className="font-semibold">Items that should match:</p>
                    <ul className="list-disc pl-5">
                      {items.filter(item => itemMatchesTag(item, selectedTag))
                        .slice(0, 3).map((item, i) => (
                          <li key={i}>
                            {item.title || item.frontmatter?.title || 'Unnamed'} - 
                            <span className="font-mono text-xs">{JSON.stringify(item.tags)}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </>
              ) : (
                <p>No tag selected</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}