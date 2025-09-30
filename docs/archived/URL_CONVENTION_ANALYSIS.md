# URL Convention Analysis - z-beam.com

## Issues Found

### 1. **URL Structure Inconsistency**

**Expected Convention**: `z-beam.com/{material}` (for simple material pages)
**Problem**: Two different patterns being used inconsistently:
- Caption files: `z-beam.com/analysis/{material-name}` ✅ (acceptable pattern)
- Metatag files: `z-beam.com/{material-name}` ✅ (acceptable pattern)

### 2. **CRITICAL: URLs with Spaces Instead of Hyphens**

The following URLs contain **spaces** which will break URL functionality:

#### URLs with Spaces (MUST FIX):
1. `z-beam.com/stainless steel-laser-cleaning` → should be `stainless-steel`
2. `z-beam.com/fused silica-laser-cleaning` → should be `fused-silica`
3. `z-beam.com/epoxy resin composites-laser-cleaning` → should be `epoxy-resin-composites`
4. `z-beam.com/urethane composites-laser-cleaning` → should be `urethane-composites`
5. `z-beam.com/silicon germanium-laser-cleaning` → should be `silicon-germanium`
6. `z-beam.com/glass fiber reinforced polymers gfrp-laser-cleaning` → should be `glass-fiber-reinforced-polymers-gfrp`
7. `z-beam.com/lead crystal-laser-cleaning` → should be `lead-crystal`
8. `z-beam.com/tempered glass-laser-cleaning` → should be `tempered-glass`
9. `z-beam.com/kevlar-reinforced polymer-laser-cleaning` → should be `kevlar-reinforced-polymer`
10. `z-beam.com/fiber reinforced polyurethane frpu-laser-cleaning` → should be `fiber-reinforced-polyurethane-frpu`

### 3. **Files Affected**

**Metatag Files** (in `content/components/metatags/`):
- stainless-steel-laser-cleaning.md
- fused-silica-laser-cleaning.md
- epoxy-resin-composites-laser-cleaning.md
- urethane-composites-laser-cleaning.md
- silicon-germanium-laser-cleaning.md
- glass-fiber-reinforced-polymers-gfrp-laser-cleaning.md
- lead-crystal-laser-cleaning.md
- tempered-glass-laser-cleaning.md
- kevlar-reinforced-polymer-laser-cleaning.md
- fiber-reinforced-polyurethane-frpu-laser-cleaning.md

**Caption Files** (space issues in canonical URLs):
- Some caption files may have corresponding issues

### 4. **Pattern Analysis**

**Correct Patterns Found**:
- `z-beam.com/oak-laser-cleaning` ✅
- `z-beam.com/aluminum-laser-cleaning` ✅
- `z-beam.com/analysis/oak-laser-cleaning` ✅

**Broken Patterns**:
- URLs with spaces break web standards
- Inconsistent hyphenation between filename and URL content

## Recommended Fix

1. **Replace all spaces with hyphens** in URLs
2. **Ensure filename matches URL content** (e.g., if file is `stainless-steel-laser-cleaning.md`, URL should be `stainless-steel-laser-cleaning`)
3. **Standardize on hyphen-separated material names**

## Priority: HIGH
These space-containing URLs will cause 404 errors and broken links.
