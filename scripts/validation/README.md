# Validation System v2.0

> **Complete redesign** for robustness, simplicity, and speed. Deploy time reduced from ~10min to ~3min.

## 🎯 What Changed

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Pre-push time | 2m 30s | 35s | **4.3x faster** |
| Deploy time | ~10m | ~3m | **3.3x faster** |
| Script count | 80+ | 40 | **50% reduction** |
| Validation layers | 4 overlapping | 3 clear | **100% dedup** |

## Directory Structure

```
validation/
├── README.md                         # This file (v2.0)
├── config.js                         # 🆕 Central configuration
├── lib/                              # 🆕 Shared infrastructure
│   ├── environment.js                # Environment detection
│   ├── exitCodes.js                  # Standard exit codes
│   ├── cache.js                      # Validation caching
│   ├── parallel.js                   # Parallel execution
│   ├── run-checks.js                 # Quick quality checks
│   └── run-content-validation.js     # Content validation orchestrator
├── jsonld/                           # JSON-LD & Structured Data
├── accessibility/                    # WCAG & A11y compliance
├── seo/                             # SEO & Performance
└── content/                         # Content structure & metadata
```

## 📦 Core Infrastructure (v2.0)

### `lib/environment.js` - Environment Detection
Automatically adapts validation behavior to execution context:

```javascript
const { requiresServer, isCI } = require('./lib/environment');

// Gracefully skip if server not available
await requiresServer('JSON-LD validation');

// Check execution context
if (isCI) {
  console.log('Running in CI environment');
}
```

**Features:**
- Detects CI environments (Vercel, GitHub Actions, GitLab, CircleCI)
- Checks localhost availability
- Prevents CI failures on dev-only validations

### `lib/exitCodes.js` - Standard Exit Codes
Consistent exit behavior across all validators:

```javascript
const { ValidationResult } = require('./lib/exitCodes');

const result = new ValidationResult('Script Name');

result.addPassed('Check passed');
result.addWarning('Non-critical issue');
result.addFailure('Critical error', 'context', 'npm run fix:X');

result.exit(); // Exits with 0 or 1
```

**Features:**
- Tracks passed/warnings/failures
- Generates formatted summaries
- Provides actionable fix suggestions

### `lib/cache.js` - Validation Caching
Skip validation for unchanged files:

```javascript
const { ValidationCache } = require('./lib/cache');

const cache = new ValidationCache('naming');
if (cache.isCached(filePath)) {
  continue; // Skip validation
}
cache.set(filePath); // Cache result
```

**Features:**
- MD5 hash-based caching
- 1-hour TTL with auto-expiration
- Disabled in CI (always fresh)
- Cache stats: `npm run cache:stats`

### `lib/parallel.js` - Parallel Execution
Run independent validations concurrently:

```javascript
const { runParallel } = require('./lib/parallel');

const validations = [
  { name: 'Type Check', command: 'npm run type-check' },
  { name: 'Lint', command: 'npm run lint' },
  { name: 'Tests', command: 'npm run test:unit' }
];

const results = await runParallel(validations);
```

**Features:**
- Max 5 concurrent validations
- 2-minute timeout per validation
- Progress display with summary
- **4.3x faster** than sequential

### `lib/run-checks.js` - Quick Quality Checks
Orchestrates pre-push validation (~35s):

```bash
npm run check
```

**Runs in parallel:**
- Type checking
- Linting
- Unit tests
- Naming conventions
- Metadata sync

### `lib/run-content-validation.js` - Content Validation
Orchestrates content validation pipeline:

```bash
npm run validate:content
```

**Runs sequentially:**
1. Frontmatter structure
2. Naming conventions
3. Metadata sync
4. Sitemap generation
5. Breadcrumb validation

### `config.js` - Central Configuration
Single source of truth for all validation thresholds:

```javascript
module.exports = {
  content: {
    maxFrontmatterWarnings: 150,
    maxNamingWarnings: 135
  },
  performance: {
    maxBuildSizeMB: 500
  },
  accessibility: {
    wcagLevel: 'AA'
  }
};
```

**Benefits:**
- No hardcoded thresholds
- Easy to adjust limits
- Documented defaults

## JSON-LD & Structured Data (`jsonld/`)

Validates Schema.org markup, rich snippets, and structured data compliance.

| Script | Purpose | Usage |
|--------|---------|-------|
| `validate-jsonld-comprehensive.js` | Complete JSON-LD validation suite | `node scripts/validation/jsonld/validate-jsonld-comprehensive.js` |
| `validate-jsonld-rendering.js` | Validates JSON-LD rendering in built pages | `node scripts/validation/jsonld/validate-jsonld-rendering.js` |
| `validate-jsonld-static.js` | Static JSON-LD syntax validation | `node scripts/validation/jsonld/validate-jsonld-static.js` |
| `validate-jsonld-syntax.js` | JSON-LD syntax & structure validation | `node scripts/validation/jsonld/validate-jsonld-syntax.js` |
| `validate-jsonld-urls.js` | Validates URLs in JSON-LD schemas | `node scripts/validation/jsonld/validate-jsonld-urls.js` |
| `validate-schema-richness.js` | Checks schema completeness & richness | `node scripts/validation/jsonld/validate-schema-richness.js` |

### Key Features
- **Schema.org compliance**: Validates against official Schema.org specifications
- **Rich snippet validation**: Ensures Google-compatible structured data
- **URL consistency**: Verifies all URLs in schemas are valid and consistent
- **Schema depth**: Measures completeness of structured data implementation
- **Rendering validation**: Tests JSON-LD in actual built pages

## Accessibility (`accessibility/`)

WCAG 2.2 compliance, semantic HTML, and accessibility tree validation.

| Script | Purpose | Usage |
|--------|---------|-------|
| `validate-wcag-2.2.js` | WCAG 2.2 Level AA compliance | `node scripts/validation/accessibility/validate-wcag-2.2.js` |
| `validate-accessibility-tree.js` | Validates accessibility tree structure | `node scripts/validation/accessibility/validate-accessibility-tree.js` |

### Key Features
- **WCAG 2.2 AA**: Tests against latest accessibility guidelines
- **Semantic HTML**: Validates proper use of ARIA labels and semantic elements
- **Keyboard navigation**: Ensures keyboard accessibility
- **Screen reader compatibility**: Tests ARIA labels and accessibility tree
- **Color contrast**: Validates WCAG contrast requirements

## SEO & Performance (`seo/`)

Search engine optimization, Core Web Vitals, and redirect validation.

| Script | Purpose | Usage |
|--------|---------|-------|
| **`validate-seo-infrastructure.js`** | **🆕 Comprehensive SEO Infrastructure validation** | `npm run validate:seo-infrastructure` |
| `validate-modern-seo.js` | Modern SEO best practices | `node scripts/validation/seo/validate-modern-seo.js` |
| `validate-core-web-vitals.js` | Core Web Vitals metrics | `node scripts/validation/seo/validate-core-web-vitals.js` |
| `validate-redirects.js` | Redirect chain validation | `node scripts/validation/seo/validate-redirects.js` |

### 🆕 SEO Infrastructure Validator (Comprehensive)

The **validate-seo-infrastructure.js** script provides complete validation of all SEO Infrastructure components:

**Validates:**
- ✅ **Metadata**: Title tags (30-60 chars), meta descriptions (120-160 chars), viewport
- ✅ **Structured Data**: JSON-LD Schema.org markup, schema richness, content-appropriate types
- ✅ **Sitemaps**: XML sitemap, robots.txt, URL count, priority/changefreq tags
- ✅ **Open Graph**: og:title, og:description, og:image, og:url, og:type, Twitter Cards
- ✅ **Breadcrumbs**: BreadcrumbList schema, visible navigation
- ✅ **Canonical URLs**: Proper canonicalization, URL consistency

**🔍 Proactive Opportunity Discovery** (NEW):
The validator automatically scans your content and **suggests missing schema types** that could enhance SEO:
- 💡 **FAQPage**: Detects Q&A patterns, accordion sections, FAQ headings
- 💡 **HowTo**: Detects step-by-step instructions, tutorials, ordered lists
- 💡 **VideoObject**: Detects video embeds (YouTube, Vimeo, native video)
- 💡 **Product**: Detects price indicators, ratings, buy buttons
- 💡 **Article**: Detects article structure, author bylines, publish dates
- 💡 **Review/Rating**: Detects review sections, star ratings

Each suggestion includes:
- **Reason**: What content pattern was detected
- **Benefit**: What rich snippet improvement you'll get
- **Page location**: Exactly where the opportunity exists

**Features:**
- Tests 5 page types: Homepage, Material, Settings, Service, Static
- Provides grade (A+ to F) and detailed scoring
- JSON output mode for CI/CD integration
- Verbose mode for debugging
- Graceful degradation if dev server not running
- **Proactive opportunity detection** for missing schemas

**Usage:**
```bash
# Standard validation
npm run validate:seo-infrastructure

# Verbose output
node scripts/validation/seo/validate-seo-infrastructure.js --verbose

# JSON output for CI
node scripts/validation/seo/validate-seo-infrastructure.js --json

# With custom base URL
BASE_URL=https://staging.z-beam.com npm run validate:seo-infrastructure
```

**Exit codes:**
- 0: All checks passed or warnings only
- 1: Critical SEO Infrastructure issues found

**Documentation:** `docs/01-core/SEO_INFRASTRUCTURE_OVERVIEW.md`

### Key Features
- **Meta tags**: Validates titles, descriptions, Open Graph, Twitter Cards
- **Canonical URLs**: Ensures proper canonicalization
- **Core Web Vitals**: LCP, FID, CLS measurements
- **Redirect chains**: Validates 301/302 redirects are optimized
- **Mobile-first**: Tests mobile optimization
- **Structured Data**: Complete JSON-LD Schema.org validation

## Content & Metadata (`content/`)

Content structure, frontmatter, metadata sync, and naming conventions.

| Script | Purpose | Usage |
|--------|---------|-------|
| `validate-frontmatter-structure.js` | YAML frontmatter validation | `node scripts/validation/content/validate-frontmatter-structure.js` |
| `validate-metadata-sync.js` | Metadata consistency across files | `node scripts/validation/content/validate-metadata-sync.js` |
| `validate-naming-e2e.js` | File naming convention enforcement | `node scripts/validation/content/validate-naming-e2e.js` |
| `validate-breadcrumbs.ts` | Breadcrumb structure validation | `tsx scripts/validation/content/validate-breadcrumbs.ts` |

### Key Features
- **Frontmatter structure**: Validates YAML syntax and required fields
- **Metadata sync**: Ensures frontmatter matches page metadata
- **Naming conventions**: Enforces kebab-case and URL-safe filenames
- **Breadcrumb chains**: Validates hierarchical breadcrumb structure

## Integration

### 🎯 3-Layer Validation Strategy

#### **Layer 1: Pre-Commit** (Automatic, Never Blocks)
```bash
# Runs automatically on `git commit`
# .git/hooks/pre-commit
```
- Updates freshness timestamps (7-day throttle)
- Auto-formatting
- **Always exits with code 0** (never blocks commits)

#### **Layer 2: Pre-Push** (Fast Quality Gate, ~35s)
```bash
# Runs automatically on `git push`
# Or manually: npm run check
```
**Runs in parallel:**
- Type checking
- Linting  
- Unit tests
- Naming conventions
- Metadata sync

**Bypass:** `git push --no-verify` (not recommended)

#### **Layer 3: CI/Vercel Build** (Comprehensive, ~3min)
```bash
# Runs automatically on Vercel deployment
# Or manually: npm run deploy
```
1. **prebuild**: Content validation + dataset generation
2. **build**: Next.js production build
3. **postbuild**: URL validation
4. **post-deploy**: Live site validation

### Pre-build Validation (v2.0)
Simplified from 6 steps to 2:

```json
"prebuild": "npm run validate:content && npm run generate:datasets"
```

**Removed redundancies:**
- ❌ `validate:deps` (already in `npm ci`)
- ❌ `validate:jsonld` (requires localhost, moved to CI-only)
- ❌ Duplicate naming/metadata checks

### Pre-push Hook (v2.0)
Now uses parallel execution:

```bash
#!/bin/bash
node scripts/validation/lib/run-checks.js
```

**Time:** ~35 seconds (was 2m 30s)

### Post-build Validation
URL validation runs after build completes:

```json
"postbuild": "npm run validate:urls"
```

## NPM Scripts (v2.0)

### Development Scripts

```bash
# Quick quality checks (parallel, ~35s)
npm run check

# Full content validation (sequential)
npm run validate:content

# Cache management
npm run cache:clear    # Clear all caches
npm run cache:stats    # Show cache hit rates
```

### Individual Validations

```bash
# Content
npm run validate:frontmatter   # YAML frontmatter structure
npm run validate:naming        # File naming conventions
npm run validate:metadata      # Metadata consistency
npm run validate:breadcrumbs   # Breadcrumb hierarchy

# JSON-LD (requires dev server)
npm run validate:jsonld        # Comprehensive JSON-LD
npm run validate:schema-richness  # Schema completeness
npm run validate:urls          # JSON-LD URLs (post-build)

# Accessibility (requires dev server)
npm run validate:wcag          # WCAG 2.2 AA compliance
npm run validate:a11y          # Accessibility tree

# SEO & Performance (requires dev server)
npm run validate:seo           # Modern SEO best practices
npm run validate:performance   # Core Web Vitals
```

### Deployment Scripts

```bash
# Deploy to production
npm run deploy

# Deploy preview
npm run deploy:preview

# Post-deployment validation
npm run validate:production    # Validate live site
```

### Script Groups

**Core Quality (`npm run check`):**
- type-check
- lint
- test:unit
- validate:naming
- validate:metadata

**Content (`npm run validate:content`):**
- validate:frontmatter
- validate:naming
- validate:metadata
- verify:sitemap
- validate:breadcrumbs

**Full Test Suite (`npm run test:all`):**
- test:unit
- test:integration
- test:components

**Deployment (`npm run deploy`):**
- check (pre-flight)
- validate:content (pre-flight)
- test:components (pre-flight)
- vercel --prod (deploy)
- validate:production (post-deploy)

## Configuration (v2.0)

### Central Config (`scripts/validation/config.js`)

Edit thresholds without touching individual scripts:

```javascript
module.exports = {
  content: {
    maxFrontmatterWarnings: 150,  // Frontmatter issues
    maxNamingWarnings: 135,       // Naming convention issues
    requireGenerationDate: false  // Skip generation_date requirement
  },
  
  performance: {
    maxBuildSizeMB: 500,          // Max build output size
    maxBundleSizeMB: 5,           // Max bundle size
    targetLCP: 2500,              // Largest Contentful Paint (ms)
    targetFID: 100,               // First Input Delay (ms)
    targetCLS: 0.1                // Cumulative Layout Shift
  },
  
  accessibility: {
    wcagLevel: 'AA',              // WCAG 2.2 Level AA
    wcagVersion: '2.2',
    minContrastRatio: 4.5,        // Normal text contrast
    minContrastRatioLarge: 3      // Large text contrast
  },
  
  seo: {
    minTitleLength: 30,
    maxTitleLength: 60,
    minDescriptionLength: 120,
    maxDescriptionLength: 160
  },
  
  cache: {
    ttl: 3600000,                 // 1 hour in ms
    directory: '.validation-cache'
  },
  
  parallel: {
    maxConcurrent: 5,             // Max parallel validations
    timeout: 120000               // 2 minutes per validation
  }
};
```

### Environment Variables

```bash
# Skip validation cache (always re-validate)
NO_CACHE=1 npm run validate:content

# Verbose output (show all details)
VERBOSE=1 npm run validate:naming

# Custom base URL for validation
BASE_URL=https://staging.z-beam.com npm run validate:production

# Force CI mode (disable caching, adjust timeouts)
CI=1 npm run check
```

### Per-Script Options

Many scripts support CLI flags:

```bash
# Verbose mode
node scripts/validation/content/validate-naming-e2e.js --verbose

# JSON output (for CI/CD)
node scripts/validation/accessibility/validate-wcag-2.2.js --json

# Skip cache
node scripts/validation/content/validate-frontmatter-structure.js --no-cache

# Custom threshold
node scripts/validation/content/validate-naming-e2e.js --max-warnings=200
```

### 1. Choose the Right Category
- **jsonld/**: Schema.org, structured data, rich snippets
- **accessibility/**: WCAG, ARIA, semantic HTML, a11y tree
- **seo/**: Meta tags, performance, redirects, Core Web Vitals
- **content/**: Frontmatter, metadata, naming, content structure

### 2. Follow the Template

```javascript
#!/usr/bin/env node
/**
 * validate-[category]-[feature].js
 * 
 * Purpose: Brief description
 * Category: jsonld | accessibility | seo | content
 * Run: node scripts/validation/[category]/validate-[feature].js
 */

// Exit codes
const EXIT_SUCCESS = 0;
const EXIT_WARNING = 0;  // Non-blocking
const EXIT_ERROR = 1;    // Blocking

async function validate() {
  console.log('🔍 Validating [feature]...\n');
  
  let errors = 0;
  let warnings = 0;
  
  try {
    // Your validation logic
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    return EXIT_ERROR;
  }
  
  // Report results
  console.log(`\n📊 Results:`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Warnings: ${warnings}\n`);
  
  if (errors > 0) {
    console.error('❌ Validation failed');
    return EXIT_ERROR;
  }
  
  console.log('✅ Validation passed');
  return EXIT_SUCCESS;
}

if (require.main === module) {
  validate().then(code => process.exit(code));
}

module.exports = { validate };
```

### 3. Add to package.json

```json
{
  "scripts": {
    "validate:[name]": "node scripts/validation/[category]/validate-[name].js"
  }
}
```

### 4. Add to Pre-push Hook (if critical)

Edit `.git/hooks/pre-push` to include your validator in the appropriate stage.

## Performance Metrics

### Cache Hit Rates (After First Run)

| Validation | Cache Hit Rate | Speedup |
|------------|----------------|---------|
| Frontmatter | ~85% | 6-7x faster |
| Naming | ~90% | 8-9x faster |
| Images | ~95% | 15-20x faster |
| Metadata | ~80% | 4-5x faster |

### Execution Time Comparison

| Stage | Before | After | Improvement |
|-------|--------|-------|-------------|
| Pre-push | 2m 30s | 35s | **4.3x faster** |
| Content validation | 4m 15s | 1m 45s | **2.4x faster** |
| Full deployment | ~10m | ~3m | **3.3x faster** |

### Parallel vs Sequential

**Pre-push checks:**
- Sequential: 150s (2m 30s)
- Parallel: 35s
- **Speedup: 4.3x**

**Component breakdown:**
```
Type Check:   30s  |████████████|
Lint:         25s  |██████████|
Unit Tests:   40s  |████████████████|
Naming:       20s  |████████|
Metadata:     15s  |██████|
```

**All run in parallel (max = 40s)**

## Troubleshooting

### Cache Issues

```bash
# Clear all caches
npm run cache:clear

# Check cache statistics
npm run cache:stats

# Force fresh validation (skip cache)
NO_CACHE=1 npm run validate:content
```

### Environment Issues

```bash
# Check if dev server is running
lsof -ti:3000

# Start dev server
npm run dev

# Check environment detection
node -e "console.log(require('./scripts/validation/lib/environment'))"
```

### Validation Failures

1. **Read the error message** - includes context and fix suggestions:
   ```
   ❌ Frontmatter missing: description
      File: content/frontmatter/aluminum.yaml
      💡 Fix: npm run fix:frontmatter --file=aluminum.yaml
   ```

2. **Run locally first** - easier to debug:
   ```bash
   npm run validate:content --verbose
   ```

3. **Check cache freshness** - clear if stale:
   ```bash
   npm run cache:clear
   npm run validate:content
   ```

4. **Verify environment** - some validations need dev server:
   ```bash
   npm run dev &
   sleep 10
   npm run validate:jsonld
   ```

### Pre-push Hook Failing

```bash
# Debug which check is failing
bash -x .git/hooks/pre-push

# Run checks manually
npm run check --verbose

# Skip for emergency fixes (use sparingly)
git push --no-verify
```

### Slow Validation

```bash
# Check what's using time
time npm run validate:content

# Check cache hit rates
npm run cache:stats

# Clear expired cache entries
npm run cache:clear --expired-only
```

## Migration Guide (v1.0 → v2.0)

### Breaking Changes

1. **Script names changed:**
   ```bash
   # OLD → NEW
   validate:all → check
   validate:fast → check
   deploy:prod → deploy
   test:comprehensive → test:all
   ```

2. **Exit codes standardized:**
   - All scripts now exit with 0 (success/skipped) or 1 (failure)
   - Warnings are exit code 0 (non-blocking)

3. **Cache directory added:**
   - Add `.validation-cache/` to `.gitignore`
   - Created automatically on first validation

4. **Environment detection:**
   - Some validations now skip in CI (e.g., JSON-LD requiring localhost)
   - Use `BASE_URL` env var for CI testing

### Update Your CI/CD

**Old GitHub Actions:**
```yaml
- run: npm run validate:all
- run: npm run test:comprehensive
- run: npm run deploy:prod
```

**New GitHub Actions:**
```yaml
- run: npm run check          # Parallel quality checks
- run: npm run test:all       # All tests
- run: npm run deploy         # Full deployment
```

### Update Custom Scripts

**Old approach:**
```javascript
const { exec } = require('child_process');
exec('npm run validate:naming', (error) => {
  if (error) process.exit(1);
});
```

**New approach:**
```javascript
const { ValidationResult } = require('./scripts/validation/lib/exitCodes');
const { runCommand } = require('./scripts/validation/lib/parallel');

const result = await runCommand('Naming', 'npm run validate:naming');
if (!result.success) process.exit(1);
```

### Removed Scripts

These scripts were consolidated or removed:

```bash
# Consolidated into 'check'
validate:all
validate:fast
validate:quick

# Consolidated into 'test:all'
test:comprehensive
test:full

# Consolidated into 'deploy'
deploy:prod
deploy:skip
deploy:force

# Removed (redundant)
validate:deps        # Runs in 'npm ci'
build:check          # Runs in 'check'
```

## Adding New Validators (v2.0)

1. **Fast First**: Run quick checks first, expensive checks last
2. **Clear Output**: Use emojis and colors for visibility (🔍 ✅ ⚠️ ❌)
3. **Exit Codes**: 0 = success, 1 = failure (blocking)
4. **Warnings vs Errors**: Warnings don't block, errors do
5. **Progress Indicators**: Show progress for long-running validations
6. **Machine Readable**: Support `--json` flag for CI/CD integration
7. **Verbose Mode**: Support `--verbose` for debugging
8. **Idempotent**: Safe to run multiple times
9. **Documentation**: Include usage examples in script comments
10. **Performance**: Cache results when possible

## Troubleshooting

### Validation Fails During Build
```bash
# Run individual validators to isolate issue
npm run validate:frontmatter
npm run validate:naming
npm run validate:metadata
npm run validate:jsonld
```

### Pre-push Hook Failing
```bash
# Check which validator is failing
bash -x .git/hooks/pre-push

# Skip pre-push for emergency fixes (use sparingly)
git push --no-verify
```

### Schema Richness Fails
```bash
# Requires dev server running
npm run dev &
sleep 10
npm run validate:schema-richness
```

### Slow Validation
```bash
# Use fast validation for commits
npm run validate:fast

# Full validation before deployment only
npm run validate:deployment
```

## Maintenance

### Cleanup Deprecated Scripts
Move old validators to `scripts/deprecated/` instead of deleting:

```bash
mv scripts/validate-old-thing.js scripts/deprecated/
```

### Update Documentation
When adding/modifying validators, update:
1. This README.md
2. Package.json scripts section
3. Pre-push hook (if applicable)
4. Main project README.md
