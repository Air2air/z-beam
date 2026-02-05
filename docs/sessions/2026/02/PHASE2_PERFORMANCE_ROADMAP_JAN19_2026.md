# Phase 2: Performance Optimization Roadmap
**Date**: January 19, 2026
**Prerequisites**: Phase 1 complete ✅ (21 warnings, 594 pages built, 0 errors)
**Duration**: 3-5 days
**Goal**: Reduce desktop TTI by 56% (7.99s → <3.5s), INP by 76% (0.85s → <0.2s)

## Current Performance Baseline

**Desktop (Current - Needs Improvement)**:
- Time to Interactive (TTI): 7.99s ⚠️ (target: <3.5s, need -56%)
- Interaction to Next Paint (INP): 0.85s ⚠️ (target: <0.2s, need -76%)

**Mobile (Current - Already Optimized)**:
- Grade: A ✅
- Performance: Acceptable ✅

**Build Status (Phase 1 Complete)**:
- Pages: 594 static pages ✅
- Build: 592MB, 0 errors ✅
- Chunks: 5-32KB optimal range ✅
- Tests: 3,257/3,450 passing (94.4%) ✅
- Warnings: 21 (78.1% improvement from 96) ✅

---

## Phase 2 Goals

1. **Desktop TTI**: 7.99s → <3.5s (-56% reduction)
2. **Desktop INP**: 0.85s → <0.2s (-76% reduction)
3. **Maintain**: 100% functionality, >90% test coverage
4. **Improve**: Lighthouse score to >95 desktop

---

## Task Breakdown (5-Day Sprint)

### Day 1: Bundle Analysis & Heavy Component Identification (6-8 hours)

**Morning: Bundle Analysis**:
```bash
# Run bundle analyzer
ANALYZE=true npm run build

# Profile initial page load
# Chrome DevTools → Performance → Record page load
# Identify: Main thread blocking, long tasks, render-blocking resources

# Analyze current chunks
ls -lh .next/static/chunks/*.js | sort -k5 -hr | head -20
```

**Tasks**:
- Identify components >50KB (candidates for code splitting)
- Profile render times for each major component
- Map component import chains (which components pull in heavy deps)
- Document blocking scripts on initial page load

**Expected Findings** (based on Phase 1 files):
- **Heavy candidates**:
  - DiagnosticCenter (3 panels: Prevention, Troubleshooting, QuickReference)
  - HeatBuildup (analysis cards, complex calculations, useMemo issues from warnings)
  - BaseHeatmap (visualization component, likely large)
  - CompoundSafetyGrid (grid logic, data processing)
  - ParameterRelationships (complex relationships, unused params indicate over-engineering)
- **Large chunks**: Interactive visualizations, data grids
- **Blocking scripts**: Heavy computations in main thread

**Deliverable**: Component size report with optimization targets (Markdown document)

**Afternoon: Component Profiling**:
- Profile each heavy component render time
- Identify unnecessary re-renders (React DevTools Profiler)
- Document current useMemo/useCallback usage
- Review 4 React Hook warnings from lint (HeatBuildup useMemo x2, Title useEffect, search-client useEffect)

**Deliverable**: Component performance report with bottlenecks identified

---

### Day 2: Code Splitting & Dynamic Imports (6-8 hours)

**Strategy**: Implement dynamic imports for heavy, below-fold components

**Morning: Setup Dynamic Import Infrastructure**:
```typescript
// Example: HeatBuildup dynamic import
import dynamic from 'next/dynamic';

const HeatBuildup = dynamic(
  () => import('./components/HeatBuildup/HeatBuildup'),
  {
    loading: () => <HeatBuildupSkeleton />,
    ssr: false // For client-only visualizations
  }
);
```

**Target Components** (from Phase 1 modifications):
1. **DiagnosticCenter** (Priority 1):
   - Files: DiagnosticCenter.tsx, PreventionPanel, TroubleshootingPanel, QuickReferencePanel
   - Size estimate: 40-60KB combined
   - Strategy: Lazy load each panel individually
   - Expected savings: -2-3s TTI

2. **HeatBuildup** (Priority 1):
   - Files: HeatBuildup.tsx, HeatAnalysisCards.tsx
   - Size estimate: 35-50KB
   - Strategy: Dynamic import with skeleton loader
   - Expected savings: -1-2s TTI

3. **BaseHeatmap** (Priority 2):
   - Files: BaseHeatmap.tsx, EnergyCouplingHeatmap, MaterialSafetyHeatmap, ThermalStressHeatmap
   - Size estimate: 50-70KB combined
   - Strategy: Lazy load individual heatmap variants
   - Expected savings: -1-2s TTI

4. **CompoundSafetyGrid** (Priority 2):
   - File: CompoundSafetyGrid.tsx
   - Size estimate: 25-35KB
   - Strategy: Dynamic import for grid component
   - Expected savings: -0.5-1s TTI

5. **ParameterRelationships** (Priority 3):
   - File: ParameterRelationships.tsx
   - Size estimate: 30-40KB
   - Strategy: Lazy load complex relationship visualization
   - Expected savings: -0.5-1s TTI

**Afternoon: Create Skeleton Loaders**:
- Design skeleton loaders for each lazy-loaded component
- Match skeleton dimensions to actual component
- Implement Suspense boundaries
- Test loading states

**Tasks**:
- Implement dynamic imports for 5 target components
- Create 5 skeleton loader components
- Add Suspense boundaries with error boundaries
- Test lazy loading behavior

**Expected Impact**: TTI -5-9s cumulative → Target <3.5s achievable

**Deliverable**: Dynamic import implementation with skeleton loaders

---

### Day 3: Image Optimization & Resource Loading (6-8 hours)

**Morning: Image Audit**:
```bash
# Find all image tags
grep -r "<img" app/ --include="*.tsx" --include="*.ts"

# Check Next/Image usage
grep -r "next/image" app/ --include="*.tsx" | wc -l

# Analyze hero images
find public/images -name "*hero*" -o -name "*thumbnail*"
```

**Tasks**:
- Audit remaining `<img>` tags (convert to Next/Image)
- Add `priority` prop for above-fold images
- Optimize image formats (WebP/AVIF with fallbacks)
- Implement lazy loading for below-fold images
- Review hero images in materials/contaminants (from heroImage parameter threading)

**Target Files** (from Phase 1):
- Hero component (Hero.tsx - has videoClasses unused variable)
- DatasetHero component
- Material/Contaminant card images
- Thumbnail component

**Afternoon: Resource Loading Optimization**:
- Implement `loading="lazy"` for below-fold images
- Add image dimensions to prevent layout shift
- Configure Next.js Image optimization (quality, formats)
- Implement resource hints (preload, prefetch) for critical images

**Expected Impact**: TTI -0.5-1s, INP -0.1-0.2s (less layout shift)

**Deliverable**: Optimized image loading strategy

---

### Day 4: Route & Data Fetching Optimization (6-8 hours)

**Morning: Route Analysis**:
```bash
# Analyze getStaticProps usage
grep -r "getStaticProps" app/ --include="*.tsx" | wc -l

# Check data fetching patterns
grep -r "fetch\|axios" app/utils/ --include="*.ts"
```

**Tasks**:
- Review getStaticProps for 594 pages
- Identify duplicate data fetching (compounds, materials, contaminants all use similar patterns)
- Implement incremental static regeneration (ISR) where appropriate
- Optimize metadata generation (from Phase 1: metadata/extractor.ts has unused category variable)
- Review staticPageData.generated.ts (from Batch 17: ContentCardItem aliased)

**Afternoon: Prefetch Optimization**:
- Implement smart prefetching for common navigation paths
- Add `<Link prefetch>` for likely next pages
- Review and optimize data fetching in:
  - batchContentAPI.ts (5-192 lines)
  - contentAPI.ts (14-48 lines)
  - datasetLoader.ts (schemas directory)
- Reduce duplicate API calls

**Expected Impact**: TTI -0.5-1s (faster subsequent navigation)

**Deliverable**: Optimized data fetching and route prefetching

---

### Day 5: Runtime Performance & React Optimization (6-8 hours)

**Morning: React Hook Optimization**:

**Address 4 React Hook warnings** (from lint results):
1. **HeatBuildup.tsx line 96**: useMemo unnecessary dependencies
2. **HeatBuildup.tsx line 135**: useMemo missing dependency
3. **Title.tsx line 203**: useEffect missing dependency
4. **search-client.tsx line 354**: useEffect missing dependency

**Tasks**:
- Fix useMemo dependency arrays (HeatBuildup)
- Review useEffect dependencies (Title, search-client)
- Add useCallback for event handlers
- Implement React.memo for expensive components

**Target Components**:
- HeatBuildup (2 useMemo issues)
- Title component
- Search client
- CardGrid components
- DataGrid component

**Afternoon: Virtual Scrolling & Interaction Optimization**:
- Implement virtual scrolling for long lists (CardGrid, DataGrid)
- Debounce search/filter interactions
- Optimize Collapsible component (has borderColor, bgColor unused variables - line 419)
- Review CompoundSafetyGrid (has showConcentrations, showExceedsWarnings, mode unused - lines 93-96)
- Add requestIdleCallback for non-critical updates

**Expected Impact**: INP -0.3-0.5s (faster interactions, less main thread blocking)

**Deliverable**: Optimized React rendering and interaction handling

---

## Success Metrics

**Performance Goals** (Desktop):
- Time to Interactive: <3.5s (current: 7.99s, need -56%)
- Interaction to Next Paint: <0.2s (current: 0.85s, need -76%)
- Lighthouse Performance: >95 (current: Grade A mobile only)

**Code Quality Goals**:
- Test coverage: >90% maintained (current: 94.4%)
- Lint warnings: <25 (current: 21, maintain)
- Build errors: 0 (current: 0, maintain)
- Bundle size: Main chunk <500KB (current: 32KB max chunk)

**User Experience Goals**:
- First Contentful Paint (FCP): <1.5s
- Largest Contentful Paint (LCP): <2.5s
- Cumulative Layout Shift (CLS): <0.1

---

## Risk Mitigation

1. **Test after each day**: Run full test suite (3,450 tests) after each optimization
2. **Feature branches**: Keep separate branches for each day's work (easy rollback)
3. **Production monitoring**: Deploy to staging first, monitor metrics
4. **User acceptance testing**: Test interactive components (HeatBuildup, CompoundSafetyGrid, search)
5. **Lighthouse CI**: Automate performance testing in CI/CD

---

## Dependencies & Prerequisites

**From Phase 1** ✅:
- Lint warnings reduced to 21 ✅
- Production build successful (594 pages, 0 errors) ✅
- Test suite passing (3,257/3,450, 94.4%) ✅
- Bundle sizes optimal (5-32KB chunks) ✅

**Required Tools**:
- Chrome DevTools (performance profiling)
- Next.js Bundle Analyzer (`ANALYZE=true npm run build`)
- React DevTools Profiler (component render times)
- Lighthouse CI (automated performance testing)

**Team Skills**:
- Dynamic imports & code splitting
- React performance optimization (useMemo, useCallback, React.memo)
- Next.js image optimization
- Performance profiling & analysis

---

## Implementation Order

**Critical Path** (Days 1-3):
1. Day 1: Identify bottlenecks → Foundation for all other work
2. Day 2: Code splitting → Biggest TTI impact (-5-9s potential)
3. Day 3: Image optimization → TTI + INP improvement

**Optimization** (Days 4-5):
4. Day 4: Route optimization → Faster navigation, better UX
5. Day 5: Runtime performance → INP reduction, smoother interactions

---

## Daily Check-ins

- **Morning standup**: Review previous day's results, plan current day
- **Afternoon check**: Verify tests passing, no regressions
- **End of day**: Document metrics improvement, commit progress
- **Friday demo**: Show TTI/INP improvements, Lighthouse scores

---

## Success Definition

**Minimum Viable Success**:
- Desktop TTI: <5s (-37% from 7.99s)
- Desktop INP: <0.4s (-53% from 0.85s)
- All tests passing
- No functionality lost

**Target Success** (Goal):
- Desktop TTI: <3.5s (-56% from 7.99s) ✅
- Desktop INP: <0.2s (-76% from 0.85s) ✅
- Lighthouse: >95 desktop
- Bundle: Main chunk <500KB

**Stretch Success**:
- Desktop TTI: <3s (-62% from 7.99s)
- Desktop INP: <0.15s (-82% from 0.85s)
- Lighthouse: >98 desktop
- Core Web Vitals: All green

---

## Next Steps

1. **Review this roadmap**: Team walkthrough, Q&A session
2. **Setup tools**: Install Bundle Analyzer, Lighthouse CI
3. **Create sprint**: Add tasks to project management tool
4. **Baseline metrics**: Capture current performance (screenshots, Lighthouse reports)
5. **Kickoff**: Day 1 morning, full team

---

**Related Documents**:
- OPTIMIZATION_PHASE1_COMPLETE_JAN19_2026.md (Phase 1 results - completed)
- CONSOLIDATION_OPPORTUNITIES_JAN19_2026.md (Code consolidation plans)
- Build verification results (594 pages, 0 errors, production-ready)
