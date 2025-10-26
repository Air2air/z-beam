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
  longName: string;
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
      className={className}
      aria-labelledby="regulatory-standards-heading"
    >
      {showTitle && (
        <SectionTitle 
          title={title}
          id="regulatory-standards-heading"
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        {standards.map((standard, index) => (
          <div
            key={`${standard.name}-${index}`}
            className="card-background rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-200"
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
                
                {/* Action Links */}
                <div className="flex flex-col gap-2">
                  {/* Search Materials Link */}
                  <Link
                    href={`/search?q=${encodeURIComponent(standard.name)}`}
                    className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    <svg 
                      className="w-4 h-4 mr-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                      />
                    </svg>
                    <span>Search Materials with {standard.name} Standards</span>
                  </Link>

                  {/* Official Documentation Link */}
                  {standard.url && (
                    <Link
                      href={standard.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
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
          </div>
        ))}
      </div>
    </section>
  );
}
