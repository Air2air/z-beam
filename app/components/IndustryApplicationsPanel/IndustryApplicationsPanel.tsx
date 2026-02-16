/**
 * @component IndustryApplicationsPanel
 * @purpose Display industry applications using BaseSection component
 * @architecture Uses BaseSection for consistent section rendering
 * 
 * Supports:
 * - relationships.operational.industry_applications structure
 * - Card presentation for simple list display
 * - Collapsible mode with section metadata
 * - Fallback for legacy flat arrays
 * 
 * @see docs/NAMING_CONVENTIONS_BACKEND.md for relationships structure
 */

import { Collapsible } from '../Collapsible';
import { BaseSection } from '../BaseSection';
import type { RelationshipSection } from '@/types/card-schema';
import type { CardListItem } from '../CardListPanel/CardListPanel';
import { toCategorySlug } from '@/app/utils/formatting';

interface IndustryApplicationsPanelProps {
  applications: {
    presentation?: string;
    items: Array<{ id: string; name: string; description?: string }>;
    _section?: RelationshipSection;
  } | any;
  entityName?: string;  // Material/Contaminant/Compound name
  variant?: 'materials' | 'contaminants' | 'compounds' | 'settings';
  className?: string;
  sectionMetadata?: any;  // Pass _section metadata directly
}

/**
 * Display industry applications in a collapsible section
 * Handles both normalized structure and legacy flat arrays
 */
export function IndustryApplicationsPanel({
  applications,
  entityName: _entityName,
  variant = 'materials',
  className = '',
  sectionMetadata
}: IndustryApplicationsPanelProps) {
  if (!applications) return null;

  // Extract items array (support both normalized and legacy formats)
  const items = Array.isArray(applications) 
    ? applications.map((app: string | any) => 
        typeof app === 'string' 
          ? { id: toCategorySlug(app), name: app } 
          : app
      )
    : applications.items || [];

  if (items.length === 0) return null;

  // Get section metadata - prefer prop over nested structure
  // 🔥 MANDATORY (Jan 15, 2026): NO hardcoded fallbacks for section metadata
  const finalMetadata = sectionMetadata || applications._section || applications.sectionMetadata;
  
  // FAIL-FAST: Throw if _section metadata missing (TIER 1 policy)
  if (!finalMetadata?.sectionTitle) {
    throw new Error(`Missing _section.sectionTitle for Industry Applications (${variant})`);
  }

  // Check presentation type (default to 'card' for simple list display)
  const presentationType = applications.presentation || 'card';

  // Card presentation: Use BaseSection wrapper for consistency
  if (presentationType === 'card') {
    return (
      <BaseSection
        section={finalMetadata}
        className={className}
      >
        <ul className="grid-2col gap-2 sm:gap-3 md:gap-4 lg:gap-6 list-none">
          {items.map((item: CardListItem) => (
            <li key={item.id} className="card-background rounded-md p-3 md:p-4 hover:shadow-md transition-shadow duration-200">
              <h3 className="text-lg text-secondary font-semibold mb-1">
                {item.title || item.name}
              </h3>
              {(item.content || item.description) && (
                <p className="text-sm text-secondary mb-3">
                  {item.content || item.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      </BaseSection>
    );
  }

  // Collapsible presentation: Use Collapsible component
  // Format items for Collapsible component
  // Map frontmatter fields (title/content) to expected fields (name/description)
  const collapsibleItems = [{
    applications: items.map((item: any) => ({
      id: item.id,
      title: item.title || item.name,
      name: item.title || item.name,
      content: item.content || item.description,
      description: item.content || item.description
    }))
  }];

  return (
    <Collapsible
      items={collapsibleItems}
      sectionMetadata={finalMetadata}
      className={className}
    />
  );
}

// No default title/description functions - all sections MUST have explicit metadata
