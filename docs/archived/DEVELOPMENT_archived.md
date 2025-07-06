# Z-Beam Development Workflow & Tooling

> **🚨 CRITICAL:** This document MUST be used together with [REQUIREMENTS.md](./REQUIREMENTS.md)
> 
> **⚠️ CLAUDE DIRECTIVE:** You are REQUIRED to follow BOTH documents at EVERY stage. Before ANY action:
> 1. ✅ Check REQUIREMENTS.md for architectural principles
> 2. ✅ Check this document for workflow procedures  
> 3. ✅ Execute anti-bloat checklist from REQUIREMENTS.md
> 4. ✅ Run enforcement tools from this document
> 
> **NO EXCEPTIONS. NO SHORTCUTS. NO BLOAT.**

## 1. Automated Enforcement System 🛡️

### 1.1 Build-Time Enforcement
The build system automatically fails when component duplication violations are detected:

```bash
npm run enforce-components  # Runs before build
npm run build              # Includes enforcement check
```

### 1.2 Git Hooks & CI/CD
- **Pre-commit hook:** Prevents commits with violations
- **GitHub Actions:** Blocks PRs with duplication issues
- **Safety bypass:** Emergency override with detailed logging

### 1.3 Enforcement Thresholds
See [CLAUDE_COMPLIANCE.md](./CLAUDE_COMPLIANCE.md) for current enforcement thresholds and violation allowances.

### 1.4 Universal Enforcement Script Maintenance 🔧

**CRITICAL:** Enforcement scripts MUST be updated whenever ANY shared component changes.

#### When to Update enforce-component-rules.js:
- ✅ **After modifying ANY shared component** (SmartTagList, Button, Container, AuthorCard, etc.)
- ✅ **After changing ANY component styling patterns** (colors, classes, layouts, etc.)  
- ✅ **After adding/removing ANY shared components**
- ✅ **After discovering missed violations** (ANY component duplication)
- ✅ **After changing utility functions** (date formatting, slugs, etc.)

#### Universal Update Process:
```bash
# 1. Identify new patterns that should be violations (ANY component type)
grep -r "new-pattern-to-detect" app/ --exclude-dir=components

# 2. Add patterns to VIOLATION_PATTERNS in enforce-component-rules.js
# 3. Set appropriate thresholds (usually 0 for critical violations)
# 4. Update EXCLUDED_FILES only for legitimate shared components
# 5. Test enforcement works
npm run enforce-components

# 6. Verify it catches actual violations (test with ALL component types)
echo "px-4 py-2 bg-blue-600 hover:" > temp-button-violation.tsx
echo "bg-white rounded-lg shadow-" > temp-card-violation.tsx  
echo "px-3 py-1 rounded-full bg-" > temp-tag-violation.tsx
npm run enforce-components  # Should fail for all
rm temp-*-violation.tsx
```

#### Universal Enforcement Gaps:
```javascript
// ❌ BAD: Patterns too specific - miss variations
'bg-blue-100.*text-blue-800'        // Misses bg-purple-600, bg-green-500, etc.
'px-4 py-2 bg-blue-600'             // Misses other button colors

// ✅ GOOD: Broader patterns catch ALL variations  
'bg-.*-600.*text-white'             // Catches ALL solid color schemes
'px-4 py-2.*bg-.*-600.*hover:'      // Catches ALL button patterns
'bg-white.*rounded-lg.*shadow-'     // Catches ALL card patterns

// ❌ BAD: Threshold > 0 for ANY critical violations
BUTTON_DUPLICATION_MAX: 1           // Should be 0
CARD_DUPLICATION_MAX: 1             // Should be 0

// ✅ GOOD: Zero tolerance for ALL duplication
ALL_DUPLICATION_MAX: 0              // No exceptions for ANY component
```

#### Universal Enforcement Maintenance Checklist:
- [ ] **File existence checks** - Verify NO duplicate component files exist (ANY type)
- [ ] **Pattern coverage** - Ensure ALL styling patterns are detected (buttons, cards, tags, etc.)
- [ ] **Function signature detection** - Catch duplicate utility functions (ANY function)
- [ ] **Zero tolerance validation** - ALL critical violations have threshold 0
- [ ] **Exclusion list accuracy** - Only legitimate shared components excluded
- [ ] **Cross-component detection** - Patterns catch variations across component types

**🚨 UNIVERSAL MANDATE: Update enforcement IMMEDIATELY after ANY component/function/styling changes.**

## 2. Development Workflow

### 2.1 Before Creating Components:
1. **Search** existing components with similar functionality
2. **Review** shared component capabilities
3. **Extend** existing components if possible
4. **Document** why new component is necessary
5. **Plan** future consolidation opportunities

### 2.2 Component Creation Safety:
```bash
# Use safe creation tools
node safe-component-creation.js ComponentName
node safe-component-extension.js ExistingComponent
```

### 2.3 Regular Audits:
```bash
./quick-audit.sh           # Quick violation check
./audit-components.sh      # Comprehensive audit
npm run enforce-components # Full enforcement run
```

## 3. Development Tools & Scripts

### 3.1 Enforcement Commands:
```bash
npm run enforce-components  # Check violations
./quick-audit.sh           # Quick check
npm run build              # Includes enforcement
```

### 3.2 Safety Tools:
```bash
node safe-component-creation.js ComponentName
node safe-component-extension.js ExistingComponent
node find-component-to-extend.js "pattern_name"
```

### 3.3 Quick Reference Commands:
```bash
# Component usage examples
<SmartTagList tags={tags} variant="compact" linkable={false} />
<Button variant="primary" onClick={handler}>Click me</Button>
<AuthorCard author={author} variant="compact" showArticleCount={true} />
<Container padding="md" shadow="lg" sticky={true}>Content</Container>
```

## 4. Success Metrics & Tracking

### 4.1 Enforcement Metrics:
- **Violation count reduction** over time
- **Successful build rates** without bypasses
- **Component consolidation** achievements

### 4.2 Code Quality Metrics:
- **Reduced duplication patterns** (tracked by enforcement)
- **Improved maintainability** through shared components
- **Faster development** via component reuse

### 4.3 Recent Achievements:
- ✅ Eliminated AuthorCard duplication through optimization
- ✅ Reduced card violations from 3 to 2 through Container component
- ✅ Consolidated badge patterns into SmartTagList
- ✅ Implemented optimization-first architectural principle
- ✅ Enhanced AuthorCard with variants instead of creating new components

## 5. Development Documentation Standards

### 5.1 Tooling Documentation:
- **Setup scripts** and their usage
- **Enforcement tool** configuration
- **Build process** integration
- **CI/CD pipeline** setup

### 5.2 Common Claude Build Errors & Solutions:

#### 🚨 CRITICAL BUILD ERRORS CLAUDE FREQUENTLY CAUSES:

**1. Client/Server Boundary Violations**
```bash
# Error: "useState/useEffect in Server Component"
# Cause: Claude adds client hooks to server components
# Solution: Add 'use client' directive or move to client component
```

**2. Module Import Errors**
```bash
# Error: "Cannot find module 'fs'" in client components
# Cause: Claude imports Node.js modules in client-side code
# Solution: Move server-only imports to server components
```

**3. Framer Motion Build Issues**
```bash
# Error: "Cannot find module './vendor-chunks/framer-motion.js'"
# Cause: Build cache corruption with animation dependencies
# Solution: Clear .next cache, reinstall dependencies
rm -rf .next node_modules package-lock.json && npm install
```

**4. Type Import Conflicts**
```bash
# Error: "Cannot resolve type-only import"
# Cause: Claude mixes type and value imports incorrectly
# Solution: Use proper import syntax
import type { TypeName } from 'module'  # Types only
import { valueName } from 'module'      # Values only
```

**5. Circular Dependency Errors**
```bash
# Error: "Cannot access before initialization"
# Cause: Claude creates circular imports between components
# Solution: Extract shared types/utils to separate files
```

**6. Hydration Mismatches**
```bash
# Error: "Hydration failed because initial UI does not match"
# Cause: Claude adds conditional rendering that differs server/client
# Solution: Use useEffect for client-only content or suppressHydrationWarning
```

**7. Dynamic Import Failures**
```bash
# Error: "Cannot resolve dynamic import"
# Cause: Claude uses dynamic imports incorrectly in SSR context
# Solution: Use next/dynamic with proper SSR configuration
```

**8. CSS-in-JS Server Errors**
```bash
# Error: "document is not defined" with styled-components
# Cause: Claude uses client-only styling libraries in server components
# Solution: Configure SSR properly or move to client components
```

#### 🛠️ CLAUDE ERROR PREVENTION RULES:

**Before Adding Any Import:**
- [ ] Check if import is Node.js specific (fs, path, crypto) → Server component only
- [ ] Check if import uses DOM APIs (document, window) → Client component only
- [ ] Verify import exists and is properly typed
- [ ] Test in both development and build modes

**Before Adding Client Features:**
- [ ] Ensure component has 'use client' directive
- [ ] Check for server-only imports that need removal
- [ ] Verify hooks are only used in client components
- [ ] Test hydration by checking server/client render consistency

**Before Modifying Components:**
- [ ] Check for existing patterns in codebase
- [ ] Verify type compatibility
- [ ] Test build after each change
- [ ] Run enforcement checks

### 5.3 Debugging & Troubleshooting:
- **Component extension** best practices
- **Build failure** resolution steps
- **Error pattern recognition** and prevention

### 5.3 Architectural Decision Records (Dev Perspective):
- **Tool choices** and implementation details
- **Enforcement strategy** evolution
- **Performance implications** of tooling choices
- **Maintenance overhead** considerations

## 8. Claude AI Compliance & Anti-Bloat Protocol

### 8.1 Mandatory Document Compliance
**Claude MUST follow these procedures for EVERY interaction:**

1. **READ BOTH DOCUMENTS:** Always review both REQUIREMENTS.md and DEVELOPMENT.md
2. **EXECUTE CHECKLISTS:** Complete all relevant checklists before taking action
3. **AUDIT FIRST:** Spend minimum 5 minutes auditing existing code before creating anything
4. **JUSTIFY DECISIONS:** Document why existing solutions cannot be extended/optimized
5. **MEASURE IMPACT:** Track reductions in file count, component count, and violations

### 8.2 Anti-Bloat Enforcement for Claude
**These are NON-NEGOTIABLE requirements for Claude AI:**

#### Before Creating ANY New Code:
- [ ] **AUDIT PHASE:** Search codebase for similar functionality (minimum 5 minutes)
- [ ] **CONSOLIDATION CHECK:** Identify 3+ existing components that could be extended instead
- [ ] **DELETION SWEEP:** Remove any unused imports, functions, or files discovered
- [ ] **EXTENSION ANALYSIS:** Document why existing components cannot be enhanced
- [ ] **BLOAT JUSTIFICATION:** Write clear explanation of why new code is necessary

#### During Code Creation:
- [ ] **REUSE EXISTING:** Use existing components, utils, and patterns wherever possible
- [ ] **MINIMIZE FILES:** Add to existing files rather than creating new ones
- [ ] **SHARED PATTERNS:** Extract common patterns into existing shared components
- [ ] **IMMEDIATE CLEANUP:** Delete any code that becomes redundant

#### After Code Creation:
- [ ] **CONSOLIDATION PLAN:** Document how new code will be merged with existing patterns
- [ ] **ENFORCEMENT CHECK:** Run `npm run enforce-components` to verify zero violations
- [ ] **BLOAT MEASUREMENT:** Report on file count and component count changes
- [ ] **CLEANUP VERIFICATION:** Confirm no unused code remains

### 8.3 Forbidden Patterns for Claude
**Claude is FORBIDDEN from creating these bloat patterns:**

#### ❌ NEVER CREATE:
```bash
# Variant components when base component exists
AuthorCardCompact.tsx     # Use AuthorCard with variant prop
TagListSmall.tsx         # Use SmartTagList with variant prop
ButtonSecondary.tsx      # Use Button with variant prop

# Utility files when existing utils exist
utils/helpers.ts         # Add to existing utils/utils.ts
utils/dateHelpers.ts     # Add to existing utils/utils.ts
utils/stringHelpers.ts   # Add to existing utils/utils.ts

# Duplicate implementations
components/Badge.tsx     # Use SmartTagList component
components/Tag.tsx       # Use SmartTagList component
components/Card.tsx      # Use Container or AuthorCard
```

#### ✅ ALWAYS DO INSTEAD:
```bash
# Extend existing components with new props
AuthorCard.tsx           # Add variant="compact" prop
SmartTagList.tsx         # Add variant="small" prop  
Button.tsx               # Add variant="secondary" prop

# Enhance existing utilities
utils/utils.ts           # Add new helper functions here
app/components/          # Enhance existing components
```

### 8.4 Claude Error Prevention Protocol

**MANDATORY checks Claude MUST perform before ANY code changes:**

#### Import Safety Checklist:
- [ ] **Node.js imports** (fs, path, crypto) → Only in server components
- [ ] **DOM imports** (document, window) → Only in client components with 'use client'
- [ ] **React hooks** (useState, useEffect) → Only in client components
- [ ] **Type imports** → Use `import type { }` syntax
- [ ] **Circular dependencies** → Check existing imports before adding new ones

#### Component Boundary Checklist:
- [ ] **Server components** → No hooks, no DOM APIs, no client-only libraries
- [ ] **Client components** → Must have 'use client', no server-only imports
- [ ] **Shared components** → Check if used in both contexts, plan accordingly
- [ ] **Hydration consistency** → Ensure server and client render the same content

#### Build Safety Checklist:
- [ ] **Test build** after every import addition: `npm run build`
- [ ] **Clear cache** if animation/vendor chunk errors: `rm -rf .next`
- [ ] **Verify types** with TypeScript: Check for type errors
- [ ] **Run enforcement** after changes: `npm run enforce-components`

#### Emergency Recovery Steps:
```bash
# If build breaks with vendor chunk errors:
rm -rf .next node_modules package-lock.json
npm install
npm run build

# If hydration errors occur:
# Add suppressHydrationWarning={true} temporarily
# Then fix root cause with proper client/server separation
```

### 8.5 Bloat Prevention Metrics
**Claude must track and report these metrics:**

- **File count changes:** Should decrease or grow slower than features
- **Component violations:** Must remain at zero (badges: 0, buttons: 0, cards: 0)
- **Dead code removed:** Lines of unused code eliminated
- **Consolidation wins:** Components merged or extended instead of created

### 8.5 Emergency Bloat Detection
**If Claude detects ANY of these, STOP and consolidate immediately:**

- Multiple components with similar names (Card, CardItem, CardContainer)
- Duplicate utility functions across files
- Components with single-use cases that could be props on existing components
- Files with only 1-2 exports that could be merged
- Copy-pasted code blocks across components

---

## 9. File Structure for Dev Tools

```
project-root/
├── component-enforcement.config.js    # Enforcement rules
├── safe-component-creation.js         # Safe creation tool
├── safe-component-extension.js        # Extension tool
├── find-component-to-extend.js        # Component discovery
├── quick-audit.sh                     # Quick audit script
├── audit-components.sh                # Full audit script
├── .github/workflows/                 # CI/CD workflows
│   └── enforce-components.yml
├── .githooks/                         # Git hooks
│   └── pre-commit
└── docs/                              # Dev documentation
    ├── ENFORCEMENT_GUIDE.md
    ├── COMPONENT_CREATION.md
    └── TROUBLESHOOTING.md
```

## 10. Emergency Procedures

### 10.1 Enforcement Bypass:
```bash
# Only use in emergencies with detailed justification
BYPASS_ENFORCEMENT=true npm run build
```

### 10.2 Quick Fixes:
```bash
# Fix common violations quickly
./quick-fix-violations.sh
```

### 10.3 Rollback Strategy:
- **Immediate rollback** if enforcement breaks build
- **Gradual enforcement** for large refactors
- **Documentation** of bypass usage and reasoning

---

## Quick Development Checklist

### Before Any Component Work:
- [ ] Run `./quick-audit.sh` to check current state
- [ ] Search existing components for similar functionality
- [ ] Review shared component capabilities
- [ ] Plan extension over creation

### Before Committing:
- [ ] Run `npm run enforce-components`
- [ ] Ensure all tests pass
- [ ] Document any architectural decisions
- [ ] Update relevant documentation

### Regular Maintenance:
- [ ] Weekly audit runs
- [ ] Monitor enforcement metrics
- [ ] Update tooling as needed
- [ ] Review and optimize existing tools

## 11. Modify-First Component Development System

### 11.1 Core Principle
> **MODIFY BEFORE CREATE**: Always extend existing components instead of creating new ones.

### 11.2 How the System Works

#### Detection Phase
The enforcement system automatically:
- **Scans for hardcoded UI patterns** (badges, buttons, cards, etc.)
- **Detects component duplication** across the codebase
- **Fails builds** when violations are found
- **Provides specific suggestions** for extending existing components

#### Guidance Phase  
When violations are detected, the system provides:
- **Specific component extension suggestions** with examples
- **Available component checks** (does the suggested component exist?)
- **Guided extension instructions** with code templates
- **Alternative component searches** if the suggested one doesn't exist

#### Tool-Assisted Development
```bash
# Component finder tool
node find-component-to-extend.js "pattern_name"

# Safe component creation (when absolutely necessary)
node safe-component-creation.js ComponentName

# Component extension helper
node safe-component-extension.js ExistingComponent
```

### 11.3 Safety Mechanisms

#### Automatic Exclusions
Shared components are automatically excluded from enforcement:
- `app/components/Button.tsx` - shared component (SHOULD have button patterns)
- `app/components/SmartTagList.tsx` - shared component (SHOULD have badge patterns)  
- `app/components/AuthorCard.tsx` - shared component (SHOULD have card patterns)
- `app/components/Container.tsx` - shared component (SHOULD have card patterns)

#### Safe Component Creation Process
```bash
# Creates component with proper structure and adds to exclusions automatically
npm run create:component MyComponent
node safe-component-creation.js MyComponent
```

**What it does:**
1. ✅ Checks for similar existing components (prevents duplication)
2. ✅ Generates safe component template with variants
3. ✅ Automatically adds to exclusion list
4. ✅ Tests enforcement system to ensure no issues

## 12. Utility Functions Organization

### 12.1 File Structure
Utilities are organized into domain-specific modules in `/app/utils/`:

- **`utils.ts`** - Main entry point that re-exports all utilities
- **`formatting.ts`** - Text and date formatting functions
- **`validation.ts`** - Form and data validation helpers
- **`helpers.ts`** - Common React and UI helper functions
- **`metadata.ts`** - MDX frontmatter and metadata parsing
- **`mdx.ts`** - MDX file reading and processing
- **`constants.ts`** - Application constants and configuration

### 12.2 Usage Guidelines
- **Extend existing utility files** instead of creating new ones
- **Add functions to appropriate domain modules** (formatting, validation, etc.)
- **Re-export through main utils.ts** for consistent imports
- **Document new functions** with JSDoc comments

### 12.3 Common Utility Patterns
```typescript
// Use domain-specific imports for internal usage
import { formatDate } from './formatting'

// Use main entry point for component imports  
import { formatDate, slugify } from 'app/utils/utils'
```

---

## 🚨 CLAUDE AI FINAL CHECKPOINT 🚨

**Before completing ANY task, Claude MUST verify:**

### ✅ Documentation Compliance Checklist:
- [ ] Read and followed REQUIREMENTS.md principles
- [ ] Read and followed DEVELOPMENT.md procedures
- [ ] Completed anti-bloat audit (minimum 5 minutes)
- [ ] Justified any new code creation with documentation
- [ ] Extended existing components instead of creating new ones

### ✅ Enforcement Verification:
- [ ] Ran `npm run enforce-components` with zero violations
- [ ] Confirmed build passes with `npm run build`
- [ ] Removed any unused code discovered during work
- [ ] Tracked and reported file/component count changes

### ✅ Bloat Prevention Confirmation:
- [ ] No new files created without exhaustive justification
- [ ] All new functionality added to existing files where possible
- [ ] Component count decreased or remained same
- [ ] Dead code eliminated during work session

**IF ANY CHECKBOX ABOVE IS UNCHECKED, CLAUDE MUST STOP AND COMPLETE THE MISSING STEP.**

**This is not optional. This is mandatory. No exceptions.**
