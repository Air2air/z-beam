// app/components/Relationships/RelationshipSection.tsx
// Server Component for displaying domain linkages using existing CardGrid

import React from 'react';
import { CardGrid } from '../CardGrid';
import type { GridItem } from '@/types';
// NOTE: Commented imports pending implementation of relationship mapper utilities
// See: https://github.com/z-beam/z-beam/issues/TBD-relationship-mapper
// import { linkagesToGridItems } from '@/app/utils/relationshipMapper';
// import type { RelationshipSectionProps } from '@/types/domain-linkages';

// Temporary type until domain-linkages is fixed
type RelationshipSectionProps = {
  title: string;
  items: any[];
  domain: string;
  className?: string;
};

// Temporary placeholder until relationshipMapper is fixed
function linkagesToGridItems(items: any[], domain: string): GridItem[] {
  return items.map((item, index) => ({
    title: item.name || item.title || 'Untitled',
    slug: item.slug || '#',
    href: item.slug || '#',
    description: item.description || '',
    category: domain,
    badge: item.category || domain,
  }));
}

/**
 * RelationshipSection - Displays related domain entities using existing grid infrastructure
 * 
 * This component is a lightweight wrapper that:
 * 1. Transforms domain_linkages data to GridItem format
 * 2. Delegates to existing CardGrid for all layout/display logic
 * 3. Automatically handles adaptive layouts based on result count
 * 
 * @example
 * ```tsx
 * <RelationshipSection 
 *   title="Compatible Materials"
 *   items={frontmatter.domain_linkages.related_materials}
 *   domain="materials"
 * />
 * ```
 */
export async function RelationshipSection({
  title,
  items,
  domain,
  className = '',
}: RelationshipSectionProps) {
  // Early return if no items
  if (!items || items.length === 0) {
    return null;
  }

  // Transform domain linkages to GridItem format
  const gridItems = linkagesToGridItems(items, domain);

  // Determine optimal layout based on item count
  const itemCount = items.length;
  const mode = itemCount > 24 ? 'category-grouped' : 'simple';
  const columns = (itemCount > 50 ? 5 : itemCount > 12 ? 4 : 3) as 3 | 4;
  const filterBy = itemCount > 12 ? 'category' : 'all';

  // Use standard card variant for materials (with images), relationship for others
  const cardVariant = domain === 'materials' ? 'default' : 'relationship';

  return (
    <section className={`domain-linkages ${className}`.trim()}>
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <CardGrid
        items={gridItems}
        mode={mode}
        columns={columns}
        filterBy={filterBy}
        showBadgeSymbols={false}
        variant={cardVariant}
      />
    </section>
  );
}

/**
 * Props for RelationshipsContainer - displays all linkage types from frontmatter
 */
interface RelationshipsContainerProps {
  linkages: {
    related_materials?: any[];
    related_contaminants?: any[];
    related_compounds?: any[];
    produces_compounds?: any[];
    related_settings?: any[];
    regulatory_compliance?: any[];
    ppe_requirements?: any[];
    produced_by_contaminants?: any[];
  };
  className?: string;
}

/**
 * RelationshipsContainer - Displays all domain linkage sections from frontmatter
 * 
 * Automatically renders sections for all non-empty linkage arrays
 * 
 * @example
 * ```tsx
 * <RelationshipsContainer linkages={frontmatter.domain_linkages} />
 * ```
 */
export async function RelationshipsContainer({
  linkages,
  className = '',
}: RelationshipsContainerProps) {
  const sections = [];

  // Related Materials
  if (linkages.related_materials && linkages.related_materials.length > 0) {
    sections.push(
      <RelationshipSection
        key="materials"
        title="Compatible Materials"
        items={linkages.related_materials}
        domain="materials"
      />
    );
  }

  // Related Contaminants
  if (linkages.related_contaminants && linkages.related_contaminants.length > 0) {
    sections.push(
      <RelationshipSection
        key="contaminants"
        title="Related Contaminants"
        items={linkages.related_contaminants}
        domain="contaminants"
      />
    );
  }

  // Related Compounds
  if (linkages.related_compounds && linkages.related_compounds.length > 0) {
    sections.push(
      <RelationshipSection
        key="compounds"
        title="Hazardous Compounds Generated"
        items={linkages.related_compounds}
        domain="compounds"
      />
    );
  }

  // Produces Compounds (for contaminant pages)
  if (linkages.produces_compounds && linkages.produces_compounds.length > 0) {
    sections.push(
      <RelationshipSection
        key="produces-compounds"
        title="Hazardous Compounds Generated"
        items={linkages.produces_compounds}
        domain="compounds"
      />
    );
  }

  // Produced By Contaminants (for compound pages)
  if (linkages.produced_by_contaminants && linkages.produced_by_contaminants.length > 0) {
    sections.push(
      <RelationshipSection
        key="produced-by"
        title="Produced By These Contaminants"
        items={linkages.produced_by_contaminants}
        domain="contaminants"
      />
    );
  }

  // Related Settings
  if (linkages.related_settings && linkages.related_settings.length > 0) {
    sections.push(
      <RelationshipSection
        key="settings"
        title="Recommended Settings"
        items={linkages.related_settings}
        domain="settings"
      />
    );
  }

  // Regulatory Compliance
  if (linkages.regulatory_compliance && linkages.regulatory_compliance.length > 0) {
    sections.push(
      <RelationshipSection
        key="regulatory"
        title="Regulatory Standards"
        items={linkages.regulatory_compliance}
        domain="regulatory"
      />
    );
  }

  // PPE Requirements
  if (linkages.ppe_requirements && linkages.ppe_requirements.length > 0) {
    sections.push(
      <RelationshipSection
        key="ppe"
        title="Required Personal Protective Equipment"
        items={linkages.ppe_requirements}
        domain="ppe"
      />
    );
  }

  // Return null if no sections
  if (sections.length === 0) {
    return null;
  }

  return (
    <div className={`domain-linkages-container space-y-12 ${className}`.trim()}>
      {sections}
    </div>
  );
}
