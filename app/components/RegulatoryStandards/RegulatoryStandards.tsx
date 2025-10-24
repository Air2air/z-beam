/**
 * @component RegulatoryStandards
 * @purpose Displays regulatory standards and compliance information
 * @dependencies @/types (RegulatoryStandardsProps), Image, Link
 * @related Layout.tsx
 * @complexity Medium (displays standards with logos and descriptions)
 * @aiContext Pass frontmatter.regulatoryStandards array. Component renders standards
 *           with official logos, descriptions, and links to official documentation.
 */
// app/components/RegulatoryStandards/RegulatoryStandards.tsx
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { SectionTitle } from '../SectionTitle/SectionTitle';

interface RegulatoryStandard {
  name: string;
  description: string;
  url: string;
  image: string;
}

export interface RegulatoryStandardsProps {
  standards: RegulatoryStandard[];
  className?: string;
  showTitle?: boolean;
  title?: string;
}

export function RegulatoryStandards({
  standards,
  className = '',
  showTitle = true,
  title = 'Regulatory Standards & Compliance'
}: RegulatoryStandardsProps) {
  if (!standards || standards.length === 0) return null;

  return (
    <section 
      className={`regulatory-standards ${className}`}
      aria-labelledby="regulatory-standards-heading"
    >
      {showTitle && (
        <SectionTitle 
          title={title}
          id="regulatory-standards-heading"
        />
      )}

      <div className="standards-grid grid grid-cols-2 gap-4">
        {standards.map((standard, index) => (
          <div
            key={`${standard.name}-${index}`}
            className="standard-card card-background rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start gap-4">
              {/* Logo */}
              {standard.image && (
                <div className="flex-shrink-0 w-16 h-16 relative">
                  <Image
                    src={standard.image}
                    alt={`${standard.name} logo`}
                    fill
                    className="object-contain"
                    sizes="64px"
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {standard.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {standard.description}
                </p>
                {standard.url && (
                  <Link
                    href={standard.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    <span>View Official Documentation</span>
                    <svg 
                      className="w-4 h-4 ml-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                      />
                    </svg>
                    <span className="sr-only">(opens in new tab)</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trust signals */}
      <div className="mt-4 p-3 bg-gradient-to-b from-white to-gray-600 dark:from-gray-600 dark:to-gray-600 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-gray-900 dark:text-white flex items-center">
          <svg 
            className="w-5 h-5 mr-2 flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
            />
          </svg>
          All laser cleaning operations comply with international safety standards and industry best practices.
        </p>
      </div>
    </section>
  );
}
