# Mandatory Section Requirements 🔥 **CRITICAL POLICY (Jan 15, 2026)**

**ALL sections MUST comply with these non-negotiable requirements.**

## 🚨 **TIER 1: SYSTEM-BREAKING VIOLATIONS** (Will cause failures)

### **1. sectionTitle and sectionDescription from Frontmatter ONLY**
❌ **FORBIDDEN**: Hardcoded section titles/descriptions in components
✅ **REQUIRED**: All titles and descriptions read from frontmatter data

```tsx
// ❌ WRONG - Hardcoded in component
<BaseSection 
  title="Material Characteristics"
  description="Physical and chemical properties"
/>

// ✅ CORRECT - From frontmatter data
<BaseSection 
  title={section.sectionTitle}
  description={section.sectionDescription}
/>
```

### **2. Zero Fallbacks Policy**
❌ **FORBIDDEN**: Fallback values for missing section data
✅ **REQUIRED**: Immediate failure if sectionTitle/sectionDescription missing

```tsx
// ❌ WRONG - Fallback values
title={section.sectionTitle || "Default Title"}
description={section.sectionDescription || ""}

// ✅ CORRECT - Fail-fast
title={section.sectionTitle}  // Must exist or throw error
description={section.sectionDescription}  // Must exist or throw error
```

### **3. Backend Data Generation**
❌ **FORBIDDEN**: Frontend creating section metadata
✅ **REQUIRED**: Backend generates sectionTitle/sectionDescription in source YAML

**Source Data Pattern** (Materials.yaml, Contaminants.yaml, etc.):
```yaml
material_characteristics:
  sectionTitle: "Material Characteristics"
  sectionDescription: "Physical and chemical properties affecting laser cleaning performance"
  properties:
    # ... actual data
```

### **4. BaseSection Architecture**
❌ **FORBIDDEN**: Direct SectionContainer/GridSection usage
✅ **REQUIRED**: All sections use BaseSection directly

```tsx
// ❌ WRONG - Legacy wrapper
import { SectionContainer } from '../SectionContainer';
<SectionContainer>

// ✅ CORRECT - BaseSection only
import { BaseSection } from '../BaseSection';
<BaseSection title={data.sectionTitle} description={data.sectionDescription}>
```

## 📊 **Implementation Requirements**

### **Frontend Components**
1. **Import Pattern**:
   ```tsx
   import { BaseSection } from '../BaseSection/BaseSection';
   import { getSectionIcon } from '../utils/getSectionIcon';
   ```

2. **Props Pattern**:
   ```tsx
   interface SectionProps {
     data: {
       sectionTitle: string;        // REQUIRED - no optional
       sectionDescription: string;  // REQUIRED - no optional
       // ... other section data
     };
   }
   ```

3. **Usage Pattern**:
   ```tsx
   <BaseSection
     title={data.sectionTitle}
     description={data.sectionDescription}
     icon={getSectionIcon('appropriate-icon')}
     variant="default"
     spacing="normal"
   >
     {/* Section content */}
   </BaseSection>
   ```

### **Backend Data Generation**
1. **Source YAML Structure**:
   ```yaml
   sections:
     material_characteristics:
       sectionTitle: "Material Characteristics"
       sectionDescription: "Detailed description of what this section contains"
       # Section-specific data follows
   ```

2. **Export/Frontmatter Generation**:
   - All sections must include sectionTitle and sectionDescription
   - No defaults or fallbacks during generation
   - Fail-fast if template/source lacks section metadata

### **Testing Requirements**
1. **Component Tests**:
   ```typescript
   // REQUIRED: Test missing title/description throws error
   it('should throw error when sectionTitle missing', () => {
     expect(() => render(<SectionComponent data={{}} />)).toThrow();
   });

   it('should throw error when sectionDescription missing', () => {
     expect(() => render(<SectionComponent data={{ sectionTitle: 'Test' }} />)).toThrow();
   });
   ```

2. **Data Validation Tests**:
   ```typescript
   // REQUIRED: Validate all frontmatter has section metadata
   it('should have sectionTitle and sectionDescription for all sections', () => {
     frontmatterData.sections.forEach(section => {
       expect(section.sectionTitle).toBeDefined();
       expect(section.sectionDescription).toBeDefined();
       expect(section.sectionTitle).not.toBe('');
       expect(section.sectionDescription).not.toBe('');
     });
   });
   ```

## 🔍 **Enforcement**

### **Build-Time Checks**
- TypeScript interfaces enforce required fields
- Component prop validation prevents optional title/description
- Backend validation ensures all sections have metadata

### **Runtime Validation**
```tsx
// Add to BaseSection component
export function BaseSection({ title, description, ...props }: BaseSectionProps) {
  if (!title) {
    throw new Error(`BaseSection: sectionTitle is required`);
  }
  if (!description) {
    throw new Error(`BaseSection: sectionDescription is required`);
  }
  
  // ... component implementation
}
```

### **Automated Tests**
- Pre-commit hooks validate section metadata presence
- Build pipeline fails if any section lacks title/description
- Integration tests verify end-to-end data flow

## 🚫 **Common Violations to Avoid**

1. **Hardcoded Titles**: `title="Material Properties"` in JSX
2. **Empty Descriptions**: `description=""` or `description={undefined}`
3. **Fallback Logic**: `title || "Default"` patterns
4. **Optional Props**: Making sectionTitle/sectionDescription optional in interfaces
5. **Legacy Wrappers**: Using SectionContainer instead of BaseSection
6. **Frontend Generation**: Creating section metadata in components

## 📝 **Migration Checklist**

For existing components:
- [ ] Replace hardcoded titles with `{data.sectionTitle}`
- [ ] Replace hardcoded descriptions with `{data.sectionDescription}`
- [ ] Remove all fallback values (`||`, `??`, defaults)
- [ ] Update TypeScript interfaces to require title/description
- [ ] Add error handling for missing metadata
- [ ] Test with missing data to ensure fail-fast behavior
- [ ] Update backend to generate required section metadata
- [ ] Verify frontmatter includes all section metadata

## 🎯 **Quality Gates**

**Grade F Violations** (Immediate failure):
- Any hardcoded section titles/descriptions
- Any fallback values for section metadata
- Any optional sectionTitle/sectionDescription props
- Any components not using BaseSection architecture

**Success Criteria**:
- ✅ All sections read title/description from data
- ✅ All missing metadata causes immediate error
- ✅ All sections use BaseSection consistently
- ✅ Backend generates complete section metadata
- ✅ Zero hardcoded section content in components

**Documentation**: This policy supersedes all previous section implementation patterns.
**Effective**: January 15, 2026
**Enforcement**: Mandatory for all new and existing components