// app/components/CompoundsLayout/CompoundsLayout.tsx
// Specialized layout for hazardous compound pages

import React from 'react';
import { BaseContentLayout } from '../BaseContentLayout';
import { CardGrid } from '../CardGrid';
import { ContaminantCard } from '../ContaminantCard';
import { ScheduleCards } from '../Schedule/ScheduleCards';
import { SafetyDataPanel } from '../SafetyDataPanel/SafetyDataPanel';
import { DescriptiveDataPanel } from '../DescriptiveDataPanel';
import ContaminantDatasetDownloader from '../Dataset/ContaminantDatasetDownloader';
import { InfoCard } from '../InfoCard/InfoCard';
import { GRID_GAP_RESPONSIVE } from '@/app/config/site';
import { SectionContainer } from '../SectionContainer/SectionContainer';
import { RelationshipsDump } from '../RelationshipsDump/RelationshipsDump';
import { contaminantLinkageToGridItem, materialLinkageToGridItem } from '@/app/utils/gridMappers';
import { sortByFrequency } from '@/app/utils/gridSorters';
import { getContaminantArticle, getArticle } from '@/app/utils/contentAPI';
import { getRelationshipSection } from '@/app/utils/relationshipHelpers';
import { Beaker, Thermometer, Activity, FileText } from 'lucide-react';
import type { LayoutProps, SectionConfig, CompoundsLayoutProps } from '@/types';

// Re-export for convenience
export type { CompoundsLayoutProps };

export async function CompoundsLayout(props: CompoundsLayoutProps) {
  const { metadata, children, slug = '', category = '', subcategory = '' } = props;
  
  // Extract compound name for display
  const compoundName = (metadata?.title as string) || metadata?.name || slug;
  
  // Access data from relationships
  const relationships = (metadata as any)?.relationships || {};
  
  // Source contaminants that produce this compound
  // Handle both array format and object with items array (check technical group first)
  const sourceContaminantsRaw = relationships?.technical?.produced_from_contaminants || relationships?.produced_from_contaminants || relationships?.produced_by_contaminants || relationships?.source_contaminants;
  const sourceContaminants = (Array.isArray(sourceContaminantsRaw) 
    ? sourceContaminantsRaw 
    : (sourceContaminantsRaw?.items || [])).filter((item: any) => item != null);

  // Source materials that produce this compound (check technical group first)
  const sourceMaterialsRaw = relationships?.technical?.produced_from_materials || relationships?.produced_from_materials;
  const sourceMaterials = (Array.isArray(sourceMaterialsRaw)
    ? sourceMaterialsRaw
    : (sourceMaterialsRaw?.items || [])).filter((item: any) => item != null);

  // Enrich minimal references with full contaminant data
  const enrichedContaminants = await Promise.all(
    sourceContaminants.map(async (ref: any) => {
      // Skip if ref is invalid or missing id
      if (!ref || !ref.id) return null;
      
      // Fetch full article data to get title and other metadata
      const article = await getContaminantArticle(ref.id);
      if (!article) return null;
      
      const metadata = article.metadata as any;
      return {
        id: ref.id,
        title: metadata.name || metadata.title,
        category: metadata.category || '',
        subcategory: metadata.subcategory || '',
        description: ref.typical_context || metadata.description || '',
        url: ref.url || metadata.full_path, // Prefer relationship URL, then full_path
        frequency: ref.frequency,
        severity: ref.severity,
        typical_context: ref.typical_context,
        image: metadata.images?.hero?.url || '',
      };
    })
  ).then(items => items.filter(Boolean));

  // Enrich minimal references with full material data
  const enrichedMaterials = await Promise.all(
    sourceMaterials.map(async (ref: any) => {
      // Skip if ref is invalid or missing id
      if (!ref || !ref.id) return null;
      
      // Fetch full article data to get title and other metadata
      const article = await getArticle(ref.id);
      if (!article) return null;
      
      const metadata = article.metadata as any;
      return {
        id: ref.id,
        title: metadata.name || metadata.title,
        category: metadata.category || '',
        subcategory: metadata.subcategory || '',
        description: metadata.description || '',
        url: metadata.full_path, // Must have full_path in metadata
        image: metadata.images?.hero?.url || '',
      };
    })
  ).then(items => items.filter(Boolean));

  // Prepare safety data from relationships (structured data) and metadata (legacy)
  const safetyRelationships = relationships?.safety || {};
  const safetyData = {
    ppe_requirements: safetyRelationships?.ppe_requirements || relationships?.ppe_requirements || (metadata as any)?.ppe_requirements,
    storage_requirements: safetyRelationships?.storage_requirements || relationships?.storage_requirements || (metadata as any)?.storage_requirements,
    regulatory_classification: safetyRelationships?.regulatory_classification || relationships?.regulatory_classification || (metadata as any)?.regulatory_classification,
    workplace_exposure: safetyRelationships?.workplace_exposure || relationships?.workplace_exposure || (metadata as any)?.workplace_exposure,
    reactivity: safetyRelationships?.reactivity || relationships?.reactivity || (metadata as any)?.reactivity,
    environmental_impact: safetyRelationships?.environmental_impact || relationships?.environmental_impact || (metadata as any)?.environmental_impact,
    detection_monitoring: safetyRelationships?.detection_monitoring || relationships?.detection_monitoring || (metadata as any)?.detection_monitoring,
  };

  // Check if any safety data actually exists
  const hasSafetyData = Object.values(safetyData).some(value => value !== undefined && value !== null);

  // Extract additional compound data for new InfoCard sections
  const physicalProperties = (metadata as any)?.physical_properties;
  
  // Read exposure_limits from new hierarchical location: relationships.safety.exposure_limits.items[0]
  // Filter out null items and get the first valid exposure limit object
  const exposureLimitsItems = (safetyRelationships?.exposure_limits?.items || []).filter((item: any) => item != null);
  const exposureLimits = exposureLimitsItems[0] || (metadata as any)?.exposure_limits; // Fallback to legacy location
  
  const healthEffects = (metadata as any)?.health_effects_keywords;
  const synonyms = (metadata as any)?.synonyms_identifiers;
  const casNumber = (metadata as any)?.cas_number;
  const molecularWeight = (metadata as any)?.molecular_weight;
  const chemicalFormula = (metadata as any)?.chemical_formula;

  // Configure sections for BaseContentLayout
  const sections: SectionConfig[] = [
    // Chemical Properties Section - NEW
    {
      component: () => (
        <SectionContainer
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
        </SectionContainer>
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
      component: CardGrid,
      condition: enrichedContaminants.length > 0,
      props: {
        items: enrichedContaminants
          .sort(sortByFrequency)
          .map(contaminantLinkageToGridItem),
        title: sourceContaminantsRaw?._section?.title || 'Contaminant Sources',
        description: sourceContaminantsRaw?._section?.description || 'Contaminants that produce this compound during laser cleaning operations',
        cardComponent: ContaminantCard,
      }
    },
    {
      component: CardGrid,
      condition: enrichedMaterials.length > 0,
      props: {
        items: enrichedMaterials.map(materialLinkageToGridItem),
        title: sourceMaterialsRaw?._section?.title || 'Material Sources',
        description: sourceMaterialsRaw?._section?.description || 'Materials that produce this compound during laser cleaning operations',
        variant: 'relationship' as const,
      }
    },
    // Descriptive data sections - using helper for type-safe access
    ...[  
      'safety.exposure_limits',
      'safety.ppe_requirements',
      'safety.storage_requirements',
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
    // Dataset downloader at bottom
    {
      component: ContaminantDatasetDownloader,
      props: {
        contaminantName: compoundName,
        slug: slug,
        category: category,
        subcategory: subcategory
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
