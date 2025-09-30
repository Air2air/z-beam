// app/components/ArticleGrid/ArticleGrid.tsx
// Single unified grid component for all article display needs

'use client';

import React, { useState, useMemo } from 'react';
import { Card } from "../Card/Card";
import { Article, MaterialType, BadgeData, SearchResultItem, ArticleMetadata } from "@/types";
import { slugToDisplayName } from "../../utils/formatting";
import { getGridClasses, createSectionHeader, createCategoryHeader, type GridColumns, type GridGap } from "../../utils/gridConfig";

// Unified item interface that handles all data sources
interface GridItem {
  slug: string;
  title?: string;
  description?: string;
  href?: string;
  imageUrl?: string;
  imageAlt?: string;
  image?: string;
  badge?: BadgeData;
  tags?: string[];
  category?: string;
  metadata?: Record<string, unknown>;
  article?: Article | null;
}

// Comprehensive props interface supporting all use cases
interface ArticleGridProps {
  // Data sources (use one)
  items?: GridItem[];
  slugs?: string[];
  searchResults?: SearchResultItem[];
  
  // Display configuration
  title?: string;
  heading?: string;
  columns?: GridColumns;
  gap?: GridGap;
  
  // Layout modes
  mode?: 'simple' | 'category-grouped' | 'search-results';
  variant?: 'default' | 'compact' | 'featured';
  
  // Category grouping options (for mode: 'category-grouped')
  showSearch?: boolean;
  showCategoryFilter?: boolean;
  maxItemsPerCategory?: number;
  categoryOrder?: string[];
  
  // Filtering
  filterBy?: string;
  
  // Badge handling
  showBadgeSymbols?: boolean;
  loadBadgeSymbolData?: boolean;
  
  // Styling
  className?: string;
}

// Default category ordering
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

export function ArticleGrid({
  items = [],
  slugs = [],
  searchResults = [],
  title,
  heading,
  columns = 3,
  gap = "md",
  mode = 'simple',
  variant = 'default',
  showSearch = true,
  showCategoryFilter = true,
  maxItemsPerCategory = 6,
  categoryOrder = DEFAULT_CATEGORY_ORDER,
  filterBy = 'all',
  showBadgeSymbols = true,
  loadBadgeSymbolData = false,
  className = ""
}: ArticleGridProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Process input data into unified format
  const processedItems = useMemo((): GridItem[] => {
    let processed: GridItem[] = [];

    if (searchResults.length > 0) {
      processed = searchResults.map(result => ({
        slug: result.slug,
        title: result.title,
        description: result.description,
        href: result.href || `/${result.slug}`,
        imageUrl: result.image,
        imageAlt: result.imageAlt || result.title,
        badge: (result as any).badge,
        tags: result.tags || [],
        category: result.category || 'Other',
        metadata: result.metadata || {}
      }));
    } else if (items.length > 0) {
      processed = items;
    } else if (slugs.length > 0) {
      processed = slugs.map(slug => ({
        slug,
        title: slugToDisplayName(slug),
        href: `/${slug}`,
        description: '',
        category: 'Other'
      }));
    }

    return processed;
  }, [items, slugs, searchResults]);

  // Group items by category if needed
  const groupedItems = useMemo(() => {
    if (mode !== 'category-grouped') return { 'All': processedItems };
    
    const groups = processedItems.reduce((acc, item) => {
      const category = item.category || 
                      item.metadata?.category as string ||
                      item.tags?.[0] ||
                      'Other';
      
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, GridItem[]>);

    // Sort categories by predefined order
    const sortedEntries = Object.entries(groups).sort(([a], [b]) => {
      const indexA = categoryOrder.indexOf(a);
      const indexB = categoryOrder.indexOf(b);
      
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      
      return indexA - indexB;
    });

    return Object.fromEntries(sortedEntries);
  }, [processedItems, mode, categoryOrder]);

  // Filter items based on search and category selection
  const filteredItems = useMemo(() => {
    let filtered = processedItems;

    // Apply filterBy if specified
    if (filterBy && filterBy !== 'all') {
      filtered = filtered.filter(item => 
        item.category === filterBy ||
        item.metadata?.articleType === filterBy ||
        item.metadata?.category === filterBy
      );
    }

    // Apply category filter (for category-grouped mode)
    if (mode === 'category-grouped' && selectedCategory !== 'all') {
      filtered = filtered.filter(item => {
        const itemCategory = item.category || 
                           item.metadata?.category as string ||
                           item.tags?.[0] ||
                           'Other';
        return itemCategory === selectedCategory;
      });
    }

    // Apply search filter
    if (searchTerm && mode === 'category-grouped') {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [processedItems, filterBy, selectedCategory, searchTerm, mode]);

  // Get categories for filter buttons
  const categories = Object.keys(groupedItems);

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

  if (!processedItems.length) {
    return (
      <div className="text-center py-12 text-gray-600 dark:text-gray-400">
        No articles available.
      </div>
    );
  }

  const displayTitle = title || heading;

  // Render based on mode
  if (mode === 'category-grouped') {
    return (
      <div className={`article-grid article-grid--category-grouped ${className}`}>
        {/* Header */}
        {displayTitle && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {displayTitle}
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
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Search articles"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 
                               text-gray-500 text-xl leading-none"
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${selectedCategory === 'all' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                  All Categories ({processedItems.length})
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
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}

        {/* Category or Filtered Display */}
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
                                   hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                      >
                        {isExpanded ? 'Show Less' : `View All ${categoryItems.length}`}
                        <svg 
                          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
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
                        frontmatter={{
                          title: item.title || slugToDisplayName(item.slug),
                          subject: item.title || slugToDisplayName(item.slug),
                          slug: item.slug,
                          description: item.description || '',
                          images: {
                            hero: {
                              alt: item.imageAlt || item.title || slugToDisplayName(item.slug)
                            }
                          },
                          tags: item.tags || [],
                          ...item.metadata
                        } as ArticleMetadata}
                        href={item.href || `/${item.slug}`}
                        badge={showBadgeSymbols ? item.badge : undefined}
                        className="h-full hover:shadow-lg transition-shadow duration-300"
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          // Filtered results display
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
                    frontmatter={{
                      title: item.title || slugToDisplayName(item.slug),
                      subject: item.title || slugToDisplayName(item.slug),
                      slug: item.slug,
                      description: item.description || '',
                      images: {
                        hero: {
                          alt: item.imageAlt || item.title || slugToDisplayName(item.slug)
                        }
                      },
                      tags: item.tags || [],
                      ...item.metadata
                    } as ArticleMetadata}
                    href={item.href || `/${item.slug}`}
                    badge={showBadgeSymbols ? item.badge : undefined}
                    className="h-full hover:shadow-lg transition-shadow duration-300"
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
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
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

  // Simple grid mode (default)
  return (
    <div className={`article-grid article-grid--simple ${className}`}>
      {/* Header */}
      {displayTitle && (
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {displayTitle}
          </h2>
          <div className="w-16 h-1 bg-blue-600 dark:bg-blue-400 rounded"></div>
        </div>
      )}

      {/* Simple Grid */}
      <div className={getGridClasses({ columns, gap })}>
        {filteredItems.map((item, index) => (
          <Card
            key={`${item.slug}-${index}`}
            frontmatter={{
              title: item.title || slugToDisplayName(item.slug),
              subject: item.title || slugToDisplayName(item.slug),
              slug: item.slug,
              description: item.description || '',
              images: {
                hero: {
                  alt: item.imageAlt || item.title || slugToDisplayName(item.slug)
                }
              },
              tags: item.tags || [],
              ...item.metadata
            } as ArticleMetadata}
            href={item.href || `/${item.slug}`}
            badge={showBadgeSymbols ? item.badge : undefined}
            className={`h-full hover:shadow-lg transition-shadow duration-300 ${
              variant === 'compact' ? 'compact' : variant === 'featured' ? 'featured' : ''
            }`}
            height={variant === 'compact' ? 'h-48' : variant === 'featured' ? 'auto' : undefined}
          />
        ))}
      </div>
    </div>
  );
}