# Frontmatter Card Grid & Content Section Proposals
**Date**: December 17, 2025  
**Purpose**: Evaluate enhanced frontmatter structure and propose new card grids and content sections

---

## Current Frontmatter Structure Analysis

### Enhanced Domain Linkages (NEW)

The frontmatter now includes **rich domain_linkages data** with safety metadata:

```yaml
domain_linkages:
  related_materials: [...]
  produces_compounds:  # NEW enhanced structure
    - id: carbon-monoxide-compound
      title: Carbon Monoxide
      url: /compounds/toxic-gas/asphyxiant/carbon-monoxide-compound
      image: /images/compounds/carbon-monoxide.jpg
      category: toxic-gas
      subcategory: asphyxiant
      frequency: very_common        # NEW
      severity: high                # NEW
      typical_context: "..."        # NEW
      exposure_risk: high           # NEW
      exposure_limits:              # NEW
        osha_pel_mg_m3: 55
        niosh_rel_mg_m3: 40
        acgih_tlv_mg_m3: 29
        idlh_mg_m3: null
      exceeds_limits: false         # NEW
      monitoring_required: false    # NEW
      control_measures:             # NEW
        ventilation_required: false
        ppe_level: none
        filtration_type: null
```

**Key Features**:
- ✅ Complete compound metadata in domain_linkages (no need for separate fumes_generated)
- ✅ Exposure limits (OSHA, NIOSH, ACGIH, IDLH)
- ✅ Safety indicators (severity, exposure_risk, exceeds_limits)
- ✅ Control measures (ventilation, PPE, filtration)
- ✅ Contextual information (frequency, typical_context)

---

## Proposed New Card Grids

### 1. **CompoundSafetyGrid** (Contamination Pages) 🔥 **NEW**

**Purpose**: Display hazardous compounds with prominent safety indicators  
**Location**: Contamination pages only (compounds produced during laser removal)  
**Data Source**: `domain_linkages.produces_compounds`

**Features**:
- ✅ Severity-based sorting (severe → high → moderate → low)
- ✅ Color-coded severity badges (red=severe/high, yellow=moderate, green=low)
- ✅ Exposure limit badges (concentration ranges)
- ✅ Warning indicators (⚠️ exceeds limits, 🔬 monitoring required)
- ✅ PPE requirement icons (respirator level, eye protection)
- ✅ Quick stats: exposure_risk, frequency, control_measures
- ✅ Clickable cards linking to compound detail pages

**Layout**:
```tsx
<CompoundSafetyGrid
  compounds={frontmatter.domain_linkages.produces_compounds}
  sortBy="severity"              // Default: most dangerous first
  showExposureLimits={true}      // Show OSHA/NIOSH/ACGIH badges
  showControlMeasures={true}     // Show ventilation/PPE icons
  columns={3}                     // Adaptive: 2-4 columns
  variant="domain-linkage"        // Colored borders, no images
/>
```

**Card Design**:
```
┌─────────────────────────────────────┐
│ 🔴 SEVERE                           │ ← Colored header
│ Carbon Monoxide                      │
│                                      │
│ 📊 Exposure: HIGH                   │
│ 🔬 Monitoring: Required             │
│ ⚠️  OSHA PEL: 55 mg/m³              │
│                                      │
│ 🛡️ N95 + Ventilation               │ ← Control measures
│ 📈 Very Common (95%)                │ ← Frequency
└─────────────────────────────────────┘
```

---

### 2. **FrequencyBasedMaterialGrid** (Contamination Pages)

**Purpose**: Show compatible materials grouped by contamination frequency  
**Location**: Contamination pages  
**Data Source**: `domain_linkages.related_materials`

**Features**:
- ✅ Grouped by frequency: Very Common → Common → Occasional → Rare
- ✅ Frequency badges (95%, 70%, 40%, 10%)
- ✅ Severity indicators per material
- ✅ Typical context tooltips (hover to see "general", "industrial", "marine")
- ✅ Collapsible groups (expand/collapse by frequency)

**Layout**:
```tsx
<FrequencyBasedMaterialGrid
  materials={frontmatter.domain_linkages.related_materials}
  groupBy="frequency"
  showSeverity={true}
  showContext={true}
  collapsible={true}
/>
```

**Visual Structure**:
```
Very Common (95%+) [Expand/Collapse]
┌─────────┐ ┌─────────┐ ┌─────────┐
│ Steel   │ │Aluminum │ │ Glass   │
│ 🟡 Mod  │ │ 🟡 Mod  │ │ 🟢 Low  │
└─────────┘ └─────────┘ └─────────┘

Common (60-95%) [Expand/Collapse]
┌─────────┐ ┌─────────┐
│ Copper  │ │ Brass   │
│ 🟡 Mod  │ │ 🟢 Low  │
└─────────┘ └─────────┘
```

---

### 3. **RiskComparisonGrid** (Cross-Material/Contaminant Comparison)

**Purpose**: Compare safety risks across multiple entities  
**Location**: Category pages, comparison pages  
**Data Source**: Multiple frontmatter files aggregated

**Features**:
- ✅ Side-by-side risk comparison (fire, toxic gas, visibility)
- ✅ Sortable by any risk dimension
- ✅ Color-coded heatmap cells
- ✅ Quick visual scanning of high-risk combinations
- ✅ Filter by risk level (high only, moderate+, all)

**Layout**:
```tsx
<RiskComparisonGrid
  items={[contaminant1, contaminant2, contaminant3]}
  risks={['fire_explosion_risk', 'toxic_gas_risk', 'visibility_hazard']}
  sortBy="toxic_gas_risk"
  filterLevel="high"
/>
```

**Visual Structure**:
```
Material      | Fire    | Toxic Gas | Visibility
─────────────────────────────────────────────────
Rust          | 🔴 High | 🟢 Low    | 🟡 Moderate
Paint         | 🔴 High | 🔴 High   | 🟡 Moderate
Adhesive      | 🟢 Low  | 🟡 Mod    | 🟢 Low
```

---

### 4. **PPERequirementGrid** (Safety Reference Pages)

**Purpose**: Show required PPE across different contaminants/operations  
**Location**: Safety guides, PPE selection pages  
**Data Source**: `safety_data.ppe_requirements` + `domain_linkages.produces_compounds.control_measures`

**Features**:
- ✅ Grouped by PPE level (None → Basic → Enhanced → Full)
- ✅ Visual PPE icons (respirator, goggles, gloves, suit)
- ✅ Associated contaminants for each level
- ✅ Quick reference for operators
- ✅ Filterable by operation type

**Layout**:
```tsx
<PPERequirementGrid
  contaminants={allContaminants}
  groupBy="ppe_level"
  showIcons={true}
  showMaterials={true}
/>
```

**Visual Structure**:
```
Full PPE Required (N95 + Full Coverage)
┌───────────────────────┐
│ 😷🥽🧤 Lead Paint     │
│ Used with: Steel, Iron│
│ Compounds: 5 toxic    │
└───────────────────────┘

Enhanced PPE (N95 + Goggles)
┌───────────────────────┐
│ 😷🥽 Rust             │
│ Used with: 15 metals  │
│ Compounds: 3 irritant │
└───────────────────────┘
```

---

### 5. **ExposureLimitGrid** (Technical Reference)

**Purpose**: Display compounds with their exposure limits in table/grid format  
**Location**: Technical reference pages, safety manuals  
**Data Source**: `domain_linkages.produces_compounds.exposure_limits`

**Features**:
- ✅ Sortable by any limit (OSHA, NIOSH, ACGIH, IDLH)
- ✅ Color-coded cells (exceeds=red, safe=green)
- ✅ Unit display (mg/m³, ppm)
- ✅ Comparison to actual concentrations
- ✅ Monitoring requirement indicators
- ✅ Export to PDF for safety documentation

**Layout**:
```tsx
<ExposureLimitGrid
  compounds={frontmatter.domain_linkages.produces_compounds}
  showOSHA={true}
  showNIOSH={true}
  showACGIH={true}
  showIDLH={true}
  highlightExceeds={true}
  sortBy="osha_pel_mg_m3"
/>
```

---

## Proposed New Content Sections

### 1. **Compound Safety Matrix** (Contamination Pages) 🔥 **HIGH PRIORITY**

**Purpose**: Comprehensive safety overview of all compounds produced  
**Location**: After SafetyDataPanel, before Domain Linkages  
**Replaces**: HazardousFumesTable (legacy fumes_generated)

**Structure**:
```tsx
<section className="compound-safety-matrix mb-16">
  <SectionTitle 
    title="Hazardous Compounds Generated"
    subtitle="Chemical byproducts and safety requirements"
  />
  
  {/* Summary Cards */}
  <div className="grid grid-cols-3 gap-4 mb-8">
    <div className="stat-card">
      <div className="stat-label">High Severity</div>
      <div className="stat-value text-red-400">3</div>
    </div>
    <div className="stat-card">
      <div className="stat-label">Monitoring Required</div>
      <div className="stat-value text-yellow-400">2</div>
    </div>
    <div className="stat-card">
      <div className="stat-label">Ventilation Required</div>
      <div className="stat-value text-blue-400">4</div>
    </div>
  </div>
  
  {/* Compound Grid */}
  <CompoundSafetyGrid 
    compounds={frontmatter.domain_linkages.produces_compounds}
    sortBy="severity"
    showExposureLimits={true}
    showControlMeasures={true}
  />
  
  {/* Detailed Exposure Limits Table */}
  <ExposureLimitGrid 
    compounds={frontmatter.domain_linkages.produces_compounds}
    compact={false}
  />
</section>
```

**Benefits**:
- ✅ Unifies compound safety data (replaces fragmented fumes_generated table)
- ✅ Visual hierarchy (cards → grid → detailed table)
- ✅ Actionable (shows what PPE/ventilation needed)
- ✅ Compliant (shows OSHA/NIOSH standards)

---

### 2. **Material Compatibility Matrix** (Material Pages)

**Purpose**: Show which contaminants are common/problematic for this material  
**Location**: Material pages, after LaserMaterialInteraction  
**Data Source**: `domain_linkages.related_contaminants`

**Structure**:
```tsx
<section className="material-compatibility-matrix mb-16">
  <SectionTitle 
    title="Common Contaminants"
    subtitle="Frequently encountered contamination on {material_name}"
  />
  
  <FrequencyBasedGrid
    contaminants={frontmatter.domain_linkages.related_contaminants}
    groupBy="frequency"
    showSeverity={true}
    showRemovalDifficulty={true}
  />
</section>
```

---

### 3. **Ventilation & Control Measures Section** (Contamination Pages)

**Purpose**: Actionable safety requirements at-a-glance  
**Location**: After Compound Safety Matrix, before Domain Linkages  
**Data Source**: `domain_linkages.produces_compounds.control_measures`

**Structure**:
```tsx
<section className="control-measures-section mb-16">
  <SectionTitle 
    title="Required Control Measures"
    subtitle="Ventilation, filtration, and protective equipment"
  />
  
  <div className="grid grid-cols-2 gap-8">
    {/* Ventilation Requirements */}
    <div className="control-card">
      <h3>Ventilation System</h3>
      <ul>
        <li>✅ Minimum Air Changes: 12/hour</li>
        <li>✅ Exhaust Velocity: 0.5 m/s</li>
        <li>✅ Filtration: HEPA + Carbon</li>
      </ul>
    </div>
    
    {/* PPE Requirements */}
    <div className="control-card">
      <h3>Personal Protective Equipment</h3>
      <ul>
        <li>😷 Respiratory: N95 minimum</li>
        <li>🥽 Eye: Safety goggles + face shield</li>
        <li>🧤 Skin: Chemical-resistant gloves</li>
      </ul>
    </div>
  </div>
  
  {/* Compound-Specific Requirements */}
  <div className="compound-specific-requirements mt-8">
    <h3>Compound-Specific Safety Measures</h3>
    {compounds.map(compound => (
      <div key={compound.id} className="requirement-row">
        <div className="compound-name">{compound.title}</div>
        <div className="measures">
          {compound.control_measures.ventilation_required && <Badge>Ventilation Required</Badge>}
          {compound.control_measures.ppe_level && <Badge>{compound.control_measures.ppe_level}</Badge>}
          {compound.monitoring_required && <Badge>Continuous Monitoring</Badge>}
        </div>
      </div>
    ))}
  </div>
</section>
```

---

### 4. **Exposure Limit Reference Table** (Technical Pages)

**Purpose**: Detailed regulatory compliance table  
**Location**: Technical reference pages, safety manuals  
**Data Source**: `domain_linkages.produces_compounds.exposure_limits`

**Structure**:
```tsx
<section className="exposure-limits-reference mb-16">
  <SectionTitle 
    title="Regulatory Exposure Limits"
    subtitle="OSHA, NIOSH, ACGIH standards for produced compounds"
  />
  
  <ExposureLimitGrid 
    compounds={frontmatter.domain_linkages.produces_compounds}
    showOSHA={true}
    showNIOSH={true}
    showACGIH={true}
    showIDLH={true}
    highlightExceeds={true}
    exportable={true}  // PDF export for documentation
  />
  
  <div className="compliance-notes mt-4">
    <p className="text-sm text-gray-400">
      * Values in mg/m³ unless otherwise noted<br />
      ** Red cells indicate concentrations exceeding limits<br />
      *** IDLH = Immediately Dangerous to Life or Health
    </p>
  </div>
</section>
```

---

### 5. **Risk Timeline / Exposure Duration Section** (Advanced)

**Purpose**: Show how risk changes with exposure duration  
**Location**: Safety analysis pages  
**Data Source**: Calculated from exposure_limits + frequency

**Structure**:
```tsx
<section className="risk-timeline mb-16">
  <SectionTitle 
    title="Exposure Duration Risk"
    subtitle="How risk escalates over time"
  />
  
  <div className="timeline-grid">
    {/* 15 minutes */}
    <div className="timeline-segment">
      <div className="duration">15 min</div>
      <div className="risk-level low">✅ Safe (all compounds)</div>
    </div>
    
    {/* 1 hour */}
    <div className="timeline-segment">
      <div className="duration">1 hour</div>
      <div className="risk-level moderate">⚠️  Monitor CO levels</div>
    </div>
    
    {/* 4 hours */}
    <div className="timeline-segment">
      <div className="duration">4 hours</div>
      <div className="risk-level high">🔴 Enhanced ventilation required</div>
    </div>
    
    {/* 8 hours (work shift) */}
    <div className="timeline-segment">
      <div className="duration">8 hours</div>
      <div className="risk-level severe">🚨 Exceeds TWA limits (3 compounds)</div>
    </div>
  </div>
</section>
```

---

## Implementation Priority

### Phase 1 (Immediate - Week 1) 🔥
1. **CompoundSafetyGrid** - Replace HazardousFumesTable
2. **Compound Safety Matrix Section** - Add to ContaminantsLayout
3. Update SafetyDataPanel to use enhanced domain_linkages data

### Phase 2 (Week 2-3)
4. **FrequencyBasedMaterialGrid** - Add to contamination pages
5. **Ventilation & Control Measures Section** - Add to contamination pages
6. **ExposureLimitGrid** - Create reusable component

### Phase 3 (Week 4+)
7. **RiskComparisonGrid** - Category/comparison pages
8. **PPERequirementGrid** - Safety reference pages
9. **Risk Timeline Section** - Advanced safety pages

---

## Data Migration Notes

### Current State
- ✅ `domain_linkages.produces_compounds` has full enhanced structure
- ⚠️ `safety_data.fumes_generated` is legacy (can be deprecated)
- ⚠️ Some components still use fumes_generated (SafetyDataPanel)

### Migration Steps
1. ✅ Update SafetyDataPanel to read from `domain_linkages.produces_compounds` (not `safety_data.fumes_generated`)
2. ✅ Create CompoundSafetyGrid component
3. ✅ Replace HazardousFumesTable usage with CompoundSafetyGrid
4. ✅ Test with adhesive-residue-contamination.yaml (has full data)
5. ⚠️ After validation: Remove `safety_data.fumes_generated` from frontmatter generator
6. ⚠️ Update all other components using legacy fumes_generated

---

## Benefits of Proposed Changes

### User Experience
- ✅ **Clearer Safety Information**: Visual indicators (colors, icons) instead of dense tables
- ✅ **Actionable Guidance**: Shows what PPE/ventilation needed, not just compound names
- ✅ **Risk Prioritization**: Severity-based sorting shows most dangerous first
- ✅ **Compliance Ready**: OSHA/NIOSH/ACGIH data prominently displayed

### Developer Experience
- ✅ **Unified Data Source**: All compound data in domain_linkages (no duplication)
- ✅ **Reusable Components**: CompoundSafetyGrid works across pages
- ✅ **Type Safety**: Enhanced TypeScript interfaces for safety data
- ✅ **Easy Testing**: Mock data with full structure

### Business Value
- ✅ **Regulatory Compliance**: Shows adherence to OSHA/NIOSH standards
- ✅ **User Safety**: Prominent safety warnings reduce liability
- ✅ **Professional Appearance**: Polished safety documentation builds trust
- ✅ **SEO**: Rich safety content improves search rankings

---

## Next Steps

1. **Approve Proposals**: Review and select which grids/sections to implement
2. **Create Component Stubs**: Build CompoundSafetyGrid, ExposureLimitGrid skeleton
3. **Update Types**: Add TypeScript interfaces for enhanced compound data
4. **Migrate SafetyDataPanel**: Switch from fumes_generated to produces_compounds
5. **Test with Real Data**: Use adhesive-residue-contamination.yaml for validation
6. **Deploy Phase 1**: Replace HazardousFumesTable with CompoundSafetyGrid
7. **Monitor & Iterate**: Gather user feedback, refine designs

---

**End of Proposal Document**
