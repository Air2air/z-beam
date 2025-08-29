// app/components/ArticleGrid/ArticleGridClient.tsx
"use client";

import { Card } from "../Card/Card";
import { MaterialType, BadgeData } from "@/types/core";

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

// Unified grid column configuration
const GRID_CONFIGS = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
} as const;

// Processed article item interface (for client-side usage)
interface ProcessedArticleItem {
  slug: string;
  title: string;
  description?: string;
  href: string;
  imageUrl?: string;
  imageAlt?: string;
  badge?: BadgeData | null | { show: boolean } | string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  height?: string;
}

interface ArticleGridClientProps {
  items: ProcessedArticleItem[];
  title?: string;
  heading?: string;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  variant?: 'standard' | 'featured' | 'search';
}

export function ArticleGridClient({
  items,
  title,
  heading,
  columns = 3,
  className = "",
  variant = 'standard'
}: ArticleGridClientProps) {
  const displayTitle = title || heading;

  if (!items?.length) return null;

  return (
    <div className={`article-grid ${className}`}>
      {displayTitle && (
        <h2 className="text-2xl font-bold mb-6">{displayTitle}</h2>
      )}

      <div className={`grid gap-4 ${GRID_CONFIGS[columns]}`}>
        {items.map((item) => {
          // Handle badge conversion
          let finalBadge: BadgeData | null | { show: boolean } = null;
          
          if (item.badge) {
            if (typeof item.badge === 'string') {
              finalBadge = {
                symbol: item.badge,
                show: true,
              };
            } else {
              finalBadge = item.badge;
            }
          }

          return (
            <Card
              key={item.slug}
              title={item.title}
              description={item.description}
              href={item.href}
              imageUrl={item.imageUrl}
              imageAlt={item.imageAlt}
              badge={finalBadge}
              tags={item.tags}
              metadata={item.metadata}
              height={item.height}
              className={variant === 'featured' ? 'featured-item' : ''}
            />
          );
        })}
      </div>
    </div>
  );
}
