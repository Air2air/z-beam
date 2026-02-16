/**
 * @component ContentSection
 * @purpose Wrapper for rendering collections of ContentCards (e.g., workflow, callouts)
 * @dependencies ContentCard, BaseSection
 * @aiContext Use this to display multiple ContentCards with an optional section title
 *           Perfect for workflow sections, multiple callouts, or any grouped content
 * 
 * @note Now uses BaseSection internally for consistency
 * 
 * @usage
 * <ContentSection title="Our Process" items={contentCards} />
 */
import React from 'react';
import { ContentCard } from './ContentCard';
import { BaseSection } from '../BaseSection/BaseSection';
import type { ContentCardItem, WorkflowItem, CalloutProps, BenefitItem } from '@/types';

export interface ContentSectionProps {
  title?: string;
  items: (ContentCardItem | WorkflowItem | CalloutProps | BenefitItem)[];
}

export function ContentSection({ 
  title, 
  items
}: ContentSectionProps) {
  // Ensure items is an array
  if (!items || !Array.isArray(items)) {
    console.error('ContentSection: items is not an array:', items);
    return null;
  }
  
  // Sort items: those with order property first (by order), others maintain YAML order
  const sortedItems = [...items].sort((a, b) => {
    const orderA = 'order' in a ? (a.order ?? 999) : 999;
    const orderB = 'order' in b ? (b.order ?? 999) : 999;
    return orderA - orderB;
  });

  return (
    <BaseSection 
      title={title ?? ''}
      description=""
      variant="minimal"
      spacing="normal"
      className="content-section"
    >
      <div className="space-y-8">
        {sortedItems.map((item, index) => {
          // Support ContentCardItem (heading/text), legacy WorkflowItem (name/description), and BenefitItem (title/description)
          let heading = 'Untitled';
          let text = '';
          
          if ('heading' in item && item.heading) heading = item.heading;
          else if ('name' in item && item.name) heading = item.name;
          else if ('title' in item && item.title) heading = item.title;
          
          if ('text' in item && item.text) text = item.text;
          else if ('description' in item && item.description) text = item.description;
          
          const order = 'order' in item ? item.order : undefined;
          const category = 'category' in item ? item.category : undefined;
          const details = 'details' in item ? item.details : undefined;
          const image = 'image' in item ? item.image : undefined;
          const imagePosition = 'imagePosition' in item ? item.imagePosition : undefined;
          const variant = 'variant' in item ? item.variant : undefined;
          
          return (
            <ContentCard
              key={index}
              order={order}
              category={category}
              heading={heading}
              text={text}
              details={details}
              image={image}
              imagePosition={imagePosition}
              variant={variant}
            />
          );
        })}
      </div>
    </BaseSection>
  );
}
