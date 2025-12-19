# Content Section Title Pattern

**Document Purpose**: Standardize how titles and descriptions are used across all content sections  
**Created**: December 17, 2025  
**Status**: Active Standard

---

## Pattern Overview

All content sections in the Z-Beam application follow a consistent title pattern:

```tsx
<GridSection 
  title="Section Title"
  description="Optional descriptive text that provides context"
>
  {/* Grid content */}
</GridSection>
```

### Key Principles

1. **Title**: Always present, concise, describes what the section contains
2. **Description**: Optional, provides additional context about the content
3. **Consistency**: Same pattern used across all grid-based sections
4. **Semantic**: Description replaces generic "subtitle" for clearer purpose

---

## Field Definitions

### `title` (Required)
- **Purpose**: Primary heading that identifies the section
- **Character Guidelines**: 3-6 words, clear and specific
- **Examples**: 
  - ✅ "Hazardous Compounds Generated"
  - ✅ "Compatible Materials"
  - ✅ "Related Contaminants"
  - ❌ "Information" (too vague)
  - ❌ "This section shows materials that work with this contaminant" (too long)

### `description` (Optional)
- **Purpose**: Explanatory text that clarifies what users will find
- **Character Guidelines**: 1-2 sentences, specific to the content
- **When to Use**: When the section content needs clarification
- **When to Omit**: When the title is self-explanatory
- **Examples**:
  - ✅ "Compounds produced during laser removal with exposure limits and required safety controls"
  - ✅ "Materials frequently contaminated by this substance during industrial processes"
  - ✅ "Machine settings optimized for safe and effective removal of this contaminant"
  - ❌ "See below for information" (not informative)
  - ❌ "A comprehensive list of all the different materials and their various properties" (too verbose)

---

## Component Implementation

### GridSection Component

```tsx
interface GridSectionProps {
  title: string;              // Required: Section heading
  description?: string;       // Optional: Contextual description
  children: React.ReactNode;  // Grid content
  variant?: 'default' | 'dark' | 'light';
  alignment?: 'left' | 'center' | 'right';
}

export function GridSection({
  title,
  description,
  children,
  variant = 'default',
  alignment = 'left',
}: GridSectionProps) {
  return (
    <div className="mb-16">
      <SectionContainer variant={variant}>
        <div className="container-custom px-4">
          <SectionTitle
            title={title}
            subtitle={description}  // Maps description to SectionTitle's subtitle
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

**Note**: Internally, `GridSection` maps `description` prop to `SectionTitle`'s `subtitle` prop. This maintains backward compatibility with the existing `SectionTitle` component while providing clearer semantic meaning at the API level.

---

## Usage Examples

### Example 1: Compound Safety Grid
```tsx
<GridSection
  title="Hazardous Compounds Generated"
  description="Compounds produced during laser removal with exposure limits and required safety controls"
>
  <CompoundSafetyGrid
    compounds={compounds}
    sortBy="severity"
  />
</GridSection>
```

**Result**: 
- Title: Large heading "Hazardous Compounds Generated"
- Description: Gray text below explaining what the compounds represent
- Grid: Sorted by severity with safety metadata

### Example 2: Material Linkages (No Description)
```tsx
<GridSection
  title="Compatible Materials"
>
  <DataGrid
    data={materials}
    mapper={materialLinkageToGridItem}
    sorter={sortByFrequency}
  />
</GridSection>
```

**Result**:
- Title: Large heading "Compatible Materials"
- Description: None (title is self-explanatory)
- Grid: Materials sorted by frequency

### Example 3: Domain Linkages with Context
```tsx
<GridSection
  title="Related Contaminants"
  description="Contaminants that often appear together with this substance in industrial settings"
>
  <DataGrid
    data={contaminants}
    mapper={contaminantLinkageToGridItem}
    sorter={sortBySeverity}
  />
</GridSection>
```

**Result**:
- Title: "Related Contaminants"
- Description: Explains the relationship context
- Grid: Contaminants with severity-based sorting

---

## Normalized Pattern Across All Sections

All grid sections in the application now follow this pattern:

| Section | Title | Description | Notes |
|---------|-------|-------------|-------|
| **Hazardous Compounds** | "Hazardous Compounds Generated" | "Compounds produced during laser removal with exposure limits and required safety controls" | Primary safety section |
| **Compatible Materials** | "Compatible Materials" | Optional: "Materials frequently contaminated by this substance" | Material domain linkages |
| **Related Contaminants** | "Related Contaminants" | Optional: "Contaminants that often appear together" | Contaminant domain linkages |
| **Related Settings** | "Machine Settings" | Optional: "Optimized laser parameters for this contaminant" | Settings domain linkages |
| **Risk Overview** | N/A | N/A | Uses cards, not GridSection |
| **PPE Requirements** | N/A | N/A | Standalone section with h3 |
| **Ventilation** | N/A | N/A | Standalone section with h3 |

---

## Migration Notes

### Before (Old Pattern)
```tsx
<SectionTitle 
  title="Safety Information"
  subtitle="Critical safety data for laser removal operations"
/>
```
- Generic subtitle
- Used "subtitle" terminology
- Required SectionContainer wrapper

### After (New Pattern)
```tsx
<GridSection
  title="Hazardous Compounds Generated"
  description="Compounds produced during laser removal with exposure limits and required safety controls"
>
  {/* Grid content */}
</GridSection>
```
- Specific, contextual description
- Uses "description" terminology (clearer semantic meaning)
- GridSection handles all wrappers automatically

---

## Benefits

1. **Clarity**: "description" is more intuitive than "subtitle"
2. **Consistency**: All grids use identical wrapper pattern
3. **Flexibility**: Description is optional when title is self-explanatory
4. **SEO**: Descriptive text helps search engines understand content
5. **Accessibility**: Screen readers benefit from contextual descriptions
6. **Maintainability**: Single pattern reduces cognitive load

---

## Guidelines for Writing Descriptions

### ✅ Good Descriptions
- **Specific**: "Compounds produced during laser removal with exposure limits"
- **Contextual**: "Materials frequently contaminated by this substance"
- **Action-oriented**: "Machine settings optimized for safe removal"
- **Informative**: "Contaminants that often appear together in industrial settings"

### ❌ Poor Descriptions
- **Generic**: "See information below"
- **Redundant**: "A list of compounds" (title already says this)
- **Too long**: "This section contains a comprehensive analysis of all compounds that might be generated during the laser removal process including their exposure limits and required control measures"
- **Too short**: "Data" (not informative)

---

## Future Enhancements

### Potential Additions
1. **Icon Support**: Optional icon prop for visual enhancement
2. **Action Buttons**: Optional CTA in section header (e.g., "View All")
3. **Collapsible**: Toggle to collapse/expand sections
4. **Filter Integration**: Built-in filter UI for grids
5. **Count Badges**: Display item count (e.g., "Hazardous Compounds (12)")

### Backward Compatibility
- `SectionTitle` component still accepts `subtitle` prop
- `GridSection` maps `description` → `subtitle` internally
- Existing code using `subtitle` will continue to work
- Migration to `description` is recommended but not required

---

## Related Documentation

- `SOLUTION_A_IMPLEMENTATION_GUIDE.md` - Grid architecture overview
- `FRONTMATTER_CARD_GRID_PROPOSALS.md` - Original grid design proposals
- `app/components/GridSection/GridSection.tsx` - Component implementation
- `app/components/SectionTitle/SectionTitle.tsx` - Underlying title component

---

## Enforcement

### Code Review Checklist
- [ ] All new grid sections use `GridSection` component
- [ ] `title` prop is clear and concise (3-6 words)
- [ ] `description` prop adds meaningful context (if used)
- [ ] Description is omitted if title is self-explanatory
- [ ] No hardcoded section wrappers (use GridSection)
- [ ] Consistent `mb-16` spacing via GridSection

### Automated Testing
- Component prop validation (TypeScript)
- Integration tests verify GridSection renders correctly
- Accessibility tests check description is associated with title
