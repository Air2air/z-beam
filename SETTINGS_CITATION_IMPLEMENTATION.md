# Settings Components Citation Implementation
**Date:** November 12, 2025  
**Context:** Integrating research citations into settings page components

---

## Overview

Each settings component should display relevant citations in context, allowing users to:
1. **See evidence** for parameter recommendations
2. **Trust the data** through academic/industry validation
3. **Explore sources** via expandable citation details
4. **Understand confidence** through visual indicators

---

## Citation Display Patterns

### Pattern 1: Inline Citation Links
**When to use:** Multiple citations supporting a specific claim  
**Format:** `[Zhang2021, Kumar2022]` → clickable links that scroll to research library

### Pattern 2: Hover Tooltips
**When to use:** Quick reference without disrupting reading flow  
**Format:** Superscript number with tooltip showing key finding

### Pattern 3: Expandable Citation Cards
**When to use:** Detailed citation information in context  
**Format:** Collapsible card with full citation metadata

### Pattern 4: Confidence Indicators
**When to use:** Show validation strength visually  
**Format:** Color-coded badges (95%+ green, 85-94% yellow, <85% orange)

---

## Component-Specific Implementation

### 1. ParameterRelationships Component

**Current State:**
- Displays 9 essential parameters in interactive network
- Shows value, unit, criticality, rationale
- Material interaction details

**Citation Integration:**

#### A. Parameter Card Citation Footer
```typescript
interface ParameterWithCitations {
  id: string;
  name: string;
  value: number;
  unit: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  rationale: string;
  material_interaction: MaterialInteraction;
  research: string[];  // Citation IDs
  confidence?: number;  // Optional confidence score
}
```

**Visual Design:**
```
┌─────────────────────────────────────────────┐
│ Power Range                    [Critical]    │
│ 100 W (optimal: 80-120 W)                   │
│                                              │
│ Rationale:                                   │
│ Aluminum's high thermal conductivity        │
│ requires precise power control...           │
│                                              │
│ Material Interaction:                        │
│ • Mechanism: Photothermal ablation          │
│ • Dominant Factor: Thermal diffusion        │
│                                              │
│ ┌──────────────────────────────────────┐   │
│ │ 📚 Research Evidence           [96%] │   │
│ │ • Zhang et al. 2021 - "Power range   │   │
│ │   80-120W optimal for 6061-T6"       │   │
│ │ • Kumar & Lee 2022 - "Damage         │   │
│ │   threshold 1.5 MW/cm²"              │   │
│ │                                       │   │
│ │ [View Full Citations ↓]              │   │
│ └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Implementation:**
```tsx
export function ParameterRelationships({ parameters, materialName, researchLibrary }) {
  return (
    <div className="parameter-network">
      {parameters.map((param) => (
        <ParameterCard key={param.id} parameter={param}>
          {/* Existing parameter content */}
          
          {/* NEW: Citation Footer */}
          {param.research && param.research.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  📚 Research Evidence
                </h4>
                {param.confidence && (
                  <ConfidenceBadge score={param.confidence} />
                )}
              </div>
              
              <div className="space-y-2">
                {param.research.slice(0, 2).map((citationId) => {
                  const citation = researchLibrary[citationId];
                  return (
                    <CitationPreview 
                      key={citationId}
                      citation={citation}
                      citationId={citationId}
                    />
                  );
                })}
              </div>
              
              {param.research.length > 2 && (
                <button 
                  onClick={() => scrollToResearchLibrary(param.research[0])}
                  className="text-blue-400 text-sm mt-2 hover:underline"
                >
                  View all {param.research.length} citations ↓
                </button>
              )}
            </div>
          )}
        </ParameterCard>
      ))}
    </div>
  );
}

// Citation Preview Component
function CitationPreview({ citation, citationId }) {
  return (
    <div className="text-xs bg-gray-800 rounded p-2">
      <div className="flex items-start gap-2">
        <span className="text-blue-400 font-mono">[{citationId}]</span>
        <div>
          <p className="text-gray-300">
            <span className="font-semibold">{citation.author}</span> ({citation.year})
          </p>
          <p className="text-gray-400 italic mt-1">
            "{citation.key_finding}"
          </p>
        </div>
      </div>
    </div>
  );
}

// Confidence Badge Component
function ConfidenceBadge({ score }: { score: number }) {
  const color = score >= 95 ? 'green' : score >= 85 ? 'yellow' : 'orange';
  const bgColor = {
    green: 'bg-green-900/30 border-green-500',
    yellow: 'bg-yellow-900/30 border-yellow-500',
    orange: 'bg-orange-900/30 border-orange-500',
  }[color];
  
  return (
    <span className={`px-2 py-1 rounded-full border text-xs font-semibold ${bgColor}`}>
      {score}% Confidence
    </span>
  );
}
```

**Benefits:**
- ✅ Citations visible in context with parameter
- ✅ Key findings shown inline
- ✅ Confidence score indicates validation strength
- ✅ Link to full research library for deep dive

---

### 2. MaterialSafetyHeatmap & ProcessEffectivenessHeatmap

**Current State:**
- Interactive 2D heatmap showing safe/unsafe parameter combinations
- Power range (X-axis) vs Pulse width (Y-axis)
- Color-coded zones (green=safe, yellow=caution, red=danger)

**Citation Integration:**

#### A. Heatmap Legend with Citation References
```
┌────────────────────────────────────────────────────────┐
│  Material Safety Heatmap                               │
│                                                        │
│  [Interactive Heatmap Grid]                           │
│                                                        │
│  ┌─────────────── Legend ───────────────┐            │
│  │ 🟢 Safe Zone (optimal parameters)     │            │
│  │    Evidence: [Zhang2021] 45 specimens │            │
│  │    Confidence: 96%                     │            │
│  │                                        │            │
│  │ 🟡 Caution Zone (edge of safe range)  │            │
│  │    Evidence: [Kumar2022] FEM modeling │            │
│  │    Confidence: 94%                     │            │
│  │                                        │            │
│  │ 🔴 Danger Zone (damage threshold)     │            │
│  │    Evidence: [Veiko2022] Threshold    │            │
│  │    Confidence: 98%                     │            │
│  └────────────────────────────────────────┘            │
│                                                        │
│  📊 Based on 3 peer-reviewed studies                  │
│  [View Research Details ↓]                            │
└────────────────────────────────────────────────────────┘
```

**Implementation:**
```tsx
export function MaterialSafetyHeatmap({ 
  materialName, 
  powerRange, 
  pulseRange, 
  optimalPower, 
  optimalPulse,
  materialProperties,
  researchLibrary 
}) {
  // Determine which citations validate the heatmap zones
  const safetyCitations = [
    'Zhang2021',  // Experimental validation
    'Kumar2022',  // Theoretical modeling
    'Veiko2022'   // Damage threshold studies
  ];
  
  return (
    <section className="heatmap-section">
      <h2>Material Safety Heatmap</h2>
      
      {/* Existing heatmap visualization */}
      <HeatmapGrid {...props} />
      
      {/* NEW: Citation-Enhanced Legend */}
      <div className="mt-6 bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>Legend</span>
          <InfoIcon tooltip="Color zones based on experimental and theoretical validation" />
        </h3>
        
        <div className="space-y-4">
          <LegendItem
            color="green"
            label="Safe Zone (optimal parameters)"
            citations={researchLibrary}
            citationIds={['Zhang2021']}
            description="Experimentally validated safe operating range"
          />
          
          <LegendItem
            color="yellow"
            label="Caution Zone (edge of safe range)"
            citations={researchLibrary}
            citationIds={['Kumar2022']}
            description="Theoretical safety margin based on FEM modeling"
          />
          
          <LegendItem
            color="red"
            label="Danger Zone (damage threshold exceeded)"
            citations={researchLibrary}
            citationIds={['Veiko2022']}
            description="Damage threshold identified through ablation studies"
          />
        </div>
        
        {/* Research Summary */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-400">
            📊 Based on {safetyCitations.length} peer-reviewed studies
          </p>
          <button 
            onClick={() => scrollToResearchLibrary(safetyCitations[0])}
            className="text-blue-400 text-sm mt-2 hover:underline"
          >
            View research details ↓
          </button>
        </div>
      </div>
    </section>
  );
}

// Legend Item with Citation
function LegendItem({ color, label, citations, citationIds, description }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="legend-item">
      <div 
        className="flex items-start gap-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`w-6 h-6 rounded ${colorMap[color]} flex-shrink-0`} />
        <div className="flex-1">
          <p className="font-semibold text-white">{label}</p>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
        <ChevronIcon expanded={expanded} />
      </div>
      
      {expanded && (
        <div className="ml-9 mt-2 space-y-2">
          {citationIds.map((citationId) => {
            const citation = citations[citationId];
            return (
              <div key={citationId} className="bg-gray-900 rounded p-3 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-blue-400">[{citationId}]</span>
                  <ConfidenceBadge score={citation.key_findings?.[0]?.confidence || 95} />
                </div>
                <p className="text-gray-300">
                  {citation.author} ({citation.year}) - {citation.title}
                </p>
                <p className="text-gray-400 italic mt-1">
                  "{citation.key_findings?.[0]?.finding}"
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

**Benefits:**
- ✅ Citations directly tied to visual zones
- ✅ Expandable details without cluttering interface
- ✅ Clear validation source for each safety determination
- ✅ Confidence scores for each zone

---

### 3. ThermalAccumulation Component

**Current State:**
- Simulates heat buildup over multiple passes
- Interactive sliders for power, rep rate, scan speed, pass count
- Real-time temperature visualization

**Citation Integration:**

#### A. Model Validation Notice
```
┌──────────────────────────────────────────────────────┐
│  Thermal Accumulation Simulator                      │
│                                                      │
│  [Interactive Controls]                              │
│  Power: [====80====] 100W                           │
│  Rep Rate: [===30===] kHz                           │
│  Scan Speed: [=1000==] mm/s                         │
│  Pass Count: [==2===]                               │
│                                                      │
│  [Temperature Graph Visualization]                   │
│                                                      │
│  ⚠️  Model Validation:                               │
│  ┌────────────────────────────────────────────┐     │
│  │ Thermal model validated against:            │     │
│  │ • [Oltra2021] - Repetitive pulse modeling  │     │
│  │ • [Zhang2021] - Experimental measurements   │     │
│  │                                             │     │
│  │ Accuracy: ±8% vs experimental data          │     │
│  │ Confidence: 94%                             │     │
│  │                                             │     │
│  │ ℹ️  Simulation assumes:                      │     │
│  │ • Thermal conductivity: 167 W/(m·K)         │     │
│  │   Source: [ASTM_C615_2023]                  │     │
│  │ • Heat capacity: 896 J/(kg·K)               │     │
│  │   Source: [Schon2015]                       │     │
│  └────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────┘
```

**Implementation:**
```tsx
export function ThermalAccumulation({ 
  power, 
  repRate, 
  scanSpeed, 
  passCount,
  materialProperties,
  researchLibrary 
}) {
  // Model parameters with citations
  const modelValidation = {
    citations: ['Oltra2021', 'Zhang2021'],
    accuracy: '±8%',
    confidence: 94,
    assumptions: [
      {
        property: 'Thermal conductivity',
        value: materialProperties?.thermalConductivity,
        citation: 'ASTM_C615_2023'
      },
      {
        property: 'Heat capacity',
        value: materialProperties?.heatCapacity,
        citation: 'Schon2015'
      }
    ]
  };
  
  return (
    <section className="thermal-simulator">
      <h2>Thermal Accumulation Simulator</h2>
      
      {/* Interactive controls */}
      <div className="controls">
        {/* ... sliders ... */}
      </div>
      
      {/* Temperature visualization */}
      <div className="temperature-graph">
        {/* ... graph ... */}
      </div>
      
      {/* NEW: Model Validation Notice */}
      <div className="mt-6 bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-200 mb-2">
              Model Validation
            </h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-300 mb-1">Thermal model validated against:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-400">
                  {modelValidation.citations.map((citationId) => {
                    const citation = researchLibrary[citationId];
                    return (
                      <li key={citationId}>
                        <span className="font-mono text-blue-400">[{citationId}]</span>
                        {' '}{citation?.title?.split(':')[0] || 'Research study'}
                      </li>
                    );
                  })}
                </ul>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-gray-300">
                  Accuracy: <strong>{modelValidation.accuracy}</strong> vs experimental
                </span>
                <ConfidenceBadge score={modelValidation.confidence} />
              </div>
              
              <details className="mt-3">
                <summary className="cursor-pointer text-gray-300 hover:text-white">
                  ℹ️ Simulation assumptions
                </summary>
                <div className="mt-2 ml-6 space-y-2">
                  {modelValidation.assumptions.map((assumption, i) => (
                    <div key={i} className="text-xs bg-gray-800 rounded p-2">
                      <p className="text-gray-300">
                        <strong>{assumption.property}:</strong> {assumption.value}
                      </p>
                      <p className="text-gray-400">
                        Source: <span className="font-mono text-blue-400">[{assumption.citation}]</span>
                      </p>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Benefits:**
- ✅ Clear disclosure of model validation
- ✅ Citations for simulation assumptions
- ✅ Accuracy metrics build trust
- ✅ Expandable details for deeper understanding

---

### 4. DiagnosticCenter Component (Tabbed Interface)

**Current State:**
- Three tabs: Prevention First, Fix Issues, Quick Reference
- Material challenges by category
- Troubleshooting guide with symptoms/solutions

**Citation Integration:**

#### A. Challenge Cards with Research Support
```
┌────────────────────────────────────────────────────┐
│ Prevention First │ Fix Issues │ Quick Reference   │
│══════════════════════════════════════════════════│
│                                                    │
│  Surface Characteristics                           │
│                                                    │
│  🔴 Native oxide layer regeneration                │
│  ┌────────────────────────────────────────────┐   │
│  │ Severity: High                              │   │
│  │                                             │   │
│  │ Impact:                                     │   │
│  │ Al₂O₃ forms within seconds after cleaning, │   │
│  │ affecting bonding and coating adhesion      │   │
│  │                                             │   │
│  │ Solutions:                                  │   │
│  │ • Inert atmosphere (Argon, <100ppm O₂)     │   │
│  │ • Apply coating within 5 minutes           │   │
│  │                                             │   │
│  │ Prevention:                                 │   │
│  │ Store in controlled atmosphere              │   │
│  │                                             │   │
│  │ 📚 Research Support:                        │   │
│  │ • [Martinez2023] - Oxide formation kinetics│   │
│  │   "Native oxide forms in 2-5 seconds"      │   │
│  │   Confidence: 97%                           │   │
│  │                                             │   │
│  │ [View Full Citation ↓]                      │   │
│  └────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────┘
```

**Implementation:**
```tsx
export function DiagnosticCenter({ materialName, challenges, issues, researchLibrary }) {
  const [activeTab, setActiveTab] = useState('prevention');
  
  return (
    <section className="diagnostic-center">
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {activeTab === 'prevention' && (
        <PreventionTab 
          challenges={challenges} 
          researchLibrary={researchLibrary}  // Pass library
        />
      )}
      
      {activeTab === 'troubleshooting' && (
        <TroubleshootingTab 
          issues={issues}
          researchLibrary={researchLibrary}  // Pass library
        />
      )}
      
      {activeTab === 'quick-reference' && (
        <QuickReferenceTab 
          challenges={challenges} 
          issues={issues}
          researchLibrary={researchLibrary}  // Pass library
        />
      )}
    </section>
  );
}

// Enhanced PreventionTab with Citations
export function PreventionTab({ challenges, researchLibrary }) {
  return (
    <div className="prevention-content">
      {Object.entries(challenges).map(([category, items]) => (
        <div key={category} className="challenge-category">
          <h3>{formatCategory(category)}</h3>
          
          {items.map((challenge, index) => (
            <ChallengeCard 
              key={index}
              challenge={challenge}
              researchLibrary={researchLibrary}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Challenge Card with Citation Footer
function ChallengeCard({ challenge, researchLibrary }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <details 
      className="challenge-card"
      open={expanded}
      onToggle={(e) => setExpanded(e.target.open)}
    >
      <summary className="challenge-header">
        <SeverityDot severity={challenge.severity} />
        <h4>{challenge.challenge}</h4>
        <ChevronIcon expanded={expanded} />
      </summary>
      
      <div className="challenge-body">
        {/* Impact */}
        <div className="impact-section">
          <p className="label">Impact:</p>
          <p>{challenge.impact}</p>
        </div>
        
        {/* Solutions */}
        <div className="solutions-section">
          <p className="label">Solutions:</p>
          <ul>
            {challenge.solutions.map((solution, i) => (
              <li key={i}>{solution}</li>
            ))}
          </ul>
        </div>
        
        {/* Prevention */}
        <div className="prevention-section">
          <p className="label">Prevention:</p>
          <p>{challenge.prevention}</p>
        </div>
        
        {/* NEW: Research Support */}
        {challenge.research && challenge.research.length > 0 && (
          <div className="research-section mt-4 pt-4 border-t border-gray-700">
            <p className="text-sm font-semibold text-gray-300 mb-2">
              📚 Research Support
            </p>
            
            {challenge.research.map((citationId) => {
              const citation = researchLibrary[citationId];
              if (!citation) return null;
              
              return (
                <div key={citationId} className="citation-card bg-gray-800 rounded p-3 mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-blue-400 text-xs">[{citationId}]</span>
                    {citation.key_findings?.[0]?.confidence && (
                      <ConfidenceBadge score={citation.key_findings[0].confidence} />
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-1">
                    {citation.author} ({citation.year})
                  </p>
                  
                  {citation.key_findings?.[0]?.finding && (
                    <p className="text-xs text-gray-400 italic">
                      "{citation.key_findings[0].finding}"
                    </p>
                  )}
                  
                  <button 
                    onClick={() => scrollToResearchLibrary(citationId)}
                    className="text-blue-400 text-xs mt-2 hover:underline"
                  >
                    View full citation ↓
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </details>
  );
}

// Enhanced TroubleshootingTab with Citations
export function TroubleshootingTab({ issues, researchLibrary }) {
  return (
    <div className="troubleshooting-content">
      {issues.map((issue, index) => (
        <IssueCard 
          key={index}
          issue={issue}
          researchLibrary={researchLibrary}
        />
      ))}
    </div>
  );
}

// Issue Card with Citation Support
function IssueCard({ issue, researchLibrary }) {
  return (
    <div className="issue-card bg-gray-800 rounded-lg p-4">
      {/* Symptom */}
      <h4 className="text-lg font-semibold text-white mb-3">
        🔍 {issue.symptom}
      </h4>
      
      {/* Causes */}
      <div className="causes-section mb-3">
        <p className="text-sm font-semibold text-red-400 mb-1">Causes:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-300">
          {issue.causes.map((cause, i) => (
            <li key={i} className="text-sm">{cause}</li>
          ))}
        </ul>
      </div>
      
      {/* Solutions */}
      <div className="solutions-section mb-3">
        <p className="text-sm font-semibold text-green-400 mb-1">Solutions:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-300">
          {issue.solutions.map((solution, i) => (
            <li key={i} className="text-sm">{solution}</li>
          ))}
        </ul>
      </div>
      
      {/* Verification */}
      <div className="verification-section mb-3">
        <p className="text-sm font-semibold text-blue-400 mb-1">Verification:</p>
        <p className="text-sm text-gray-300">{issue.verification}</p>
      </div>
      
      {/* Prevention */}
      <div className="prevention-section mb-3">
        <p className="text-sm font-semibold text-purple-400 mb-1">Prevention:</p>
        <p className="text-sm text-gray-300">{issue.prevention}</p>
      </div>
      
      {/* NEW: Research Citations */}
      {issue.research && issue.research.length > 0 && (
        <div className="research-section mt-4 pt-4 border-t border-gray-700">
          <p className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
            📚 Supporting Research
            <span className="text-xs text-gray-500">({issue.research.length} sources)</span>
          </p>
          
          <div className="flex flex-wrap gap-2">
            {issue.research.map((citationId) => {
              const citation = researchLibrary[citationId];
              if (!citation) return null;
              
              return (
                <button
                  key={citationId}
                  onClick={() => scrollToResearchLibrary(citationId)}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-900 rounded text-xs hover:bg-gray-700 transition-colors"
                >
                  <span className="font-mono text-blue-400">[{citationId}]</span>
                  <span className="text-gray-300">{citation.year}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Benefits:**
- ✅ Citations tied to specific challenges and issues
- ✅ Quick reference badges for browsing
- ✅ Full details on click/expand
- ✅ Validates recommendations with research

---

### 5. Citations Component (Research Library Display)

**Current State:**
- (Newly created) Displays full research library at bottom of page

**Enhanced Implementation:**

```tsx
// app/components/Citations/Citations.tsx

export interface Citation {
  type: 'journal_article' | 'industry_standard' | 'government_database' | 'textbook' | 'ai_research';
  author: string;
  year: number;
  title: string;
  journal?: string;
  doi?: string;
  url?: string;
  key_findings?: Array<{
    finding: string;
    specific_value?: string;
    confidence: number;
  }>;
  quality_indicators?: {
    peer_reviewed?: boolean;
    authority?: string;
    impact_factor?: number;
    citation_count?: number;
  };
  relevance_to_our_work?: string;
}

export interface CitationsProps {
  library: Record<string, Citation>;
  referencedCitations?: string[];  // Optional: highlight only cited ones
}

export function Citations({ library, referencedCitations }: CitationsProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter citations
  const filteredCitations = Object.entries(library).filter(([id, citation]) => {
    const matchesType = filterType === 'all' || citation.type === filterType;
    const matchesSearch = !searchTerm || 
      citation.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      citation.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });
  
  // Sort citations: referenced first, then alphabetically
  const sortedCitations = filteredCitations.sort(([idA, citationA], [idB, citationB]) => {
    if (referencedCitations) {
      const aReferenced = referencedCitations.includes(idA);
      const bReferenced = referencedCitations.includes(idB);
      if (aReferenced && !bReferenced) return -1;
      if (!aReferenced && bReferenced) return 1;
    }
    return citationA.year > citationB.year ? -1 : 1;  // Newest first
  });
  
  return (
    <section id="research-library" className="citations-section mt-12 scroll-mt-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-2">Research Library</h2>
        <p className="text-gray-400 mb-6">
          All data and recommendations validated against peer-reviewed research, 
          industry standards, and authoritative databases.
        </p>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search citations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 bg-gray-800 rounded border border-gray-700 text-white"
          />
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-gray-800 rounded border border-gray-700 text-white"
          >
            <option value="all">All Types</option>
            <option value="journal_article">Journal Articles</option>
            <option value="industry_standard">Industry Standards</option>
            <option value="government_database">Government Data</option>
            <option value="textbook">Textbooks</option>
            <option value="ai_research">AI Research</option>
          </select>
        </div>
        
        {/* Citation Count */}
        <p className="text-sm text-gray-500 mb-4">
          Showing {sortedCitations.length} of {Object.keys(library).length} citations
          {referencedCitations && (
            <> · {referencedCitations.length} referenced on this page</>
          )}
        </p>
        
        {/* Citations Grid */}
        <div className="space-y-6">
          {sortedCitations.map(([citationId, citation]) => (
            <CitationCard 
              key={citationId}
              citationId={citationId}
              citation={citation}
              isReferenced={referencedCitations?.includes(citationId)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Individual Citation Card
function CitationCard({ citationId, citation, isReferenced }: {
  citationId: string;
  citation: Citation;
  isReferenced?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div 
      id={`citation-${citationId}`}
      className={`
        citation-card bg-gray-800 rounded-lg p-6 border-l-4
        ${isReferenced ? 'border-blue-500' : 'border-gray-700'}
        scroll-mt-20
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-blue-400 font-bold">[{citationId}]</span>
            <CitationTypeBadge type={citation.type} />
            {isReferenced && (
              <span className="px-2 py-1 bg-blue-900/30 border border-blue-500 rounded text-xs text-blue-300">
                Referenced
              </span>
            )}
          </div>
          
          <h3 className="text-xl font-semibold text-white mb-1">
            {citation.title}
          </h3>
          
          <p className="text-gray-400">
            {citation.author} ({citation.year})
            {citation.journal && <> · <em>{citation.journal}</em></>}
          </p>
        </div>
        
        {citation.quality_indicators && (
          <QualityBadges indicators={citation.quality_indicators} />
        )}
      </div>
      
      {/* Key Findings (Always Visible) */}
      {citation.key_findings && citation.key_findings.length > 0 && (
        <div className="mb-3 bg-gray-900 rounded p-3">
          <p className="text-sm font-semibold text-green-400 mb-2">Key Findings:</p>
          <ul className="space-y-2">
            {citation.key_findings.slice(0, 2).map((finding, i) => (
              <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <div>
                  <p className="italic">"{finding.finding}"</p>
                  {finding.specific_value && (
                    <p className="text-xs text-gray-400 mt-1">
                      Value: {finding.specific_value}
                    </p>
                  )}
                  <ConfidenceBadge score={finding.confidence} size="small" />
                </div>
              </li>
            ))}
          </ul>
          
          {citation.key_findings.length > 2 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-blue-400 text-xs mt-2 hover:underline"
            >
              {expanded ? 'Show less' : `Show ${citation.key_findings.length - 2} more findings`}
            </button>
          )}
        </div>
      )}
      
      {/* Expanded Details */}
      {expanded && (
        <div className="space-y-3 border-t border-gray-700 pt-3">
          {citation.relevance_to_our_work && (
            <div>
              <p className="text-sm font-semibold text-blue-400 mb-1">
                Relevance to Our Work:
              </p>
              <p className="text-sm text-gray-300">{citation.relevance_to_our_work}</p>
            </div>
          )}
          
          {/* Additional key findings if expanded */}
          {citation.key_findings && citation.key_findings.length > 2 && (
            <ul className="space-y-2">
              {citation.key_findings.slice(2).map((finding, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <div>
                    <p className="italic">"{finding.finding}"</p>
                    {finding.specific_value && (
                      <p className="text-xs text-gray-400 mt-1">
                        Value: {finding.specific_value}
                      </p>
                    )}
                    <ConfidenceBadge score={finding.confidence} size="small" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      
      {/* Links */}
      <div className="flex gap-4 mt-4">
        {citation.doi && (
          <a
            href={`https://doi.org/${citation.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:underline"
          >
            DOI: {citation.doi} →
          </a>
        )}
        {citation.url && !citation.doi && (
          <a
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:underline"
          >
            View Source →
          </a>
        )}
      </div>
    </div>
  );
}

// Citation Type Badge
function CitationTypeBadge({ type }: { type: Citation['type'] }) {
  const config = {
    journal_article: { label: 'Journal Article', color: 'bg-purple-900/30 border-purple-500 text-purple-300' },
    industry_standard: { label: 'Industry Standard', color: 'bg-blue-900/30 border-blue-500 text-blue-300' },
    government_database: { label: 'Government Data', color: 'bg-green-900/30 border-green-500 text-green-300' },
    textbook: { label: 'Textbook', color: 'bg-orange-900/30 border-orange-500 text-orange-300' },
    ai_research: { label: 'AI Research', color: 'bg-yellow-900/30 border-yellow-500 text-yellow-300' },
  }[type];
  
  return (
    <span className={`px-2 py-1 rounded border text-xs font-semibold ${config.color}`}>
      {config.label}
    </span>
  );
}

// Quality Indicators
function QualityBadges({ indicators }: { indicators: Citation['quality_indicators'] }) {
  if (!indicators) return null;
  
  return (
    <div className="flex flex-col gap-1 text-xs">
      {indicators.peer_reviewed && (
        <span className="px-2 py-1 bg-green-900/30 border border-green-500 rounded text-green-300">
          ✓ Peer Reviewed
        </span>
      )}
      {indicators.impact_factor && (
        <span className="px-2 py-1 bg-blue-900/30 border border-blue-500 rounded text-blue-300">
          IF: {indicators.impact_factor}
        </span>
      )}
      {indicators.citation_count && (
        <span className="px-2 py-1 bg-purple-900/30 border border-purple-500 rounded text-purple-300">
          {indicators.citation_count} citations
        </span>
      )}
    </div>
  );
}
```

**Benefits:**
- ✅ Comprehensive research library display
- ✅ Filterable and searchable
- ✅ Referenced citations highlighted
- ✅ Quality indicators visible
- ✅ Expandable for full details

---

## Shared Components

### ConfidenceBadge
```tsx
interface ConfidenceBadgeProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
}

export function ConfidenceBadge({ score, size = 'medium' }: ConfidenceBadgeProps) {
  const color = score >= 95 ? 'green' : score >= 85 ? 'yellow' : 'orange';
  const sizeClasses = {
    small: 'px-1.5 py-0.5 text-xs',
    medium: 'px-2 py-1 text-xs',
    large: 'px-3 py-1.5 text-sm',
  }[size];
  
  const colorClasses = {
    green: 'bg-green-900/30 border-green-500 text-green-300',
    yellow: 'bg-yellow-900/30 border-yellow-500 text-yellow-300',
    orange: 'bg-orange-900/30 border-orange-500 text-orange-300',
  }[color];
  
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-semibold ${sizeClasses} ${colorClasses}`}>
      <span className="text-lg">●</span>
      {score}%
    </span>
  );
}
```

### ScrollToResearchLibrary Utility
```tsx
export function scrollToResearchLibrary(citationId: string) {
  const element = document.getElementById(`citation-${citationId}`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Highlight animation
    element.classList.add('citation-highlight');
    setTimeout(() => {
      element.classList.remove('citation-highlight');
    }, 2000);
  }
}

// CSS for highlight animation
/*
.citation-highlight {
  animation: highlight-pulse 2s ease-in-out;
}

@keyframes highlight-pulse {
  0%, 100% { box-shadow: none; }
  50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
}
*/
```

---

## Implementation Priority

### Phase 1: High Priority (Week 1)
1. ✅ **ParameterRelationships** - Most critical, users need to see evidence for settings
2. ✅ **Citations Component** - Foundation for all citation displays
3. ✅ **DiagnosticCenter** - Validates challenges and troubleshooting

### Phase 2: Medium Priority (Week 2)
4. ✅ **MaterialSafetyHeatmap** - Shows validation for safety zones
5. ✅ **ProcessEffectivenessHeatmap** - Similar to safety heatmap

### Phase 3: Nice-to-Have (Week 3)
6. ✅ **ThermalAccumulation** - Model validation for simulator

---

## Success Metrics

**User Trust:**
- ✅ Users can trace every recommendation to research
- ✅ Confidence scores indicate validation strength
- ✅ Multiple sources increase credibility

**Developer Experience:**
- ✅ Consistent citation patterns across components
- ✅ Reusable components (ConfidenceBadge, CitationPreview)
- ✅ Easy to add new citations via YAML

**SEO Benefits:**
- ✅ Rich structured data (Schema.org citations)
- ✅ External links to authoritative sources (DOIs)
- ✅ E-E-A-T signals (expertise, authority, trust)

---

## Example: Complete Flow

1. **User reads parameter recommendation** in ParameterRelationships
2. **Sees inline citation preview** with key finding
3. **Clicks "View Full Citation"** → scrolls to Research Library
4. **Expands citation card** → sees methodology, confidence, relevance
5. **Clicks DOI link** → reads full paper on publisher site
6. **Returns confident** in Z-Beam's recommendations

**Result:** User trusts data, understands validation, can verify independently.
