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
import { SectionTitle } from '../SectionTitle/SectionTitle';
import { Title } from "../Title/Title";
import { trackFAQClick } from "@/app/utils/analytics";
import { getSectionIcon } from "@/app/config/sectionIcons";
import type { MaterialFAQProps } from '@/types';

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
  className: _className = "",
  heroImage,
  thumbnailLink,
}: MaterialFAQProps & { heroImage?: string; thumbnailLink?: string }) {
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
    >
      <SectionTitle 
        title={`${materialName} Laser Cleaning FAQs`}
        icon={getSectionIcon('faq')}
        description="Common questions and expert answers about laser cleaning this material"
      />
      <div className="space-y-2 mt-4" role="list">
        {faq.map((item, index) => (
          <div key={index} role="listitem">
            <details
              className="group bg-secondary rounded-md overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              <summary 
                className="cursor-pointer px-6 py-4 font-normal flex items-center justify-between bg-primary hover:bg-secondary list-none transition-colors duration-200"
                aria-label={`FAQ: ${item.question.replace(/\*\*/g, '')}`}
                onClick={(e) => {
                  const detailsElement = e.currentTarget.parentElement as HTMLDetailsElement;
                  handleFAQClick(item.question, index, detailsElement);
                }}
              >
                <span 
                  className="text-base pr-4 font-light [&_strong]:font-semibold"
                  dangerouslySetInnerHTML={{ __html: '<strong>Q:</strong> ' + parseSimpleMarkdown(item.question) }}
                />
                <svg
                  className="w-5 h-5 text-primary flex-shrink-0 transition-transform duration-300 ease-in-out group-open:rotate-180"
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
                  className="px-6 py-4 text-base bg-secondary font-light [&_strong]:font-semibold"
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

