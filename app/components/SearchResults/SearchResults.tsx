// app/components/SearchResults/SearchResults.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "../Card/Card";
import { SearchBar } from "../UI/SearchBar";
import { TagFilter } from "../UI/TagFilter";

interface SearchResultsProps {
  items: Array<{
    id: string;
    title: string;
    description?: string;
    image?: string;
    imageAlt?: string;
    href: string;
    tags?: string[];
    frontmatter?: {
      title?: string;
      description?: string;
      keywords?: string[];
      category?: string;
      date?: string;
      author?: string;
      [key: string]: any;
    };
    materialData?: any;
  }>;
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
  const [selectedTag, setSelectedTag] = useState(initialTag);
  
  // Extract all unique tags from items
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    
    items.forEach(item => {
      // Add tags from the tags array
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach(tag => tagSet.add(tag));
      }
      
      // Add tags/keywords from frontmatter
      if (item.frontmatter?.keywords && Array.isArray(item.frontmatter.keywords)) {
        item.frontmatter.keywords.forEach(keyword => tagSet.add(keyword));
      }
      
      // Add category as a tag if it exists
      if (item.frontmatter?.category) {
        tagSet.add(item.frontmatter.category);
      }
    });
    
    return Array.from(tagSet).sort();
  }, [items]);
  
  // Filter items based on search query and selected tag
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = !searchQuery || 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.frontmatter?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.frontmatter?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.frontmatter?.keywords?.some(keyword => 
          keyword.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      const matchesTag = !selectedTag || 
        item.tags?.includes(selectedTag) ||
        item.frontmatter?.keywords?.includes(selectedTag) ||
        item.frontmatter?.category === selectedTag;
      
      return matchesSearch && matchesTag;
    });
  }, [items, searchQuery, selectedTag]);
  
  // Grid column classes based on number of columns
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };
  
  // Set initial tag from prop
  useEffect(() => {
    if (initialTag) {
      setSelectedTag(initialTag);
    }
  }, [initialTag]);
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and filter section */}
      <div className="space-y-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={placeholder}
          className="w-full max-w-2xl mx-auto"
        />
        
        {showTagFilter && (
          <TagFilter
            tags={allTags}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
            className="flex flex-wrap gap-2 justify-center"
          />
        )}
      </div>
      
      {/* Results count */}
      <div className="text-center text-gray-600 dark:text-gray-300">
        Found {filteredItems.length} {filteredItems.length === 1 ? 'result' : 'results'}
        {selectedTag && <span> for tag <span className="font-medium">{selectedTag}</span></span>}
        {searchQuery && <span> matching <span className="font-medium">"{searchQuery}"</span></span>}
      </div>
      
      {/* Results grid */}
      {filteredItems.length > 0 ? (
        <div className={`grid gap-6 ${gridCols[columns]}`}>
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              href={item.href}
              title={item.title || item.frontmatter?.title || ""}
              description={item.description || item.frontmatter?.description}
              image={item.image}
              imageAlt={item.imageAlt || item.title || ""}
              tags={item.tags || []}
              materialData={item.materialData}
              className="h-full"
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No results found. Try a different search term or tag.
          </p>
        </div>
      )}
    </div>
  );
}