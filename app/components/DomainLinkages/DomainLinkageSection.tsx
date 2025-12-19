// app/components/DomainLinkages/DomainLinkageSection.tsx
// Server Component for displaying domain linkages using existing CardGridSSR

import React from 'react';
import { CardGridSSR } from '../CardGrid/CardGridSSR';
import { linkagesToGridItems } from '@/app/utils/domainLinkageMapper';
import type { DomainLinkageSectionProps } from '@/types/domain-linkages';

/**
 * DomainLinkageSection - Displays related domain entities using existing grid infrastructure
 * 
 * This component is a lightweight wrapper that:
 * 1. Transforms domain_linkages data to GridItemSSR format
 * 2. Delegates to existing CardGridSSR for all layout/display logic
 * 3. Automatically handles adaptive layouts based on result count
 * 
 * @example
 * ```tsx
 * <DomainLinkageSection 
 *   title="Compatible Materials"
 *   items={frontmatter.domain_linkages.related_materials}
 *   domain="materials"
 * />
 * ```
 */
export async function DomainLinkageSection({
  title,
  items,
  domain,
  className = '',
}: DomainLinkageSectionProps) {
  // Early return if no items
  if (!items || items.length === 0) {
    return null;
  }

  // Transform domain linkages to GridItemSSR format
  const gridItems = linkagesToGridItems(items, domain);

  // Determine optimal layout based on item count
  const itemCount = items.length;
  const mode = itemCount > 24 ? 'category-grouped' : 'simple';
  const columns = itemCount > 50 ? 5 : itemCount > 12 ? 4 : 3;
  const filterBy = itemCount > 12 ? 'category' : 'all';

  // Use standard card variant for materials (with images), domain-linkage for others
  const cardVariant = domain === 'materials' ? 'default' : 'domain-linkage';

  return (
    <section className={`domain-linkages ${className}`.trim()}>
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <CardGridSSR
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
 * Props for DomainLinkagesContainer - displays all linkage types from frontmatter
 */
interface DomainLinkagesContainerProps {
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
 * DomainLinkagesContainer - Displays all domain linkage sections from frontmatter
 * 
 * Automatically renders sections for all non-empty linkage arrays
 * 
 * @example
 * ```tsx
 * <DomainLinkagesContainer linkages={frontmatter.domain_linkages} />
 * ```
 */
export async function DomainLinkagesContainer({
  linkages,
  className = '',
}: DomainLinkagesContainerProps) {
  const sections = [];

  // Related Materials
  if (linkages.related_materials && linkages.related_materials.length > 0) {
    sections.push(
      <DomainLinkageSection
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
      <DomainLinkageSection
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
      <DomainLinkageSection
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
      <DomainLinkageSection
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
      <DomainLinkageSection
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
      <DomainLinkageSection
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
      <DomainLinkageSection
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
      <DomainLinkageSection
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
