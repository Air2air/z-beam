// app/components/ArticleGrid/CategoryGroupedGrid.tsx
// Category-grouped article display with filtering and search

'use client';

import React, { useState, useMemo } from 'react';
import { Card } from "../Card/Card";
import { Article, MaterialType, BadgeData, ArticleMetadata } from "@/types";
import { slugToDisplayName } from "../../utils/formatting";
import { getGridClasses, createCategoryHeader, GRID_SECTION_SPACING, type GridColumns, type GridGap } from "../../utils/gridConfig";

interface CategoryItem {
  slug: string;
  title?: string;
  description?: string;
  href?: string;
  imageUrl?: string;
  imageAlt?: string;
  badge?: BadgeData;
  tags?: string[];
  category?: string;
  metadata?: Record<string, unknown>;
  article?: Article | null;
}

interface CategoryGroupedGridProps {
  items: CategoryItem[];
  title?: string;
  showSearch?: boolean;
  showCategoryFilter?: boolean;
  maxItemsPerCategory?: number;
  columns?: GridColumns;
  gap?: GridGap;
  className?: string;
}

// Grid configuration now imported from unified system

// Default category ordering for consistent display
const DEFAULT_CATEGORY_ORDER = [
  'Industrial Cleaning',
  'Metal Treatment',
  'Surface Preparation', 
  'Heritage Restoration',
  'Precision Applications',
  'Specialized Materials',
  'Advanced Techniques',
  'General',
  'Other'
];

export function CategoryGroupedGrid({
  items = [],
  title = "Articles by Category",
  showSearch = true,
  showCategoryFilter = true,
  maxItemsPerCategory = 6,
  columns = 3,
  gap = "md",
  className = ""
}: CategoryGroupedGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups = items.reduce((acc, item) => {
      // Extract category from various possible sources
      const category = item.category || 
                      item.metadata?.category as string ||
                      item.article?.metadata?.category as string ||
                      item.tags?.[0] ||
                      'Other';
      
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, CategoryItem[]>);

    // Sort categories by predefined order
    const sortedEntries = Object.entries(groups).sort(([a], [b]) => {
      const indexA = DEFAULT_CATEGORY_ORDER.indexOf(a);
      const indexB = DEFAULT_CATEGORY_ORDER.indexOf(b);
      
      // If category not in order, put at end
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      
      return indexA - indexB;
    });

    return Object.fromEntries(sortedEntries);
  }, [items]);

  // Get all categories for filter buttons
  const categories = Object.keys(groupedItems);

  // Filter items based on search and category selection
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Filter by selected category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => {
        const itemCategory = item.category || 
                           item.metadata?.category as string ||
                           item.article?.metadata?.category as string ||
                           item.tags?.[0] ||
                           'Other';
        return itemCategory === selectedCategory;
      });
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
        (item.metadata?.subject as string)?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [items, selectedCategory, searchTerm]);

  // Toggle category expansion
  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  if (!items.length) {
    return (
      <div className="text-center py-12 text-gray-600 dark:text-gray-400">
        No articles available.
      </div>
    );
  }

  return (
    <div className={`category-grouped-grid ${className}`}>
      {/* Header */}
      {title && (
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h2>
          <div className="w-16 h-1 bg-blue-600 dark:bg-blue-400 rounded"></div>
        </div>
      )}

      {/* Search and Filter Controls */}
      {(showSearch || showCategoryFilter) && (
        <div className="mb-8 space-y-4">
          {/* Search Input */}
          {showSearch && (
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           placeholder-gray-500 dark:placeholder-gray-400"
                aria-label="Search articles"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 
                             text-gray-500 dark:text-gray-400
                             text-xl leading-none"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          )}

          {/* Category Filter Buttons */}
          {showCategoryFilter && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium
                  ${selectedCategory === 'all' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                aria-pressed={selectedCategory === 'all'}
              >
                All Categories ({items.length})
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium
                    ${selectedCategory === category 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  aria-pressed={selectedCategory === category}
                >
                  {category} ({groupedItems[category]?.length || 0})
                </button>
              ))}
            </div>
          )}

          {/* Active filters indicator */}
          {(searchTerm || selectedCategory !== 'all') && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Active filters:</span>
              {searchTerm && (
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                  Search: "{searchTerm}"
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                  Category: {selectedCategory}
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}

      {/* Display Mode: Categories or Filtered Results */}
      {selectedCategory === 'all' && !searchTerm ? (
        // Category-grouped display
        <div className="space-y-12">
          {Object.entries(groupedItems).map(([category, categoryItems]) => {
            const isExpanded = expandedCategories.has(category);
            const displayItems = isExpanded ? categoryItems : categoryItems.slice(0, maxItemsPerCategory);
            const hasMore = categoryItems.length > maxItemsPerCategory;

            return (
              <section key={category} className="category-section">
                {/* Category Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {category}
                    </h3>
                    <div className="w-12 h-1 bg-blue-600 dark:bg-blue-400 rounded"></div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      {categoryItems.length} {categoryItems.length === 1 ? 'article' : 'articles'}
                    </p>
                  </div>
                  
                  {hasMore && (
                    <button
                      onClick={() => toggleCategoryExpansion(category)}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 
                                 rounded-lg"
                    >
                      {isExpanded ? 'Show Less' : `View All ${categoryItems.length}`}
                      <svg 
                        className={`w-4 h-4 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Category Items Grid */}
                <div className={getGridClasses({ columns, gap })}>
                  {displayItems.map((item, index) => (
                    <Card
                      key={`${category}-${item.slug}-${index}`}
                      title={item.title || slugToDisplayName(item.slug)}
                      description={item.description || ''}
                      href={item.href || `/${item.slug}`}
                      imageUrl={item.imageUrl || ''}
                      imageAlt={item.imageAlt || item.title || slugToDisplayName(item.slug)}
                      badge={item.badge}
                      tags={item.tags || []}
                      metadata={{
                        title: item.title || slugToDisplayName(item.slug),
                        slug: item.slug,
                        ...item.metadata
                      } as ArticleMetadata}
                      className="h-full"
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        // Filtered/Search Results Display
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {searchTerm 
                ? `Search Results for "${searchTerm}"` 
                : `${selectedCategory} Articles`
              }
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredItems.length} {filteredItems.length === 1 ? 'article' : 'articles'}
            </span>
          </div>

          {filteredItems.length > 0 ? (
            <div className={getGridClasses({ columns, gap })}>
              {filteredItems.map((item, index) => (
                <Card
                  key={`filtered-${item.slug}-${index}`}
                  title={item.title || slugToDisplayName(item.slug)}
                  description={item.description || ''}
                  href={item.href || `/${item.slug}`}
                  imageUrl={item.imageUrl || ''}
                  imageAlt={item.imageAlt || item.title || slugToDisplayName(item.slug)}
                  badge={item.badge}
                  tags={item.tags || []}
                  metadata={{
                    title: item.title || slugToDisplayName(item.slug),
                    slug: item.slug,
                    ...item.metadata
                  } as ArticleMetadata}
                  className="h-full"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                No articles found {searchTerm ? `for "${searchTerm}"` : 'in this category'}.
              </div>
              <button
                onClick={clearFilters}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                Clear filters and view all articles
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}