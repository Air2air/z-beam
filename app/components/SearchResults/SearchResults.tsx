// app/components/SearchResults/SearchResults.tsx
// Server Component - no client-side interactivity
import React from "react";
import Link from "next/link";
import { SearchResultItem, SearchResultsProps } from "@/types";
import { CardGrid } from "../CardGrid/CardGrid";

export function SearchResults({
  items,
  initialTag = "",
  placeholder = "Search materials, articles, and more...",
  columns = 3,
  className = "",
  showTagFilter = true,
}: SearchResultsProps) {
  
  // Convert SearchableArticle to SearchResultItem format
  const searchResults: SearchResultItem[] = items.map(item => ({
      id: item.id || item.slug || 'unknown',
      slug: item.slug || 'unknown',
      title: item.title || 'Untitled',
      name: item.name,
      description: item.description,
      type: item.metadata?.category || 'article',
      category: item.metadata?.category,
      tags: item.tags,
      href: item.href || `/${item.slug}`,
      image: item.image,
      imageAlt: item.imageAlt || item.title || 'Image',
      metadata: item.metadata,
      badge: item.badge
    } as SearchResultItem));

  return (
    <div className={`space-y-6 ${className}`}>
      <CardGrid 
        searchResults={searchResults}
        mode="search-results"
        columns={columns}
        className="w-full"
      />
    </div>
  );
}