/**
 * @component IndustryApplicationsPanel
 * @purpose Display industry applications using CardListPanel base component
 * @extends CardListPanel
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
import { createCardListPanel } from '../CardListPanel/CardListPanel';
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
}

/**
 * Display industry applications in a collapsible section
 * Handles both normalized structure and legacy flat arrays
 */
export function IndustryApplicationsPanel({
  applications,
  entityName,
  variant = 'materials',
  className = ''
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

  // Get section metadata (REQUIRED)
  const sectionMetadata = applications._section || applications.sectionMetadata;
  
  if (!sectionMetadata) {
    throw new Error(
      `Missing required _section metadata for industry_applications. ` +
      `All sections MUST have explicit _section metadata with sectionTitle and sectionDescription.`
    );
  }

  // Check presentation type (default to 'card' for simple list display)
  const presentationType = applications.presentation || 'card';

  // Card presentation: Use CardListPanel base component
  if (presentationType === 'card') {
    // Create custom card list panel with industry icon
    const IndustryCardPanel = createCardListPanel('industry', (item: CardListItem) => (
      <li className="card-background rounded-md p-4 hover:shadow-md transition-shadow duration-200">
        <h3 className="text-lg text-secondary font-semibold mb-1">
          {item.title || item.name}
        </h3>
        {(item.content || item.description) && (
          <p className="text-sm text-secondary mb-3">
            {item.content || item.description}
          </p>
        )}
      </li>
    ));

    return (
      <IndustryCardPanel
        items={items}
        sectionMetadata={sectionMetadata}
        className={className}
      />
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
      sectionMetadata={sectionMetadata}
      className={className}
    />
  );
}

// No default title/description functions - all sections MUST have explicit metadata
