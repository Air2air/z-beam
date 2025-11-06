/**
 * @component ServicesSection
 * @purpose Displays featured services section (Services + Equipment Rental)
 * @dependencies SectionContainer, CardGridSSR
 * @aiContext Reusable section for featured services on home page
 *           Uses SectionContainer wrapper for consistent styling
 * 
 * @usage
 * <ServicesSection items={featuredSections} />
 */
import React from 'react';
import { SectionContainer } from '../SectionContainer/SectionContainer';
import { CardGridSSR } from '../CardGrid';
import type { ServicesSectionProps, CardItem, GridColumns } from '@/types/centralized';

export function ServicesSection({ 
  items,
  title = "",
  columns = 2
}: ServicesSectionProps) {
  
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
      <CardGridSSR
        items={cardItems}
        columns={columns}
        variant="featured"
      />
    );
  }
  
  return (
    <SectionContainer title={title} bgColor="transparent" radius={false}>
      <CardGridSSR
        items={cardItems}
        columns={columns}
        variant="featured"
      />
    </SectionContainer>
  );
}

export default ServicesSection;
