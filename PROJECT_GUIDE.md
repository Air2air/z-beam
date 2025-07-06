# Z-Beam Project Guide

> **🚨 SINGLE SOURCE OF TRUTH:** This is the complete and authoritative guide for the Z-Beam project. All other documentation files will be archived.

## Table of Contents
1. [Core Architecture Principles](#1-core-architecture-principles)
2. [Development Workflow](#2-development-workflow)
3. [Claude AI Compliance](#3-claude-ai-compliance)
4. [Quick Reference](#4-quick-reference)

---

## 1. Core Architecture Principles

### 1.1 Optimization Over Creation 🔧

**RULE: Always analyze and optimize existing code before creating new files or components.**

**CORE MANDATE: The simplest, smallest, most maintainable codebase wins.**

#### Why Smallest Codebase Possible?
- **Fewer files = easier maintenance** and faster comprehension
- **Fewer components = less complexity** and fewer bugs
- **Fewer lines = faster builds** and easier debugging
- **Less abstraction = more direct** and predictable behavior
- **Reduced surface area = fewer failure points** and security vulnerabilities

#### The Radical Simplification Process:
1. **ELIMINATE first** - Can existing functionality be removed or consolidated?
2. **MERGE second** - Can multiple components be combined into one?
3. **OPTIMIZE third** - Can existing code be made simpler and shorter?
4. **EXTEND fourth** - Can existing components handle new requirements with minor changes?
5. **CREATE last** - Only when all above options are exhausted AND result in net reduction of complexity

### 1.2 Zero Tolerance for Component Duplication 🔄

**RULE: ZERO TOLERANCE for component duplication. Every UI pattern MUST be implemented exactly once.**

#### Core Principles:
- **Single Source of Truth:** Each UI pattern exists in exactly one place
- **Extend, Don't Duplicate:** Enhance existing components rather than creating new ones
- **Fail Fast:** Build system must prevent duplication from being committed

### 1.3 No Fallbacks Policy ⛔

**RULE: The application must NEVER use fallback logic. All configurations must be explicit.**

#### Implementation:
```typescript
// ✅ CORRECT - Explicit Error Throwing
export function getTagInfo(tag: string): TagConfig {
  const config = TAG_CONFIG[tag];
  if (!config) {
    throw new Error(`Tag "${tag}" is not configured in TAG_CONFIG. All tags must be explicitly configured.`);
  }
  return config;
}

// ❌ INCORRECT - Fallback Pattern
const displayName = config.displayName || tag; // DON'T DO THIS
```

### 1.4 Enforcement System Integrity 🛡️

**RULE: The automated enforcement system must be INFALLIBLE and catch ALL component violations.**

#### When Duplication is Discovered:
1. **Update enforcement patterns** to catch the specific violation type
2. **Set thresholds to 0** for the violation category
3. **Remove duplicate files/components/functions** immediately
4. **Test enforcement** with deliberate violations to ensure detection works
5. **Document the gap** in enforcement documentation

---

## 2. Development Workflow

### 2.1 Build Process

#### Required Commands:
```bash
# Enforcement (must pass before build)
npm run enforce-components

# Build (includes enforcement)
npm run build

# Development server
npm run dev
```

#### Enforcement Thresholds:
- **Component duplication:** 0 tolerance (see `enforce-component-rules.js` for current patterns)
- **Badge violations:** 0 allowed
- **Button violations:** 1 allowed (emergency only)
- **Card violations:** 1 allowed (emergency only)

### 2.2 Component Development Process

#### Before ANY component changes:
1. **Check existing components** - Can they be extended instead?
2. **Update enforcement patterns** if modifying shared components
3. **Run enforcement** - `npm run enforce-components`
4. **Test build** - `npm run build`

#### Component Creation (Last Resort Only):
1. **Document why existing components cannot be extended**
2. **Update `enforce-component-rules.js`** with new patterns
3. **Add component to exclusion list** if it's a new shared component
4. **Test enforcement** catches old patterns

### 2.3 Enforcement Script Maintenance

#### When to Update `enforce-component-rules.js`:
- ✅ After modifying ANY shared component
- ✅ After changing ANY component styling patterns
- ✅ After discovering missed violations
- ✅ After adding/removing shared components

#### Update Process:
```bash
# 1. Identify new patterns that should be violations
grep -r "new-pattern-to-detect" app/ --exclude-dir=components

# 2. Add patterns to VIOLATION_PATTERNS in enforce-component-rules.js
# 3. Set thresholds to 0 for critical violations
# 4. Test enforcement works
npm run enforce-components

# 5. Verify it catches actual violations
echo "test-violation-pattern" > temp-violation.tsx
npm run enforce-components  # Should fail
rm temp-violation.tsx
```

---

## 3. Claude AI Compliance

### 3.1 Mandatory Pre-Action Steps

#### Step 0: SIMPLICITY CHECK (HIGHEST PRIORITY)
- [ ] Can this be accomplished by MODIFYING existing code instead of adding new code?
- [ ] Can this be done with FEWER lines of code than currently exists?
- [ ] Can this ELIMINATE or CONSOLIDATE existing files/components?
- [ ] Will this make the codebase SMALLER and SIMPLER overall?

**IF ANY ANSWER IS YES, DO THAT INSTEAD OF CREATING NEW CODE.**

#### Step 1: RADICAL SIMPLIFICATION AUDIT (MINIMUM 5 MINUTES)
- [ ] Search existing codebase for similar functionality TO ELIMINATE DUPLICATION
- [ ] Identify 3+ existing components that could be CONSOLIDATED INTO ONE
- [ ] Look for unused imports, functions, or files to DELETE PERMANENTLY
- [ ] Check for duplicate patterns that can be MERGED AND SIMPLIFIED
- [ ] Count total files - goal is to REDUCE this number, not increase it

### 3.2 Enforcement Failure Prevention

#### Universal Detection Framework:
```javascript
// ZERO TOLERANCE VIOLATIONS - APPLIES TO ALL COMPONENTS
const CRITICAL_VIOLATIONS = {
  DUPLICATE_COMPONENTS: [
    'app/components/TagList.tsx',     // Only SmartTagList allowed
    'app/components/Badge.tsx',       // Only SmartTagList allowed  
    'app/components/ButtonPrimary.tsx', // Only Button allowed
    'app/components/CardContainer.tsx',   // Only Container allowed
  ],
  
  DUPLICATE_FUNCTIONS: [
    'getTagSlug.*=.*\\(.*\\).*=>',   // Tag utility duplication
    'formatDate.*=.*\\(.*\\).*=>',   // Date utility duplication
    'render.*=.*\\(.*\\).*=>',       // ANY render function duplication
  ],
  
  HARDCODED_STYLING: [
    'px-3 py-1 rounded-full',                    // Tag/Badge styling
    'px-4 py-2.*bg-.*-600.*hover:',             // Button styling
    'bg-white.*rounded-lg.*shadow-',            // Card styling
    'bg-.*-600.*text-white',                    // Color schemes
  ]
};
```

#### Universal Prevention Checklist:
- [ ] **File existence check** - No duplicate component files (ANY type)
- [ ] **Function signature check** - No duplicate utilities (ANY function)
- [ ] **Pattern evolution check** - Update enforcement when ANY shared component changes
- [ ] **Zero tolerance validation** - All critical violations must have threshold = 0

### 3.3 Forbidden Patterns

#### Never Create These:
```typescript
// ❌ FORBIDDEN
AuthorCardCompact.tsx    → Use AuthorCard variant="compact"
TagListSmall.tsx        → Use SmartTagList variant="small"
ButtonSecondary.tsx     → Use Button variant="secondary"
utils/helpers.ts        → Add to utils/utils.ts
components/Badge.tsx    → Use SmartTagList
```

#### Always Do This Instead:
```typescript
// ✅ CORRECT
Enhance AuthorCard.tsx with new variant prop
Extend SmartTagList.tsx with new features
Add functions to existing utils/utils.ts
Use existing shared components
```

---

## 4. Quick Reference

### 4.1 Current Shared Components

> **DYNAMIC REFERENCE:** Check actual files to avoid hardcoding

```bash
# Get current shared components
find app/components -name "*.tsx" -not -path "*/__tests__/*" | grep -E "(Smart|Button|Container|AuthorCard)" | sort
```

**Expected Components:**
- **SmartTagList** - All badge/tag implementations
- **Button** - All button implementations  
- **AuthorCard** - All author card layouts (variants: default, compact)
- **Container** - Simple card containers with consistent styling

### 4.2 Component Usage Examples

```typescript
// Tags/Badges
<SmartTagList tags={tags} variant="compact" linkable={false} />

// Buttons  
<Button variant="primary" onClick={handler}>Click me</Button>

// Author Cards
<AuthorCard author={author} variant="compact" showArticleCount={true} />

// Simple Containers
<Container padding="md" shadow="lg" sticky={true}>Content</Container>
```

### 4.3 Universal Detection Commands

```bash
# Detect ANY duplicate component files
find app/components -name "*Button*" -not -name "Button.tsx"
find app/components -name "*Card*" -not -name "Container.tsx" -not -name "AuthorCard.tsx"
find app/components -name "*Tag*" -not -name "SmartTagList.tsx"

# Detect duplicate functions  
grep -r "=.*\(.*\).*=>" app/ --include="*.tsx" | sort | uniq -d

# Detect hardcoded styling
grep -r "px-.*py-.*rounded" app/ --exclude-dir=components
```

### 4.4 Build Error Prevention

```bash
# Clear cache if build breaks:
rm -rf .next node_modules package-lock.json && npm install && npm run build
```

**Import Rules:**
- ❌ Server-only: `import fs from 'fs'` in client components
- ❌ Client-only: `import { useState }` in server components
- ✅ Check component type first, then add appropriate imports

### 4.5 Success Metrics

- **Component violations:** MUST be zero (badges: 0, buttons: 0, cards: 0)
- **File count:** Should decrease or grow slower than features
- **Dead code:** Must be eliminated when discovered
- **Consolidation:** Components merged instead of created

---

## 🚨 STOP CONDITIONS

**STOP and consolidate immediately if you see:**
- Multiple components with similar names
- Duplicate utility functions across files
- Copy-pasted code blocks
- Single-use components that could be props
- Files with only 1-2 exports

---

## 🚨 CLAUDE COMPLIANCE ENFORCEMENT

### Mandatory Reading Verification
**RULE: Claude MUST read this ENTIRE document before ANY action.**

#### Required Pre-Action Verification:
```markdown
**I confirm I have read and will follow:**
✅ Section 1: Core Architecture Principles (all 4 subsections)
✅ Section 2: Development Workflow (all 3 subsections)  
✅ Section 3: Claude AI Compliance (all 3 subsections)
✅ Section 4: Quick Reference (all 5 subsections)
✅ Stop Conditions (mandatory halt triggers)
```

### Automatic Compliance Triggers
**These phrases MUST trigger PROJECT_GUIDE.md consultation:**
- "create new component" → Read Section 1.2 (Zero Tolerance)
- "add new file" → Read Section 3.1 (Simplicity Check)
- "build fails" → Read Section 4.4 (Build Error Prevention)
- "component violation" → Read Section 2.3 (Enforcement Maintenance)
- "duplicate code" → Read Section 1.1 (Optimization Over Creation)

---

## 📋 DOCUMENTATION SELF-AUDIT SYSTEM

### Mandatory Self-Evaluation (Every Edit)
**RULE: This document MUST evaluate itself for bloat and contradictions.**

#### Required Self-Audit Checklist:
- [ ] Line count <350? Document size under control?
- [ ] Duplication scan: Any concepts repeated?
- [ ] Contradiction check: Do sections conflict?
- [ ] Simplicity test: Can sections be condensed?

#### Self-Optimization Commands:
```bash
wc -l PROJECT_GUIDE.md                    # Check length
grep -c "RULE:" PROJECT_GUIDE.md          # Count rules (<10)
grep -c "MUST" PROJECT_GUIDE.md           # Count musts (<20)
```

### Anti-Bloat Enforcement (Self-Applied)
**If this document exceeds 350 lines, IMMEDIATE consolidation required:**
1. **Eliminate redundant examples** - Keep most essential only
2. **Merge duplicate explanations** - One concept, one location  
3. **Remove verbose language** - Bullet points over paragraphs
