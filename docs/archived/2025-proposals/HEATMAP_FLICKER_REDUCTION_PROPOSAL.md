# Heatmap Analysis Panel Flicker Reduction Proposal

## Problem Analysis

### Current Behavior
When moving the mouse across heatmap cells, the Analysis Breakdown panel rapidly updates on every `onMouseEnter` event, causing:
- ❌ **Visual flicker**: Content changes trigger layout shifts
- ❌ **Reading difficulty**: Users can't read values while hovering
- ❌ **Disorienting UX**: Panel updates too frequently
- ❌ **Performance overhead**: Recalculation + re-render on every cell

### Root Causes
1. **Immediate updates**: `setHoveredCell()` fires instantly on every cell boundary
2. **No debouncing**: Each mousemove between 400 cells triggers state change
3. **Progressive bars animate**: Width changes on every hover
4. **Text content changes**: All values update simultaneously

---

## Proposed Solutions

### 🥇 Solution 1: Debounced Hover (Recommended)

**Approach**: Add a short delay before updating the analysis panel, but show tooltip immediately.

**Implementation**:
```typescript
// BaseHeatmap.tsx
const [hoveredCell, setHoveredCell] = useState<HoveredCell | null>(null);
const [debouncedCell, setDebouncedCell] = useState<HoveredCell | null>(null);
const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

const handleCellHover = (power: number, pulse: number, analysis: CellAnalysis) => {
  // Immediate: Update for tooltip
  setHoveredCell({ power, pulse, analysis });
  
  // Debounced: Update for analysis panel (300ms delay)
  if (hoverTimeoutRef.current) {
    clearTimeout(hoverTimeoutRef.current);
  }
  
  hoverTimeoutRef.current = setTimeout(() => {
    setDebouncedCell({ power, pulse, analysis });
  }, 300);
};

const handleCellLeave = () => {
  // Clear timeout on leave
  if (hoverTimeoutRef.current) {
    clearTimeout(hoverTimeoutRef.current);
  }
  setHoveredCell(null);
  // Don't clear debouncedCell - keep last value
};

// Cleanup on unmount
useEffect(() => {
  return () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };
}, []);

// Usage in cell rendering:
<div
  onMouseEnter={() => handleCellHover(power, pulse, { ...analysis, level })}
  onMouseLeave={handleCellLeave}
>
  {/* Tooltip uses hoveredCell (immediate) */}
  {hoveredCell?.power === power && hoveredCell?.pulse === pulse && (
    <div className="tooltip">...</div>
  )}
</div>

// Analysis panel uses debouncedCell (delayed)
{renderAnalysisPanel(debouncedCell, powerRange.current, pulseRange.current)}
```

**Benefits**:
- ✅ Tooltip responds instantly (good UX)
- ✅ Analysis panel updates only after 300ms pause
- ✅ Smooth movement across cells doesn't trigger flicker
- ✅ Users can read values while hovering
- ✅ Minimal code changes

**Trade-offs**:
- ⚠️ Slight delay before panel updates (acceptable for detail view)
- ⚠️ Panel stays on last cell if quickly moving away

---

### 🥈 Solution 2: CSS Transitions with Opacity

**Approach**: Keep instant updates but add smooth fade transitions to reduce perceived flicker.

**Implementation**:
```tsx
// MaterialSafetyHeatmap.tsx - Analysis Breakdown section
<section 
  className="bg-gray-800/80 rounded-lg p-4 border border-gray-700 transition-opacity duration-200"
  aria-labelledby="analysis-breakdown-heading"
  key={result.level} // Force remount on change for smooth transition
>
  {/* Content */}
</section>

// Add to CSS or Tailwind config:
.analysis-panel {
  transition: opacity 200ms ease-in-out;
}

.analysis-panel.updating {
  opacity: 0.7;
}
```

**Alternative - Animate bars only**:
```tsx
// Individual progress bars already have transition-all
<div 
  className={`h-full transition-all duration-300 ease-out ${...}`}
  style={{ width: `${result.damageScore * 100}%` }}
/>
```

**Benefits**:
- ✅ Simple to implement
- ✅ No logic changes needed
- ✅ Softens visual impact
- ✅ Works well for small changes

**Trade-offs**:
- ⚠️ Still updates frequently
- ⚠️ Doesn't reduce cognitive load
- ⚠️ May feel sluggish if transitions too long

---

### 🥉 Solution 3: Intentional Hover Mode

**Approach**: Require explicit action (click or hold) to update analysis panel.

**Implementation**:
```typescript
// BaseHeatmap.tsx
const [selectedCell, setSelectedCell] = useState<HoveredCell | null>(null);
const [hoveredCell, setHoveredCell] = useState<HoveredCell | null>(null);

// Click to lock analysis panel
const handleCellClick = (power: number, pulse: number, analysis: CellAnalysis) => {
  setSelectedCell({ power, pulse, analysis });
};

// Render:
<div
  onMouseEnter={() => setHoveredCell({ power, pulse, analysis })}
  onMouseLeave={() => setHoveredCell(null)}
  onClick={() => handleCellClick(power, pulse, analysis)}
  className={`aspect-square ${
    selectedCell?.power === power && selectedCell?.pulse === pulse 
      ? 'ring-2 ring-white' 
      : ''
  }`}
>
  {/* Tooltip for hover */}
  {/* Analysis panel uses selectedCell or defaults to current settings */}
</div>

{renderAnalysisPanel(
  selectedCell || hoveredCell, // Prefer selected, fallback to hover
  powerRange.current, 
  pulseRange.current
)}
```

**Benefits**:
- ✅ Zero flicker - updates only on click
- ✅ Users control when to see details
- ✅ Clear visual indicator (ring) of selected cell
- ✅ Can compare by clicking different cells

**Trade-offs**:
- ⚠️ Requires user education
- ⚠️ Less immediate feedback
- ⚠️ Extra interaction step

---

### 🎯 Solution 4: Hybrid Approach (Best UX)

**Approach**: Combine debouncing + smooth transitions + optional locking.

**Implementation**:
```typescript
// BaseHeatmap.tsx
const [hoveredCell, setHoveredCell] = useState<HoveredCell | null>(null);
const [debouncedCell, setDebouncedCell] = useState<HoveredCell | null>(null);
const [lockedCell, setLockedCell] = useState<HoveredCell | null>(null);
const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

const handleCellHover = (power: number, pulse: number, analysis: CellAnalysis) => {
  const cellData = { power, pulse, analysis };
  setHoveredCell(cellData);
  
  // Don't update if cell is locked
  if (lockedCell) return;
  
  if (hoverTimeoutRef.current) {
    clearTimeout(hoverTimeoutRef.current);
  }
  
  hoverTimeoutRef.current = setTimeout(() => {
    setDebouncedCell(cellData);
  }, 250); // Reduced to 250ms for better responsiveness
};

const handleCellClick = (power: number, pulse: number, analysis: CellAnalysis) => {
  const cellData = { power, pulse, analysis };
  setLockedCell(lockedCell?.power === power ? null : cellData); // Toggle lock
};

// Analysis panel displays locked > debounced > current
const displayCell = lockedCell || debouncedCell;

// Visual indicator
<div
  className={`aspect-square transition-all ${
    lockedCell?.power === power && lockedCell?.pulse === pulse
      ? 'ring-2 ring-blue-400 scale-110'
      : 'hover:scale-125'
  }`}
>
```

**Enhanced with smooth data transitions**:
```tsx
// MaterialSafetyHeatmap.tsx
const renderAnalysisPanel = (hoveredCell, currentPower, currentPulse) => {
  const result = hoveredCell?.analysis || calculateScore(...).analysis;
  
  return (
    <>
      <section 
        className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/50 
                   transition-all duration-200 ease-in-out"
      >
        {/* Smooth fade when content changes */}
      </section>
      
      <section 
        className="bg-gray-800/80 rounded-lg p-4 border border-gray-700
                   transition-all duration-200 ease-in-out"
      >
        {/* Progress bars have staggered transitions */}
        <article style={{ transitionDelay: '0ms' }}>...</article>
        <article style={{ transitionDelay: '50ms' }}>...</article>
        <article style={{ transitionDelay: '100ms' }}>...</article>
      </section>
    </>
  );
};
```

**Benefits**:
- ✅ Best of all approaches
- ✅ Smooth hover with debouncing
- ✅ Optional click-to-lock for detailed analysis
- ✅ Visual feedback for locked state
- ✅ Graceful transitions

**Trade-offs**:
- ⚠️ Most complex to implement
- ⚠️ Need to explain lock feature to users

---

## Performance Optimizations

### Additional improvements regardless of approach:

#### 1. Memoize Analysis Calculations
```typescript
// MaterialSafetyHeatmap.tsx
const memoizedAnalysis = useMemo(() => {
  return calculateScore(currentPower, currentPulse, materialProperties);
}, [currentPower, currentPulse, materialProperties]);
```

#### 2. Throttle Mouse Events
```typescript
// Limit to max 10 updates/second
import { throttle } from 'lodash'; // or implement custom

const throttledHover = useMemo(
  () => throttle(handleCellHover, 100),
  []
);
```

#### 3. Use CSS containment
```tsx
<section 
  className="bg-gray-800/80 rounded-lg p-4 border border-gray-700"
  style={{ contain: 'layout style paint' }}
>
  {/* Browser optimizes repaints */}
</section>
```

#### 4. Lazy render off-screen content
```typescript
const [isVisible, setIsVisible] = useState(false);

useEffect(() => {
  const observer = new IntersectionObserver(([entry]) => {
    setIsVisible(entry.isIntersecting);
  });
  
  if (panelRef.current) {
    observer.observe(panelRef.current);
  }
  
  return () => observer.disconnect();
}, []);

return isVisible ? <AnalysisPanel /> : <div style={{ height: '400px' }} />;
```

---

## Recommended Implementation Plan

### Phase 1: Quick Win (1 hour)
Implement **Solution 1 (Debounced Hover)** with 300ms delay:
- ✅ Minimal code changes
- ✅ Immediate flicker reduction
- ✅ No UX learning curve
- ✅ Reversible if issues arise

### Phase 2: Polish (2 hours)
Add CSS transitions to Solution 1:
- ✅ Smooth fade on panel updates
- ✅ Staggered progress bar animations
- ✅ Professional feel

### Phase 3: Advanced (4 hours)
Implement **Solution 4 (Hybrid)**:
- ✅ Add click-to-lock feature
- ✅ Visual indicators for locked state
- ✅ User preference persistence (localStorage)
- ✅ Keyboard navigation support

### Phase 4: Optimization (2 hours)
Apply performance improvements:
- ✅ Memoization
- ✅ CSS containment
- ✅ Throttling

---

## Testing Checklist

After implementing solution:
- [ ] Mouse quickly across grid - no flicker
- [ ] Hover on single cell - values readable
- [ ] Tooltip appears instantly
- [ ] Analysis panel updates smoothly
- [ ] No console errors or warnings
- [ ] Performance acceptable (60fps)
- [ ] Mobile touch events work
- [ ] Keyboard navigation preserved
- [ ] Screen reader announces changes appropriately
- [ ] Works in all target browsers

---

## Code Changes Required

### Files to Modify
1. `app/components/Heatmap/BaseHeatmap.tsx` - Add debouncing logic
2. `app/components/Heatmap/MaterialSafetyHeatmap.tsx` - Optional: Add transitions
3. `app/components/Heatmap/ProcessEffectivenessHeatmap.tsx` - Optional: Add transitions

### Estimated LOC
- Solution 1: ~40 lines added
- Solution 2: ~10 lines modified
- Solution 4: ~80 lines added

### Breaking Changes
- None - All solutions are backwards compatible

---

## User Feedback Scenarios

### Before (Current State)
> "The numbers keep jumping around when I try to read them."
> "It's hard to focus on the analysis while hovering."
> "The panel flickers too much - feels janky."

### After (Solution 1 - Debounced)
> "Much better! I can actually read the values now."
> "The panel updates smoothly when I pause on a cell."
> "Feels more professional and polished."

### After (Solution 4 - Hybrid)
> "Love that I can click to lock the analysis!"
> "Great for comparing different parameter combinations."
> "The locked cell indicator is helpful."

---

## Recommended Choice

**Start with Solution 1 (Debounced Hover)** because:
1. ✅ Solves 90% of the flicker problem
2. ✅ Simple implementation (~1 hour)
3. ✅ No UX changes required
4. ✅ Easy to test and validate
5. ✅ Foundation for more advanced solutions

**Then optionally add Solution 4 features** if users request:
- Click-to-lock for detailed analysis
- Visual locked state indicator
- Better for power users

---

## Alternative: User Preference

Provide a toggle in UI:
```tsx
<label className="flex items-center gap-2 text-xs text-gray-400">
  <input 
    type="checkbox" 
    checked={useInstantUpdates}
    onChange={(e) => setUseInstantUpdates(e.target.checked)}
  />
  Instant analysis updates (may flicker)
</label>
```

This lets users choose based on their workflow preference.
