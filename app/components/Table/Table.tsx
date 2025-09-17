// app/components/Table/Table.tsx
import React from 'react';
import { MarkdownRenderer } from '../Base/MarkdownRenderer';
import './styles.css';

interface TableProps {
  content: string;
  config?: {
    showHeader?: boolean;
    caption?: string;
    className?: string;
    variant?: 'default' | 'sectioned' | 'compact';
  };
}

/**
 * Enhanced Table component that handles both simple tables and complex sectioned content
 */
export function Table({ content, config }: TableProps) {
  if (!content) return null;
  
  const {
    showHeader = true,
    className = '',
    caption,
    variant = 'default'
  } = config || {};

  // Check if content contains multiple table sections (material data pattern)
  const isSectionedContent = content.includes('## Material Properties') || 
                            content.includes('## Material Grades') ||
                            content.includes('## Performance Metrics');

  // Parse sectioned content into individual sections
  const parseSectionedContent = (content: string) => {
    const sections = content.split(/^## /gm).filter(Boolean);
    return sections.map(section => {
      const lines = section.split('\n');
      const title = lines[0];
      const sectionContent = lines.slice(1).join('\n').trim();
      return { title, content: sectionContent };
    });
  };

  // Remove version log sections from content
  const cleanContent = (content: string) => {
    return content.split('---\nVersion Log')[0].trim();
  };

  if (isSectionedContent && variant !== 'compact') {
    const sections = parseSectionedContent(cleanContent(content));
    
    return (
      <div className={`table-sections-container ${className}`}>
        {caption && (
          <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            {caption}
          </div>
        )}
        
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div key={index} className="table-section-group">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-sm mr-3 inline-block"></span>
                {section.title}
              </h3>
              
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <div 
                    className={`
                      table-container w-full
                      ${!showHeader ? 'no-header' : ''}
                    `}
                  >
                    <MarkdownRenderer 
                      content={section.content}
                      convertMarkdown={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default single table rendering
  return (
    <div className="table-section">
      <div className="overflow-x-auto w-full">
        <div 
          className={`
            table-container w-full
            ${!showHeader ? 'no-header' : ''}
            ${className}
          `}
        >
          <MarkdownRenderer 
            content={cleanContent(content)}
            convertMarkdown={true}
          />
        </div>
      </div>
      
      {caption && (
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {caption}
        </div>
      )}
    </div>
  );
}
