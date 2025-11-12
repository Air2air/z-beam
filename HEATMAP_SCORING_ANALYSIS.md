# Heatmap Scoring System Analysis & Improvement Recommendations

**Date:** November 11, 2025  
**Components Analyzed:** MaterialSafetyHeatmap, ProcessEffectivenessHeatmap

---

## Executive Summary

After comprehensive review of both heatmap scoring systems, I've identified several critical issues affecting color accuracy and visual clarity:

### Primary Issues Identified:

1. **Incomplete Score Range Usage** - Not utilizing full 1-25 scale
2. **Color Interpolation Gaps** - Missing intermediate levels causing banding
3. **Inconsistent Scoring Logic** - Different calculation approaches between heatmaps
4. **Spatial Modifier Over-influence** - Penalties/boosts affecting physics-based calculations
5. **Non-linear Amplification Artifacts** - Exponential transforms creating unexpected color zones

---

## Detailed Analysis

### 1. Material Safety Heatmap Issues

#### Current Scoring Problems:

```typescript
// ISSUE #1: Score compression in safe zones
damageScore = 0.85 + (0.25 - fluenceRatio) / 0.25 * 0.15; // 0.85 → 1.00
// Only 15% of score range allocated to entire safe zone!
```

**Problem:** Safe zones (fluence < 25% of threshold) compressed into narrow 0.85-1.00 range.  
**Impact:** All safe parameters look similar (gray/muted) instead of vibrant.

```typescript
// ISSUE #2: Spatial modifiers competing with physics
powerModifier = 1.0 + lowPowerBoost * 0.15; // Up to 15% boost
// BUT then: finalScore = damageScore * 0.75 + (damageScore * powerModifier) * 0.15
```

**Problem:** Spatial position modifiers override physics-based fluence calculations.  
**Impact:** Two cells with identical fluence show different colors based on grid position.

```typescript
// ISSUE #3: Non-linear amplification artifacts
amplifiedScore = Math.pow(finalScore, 0.85); // Gentle compression
level = Math.round(amplifiedScore * 26);
```

**Problem:** Exponent 0.85 causes uneven distribution across 1-25 scale.  
**Impact:** Middle values (12-18) over-represented, extremes (1-5, 21-25) under-represented.

#### Color Gradient Issues:

```typescript
// ISSUE #4: 25 discrete color stops with linear interpolation
const colorStops = [
  { level: 25, color: '#10B981' },  // emerald-500
  { level: 24, color: '#14B8A6' },  // teal-500
  // ... 23 more stops
```

**Problem:** Interpolation only happens BETWEEN integer levels, not within calculated scores.  
**Impact:** Score 18.7 and 18.2 both map to level 19, get same color (banding effect).

---

### 2. Process Effectiveness Heatmap Issues

#### Current Scoring Problems:

```typescript
// ISSUE #5: Overly complex multi-phase scoring
if (fluenceRatio < 0.5) {
  ablationScore = fluenceRatio / 0.5 * 0.3;  // 0 → 0.3
} else if (fluenceRatio < 0.8) {
  ablationScore = 0.3 + ((fluenceRatio - 0.5) / 0.3) * 0.3;  // 0.3 → 0.6
} // ... 4 more phases
```

**Problem:** Six different formulas with arbitrary breakpoints create discontinuities.  
**Impact:** Sudden color jumps at phase boundaries (0.5, 0.8, 1.2, 1.8, 2.5).

```typescript
// ISSUE #6: Linear score-to-level conversion
const level = Math.max(1, Math.min(25, finalScore * 25));
```

**Problem:** Direct linear mapping doesn't match perceptual color needs.  
**Impact:** Middle levels (12-18) appear to dominate visual space.

---

## Proposed Solutions

### Solution 1: Perceptually-Uniform Score Distribution

**Replace:** Linear/exponential transforms  
**With:** Scientifically-designed perceptual mapping

```typescript
/**
 * IMPROVED: Perceptually-uniform score mapping
 * Ensures even distribution across visual spectrum
 */
const mapScoreToLevel = (normalizedScore: number): number => {
  // Use CIE LAB perceptual lightness formula
  // L* = 116 * f(Y/Yn) - 16, where f(t) = t^(1/3) for t > 0.008856
  
  // For our 0-1 score range, map to perceptual levels 1-25
  const perceptualScore = normalizedScore > 0.008856
    ? Math.pow(normalizedScore, 1/3)
    : 7.787 * normalizedScore + 16/116;
  
  return Math.max(1, Math.min(25, Math.round(perceptualScore * 25)));
};
```

### Solution 2: Continuous Color Interpolation

**Replace:** 25 discrete color stops  
**With:** Continuous gradient with sub-pixel precision

```typescript
/**
 * IMPROVED: Continuous color interpolation
 * Uses floating-point levels for smooth gradients
 */
const getColorFromLevel = (level: number): string => {
  // Define anchor colors at key points
  const anchors = [
    { level: 1,  color: '#7C2D12', label: 'Catastrophic' },
    { level: 5,  color: '#DC2626', label: 'Extreme Danger' },
    { level: 10, color: '#F97316', label: 'Warning' },
    { level: 15, color: '#FBBF24', label: 'Caution' },
    { level: 20, color: '#38BDF8', label: 'Safe' },
    { level: 25, color: '#10B981', label: 'Maximum Safety' }
  ];
  
  // Find surrounding anchors and interpolate
  for (let i = 0; i < anchors.length - 1; i++) {
    if (level >= anchors[i].level && level <= anchors[i + 1].level) {
      const range = anchors[i + 1].level - anchors[i].level;
      const position = level - anchors[i].level;
      const factor = position / range;
      
      // Use perceptually-uniform LAB color space interpolation
      return interpolateColorLAB(anchors[i].color, anchors[i + 1].color, factor);
    }
  }
  
  return level >= 25 ? anchors[anchors.length - 1].color : anchors[0].color;
};
```

### Solution 3: Physics-First Scoring (No Spatial Overrides)

**Replace:** Spatial modifiers that override physics  
**With:** Pure fluence-based calculations with visualization hints

```typescript
/**
 * IMPROVED: Pure physics-based safety scoring
 * Spatial position used ONLY for visual hints, not score calculation
 */
const calculateSafetyScore = (power: number, pulse: number): {
  score: number;
  visualHint: 'boost' | 'neutral' | 'caution';
} => {
  // Calculate fluence (pure physics)
  const fluence = calculateFluence(power, pulse);
  const fluenceRatio = fluence / damageThreshold;
  
  // Score based ONLY on fluence ratio
  let score = 0.0;
  
  if (fluenceRatio <= 0.20) {
    // DEEP SAFE ZONE: 0-20% of threshold
    score = 0.95 + (0.20 - fluenceRatio) / 0.20 * 0.05; // 0.95 → 1.00
  } else if (fluenceRatio <= 0.40) {
    // SAFE ZONE: 20-40% of threshold
    score = 0.85 + (0.40 - fluenceRatio) / 0.20 * 0.10; // 0.85 → 0.95
  } else if (fluenceRatio <= 0.60) {
    // LOW RISK: 40-60% of threshold
    score = 0.65 + (0.60 - fluenceRatio) / 0.20 * 0.20; // 0.65 → 0.85
  } else if (fluenceRatio <= 0.80) {
    // CAUTION: 60-80% of threshold
    score = 0.40 + (0.80 - fluenceRatio) / 0.20 * 0.25; // 0.40 → 0.65
  } else if (fluenceRatio <= 0.95) {
    // DANGER: 80-95% of threshold
    score = 0.15 + (0.95 - fluenceRatio) / 0.15 * 0.25; // 0.15 → 0.40
  } else {
    // CRITICAL: 95%+ of threshold
    score = Math.max(0.01, 0.15 * (1.0 - (fluenceRatio - 0.95) / 0.10));
  }
  
  // Visual hint for UI overlay (doesn't affect score)
  const powerNorm = (power - powerRange.min) / (powerRange.max - powerRange.min);
  const visualHint = powerNorm < 0.3 ? 'boost' : 
                     powerNorm > 0.7 ? 'caution' : 
                     'neutral';
  
  return { score, visualHint };
};
```

### Solution 4: Smooth Sigmoid Scoring (Effectiveness)

**Replace:** Multi-phase linear scoring  
**With:** Continuous sigmoid function

```typescript
/**
 * IMPROVED: Smooth effectiveness scoring using sigmoid
 * Eliminates discontinuities at phase boundaries
 */
const calculateEffectivenessScore = (power: number, pulse: number): number => {
  const fluence = calculateFluence(power, pulse);
  const ablationThreshold = materialProps.ablationThreshold || 1.0;
  const ratio = fluence / ablationThreshold;
  
  // Optimal range: 1.2x to 1.8x threshold (centered at 1.5x)
  const optimalCenter = 1.5;
  const optimalWidth = 0.3; // Half-width of optimal zone
  
  // Sigmoid function: S-curve centered at optimal point
  // High score near optimal (1.2-1.8x), falls off smoothly on both sides
  const distanceFromOptimal = Math.abs(ratio - optimalCenter);
  
  // Two-sided sigmoid: high in middle, low at extremes
  let score = 0.0;
  
  if (ratio < optimalCenter) {
    // Below optimal: sigmoid rising from 0 to peak
    const x = (ratio - 0.2) / (optimalCenter - 0.2); // Normalize to 0-1
    score = 1.0 / (1.0 + Math.exp(-8 * (x - 0.5))); // Sigmoid curve
  } else {
    // Above optimal: sigmoid falling from peak
    const x = (ratio - optimalCenter) / (3.0 - optimalCenter); // Normalize to 0-1
    score = 1.0 / (1.0 + Math.exp(8 * (x - 0.5))); // Inverse sigmoid
  }
  
  // Add efficiency bonus for being near optimal power/pulse settings
  const efficiencyBonus = calculateEfficiencyBonus(power, pulse);
  score = score * 0.85 + efficiencyBonus * 0.15;
  
  return score;
};
```

---

## Implementation Recommendations

### Phase 1: Color System Overhaul (Immediate)

**Priority:** HIGH  
**Effort:** 4 hours  
**Impact:** Visible immediately

1. Replace 25-stop discrete gradient with 6-stop continuous LAB interpolation
2. Implement perceptually-uniform score-to-level mapping
3. Add floating-point level support (remove Math.round until final render)
4. Test color coverage across full 1-25 range

### Phase 2: Physics-First Scoring (High Priority)

**Priority:** HIGH  
**Effort:** 6 hours  
**Impact:** Accurate representation of material science

1. Remove all spatial position modifiers from score calculation
2. Implement pure fluence-based scoring with expanded safe zone (0-40% threshold)
3. Add separate visualization hints for UI enhancement
4. Validate against actual material damage thresholds

### Phase 3: Effectiveness Smoothing (Medium Priority)

**Priority:** MEDIUM  
**Effort:** 4 hours  
**Impact:** Professional appearance, eliminates banding

1. Replace multi-phase linear scoring with continuous sigmoid
2. Implement smooth transitions across entire parameter space
3. Add perceptual uniformity to effectiveness gradients
4. Validate effectiveness peaks match optimal cleaning parameters

### Phase 4: Validation & Testing (Essential)

**Priority:** HIGH  
**Effort:** 8 hours  
**Impact:** Ensures accuracy

1. Create test suite with known material parameters
2. Verify score distribution covers full 1-25 range
3. Validate color gradients are perceptually uniform
4. Cross-reference with published laser processing research
5. User testing for visual clarity

---

## Expected Outcomes

### After Implementation:

1. **Full Range Utilization**
   - Safe zones: Levels 22-25 (bright cyan/green)
   - Low risk: Levels 18-21 (light blue)
   - Caution: Levels 13-17 (yellow)
   - Danger: Levels 8-12 (orange)
   - Critical: Levels 1-7 (red)

2. **Smooth Color Transitions**
   - No visible banding
   - Perceptually uniform gradients
   - Professional appearance

3. **Physics Accuracy**
   - Scores directly reflect material damage risk
   - No artificial spatial biases
   - Matches published research

4. **Visual Clarity**
   - Safe zones clearly identifiable (bright colors)
   - Danger zones unmistakable (saturated reds)
   - Optimal operating points obvious (peak greens)

---

## Testing Checklist

- [ ] Verify minimum score reaches level 1 (catastrophic conditions)
- [ ] Verify maximum score reaches level 25 (deep safe zone)
- [ ] Check color coverage: all 25 levels represented
- [ ] Validate smooth gradients: no visible banding
- [ ] Confirm physics accuracy: fluence calculations correct
- [ ] Test edge cases: min/max power and pulse combinations
- [ ] User feedback: colors intuitive and clear
- [ ] Performance: scoring calculations under 16ms per frame

---

## Additional Considerations

### Performance Optimization:

```typescript
// Memoize expensive calculations
const fluenceCache = useMemo(() => {
  const cache = new Map<string, number>();
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      const key = `${row}-${col}`;
      const power = powerRange.min + col * powerStep;
      const pulse = pulseRange.max - row * pulseStep;
      cache.set(key, calculateFluence(power, pulse));
    }
  }
  return cache;
}, [powerRange, pulseRange, gridRows, gridCols]);
```

### Color Accessibility:

- Ensure sufficient contrast for colorblind users
- Add optional high-contrast mode
- Include pattern overlays for danger zones

### Documentation:

- Add tooltips explaining score calculation
- Provide reference to material science basis
- Link to research papers validating thresholds

---

## Conclusion

Current scoring systems suffer from:
1. Incomplete range usage (gray safe zones)
2. Banding from discrete color stops
3. Non-physics spatial modifiers
4. Discontinuous phase transitions

Proposed solutions provide:
1. Full 1-25 range with perceptual uniformity
2. Smooth continuous gradients
3. Pure physics-based calculations
4. Professional, scientifically-accurate visualization

**Recommendation:** Implement Phase 1 (Color System) immediately for visible improvement, followed by Phase 2 (Physics-First) for scientific accuracy.
