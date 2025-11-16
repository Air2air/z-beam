/**
 * @component MaterialFAQ
 * @purpose Displays material-specific FAQs from frontmatter data
 * @dependencies SectionContainer, @/types (MaterialFAQProps)
 * @related Layout.tsx, jsonld-helper.ts
 * @complexity Low (renders FAQ data from frontmatter)
 * @aiContext Displays SEO-optimized FAQs from frontmatter highlighting unique material
 *           characteristics, special requirements, and differentiation factors
 */
// app/components/FAQ/MaterialFAQ.tsx
"use client";

import { SectionContainer } from "../SectionContainer/SectionContainer";
import { trackFAQClick } from "@/app/utils/analytics";
import { getSectionIcon } from "@/app/config/sectionIcons";
import { useRef } from "react";
import type { MaterialFAQProps } from '@/types';

interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Convert simple Markdown bold syntax (**text**) to HTML
 */
function parseSimpleMarkdown(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

/**
 * Displays material-specific FAQ from frontmatter data
 */
export function MaterialFAQ({
  materialName,
  faq = [],
  className = "",
}: MaterialFAQProps) {
  // Use FAQ data from frontmatter
  if (!faq || faq.length === 0) return null;

  // Track FAQ clicks
  const handleFAQClick = (question: string, index: number, detailsElement: HTMLDetailsElement) => {
    // Check if FAQ is being expanded or collapsed
    const isExpanding = !detailsElement.open;
    
    trackFAQClick({
      materialName,
      question: question.replace(/\*\*/g, ''), // Remove markdown formatting
      questionIndex: index,
      isExpanding,
    });
  };

  return (
    <SectionContainer
      variant="default"
      title={`${materialName} Laser Cleaning FAQs`}
      icon={getSectionIcon('faq')}
    >
      <div className="space-y-2" role="list">
        {faq.map((item, index) => (
          <div key={index} role="listitem">
            <details
              className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              <summary 
                className="cursor-pointer px-6 py-4 font-normal text-gray-900 dark:text-gray-100 flex items-center justify-between group-open:border-b group-open:border-gray-200 dark:group-open:border-gray-700 bg-gray-50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-800 group-open:bg-white dark:group-open:bg-gray-800 list-none transition-colors duration-200"
                aria-label={`FAQ: ${item.question.replace(/\*\*/g, '')}`}
                onClick={(e) => {
                  const detailsElement = e.currentTarget.parentElement as HTMLDetailsElement;
                  handleFAQClick(item.question, index, detailsElement);
                }}
              >
                <span 
                  className="text-base pr-4 leading-relaxed font-light [&_strong]:font-semibold"
                  dangerouslySetInnerHTML={{ __html: '<strong>Q:</strong> ' + parseSimpleMarkdown(item.question) }}
                />
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
                className="faq-content overflow-hidden transition-all duration-300 ease-in-out max-h-0 opacity-0 group-open:max-h-[500px] group-open:opacity-100"
              >
                <div 
                  className="px-6 py-4 text-gray-700 dark:text-gray-300 text-base leading-relaxed bg-white dark:bg-gray-800 font-light [&_strong]:font-semibold"
                  dangerouslySetInnerHTML={{ __html: '<strong>A:</strong> ' + parseSimpleMarkdown(item.answer) }}
                />
              </div>
            </details>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}

