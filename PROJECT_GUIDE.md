# Z-Beam Project Guide

> **Single Source of Truth** - Complete project guidance in one file

## 1. Core Principles

### Simplicity First
- **Optimize before creating** - Always extend existing code first
- **Zero component duplication** - Each UI pattern exists once
- **Smallest codebase wins** - Fewer files, less complexity, easier maintenance

### Component Reuse
- **SmartTagList** - All tags/badges
- **Button** - All button variations  
- **AuthorCard** - All author displays
- **Container** - Basic card containers

Extend these with props rather than creating new components.

## 2. Development Workflow

### Before Any Changes
```bash
npm run enforce-components
npm run build
```

### Component Creation
1. Check if existing components can be extended
2. Update enforcement patterns if needed
3. Test enforcement works

### Common Commands
```bash
# Development
npm run dev          # Start with pre-checks and port management
npm run ready        # Check development readiness
npm run clear-cache  # Fix webpack cache issues

# Validation
npm run enforce-components  # Check component rules
npm run validate:guide     # Validate this document
npm run build             # Full build with all checks
```

## 3. Enforcement Rules

### Zero Tolerance Violations
- Component duplication: **0 allowed**
- Badge/tag hardcoding: **0 allowed**  
- Button/card hardcoding: **1 allowed**

### Forbidden Patterns
```typescript
// ❌ Don't create these
TagList.tsx, TagDirectory.tsx     → Use SmartTagList
Badge.tsx, ButtonPrimary.tsx      → Use existing components
helpers.ts, utils-new.ts          → Add to utils/utils.ts
```

### Required Patterns
```typescript
// ✅ Extend existing components
<SmartTagList tags={tags} variant="compact" />
<Button variant="secondary" size="small" />
<AuthorCard layout="compact" showTags={false} />
```

## 4. Error Resolution

### Build Failures
- **Component violations:** Run `npm run enforce-components` for details
- **TypeScript errors:** Run `npx tsc --noEmit` for details
- **Webpack cache:** Run `npm run fix-webpack` to clear corrupted cache

### Common Webpack Errors
- "Cannot read properties of undefined (reading 'hasStartTime')" → `npm run fix-webpack`
- "Restoring pack from webpack cache failed" → `npm run fix-webpack`

## 5. File Organization

### Keep Minimal
- **Single component per file** with clear, descriptive names
- **Shared utilities** in `utils/utils.ts` (not scattered)
- **Clean imports** and consistent structure

### Archive/Delete
- Unused components immediately
- Duplicate utilities 
- Old documentation files (moved to `docs/archived/`)

---

**This guide is validated by the build pipeline. Line count target: <300 lines.**
