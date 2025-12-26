# Validation Infrastructure

**Status**: Production-ready  
**Last Updated**: December 26, 2025  
**Purpose**: Comprehensive pre/post-deployment validation system with semantic naming enforcement

---

## Overview

Multi-layered validation infrastructure ensuring code quality, naming consistency, type safety, and production readiness across all deployment stages.

## Validation Layers

### Layer 1: Pre-Commit (Local Development)
**Run**: Automatically on git commit  
**Speed**: < 10 seconds  
**Focus**: Immediate feedback

```bash
# Automatic via git hooks
git commit -m "message"

# Manual execution
npm run type-check
npm run lint
```

**Checks**:
- TypeScript compilation errors
- ESLint violations
- Basic syntax validation

### Layer 2: Pre-Build (CI/CD Start)
**Run**: Before `next build` in CI/CD  
**Speed**: ~30 seconds  
**Focus**: Content + naming integrity

```bash
# Runs automatically on: npm run build
# Or manually:
npm run prebuild
```

**Checks** (via `prebuild` hook):
1. **Content Validation**: `npm run validate:content`
   - Frontmatter structure (YAML syntax, required fields)
   - Metadata sync (Materials.yaml ↔ frontmatter)
   - Naming conventions (file naming, URL patterns)
   - Sitemap integrity
   - Breadcrumb structure

2. **🆕 Semantic Naming Validation**: `npm run validate:naming:semantic`
   - ❌ No `.frontmatter` usage (should use `.metadata`)
   - ❌ Boolean props without `is/has/can/should` prefixes
   - ❌ Generic `Props` interfaces (should use `ComponentNameProps`)
   - ⚠️  Array fields with singular naming (suggestions)

3. **🆕 Type Import Validation**: `npm run validate:types`
   - ❌ Duplicate type definitions (IconProps, Author, etc.)
   - ❌ Missing imports from `@/types`
   - ℹ️  Local Props types that could be centralized

**Exit Behavior**: Build fails if critical violations found

### Layer 3: Post-Build (After Compilation)
**Run**: After `next build` completes  
**Speed**: ~15 seconds  
**Focus**: Build output validation

```bash
# Runs automatically after build
# Or manually:
npm run postbuild
```

**Checks**:
- URL structure validation
- Route generation completeness
- Static asset integrity
- Build manifest verification

### Layer 4: Post-Deployment (Production)
**Run**: After deployment to Vercel  
**Speed**: 2-5 minutes  
**Focus**: Live site validation

```bash
# Automatic via postdeploy hook
# Or manual comprehensive check:
npm run validate:production:comprehensive
```

**Checks** (comprehensive suite):
1. **SEO Infrastructure**
   - Meta tags (title, description, OG, Twitter)
   - Canonical URLs
   - Robots.txt and sitemap.xml
   - JSON-LD schema validation (15+ types)
   - Structured data richness

2. **Performance**
   - Core Web Vitals (LCP, FID, CLS)
   - TTFB and page load times
   - Asset optimization
   - Response times < 200ms

3. **Accessibility**
   - WCAG 2.2 compliance
   - ARIA attributes
   - Keyboard navigation
   - Color contrast ratios

4. **Security**
   - HTTPS enforcement
   - Security headers
   - CSP configuration
   - XSS protection

5. **Functionality**
   - Critical paths (homepage, search)
   - API endpoints
   - Form submissions
   - Error handling

---

## Semantic Naming Enforcement

### What Gets Checked

#### 1. Metadata vs Frontmatter Terminology
```typescript
// ❌ VIOLATION - Will fail prebuild
const data = article.frontmatter.title;

// ✅ CORRECT
const data = article.metadata.title;

// ✅ ALLOWED (backward compatibility in helpers)
function getMetadata(data: any) {
  return data.metadata || data.frontmatter || data;
}
```

**Why**: Standardized on "metadata" terminology across codebase. "Frontmatter" is legacy.

#### 2. Props Interface Naming
```typescript
// ❌ VIOLATION - Generic name
interface Props {
  title: string;
}

// ✅ CORRECT - Component-specific
interface ErrorBoundaryProps {
  title: string;
}
```

**Why**: Searchability, clarity, and prevents naming collisions.

#### 3. Boolean Prop Naming
```typescript
// ❌ VIOLATION (flagged as warning)
interface ButtonProps {
  disabled: boolean;
  loading: boolean;
}

// ✅ CORRECT - Descriptive prefixes
interface ButtonProps {
  isDisabled: boolean;
  isLoading: boolean;
}
```

**Why**: Self-documenting code, consistent patterns, improved readability.

#### 4. Array Field Naming
```typescript
// ⚠️  SUGGESTION - Singular name
interface Author {
  expertise: string[];  // Should be expertiseAreas or expertiseList
}

// ✅ CORRECT - Plural naming
interface Author {
  expertiseAreas: string[];
  credentialsList: string[];
}
```

**Why**: Clear indication of array type without reading type definition.

### Running Validation

```bash
# Semantic naming only
npm run validate:naming:semantic

# Type imports only
npm run validate:types

# All validations
npm run validate:all

# Pre-build check (all three)
npm run prebuild
```

### Validation Output

**Success**:
```
🔍 Semantic Naming Validation
📂 Scanning 344 TypeScript files...
✅ All semantic naming checks passed!
```

**Failure**:
```
❌ .frontmatter Usage (3 violations):
   app/utils/searchUtils.ts:42
      const title = data.frontmatter.title;
      → Use .metadata instead of .frontmatter

❌ Generic Props Names (1 violation):
   app/components/Title/Title.tsx:8
      interface Props {
      → Use TitleProps pattern

📖 See docs/08-development/NAMING_CONVENTIONS.md for guidance
```

---

## Type System Enforcement

### Centralized Types

**Location**: `types/centralized.ts` (4300+ lines)  
**Purpose**: Single source of truth for shared types

**Forbidden Redefinitions** (will fail prebuild):
- `IconProps`
- `BadgeProps`
- `CardProps`
- `ButtonProps`
- `Author`
- `ArticleMetadata`
- `GridItem`
- `MaterialProperties`
- `ContaminantProperties`

### Correct Usage

```typescript
// ✅ CORRECT - Import from centralized types
import type { Author, IconProps, BadgeProps } from '@/types';

export default function AuthorCard({ author }: { author: Author }) {
  return <Badge {...badgeProps} />;
}
```

```typescript
// ❌ VIOLATION - Local duplicate definition
interface Author {  // Duplicate! Already in @/types
  name: string;
}
```

### Running Type Validation

```bash
# Check for duplicates and missing imports
npm run validate:types

# Expected output:
# ✅ All type import checks passed!
# OR
# ❌ Found 2 type system violations
#    → scripts/migrate.ts:19 - Duplicate 'MaterialProperties'
#    → Must import from @/types
```

---

## Test Suite Integration

### Automated Tests
**Location**: `tests/naming/semantic-naming.test.ts`  
**Runs**: Part of `npm test` suite

```bash
# Run naming tests only
npm test tests/naming

# Run all tests
npm test
```

**Test Coverage**:
1. ✅ No `.frontmatter` in production code
2. ✅ Props interfaces follow `ComponentNameProps` pattern
3. ✅ Centralized types not redefined
4. ✅ Author type supports new + legacy fields
5. ✅ Helper functions support backward compatibility
6. ⚠️  Boolean naming suggestions (warns, doesn't fail)
7. ⚠️  Array field naming suggestions (warns, doesn't fail)

---

## CI/CD Integration

### Vercel Build Process

**Configuration**: `vercel.json`
```json
{
  "buildCommand": "npm run vercel-build"
}
```

**Build Flow**:
```
npm run vercel-build
  ↓
npm run validate:content      (frontmatter, metadata, naming)
  ↓
npm run validate:naming:semantic  (terminology, Props, booleans)
  ↓
npm run validate:types        (duplicates, imports)
  ↓
next build                    (TypeScript compilation)
  ↓
npm run postbuild            (URL validation)
  ↓
[Deploy to Vercel]
  ↓
npm run postdeploy           (production validation)
```

**Failure Points**:
- ❌ Invalid frontmatter → Build fails
- ❌ Semantic naming violations → Build fails
- ❌ Type duplicates → Build fails
- ❌ TypeScript errors → Build fails
- ⚠️  Post-deploy issues → Notified but doesn't rollback

### Local Development

**Pre-push validation**:
```bash
# Run full validation before pushing
npm run validate:all

# Quick check (no external calls)
npm run validate:content && npm run validate:naming:semantic && npm run validate:types
```

---

## Validation Scripts Reference

### Core Scripts

| Script | Purpose | Exit on Fail | Speed |
|--------|---------|--------------|-------|
| `validate:content` | Frontmatter, metadata, naming | ✅ Yes | ~20s |
| `validate:naming:semantic` | Terminology, Props, booleans | ✅ Yes | ~5s |
| `validate:types` | Type duplicates, imports | ✅ Yes | ~5s |
| `validate:seo-infrastructure` | Meta tags, JSON-LD, schemas | ❌ No | ~30s |
| `validate:performance` | Core Web Vitals, load times | ❌ No | ~45s |
| `validate:a11y` | WCAG 2.2 compliance | ❌ No | ~20s |
| `validate:production:comprehensive` | All production checks | ❌ No | 2-5m |

### Utility Scripts

```bash
# Clear validation cache
npm run cache:clear

# View cache statistics
npm run cache:stats

# View validation logs
npm run logs:view

# Clean old logs (>7 days)
npm run logs:clean
```

---

## Gap Analysis Summary

### ✅ Now Covered (Dec 26, 2025)

**Previously Missing, Now Enforced**:
1. ✅ **Semantic Naming**: `.frontmatter` → `.metadata` terminology
2. ✅ **Props Naming**: Generic `Props` → `ComponentNameProps`
3. ✅ **Type Duplicates**: Centralized types enforcement
4. ✅ **Import Validation**: Must import from `@/types`

**Detection Level**:
- 344 TypeScript files scanned
- Real-time validation during prebuild
- Automated test coverage
- CI/CD integration

### ⚠️ Partial Coverage (Suggestions Only)

**Detected but not enforced**:
1. ⚠️  Boolean prop naming (`loading` → `isLoading`)
2. ⚠️  Array field naming (`expertise` → `expertiseAreas`)
3. ℹ️  Local Props types that could be centralized

**Why not enforced**: Would require codebase-wide refactoring. Flagged as suggestions for gradual improvement.

### 📋 Future Enhancements

**Planned but not implemented**:
1. ESLint rules for automatic enforcement
2. VSCode extension for real-time feedback
3. Automated fix suggestions
4. GitHub Actions integration
5. Performance benchmarking dashboard

---

## Troubleshooting

### Build Failing on Semantic Naming

**Error**:
```
❌ .frontmatter Usage (1 violation):
   app/utils/helper.ts:42
```

**Fix**:
1. Find the file: `app/utils/helper.ts:42`
2. Change: `data.frontmatter.X` → `data.metadata.X`
3. Verify: `npm run validate:naming:semantic`
4. Rebuild: `npm run build`

### Build Failing on Type Duplicates

**Error**:
```
❌ Duplicate Type Definitions (1 violation):
   scripts/migrate.ts:19 - Duplicate 'Author'
```

**Fix**:
1. Remove local definition
2. Add import: `import type { Author } from '@/types';`
3. Verify: `npm run validate:types`
4. Rebuild: `npm run build`

### Tests Failing on Naming

**Error**:
```
Test failed: production code should use .metadata not .frontmatter
```

**Fix**:
1. Check which file: Read test output
2. Update terminology
3. Rerun tests: `npm test tests/naming`

### Validation Cache Issues

**Symptoms**: Old validation results, false positives

**Fix**:
```bash
npm run cache:clear
npm run validate:all
```

---

## Performance Impact

**Validation Overhead**:
- Pre-build: +30 seconds (content + naming + types)
- Post-build: +15 seconds (URLs)
- Post-deploy: +2-5 minutes (comprehensive, async)

**Total CI/CD Time**:
- Without validation: ~45 seconds
- With validation: ~90 seconds
- Post-deploy: Runs async, doesn't block

**Caching**:
- Content validation: 80% cache hit rate
- Saves: ~15 seconds on unchanged files
- Cache TTL: 24 hours

---

## Maintenance

### Adding New Checks

1. **Create validation script**: `scripts/validation/validate-[name].js`
2. **Add to package.json**: `"validate:[name]": "node scripts/validation/validate-[name].js"`
3. **Integrate**: Add to `prebuild` or relevant hook
4. **Test**: `npm run validate:[name]`
5. **Document**: Update this file

### Updating Existing Checks

1. **Modify script**: Edit `scripts/validation/validate-[name].js`
2. **Test locally**: Run validation on sample files
3. **Update tests**: Add/modify tests in `tests/naming/`
4. **Update docs**: Document new patterns/rules
5. **Deploy**: Merge to main (runs in CI/CD)

### Monitoring Validation Health

```bash
# Check validation script status
npm run validate:all

# View recent logs
npm run logs:view

# Check cache performance
npm run cache:stats
```

---

## Related Documentation

- **Naming Conventions**: [NAMING_CONVENTIONS.md](./NAMING_CONVENTIONS.md)
- **Type Consolidation**: [TYPE_CONSOLIDATION_DEC21_2025.md](./TYPE_CONSOLIDATION_DEC21_2025.md)
- **Backend Metadata**: [../reference/BACKEND_METADATA_SPEC.md](../reference/BACKEND_METADATA_SPEC.md)
- **Deployment**: [../deployment/DEPLOYMENT_GUIDE.md](../deployment/DEPLOYMENT_GUIDE.md)

---

## Summary

**Validation Infrastructure Status**: ✅ **Production-Ready**

**Coverage**:
- ✅ Content integrity (frontmatter, metadata, naming)
- ✅ Semantic naming enforcement (terminology, Props, types)
- ✅ Type system integrity (duplicates, imports)
- ✅ SEO & performance (schemas, Core Web Vitals)
- ✅ Accessibility (WCAG 2.2)
- ✅ Security (headers, HTTPS)

**Deployment Safety**: 4-layer validation (pre-commit → pre-build → post-build → post-deploy)

**Enforcement**: Critical violations fail build, suggestions logged but don't block

**Next Steps**: Gradual migration of warnings to errors as codebase compliance improves
