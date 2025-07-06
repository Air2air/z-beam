# Claude AI Quick Compliance Reference

## 🚨 BEFORE ANY ACTION - MANDATORY CHECKLIST 🚨

### Step 1: Documentation Review (REQUIRED)
- [ ] Read REQUIREMENTS.md for architectural principles
- [ ] Read DEV_WORKFLOW.md for workflow procedures
- [ ] Understand current shared components: SmartTagList, Button, AuthorCard, Container

### Step 2: Anti-Bloat Audit (MINIMUM 5 MINUTES)
- [ ] Search existing codebase for similar functionality
- [ ] Identify 3+ existing components that could be extended
- [ ] Look for unused imports, functions, or files to delete
- [ ] Check for duplicate patterns that need consolidation

### Step 3: Justification Documentation
- [ ] Document WHY existing solutions cannot be extended
- [ ] List specific props/features that need to be added to existing components
- [ ] Explain why new file creation is absolutely necessary

### Step 4: Implementation Rules
- [ ] EXTEND existing components with new props instead of creating new ones
- [ ] ADD to existing utility files instead of creating new ones
- [ ] REUSE existing patterns and shared components
- [ ] DELETE any unused code discovered during work

### Step 5: Verification (MANDATORY)
- [ ] Run `npm run enforce-components` - MUST show zero violations
- [ ] Run `npm run build` - MUST pass successfully
- [ ] Report file count and component count changes
- [ ] Confirm no dead code remains

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
