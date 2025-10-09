/**
 * @component ContentSection
 * @purpose Wrapper for rendering collections of ContentCards (e.g., workflow, callouts)
 * @dependencies ContentCard
 * @aiContext Use this to display multiple ContentCards with an optional section title
 *           Perfect for workflow sections, multiple callouts, or any grouped content
 * 
 * @usage
 * <ContentSection title="Our Process" items={contentCards} />
 */
import React from 'react';
import { ContentCard } from './ContentCard';
import type { ContentCardItem, WorkflowItem, CalloutProps } from '@/types';

export interface ContentSectionProps {
  title?: string;
  items: (ContentCardItem | WorkflowItem | CalloutProps)[];
  theme?: 'body' | 'navbar';
}

export function ContentSection({ 
  title, 
  items,
  theme = 'navbar'
}: ContentSectionProps) {
  // Sort items: those with order property first (by order), others maintain YAML order
  const sortedItems = [...items].sort((a, b) => {
    const orderA = 'order' in a ? a.order || 999 : 999;
    const orderB = 'order' in b ? b.order || 999 : 999;
    return orderA - orderB;
  });

  return (
    <section className="content-section py-12">
      {title && (
        <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          {title}
        </h2>
      )}
      <div className="space-y-8">
        {sortedItems.map((item, index) => {
          // Support both ContentCardItem (heading/text) and legacy WorkflowItem (name/description)
          const heading = ('heading' in item && item.heading) || ('name' in item && item.name) || 'Untitled';
          const text = ('text' in item && item.text) || ('description' in item && item.description) || '';
          const order = 'order' in item ? item.order : undefined;
          const details = 'details' in item ? item.details : undefined;
          const itemTheme = ('theme' in item ? item.theme : undefined) || theme;
          const variant = 'variant' in item ? item.variant : undefined;
          
          return (
            <ContentCard
              key={index}
              order={order}
              heading={heading}
              text={text}
              details={details}
              image={item.image}
              imagePosition={item.imagePosition}
              theme={itemTheme}
              variant={variant}
            />
          );
        })}
      </div>
    </section>
  );
}
