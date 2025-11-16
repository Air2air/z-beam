/**
 * @component HomePageGrid
 * @purpose Displays featured sections on home page (Services + Equipment Rental)
 * @dependencies SectionContainer, CardGridSSR
 * @aiContext Reusable grid for featured items on home page
 *           Uses SectionContainer wrapper for consistent styling
 * 
 * @usage
 * <HomePageGrid items={featuredSections} />
 */
import React from 'react';
import { SectionContainer } from '../SectionContainer/SectionContainer';
import { CardGridSSR } from '../CardGrid';
import type { HomePageGridProps, CardItem, GridColumns } from '@/types/centralized';

export function HomePageGrid({ 
  items,
  title = "",
  columns = 2
}: HomePageGridProps) {
  
  if (!items || items.length === 0) {
    return null;
  }
  
  // Transform items to CardItem format
  const cardItems: CardItem[] = items.map((section) => ({
    slug: section.slug,
    title: section.title,
    description: section.description,
    href: `/${section.slug}`,
    imageUrl: section.imageUrl,
    imageAlt: section.title,
    badge: undefined,
  }));
  
  // If no title, render CardGridSSR directly without SectionContainer
  if (!title) {
    return (
      /* @ts-ignore - Async Server Component (React 19 type limitation) */
      <CardGridSSR
        items={cardItems}
        columns={columns}
        variant="featured"
      />
    );
  }
  
  return (
    <SectionContainer title={title} bgColor="transparent" radius={false}>
      {/* @ts-ignore - Async Server Component (React 19 type limitation) */}
      <CardGridSSR
        items={cardItems}
        columns={columns}
        variant="featured"
      />
    </SectionContainer>
  );
}

export default HomePageGrid;
