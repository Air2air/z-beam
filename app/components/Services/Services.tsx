/**
 * @component Services
 * @purpose Displays featured service sections (Services + Equipment Rental)
 * @dependencies SectionContainer, CardGridSSR
 * @aiContext Hardcoded service offerings grid
 *           Uses SectionContainer wrapper for consistent styling
 * 
 * @usage
 * <Services />
 */
import React from 'react';
import { SectionContainer } from '../SectionContainer/SectionContainer';
import { CardGridSSR } from '../CardGrid';
import type { CardItem } from '@/types/centralized';

export function Services() {
  // Hardcoded service items
  const cardItems: CardItem[] = [
    {
      slug: 'services',
      title: 'Professional Services',
      description: 'Expert technicians, on-site service',
      href: '/services',
      imageUrl: '/images/pages/operator.jpg',
      imageAlt: 'Professional Service',
      badge: undefined,
    },
    {
      slug: 'rental',
      title: 'Equipment Rental',
      description: 'Self-service with training & support',
      href: '/rental',
      imageUrl: '/images/pages/versaflow.jpg',
      imageAlt: 'Equipment Rental',
      badge: undefined,
    }
  ];
  
  return (
    <CardGridSSR
      items={cardItems}
      columns={2}
      variant="featured"
    />
  );
}

export default Services;
