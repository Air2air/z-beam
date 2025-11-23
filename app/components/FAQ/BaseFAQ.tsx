/**
 * @component BaseFAQ
 * @purpose Unified help system displaying FAQ and troubleshooting content
 * @dependencies SectionContainer, @/types (BaseFAQProps, HelpSection)
 * @related FAQMaterial.tsx, FAQSettings.tsx, jsonld-helper.ts
 * @complexity Medium (handles both FAQ and troubleshooting with different displays)
 * @aiContext Universal help component supporting context-aware FAQ and troubleshooting
 *           with severity indicators, solutions, and cross-references
 */
// app/components/FAQ/BaseFAQ.tsx
"use client";

import { SectionContainer } from "../SectionContainer/SectionContainer";
import { trackFAQClick } from "@/app/utils/analytics";
import { getSectionIcon } from "@/app/config/sectionIcons";
import type { BaseFAQProps, HelpSection, HelpItem } from '@/types';

/**
 * Convert simple Markdown bold syntax (**text**) to HTML
 */
function parseSimpleMarkdown(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

/**
 * Severity badge component for troubleshooting items
 */
function SeverityBadge({ severity }: { severity?: 'low' | 'medium' | 'high' }) {
  if (!severity) return null;
  
  const colors = {
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ml-2 ${colors[severity]}`}>
      {severity}
    </span>
  );
}

/**
 * Render a single help item (FAQ or troubleshooting)
 */
function HelpItemCard({ 
  item, 
  index, 
  materialName,
  type 
}: { 
  item: HelpItem; 
  index: number; 
  materialName: string;
  type: 'faq' | 'troubleshooting';
}) {
  const handleClick = (detailsElement: HTMLDetailsElement) => {
    const isExpanding = !detailsElement.open;
    
    trackFAQClick({
      materialName,
      question: item.question.replace(/\*\*/g, ''),
      questionIndex: index,
      isExpanding,
    });
  };

  return (
    <div role="listitem">
      <details
        className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md"
      >
        <summary 
          className="cursor-pointer px-6 py-4 font-normal text-gray-900 dark:text-gray-100 flex items-center justify-between group-open:border-b group-open:border-gray-200 dark:group-open:border-gray-700 bg-gray-50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-800 group-open:bg-white dark:group-open:bg-gray-800 list-none transition-colors duration-200"
          aria-label={`${type === 'faq' ? 'FAQ' : 'Troubleshooting'}: ${item.question.replace(/\*\*/g, '')}`}
          onClick={(e) => {
            const detailsElement = e.currentTarget.parentElement as HTMLDetailsElement;
            handleClick(detailsElement);
          }}
        >
          <span className="text-base pr-4 leading-relaxed font-light [&_strong]:font-semibold flex items-center">
            <span
              dangerouslySetInnerHTML={{ 
                __html: `<strong>${type === 'faq' ? 'Q:' : '⚠'}</strong> ${parseSimpleMarkdown(item.question)}` 
              }}
            />
            {item.severity && <SeverityBadge severity={item.severity} />}
          </span>
          <svg
            className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 transition-transform duration-300 ease-in-out group-open:rotate-180"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </summary>
        <div 
          className="faq-content overflow-hidden transition-all duration-300 ease-in-out max-h-0 opacity-0 group-open:max-h-[1000px] group-open:opacity-100"
        >
          <div className="px-6 py-4 text-gray-700 dark:text-gray-300 text-base leading-relaxed bg-white dark:bg-gray-800 font-light [&_strong]:font-semibold">
            <div
              dangerouslySetInnerHTML={{ 
                __html: `<strong>${type === 'faq' ? 'A:' : 'Solution:'}</strong> ${parseSimpleMarkdown(item.answer)}` 
              }}
            />
            
            {/* Property value badge */}
            {item.propertyValue && (
              <div className="mt-3 inline-flex items-center px-3 py-1 rounded-md text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {item.propertyValue}
              </div>
            )}
            
            {/* Solutions list */}
            {item.solutions && item.solutions.length > 0 && (
              <div className="mt-4">
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2">Recommended Actions:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {item.solutions.map((solution, idx) => (
                    <li key={idx} className="text-gray-700 dark:text-gray-300">
                      {solution}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Related topics */}
            {item.relatedTopics && item.relatedTopics.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>Related:</strong> {item.relatedTopics.join(', ')}
                </p>
              </div>
            )}
          </div>
        </div>
      </details>
    </div>
  );
}

/**
 * Render a help section (FAQ or Troubleshooting)
 */
function HelpSectionDisplay({ 
  section, 
  materialName 
}: { 
  section: HelpSection; 
  materialName: string;
}) {
  if (!section.items || section.items.length === 0) return null;

  const title = section.type === 'faq' 
    ? `Frequently Asked Questions`
    : `Troubleshooting Guide`;
  
  const icon = section.type === 'faq' ? 'faq' : 'warning';

  return (
    <SectionContainer
      variant="default"
      title={title}
      icon={getSectionIcon(icon)}
    >
      <div className="space-y-2" role="list">
        {section.items.map((item, index) => (
          <HelpItemCard
            key={index}
            item={item}
            index={index}
            materialName={materialName}
            type={section.type}
          />
        ))}
      </div>
    </SectionContainer>
  );
}

/**
 * Base help component - displays FAQ and troubleshooting sections
 */
export function BaseFAQ({
  sections = [],
  materialName,
  className = "",
}: BaseFAQProps) {
  if (!sections || sections.length === 0) return null;

  return (
    <div className={`space-y-8 ${className}`}>
      {sections.map((section, index) => (
        <HelpSectionDisplay
          key={index}
          section={section}
          materialName={materialName}
        />
      ))}
    </div>
  );
}
