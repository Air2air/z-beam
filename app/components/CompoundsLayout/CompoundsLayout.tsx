// app/components/CompoundsLayout/CompoundsLayout.tsx
// Specialized layout for hazardous compound pages
// Refactored Feb 4, 2026 to use consolidated relationship utilities

import React from 'react';
import { BaseContentLayout } from '../BaseContentLayout';
import { ContaminantCard } from '../ContaminantCard';
import { ScheduleCards } from '../Schedule/ScheduleCards';
import { SafetyDataPanel } from '../SafetyDataPanel/SafetyDataPanel';
import { DescriptiveDataPanel } from '../DescriptiveDataPanel';
import { InfoCard } from '../InfoCard/InfoCard';
import { BaseSection } from '../BaseSection/BaseSection';
import { RelationshipsDump } from '../RelationshipsDump/RelationshipsDump';
import { IndustryApplicationsPanel } from '../IndustryApplicationsPanel';
import { FAQPanel } from '../FAQPanel';
import { contaminantLinkageToGridItem, materialLinkageToGridItem } from '@/app/utils/gridMappers';
import { GRID_GAP_RESPONSIVE } from '@/app/config/site';
import { sortByFrequency } from '@/app/utils/gridSorters';
import { getRelationshipSection } from '@/app/utils/relationshipHelpers';
import { getArticle } from '@/app/utils/contentAPI';
import { Beaker, Thermometer, Activity, FileText } from 'lucide-react';
import { CardGrid } from '../CardGrid';
import type { CompoundsLayoutProps, SectionConfig, Relationship } from '@/types';

// Re-export for convenience
export type { CompoundsLayoutProps };

type LinkageItem = {
  id: string;
  name?: string;
  title?: string;
  category?: string;
  subcategory?: string;
  url?: string;
  image?: string;
  description?: string;
  frequency?: 'very_common' | 'common' | 'occasional' | 'rare';
  severity?: 'severe' | 'high' | 'moderate' | 'low';
  typicalContext?: string;
};

async function enrichSourceMaterialLinkage(item: LinkageItem): Promise<LinkageItem | null> {
  if (!item?.id) return null;

  if (item.url && item.title && item.category) {
    return item;
  }

  const materialArticle = await getArticle(item.id);
  if (!materialArticle?.frontmatter) {
    return null;
  }

  const materialMeta = materialArticle.frontmatter as Record<string, any>;
  const materialPath = materialMeta.fullPath as string | undefined;

  return {
    ...item,
    name: item.name || materialMeta.displayName || materialMeta.name || materialMeta.title || item.id,
    title: item.title || materialMeta.displayTitle || materialMeta.title || materialMeta.name || item.id,
    category: item.category || materialMeta.category,
    subcategory: item.subcategory || materialMeta.subcategory,
    url: item.url || materialPath,
    image: item.image || materialMeta.images?.hero?.url,
    description: item.description || materialMeta.pageDescription || materialMeta.description || '',
  };
}

function toRelationship(item: LinkageItem): Relationship | null {
  if (
    !item.id ||
    !item.name ||
    !item.title ||
    !item.category ||
    !item.subcategory ||
    !item.url ||
    !item.image ||
    !item.description ||
    !item.frequency ||
    !item.severity ||
    !item.typicalContext
  ) {
    return null;
  }

  return {
    id: item.id,
    name: item.name,
    title: item.title,
    category: item.category,
    subcategory: item.subcategory,
    url: item.url,
    image: item.image,
    description: item.description,
    frequency: item.frequency,
    severity: item.severity,
    typicalContext: item.typicalContext,
  };
}

export async function CompoundsLayout(props: CompoundsLayoutProps) {
  const { metadata, children, slug = '', category = '', subcategory = '' } = props;
  
  // Extract compound name for display
  const compoundName = (metadata?.title as string) || metadata?.name || slug;
  
  // All data comes directly from frontmatter - fully denormalized (Phase 2 complete)
  const relationships = (metadata as any)?.relationships || {};
  const industryApplications = relationships?.operational?.industryApplications?.items || [];
  
  // Source contaminants - complete data from frontmatter (all 9 fields guaranteed)
  const sourceContaminantsRaw = relationships?.interactions?.producedFromContaminants || {};
  const sourceContaminants = sourceContaminantsRaw?.items || [];
  
  // Source materials - complete data from frontmatter
  const sourceMaterialsRaw = relationships?.interactions?.producedFromMaterials || {};
  const sourceMaterials = sourceMaterialsRaw?.items || [];
  const sourceMaterialsEnriched: Relationship[] = (
    await Promise.all(sourceMaterials.map((item: LinkageItem) => enrichSourceMaterialLinkage(item)))
  )
    .map(item => (item ? toRelationship(item) : null))
    .filter((item): item is Relationship => Boolean(item));

  // Prepare safety data from canonical relationships structure
  const safetyRelationships = relationships?.safety || {};
  const safetyData = {
    ppe_requirements: safetyRelationships?.ppeRequirements,
    regulatory_classification: safetyRelationships?.regulatoryClassification,
    workplace_exposure: safetyRelationships?.workplaceExposure,
    reactivity: relationships?.interactions?.reactivity,
    environmental_impact: relationships?.environmental?.environmentalImpact,
    detection_monitoring: relationships?.detectionMonitoring?.detectionMonitoring,
  };

  // Check if any safety data actually exists
  const hasSafetyData = Object.values(safetyData).some(value => value !== undefined && value !== null);

  // Extract additional compound data for new InfoCard sections
  const physicalProperties = (metadata as any)?.physicalProperties;
  
  const exposureLimitsItems = (safetyRelationships?.exposureLimits?.items || []).filter((item: any) => item != null);
  const exposureLimits = exposureLimitsItems[0] || (metadata as any)?.exposureLimits;
  
  const healthEffects = (metadata as any)?.healthEffectsKeywords;
  const synonyms = (metadata as any)?.synonymsIdentifiers;
  const casNumber = (metadata as any)?.casNumber;
  const molecularWeight = (metadata as any)?.molecularWeight;
  const chemicalFormula = (metadata as any)?.chemicalFormula;
  const rawFaq = (metadata as any)?.faq;
  const faq = Array.isArray(rawFaq) ? rawFaq : (typeof rawFaq === 'string' ? rawFaq : rawFaq?.items);

  // Configure sections for BaseContentLayout
  const sections: SectionConfig[] = [
    // Chemical Properties Section - NEW
    {
      component: () => (
        <BaseSection
          title="Chemical Properties"
        >
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${GRID_GAP_RESPONSIVE}`}>
            {(casNumber || molecularWeight || chemicalFormula) && (
              <InfoCard
                icon={Beaker}
                title="Chemical Identity"
                data={[
                  casNumber && { label: 'CAS Number', value: casNumber },
                  chemicalFormula && { label: 'Formula', value: chemicalFormula },
                  molecularWeight && { label: 'Molecular Weight', value: `${molecularWeight} g/mol` },
                ].filter(Boolean) as Array<{ label: string; value: string | number }>}
              />
            )}
            
            {physicalProperties && (
              <InfoCard
                icon={Thermometer}
                title="Physical Properties"
                data={[
                  physicalProperties.boiling_point && { label: 'Boiling Point', value: physicalProperties.boiling_point },
                  physicalProperties.melting_point && { label: 'Melting Point', value: physicalProperties.melting_point },
                  physicalProperties.flash_point && { label: 'Flash Point', value: physicalProperties.flash_point },
                  physicalProperties.vapor_pressure && { label: 'Vapor Pressure', value: physicalProperties.vapor_pressure },
                  physicalProperties.specific_gravity && { label: 'Specific Gravity', value: physicalProperties.specific_gravity },
                ].filter(Boolean) as Array<{ label: string; value: string | number }>}
              />
            )}

            {exposureLimits && (
              <InfoCard
                icon={Activity}
                title="Exposure Limits Comparison"
                data={[
                  exposureLimits.osha_pel_ppm && { label: 'OSHA PEL', value: `${exposureLimits.osha_pel_ppm} ppm` },
                  exposureLimits.niosh_rel_ppm && { label: 'NIOSH REL', value: `${exposureLimits.niosh_rel_ppm} ppm` },
                  exposureLimits.acgih_tlv_ppm && { label: 'ACGIH TLV', value: `${exposureLimits.acgih_tlv_ppm} ppm` },
                ].filter(Boolean) as Array<{ label: string; value: string | number }>}
              />
            )}

            {healthEffects && healthEffects.length > 0 && (
              <InfoCard
                icon={Activity}
                title="Health Effects"
                data={healthEffects.slice(0, 5).map((effect: string) => ({
                  label: effect.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                  value: 'Yes'
                }))}
              />
            )}

            {synonyms && synonyms.synonyms && synonyms.synonyms.length > 0 && (
              <InfoCard
                icon={FileText}
                title="Also Known As"
                data={synonyms.synonyms.slice(0, 4).map((syn: string, idx: number) => ({
                  label: `Synonym ${idx + 1}`,
                  value: syn
                }))}
              />
            )}
          </div>
        </BaseSection>
      ),
      condition: !!(casNumber || molecularWeight || chemicalFormula || physicalProperties || exposureLimits || healthEffects || synonyms),
      props: {}
    },
    
    // Existing SafetyDataPanel - now with collapsible mode
    {
      component: SafetyDataPanel,
      condition: hasSafetyData,
      props: {
        safetyData,
        collapsible: true,
        entityName: compoundName
      }
    },
    {
      component: IndustryApplicationsPanel,
      condition: !!industryApplications,
      props: {
        applications: industryApplications,
        entityName: compoundName,
        variant: 'compounds' as const,
      }
    },
    {
      component: CardGrid,
      condition: sourceContaminants.length > 0,
      props: {
        items: sourceContaminants
          .sort(sortByFrequency)
          .map(contaminantLinkageToGridItem),
        title: sourceContaminantsRaw?._section?.sectionTitle,
        description: sourceContaminantsRaw?._section?.sectionDescription,
        cardComponent: ContaminantCard,
      }
    },
    {
      component: CardGrid,
      condition: sourceMaterialsEnriched.length > 0,
      props: {
        items: sourceMaterialsEnriched.map(materialLinkageToGridItem),
        title: sourceMaterialsRaw?._section?.sectionTitle,
        description: sourceMaterialsRaw?._section?.sectionDescription,
        variant: 'relationship' as const,
      }
    },
    // Descriptive data sections - using helper for type-safe access
    ...[
      'identity.chemicalProperties',
      'identity.physicalProperties',
      'identity.synonymsIdentifiers',
      'safety.healthEffects',
      'safety.ppeRequirements',
      'safety.exposureLimits',
      'safety.storageRequirements',
      'safety.emergencyResponse',
      'safety.regulatoryClassification',
      'environmental.environmentalImpact'
    ].map(path => {
      const section = getRelationshipSection(relationships, path);
      return {
        component: DescriptiveDataPanel,
        condition: !!section,
        props: {
          items: section?.items || [],
          sectionMetadata: section?.metadata,
        }
      };
    }),
    {
      component: FAQPanel,
      condition: !!faq && (typeof faq === 'string' ? faq.length > 0 : faq.length > 0),
      props: {
        faq,
        entityName: compoundName,
        variant: 'faq' as const,
        sectionTitle: (metadata as any)?.faq?._section?.sectionTitle,
        sectionDescription: (metadata as any)?.faq?._section?.sectionDescription,
      }
    },
    ...[
      'detectionMonitoring.detectionMonitoring',
      'interactions.reactivity',
    ].map(path => {
      const section = getRelationshipSection(relationships, path);
      return {
        component: DescriptiveDataPanel,
        condition: !!section,
        props: {
          items: section?.items || [],
          sectionMetadata: section?.metadata,
        }
      };
    }),
    // DUMP ALL RELATIONSHIPS FOR ANALYSIS (development only)
    {
      component: RelationshipsDump,
      condition: () => process.env.NODE_ENV === 'development',
      props: {
        relationships,
        entityName: compoundName
      }
    },
    // ScheduleCards MUST be last section for all layouts
    {
      component: ScheduleCards,
      props: {}
    },
  ];
  
  return (
    <BaseContentLayout
      {...props}
      contentType="compounds"
      sections={sections}
      slug={slug}
      category={category}
      subcategory={subcategory}
    >
      {children}
    </BaseContentLayout>
  );
}

export default CompoundsLayout;
