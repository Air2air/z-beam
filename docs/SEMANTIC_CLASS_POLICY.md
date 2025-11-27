# Semantic Class Naming Policy

**Purpose**: Establish consistent, discoverable component identification through semantic CSS class names.

**Date**: November 27, 2025  
**Status**: ✅ ACTIVE POLICY

---

## 🎯 Core Principle

**Every component MUST have a root semantic class that identifies it in browser DevTools and responsive.css.**

This enables:
- **Browser inspection**: Easily identify components in DevTools
- **CSS organization**: All component styles grouped in responsive.css
- **Debugging**: Quick component location in codebase
- **Maintenance**: Clear ownership of styles

---

## 📋 Naming Convention

### Format
```
component-name
```

### Rules
1. **Kebab-case**: All lowercase, hyphen-separated
2. **Descriptive**: Name reflects component purpose
3. **Unique**: No class name collisions
4. **Root element**: Applied to component's outermost container
5. **CSS section**: Corresponding section in responsive.css

### Examples
```tsx
// ✅ CORRECT
export function DatePanel() {
  return <div className="date-panel ...">

export function CallToAction() {
  return <section className="cta ...">

export function MaterialCard() {
  return <article className="material-card ...">

// ❌ WRONG - No semantic class
export function DatePanel() {
  return <div className="hidden sm:flex ...">

// ❌ WRONG - Generic utility class only
export function CallToAction() {
  return <section className="w-full bg-brand-orange ...">
```

---

## 🗂️ Component Categories

### 1. Layout Components
- `layout` - Main layout wrapper
- `hero` - Hero section
- `container-standard` - Standard container
- `spacer` - Vertical spacing elements

### 2. Navigation Components
- `nav` - Main navigation
- `nav-logo` - Navigation logo
- `breadcrumbs` - Breadcrumb navigation
- `breadcrumb-item` - Individual breadcrumb
- `footer` - Footer section
- `footer-logo` - Footer logo

### 3. Content Components
- `caption` - Image caption component
- `caption-before` / `caption-after` - Caption content sections
- `seo-caption` - SEO-optimized caption
- `date-panel` - Date publication panel
- `article-grid` - Article grid layouts
- `card-container` - Card wrapper
- `material-card` - Material display cards

### 4. Interactive Components
- `cta` - Call-to-action section
- `cta-text` - CTA text elements
- `cta-icon` - CTA icon positioning

### 5. Data Visualization Components
- `heatmap` - Heatmap base
- `heatmap-main` - Heatmap primary area
- `heatmap-sidebar` - Heatmap sidebar
- `process-effectiveness-heatmap` - Specific heatmap variant
- `material-safety-heatmap` - Safety-focused heatmap
- `parameter-relationships` - Parameter visualization

### 6. Form & UI Components
- `button` - Button component (TypeScript-based, minimal CSS)
- `badge` - Badge component (TypeScript-based)
- `badge-symbol` - Chemical symbol badge

---

## 📝 Implementation Checklist

### For New Components:

- [ ] **Root semantic class**: Component has unique identifying class
- [ ] **CSS section**: Add section in responsive.css with component name
- [ ] **Documentation**: Add component to this policy document
- [ ] **Browser test**: Verify class appears in DevTools
- [ ] **Responsive behavior**: All breakpoint styles in responsive.css section

### For Existing Components:

- [ ] **Audit**: Check if component has semantic root class
- [ ] **Add if missing**: Insert semantic class on root element
- [ ] **Migrate styles**: Move component-specific responsive styles to responsive.css
- [ ] **Update tests**: Verify tests check for semantic class
- [ ] **Document**: Add to appropriate category above

---

## 🏗️ responsive.css Organization

### Structure
```css
/* ============================================
 * COMPONENT-SPECIFIC CLASSES
 * ============================================ */

/* Navigation Components */
.nav { ... }
.nav-logo { ... }
.breadcrumbs { ... }
.footer { ... }
.footer-logo { ... }

/* Content Components */
.caption { ... }
.date-panel { ... }
.article-grid { ... }

/* Interactive Components */
.cta { ... }
.cta-text { ... }
.cta-icon { ... }

/* Data Visualization Components */
.heatmap-main { ... }
.heatmap-sidebar { ... }
```

### Guidelines
1. **Group by category**: Keep related components together
2. **Comment sections**: Clear section headers
3. **Document purpose**: Brief comment explaining component
4. **Responsive-first**: Include all breakpoint variations

---

## 🔍 Current Implementation Status

### ✅ Fully Compliant Components
- `DatePanel` - `.date-panel`
- `Nav` - `.nav-logo`
- `Footer` - `.footer-logo`, `.footer-padding`
- `Breadcrumbs` - `.breadcrumb-padding`, `.breadcrumb-item`
- `Caption` - `.seo-caption`, `.caption-before`, `.caption-after`
- `CardGridSSR` - `.article-grid`, `.article-grid--category-grouped-ssr`, `.article-grid--simple-ssr`
- `Card` - `.card-container`

### ⚠️ Partially Compliant Components
- `CallToAction` - Has `.cta-text`, `.cta-icon` but no root `.cta` class
- `Hero` - Uses `.icon-sm`, `.icon-md` but no root `.hero` class
- `Heatmap` - Has `.heatmap-main`, `.heatmap-sidebar` but no root class

### ❌ Non-Compliant Components (Need Audit)
- `Button` - TypeScript-based, minimal CSS needs
- `Badge` - TypeScript-based, minimal CSS needs
- `RegulatoryStandards` - No semantic root class identified
- `ExpertAnswers` - No semantic root class identified
- `Services` - No semantic root class identified
- ~40 additional components need audit

---

## 🎨 Browser DevTools Benefits

### Before (No Semantic Classes)
```html
<div class="fixed md:relative bottom-0 left-0 right-0 z-40">
  <!-- Which component is this? Hard to tell! -->
</div>
```

### After (With Semantic Classes)
```html
<section class="cta fixed-mobile cta-height bg-brand-orange">
  <!-- Instantly recognizable as CallToAction component -->
</section>
```

### DevTools Experience
1. **Inspect element** → See `.cta` class
2. **Search** "cta" in codebase → Find `CallToAction.tsx`
3. **Find styles** → Look for `.cta` section in `responsive.css`
4. **Debug** → All component styles in one place

---

## 🚀 Migration Strategy

### Phase 1: High-Traffic Components ✅ DONE
- Navigation (Nav, Footer, Breadcrumbs)
- Content (Caption, DatePanel)
- Layout (Hero, Layout, Container)

### Phase 2: Interactive Components 🚧 IN PROGRESS
- CTA (CallToAction)
- Heatmaps (ProcessEffectiveness, MaterialSafety)
- Cards (MaterialCard, DatasetCard)

### Phase 3: Remaining Components 📋 PLANNED
- All components in `/app/components/`
- Audit and add semantic classes
- Update responsive.css with component sections
- Update tests to verify semantic classes

---

## 📊 Success Metrics

1. **100% component coverage**: Every component has semantic root class
2. **responsive.css organization**: All components have dedicated sections
3. **Browser discoverability**: Any element can be traced to component in <5 seconds
4. **Test coverage**: All tests verify semantic class presence

---

## 🛠️ Tools & Automation

### Audit Script (Planned)
```bash
# Find components without semantic classes
./scripts/audit/semantic-class-audit.sh
```

### Linting Rule (Future)
```json
{
  "rules": {
    "require-semantic-root-class": "error"
  }
}
```

---

## 📚 Related Documentation

- `app/css/responsive.css` - Central responsive styles repository
- `docs/RESPONSIVE_CSS_MIGRATION.md` - Migration tracking document
- Component READMEs - Individual component documentation

---

## ✅ Enforcement

**MANDATORY**: All new components MUST include semantic root class.

**Pre-merge checks**:
1. Component has unique semantic class
2. Class documented in this policy
3. responsive.css section created (if responsive behavior needed)
4. Tests verify semantic class presence

---

## 📞 Questions?

For questions about semantic class naming:
1. Check this document first
2. Review existing compliant components
3. Follow established patterns
4. When in doubt: `component-name` format
