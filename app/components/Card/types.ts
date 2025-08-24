// app/components/Card/types.ts
// Re-export centralized types for Card component

export type { BadgeData, ArticleMetadata } from '@/types/core';
export type { CardProps } from '@/types/components';

// Legacy support - re-export with original names for backward compatibility
export type { BadgeData as LegacyBadgeData } from '@/types/core';
