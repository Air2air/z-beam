// app/components/Card/types.ts
export interface BadgeData {
  symbol?: string;
  atomicNumber?: number | string;
  formula?: string;
  materialType?: string;
  color?: string;
  show?: boolean;
}

export interface CardProps {
  href: string;
  title?: string;
  name?: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  imageAlt?: string;
  tags?: string[];
  badge?: BadgeData | null;
  metadata?: Record<string, any>;
  className?: string;
  height?: string;
  frontmatterData?: any; // Add this property
}
