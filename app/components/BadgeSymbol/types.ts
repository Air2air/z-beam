// app/components/BadgeSymbol/types.ts
import { Article, ArticleFrontmatter } from '../../types/Article';

export interface BadgeSymbolProps {
  // Style props
  variant?: 'card' | 'large' | 'small';
  position?: string;

  // Data source props
  frontmatter?: ArticleFrontmatter;
  article?: Article;
  slug?: string;
  
  // Direct property props
  symbol?: string;
  formula?: string;
  materialType?: string;
  atomicNumber?: number | string;
  color?: string;
}
