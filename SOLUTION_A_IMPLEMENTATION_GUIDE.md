# Solution A Implementation Guide
**Date**: December 17, 2025  
**Version**: 1.0  
**Status**: Ready for Implementation  
**Estimated Timeline**: 2 weeks

---

## Executive Summary

**Objective**: Eliminate data duplication between `domain_linkages.produces_compounds` and `laser_properties.safety_data.fumes_generated` by adding 2 missing fields to the enhanced structure and deprecating the legacy data.

**Changes**:
- ✅ Add `concentration_range` field to domain_linkages.produces_compounds
- ✅ Add `hazard_class` field to domain_linkages.produces_compounds
- ✅ Remove `laser_properties.safety_data.fumes_generated` entirely
- ✅ Update SafetyDataPanel component to use domain_linkages only
- ✅ Create CompoundSafetyGrid component for enhanced display

**Impact**:
- Single source of truth for compound data
- No conflicts or inconsistencies
- Simplified maintenance
- Enhanced UI capabilities (concentration badges, hazard class filtering)

---

## Current State Analysis

### Data Duplication Issue

**Location A**: `domain_linkages.produces_compounds` (Enhanced, 90% complete)
```yaml
domain_linkages:
  produces_compounds:
    - id: carbon-monoxide-compound
      title: Carbon Monoxide
      url: /compounds/toxic-gas/asphyxiant/carbon-monoxide-compound
      image: /images/compounds/carbon-monoxide.jpg
      category: toxic-gas
      subcategory: asphyxiant
      frequency: very_common
      severity: high
      typical_context: "Incomplete combustion of organic adhesives"
      exposure_risk: high
      exposure_limits:
        osha_pel_mg_m3: 55
        niosh_rel_mg_m3: 40
        acgih_tlv_mg_m3: 29
        idlh_mg_m3: null
      exceeds_limits: false
      monitoring_required: false
      control_measures:
        ventilation_required: false
        ppe_level: none
        filtration_type: null
      # ❌ MISSING: concentration_range
      # ❌ MISSING: hazard_class
```

**Location B**: `laser_properties.safety_data.fumes_generated` (Legacy)
```yaml
laser_properties:
  safety_data:
    fumes_generated:
      - compound: Carbon Monoxide        # Different naming
        concentration_mg_m3: 10-50       # ✅ HAS concentration
        exposure_limit_mg_m3: 29         # Single value (ACGIH only)
        hazard_class: toxic              # ✅ HAS hazard_class
```

### Component Dependencies

**Current Usage**:
```tsx
// app/components/SafetyDataPanel/SafetyDataPanel.tsx
<HazardousFumesTable fumesGenerated={safetyData.fumes_generated} />

// app/components/HazardousFumesTable/HazardousFumesTable.tsx
interface FumeData {
  compound: string;
  concentration_mg_m3: number | string;
  exposure_limit_mg_m3: number;
  hazard_class: string;
}
```

---

## Implementation Plan

### Phase 1: Schema Enhancement (Week 1, Days 1-2)

#### Step 1.1: Update YAML Schema Definition

Create new schema file: `schemas/contaminant-frontmatter-v4.1.yaml`

```yaml
# Enhanced domain_linkages.produces_compounds schema
produces_compounds:
  type: array
  items:
    type: object
    required:
      - id
      - title
      - url
      - category
      - severity
      - exposure_limits
      - concentration_range    # NEW REQUIRED
      - hazard_class          # NEW REQUIRED
    properties:
      id:
        type: string
        pattern: "^[a-z0-9-]+-compound$"
      title:
        type: string
      url:
        type: string
        format: uri
      image:
        type: string
        format: uri
      category:
        type: string
        enum: [toxic-gas, irritant, corrosive-gas, solvent, particulate]
      subcategory:
        type: string
      frequency:
        type: string
        enum: [very_common, common, occasional, rare]
      severity:
        type: string
        enum: [severe, high, moderate, low]
      typical_context:
        type: string
      exposure_risk:
        type: string
        enum: [high, moderate, low]
      
      # NEW FIELD 1
      concentration_range:
        type: string
        description: "Typical concentration range in mg/m³"
        pattern: "^\\d+(\\.\\d+)?-\\d+(\\.\\d+)? mg/m³$"
        examples:
          - "10-50 mg/m³"
          - "0.5-5 mg/m³"
          - "2-15 mg/m³"
      
      # NEW FIELD 2
      hazard_class:
        type: string
        enum:
          - carcinogenic
          - toxic
          - irritant
          - corrosive
          - asphyxiant
          - flammable
        description: "Primary hazard classification"
      
      exposure_limits:
        type: object
        properties:
          osha_pel_mg_m3: {type: [number, 'null']}
          niosh_rel_mg_m3: {type: [number, 'null']}
          acgih_tlv_mg_m3: {type: [number, 'null']}
          idlh_mg_m3: {type: [number, 'null']}
      
      exceeds_limits:
        type: boolean
      monitoring_required:
        type: boolean
      
      control_measures:
        type: object
        properties:
          ventilation_required: {type: boolean}
          ppe_level: 
            type: string
            enum: [none, basic, enhanced, full]
          filtration_type:
            type: [string, 'null']
            enum: [null, hepa, carbon, hepa_carbon, p100]
```

#### Step 1.2: Update TypeScript Interfaces

**File**: `app/utils/schemas/generators/types.ts`

```typescript
// Add to existing interfaces
export interface EnhancedCompound extends DomainLinkage {
  // Navigation & Identity
  id: string;
  title: string;
  url: string;
  image: string;
  category: string;
  subcategory: string;
  
  // Context Metadata
  frequency: 'very_common' | 'common' | 'occasional' | 'rare';
  severity: 'severe' | 'high' | 'moderate' | 'low';
  typical_context: string;
  
  // Safety Data
  exposure_risk: 'high' | 'moderate' | 'low';
  
  // NEW FIELDS
  concentration_range: string;        // e.g., "10-50 mg/m³"
  hazard_class: HazardClass;         // Primary hazard type
  
  // Existing Fields
  exposure_limits: ExposureLimits;
  exceeds_limits: boolean;
  monitoring_required: boolean;
  control_measures: ControlMeasures;
}

// NEW TYPE
export type HazardClass = 
  | 'carcinogenic' 
  | 'toxic' 
  | 'irritant' 
  | 'corrosive' 
  | 'asphyxiant'
  | 'flammable';

// Color mapping helper
export const HAZARD_CLASS_COLORS: Record<HazardClass, string> = {
  carcinogenic: 'red',    // Most severe
  toxic: 'red',           // High danger
  corrosive: 'orange',    // Physical danger
  irritant: 'yellow',     // Moderate
  asphyxiant: 'purple',   // Specific danger
  flammable: 'orange',    // Fire hazard
};
```

---

### Phase 2: Data Migration (Week 1, Days 3-4)

#### Step 2.1: Migration Script

**File**: `scripts/migrate-compound-data.py`

```python
#!/usr/bin/env python3
"""
Migrate compound data from fumes_generated to domain_linkages.produces_compounds
Adds concentration_range and hazard_class fields
Removes legacy fumes_generated array
"""

import yaml
import sys
from pathlib import Path
from typing import Dict, List, Any

def load_yaml(file_path: Path) -> Dict:
    """Load YAML file with safe loader"""
    with open(file_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def save_yaml(file_path: Path, data: Dict) -> None:
    """Save YAML file with consistent formatting"""
    with open(file_path, 'w', encoding='utf-8') as f:
        yaml.dump(data, f, 
                  default_flow_style=False,
                  allow_unicode=True,
                  sort_keys=False,
                  indent=2)

def normalize_compound_name(name: str) -> str:
    """Normalize compound names for matching"""
    return name.strip().lower().replace(' ', '-')

def migrate_frontmatter(file_path: Path, dry_run: bool = False) -> Dict[str, Any]:
    """
    Migrate single frontmatter file
    
    Returns dict with migration stats
    """
    print(f"\n{'[DRY RUN] ' if dry_run else ''}Processing: {file_path.name}")
    
    data = load_yaml(file_path)
    stats = {
        'file': file_path.name,
        'compounds_updated': 0,
        'fields_added': [],
        'mismatches': [],
        'fumes_removed': False
    }
    
    # Check if migration needed
    if 'domain_linkages' not in data or 'produces_compounds' not in data['domain_linkages']:
        print("  ⚠️  No produces_compounds found, skipping")
        return stats
    
    # Get legacy fumes data
    fumes_generated = []
    if 'laser_properties' in data and 'safety_data' in data['laser_properties']:
        fumes_generated = data['laser_properties']['safety_data'].get('fumes_generated', [])
    
    if not fumes_generated:
        print("  ℹ️  No fumes_generated found, skipping")
        return stats
    
    # Create lookup: normalized_name -> fume_data
    fumes_lookup = {}
    for fume in fumes_generated:
        normalized = normalize_compound_name(fume['compound'])
        fumes_lookup[normalized] = fume
    
    # Update each compound in produces_compounds
    compounds = data['domain_linkages']['produces_compounds']
    
    for compound in compounds:
        # Extract normalized name from title
        title = compound.get('title', '')
        normalized_title = normalize_compound_name(title)
        
        # Find matching fume
        fume = fumes_lookup.get(normalized_title)
        
        if not fume:
            # Try matching by last word (e.g., "Carbon Monoxide" -> "monoxide")
            last_word = normalize_compound_name(title.split()[-1])
            fume = next((f for name, f in fumes_lookup.items() if last_word in name), None)
        
        if fume:
            updated = False
            
            # Add concentration_range if missing
            if 'concentration_range' not in compound:
                conc = fume['concentration_mg_m3']
                # Convert to standardized format
                if isinstance(conc, str):
                    compound['concentration_range'] = f"{conc} mg/m³"
                else:
                    compound['concentration_range'] = f"{conc} mg/m³"
                stats['fields_added'].append(f"{title}: concentration_range")
                updated = True
            
            # Add hazard_class if missing
            if 'hazard_class' not in compound:
                compound['hazard_class'] = fume['hazard_class']
                stats['fields_added'].append(f"{title}: hazard_class")
                updated = True
            
            # Validate exposure_limit matches ACGIH (if present)
            if 'exposure_limit_mg_m3' in fume:
                acgih = compound.get('exposure_limits', {}).get('acgih_tlv_mg_m3')
                if acgih and acgih != fume['exposure_limit_mg_m3']:
                    stats['mismatches'].append(
                        f"{title}: ACGIH mismatch ({acgih} vs {fume['exposure_limit_mg_m3']})"
                    )
            
            if updated:
                stats['compounds_updated'] += 1
        else:
            print(f"  ⚠️  No matching fume found for: {title}")
    
    # Remove fumes_generated
    if 'laser_properties' in data and 'safety_data' in data['laser_properties']:
        if 'fumes_generated' in data['laser_properties']['safety_data']:
            if not dry_run:
                del data['laser_properties']['safety_data']['fumes_generated']
            stats['fumes_removed'] = True
            print("  ✅ Removed fumes_generated")
    
    # Save if not dry run
    if not dry_run and stats['compounds_updated'] > 0:
        save_yaml(file_path, data)
        print(f"  ✅ Updated {stats['compounds_updated']} compounds")
    elif dry_run:
        print(f"  ℹ️  Would update {stats['compounds_updated']} compounds")
    
    return stats

def migrate_all_contaminants(contaminants_dir: Path, dry_run: bool = False):
    """Migrate all contaminant frontmatter files"""
    
    yaml_files = list(contaminants_dir.rglob('*.yaml'))
    print(f"Found {len(yaml_files)} YAML files")
    
    all_stats = []
    
    for yaml_file in yaml_files:
        try:
            stats = migrate_frontmatter(yaml_file, dry_run)
            all_stats.append(stats)
        except Exception as e:
            print(f"  ❌ Error processing {yaml_file.name}: {e}")
    
    # Print summary
    print("\n" + "="*80)
    print("MIGRATION SUMMARY")
    print("="*80)
    
    total_updated = sum(s['compounds_updated'] for s in all_stats)
    total_files = len([s for s in all_stats if s['compounds_updated'] > 0])
    total_fields = sum(len(s['fields_added']) for s in all_stats)
    
    print(f"Files processed: {len(all_stats)}")
    print(f"Files updated: {total_files}")
    print(f"Compounds updated: {total_updated}")
    print(f"Fields added: {total_fields}")
    
    # Show mismatches
    mismatches = [m for s in all_stats for m in s.get('mismatches', [])]
    if mismatches:
        print(f"\n⚠️  {len(mismatches)} exposure limit mismatches found:")
        for mismatch in mismatches[:10]:  # Show first 10
            print(f"  - {mismatch}")
    
    print("\n✅ Migration complete!")

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Migrate compound data')
    parser.add_argument('--contaminants-dir', 
                       default='frontmatter/contaminants',
                       help='Path to contaminants directory')
    parser.add_argument('--dry-run', 
                       action='store_true',
                       help='Run without making changes')
    
    args = parser.parse_args()
    
    contaminants_dir = Path(args.contaminants_dir)
    if not contaminants_dir.exists():
        print(f"Error: Directory not found: {contaminants_dir}")
        sys.exit(1)
    
    migrate_all_contaminants(contaminants_dir, args.dry_run)
```

#### Step 2.2: Run Migration

```bash
# Dry run first (preview changes)
python3 scripts/migrate-compound-data.py --dry-run

# Review output, then run for real
python3 scripts/migrate-compound-data.py

# Verify changes
git diff frontmatter/contaminants/
```

---

### Phase 3: Component Updates (Week 1, Days 4-5)

#### Step 3.0: Create Reusable GridSection Wrapper (NEW)

**File**: `app/components/GridSection/GridSection.tsx`

```tsx
/**
 * @component GridSection
 * @purpose Normalized wrapper for all grid components
 * @usage Provides consistent spacing, title, subtitle across all grids
 */
import React from 'react';
import { SectionContainer } from '../SectionContainer/SectionContainer';
import { SectionTitle } from '../SectionTitle/SectionTitle';

interface GridSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'dark' | 'light';
  alignment?: 'left' | 'center' | 'right';
}

export function GridSection({
  title,
  subtitle,
  children,
  className = '',
  variant = 'default',
  alignment = 'left',
}: GridSectionProps) {
  return (
    <div className="mb-16">
      <SectionContainer variant={variant}>
        <div className="container-custom px-4">
          <SectionTitle
            title={title}
            subtitle={subtitle}
            alignment={alignment}
            className="mb-8"
          />
          {children}
        </div>
      </SectionContainer>
    </div>
  );
}
```

**Export**: `app/components/GridSection/index.ts`
```tsx
export { GridSection } from './GridSection';
```

---

#### Step 3.1: Create CompoundSafetyGrid Component

**File**: `app/components/CompoundSafetyGrid/CompoundSafetyGrid.tsx`

```tsx
/**
 * @component CompoundSafetyGrid
 * @purpose Display hazardous compounds with safety indicators
 * @usage Contamination pages only (shows produces_compounds)
 */
'use client';

import React from 'react';
import { CardGridSSR } from '../CardGrid/CardGridSSR';
import { GridItemSSR } from '@/types';
import { AlertTriangle, Wind, Shield } from 'lucide-react';

interface EnhancedCompound {
  id: string;
  title: string;
  url: string;
  image: string;
  category: string;
  subcategory: string;
  frequency: 'very_common' | 'common' | 'occasional' | 'rare';
  severity: 'severe' | 'high' | 'moderate' | 'low';
  typical_context: string;
  exposure_risk: 'high' | 'moderate' | 'low';
  
  // NEW FIELDS
  concentration_range: string;
  hazard_class: 'carcinogenic' | 'toxic' | 'irritant' | 'corrosive' | 'asphyxiant' | 'flammable';
  
  exposure_limits: {
    osha_pel_mg_m3: number | null;
    niosh_rel_mg_m3: number | null;
    acgih_tlv_mg_m3: number | null;
    idlh_mg_m3: number | null;
  };
  exceeds_limits: boolean;
  monitoring_required: boolean;
  control_measures: {
    ventilation_required: boolean;
    ppe_level: 'none' | 'basic' | 'enhanced' | 'full';
    filtration_type: string | null;
  };
}

interface CompoundSafetyGridProps {
  compounds: EnhancedCompound[];
  className?: string;
  columns?: 2 | 3 | 4;
  sortBy?: 'severity' | 'concentration' | 'alphabetical';
  showConcentrations?: boolean;
  showExceedsWarnings?: boolean;
}

const HAZARD_CLASS_ICONS: Record<string, React.ReactNode> = {
  carcinogenic: <AlertTriangle className="w-5 h-5" />,
  toxic: <AlertTriangle className="w-5 h-5" />,
  irritant: <Wind className="w-5 h-5" />,
  corrosive: <AlertTriangle className="w-5 h-5" />,
  asphyxiant: <Wind className="w-5 h-5" />,
  flammable: <AlertTriangle className="w-5 h-5" />,
};

export function CompoundSafetyGrid({
  compounds,
  className = '',
  columns = 3,
  sortBy = 'severity',
  showConcentrations = true,
  showExceedsWarnings = true,
}: CompoundSafetyGridProps) {
  
  // Sort compounds
  const sortedCompounds = React.useMemo(() => {
    const sorted = [...compounds];
    
    if (sortBy === 'severity') {
      const severityOrder = { severe: 0, high: 1, moderate: 2, low: 3 };
      sorted.sort((a, b) => {
        const aOrder = severityOrder[a.severity] ?? 3;
        const bOrder = severityOrder[b.severity] ?? 3;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.title.localeCompare(b.title);
      });
    } else if (sortBy === 'alphabetical') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    return sorted;
  }, [compounds, sortBy]);
  
  // Transform to GridItemSSR format
  const gridItems: GridItemSSR[] = sortedCompounds.map((compound) => ({
    href: compound.url,
    frontmatter: {
      title: compound.title,
      image: compound.image,
      category: compound.category,
      severity: compound.severity,
      subject: compound.hazard_class,  // Show hazard class as subject
    },
    metadata: {
      // Add concentration badge
      concentrationBadge: showConcentrations ? compound.concentration_range : null,
      
      // Add warning if exceeds limits
      exceedsWarning: showExceedsWarnings && compound.exceeds_limits,
      
      // Add monitoring indicator
      monitoringRequired: compound.monitoring_required,
      
      // Add PPE level
      ppeLevel: compound.control_measures.ppe_level,
      
      // Add exposure risk
      exposureRisk: compound.exposure_risk,
    }
  }));
  
  return (
    <>
      {/* Optional header with sort info */}
      {showExceedsWarnings && (
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-400">
            Sorted by: <span className="capitalize">{sortBy}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-yellow-400">
            <AlertTriangle className="w-4 h-4" />
            <span>⚠️ = Exceeds exposure limits</span>
          </div>
        </div>
      )}
      
      <CardGridSSR
        items={gridItems}
        columns={columns}
        variant="domain-linkage"
        showBadgeSymbols={false}
        className={className}
      />
    </>
  );
}
```

#### Step 3.2: Update SafetyDataPanel

**File**: `app/components/SafetyDataPanel/SafetyDataPanel.tsx`

```tsx
// REMOVE old import
// import { HazardousFumesTable } from '../HazardousFumesTable/HazardousFumesTable';

// ADD new imports
import { CompoundSafetyGrid } from '../CompoundSafetyGrid/CompoundSafetyGrid';
import { GridSection } from '../GridSection/GridSection';

interface SafetyDataPanelProps {
  safetyData: any;
  compounds?: any[];  // NEW: from domain_linkages.produces_compounds
  className?: string;
}

export function SafetyDataPanel({ 
  safetyData, 
  compounds = [],  // NEW
  className = '' 
}: SafetyDataPanelProps) {
  // ... existing risk cards ...
  
  // REPLACE old table with new grid wrapped in GridSection
  {compounds && compounds.length > 0 && (
    <GridSection
      title="Hazardous Compounds Generated"
      subtitle="Chemical byproducts and safety requirements"
      variant="default"
    >
      <CompoundSafetyGrid 
        compounds={compounds}
        sortBy="severity"
        showConcentrations={true}
        showExceedsWarnings={true}
        columns={3}
      />
    </GridSection>
  )}
  
  {/* OLD - Remove this block */}
  {/* <HazardousFumesTable 
    fumesGenerated={safetyData.fumes_generated}
    className="mb-8"
  /> */}
  
  // ... rest of component ...
}
```

#### Step 3.3: Update ContaminantsLayout

**File**: `app/components/ContaminantsLayout/ContaminantsLayout.tsx`

```tsx
// Update SafetyDataPanel usage - GridSection wrapper now handled internally
{metadata?.laser_properties?.safety_data && (
  <SafetyDataPanel
    safetyData={metadata.laser_properties.safety_data}
    compounds={(metadata as any).domain_linkages?.produces_compounds || []}  // ADDED
  />
)}

// Note: No more <div className="mb-16"> wrapper needed - GridSection handles spacing
```

#### Step 3.4: Normalize DomainLinkageSection (OPTIONAL)

**File**: `app/components/DomainLinkages/DomainLinkageSection.tsx`

**Before** (inconsistent pattern):
```tsx
return (
  <section className="domain-linkages">
    <h2 className="text-2xl font-bold mb-6">{title}</h2>
    <CardGridSSR items={gridItems} />
  </section>
);
```

**After** (normalized with GridSection):
```tsx
import { GridSection } from '../GridSection/GridSection';

return (
  <GridSection title={title} variant="default">
    <CardGridSSR
      items={gridItems}
      mode={mode}
      columns={columns}
      filterBy={filterBy}
      showBadgeSymbols={false}
      variant={cardVariant}
    />
  </GridSection>
);
```

**Benefits**:
- ✅ Consistent spacing across all sections
- ✅ Consistent title styling
- ✅ Consistent container/padding
- ✅ Easy to add subtitles later
- ✅ Single component to update for global style changes
```

---

### Phase 3.5: GridSection Reusability Benefits

#### Normalized Pattern

**All grids now follow this pattern**:
```tsx
<GridSection title="Section Title" subtitle="Optional subtitle">
  <AnyGrid items={data} />
</GridSection>
```

#### Usage Examples

**1. Compound Safety Grid**:
```tsx
<GridSection 
  title="Hazardous Compounds" 
  subtitle="Safety requirements"
>
  <CompoundSafetyGrid compounds={compounds} />
</GridSection>
```

**2. Domain Linkages**:
```tsx
<GridSection title="Compatible Materials">
  <CardGridSSR items={materials} variant="default" />
</GridSection>
```

**3. Custom Grids**:
```tsx
<GridSection title="Frequency-Based Materials" variant="dark">
  <FrequencyBasedMaterialGrid materials={materials} />
</GridSection>
```

#### Benefits

**For Developers**:
- ✅ **Predictable Structure**: All sections have same wrapper
- ✅ **Easy Maintenance**: Update GridSection = all sections updated
- ✅ **Type Safety**: Consistent props across all grids
- ✅ **Less Boilerplate**: No manual section/title/container setup

**For Design**:
- ✅ **Visual Consistency**: Same spacing, padding, typography
- ✅ **Easy Theming**: Single component controls all section styles
- ✅ **Responsive**: Container-custom handles breakpoints

**For Users**:
- ✅ **Predictable Layout**: Sections look and feel consistent
- ✅ **Clear Hierarchy**: Title → Subtitle → Content always same
- ✅ **Better Scanning**: Consistent spacing aids comprehension

---

### Phase 3.6: Unified Grid Architecture (ADVANCED CONSOLIDATION)

#### Problem: Multiple Grid Wrappers

Currently we have separate components:
- `CompoundSafetyGrid` - Transforms compounds → GridItemSSR
- `HazardousCompoundsGrid` - Transforms compounds → GridItemSSR (different logic)
- `DomainLinkageSection` - Transforms linkages → GridItemSSR

They all:
1. Accept domain-specific data
2. Transform to `GridItemSSR[]`
3. Pass to `CardGridSSR`

#### Solution: Universal DataGrid + Mappers

**File**: `app/components/DataGrid/DataGrid.tsx`

```tsx
/**
 * @component DataGrid
 * @purpose Universal grid that accepts any data + mapper function
 * @usage Replace all domain-specific grid components
 */
import React from 'react';
import { CardGridSSR } from '../CardGrid/CardGridSSR';
import { GridItemSSR } from '@/types';

interface DataGridProps<T> {
  data: T[];
  mapper: (item: T) => GridItemSSR;  // Transform function
  sorter?: (a: T, b: T) => number;   // Optional sort function
  columns?: 2 | 3 | 4;
  variant?: 'default' | 'domain-linkage';
  className?: string;
}

export function DataGrid<T>({
  data,
  mapper,
  sorter,
  columns = 3,
  variant = 'default',
  className = '',
}: DataGridProps<T>) {
  // Sort if sorter provided
  const sortedData = React.useMemo(() => {
    if (!sorter) return data;
    return [...data].sort(sorter);
  }, [data, sorter]);
  
  // Transform to GridItemSSR
  const gridItems = React.useMemo(() => {
    return sortedData.map(mapper);
  }, [sortedData, mapper]);
  
  return (
    <CardGridSSR
      items={gridItems}
      columns={columns}
      variant={variant}
      showBadgeSymbols={false}
      className={className}
    />
  );
}
```

**File**: `app/utils/gridMappers.ts` (NEW)

```typescript
/**
 * Mapper functions for transforming domain data to GridItemSSR
 * Centralizes all grid transformation logic
 */
import { GridItemSSR } from '@/types';
import type { EnhancedCompound, DomainLinkage } from '@/types/domain-linkages';

/**
 * Compound mapper - for produces_compounds
 */
export function compoundToGridItem(compound: EnhancedCompound): GridItemSSR {
  return {
    href: compound.url,
    frontmatter: {
      title: compound.title,
      image: compound.image,
      category: compound.category,
      severity: compound.severity,
      subject: compound.hazard_class,
    },
    metadata: {
      concentrationBadge: compound.concentration_range,
      exceedsWarning: compound.exceeds_limits,
      monitoringRequired: compound.monitoring_required,
      ppeLevel: compound.control_measures.ppe_level,
      exposureRisk: compound.exposure_risk,
    },
  };
}

/**
 * Material linkage mapper - for related_materials
 */
export function materialLinkageToGridItem(linkage: DomainLinkage): GridItemSSR {
  return {
    href: linkage.url,
    frontmatter: {
      title: linkage.title,
      image: linkage.image,
      category: linkage.category,
      severity: linkage.severity,
    },
    metadata: {
      frequency: linkage.frequency,
      typical_context: linkage.typical_context,
    },
  };
}

/**
 * Compound linkage mapper - for produces_compounds (lightweight)
 */
export function compoundLinkageToGridItem(linkage: DomainLinkage): GridItemSSR {
  return {
    href: linkage.url,
    frontmatter: {
      title: linkage.title,
      image: linkage.image,
      category: linkage.category,
      severity: linkage.severity,
      subject: linkage.severity, // Show severity as subject for domain-linkage cards
    },
    metadata: {
      frequency: linkage.frequency,
      severity: linkage.severity,
    },
  };
}
```

**File**: `app/utils/gridSorters.ts` (NEW)

```typescript
/**
 * Reusable sort functions for grids
 */
import type { EnhancedCompound, DomainLinkage } from '@/types/domain-linkages';

/**
 * Sort by severity (severe → high → moderate → low)
 */
export function sortBySeverity<T extends { severity: string; title: string }>(a: T, b: T): number {
  const severityOrder = { severe: 0, high: 1, moderate: 2, low: 3 };
  const aOrder = severityOrder[a.severity as keyof typeof severityOrder] ?? 3;
  const bOrder = severityOrder[b.severity as keyof typeof severityOrder] ?? 3;
  if (aOrder !== bOrder) return aOrder - bOrder;
  return a.title.localeCompare(b.title);
}

/**
 * Sort alphabetically by title
 */
export function sortAlphabetically<T extends { title: string }>(a: T, b: T): number {
  return a.title.localeCompare(b.title);
}

/**
 * Sort by frequency (very_common → common → occasional → rare)
 */
export function sortByFrequency<T extends { frequency: string; title: string }>(a: T, b: T): number {
  const frequencyOrder = { very_common: 0, common: 1, occasional: 2, rare: 3 };
  const aOrder = frequencyOrder[a.frequency as keyof typeof frequencyOrder] ?? 3;
  const bOrder = frequencyOrder[b.frequency as keyof typeof frequencyOrder] ?? 3;
  if (aOrder !== bOrder) return aOrder - bOrder;
  return a.title.localeCompare(b.title);
}
```

#### Usage: Replace All Grids

**Before** (3 different components):
```tsx
// Compound safety grid
<CompoundSafetyGrid 
  compounds={compounds}
  sortBy="severity"
/>

// Material linkages
<CardGridSSR items={linkagesToGridItems(materials, 'materials')} />

// Domain linkages
<DomainLinkageSection items={linkages} domain="compounds" />
```

**After** (1 universal component):
```tsx
import { DataGrid } from '@/app/components/DataGrid/DataGrid';
import { compoundToGridItem, materialLinkageToGridItem } from '@/app/utils/gridMappers';
import { sortBySeverity, sortByFrequency } from '@/app/utils/gridSorters';

// Compound safety grid
<DataGrid
  data={compounds}
  mapper={compoundToGridItem}
  sorter={sortBySeverity}
  variant="domain-linkage"
  columns={3}
/>

// Material linkages
<DataGrid
  data={materials}
  mapper={materialLinkageToGridItem}
  sorter={sortByFrequency}
  variant="default"
  columns={4}
/>

// Compound linkages
<DataGrid
  data={compounds}
  mapper={compoundLinkageToGridItem}
  sorter={sortBySeverity}
  variant="domain-linkage"
  columns={3}
/>
```

#### Benefits of Unified Architecture

**Consolidation**:
- ✅ **1 grid component** instead of 5+ wrappers
- ✅ **Mappers as pure functions** (easy to test, reuse)
- ✅ **Sorters as pure functions** (composable, reusable)
- ✅ **No duplicated transformation logic**

**Flexibility**:
- ✅ **Mix and match**: Any mapper + any sorter
- ✅ **Custom mappers**: Easy to add new data types
- ✅ **Compose mappers**: Chain transformations
- ✅ **Type-safe**: Generic `DataGrid<T>` preserves types

**Testability**:
```typescript
// Test mapper in isolation
expect(compoundToGridItem(mockCompound)).toEqual({
  href: '/compounds/...',
  frontmatter: {...},
  metadata: {...}
});

// Test sorter in isolation
expect([severe, low, high].sort(sortBySeverity)).toEqual([severe, high, low]);
```

#### Migration Path

**Phase 1**: Create `DataGrid`, mappers, sorters
**Phase 2**: Update 1-2 pages to use `DataGrid`
**Phase 3**: Verify functionality matches old grids
**Phase 4**: Migrate all remaining grids
**Phase 5**: Delete old grid wrapper components

**OR keep both** for backwards compatibility:
```tsx
// CompoundSafetyGrid becomes a thin wrapper
export function CompoundSafetyGrid({ compounds, sortBy, ...props }) {
  return (
    <DataGrid
      data={compounds}
      mapper={compoundToGridItem}
      sorter={sortBy === 'severity' ? sortBySeverity : sortAlphabetically}
      {...props}
    />
  );
}
```

---

### Phase 4: Testing & Validation (Week 2, Days 1-3)

#### Step 4.1: Unit Tests

**File**: `tests/components/CompoundSafetyGrid.test.tsx`

```tsx
import { render, screen } from '@testing-library/react';
import { CompoundSafetyGrid } from '@/app/components/CompoundSafetyGrid/CompoundSafetyGrid';

const mockCompounds = [
  {
    id: 'carbon-monoxide-compound',
    title: 'Carbon Monoxide',
    url: '/compounds/toxic-gas/asphyxiant/carbon-monoxide-compound',
    image: '/images/compounds/carbon-monoxide.jpg',
    category: 'toxic-gas',
    subcategory: 'asphyxiant',
    frequency: 'very_common',
    severity: 'high',
    typical_context: 'Incomplete combustion',
    exposure_risk: 'high',
    concentration_range: '10-50 mg/m³',
    hazard_class: 'toxic',
    exposure_limits: {
      osha_pel_mg_m3: 55,
      niosh_rel_mg_m3: 40,
      acgih_tlv_mg_m3: 29,
      idlh_mg_m3: null,
    },
    exceeds_limits: false,
    monitoring_required: true,
    control_measures: {
      ventilation_required: true,
      ppe_level: 'enhanced',
      filtration_type: 'hepa_carbon',
    },
  },
];

describe('CompoundSafetyGrid', () => {
  it('renders compounds with concentration ranges', () => {
    render(<CompoundSafetyGrid compounds={mockCompounds} />);
    expect(screen.getByText('Carbon Monoxide')).toBeInTheDocument();
    expect(screen.getByText(/10-50 mg\/m³/)).toBeInTheDocument();
  });
  
  it('sorts by severity by default', () => {
    const compounds = [
      { ...mockCompounds[0], severity: 'low', title: 'Low Risk' },
      { ...mockCompounds[0], severity: 'high', title: 'High Risk' },
      { ...mockCompounds[0], severity: 'moderate', title: 'Moderate Risk' },
    ];
    
    const { container } = render(<CompoundSafetyGrid compounds={compounds} />);
    const titles = container.querySelectorAll('.card-title');
    
    expect(titles[0]).toHaveTextContent('High Risk');
    expect(titles[1]).toHaveTextContent('Moderate Risk');
    expect(titles[2]).toHaveTextContent('Low Risk');
  });
  
  it('shows hazard class as subject', () => {
    render(<CompoundSafetyGrid compounds={mockCompounds} />);
    expect(screen.getByText('toxic')).toBeInTheDocument();
  });
});
```

#### Step 4.2: Integration Tests

**File**: `tests/integration/safety-data-migration.test.ts`

```typescript
import { loadYaml } from '@/app/utils/yaml-loader';
import path from 'path';

describe('Safety Data Migration', () => {
  const testFile = 'frontmatter/contaminants/adhesive-residue-contamination.yaml';
  
  it('should have produces_compounds with all required fields', () => {
    const data = loadYaml(testFile);
    const compounds = data.domain_linkages.produces_compounds;
    
    expect(compounds).toBeDefined();
    expect(compounds.length).toBeGreaterThan(0);
    
    compounds.forEach((compound: any) => {
      // Required fields
      expect(compound.id).toBeDefined();
      expect(compound.title).toBeDefined();
      expect(compound.url).toBeDefined();
      
      // NEW required fields
      expect(compound.concentration_range).toBeDefined();
      expect(compound.concentration_range).toMatch(/^\d+(\.\d+)?-\d+(\.\d+)? mg\/m³$/);
      
      expect(compound.hazard_class).toBeDefined();
      expect(['carcinogenic', 'toxic', 'irritant', 'corrosive', 'asphyxiant', 'flammable'])
        .toContain(compound.hazard_class);
      
      // Safety data
      expect(compound.exposure_limits).toBeDefined();
      expect(compound.control_measures).toBeDefined();
    });
  });
  
  it('should NOT have fumes_generated', () => {
    const data = loadYaml(testFile);
    const safetyData = data.laser_properties?.safety_data;
    
    expect(safetyData?.fumes_generated).toBeUndefined();
  });
});
```

#### Step 4.3: Visual Regression Tests

```bash
# Take screenshots before/after
npm run test:visual -- --update-snapshots

# Compare renders
npm run test:visual:compare
```

---

### Phase 5: Documentation Updates (Week 2, Day 4)

#### Update Documentation Files

1. **DOMAIN_LINKAGES_SAFETY_DATA_ENHANCEMENT.md**
   - Mark as "✅ IMPLEMENTED" in status section
   - Add implementation date
   - Link to this guide

2. **FRONTMATTER_CARD_GRID_PROPOSALS.md**
   - Update CompoundSafetyGrid status to "✅ LIVE"
   - Add screenshots/examples

3. **README.md** (if applicable)
   - Document new compound data structure
   - Update component usage examples

---

### Phase 6: Deployment (Week 2, Day 5)

#### Pre-Deployment Checklist

```bash
# 1. All tests passing
npm run test
npm run test:integration

# 2. Type check
npm run type-check

# 3. Build succeeds
npm run build

# 4. Visual inspection
npm run dev
# Visit http://localhost:3000/contaminants/organic-residue/adhesive/adhesive-residue-contamination

# 5. Git status clean
git status

# 6. Create deployment branch
git checkout -b feat/compound-data-migration
git add .
git commit -m "feat: migrate compound data to unified structure

- Add concentration_range and hazard_class to produces_compounds
- Remove legacy fumes_generated data
- Create CompoundSafetyGrid component
- Update SafetyDataPanel to use domain_linkages

Closes #XXX"

# 7. Push and create PR
git push origin feat/compound-data-migration
```

---

## Rollback Procedure

If issues discovered post-deployment:

### Option 1: Revert Commit
```bash
git revert <commit-hash>
git push origin main
```

### Option 2: Restore from Backup
```bash
# Restore frontmatter files from pre-migration backup
cp -r frontmatter-backup/contaminants/* frontmatter/contaminants/

# Revert component changes
git checkout main~1 -- app/components/SafetyDataPanel/
git checkout main~1 -- app/components/HazardousFumesTable/
```

### Option 3: Keep New, Restore Old (Dual Support)
```tsx
// Temporarily support both structures
{compounds && compounds.length > 0 ? (
  <CompoundSafetyGrid compounds={compounds} />
) : safetyData?.fumes_generated ? (
  <HazardousFumesTable fumesGenerated={safetyData.fumes_generated} />
) : null}
```

---

## Success Criteria

### Must Pass

- ✅ All contaminant pages render without errors
- ✅ CompoundSafetyGrid displays concentration ranges
- ✅ Hazard class badges visible and correct colors
- ✅ No `fumes_generated` references in YAML files
- ✅ All unit tests passing (100%)
- ✅ All integration tests passing (100%)
- ✅ TypeScript compilation clean (0 errors)
- ✅ Build succeeds without warnings

### Should Pass

- ✅ Visual regression tests match expectations
- ✅ Performance metrics unchanged (<5% deviation)
- ✅ Lighthouse score >= 95
- ✅ No console errors in browser
- ✅ Mobile responsive layout correct

---

## Monitoring Post-Deployment

### Week 1 After Deploy

- Monitor error logs for compound-related issues
- Check user analytics for contamination page bounces
- Verify search indexing picks up new hazard_class data
- Review Sentry for any component errors

### Week 2 After Deploy

- Gather user feedback on new compound display
- Analyze time-on-page metrics for safety sections
- Consider A/B testing different grid layouts
- Plan Phase 2 enhancements (if needed)

---

## Future Enhancements (Post-Migration)

Once Solution A is stable, consider:

1. **Compound Detail Pages**: Create dedicated pages for each compound
2. **Hazard Class Filtering**: Filter compounds by hazard_class on category pages
3. **Concentration Visualization**: Charts showing concentration ranges
4. **Exposure Duration Calculator**: Interactive tool for time-weighted averages
5. **PPE Recommendation Engine**: Automated PPE selection based on compounds

---

## Appendix A: Field Mapping Reference

| Field | fumes_generated | produces_compounds | Notes |
|-------|----------------|-------------------|-------|
| **Name** | `compound` (string) | `title` (string) | Different field names |
| **Concentration** | `concentration_mg_m3` (string) | `concentration_range` (string) | ✅ Migrated |
| **Hazard** | `hazard_class` (string) | `hazard_class` (string) | ✅ Migrated |
| **OSHA** | ❌ Missing | `exposure_limits.osha_pel_mg_m3` | Already in produces |
| **NIOSH** | ❌ Missing | `exposure_limits.niosh_rel_mg_m3` | Already in produces |
| **ACGIH** | `exposure_limit_mg_m3` | `exposure_limits.acgih_tlv_mg_m3` | Renamed |
| **ID** | ❌ Missing | `id` (slug format) | Already in produces |
| **URL** | ❌ Missing | `url` (full path) | Already in produces |
| **PPE** | ❌ Missing | `control_measures.ppe_level` | Already in produces |

---

## Appendix B: Example Before/After

### Before Migration
```yaml
domain_linkages:
  produces_compounds:
    - id: carbon-monoxide-compound
      title: Carbon Monoxide
      # ... other fields ...
      # ❌ Missing concentration_range
      # ❌ Missing hazard_class

laser_properties:
  safety_data:
    fumes_generated:
      - compound: Carbon Monoxide
        concentration_mg_m3: 10-50
        exposure_limit_mg_m3: 29
        hazard_class: toxic
```

### After Migration
```yaml
domain_linkages:
  produces_compounds:
    - id: carbon-monoxide-compound
      title: Carbon Monoxide
      # ... other fields ...
      concentration_range: "10-50 mg/m³"  # ✅ ADDED
      hazard_class: toxic                 # ✅ ADDED

# laser_properties.safety_data.fumes_generated REMOVED ✅
```

---

**End of Implementation Guide**
