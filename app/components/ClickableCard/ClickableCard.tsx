/**
 * @component ClickableCard
 * @purpose Extends ContentCard with entire card being clickable/linkable
 * @dependencies ContentCard, Next.js Link
 * @accessibility WCAG 2.1 AA compliant with semantic link wrapper and hover states
 * @aiContext Use this when you need a ContentCard that links to another page
 *           The entire card is clickable with proper hover effects
 *           Extends all ContentCard functionality with href prop
 * 
 * @usage
 * <ClickableCard
 *   href="/services"
 *   heading="Equipment Rental"
 *   text="Professional laser cleaning equipment for rent"
 *   details={["Hourly packages available", "Training included", "24/7 support"]}
 * />
 */
import React from 'react';
import Link from 'next/link';
import { ContentCard } from '../ContentCard/ContentCard';
import type { ContentCardProps } from '@/types';

export interface ClickableCardProps extends ContentCardProps {
  href: string;
  openInNewTab?: boolean;
}

export function ClickableCard({
  href,
  openInNewTab = false,
  ...contentCardProps
}: ClickableCardProps) {
  const linkProps = openInNewTab
    ? {
        target: '_blank' as const,
        rel: 'noopener noreferrer' as const,
      }
    : {};

  return (
    <Link
      href={href}
      {...linkProps}
      className="block group transition-all duration-200 hover:scale-[1.005] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4 rounded-md"
      aria-label={`Navigate to ${contentCardProps.heading}`}
    >
      <div className="h-full transition-all duration-200 group-hover:shadow-xl group-hover:brightness-[1.02]">
        <ContentCard {...contentCardProps} />
      </div>
    </Link>
  );
}
