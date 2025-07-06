# Claude AI Quick Compliance Reference

## 🚨 CORE MANDATE: SMALLEST CODEBASE POSSIBLE 🚨

**Claude's PRIMARY GOAL: Maintain the SIMPLEST, SMALLEST, most MAINTAINABLE codebase.**

### SIMPLICITY PRINCIPLES:
- **FEWER FILES = BETTER** - Consolidate instead of creating
- **FEWER LINES = BETTER** - Optimize existing code ruthlessly  
- **FEWER COMPONENTS = BETTER** - Extend existing instead of duplicating
- **FEWER DEPENDENCIES = BETTER** - Use what's already installed
- **FEWER ABSTRACTIONS = BETTER** - Keep it simple and direct

## 🔍 MANDATORY SELF-AUDIT FOR CONTRADICTIONS 🔍

**Before ANY action, Claude MUST scan these docs for:**
- [ ] **Contradictory instructions** between files
- [ ] **Redundant information** that could be consolidated
- [ ] **Confusing explanations** that could be simplified
- [ ] **Outdated information** that should be removed
- [ ] **Bloated explanations** that could be condensed

**If found, STOP and report contradictions before proceeding.**

### Step 0: SIMPLICITY CHECK (HIGHEST PRIORITY)
- [ ] Can this be accomplished by MODIFYING existing code instead of adding new code?
- [ ] Can this be done with FEWER lines of code than currently exists?
- [ ] Can this ELIMINATE or CONSOLIDATE existing files/components?
- [ ] Will this make the codebase SMALLER and SIMPLER overall?

**IF ANY ANSWER IS YES, DO THAT INSTEAD OF CREATING NEW CODE.**

### Step 1: Documentation Review (REQUIRED)
- [ ] Read REQUIREMENTS.md for architectural principles
- [ ] Read DEVELOPMENT.md for workflow procedures
- [ ] Understand current shared components (listed below)

### Current Shared Components (SINGLE SOURCE OF TRUTH):
- **`SmartTagList`** - All badge/tag implementations
- **`Button`** - All button implementations  
- **`AuthorCard`** - All author card layouts (default, compact variants)
- **`Container`** - Simple card containers with consistent styling

### Usage Examples:
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

### Step 2: RADICAL SIMPLIFICATION AUDIT (MINIMUM 5 MINUTES)
- [ ] Search existing codebase for similar functionality TO ELIMINATE DUPLICATION
- [ ] Identify 3+ existing components that could be CONSOLIDATED INTO ONE
- [ ] Look for unused imports, functions, or files to DELETE PERMANENTLY
- [ ] Check for duplicate patterns that can be MERGED AND SIMPLIFIED
- [ ] Count total files - goal is to REDUCE this number, not increase it

### Step 3: MINIMALIST JUSTIFICATION DOCUMENTATION
- [ ] Document WHY existing solutions cannot be SIMPLIFIED FURTHER
- [ ] List specific props/features that MUST be added (not nice-to-have)
- [ ] Explain why CONSOLIDATION with existing code is impossible
- [ ] Prove that new file creation will result in NET REDUCTION of complexity

### Step 4: AGGRESSIVE SIMPLIFICATION RULES
- [ ] MERGE existing components with new functionality instead of creating new ones
- [ ] CONSOLIDATE into existing utility files instead of creating new ones
- [ ] ELIMINATE redundant patterns and shared components through unification
- [ ] DELETE any unused code discovered during work - be ruthless
- [ ] REFACTOR complex code into simpler, more direct implementations

### Step 5: SIMPLICITY VERIFICATION (MANDATORY)
- [ ] Run `npm run enforce-components` - MUST pass enforcement rules
- [ ] Run `npm run build` - MUST pass successfully  
- [ ] Report REDUCTION in file count and component count (or explain why not)
- [ ] Confirm ELIMINATION of dead code and unused imports
- [ ] Verify overall codebase is SMALLER and SIMPLER than before

### Enforcement Thresholds (DEFINITIVE):
- **Badge violations:** 0 allowed (use SmartTagList)
- **Button violations:** 1 allowed (use Button component)
- **Card violations:** 1 allowed (use Container/AuthorCard)
- **Goal:** Eliminate ALL violations over time through consolidation

### Step 6: Build Error Prevention (CRITICAL)
- [ ] Check imports: Node.js modules → server only, DOM/hooks → client only
- [ ] Verify component boundaries: 'use client' for hooks/DOM usage
- [ ] Test build after any import changes
- [ ] Clear cache if vendor chunk errors occur

## 🚨 CRITICAL BUILD ERROR PREVENTION

### Before Adding ANY Import:
```bash
# ❌ NEVER do this in client components:
import fs from 'fs'           # Server-only
import { readFile } from 'fs' # Server-only

# ❌ NEVER do this in server components:
import { useState } from 'react'  # Client-only
'use client' missing              # Client-only hooks

# ✅ ALWAYS do this:
# Check component type first, then add appropriate imports
```

### If Build Breaks:
```bash
# Clear cache and reinstall:
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

## ❌ FORBIDDEN PATTERNS

### Never Create These:
```
AuthorCardCompact.tsx    → Use AuthorCard variant="compact"
TagListSmall.tsx        → Use SmartTagList variant="small"
ButtonSecondary.tsx     → Use Button variant="secondary"
utils/helpers.ts        → Add to utils/utils.ts
components/Badge.tsx    → Use SmartTagList
components/Card.tsx     → Use Container or AuthorCard
```

### Always Do This Instead:
```
Enhance AuthorCard.tsx with new variant prop
Extend SmartTagList.tsx with new features
Add functions to existing utils/utils.ts
Use existing shared components
```

## 📊 SUCCESS METRICS

- **Component violations:** MUST be zero (badges: 0, buttons: 0, cards: 0)
- **File count:** Should decrease or grow slower than features
- **Dead code:** Must be eliminated when discovered
- **Consolidation:** Components merged instead of created

## 🚫 STOP CONDITIONS

**STOP and consolidate immediately if you see:**
- Multiple components with similar names
- Duplicate utility functions across files
- Copy-pasted code blocks
- Single-use components that could be props
- Files with only 1-2 exports

---

**THIS IS NOT OPTIONAL. FOLLOW EVERY STEP. NO SHORTCUTS. NO EXCEPTIONS.**

---

## 🔍 MANDATORY CONTRADICTION DETECTION

**Claude MUST actively look for and REPORT these issues in the documentation:**

### Contradiction Types to Find:
- **Conflicting instructions** - Different files saying opposite things
- **Redundant explanations** - Same information repeated in multiple places  
- **Outdated information** - Instructions that no longer apply
- **Confusing hierarchies** - Unclear which document takes precedence
- **Bloated explanations** - Long explanations that could be simplified

### When Found:
1. **STOP immediately** and report the contradiction
2. **Suggest consolidation** or clarification  
3. **Do NOT proceed** until contradiction is resolved
4. **Update documentation** to eliminate confusion

### Example Contradictions to Watch For:
- **Enforcement thresholds** - Different files listing different allowances
- **Document reading order** - Multiple files claiming to be "start here"
- **Component lists** - Different files listing different shared components
- **Anti-bloat checklists** - Duplicate procedures in multiple places

**Claude is REQUIRED to be a documentation quality auditor, not just a code implementer.**
