# Test Coverage & Deployment Scripts Gap Analysis

**Date**: December 20, 2025  
**Current State**: 90 test files, 39,089 lines of test code, 29.6% coverage  
**Status**: ⚠️ **Gaps Identified** - Action required

---

## 📊 Executive Summary

### Overall Health Score: **C+ (78/100)**

| Category | Score | Status | Priority |
|----------|-------|--------|----------|
| **Test Coverage** | 29.6% | ⚠️ Below target (70%) | 🔴 HIGH |
| **Test Infrastructure** | 90% | ✅ Good | 🟢 LOW |
| **Pre-Deploy Checks** | 85% | ✅ Good | 🟡 MEDIUM |
| **Post-Deploy Validation** | 70% | ⚠️ Incomplete | 🔴 HIGH |
| **Component Test Ratio** | 20% | 🔴 Poor (32/162) | 🔴 HIGH |

---

## 🔬 Test Coverage Analysis

### Current Coverage (from coverage-summary.json)

```
Total Coverage: 29.6%
├── Lines:       29.61% (2,116/7,146)
├── Statements:  29.38% (2,267/7,716)
├── Functions:   25.52% (392/1,536)
└── Branches:    22.91% (1,669/7,283)
```

**Target**: 70% coverage minimum  
**Gap**: 40.4% coverage gap (-2,888 lines)

### ✅ Well-Tested Areas (>70% coverage)

1. **Utilities** (`app/utils/`)
   - `layoutHelpers.ts`: 100% (8/8 getRiskColor tests)
   - `gridConfig.ts`: High coverage
   - Helper functions: Generally well-tested

2. **Type System** (`types/centralized.ts`)
   - Type definitions: Compile-time checked
   - Well-documented

3. **Validation Scripts** (`scripts/validation/`)
   - Content validation: Comprehensive
   - SEO infrastructure: Tested
   - Breadcrumb validation: Complete

### ❌ Poorly Tested Areas (<30% coverage)

1. **🔴 CRITICAL: Components (20% test ratio)**
   ```
   Components: 162 files
   Tests:      32 files
   Ratio:      20% (32/162)
   
   Missing Tests:
   - SafetyOverview.tsx        ❌ 0% coverage
   - RiskCard.tsx              ❌ 0% coverage
   - InfoCard.tsx              ❌ 0% coverage
   - SafetyDataPanel.tsx       ❌ 0% coverage
   - 130+ other components     ❌ No tests
   ```

2. **🔴 CRITICAL: Page Components**
   - `app/page.tsx`: 36.36% coverage
   - `app/about/page.tsx`: 0% coverage
   - `app/error.tsx`: 0% coverage
   - `app/not-found.tsx`: 0% coverage

3. **🔴 CRITICAL: SEO & Metadata**
   - `app/sitemap.ts`: 0% coverage
   - `app/web-vitals.ts`: 0% coverage
   - Metadata generation: Untested

4. **⚠️ HIGH PRIORITY: Safety Components** (Recently added, no tests)
   - RiskCard component: No tests
   - InfoCard component: No tests
   - SafetyOverview: No tests
   - SafetyDataPanel: No tests
   - getRiskColor: ✅ 8/8 tests (ONLY tested safety code)

---

## 🚀 Pre-Deploy Scripts Analysis

### ✅ Strengths

**Comprehensive Validation Suite** (package.json):
```json
"prebuild": "npm run validate:content && npm run generate:datasets && npm run fix:dataset-urls"
```

**Available Pre-Deploy Checks** (15 scripts):
1. ✅ `validate:content` - Frontmatter structure, naming
2. ✅ `validate:frontmatter` - YAML syntax, required fields
3. ✅ `validate:metadata` - Metadata completeness
4. ✅ `validate:naming` - File naming conventions
5. ✅ `validate:breadcrumbs` - Breadcrumb structure
6. ✅ `validate:seo-infrastructure` - JSON-LD, meta tags
7. ✅ `validate:a11y` - Accessibility checks
8. ✅ `validate:performance` - Performance metrics
9. ✅ `validate:urls` - URL integrity
10. ✅ `validate:schemas:live` - Schema.org validation
11. ✅ `datasets:quality` - Dataset quality reports
12. ✅ `datasets:check` - Dataset sync verification
13. ✅ `verify:sitemap` - Sitemap generation
14. ✅ `cache:stats` - Validation cache health
15. ✅ `fix:dataset-urls` - Automatic URL fixes

**Deployment Scripts** (8 scripts):
- `scripts/deployment/smart-deploy.sh` - Full deployment with monitoring (286 lines)
- `scripts/deployment/deploy-with-validation.sh` - Validation + deploy (17KB)
- `scripts/deployment/deploy-and-validate.sh` - Deploy + post-checks
- `scripts/deployment/deploy-monitored.js` - Real-time monitoring
- `scripts/deployment/quick-deploy.sh` - Fast deployment
- `scripts/deployment/deploy.sh` - Basic deployment
- `scripts/deployment/deploy-prod.sh` - Production-specific
- `scripts/deployment/validate-jsonld-quality.sh` - JSON-LD validation

### ⚠️ Gaps & Issues

#### Gap 1: No Safety Component Validation
**Missing**: Pre-deploy checks for safety schema compliance
```bash
❌ Missing: validate:safety-schema
   Purpose: Verify all safety components use SAFETY_RISK_SEVERITY_SCHEMA.md
   Check: Risk fields (fire_explosion_risk, toxic_gas_risk, visibility_hazard)
   Validate: Dual format support (string vs nested object)
```

**Proposed Script**: `scripts/validation/validate-safety-schema.js`
```javascript
// Check all contaminants/materials for:
// 1. Required safety fields present
// 2. Severity values valid (critical|high|moderate|medium|low|none)
// 3. PPE requirements complete
// 4. Ventilation data present
// 5. Particulate data valid (0.0-1.0, size ranges)
```

#### Gap 2: Component Test Coverage Check
**Missing**: Pre-deploy test that fails if <30% component test ratio
```bash
❌ Missing: validate:component-test-ratio
   Purpose: Ensure minimum component test coverage
   Threshold: 30% minimum (32/162 = 20% currently FAILS)
   Action: Fail build if ratio drops below threshold
```

#### Gap 3: Coverage Regression Protection
**Current**: Coverage thresholds exist but are commented out
```javascript
// jest.config.js - Line 177
// Don't fail on coverage threshold errors - we prioritize working deployments
```

**Issue**: No enforcement means coverage can silently degrade  
**Fix**: Enable thresholds with reasonable targets:
```javascript
coverageThreshold: {
  global: {
    branches: 20,    // Currently 22.91%
    functions: 25,   // Currently 25.52%
    lines: 29,       // Currently 29.61%
    statements: 29   // Currently 29.38%
  }
}
```

---

## 📋 Post-Deploy Validation Analysis

### ✅ Strengths

**Post-Deploy Hook Exists** (package.json):
```json
"postdeploy": "npm run validate:production"
```

**Production Validation Scripts** (3 levels):
1. ✅ `validate:production` - Standard production checks
2. ✅ `validate:production:simple` - Quick smoke tests
3. ✅ `validate:production:enhanced` - Comprehensive validation

### ⚠️ Gaps & Issues

#### Gap 1: No Safety Component Live Testing
**Missing**: Post-deploy verification of safety display
```bash
❌ Missing: validate:production:safety-components
   Purpose: Verify safety components render correctly in production
   Tests:
   - Load /materials/aluminum-laser-cleaning
   - Verify RiskCard displays fire_explosion_risk
   - Verify InfoCard displays PPE requirements
   - Check unified safety grid layout
   - Test contaminants safety display
```

#### Gap 2: Search Results URL Verification
**Missing**: Post-deploy check for search result URLs (recently fixed bug)
```bash
❌ Missing: validate:production:search-urls
   Purpose: Verify search results link to correct nested paths
   Tests:
   - Search for "Aluminum"
   - Verify URL = /materials/metal/non-ferrous/aluminum-laser-cleaning
   - NOT /Aluminum (flat URL bug from Dec 20)
```

#### Gap 3: No Performance Budget Enforcement
**Current**: Performance validation exists but doesn't fail build
**Issue**: Slow pages can deploy without warnings

**Proposed**: Add performance budgets:
```javascript
// Performance thresholds
{
  FCP: 1.8s,   // First Contentful Paint
  LCP: 2.5s,   // Largest Contentful Paint
  TBT: 200ms,  // Total Blocking Time
  CLS: 0.1,    // Cumulative Layout Shift
}
```

---

## 🎯 Prioritized Action Plan

### Week 1: High Priority (Critical Gaps)

#### Action 1: Safety Component Tests (8 hours)
**Goal**: Achieve test coverage for safety components

**New Test Files**:
```
tests/components/SafetyOverview.test.tsx
tests/components/RiskCard.test.tsx
tests/components/InfoCard.test.tsx
tests/components/SafetyDataPanel.test.tsx
```

**Test Cases** (minimum 40 tests):
1. **RiskCard.test.tsx** (12 tests)
   - ✅ Renders with all 6 severity levels
   - ✅ Applies correct color classes (red, yellow, green, gray)
   - ✅ Handles case-insensitive severity
   - ✅ Displays icon and label correctly

2. **InfoCard.test.tsx** (10 tests)
   - ✅ Renders with structured data array
   - ✅ Handles PPE requirements format
   - ✅ Handles ventilation format
   - ✅ Handles particulate data format

3. **SafetyOverview.test.tsx** (12 tests)
   - ✅ Handles simple string risk format (materials)
   - ✅ Handles nested object risk format (contaminants)
   - ✅ Extracts severity from nested objects
   - ✅ Renders unified 3-column grid
   - ✅ Displays all 3 RiskCards when data present
   - ✅ Displays all InfoCards when data present

4. **SafetyDataPanel.test.tsx** (6 tests)
   - ✅ Matches SafetyOverview behavior
   - ✅ Includes compound safety grid

**Command to create**:
```bash
npm run test:components -- --testNamePattern="Safety|Risk|Info"
```

**Expected Coverage Increase**: +5% overall, 80%+ for safety components

#### Action 2: Enable Coverage Thresholds (30 minutes)
**Edit**: `jest.config.js`

```javascript
// BEFORE (Line 177):
// Don't fail on coverage threshold errors - we prioritize working deployments

// AFTER:
coverageThreshold: {
  global: {
    branches: 20,    // Floor at current 22.91%
    functions: 23,   // Floor at current 25.52%
    lines: 27,       // Floor at current 29.61%
    statements: 27   // Floor at current 29.38%
  }
},
```

**Impact**: Prevents coverage regression, fails CI if coverage drops

#### Action 3: Add Safety Schema Validation (2 hours)
**Create**: `scripts/validation/validate-safety-schema.js`

**Checks**:
1. All materials/contaminants have safety_data
2. Risk severity values are valid
3. PPE requirements complete (respiratory, eye, skin)
4. Ventilation data present for moderate+ risks
5. Particulate data valid (fraction 0.0-1.0)

**Integration**: Add to `prebuild` script
```json
"prebuild": "npm run validate:content && npm run validate:safety-schema && npm run generate:datasets && npm run fix:dataset-urls"
```

### Week 2: Medium Priority (Coverage Gaps)

#### Action 4: Component Test Ratio Check (1 hour)
**Create**: `scripts/validation/validate-component-test-ratio.js`

**Logic**:
```javascript
const components = findComponents('app/components');
const tests = findTests('tests/components');
const ratio = tests.length / components.length;

if (ratio < 0.30) {
  throw new Error(`Component test ratio ${ratio} below 30% threshold`);
}
```

**Integration**: Add to `test:ci` script

#### Action 5: Post-Deploy Safety Verification (2 hours)
**Create**: `scripts/validation/post-deployment/validate-safety-components.js`

**Tests**:
1. Fetch `/materials/aluminum-laser-cleaning`
2. Verify DOM contains `data-testid="risk-card-fire"`
3. Verify DOM contains `data-testid="info-card-ppe"`
4. Check unified grid classes present
5. Verify no console errors

#### Action 6: Search URL Verification (1 hour)
**Create**: `scripts/validation/post-deployment/validate-search-urls.js`

**Tests**:
1. Search API call for "Aluminum"
2. Parse JSON response
3. Verify `full_path` field used in href
4. Check no flat URLs like `/Aluminum`

### Week 3: Low Priority (Nice to Have)

#### Action 7: Page Component Tests (4 hours)
**Goal**: Test core page components

**Files**:
- `tests/app/page.test.tsx` - Homepage (currently 36% → 80%)
- `tests/app/error.test.tsx` - Error page (0% → 80%)
- `tests/app/not-found.test.tsx` - 404 page (0% → 80%)
- `tests/app/about/page.test.tsx` - About page (0% → 80%)

**Expected Impact**: +8% overall coverage

#### Action 8: Performance Budget Enforcement (3 hours)
**Create**: `scripts/validation/validate-performance-budgets.js`

**Thresholds**:
- FCP < 1.8s
- LCP < 2.5s
- TBT < 200ms
- CLS < 0.1

**Integration**: Add to `validate:production:enhanced`

#### Action 9: Coverage Documentation (1 hour)
**Create**: `tests/COVERAGE_GUIDE.md`

**Contents**:
- How to run coverage reports
- How to read coverage output
- Component test requirements
- Coverage targets by area

---

## 📊 Expected Outcomes

### After Week 1 (High Priority Actions)

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Overall Coverage** | 29.6% | 34.6% | +5.0% ✅ |
| **Safety Component Coverage** | 0% | 80%+ | +80% ✅ |
| **Component Test Ratio** | 20% | 24% | +4% ⚠️ |
| **Coverage Threshold** | Disabled | Enabled | Protected ✅ |
| **Safety Validation** | None | Pre-deploy | Added ✅ |

### After Week 2 (Medium Priority Actions)

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Overall Coverage** | 34.6% | 42.6% | +8.0% ✅ |
| **Component Test Ratio** | 24% | 30%+ | +6% ✅ (hits threshold) |
| **Post-Deploy Checks** | 3 scripts | 5 scripts | +2 ✅ |

### After Week 3 (Low Priority Actions)

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Overall Coverage** | 42.6% | 50.6% | +8.0% ✅ |
| **Page Coverage** | 36% | 80% | +44% ✅ |
| **Performance Budget** | None | Enforced | Protected ✅ |

**Final Target**: 70% coverage (still 19.4% gap remaining - ongoing effort)

---

## 🚀 Quick Start Commands

### Run Full Test Suite with Coverage
```bash
npm run test:all
open coverage/index.html  # View coverage report
```

### Run Safety Component Tests (after creating)
```bash
npm test -- tests/components/SafetyOverview.test.tsx
npm test -- tests/components/RiskCard.test.tsx
npm test -- tests/components/InfoCard.test.tsx
```

### Run Pre-Deploy Validation (Full)
```bash
npm run prebuild  # Content + datasets + URL fixes
npm run validate:all  # All validation scripts
```

### Run Post-Deploy Validation
```bash
npm run postdeploy  # Standard production checks
npm run validate:production:enhanced  # Comprehensive
```

### Check Component Test Ratio (after script created)
```bash
node scripts/validation/validate-component-test-ratio.js
```

---

## 📋 Implementation Checklist

### Week 1: Critical (Must Do)
- [ ] Create safety component tests (SafetyOverview, RiskCard, InfoCard, SafetyDataPanel)
- [ ] Run tests and verify 80%+ coverage for safety components
- [ ] Enable coverage thresholds in jest.config.js
- [ ] Create validate-safety-schema.js script
- [ ] Add safety validation to prebuild pipeline
- [ ] Test prebuild with new validation

### Week 2: Important (Should Do)
- [ ] Create validate-component-test-ratio.js script
- [ ] Add ratio check to test:ci pipeline
- [ ] Create validate-safety-components.js (post-deploy)
- [ ] Create validate-search-urls.js (post-deploy)
- [ ] Add new scripts to validate:production:enhanced
- [ ] Test full deployment pipeline

### Week 3: Nice to Have
- [ ] Create page component tests (page, error, not-found, about)
- [ ] Create performance budget validation script
- [ ] Add performance checks to post-deploy
- [ ] Write COVERAGE_GUIDE.md
- [ ] Update CI/CD documentation

---

## 🎯 Success Criteria

### Must Pass (Deployment Blockers)
- ✅ Coverage thresholds met (branches: 20%, lines: 27%)
- ✅ Safety schema validation passes
- ✅ Component test ratio ≥ 30%
- ✅ All pre-deploy checks pass
- ✅ Post-deploy production validation passes

### Should Pass (Quality Gates)
- ⚠️ Overall coverage ≥ 50%
- ⚠️ Safety component coverage ≥ 80%
- ⚠️ Page component coverage ≥ 80%
- ⚠️ Performance budgets met

### Nice to Have (Stretch Goals)
- 🎯 Overall coverage ≥ 70%
- 🎯 Component test ratio ≥ 50%
- 🎯 Zero skipped tests
- 🎯 Zero console errors in production

---

## 🛠️ Tools & Resources

### Test Execution
```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:components  # Component tests only
npm run test:ci          # CI pipeline tests
```

### Coverage Reports
```bash
npm run test:all             # Generate coverage
open coverage/index.html     # View HTML report
cat coverage/coverage-summary.json  # View summary
```

### Validation
```bash
npm run validate:all         # All validation scripts
npm run validate:content     # Content only
npm run validate:seo         # SEO only
npm run validate:production  # Post-deploy checks
```

### Deployment
```bash
npm run prebuild             # Pre-deploy validation
npm run build                # Build + postbuild checks
npm run postdeploy           # Post-deploy validation
./scripts/deployment/smart-deploy.sh  # Full deployment
```

---

## 📞 Questions & Support

**Coverage Issues**: Check `coverage/index.html` for detailed file-by-file breakdown  
**Test Failures**: Run `npm test -- --verbose` for detailed output  
**Deployment Issues**: Check `.terminal-logs/` directory  
**Validation Failures**: Each validation script outputs detailed error messages

---

**Status**: ⚠️ GAPS IDENTIFIED - Action Plan Ready  
**Next Step**: Begin Week 1 critical actions (safety component tests)  
**Timeline**: 3 weeks to complete all actions  
**Expected Final Coverage**: 50.6% (progress toward 70% target)
