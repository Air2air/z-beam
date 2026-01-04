/**
 * @component IndustryApplicationsPanel
 * @purpose Display industry applications using Collapsible component
 * @extends Collapsible
 * 
 * Supports:
 * - relationships.operational.industry_applications structure
 * - Badge presentation for compact display
 * - Collapsible mode with section metadata
 * - Fallback for legacy flat arrays
 * 
 * @see docs/NAMING_CONVENTIONS_BACKEND.md for relationships structure
 */

import { Collapsible } from '../Collapsible';
import type { RelationshipSection } from '@/types/card-schema';

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
          ? { id: app.toLowerCase().replace(/\s+/g, '-'), name: app } 
          : app
      )
    : applications.items || [];

  if (items.length === 0) return null;

  // Get section metadata or use defaults based on variant
  const sectionMetadata = applications._section || {
    section_title: getDefaultTitle(variant, entityName),
    section_description: getDefaultDescription(variant),
    icon: 'briefcase',
    order: 1
  };

  // Format items for Collapsible component
  const collapsibleItems = [{
    applications: items.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description || undefined
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

/**
 * Get default title based on variant and entity name
 */
function getDefaultTitle(variant: string, entityName?: string): string {
  const titles = {
    materials: entityName ? `Industry applications of ${entityName}` : 'Industry Applications',
    settings: entityName ? `Industry applications of ${entityName}` : 'Industry Applications',
    contaminants: 'Industries Where Found',
    compounds: 'Industries of Concern'
  };
  return titles[variant as keyof typeof titles] || 'Industry Applications';
}

/**
 * Get default description based on variant
 */
function getDefaultDescription(variant: string): string {
  const descriptions = {
    materials: 'Common industrial uses and sectors for this material',
    settings: 'Industries using these laser cleaning parameters',
    contaminants: 'Industries where this contaminant is commonly encountered',
    compounds: 'Industries where this compound is generated during laser cleaning'
  };
  return descriptions[variant as keyof typeof descriptions] || 'Industry applications';
}
