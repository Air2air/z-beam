# Heatmap Panel Integration Proposal

## Current Structure (Two Separate Panels)

### Panel 1: Current Settings
```
┌─────────────────────────────────────┐
│ Current Aluminum Settings           │
├─────────────────────────────────────┤
│ Power:              50W             │
│ Pulse:              100ns           │
│ ─────────────────────────────────   │
│ Safety Status:                      │
│ SAFE - Low Risk                     │
│ Level 21/25                         │
└─────────────────────────────────────┘
```

### Panel 2: Analysis Breakdown
```
┌─────────────────────────────────────┐
│ ⚙️ Aluminum Analysis Breakdown      │
├─────────────────────────────────────┤
│ [Damage Risk] [Power] [Pulse] etc   │
│ [Final Score]                       │
└─────────────────────────────────────┘
```

**Issues:**
- Redundant information (level shown twice)
- Separated context (settings vs analysis)
- Takes more vertical space
- Two separate headings for related info

---

## 🥇 Proposal 1: Compact Header Integration (Recommended)

Merge current settings into a compact header above the analysis breakdown.

### Visual Layout
```
┌──────────────────────────────────────────────────────────────┐
│ ⚙️ Aluminum Analysis                                         │
├──────────────────────────────────────────────────────────────┤
│ 📍 50W × 100ns → SAFE (21/25) ●●●●●○                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌─ Damage Risk (50%) ─────────────────────────┐             │
│ │ Fluence vs threshold                         │             │
│ │ 2.45 J/cm² (45% of threshold)               │             │
│ │ ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░                         │             │
│ └─────────────────────────────────────────────┘             │
│                                                              │
│ ┌─ Power Factor (25%) ────────────────────────┐             │
│ │ Spatial power distribution                   │             │
│ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░                        │             │
│ └─────────────────────────────────────────────┘             │
│                                                              │
│ ... [other factors] ...                                     │
│                                                              │
│ ┌─ Combined Safety Level ─────────────────────┐             │
│ │ 21/25 • Method: Weighted (50/25/20/5)       │             │
│ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░                        │             │
│ └─────────────────────────────────────────────┘             │
└──────────────────────────────────────────────────────────────┘
```

### Implementation
```tsx
<section className="bg-gray-800/80 rounded-lg border border-gray-700" aria-labelledby="analysis-heading">
  {/* Compact Header */}
  <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-3 border-b border-gray-700">
    <h4 id="analysis-heading" className="text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
      <span className="text-purple-400" aria-hidden="true">⚙️</span>
      {materialLabel} Analysis
    </h4>
    
    {/* Inline Current Settings */}
    <div className="flex items-center gap-3 text-xs">
      <span className="text-gray-400">📍</span>
      <span className="text-white font-semibold">
        {hoveredCell ? hoveredCell.power.toFixed(0) : currentPower}W
        {' × '}
        {hoveredCell ? hoveredCell.pulse.toFixed(1) : currentPulse}ns
      </span>
      <span className="text-gray-500">→</span>
      <span className={`font-bold ${
        level >= 20 ? 'text-green-400' :
        level >= 15 ? 'text-yellow-400' :
        level >= 9 ? 'text-orange-400' :
        'text-red-400'
      }`}>
        {getSafetyLabel(level).split(' - ')[0]}
      </span>
      <span className="text-gray-400">({level}/25)</span>
      
      {/* Mini progress indicator */}
      <div className="flex gap-0.5 ml-auto">
        {Array.from({ length: 5 }).map((_, i) => (
          <div 
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${
              i < Math.ceil(level / 5) ? 'bg-green-400' : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
    </div>
  </div>
  
  {/* Analysis Breakdown (existing factors) */}
  <div className="p-4 space-y-2.5">
    {/* Damage Risk, Power, Pulse, Shock, Final Score articles... */}
  </div>
</section>
```

**Benefits:**
- ✅ All information in one cohesive panel
- ✅ Clear visual hierarchy
- ✅ Saves ~100px vertical space
- ✅ Compact current settings always visible
- ✅ Status immediately apparent
- ✅ Clean, professional look

**Trade-offs:**
- ⚠️ Current settings less prominent (but still visible)
- ⚠️ Requires redesign of header

---

## 🥈 Proposal 2: Tabbed Interface

Use tabs to switch between "Current Settings" and "Analysis Breakdown" views.

### Visual Layout
```
┌──────────────────────────────────────────────────┐
│ [Current Settings] [Analysis Breakdown]          │
├──────────────────────────────────────────────────┤
│                                                  │
│  Power: 50W          Pulse: 100ns               │
│                                                  │
│  Safety Status: SAFE - Low Risk                 │
│  Level: 21/25                                   │
│                                                  │
│  [View Detailed Analysis →]                     │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Implementation
```tsx
const [activeTab, setActiveTab] = useState<'settings' | 'analysis'>('settings');

<section className="bg-gray-800/80 rounded-lg border border-gray-700">
  {/* Tab Headers */}
  <div className="flex border-b border-gray-700">
    <button
      onClick={() => setActiveTab('settings')}
      className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
        activeTab === 'settings'
          ? 'bg-blue-900/30 text-blue-400 border-b-2 border-blue-400'
          : 'text-gray-400 hover:text-gray-300'
      }`}
    >
      Current Settings
    </button>
    <button
      onClick={() => setActiveTab('analysis')}
      className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
        activeTab === 'analysis'
          ? 'bg-purple-900/30 text-purple-400 border-b-2 border-purple-400'
          : 'text-gray-400 hover:text-gray-300'
      }`}
    >
      Analysis Breakdown
    </button>
  </div>
  
  {/* Tab Content */}
  <div className="p-4">
    {activeTab === 'settings' ? (
      /* Current settings content */
    ) : (
      /* Analysis breakdown content */
    )}
  </div>
</section>
```

**Benefits:**
- ✅ Clean separation of concerns
- ✅ Less cognitive load (one view at a time)
- ✅ Saves vertical space
- ✅ Familiar UI pattern

**Trade-offs:**
- ⚠️ Requires extra click to see analysis
- ⚠️ Context switching friction
- ⚠️ Can't see both simultaneously

---

## 🥉 Proposal 3: Collapsible Header

Keep separate panels but make Current Settings collapsible.

### Visual Layout
```
┌──────────────────────────────────────┐
│ ▼ Current Aluminum Settings          │ ← Click to collapse
├──────────────────────────────────────┤
│ Power: 50W    Pulse: 100ns          │
│ Status: SAFE (21/25)                 │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ ⚙️ Aluminum Analysis Breakdown       │
├──────────────────────────────────────┤
│ [Full breakdown...]                   │
└──────────────────────────────────────┘

--- When collapsed: ---

┌──────────────────────────────────────┐
│ ▶ 50W × 100ns → SAFE (21/25)        │ ← Click to expand
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ ⚙️ Aluminum Analysis Breakdown       │
│ [Full breakdown...]                   │
└──────────────────────────────────────┘
```

### Implementation
```tsx
const [isExpanded, setIsExpanded] = useState(true);

<section className="bg-blue-900/20 rounded-lg border border-blue-500/50">
  <button
    onClick={() => setIsExpanded(!isExpanded)}
    className="w-full px-4 py-2 flex items-center justify-between hover:bg-blue-900/10 transition-colors"
  >
    <span className="text-sm font-semibold text-blue-400 flex items-center gap-2">
      {isExpanded ? '▼' : '▶'}
      {isExpanded 
        ? `Current ${materialLabel} Settings`
        : `${hoveredCell?.power.toFixed(0) || currentPower}W × ${hoveredCell?.pulse.toFixed(1) || currentPulse}ns → ${getSafetyLabel(level).split(' - ')[0]} (${level}/25)`
      }
    </span>
  </button>
  
  {isExpanded && (
    <div className="px-4 pb-4 space-y-2 text-sm">
      {/* Current settings details */}
    </div>
  )}
</section>
```

**Benefits:**
- ✅ User controls space usage
- ✅ Minimal code changes
- ✅ Preserves current structure
- ✅ Progressive disclosure

**Trade-offs:**
- ⚠️ Still two separate panels
- ⚠️ Extra interaction required
- ⚠️ Collapsed state may hide important info

---

## 🎯 Proposal 4: Inline Status Banner (Best Balance)

Move current settings into a prominent status banner inside the analysis panel.

### Visual Layout
```
┌──────────────────────────────────────────────────────────────┐
│ ⚙️ Aluminum Analysis                                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ 📍 Analyzing: 50W × 100ns                              ┃ │
│ ┃ 🛡️ Status: SAFE - Low Risk • Level 21/25              ┃ │
│ ┃ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░ 84% safe                        ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                                              │
│ ┌─ Damage Risk (50%) ─────────────────────────┐             │
│ │ ...                                          │             │
│ └─────────────────────────────────────────────┘             │
│                                                              │
│ ... [other factors] ...                                     │
└──────────────────────────────────────────────────────────────┘
```

### Implementation
```tsx
<section className="bg-gray-800/80 rounded-lg p-4 border border-gray-700" aria-labelledby="analysis-heading">
  <h4 id="analysis-heading" className="text-xs font-semibold text-gray-300 mb-3 flex items-center gap-2">
    <span className="text-purple-400" aria-hidden="true">⚙️</span>
    {materialLabel} Analysis
  </h4>
  
  {/* Status Banner */}
  <div className={`mb-4 p-3 rounded-lg border-2 ${
    level >= 20 ? 'bg-green-900/20 border-green-500/50' :
    level >= 15 ? 'bg-yellow-900/20 border-yellow-500/50' :
    level >= 9 ? 'bg-orange-900/20 border-orange-500/50' :
    'bg-red-900/20 border-red-500/50'
  }`}>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400">📍</span>
        <span className="text-white font-semibold">
          {hoveredCell ? hoveredCell.power.toFixed(0) : currentPower}W
          {' × '}
          {hoveredCell ? hoveredCell.pulse.toFixed(1) : currentPulse}ns
        </span>
      </div>
      <span className={`text-xs font-bold ${
        level >= 20 ? 'text-green-400' :
        level >= 15 ? 'text-yellow-400' :
        level >= 9 ? 'text-orange-400' :
        'text-red-400'
      }`}>
        {level}/25
      </span>
    </div>
    
    <div className="flex items-center gap-2 mb-2">
      <span className="text-gray-400 text-xs">🛡️</span>
      <span className={`text-sm font-semibold ${
        level >= 20 ? 'text-green-400' :
        level >= 15 ? 'text-yellow-400' :
        level >= 9 ? 'text-orange-400' :
        'text-red-400'
      }`}>
        {getSafetyLabel(level)}
      </span>
    </div>
    
    {/* Progress bar */}
    <div className="bg-gray-950 rounded-full h-2 overflow-hidden">
      <div 
        className={`h-full transition-all ${
          result.finalScore > 0.7 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
          result.finalScore > 0.4 ? 'bg-gradient-to-r from-yellow-500 to-amber-400' :
          'bg-gradient-to-r from-red-500 to-orange-400'
        }`}
        style={{ width: `${result.finalScore * 100}%` }}
      />
    </div>
    <div className="text-[10px] text-gray-400 mt-1 text-right">
      {Math.round(result.finalScore * 100)}% safe
    </div>
  </div>
  
  {/* Factor Breakdown (existing) */}
  <div className="space-y-2.5 text-xs" role="list">
    {/* Damage Risk, Power, Pulse, etc... */}
  </div>
</section>
```

**Benefits:**
- ✅ Single unified panel
- ✅ Status banner is highly visible
- ✅ Color-coded for quick recognition
- ✅ Progress bar provides immediate feedback
- ✅ Maintains all current information
- ✅ Clean visual hierarchy

**Trade-offs:**
- ⚠️ Slightly more complex styling
- ⚠️ Banner takes some vertical space

---

## Comparison Matrix

| Feature | Current | Proposal 1 | Proposal 2 | Proposal 3 | Proposal 4 |
|---------|---------|------------|------------|------------|------------|
| **Vertical Space** | Most | Least | Medium | Variable | Medium |
| **Info Visibility** | Good | Good | Poor | Good | Excellent |
| **Visual Hierarchy** | Fair | Good | Good | Fair | Excellent |
| **Implementation** | - | Medium | Complex | Easy | Medium |
| **User Interaction** | None | None | Required | Optional | None |
| **Mobile Friendly** | Fair | Excellent | Good | Good | Excellent |
| **Accessibility** | Good | Excellent | Good | Good | Excellent |

---

## Recommendation: Proposal 4 (Status Banner)

**Why:**
1. ✅ **Best visual hierarchy** - Status banner draws attention while remaining compact
2. ✅ **No interaction required** - Information always visible
3. ✅ **Color-coded urgency** - Border/background changes based on safety level
4. ✅ **Single cohesive panel** - No artificial separation
5. ✅ **Mobile-friendly** - Vertical layout works well on all screens
6. ✅ **Maintains all info** - Nothing lost from current implementation

**Alternative:** If vertical space is critical, use **Proposal 1** (Compact Header)

**Avoid:** Proposal 2 (Tabs) - hiding information behind interaction is suboptimal for critical safety data

---

## Migration Path

### Phase 1: Implement Status Banner (2 hours)
1. Create status banner component in analysis panel
2. Move current settings data into banner
3. Style with color-coded borders
4. Add progress bar with percentage

### Phase 2: Remove Separate Panel (30 min)
1. Delete old "Current Settings" section
2. Update ARIA labels
3. Test screen reader navigation

### Phase 3: Polish (1 hour)
1. Fine-tune spacing
2. Add subtle animations
3. Test on mobile
4. Update documentation

**Total Time: ~3.5 hours**

---

## Code Example: Full Implementation

See attached `StatusBannerIntegration.tsx` example showing complete implementation of Proposal 4 with:
- Color-coded status banner
- Inline settings display
- Progress visualization
- Full factor breakdown
- Semantic HTML
- ARIA labels
- Responsive design
