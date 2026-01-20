/**
 * @component Collapsible
 * @purpose Generic collapsible disclosure widget for nested data structures
 * @dependencies SectionContainer, ButtonIcons, @/types
 * @related BaseFAQ.tsx, DescriptiveDataPanel.tsx
 * @complexity Low (native HTML details/summary)
 * @aiContext Renders nested object data with category keys as collapsible sections
 *           Uses native HTML disclosure pattern (non-exclusive expansion)
 *           Conditionally displays category-specific icons for visual identification
 * @updated 2026-01-05: Replaced table layouts with responsive definition lists (dl/dt/dd)
 *          for better mobile experience and semantic HTML. Uses CSS Grid for responsive
 *          layouts that stack on mobile and align as columns on desktop.
 */
"use client";

import React from 'react';
import { BaseSection } from '../BaseSection/BaseSection';
import { Badge } from '../Badge/Badge';
import type { RelationshipSection } from '@/types';
import { 
  LayersIcon, 
  PackageIcon, 
  SettingsIcon,
  ZapIcon,
  ShieldIcon,
  DatabaseIcon
} from '@/app/components/Buttons/ButtonIcons';
import { Flame, AlertTriangle, Eye, Wind } from 'lucide-react';
import { getRiskColor } from '@/app/utils/layoutHelpers';

interface CollapsibleItem {
  [key: string]: any;
}

interface CollapsibleProps {
  items: CollapsibleItem[];
  sectionMetadata?: RelationshipSection;
  className?: string;
}

/**
 * Format key to display text (snake_case to Title Case)
 */
function formatKey(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get icon for category based on category key
 * Returns appropriate icon component for visual identification
 */
function getCategoryIcon(categoryKey: string): React.ReactNode {
  const iconClass = "w-4 h-4 mr-2 flex-shrink-0";
  
  // Visual characteristics - no icons needed
  if (categoryKey.includes('appearance') || categoryKey.includes('visual')) {
    return null;
  }
  
  // Safety-specific icons (Lucide icons for consistency with RiskCard/InfoCard)
  if (categoryKey === 'fire_explosion_risk' || categoryKey.includes('fire') || categoryKey.includes('explosion')) {
    return <Flame className={iconClass} />;
  }
  if (categoryKey === 'toxic_gas_risk' || categoryKey.includes('toxic')) {
    return <AlertTriangle className={iconClass} />;
  }
  if (categoryKey === 'visibility_hazard' || categoryKey.includes('visibility')) {
    return <Eye className={iconClass} />;
  }
  if (categoryKey === 'ppe_requirements' || categoryKey.includes('ppe')) {
    return <ShieldIcon className={iconClass} />;
  }
  if (categoryKey === 'ventilation_requirements' || categoryKey.includes('ventilation')) {
    return <Wind className={iconClass} />;
  }
  if (categoryKey === 'particulate_generation' || categoryKey.includes('particulate')) {
    return <AlertTriangle className={iconClass} />;
  }
  
  // Material categories
  if (categoryKey.includes('metal') || categoryKey.includes('alloy')) {
    return <LayersIcon className={iconClass} />;
  }
  if (categoryKey.includes('ceramic') || categoryKey.includes('glass')) {
    return <PackageIcon className={iconClass} />;
  }
  if (categoryKey.includes('polymer') || categoryKey.includes('plastic')) {
    return <ZapIcon className={iconClass} />;
  }
  if (categoryKey.includes('composite')) {
    return <LayersIcon className={iconClass} />;
  }
  
  // Property-based categories
  if (categoryKey.includes('parameter') || categoryKey.includes('setting')) {
    return <SettingsIcon className={iconClass} />;
  }
  if (categoryKey.includes('safety') || categoryKey.includes('hazard')) {
    return <ShieldIcon className={iconClass} />;
  }
  if (categoryKey.includes('data') || categoryKey.includes('measurement')) {
    return <DatabaseIcon className={iconClass} />;
  }
  
  // Default icon for uncategorized
  return null;
}

/**
 * Get card styling for safety risk categories
 * Returns color classes based on severity (if present)
 */
function getCardStyling(categoryKey: string, categoryData: any): string {
  // Check if this is a risk category with severity
  if (categoryKey.includes('risk') || categoryKey.includes('hazard')) {
    // Handle nested object with severity property
    if (categoryData && typeof categoryData === 'object' && categoryData.severity) {
      return getRiskColor(categoryData.severity);
    }
    // Handle direct severity string
    if (typeof categoryData === 'string') {
      return getRiskColor(categoryData);
    }
  }
  
  // Default styling for info cards
  return 'bg-gray-800/50 border-gray-700';
}

/**
 * Extract border color from card styling classes
 */
function getBorderColor(cardStyle: string): string {
  if (cardStyle.includes('border-red-500')) return 'border-red-500';
  if (cardStyle.includes('border-yellow-500')) return 'border-yellow-500';
  if (cardStyle.includes('border-green-500')) return 'border-green-500';
  if (cardStyle.includes('border-gray-600')) return 'border-gray-600';
  return 'border-gray-700'; // default
}

/**
 * Extract background color from card styling classes
 */
function getBackgroundColor(cardStyle: string): string {
  if (cardStyle.includes('bg-red-900/40')) return 'bg-red-900/50';
  if (cardStyle.includes('bg-yellow-900/40')) return 'bg-yellow-900/50';
  if (cardStyle.includes('bg-green-900/40')) return 'bg-green-900/50';
  if (cardStyle.includes('bg-gray-800/50')) return 'bg-gray-800/50';
  return 'bg-gray-800/50'; // default
}

/**
 * Extract text color from card styling classes for icons
 */
function getTextColor(cardStyle: string): string {
  if (cardStyle.includes('text-red-400')) return 'text-red-400';
  if (cardStyle.includes('text-yellow-400')) return 'text-yellow-400';
  if (cardStyle.includes('text-green-400')) return 'text-green-400';
  if (cardStyle.includes('text-gray-400')) return 'text-gray-400';
  return 'text-gray-400'; // default
}

/**
 * Get severity order for sorting (lower number = higher priority)
 * Returns the sort priority for a given severity level
 */
function getSeverityOrder(severity: string): number {
  const severityLower = severity?.toLowerCase() || '';
  if (severityLower === 'extreme') return 0;
  if (severityLower === 'high') return 1;
  if (severityLower === 'moderate') return 2;
  if (severityLower === 'low') return 3;
  return 999; // non-severity items come last
}

/**
 * Extract severity from category data
 */
function extractSeverity(categoryData: any): string | null {
  if (!categoryData) return null;
  if (typeof categoryData === 'string') return categoryData;
  if (typeof categoryData === 'object' && categoryData.severity) {
    return typeof categoryData.severity === 'string' 
      ? categoryData.severity 
      : categoryData.severity.severity || null;
  }
  return null;
}

/**
 * Sort entries by severity (extreme first, then high, moderate, low)
 * Non-risk items come after severity items in alphabetical order
 */
function sortEntriesBySeverity(entries: [string, any][]): [string, any][] {
  return entries.sort((a, b) => {
    const [keyA, dataA] = a;
    const [keyB, dataB] = b;
    
    // Check if these are risk/hazard categories
    const isRiskA = keyA.includes('risk') || keyA.includes('hazard');
    const isRiskB = keyB.includes('risk') || keyB.includes('hazard');
    
    if (isRiskA && isRiskB) {
      // Both are risks - sort by severity
      const severityA = extractSeverity(dataA);
      const severityB = extractSeverity(dataB);
      const orderA = getSeverityOrder(severityA || '');
      const orderB = getSeverityOrder(severityB || '');
      return orderA - orderB;
    }
    
    if (isRiskA && !isRiskB) return -1; // Risks come first
    if (!isRiskA && isRiskB) return 1;  // Risks come first
    
    // Neither are risks - alphabetical order
    return keyA.localeCompare(keyB);
  });
}

/**
 * Get badge variant based on severity level
 */
function getSeverityBadgeVariant(severity: string | null): 'danger' | 'warning' | 'success' | 'secondary' {
  if (!severity) return 'secondary';
  const severityLower = severity.toLowerCase();
  if (severityLower === 'extreme' || severityLower === 'high') return 'danger';
  if (severityLower === 'moderate') return 'warning';
  if (severityLower === 'low') return 'success';
  return 'secondary';
}

/**
 * Get hover background class - only apply gray overlay if no severity color is present
 */
function getHoverClass(cardStyle: string): string {
  // If severity color is applied (has colored background), don't add gray overlay
  if (cardStyle.includes('bg-red-900') || 
      cardStyle.includes('bg-yellow-900') || 
      cardStyle.includes('bg-green-900')) {
    return ''; // No additional hover background
  }
  // Default gray background needs darker overlay on hover
  return 'hover:bg-gray-800/20';
}

/**
 * Render data in table format for arrays of objects (e.g., Colorimetric Tubes, Analytical Methods)
 */
function TableData({ data }: { data: any[] }) {
  if (!Array.isArray(data) || data.length === 0) return null;
  
  // Get all unique keys from all objects
  const allKeys = new Set<string>();
  data.forEach(item => {
    if (item && typeof item === 'object') {
      Object.keys(item).forEach(key => allKeys.add(key));
    }
  });
  
  const keys = Array.from(allKeys);
  if (keys.length === 0) return null;
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-base">
        <thead>
          <tr className="bg-gray-800/50">
            {keys.map(key => (
              <th key={key} className="px-3 py-2 text-left font-semibold text-gray-300">
                {formatKey(key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-800/52'}>
              {keys.map(key => (
                <td key={key} className="px-3 py-2 text-gray-300">
                  {typeof item[key] === 'object' && item[key] !== null
                    ? JSON.stringify(item[key])
                    : String(item[key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Render nested properties using responsive definition list
 * Mobile-first design with CSS Grid for optimal layout on all devices
 * Special case: For FAQ content (single entry with empty key), render as plain text
 */
function ResponsiveDataList({ 
  data, 
  variant = 'detailed',
  level = 0 
}: { 
  data: Record<string, any>; 
  variant?: 'compact' | 'detailed' | 'regulatory';
  level?: number;
}) {
  const entries = Object.entries(data).filter(([key, value]) => 
    !key.startsWith('_') && value !== null && value !== undefined
  );

  if (entries.length === 0) return null;

  // FAQ special case: Single entry with empty key = direct text rendering (no list)
  if (entries.length === 1 && entries[0][0] === '') {
    const value = entries[0][1];
    return (
      <span dangerouslySetInnerHTML={{ __html: String(value) }} />
    );
  }

  // Applications special case: Single entry with array of objects = render as cards/list
  if (entries.length === 1 && Array.isArray(entries[0][1]) && entries[0][1].length > 0) {
    const items = entries[0][1];
    const firstItem = items[0];
    
    // If array contains objects with title/name/content, render as application cards
    if (typeof firstItem === 'object' && firstItem !== null && 
        ('name' in firstItem || 'title' in firstItem)) {
      return (
        <div className="space-y-4">
          {items.map((item: any, idx: number) => {
            const displayTitle = item.title || item.name;
            const displayContent = item.content || item.description;
            
            return (
              <div key={item.id || idx} className="flex flex-col">
                <span className="font-semibold text-gray-200 text-base">
                  {displayTitle}
                </span>
                {displayContent && (
                  <span className="text-sm text-gray-400 mt-1 leading-relaxed">
                    {displayContent}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      );
    }
  }

  // Grid classes for responsive layouts
  const gridClasses = {
    compact: 'grid grid-cols-1 md:grid-cols-[minmax(120px,200px)_1fr] gap-x-4 gap-y-2',
    detailed: 'grid grid-cols-1 md:grid-cols-[minmax(180px,240px)_1fr] gap-x-6 gap-y-4',
    regulatory: 'grid grid-cols-1 lg:grid-cols-[minmax(200px,280px)_1fr] gap-x-8 gap-y-6'
  };

  // Nested lists use compact variant
  const currentVariant = level > 0 ? 'compact' : variant;

  return (
    <dl className={`${gridClasses[currentVariant]} w-full`}>
      {entries.map(([key, value], idx) => {
        const termId = `term-${key.replace(/[^a-zA-Z0-9]/g, '-')}-${idx}`;
        
        return (
          <React.Fragment key={key}>
            {/* Term (Label) */}
            <dt 
              id={termId}
              className={`font-semibold text-gray-300 md:text-right md:pr-4 
                         self-start pt-1 text-sm md:text-base
                         ${idx % 2 === 1 && level === 0 ? 'md:bg-black/5' : ''}`}
            >
              {formatKey(key)}
            </dt>
            
            {/* Definition (Value) */}
            <dd 
              aria-labelledby={termId}
              className={`text-gray-300 pl-4 md:pl-0 border-l-2 md:border-l-0 
                         border-gray-700 md:border-0 pb-3 md:pb-0
                         ${idx % 2 === 1 && level === 0 ? 'md:bg-black/5' : ''}`}
            >
              {typeof value === 'object' && value !== null && !Array.isArray(value) ? (
                <ResponsiveDataList data={value} variant="compact" level={level + 1} />
              ) : Array.isArray(value) ? (
                // Check if array contains objects - use table layout for structured data
                value.length > 0 && typeof value[0] === 'object' && value[0] !== null ? (
                  <TableData data={value} />
                ) : (
                  // Simple array values
                  <ul className="list-disc list-inside space-y-1">
                    {value.map((item, i) => (
                      <li key={i}>{String(item)}</li>
                    ))}
                  </ul>
                )
              ) : (
                <span>{String(value)}</span>
              )}
            </dd>
          </React.Fragment>
        );
      })}
    </dl>
  );
}

/**
 * Legacy NestedProperties wrapper for backward compatibility
 * Now uses ResponsiveDataList internally
 */
function NestedProperties({ data, borderColor = 'border-gray-700', bgColor = 'bg-gray-800' }: { data: Record<string, any>; borderColor?: string; bgColor?: string }) {
  return <ResponsiveDataList data={data} variant="detailed" level={0} />;
}

/**
 * Collapsible disclosure widget for nested data
 * 
 * Designed for structures like:
 * ```
 * items:
 *   - appearance_on_categories:
 *       ceramic:
 *         appearance: "..."
 *         coverage: "..."
 *       composite:
 *         appearance: "..."
 * ```
 * 
 * Each top-level key (ceramic, composite) becomes a collapsible section
 */
export function Collapsible({
  items,
  sectionMetadata,
  className = ''
}: CollapsibleProps) {
  if (!items || items.length === 0) {
    return null;
  }

  const content = (
    <div className={`space-y-2 ${className}`} role="list">
      {items.map((item, itemIndex) => {
        // Each item can have multiple category keys - sort them by severity
        const sortedEntries = sortEntriesBySeverity(Object.entries(item));
        
        return sortedEntries.map(([categoryKey, categoryData]) => {
          // Skip internal fields
          if (categoryKey.startsWith('_') || !categoryData || typeof categoryData !== 'object') {
            return null;
          }

          // Detect FAQ content pattern (single nested object with empty key = FAQ answer)
          const isFAQContent = typeof categoryData === 'object' && 
                               Object.keys(categoryData).length === 1 && 
                               Object.keys(categoryData)[0] === '';

          // Special handling for appearance_on_categories - render nested categories directly
          if (categoryKey === 'appearance_on_categories' && typeof categoryData === 'object') {
            return Object.entries(categoryData).map(([nestedKey, nestedData]) => {
              if (typeof nestedData !== 'object') return null;
              
              const displayTitle = formatKey(nestedKey);
              const icon = null; // No icons for visual characteristics
              const cardStyle = getCardStyling(nestedKey, nestedData);
              const borderColor = getBorderColor(cardStyle);
              const textColor = getTextColor(cardStyle);
              const bgColor = getBackgroundColor(cardStyle);
              const hoverClass = getHoverClass(cardStyle);
              const severity = extractSeverity(nestedData);
              const badgeVariant = getSeverityBadgeVariant(severity);
              
              return (
                <div key={`${itemIndex}-${categoryKey}-${nestedKey}`} role="listitem">
                  <details className={`group rounded-md border overflow-hidden transition-all duration-200 hover:shadow-md ${cardStyle}`}>
                    <summary 
                      className={`cursor-pointer px-4 py-3 md:px-6 md:py-4 font-normal flex items-center justify-between ${hoverClass} list-none transition-all duration-200`}
                      aria-label={`Expand ${displayTitle}`}
                    >
                      <span className="text-base font-light flex items-center gap-2">
                        {icon}
                        <span 
                          className="font-semibold"
                          dangerouslySetInnerHTML={{ __html: displayTitle }}
                        />
                      </span>
                      <div className="flex items-center gap-2">
                        {severity && (
                          <Badge variant={badgeVariant} size="sm" className="!bg-gray-900/20 !rounded-md !text-gray-100 !text-sm">
                            {severity}
                          </Badge>
                        )}
                        <svg
                          className={`w-5 h-5 ${textColor} flex-shrink-0 transition-transform duration-300 ease-in-out group-open:rotate-180`}
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
                      </div>
                    </summary>
                    <div className="overflow-hidden transition-all duration-300 ease-in-out max-h-0 opacity-0 group-open:max-h-[1000px] group-open:opacity-100">
                      <div className="px-4 py-3 md:px-6 md:py-4 text-base font-light">
                        {nestedData && <NestedProperties data={nestedData as Record<string, any>} borderColor={borderColor} bgColor={bgColor.replace(/\/\d+$/, '')} />}
                      </div>
                    </div>
                  </details>
                </div>
              );
            });
          }

          const displayTitle = formatKey(categoryKey);
          const icon = isFAQContent ? null : getCategoryIcon(categoryKey); // No icons for FAQ content
          const cardStyle = getCardStyling(categoryKey, categoryData);
          const borderColor = getBorderColor(cardStyle);
          const textColor = getTextColor(cardStyle);
          const bgColor = getBackgroundColor(cardStyle);
          const hoverClass = getHoverClass(cardStyle);
          const severity = extractSeverity(categoryData);
          const badgeVariant = getSeverityBadgeVariant(severity);

          return (
            <div key={`${itemIndex}-${categoryKey}`} role="listitem">
              <details className={`group rounded-md border overflow-hidden transition-all duration-200 hover:shadow-md ${cardStyle}`}>
                <summary 
                  className={`cursor-pointer px-4 py-3 md:px-6 md:py-4 font-normal flex items-center justify-between ${hoverClass} list-none transition-all duration-200`}
                  aria-label={`Expand ${isFAQContent ? categoryKey.replace(/<[^>]*>/g, '') : displayTitle}`}
                >
                  <span className="text-base font-light flex items-center gap-2">
                    {icon}
                    <span 
                      className="font-semibold" 
                      dangerouslySetInnerHTML={{ __html: isFAQContent ? categoryKey : displayTitle }}
                    />
                  </span>
                  <div className="flex items-center gap-2">
                    {severity && (
                      <Badge variant={badgeVariant} size="sm" className="!bg-gray-900/20 !rounded-md !text-gray-100 !text-sm">
                        {severity}
                      </Badge>
                    )}
                    <svg
                      className={`w-5 h-5 ${textColor} flex-shrink-0 transition-transform duration-300 ease-in-out group-open:rotate-180`}
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
                  </div>
                </summary>
                <div className="overflow-hidden transition-all duration-300 ease-in-out max-h-0 opacity-0 group-open:max-h-[1000px] group-open:opacity-100">
                  <div className="px-4 py-3 md:px-6 md:py-4 text-base font-light">
                    <dl className="space-y-3">
                      <NestedProperties data={categoryData} borderColor={borderColor} bgColor={bgColor.replace(/\/\d+$/, '')} />
                    </dl>
                  </div>
                </div>
              </details>
            </div>
          );
        });
      })}
    </div>
  );

  // If section metadata provided, wrap in BaseSection
  if (sectionMetadata) {
    return (
      <BaseSection
        section={sectionMetadata}
        variant={sectionMetadata.variant as 'default' | 'dark' | undefined}
        spacing="loose"
      >
        {content}
      </BaseSection>
    );
  }

  return content;
}

export default Collapsible;
