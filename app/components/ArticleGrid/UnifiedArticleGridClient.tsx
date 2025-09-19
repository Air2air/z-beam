// app/components/ArticleGrid/UnifiedArticleGridClient.tsx
// Clean client component without server function dependencies

"use client";

import React from 'react';
import Link from 'next/link';
import { Card } from '../Card/Card';
import FadeInWrapper from '../FadeInWrapper/FadeInWrapper';
import { Article, MaterialType, BadgeData, SearchResultItem, ArticleMetadata } from "@/types";
import { slugToDisplayName } from "../../utils/formatting";

// Unified grid configuration
const GRID_CONFIGS = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
} as const;

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
  columns?: 1 | 2 | 3 | 4;
  variant?: 'default' | 'compact' | 'featured';
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
  const gridClass = GRID_CONFIGS[columns];

  return (
    <div className={`unified-article-grid ${className}`}>
      {displayTitle && (
        <h2 className="text-2xl font-bold mb-6">{displayTitle}</h2>
      )}
      
      <div className={`grid gap-6 ${gridClass}`}>
        {filteredItems.map((item, index) => {
          const title = item.title || slugToDisplayName(item.slug);
          const href = item.href || `/${item.slug}`;
          const imageUrl = item.imageUrl || item.image;
          
          return (
            <FadeInWrapper key={`${item.slug}-${index}`} delay={index * 100}>
              <Card
                href={href}
                title={title}
                description={item.description || ''}
                imageUrl={imageUrl}
                imageAlt={item.imageAlt || title}
                metadata={item.metadata as any}
                tags={item.tags}
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
