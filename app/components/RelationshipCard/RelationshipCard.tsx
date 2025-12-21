/**
 * @component RelationshipCard
 * @purpose Displays relationship cards with icon, label, and severity-based styling
 * @dependencies @/types (ArticleMetadata), @/app/utils/constants
 * @related Card.tsx, DataGrid.tsx, CompoundSafetyGrid.tsx
 * @complexity Low (focused component for relationship display)
 * @aiContext Use for domain linkages, hazardous compounds, and related items with severity
 */

"use client";

import Link from "next/link";
import { ArticleMetadata } from "@/types";
import { SITE_CONFIG } from "@/app/config/site";

export interface RelationshipCardProps {
  frontmatter?: ArticleMetadata;
  href: string;
  title?: string;
  subject?: string;
  severity?: string;
  className?: string;
}

export function RelationshipCard({
  frontmatter,
  href,
  title: explicitTitle,
  subject: explicitSubject,
  severity: explicitSeverity,
  className = "",
}: RelationshipCardProps) {
  // Use explicit props first, then fallback to frontmatter
  const title = explicitTitle || frontmatter?.title || '';
  const subject = explicitSubject || frontmatter?.subject || '';
  const severity = explicitSeverity || (frontmatter as any)?.severity;

  // Safety check: href is required for Link component
  if (!href) {
    console.error('RelationshipCard received undefined href for:', subject || title || 'unknown');
    return null;
  }

  // Create absolute URL for SEO Infrastructure structured data
  const absoluteUrl = href?.startsWith('http') ? href : `${SITE_CONFIG.url}${href || ''}`;

  // Apply severity-based styling (matching risk card style)
  const relationshipStyles = severity
    ? severity === 'low'
      ? {
          text: 'text-green-400',
          bg: 'bg-green-900/20',
          border: 'border-green-500',
        }
      : severity === 'moderate'
      ? {
          text: 'text-yellow-400',
          bg: 'bg-yellow-900/20',
          border: 'border-yellow-500',
        }
      : severity === 'high' || severity === 'severe'
      ? {
          text: 'text-red-400',
          bg: 'bg-red-900/20',
          border: 'border-red-500',
        }
      : {
          text: 'text-gray-400',
          bg: 'bg-gray-900/20',
          border: 'border-gray-500',
        }
    : {
        text: 'text-gray-400',
        bg: 'bg-gray-900/20',
        border: 'border-gray-500',
      };

  return (
    <Link
      href={href}
      className={`
        group rounded-md border p-4 transition-all duration-200
        hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        ${relationshipStyles.text} ${relationshipStyles.bg} ${relationshipStyles.border}
        ${className}
      `}
      aria-label={`View details for ${subject || title}`}
    >
      <article
        role="article"
        itemScope
        itemType="https://schema.org/Article"
      >
        {/* SEO Infrastructure: Schema.org structured data */}
        <meta itemProp="url" content={absoluteUrl} />
        <meta itemProp="headline" content={subject || title} />
        {frontmatter?.description && (
          <meta itemProp="description" content={frontmatter.description} />
        )}
        {frontmatter?.datePublished && (
          <meta itemProp="datePublished" content={frontmatter.datePublished} />
        )}
        {frontmatter?.lastModified && (
          <meta itemProp="dateModified" content={frontmatter.lastModified} />
        )}
        {frontmatter?.author && (
          <meta 
            itemProp="author" 
            content={typeof frontmatter.author === 'string' ? frontmatter.author : frontmatter.author.name} 
          />
        )}

        {/* Risk card style with icon and severity display */}
        <div className="flex items-center gap-3 mb-2">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="lucide lucide-alert-triangle w-6 h-6" 
            aria-hidden="true"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div>
            <div className="text-sm text-gray-400">{subject || title}</div>
            {severity && (
              <div className="text-xl font-semibold capitalize">{severity}</div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
