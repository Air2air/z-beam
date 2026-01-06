/**
 * @component RelationshipCard
 * @purpose Displays relationship cards with card schema, metrics, and context-aware styling
 * @dependencies @/types (CardVariant, RelationshipItem), @/app/utils/entityLookup
 * @related Card.tsx, DataGrid.tsx, CompoundSafetyGrid.tsx
 * @complexity Medium (entity lookup with card schema rendering)
 * @aiContext Use for relationship displays with ID-based entity lookup and card presentation
 */

"use client";

import Link from "next/link";
import { resolveCardData, resolveEntityUrl } from "@/app/utils/entityLookup";
import { SEVERITY_COLORS, type RelationshipItem, type CardVariant } from "@/types";

export interface RelationshipCardProps {
  item: RelationshipItem;        // NEW: ID-based relationship item
  context?: string;               // NEW: Card context (e.g., 'contamination_context')
  contentType?: string;           // Optional: Content type hint for faster lookup
  className?: string;
}

export function RelationshipCard({
  item,
  context = 'default',
  contentType,
  className = "",
}: RelationshipCardProps) {
  // Load card data from entity frontmatter
  const cardData = resolveCardData(item.id, context, contentType);
  
  // Derive URL from entity's fullPath
  const url = resolveEntityUrl(item.id, contentType);
  
  // Fallback if card data not found
  if (!cardData) {
    console.warn(`Card data not found for entity: ${item.id}`);
    return (
      <div className="rounded-md border border-gray-500 bg-gray-900/20 p-4">
        <div className="text-gray-400">Entity not found: {item.id}</div>
      </div>
    );
  }
  
  // Get severity-based styling
  const severityStyle = SEVERITY_COLORS[cardData.severity];

  return (
    <Link
      href={url}
      className={`
        group block rounded-lg border transition-all duration-200
        hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        ${severityStyle.border}
        ${className}
      `}
      aria-label={`View details for ${cardData.heading}`}
    >
      <div className={`h-full p-6 ${severityStyle.bg}`}>
        {/* Badge */}
        <div className="mb-4">
          <span
            className={`
              inline-flex items-center rounded-full px-3 py-1 text-xs font-medium
              ${getBadgeColors(cardData.badge.variant)}
            `}
          >
            {cardData.badge.text}
          </span>
        </div>
        
        {/* Metric */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-white">
              {cardData.metric.value}
            </span>
            {cardData.metric.unit && (
              <span className="text-2xl font-medium text-white/80">
                {cardData.metric.unit}
              </span>
            )}
          </div>
          <div className="mt-1 text-sm text-white/70">
            {cardData.metric.legend}
          </div>
        </div>
        
        {/* Icon (optional) */}
        {cardData.icon && (
          <div className="mb-4 text-white/60">
            {/* TODO: Integrate lucide icons dynamically */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="opacity-60"
              aria-hidden="true"
            >
              {/* Placeholder - replace with dynamic icon rendering */}
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
        )}
        
        {/* Heading & Subtitle (at bottom) */}
        <div className="border-t border-white/20 pt-4">
          <h3 className="text-xl font-semibold text-white">
            {cardData.heading}
          </h3>
          <p className="mt-1 text-sm text-white/80">
            {cardData.subtitle}
          </p>
        </div>
        
        {/* Relationship metadata (if present) */}
        {(item.frequency || item.severity) && (
          <div className="mt-3 flex gap-2 text-xs text-white/60">
            {item.frequency && (
              <span className="capitalize">{item.frequency.replace('_', ' ')}</span>
            )}
            {item.frequency && item.severity && <span>•</span>}
            {item.severity && (
              <span className="capitalize">{item.severity} severity</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

/**
 * Get badge colors based on variant
 */
function getBadgeColors(variant: string): string {
  const badgeColors = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    technical: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  };
  
  return badgeColors[variant as keyof typeof badgeColors] || badgeColors.info;
}
