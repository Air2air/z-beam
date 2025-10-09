/**
 * @component ContentSection
 * @purpose Wrapper for rendering collections of ContentCards (e.g., workflow, callouts)
 * @dependencies ContentCard
 * @aiContext Use this to display multiple ContentCards with an optional section title
 *           Perfect for workflow sections, multiple callouts, or any grouped content
 * 
 * @usage
 * <ContentSection title="Our Process" items={workflowItems} />
 */
import React from 'react';
import { ContentCard } from './ContentCard';
import type { WorkflowItem } from '@/types';
import type { CalloutProps } from '@/types';

export interface ContentSectionProps {
  title?: string;
  items: (WorkflowItem | CalloutProps)[];
  theme?: 'body' | 'navbar';
}

export function ContentSection({ 
  title, 
  items,
  theme = 'navbar'
}: ContentSectionProps) {
  // Sort items if they have order property
  const sortedItems = [...items].sort((a, b) => {
    const orderA = 'order' in a ? a.order : 0;
    const orderB = 'order' in b ? b.order : 0;
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
          // Handle WorkflowItem
          if ('order' in item && 'name' in item) {
            return (
              <ContentCard
                key={index}
                order={item.order}
                heading={item.name}
                text={item.description}
                details={item.details}
                image={item.image}
                imagePosition={item.imagePosition}
                theme={theme}
              />
            );
          }
          
          // Handle CalloutProps
          return (
            <ContentCard
              key={index}
              heading={item.heading}
              text={item.text}
              image={item.image}
              imagePosition={item.imagePosition}
              theme={item.theme || theme}
              variant={item.variant}
            />
          );
        })}
      </div>
    </section>
  );
}
