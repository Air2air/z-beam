# Quick Reference: Creating Research Pages

## TL;DR

Research pages display deep-dive property analysis with multi-source citations, variations, and practical laser cleaning implications.

**Example:** http://localhost:3000/materials/stone/igneous/granite-laser-cleaning/research/density

## Create a New Research Page (5 Steps)

### 1. Copy Template YAML
```bash
cp frontmatter/research/granite-density-research.yaml \
   frontmatter/research/marble-hardness-research.yaml
```

### 2. Edit Core Metadata
```yaml
material: Marble
property: hardness
title: "Hardness Research for Marble Laser Cleaning"
description: "Multi-source analysis of marble hardness..."

# Update breadcrumb last item
breadcrumb:
  - label: Density Research  # Change this
    href: /materials/marble/research/hardness  # And this
```

### 3. Add Research Data
```yaml
research:
  primary:
    value: 3.5        # Main recommended value
    unit: "Mohs"
    confidence: 95
    notes: "Your explanation here"
    citation:
      title: "Source title"
      publisher: "Publisher name"
      url: https://example.com
  
  sources:
    - value: 3.0
      confidence: 98
      source_type: handbook
      notes: "Specific context"
      citation:
        title: "Detailed source"
        # ... full citation
```

### 4. Add Laser Implications
```yaml
laser_implications:
  summary: "How this property affects laser cleaning"
  
  parameter_recommendations:
    power_range:
      optimal: 100
      range_min: 80
      range_max: 150
      unit: W
      reasoning: "Why these values"
```

### 5. Register Route
In `app/materials/[category]/[subcategory]/[slug]/research/[property]/page.tsx`:

```typescript
export async function generateStaticParams() {
  return [
    {
      category: 'stone',
      subcategory: 'metamorphic',
      slug: 'marble-laser-cleaning',
      property: 'hardness'
    },
    // ... existing entries
  ];
}
```

## YAML Structure Quick Reference

### Required Sections
```yaml
# Core (always needed)
material: "Material Name"
property: "property_name"
title: "Display Title"
description: "SEO description"

# Research (primary data)
research:
  primary:
    value: 123
    unit: "unit"
    confidence: 95
    notes: "context"
  
  sources: []  # Array of sources

# Laser (practical application)
laser_implications:
  summary: "impact description"
  parameter_recommendations: {}
```

### Optional Sections
```yaml
# Variations (e.g., granite types)
research:
  geological_variations: []

# Comparisons
comparative:
  similar_materials: []

# Methods (builds trust)
methodology:
  research_process: "description"
  quality_gates: []

# User support
faq: []

# Data access
dataset:
  enabled: true
  formats: []

# Navigation
related_research:
  same_material: []
  same_property: []
```

## Common Patterns

### Multi-Source Entry
```yaml
- value: 2750
  value_alt: 2.75  # Alternative unit
  unit: kg/m³
  unit_alt: g/cm³
  confidence: 98
  source_type: handbook  # handbook | scientific_literature | industry_standard | ai_research
  source_name: "USGS Database"
  notes: "Specific context for this value"
  
  geological_context:  # Optional
    formation: "plutonic_intrusive"
    mineral_composition: "35% quartz, 60% feldspar"
    typical_locations: "Vermont, Maine"
  
  citation:
    title: "Full title"
    author: "Author name"  # Optional
    publisher: "Publisher"
    year: 2023
    page: "52-53"  # Optional
    url: https://source.url
```

### Laser Parameter
```yaml
power_range:
  optimal: 100      # Best value
  min: 80          # Safe minimum
  max: 150         # Safe maximum
  unit: W
  reasoning: "Why these values work"
  density_scaling: "Reduce 10W per 100 kg/m³"  # Optional formula
```

### FAQ Entry
```yaml
- question: "Why does this matter?"
  answer: "Because [explanation with voice characteristics]"
  topic_keyword: "why does"  # For search
  topic_statement: "Brief summary"  # For displays
```

## Visual Components Generated

### From Research Data
- ✅ Large primary value display
- ✅ Expandable source cards
- ✅ Confidence badges
- ✅ Citation links
- ✅ Geological context boxes

### From Variations
- ✅ Type cards with colors
- ✅ Mineral composition grids
- ✅ Density ranges
- ✅ Common names

### From Laser Implications
- ✅ Parameter cards
- ✅ Optimal value highlights
- ✅ Range displays
- ✅ Scaling formulas
- ✅ Safety warnings

### From Comparative
- ✅ Bar chart visualizations
- ✅ Percentage comparisons
- ✅ Material differences

### From Methodology
- ✅ Process description
- ✅ Quality gate indicators
- ✅ Pass/fail badges

## Tips

### Writing Notes & Summaries
Use the author's voice characteristics:
- "pretty much" / "basically" / "fairly" / "typically"
- Technical precision with approachable tone
- Practical, actionable information
- Clear reasoning for recommendations

### Confidence Scores
- **98-100%:** Primary sources (ASTM, USGS, peer-reviewed)
- **95-97%:** Secondary sources (handbooks, databases)
- **90-94%:** Tertiary sources (AI research, compiled data)
- **85-89%:** Calculated or estimated values

### Citation Quality
Always include:
- ✅ Title
- ✅ Publisher or journal
- ✅ Year
- ✅ URL (if available)

Optionally add:
- Author name(s)
- Page numbers
- ISBN/DOI
- Edition

### Laser Parameters
Be specific and actionable:
- ✅ "Optimal: 100W (Range: 80-150W)"
- ✅ "Reduce 10W per 100 kg/m³ increase"
- ❌ "Use appropriate power settings"
- ❌ "Adjust as needed"

## Testing

### Check Locally
```bash
# Start dev server
npm run dev

# Visit page
open http://localhost:3000/materials/{category}/{subcategory}/{slug}/research/{property}
```

### Verify Display
- [ ] Primary value shows prominently
- [ ] Sources expand/collapse
- [ ] Citations link correctly
- [ ] Badges display with colors
- [ ] Laser parameters readable
- [ ] FAQ sections render
- [ ] Download buttons present
- [ ] Related links work

### Build Test
```bash
npm run build
# Should complete without errors
```

## Troubleshooting

### Page Not Found
- Check `generateStaticParams()` includes your route
- Verify YAML filename matches: `{material}-{property}-research.yaml`
- Confirm category/subcategory/slug are correct

### Missing Sections
- Check YAML structure matches expected format
- Ensure property names are exactly as shown in component
- Look for console errors in browser DevTools

### Styling Issues
- Verify SectionContainer bgColor is valid: `gray-50`, `gray-100`, `transparent`, `navbar`, `body`
- Check Badge variant: `primary`, `secondary`, `success`, `warning`, `danger`, `info`

## Complete Example Structure

See `frontmatter/research/granite-density-research.yaml` for a comprehensive example with:
- ✅ 5 sources with full citations
- ✅ 4 geological variations
- ✅ Complete laser implications
- ✅ Comparative analysis
- ✅ Detailed methodology
- ✅ 6 FAQ entries
- ✅ Dataset downloads
- ✅ Related research links

This is the gold standard template for all future research pages.
