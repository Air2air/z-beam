/**
 * @component CardGrid
 * @purpose Unified grid component for displaying articles with multiple layout modes
 * @dependencies @/types (CardGridProps, CardItem), @/utils/formatting, TagFilter, Card
 * @related CardGridSSR.tsx, Card/Card.tsx, UI/TagFilter.tsx
 * @complexity Medium (448 lines, 3 display modes: simple, category-grouped, search-results)
 * @aiContext Always import CardGridProps from @/types. Use mode prop to control display type.
 *           For category grouping, articles must have frontmatter.category. Search mode handles filtering.
 */
// app/components/CardGrid/CardGrid.tsx
// Single unified grid component for all card display needs

'use client';

import React, { useState, useMemo } from 'react';
import { Card } from "../Card/Card";
import { Button } from "../Button";
import { Article, MaterialType, BadgeData, SearchResultItem, ArticleMetadata, CardItem, CardGridProps, GridColumns, GridGap } from "@/types";
import { slugToDisplayName } from "../../utils/formatting";
import { getGridClasses } from "../../utils/gridConfig";
import { Title } from '../Title';
import { SectionTitle } from '../SectionTitle/SectionTitle';

// Unified item interface that handles all data sources - now imported from @/types

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

export function CardGrid({
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
}: CardGridProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Process input data into unified format
  const processedItems = useMemo((): CardItem[] => {
    let processed: CardItem[] = [];

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
    }, {} as Record<string, CardItem[]>);

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

    // Apply filterBy if specified (case-insensitive)
    if (filterBy && filterBy !== 'all') {
      filtered = filtered.filter(item => 
        item.category?.toLowerCase() === filterBy.toLowerCase() ||
        (item.metadata && 'articleType' in item.metadata && typeof item.metadata.articleType === 'string' && item.metadata.articleType.toLowerCase() === filterBy.toLowerCase()) ||
        (typeof item.metadata?.category === 'string' && item.metadata.category.toLowerCase() === filterBy.toLowerCase())
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
      <div className={`article-grid article-grid--category-grouped mb-10 ${className}`}>
        {/* Header */}
        {displayTitle && (
          <div className="mb-8">
            <SectionTitle title={displayTitle} />
            <div className="w-16 h-1 bg-blue-600 dark:bg-blue-400 rounded"></div>
          </div>
        )}

        {/* Search and Filter Controls */}
        {(showSearch || showCategoryFilter) && (
          <div className="mb-8 space-y-4">
            {/* Search Input */}
            {showSearch && (
              <search role="search" className="relative max-w-md">
                <form role="search" onSubmit={(e) => e.preventDefault()}>
                  <label htmlFor="article-search" className="sr-only">
                    Search articles
                  </label>
                  <input
                    id="article-search"
                    type="search"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                               focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                    aria-label="Search articles"
                  />
                  {searchTerm && (
                    <Button
                      variant="minimal"
                      size="md"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 
                                 text-gray-500 text-xl leading-none p-0 min-h-0"
                      aria-label="Clear search"
                    >
                      ×
                    </Button>
                  )}
                </form>
              </search>
            )}

            {/* Category Filter Buttons */}
            {showCategoryFilter && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setSelectedCategory('all')}
                  className={selectedCategory === 'all' 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md hover:bg-blue-700 hover:border-blue-700' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }
                >
                  All Categories ({processedItems.length})
                </Button>
                {categories.map(category => (
                  <Button
                    variant="outline"
                    size="md"
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md hover:bg-blue-700 hover:border-blue-700' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }
                  >
                    {category} ({groupedItems[category]?.length || 0})
                  </Button>
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
                <Button
                  variant="minimal"
                  size="md"
                  onClick={clearFilters}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700"
                >
                  Clear all
                </Button>
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

              const categoryId = `category-${category.toLowerCase().replace(/\s+/g, '-')}`;
              
              return (
                <section 
                  key={category} 
                  className="category-section"
                  aria-labelledby={categoryId}
                  itemScope
                  itemType="https://schema.org/CollectionPage"
                >
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 
                        id={categoryId}
                        className="text-gray-900 dark:text-gray-100 mb-2"
                        itemProp="name"
                      >
                        <strong>{category}</strong>
                      </h3>
                      <meta itemProp="numberOfItems" content={String(categoryItems.length)} />
                      <div className="w-12 h-1 bg-blue-600 dark:bg-blue-400 rounded"></div>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {categoryItems.length} {categoryItems.length === 1 ? 'article' : 'articles'}
                      </p>
                    </div>
                    
                    {hasMore && (
                      <Button
                        variant="minimal"
                        size="md"
                        onClick={() => toggleCategoryExpansion(category)}
                        iconRight={
                          <svg 
                            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                          </svg>
                        }
                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 
                                   hover:bg-blue-50 dark:hover:bg-blue-900"
                      >
                        {isExpanded ? 'Show Less' : `View All ${categoryItems.length}`}
                      </Button>
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
                        className="h-full card-enhanced-hover"
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
              <h3 className="text-gray-900 dark:text-gray-100">
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
                    className="h-full card-enhanced-hover"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400 mb-4">
                  No articles found {searchTerm ? `for "${searchTerm}"` : 'in this category'}.
                </div>
                <Button
                  variant="minimal"
                  size="md"
                  onClick={clearFilters}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700"
                >
                  Clear filters and view all articles
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Simple grid mode (default)
  return (
    <div className={`article-grid article-grid--simple mb-10 ${className}`}>
      {/* Header */}
      {displayTitle && (
        <div className="mb-8">
          <Title level="section" title={title || heading || "Articles"} />
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
            variant={variant === 'featured' ? 'featured' : 'standard'}
            className={`card-enhanced-hover`}
          />
        ))}
      </div>
    </div>
  );
}