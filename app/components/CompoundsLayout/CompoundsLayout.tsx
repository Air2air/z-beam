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
import { SectionConfigBuilder } from '@/app/utils/sectionConfigBuilder';
import { contaminantLinkageToGridItem } from '@/app/utils/gridMappers';
import { GRID_GAP_RESPONSIVE } from '@/app/config/site';
import { sortByFrequency } from '@/app/utils/gridSorters';
import { getRelationshipSection } from '@/app/utils/relationshipHelpers';
import { Beaker, Thermometer, Activity, FileText } from 'lucide-react';
import { CardGrid } from '../CardGrid';
import type { CompoundsLayoutProps, SectionConfig } from '@/types';

// Re-export for convenience
export type { CompoundsLayoutProps };

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

  // Prepare safety data from relationships (structured data) and metadata (legacy)
  /**
   * Safety data location (normalized structure):
   * - PREFERRED: relationships.safety.* (normalized location with presentation wrappers)
   * - FALLBACK: relationships.* (legacy direct fields)
   * - FALLBACK: metadata.* (legacy top-level fields)
   * 
   * Normalized structure: {presentation: 'card'|'descriptive', items: [...]}
   * Legacy structure: direct objects or strings
   * 
   * SafetyDataPanel component handles both formats automatically.
   */
  const safetyRelationships = relationships?.safety || {};
  const safetyData = {
    ppe_requirements: safetyRelationships?.ppe_requirements || relationships?.ppe_requirements || (metadata as any)?.ppe_requirements,
    regulatory_classification: safetyRelationships?.regulatory_classification || relationships?.regulatory_classification || (metadata as any)?.regulatory_classification,
    workplace_exposure: safetyRelationships?.workplace_exposure || relationships?.workplace_exposure || (metadata as any)?.workplace_exposure,
    reactivity: safetyRelationships?.reactivity || relationships?.reactivity || (metadata as any)?.reactivity,
    environmental_impact: safetyRelationships?.environmental_impact || relationships?.environmental_impact || (metadata as any)?.environmental_impact,
    detection_monitoring: safetyRelationships?.detection_monitoring || relationships?.detection_monitoring || (metadata as any)?.detection_monitoring,
  };

  // Check if any safety data actually exists
  const hasSafetyData = Object.values(safetyData).some(value => value !== undefined && value !== null);

  // Extract additional compound data for new InfoCard sections
  const physicalProperties = (metadata as any)?.physical_properties || (metadata as any)?.physicalProperties;
  
  // Read exposure_limits from new hierarchical location: relationships.safety.exposure_limits.items[0]
  // Filter out null items and get the first valid exposure limit object
  const exposureLimitsItems = (safetyRelationships?.exposure_limits?.items || []).filter((item: any) => item != null);
  const exposureLimits = exposureLimitsItems[0] || (metadata as any)?.exposure_limits || (metadata as any)?.exposureLimits; // Fallback to legacy location
  
  const healthEffects = (metadata as any)?.health_effects_keywords || (metadata as any)?.healthEffectsKeywords;
  const synonyms = (metadata as any)?.synonyms_identifiers || (metadata as any)?.synonymsIdentifiers;
  const casNumber = (metadata as any)?.cas_number || (metadata as any)?.casNumber;
  const molecularWeight = (metadata as any)?.molecular_weight || (metadata as any)?.molecularWeight;
  const chemicalFormula = (metadata as any)?.chemical_formula || (metadata as any)?.chemicalFormula;

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
      condition: sourceMaterials.length > 0,
      props: {
        items: sourceMaterials,
        title: sourceMaterialsRaw?._section?.sectionTitle || `Source materials for ${compoundName}`,
        description: sourceMaterialsRaw?._section?.sectionDescription || `Materials that produce ${compoundName} when cleaned`,
        variant: 'relationship' as const,
      }
    },
    // Descriptive data sections - using helper for type-safe access
    ...[  
      'safety.exposure_limits',
      'safety.ppe_requirements',
      'safety.detection_monitoring',
      'safety.emergency_response',
      'safety.environmental_impact',
      'safety.regulatory_classification',
      'physical_properties',
      'reactivity',
      'synonyms_identifiers'
    ].map(path => {
      const section = getRelationshipSection(relationships, path);
      return {
        component: DescriptiveDataPanel,
        condition: !!section,
        props: {
          items: section?.items || [],
          sectionMetadata: section?.frontmatter,
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
