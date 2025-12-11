# Component Consolidation Audit Report
Generated: 2025-11-14T21:16:16.493Z

## Summary
- **Total Components**: 109
- **Duplication Risk**: 40%
- **Optimization Opportunities**: 5
- **Estimated Bundle Savings**: 98KB

## High Priority Recommendations

### EXTRACT: Extract common patterns from high-risk components into shared utilities
- **Components**: ButtonIcons, Micro, Card, CardGrid, CardGridSSR, Citations, ComparisonTable, ContactForm, ContentCard, BulkDownload, BulkDownloadWrapper, DatasetCard, DatasetsContent, MaterialBrowser, SubcategoryDatasetCards, PreventionTab, QuickReferenceTab, TroubleshootingTab, BaseHeatmap, MaterialSafetyHeatmap, ProcessEffectivenessHeatmap, Hero, DebugLayout, Layout, breadcrumbs, footer, nav, ParameterRelationships, PropertyBars, RegulatoryStandards, ResearchPage, SettingsLayout, SmartTable, Tags, ThermalAccumulation, Title, search-client
- **Benefits**: Reduced code duplication, Improved maintainability, Consistent behavior across components
- **Effort**: moderate

## Component Analysis Details

### Layout
- **Path**: app/components/Layout/Layout.tsx
- **Size**: 9KB
- **Risk Score**: 6/10
- **Risk Factors**: Complex className usage (potential for CSS consolidation), High import count (potential for dependency consolidation), Large component size (potential for splitting)
- **Type**: isLayoutComponent

### ButtonIcons
- **Path**: app/components/Buttons/ButtonIcons.tsx
- **Size**: 16KB
- **Risk Score**: 5/10
- **Risk Factors**: Defines prop interfaces (potential for standardization), Complex className usage (potential for CSS consolidation), Large component size (potential for splitting)
- **Type**: isUtilityComponent

### ComparisonTable
- **Path**: app/components/ComparisonTable/ComparisonTable.tsx
- **Size**: 6KB
- **Risk Score**: 5/10
- **Risk Factors**: Defines prop interfaces (potential for standardization), Complex className usage (potential for CSS consolidation), Large component size (potential for splitting)
- **Type**: Standard Component

### ContactForm
- **Path**: app/components/Contact/ContactForm.tsx
- **Size**: 10KB
- **Risk Score**: 5/10
- **Risk Factors**: Complex className usage (potential for CSS consolidation), Large component size (potential for splitting), Uses common function naming patterns
- **Type**: hasClientSideCode

### ContentCard
- **Path**: app/components/ContentCard/ContentCard.tsx
- **Size**: 13KB
- **Risk Score**: 5/10
- **Risk Factors**: Defines prop interfaces (potential for standardization), Complex className usage (potential for CSS consolidation), Large component size (potential for splitting)
- **Type**: isUtilityComponent, hasClientSideCode

### DatasetsContent
- **Path**: app/components/Dataset/DatasetsContent.tsx
- **Size**: 13KB
- **Risk Score**: 5/10
- **Risk Factors**: Defines prop interfaces (potential for standardization), Complex className usage (potential for CSS consolidation), Large component size (potential for splitting)
- **Type**: hasClientSideCode

### MaterialBrowser
- **Path**: app/components/Dataset/MaterialBrowser.tsx
- **Size**: 8KB
- **Risk Score**: 5/10
- **Risk Factors**: Defines prop interfaces (potential for standardization), Complex className usage (potential for CSS consolidation), Large component size (potential for splitting)
- **Type**: hasClientSideCode

### PreventionTab
- **Path**: app/components/DiagnosticCenter/PreventionTab.tsx
- **Size**: 5KB
- **Risk Score**: 5/10
- **Risk Factors**: Defines prop interfaces (potential for standardization), Complex className usage (potential for CSS consolidation), Large component size (potential for splitting)
- **Type**: Standard Component

### QuickReferenceTab
- **Path**: app/components/DiagnosticCenter/QuickReferenceTab.tsx
- **Size**: 8KB
- **Risk Score**: 5/10
- **Risk Factors**: Defines prop interfaces (potential for standardization), Complex className usage (potential for CSS consolidation), Large component size (potential for splitting)
- **Type**: Standard Component

### TroubleshootingTab
- **Path**: app/components/DiagnosticCenter/TroubleshootingTab.tsx
- **Size**: 5KB
- **Risk Score**: 5/10
- **Risk Factors**: Defines prop interfaces (potential for standardization), Complex className usage (potential for CSS consolidation), Large component size (potential for splitting)
- **Type**: Standard Component
