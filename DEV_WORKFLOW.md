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
- **Badge violations:** 0 allowed (use SmartTagList)
- **Button violations:** 1 allowed (use Button component)
- **Card violations:** 1 allowed (use Container/AuthorCard)

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

### 5.2 Debugging & Troubleshooting:
- **Common enforcement errors** and solutions
- **Component extension** best practices
- **Build failure** resolution steps

### 5.3 Architectural Decision Records (Dev Perspective):
- **Tool choices** and implementation details
- **Enforcement strategy** evolution
- **Performance implications** of tooling choices
- **Maintenance overhead** considerations

## 8. Claude AI Compliance & Anti-Bloat Protocol

### 8.1 Mandatory Document Compliance
**Claude MUST follow these procedures for EVERY interaction:**

1. **READ BOTH DOCUMENTS:** Always review both REQUIREMENTS.md and DEV_WORKFLOW.md
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

### 8.4 Bloat Prevention Metrics
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

---

## 🚨 CLAUDE AI FINAL CHECKPOINT 🚨

**Before completing ANY task, Claude MUST verify:**

### ✅ Documentation Compliance Checklist:
- [ ] Read and followed REQUIREMENTS.md principles
- [ ] Read and followed DEV_WORKFLOW.md procedures
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
