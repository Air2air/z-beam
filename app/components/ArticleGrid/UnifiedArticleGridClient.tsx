// app/components/ArticleGrid/UnifiedArticleGridClient.tsx
// Clean client component without server function dependencies

"use client";

import React from 'react';
import Link from 'next/link';
import { Card } from '../Card/Card';
import FadeInWrapper from '../FadeInWrapper/FadeInWrapper';
import { Article, MaterialType, BadgeData, SearchResultItem, ArticleMetadata } from "@/types";
import { slugToDisplayName } from "../../utils/formatting";
import { getGridClasses, type GridColumns, type GridGap } from "../../utils/gridConfig";

// Grid configuration now imported from unified system

// Unified input types
interface ArticleItem {
  slug: string;
  title?: string;
  description?: string;
  href?: string;
  imageUrl?: string;
  imageAlt?: string;
  image?: string;
  badge?: any;
  tags?: string[];
  category?: string;
  metadata?: Record<string, unknown>;
  badgeSymbolData?: BadgeData | null;
}

interface UnifiedArticleGridProps {
  items?: ArticleItem[];
  searchResults?: SearchResultItem[];
  slugs?: string[];
  columns?: GridColumns;
  gap?: GridGap;
  variant?: 'default' | 'compact' | 'featured' | 'search';
  heading?: string;
  className?: string;
  showBadgeSymbols?: boolean;
  filterBy?: 'all' | 'material' | 'application' | 'technique' | string;
}

export function UnifiedArticleGridClient({
  items = [],
  searchResults = [],
  slugs = [],
  columns = 3,
  gap = "md",
  variant = 'default',
  heading,
  className = '',
  showBadgeSymbols = true,
  filterBy = 'all'
}: UnifiedArticleGridProps) {
  // Process items based on input type - client component only uses provided data
  let processedItems: ArticleItem[] = [];
  
  if (searchResults && searchResults.length > 0) {
    processedItems = searchResults.map(result => ({
      slug: result.slug,
      title: result.title,
      description: result.description,
      href: result.href || `/${result.slug}`,
      imageUrl: (result as any).imageUrl,
      imageAlt: (result as any).imageAlt,
      badge: (result as any).badge,
      tags: (result as any).tags,
      category: (result as any).category,
      badgeSymbolData: (result as any).badgeSymbolData
    }));
  } else if (items && items.length > 0) {
    processedItems = items;
  } else if (slugs && slugs.length > 0) {
    // Convert slugs to basic items
    processedItems = slugs.map(slug => ({ 
      slug,
      title: slugToDisplayName(slug),
      href: `/${slug}`,
      description: ''
    }));
  }

  // Filter items based on filterBy
  const filteredItems = filterBy === "all" 
    ? processedItems
    : processedItems.filter((item) => 
        item.category === filterBy ||
        item.metadata?.articleType === filterBy ||
        item.metadata?.category === filterBy
      );

  if (!filteredItems?.length) return null;

  const displayTitle = heading;

  return (
    <div className={`unified-article-grid ${className}`}>
      {displayTitle && (
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{displayTitle}</h2>
          <div className="w-16 h-1 bg-blue-600 dark:bg-blue-400 rounded"></div>
        </div>
      )}
      
      <div className={getGridClasses({ columns, gap })}>
        {filteredItems.map((item, index) => {
          const title = item.title || slugToDisplayName(item.slug);
          const href = item.href || `/${item.slug}`;
          const imageUrl = item.imageUrl || item.image;
          
          // Create frontmatter object from item data
          const frontmatter = {
            ...item.metadata,
            title: title,
            description: item.description || '',
            slug: item.slug,
            images: {
              hero: {
                url: imageUrl,
                alt: item.imageAlt || title
              }
            },
            tags: item.tags
          };
          
          return (
            <FadeInWrapper key={`${item.slug}-${index}`} delay={index * 100}>
              <Card
                frontmatter={frontmatter}
                href={href}
                height={variant === 'compact' ? 'h-48' : 'h-64'}
              />
            </FadeInWrapper>
          );
        })}
      </div>
    </div>
  );
}

// Export as the main component
export { UnifiedArticleGridClient as UnifiedArticleGrid };
