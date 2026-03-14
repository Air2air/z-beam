import type { ReactNode } from 'react';
import { BaseSection } from '@/app/components/BaseSection/BaseSection';

/**
 * Props for markdown sections
 */
export interface MarkdownSectionProps {
  heading: string;
  content: string;
  list?: string[];
}

/**
 * Props for the MarkdownContent component
 */
export interface MarkdownContentProps {
  title?: string;
  sections: MarkdownSectionProps[];
  className?: string;
  children?: ReactNode;
}

/**
 * Flexible component for rendering markdown content passed as props
 * 
 * Supports:
 * - Section headings and content
 * - Bullet point lists
 * - Custom styling via className
 * - Additional children elements
 * 
 * Example usage:
 * ```tsx
 * <MarkdownContent
 *   title="Comparison Details"
 *   sections={[
 *     {
 *       heading: 'Surface prep',
 *       content: 'Use the same section structure passed from page frontmatter.',
 *       list: ['Keep bullets short', 'Keep headings specific']
 *     }
 *   ]}
 * />
 * ```
 */
export default function MarkdownContent({
  title,
  sections,
  className = '',
  children
}: MarkdownContentProps) {
  if (sections.length === 0 && !title && !children) {
    return null;
  }

  return (
    <BaseSection
      title={title}
      className={className}
    >
      <div className="space-y-8">
        {sections.map((section, index) => (
          <div key={index} className="space-y-4">
            {section.heading && (
              <h3 className="text-xl font-semibold text-neutral-900">
                {section.heading}
              </h3>
            )}
            
            {section.content && (
              <div className="prose prose-lg max-w-none text-neutral-700">
                {section.content.split('\n').map((paragraph, pIndex) => (
                  paragraph.trim() && (
                    <p key={pIndex} className="mb-4">
                      {paragraph}
                    </p>
                  )
                ))}
              </div>
            )}
            
            {section.list && section.list.length > 0 && (
              <ul className="space-y-2 list-disc list-inside text-neutral-700">
                {section.list.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-base">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        
        {children}
      </div>
    </BaseSection>
  );
}