/**
 * @component MaterialFAQ
 * @purpose Displays material-specific FAQs from frontmatter data
 * @dependencies @/types (MaterialFAQProps)
 * @related Layout.tsx, jsonld-helper.ts
 * @complexity Low (renders FAQ data from frontmatter)
 * @aiContext Displays SEO-optimized FAQs from frontmatter highlighting unique material
 *           characteristics, special requirements, and differentiation factors
 */
// app/components/FAQ/MaterialFAQ.tsx
"use client";

import { SectionTitle } from "../SectionTitle/SectionTitle";

export interface MaterialFAQProps {
  materialName: string;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  className?: string;
}

interface FAQItem {
  question: string;
  answer: string;
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

  return (
    <section className={className} aria-labelledby="faq-heading">
      <SectionTitle
        title={`${materialName} Laser Cleaning FAQs`}
        id="faq-heading"
      />

      {faq.map((item, index) => (
        <details
          key={index}
          className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md mb-4"
        >
          <summary className="cursor-pointer px-6 py-4 font-normal text-gray-900 dark:text-gray-100 flex items-center justify-between group-open:border-b group-open:border-gray-200 dark:group-open:border-gray-700 bg-gray-50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-800 group-open:bg-white dark:group-open:bg-gray-800">
            <span className="text-sm md:text-base pr-4 leading-relaxed">{item.question}</span>
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 transition-transform duration-200 group-open:rotate-180"
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
          <div className="px-6 py-4 text-gray-700 dark:text-gray-300 text-sm leading-relaxed bg-white dark:bg-gray-800">
            {item.answer}
          </div>
        </details>
      ))}
    </section>
  );
}

