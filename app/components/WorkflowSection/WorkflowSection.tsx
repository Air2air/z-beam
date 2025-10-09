/**
 * @component WorkflowSection
 * @purpose Renders workflow/process steps from YAML data
 * @dependencies @/types (WorkflowItem)
 * @aiContext Use this to display step-by-step process workflows from YAML config
 *           Automatically renders ordered stages with descriptions and detail lists
 * 
 * @usage
 * <WorkflowSection workflow={pageConfig.workflow} />
 */
import React from 'react';
import type { WorkflowItem } from '@/types';

export interface WorkflowSectionProps {
  workflow: WorkflowItem[];
  title?: string;
}

export function WorkflowSection({ 
  workflow, 
  title = "Our Process" 
}: WorkflowSectionProps) {
  // Sort by order to ensure correct sequence
  const sortedWorkflow = [...workflow].sort((a, b) => a.order - b.order);

  return (
    <section className="workflow-section py-12">
      <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        {title}
      </h2>
      <div className="space-y-8">
        {sortedWorkflow.map((item, index) => (
          <div 
            key={index} 
            className="workflow-card p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start gap-4">
              {/* Stage Number */}
              <div className="workflow-number flex-shrink-0 w-16 h-16 flex items-center justify-center text-3xl font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                {item.order}
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  {item.name}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  {item.description}
                </p>
                
                {/* Details List */}
                {item.details && item.details.length > 0 && (
                  <ul className="space-y-2">
                    {item.details.map((detail, idx) => (
                      <li 
                        key={idx} 
                        className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
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
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
