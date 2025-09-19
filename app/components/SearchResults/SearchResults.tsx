"use client";

import { useState, useEffect, useMemo } from "react";
import { UnifiedArticleGrid } from "../ArticleGrid/UnifiedArticleGrid";
import { SearchHeader } from "./SearchHeader";
import { SearchResultsCount } from "./SearchResultsCount";
import { EmptySearchResults } from "./EmptySearchResults";
import { SearchResultItem } from "@/types";
import { Article, SearchableArticle } from "@/types";
import { extractSafeValue, safeIncludes } from "@/app/utils/stringHelpers";

interface SearchResultsProps {
  items: SearchableArticle[];
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
  function itemMatchesTag(item: SearchableArticle, tag: string): boolean {
    if (!tag) return true;
    if (!item.tags || !Array.isArray(item.tags)) return false;
    
    const tagLower = tag.toLowerCase();
    
    // Enhanced matching logic for tags
    const hasMatch = item.tags.some((t: string) => {
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
  function itemMatchesSearch(item: SearchableArticle, query: string): boolean {
    if (!query) return true;
    
    const queryLower = query.toLowerCase();
    
    return (
      // Title
      (item.title && safeIncludes(extractSafeValue(item.title), queryLower)) ||
      // Description
      (item.description && safeIncludes(extractSafeValue(item.description), queryLower)) ||
      // Frontmatter title
      (item.frontmatter?.title && safeIncludes(extractSafeValue(item.frontmatter.title), queryLower)) ||
      // Frontmatter description
      (item.frontmatter?.description && safeIncludes(extractSafeValue(item.frontmatter.description), queryLower)) ||
      // Tags
      (item.tags && item.tags.some(tag => safeIncludes(extractSafeValue(tag), queryLower)))
    );
  }

  // Filter items based on search query and selected tag
  const filteredItems = useMemo(() => {
    return items.filter(item => 
      itemMatchesSearch(item, searchQuery) && 
      itemMatchesTag(item, selectedTag)
    ).map(item => ({
      id: item.id || item.slug || 'unknown',
      slug: item.slug || 'unknown',
      title: item.title || 'Untitled',
      name: item.name,
      description: item.description,
      type: item.metadata?.category || 'article',
      category: item.metadata?.category,
      articleType: item.metadata?.category || 'article',
      tags: item.tags,
      href: item.href,
      imageAlt: item.imageAlt || item.title || 'Image',
      image: item.image,
      metadata: item.metadata as unknown as Record<string, unknown>, // More specific type
      frontmatter: item.frontmatter,
      content: item.content,
      excerpt: item.excerpt
    } as unknown as SearchResultItem));
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
        <UnifiedArticleGrid 
          searchResults={filteredItems}
          columns={columns}
          variant="search"
        />
      ) : (
        <EmptySearchResults />
      )}
    </div>
  );
}