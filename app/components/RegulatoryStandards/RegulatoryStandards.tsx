/**
 * @component RegulatoryStandards
 * @purpose Displays regulatory standards and compliance information
 * @dependencies SectionContainer, @/types (RegulatoryStandardsProps), Image, Link
 * @related Layout.tsx
 * @complexity Medium (displays standards with logos and descriptions)
 * @aiContext Pass frontmatter.regulatoryStandards array. Component renders standards
 *           with official logos, descriptions, and links to official documentation.
 * @note Server Component - no client-side interactivity needed
 */
// app/components/RegulatoryStandards/RegulatoryStandards.tsx

import Image from 'next/image';
import Link from 'next/link';
import type { RegulatoryStandardsProps } from '@/types';
import { GRID_GAP_RESPONSIVE } from '@/app/config/site';
import { SectionContainer } from '../SectionContainer/SectionContainer';
import { SectionTitle } from '../SectionTitle/SectionTitle';
import { getSectionIcon } from '@/app/config/sectionIcons';

export function RegulatoryStandards({
  standards,
  className: _className = '',
  showTitle: _showTitle = true,
  title = 'Regulatory Standards & Compliance',
  heroImage,
  thumbnailLink,
}: RegulatoryStandardsProps & { heroImage?: string; thumbnailLink?: string }) {
  if (!standards || standards.length === 0) return null;
  
  // Filter to only show object/dict standards, not strings
  const validStandards = standards.filter(std => 
    typeof std === 'object' && std !== null && std.name
  );
  
  if (validStandards.length === 0) return null;

  return (
    <SectionContainer 
      bgColor="transparent"
      radius={false}
      className="regulatory-standards"
    >
      <SectionTitle 
        title={title}
        icon={getSectionIcon('regulatory')}
        description="Industry standards and compliance requirements for safe laser cleaning operations"
      />
      <ul className={`grid-2col ${GRID_GAP_RESPONSIVE} list-none mt-4`}>
        {validStandards.map((standard, index) => (
          <li key={`${standard.name}-${index}`} className="flex">
            {standard.url ? (
              <Link
                href={standard.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col w-full card-background rounded-md p-4 hover:shadow-lg transition-all duration-200 group"
              >
                <article className="flex items-start gap-4 flex-1">
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
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg text-secondary font-semibold mb-1 group-hover:text-orange-600 transition-colors">
                        {standard.name}
                      </h3>
                      {/* External link icon */}
                      <svg 
                        className="w-5 h-5 flex-shrink-0 text-secondary opacity-60 group-hover:opacity-100 transition-opacity" 
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
                    </div>
                    {standard.description && (
                      <p className="text-sm text-secondary">
                        {standard.description}
                      </p>
                    )}
                  </div>
                </article>
                <span className="sr-only">View official documentation (opens in new tab)</span>
              </Link>
            ) : (
              <div className="flex flex-col w-full card-background rounded-md p-4">
                <article className="flex items-start gap-4 flex-1">
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
                    <h3 className="text-lg text-secondary font-semibold mb-1">
                      {standard.name}
                    </h3>
                    {standard.description && (
                      <p className="text-sm text-secondary">
                        {standard.description}
                      </p>
                    )}
                  </div>
                </article>
              </div>
            )}
          </li>
        ))}
      </ul>
    </SectionContainer>
  );
}
