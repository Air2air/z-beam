/**
 * @component WorkflowSection
 * @purpose Renders workflow/process steps from YAML data with optional images
 * @dependencies @/types (WorkflowItem), Next.js Image
 * @aiContext Use this to display step-by-step process workflows from YAML config
 *           Automatically renders ordered stages with descriptions, detail lists, and optional images
 *           Uses same styling as Callout component for consistency
 * 
 * @usage
 * <WorkflowSection workflow={pageConfig.workflow} theme="navbar" />
 */
import React from 'react';
import Image from 'next/image';
import type { WorkflowItem } from '@/types';

export interface WorkflowSectionProps {
  workflow: WorkflowItem[];
  title?: string;
  theme?: 'body' | 'navbar';
}

export function WorkflowSection({ 
  workflow, 
  title = "Our Process",
  theme = 'navbar'
}: WorkflowSectionProps) {
  // Sort by order to ensure correct sequence
  const sortedWorkflow = [...workflow].sort((a, b) => a.order - b.order);

  // Theme-based styling matching Callout component with gradient backgrounds
  const themeClasses = {
    body: {
      container: 'bg-gradient-to-b from-gray-700 to-gray-700',
      heading: 'text-white',
      text: 'text-gray-100',
    },
    navbar: {
      container: 'bg-gradient-to-b from-white to-gray-700 dark:from-gray-800 dark:to-gray-700',
      heading: 'text-gray-900 dark:text-white',
      text: 'text-gray-700 dark:text-gray-300',
    },
  };

  const currentTheme = themeClasses[theme];

  return (
    <section className="workflow-section py-12">
      <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        {title}
      </h2>
      <div className="space-y-8">
        {sortedWorkflow.map((item, index) => {
          const isImageLeft = item.imagePosition === 'left';
          
          return (
            <div 
              key={index} 
              className={`workflow-card p-4 md:p-6 ${currentTheme.container} rounded-lg`}
            >
              {/* Header - Spans full width across top */}
              <div className="flex items-center gap-4 mb-6">
                {/* Stage Number */}
                <div className="workflow-number flex-shrink-0 w-16 h-16 flex items-center justify-center text-3xl font-bold text-blue-600 dark:text-blue-400 bg-gray-700 dark:bg-gray-700 rounded-full">
                  {item.order}
                </div>
                
                {/* Title */}
                <div className="flex-1">
                  <h3 className={`text-xl md:text-2xl font-bold ${currentTheme.heading}`}>
                    {item.name}
                  </h3>
                </div>
              </div>

              {/* Content Grid - Text and Image side by side */}
              <div className={`grid grid-cols-1 ${item.image ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-6 md:gap-12 items-start`}>
                {/* Image - Left Side */}
                {item.image && isImageLeft && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={item.image.url}
                      alt={item.image.alt || item.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                )}

                {/* Text Content */}
                <div className="flex-1">
                  {/* Description */}
                  <p className={`text-base md:text-lg leading-relaxed mb-4 ${currentTheme.text}`}>
                    {item.description}
                  </p>
                  
                  {/* Details List */}
                  {item.details && item.details.length > 0 && (
                    <ul className="space-y-2">
                      {item.details.map((detail, idx) => (
                        <li 
                          key={idx} 
                          className={`flex items-start gap-2 ${currentTheme.text}`}
                        >
                          <span className="text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0">
                            ✓
                          </span>
                          <span className="leading-relaxed">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Image - Right Side */}
                {item.image && !isImageLeft && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={item.image.url}
                      alt={item.image.alt || item.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
