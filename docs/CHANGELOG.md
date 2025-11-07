# Documentation Changelog

All notable changes to the Z-Beam documentation will be recorded in this file.

---

## [2.3.0] - 2025-11-07 - Google Analytics 4 Event Tracking

### 🎯 Major Changes

**Analytics Implementation**: Added comprehensive GA4 custom event tracking for dataset downloads across all download interfaces.

### ✨ New Features

**Analytics Utility** (`app/utils/analytics.ts`):
- `trackEvent()` - Generic GA4 event tracking function with window.gtag integration
- `trackDatasetDownload()` - Specialized dataset download tracking with rich parameters
- Automatic fallback to console.log in development for debugging
- TypeScript interfaces for type-safe event parameters

**Event Parameters Tracked**:
- `format`: Download format (json/csv/txt)
- `category`: Material category
- `subcategory`: Material subcategory
- `material_name`: Specific material or bundle name
- `file_size`: Generated file size in bytes
- `event_category`: "Dataset" for filtering
- `event_label`: Material/category name for reporting
- `value`: 1 for conversion tracking

### 🔧 Component Updates

**Dataset Download Components**:
- `CategoryDatasetCardWrapper.tsx`: Added tracking for category-level aggregate downloads
- `SubcategoryDatasetWrapper.tsx`: Added tracking for subcategory-level downloads
- `MaterialDatasetCardWrapper.tsx`: Added tracking for individual material downloads
- `DatasetsContent.tsx`: Added tracking for complete database and category bundle downloads

**Root Layout** (`app/layout.tsx`):
- Installed `@next/third-parties` package for official GA4 integration
- Replaced manual GA4 script tags with `GoogleAnalytics` component
- Component dynamically loaded to avoid impacting Core Web Vitals
- Maintains existing GA ID: G-TZF55CB5XC

### 📊 Analytics Configuration

**GA4 Setup**:
- Events automatically logged to GA4 property
- Custom parameters auto-discovered within 24-48 hours
- Optional custom dimensions can be created in GA4 Admin for advanced reporting
- Conversion tracking ready (mark `dataset_download` as conversion in GA4)

**Development Mode**:
- Events logged to browser console when `NODE_ENV=development`
- Prevents pollution of production analytics during local testing

---

## [2.2.0] - 2025-11-04 - Frontmatter Structure & Layout Standardization

### 🎯 Major Changes

**Nested Frontmatter Structures**: Updated frontmatter architecture to support nested FAQ and caption structures across all 132 materials.

**Layout Standardization**: Consolidated all page layouts to consistent `max-w-5xl` width for uniform user experience.

### ✨ Component Updates

**Layout Component** (`app/components/Layout/Layout.tsx`):
- Added support for nested FAQ structure: `faq.questions` array
- Updated FAQ extraction logic to handle both legacy and new formats
- Maintains backward compatibility with flat FAQ arrays

**Caption Component** (`app/components/Caption/Caption.tsx`):
- Integrated parsed caption data from `useCaptionParsing` hook
- Maps nested `caption.before` and `caption.after` frontmatter fields
- Removed redundant description text display
- Added quality metrics support from parsed data

### 📐 Layout Architecture

**Standardized Container Widths** (`app/utils/containerStyles.ts`):
- All containers now use `max-w-5xl` for consistency
- Updated styles:
  - `STANDARD_CONTAINER`: `max-w-6xl` → `max-w-5xl`
  - `CONTAINER_STYLES.standard`: `max-w-6xl` → `max-w-5xl`
  - `CONTAINER_STYLES.contentOnly`: `max-w-6xl` → `max-w-5xl`
  - `CONTAINER_STYLES.section`: `max-w-6xl` → `max-w-5xl`
- Updated padding: `px-3` → `px-4` across all styles

**Hero Components**:
- `Hero.tsx`: Updated to `max-w-5xl` (was `max-w-6xl`)
- `DatasetHero.tsx`: Updated to `max-w-5xl` (was `max-w-7xl`)

### 🗂️ Frontmatter Structure

**FAQ Structure** (132 materials):
```yaml
faq:
  questions:
    - question: "..."
      answer: "..."
```

**Caption Structure** (132 materials):
```yaml
caption:
  before: "Surface condition description..."
  after: "Post-treatment description..."
```

**Enhanced Property Format**:
```yaml
property_name:
  value: 123
  unit: "W/cm²"
  confidence: 0.95
  min: 100
  max: 150
  source: "Material handbook"
```

### 📊 Dataset Generation

**Updated Dataset Pipeline** (`scripts/generate-datasets.ts`):
- Successfully processes nested FAQ structures
- Exports FAQ question count to dataset metadata
- Handles nested caption before/after fields
- Supports enhanced property format with confidence intervals
- Generated 396 dataset files (132 materials × 3 formats + index.json)
- Zero errors during regeneration

**Dataset Files**:
- JSON format: Machine-readable with Schema.org metadata
- CSV format: Spreadsheet-compatible with all properties
- TXT format: Human-readable summaries
- Index: Master catalog of all datasets

### 🎨 UI Improvements

**Caption Display**:
- Removed redundant "Laser cleaning parameters for [Material]" description text
- Cleaner visual hierarchy focusing on before/after treatment descriptions
- Better content spacing and typography

**Page Consistency**:
- Home page, search results, and category listings now match material page width
- Unified spacing and padding across all page types
- Consistent content area boundaries

### 🏗️ Affected Files

**Components** (3 files):
- `app/components/Layout/Layout.tsx`
- `app/components/Caption/Caption.tsx`
- `app/components/Hero/Hero.tsx`

**Utilities** (1 file):
- `app/utils/containerStyles.ts`

**Dataset Components** (1 file):
- `app/components/Dataset/DatasetHero.tsx`

**Frontmatter** (132 files):
- All materials in `frontmatter/materials/*.yaml`

**Generated Datasets** (396 files):
- `public/datasets/materials/*.{json,csv,txt}`
- `public/datasets/index.json`

### ✅ Validation

**Build Status**:
- Production build: 193 static pages generated
- Zero errors
- 132 expected warnings (breadcrumb format)

**Pre-Build Validations**:
- ✅ Naming conventions (132/132 materials)
- ✅ Metadata structure validation
- ✅ Sitemap generation

**Post-Build Validations**:
- ✅ URL accessibility
- ✅ JSON-LD Schema.org compliance
- ✅ Dataset generation integrity

---

## [2.1.0] - 2025-10-26 - Category Validation Fix

### 🐛 Bug Fixes

**Category Slug Validation**: Fixed validation regex to allow hyphens in category names.

- **Issue**: The validation script `validate-naming-e2e.js` was incorrectly rejecting hyphenated category names like `rare-earth`
- **Root Cause**: Category slug regex was `/^[a-z]+$/` (no hyphens allowed) while subcategory allowed `/^[a-z-]+$/`
- **Impact**: All 8 rare-earth materials (cerium, dysprosium, europium, lanthanum, neodymium, praseodymium, terbium, yttrium) were returning 404 errors
- **Fix**: Updated `categorySlug` regex to `/^[a-z-]+$/` to allow optional hyphens
- **Validation**: Changed error message from "should be lowercase, no hyphens" to "should be lowercase with optional hyphens"

### 📝 Documentation Updates

**Updated Files**:
- `docs/reference/FRONTMATTER_NAMING_RULES.md` - Category slug rules now allow hyphens
- `docs/systems/NAMING_VALIDATION_E2E.md` - Updated examples to show `rare-earth` as valid category
- `docs/NAMING_NORMALIZATION_EVALUATION.md` - Updated regex patterns and added Oct 2025 update note

**Changed Rules**:
- Category format: `lowercase with optional hyphens` (was: `lowercase, single word`)
- Examples: `metal`, `rare-earth` (was: `rareearth`)
- Regex: `/^[a-z-]+$/` (was: `/^[a-z]+$/`)

### 🎯 Affected Materials

**rare-earth Category** (8 materials):
- cerium-laser-cleaning
- dysprosium-laser-cleaning
- europium-laser-cleaning
- lanthanum-laser-cleaning
- neodymium-laser-cleaning
- praseodymium-laser-cleaning
- terbium-laser-cleaning
- yttrium-laser-cleaning

All now properly validated and accessible at `/materials/rare-earth/lanthanide/[slug]`.

---

## [2.0.0] - 2025-10-15 - Major Consolidation & Organization

### 🎯 Major Changes

**Documentation Consolidation**: Reorganized 256 markdown files into a clean, topic-based structure.

### ✨ Added

- **Master Documentation Index** (`README.md`) - Comprehensive navigation for all documentation
- **Documentation Consolidation Plan** - Detailed plan for ongoing documentation maintenance
- **Organized Directory Structure** - Topic-based folders for all documentation
- **MetricsCard Vertical Redesign Documentation**:
  - Complete implementation guide
  - Quick reference guide
  - Visual comparisons and diagrams
- **Archive System** - Proper preservation of historical documentation

### 📁 New Directory Structure

```
docs/
├── components/          # Component documentation (16 files)
├── features/            # Feature guides (13 files)
├── architecture/        # System architecture (14 files)
├── systems/             # Core systems (10 files)
├── guides/              # How-to guides (17 files)
├── testing/             # Test documentation (5 files)
└── archived/            # Historical docs (160+ files)
    ├── phase-reports/   # Project phase completions
    ├── naming-project/  # Naming convention project
    ├── evaluations/     # Architecture analyses
    └── migrations/      # Migration documentation
```

### 🗂️ Organized

**Moved to Appropriate Directories:**
- MetricsCard docs → `components/MetricsCard/docs/` (7 files)
- Caption docs → `components/Caption/` (2 files)
- Accessibility docs → `guides/accessibility/` (8 files)
- Categorized Properties → `features/categorized-properties/` (8 files)
- Thermal Properties → `features/thermal-properties/` (3 files)
- Font System → `systems/fonts/` (6 files)
- Semantic HTML → `systems/semantic/` (2 files)
- Static Pages → `architecture/static-pages/` (5 files)
- Test docs → `testing/` (5 files)

**Archived Historical Documents:**
- Phase reports → `archived/phase-reports/` (9 files)
- Naming project → `archived/naming-project/` (9 files)
- Evaluations & analyses → `archived/evaluations/` (100+ files)
- Migrations → `archived/migrations/` (1 file)

### 🧹 Cleaned

**Root Directory:**
- **Before**: 126 files (cluttered, hard to navigate)
- **After**: 4 files (clean, essential only)
  - `README.md` - Master index
  - `NAMING_QUICK_REFERENCE.md` - Active reference
  - `GROK_INSTRUCTIONS.md` - AI guidelines
  - `DOCUMENTATION_CONSOLIDATION_PLAN.md` - Consolidation details

### 📊 Results

- **Files Organized**: 256 markdown files
- **Root Reduction**: 126 → 4 files (97% reduction)
- **Archived**: 160+ historical documents
- **Active Documentation**: ~80 current files
- **Findability**: Significantly improved with topic-based organization

---

## [1.1.0] - 2025-10-15 - MetricsCard Vertical Redesign

### Added

- **MetricsCard Vertical Redesign Documentation**:
  - `METRICSCARD_VERTICAL_REDESIGN.md` - Complete implementation guide
  - `METRICSCARD_VERTICAL_QUICK_REFERENCE.md` - Quick reference
  - Visual diagrams and comparisons
  - Bug fix documentation (case-insensitive filtering)

### Changed

- **MetricsCard Implementation**: Documented horizontal → vertical layout transition
- **METRICSCARD_MOBILE_ANALYSIS.md**: Marked as superseded with link to new docs
- **Component README**: Updated with redesign notice

### Details

- Card height: 80-96px → 128-160px
- Progress bar: Horizontal → Vertical (bottom-to-top fill)
- Property names: Abbreviated → Full names (41 properties)
- Grid columns: +1 at all breakpoints
- Border radius: Removed for clean edges

---

## [1.0.0] - 2025-10-02 - Initial Organized State

### Context

Documentation existed but was unorganized with 256 files in various locations.

### Structure

- Multiple documentation files in root
- Some subdirectory organization
- Historical documents mixed with current
- Duplicated content across files
- No master index or navigation

---

## Future Plans

### Planned Improvements

1. **Consolidate Duplicate Content**
   - Merge multiple accessibility docs into comprehensive guide
   - Consolidate categorized properties documentation
   - Create single source of truth for each topic

2. **Create Topic READMEs**
   - Comprehensive README for each major topic
   - Quick start guides for common tasks
   - Link all related documentation

3. **Improve Navigation**
   - Add breadcrumbs to major docs
   - Cross-link related documentation
   - Create topic indexes

4. **Documentation Standards**
   - Establish writing style guide
   - Create documentation templates
   - Set update frequency guidelines

---

## Versioning

Documentation versions follow this format:
- **Major.Minor.Patch** (e.g., 2.0.0)
- **Major**: Significant restructuring or consolidation
- **Minor**: New major documentation added
- **Patch**: Updates to existing docs

---

**Maintained by**: Z-Beam Documentation Team  
**Last Updated**: October 15, 2025
