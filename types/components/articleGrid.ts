// types/components/articleGrid.ts
// Type definitions for ArticleGrid component

import type { ComponentData } from '@/app/utils/contentAPI';

export interface ArticleItem {
  slug: string;
  title?: string;
  description?: string;
  href?: string;
  imageUrl?: string;
  imageAlt?: string;
  badge?: any; // Using any for now to avoid type conflicts
  tags?: string[];
  featured?: boolean;
  metadata?: Record<string, unknown>;
  height?: string;
  name?: string;
  image?: string;
  article?: {
    metadata?: Record<string, unknown>;
    components?: Record<string, ComponentData>;
  } | null;
}

export interface ArticleGridProps {
  items: ArticleItem[];
  title?: string;
  heading?: string;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  showBadgeSymbols?: boolean;
  loadBadgeSymbolData?: boolean;
  variant?: 'standard' | 'featured';
}
