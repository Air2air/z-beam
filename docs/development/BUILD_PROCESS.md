# Build Process Documentation

## Overview

The Z-Beam build process ensures data quality, completeness, and validation before deployment. All builds—whether local, CI, or production—execute required data generation and validation steps.

## Build Commands

### Local Development
```bash
npm run dev           # Development server (no build)
npm run build         # Full production build with validation
npm run build:analyze # Build with bundle analysis
```

### Production Deployment
```bash
npm run deploy        # Full deployment with pre-flight checks
vercel --prod         # Direct Vercel deployment (uses vercel-build)
```

### CI/CD
```bash
npm run vercel-build  # Vercel's build command (includes all required steps)
```

## Build Stages

### 1. Pre-Build (Automatic)
Runs before every build via `prebuild` hook:

```bash
npm run validate:content  # Content structure validation
npm run generate:datasets # Generate all dataset files
```

**Critical Steps:**
- **Content Validation**: Validates YAML frontmatter structure, naming conventions, metadata consistency
- **Dataset Generation**: 
  - Generates 396 material dataset files (JSON, CSV, TXT)
  - Generates 396 settings dataset files (JSON, CSV, TXT)
  - **REQUIREMENT**: All 9 machine parameters must be included in every settings file

### 2. Build
```bash
next build  # Next.js production build
```

Compiles:
- React components to optimized bundles
- Server-side rendering logic
- Static pages and dynamic routes
- API routes

### 3. Post-Build (Automatic)
Runs after build via `postbuild` hook:

```bash
npm run validate:urls  # Validates JSON-LD URLs and schema
```

## Build Scripts Reference

### Primary Build Commands

| Command | Purpose | Runs Prebuild? | Runs Postbuild? |
|---------|---------|---------------|----------------|
| `npm run build` | Standard production build | ✅ Yes | ✅ Yes |
| `npm run vercel-build` | Vercel platform build | ✅ Yes (explicit) | ✅ Yes |
| `npm run dev` | Development mode | ❌ No | ❌ No |
| `npm run build:analyze` | Build with bundle analysis | ✅ Yes | ✅ Yes |

### Dataset Generation

```bash
npm run generate:datasets
```

Runs two scripts sequentially:
1. `tsx scripts/generate-datasets.ts` - Material datasets (396 files)
2. `node scripts/generate-settings-datasets.js` - Settings datasets (396 files)

**Output:**
- `public/datasets/materials/*.{json,csv,txt}` - 132 materials × 3 formats
- `public/datasets/settings/*.{json,csv,txt}` - 132 materials × 3 formats

**Requirements:**
- All 9 machine parameters must be present
- Descriptions merged from material YAML files
- No empty sections in output files
- Consistent parameter ordering

### Validation Commands

| Command | Purpose | When Run |
|---------|---------|----------|
| `validate:content` | Structure, naming, metadata | Pre-build |
| `validate:frontmatter` | YAML frontmatter structure | On-demand |
| `validate:metadata` | Metadata synchronization | On-demand |
| `validate:naming` | File naming conventions | On-demand |
| `validate:breadcrumbs` | Navigation breadcrumb structure | On-demand |
| `validate:urls` | JSON-LD URL correctness | Post-build |
| `validate:production` | Production site validation | Post-deploy |
| `validate:seo` | SEO compliance | On-demand |
| `validate:a11y` | Accessibility (WCAG 2.2) | On-demand |

## Vercel Build Configuration

### vercel.json
```json
{
  "buildCommand": "npm run vercel-build",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

**Why `vercel-build`?**
- `vercel-build` explicitly includes validation and dataset generation
- Bypasses npm hooks to have full control over build order
- Ensures consistency between local and platform builds

### package.json Build Hooks
```json
{
  "scripts": {
    "prebuild": "npm run validate:content && npm run generate:datasets",
    "build": "next build",
    "postbuild": "npm run validate:urls",
    "vercel-build": "npm run validate:content && npm run generate:datasets && next build"
  }
}
```

## Deployment Script Integration

### scripts/deployment/deploy.sh

Pre-flight validation includes:
1. Quality checks (`npm run check`)
2. Content validation (`npm run validate:content`)
3. **Dataset generation** (`npm run generate:datasets`)
4. Component tests (`npm run test:components`)

Only after all pre-flight checks pass:
- Deploys to Vercel
- Runs post-deployment validation

## Build Failures

### Common Issues

**Empty Settings Files**
- **Symptom**: Settings TXT files have empty parameter sections
- **Cause**: Dataset generation didn't run or failed
- **Fix**: Verify `generate:datasets` runs in prebuild
- **Prevention**: Tests in `tests/dataset-generation.test.js`

**Content Validation Errors**
- **Symptom**: Build stops before compilation
- **Cause**: Invalid YAML structure, missing fields, naming issues
- **Fix**: Run `npm run validate:content` locally to see errors
- **Prevention**: Pre-commit hooks, editor validation

**Missing Dataset Files**
- **Symptom**: 404 errors on dataset downloads
- **Cause**: Dataset generation skipped or incomplete
- **Fix**: Run `npm run generate:datasets` manually
- **Prevention**: Verify 396 files exist in `public/datasets/`

**Build Timeout on Vercel**
- **Symptom**: Build exceeds time limit
- **Cause**: Dataset generation + build takes too long
- **Fix**: Consider caching strategies or incremental generation
- **Current**: Both scripts complete in ~30 seconds

## Testing Build Process

### Local Test
```bash
# Clean build from scratch
npm run clean
npm ci
npm run build

# Verify datasets generated
ls -l public/datasets/materials/*.txt | wc -l  # Should be 132
ls -l public/datasets/settings/*.txt | wc -l   # Should be 132
```

### Verify Dataset Content
```bash
# Run dataset validation tests
npm run test:datasets

# Check specific file
head -50 public/datasets/settings/aluminum-settings.txt

# Verify all parameters present
grep -c "POWER RANGE:" public/datasets/settings/*.txt  # Should be 132
```

### Simulate Vercel Build
```bash
# Run exact same command as Vercel
npm run vercel-build

# Check output
ls -lh .next
```

## Optimization

### Build Time Breakdown
- Content validation: ~5 seconds
- Dataset generation: ~30 seconds
  - Material datasets: ~15 seconds
  - Settings datasets: ~15 seconds
- Next.js build: ~2-3 minutes
- Total: ~3-4 minutes

### Caching Strategy
- Dataset files committed to repository
- Only regenerate when YAML files change
- Vercel caches node_modules and `.next` directory
- Consider pre-generated datasets for faster builds

### Future Improvements
1. **Incremental Generation**: Only regenerate changed materials
2. **Parallel Processing**: Generate material and settings datasets concurrently
3. **Build Cache**: Skip dataset generation if YAML unchanged
4. **Validation Cache**: Cache validation results for unchanged files

## Troubleshooting

### Build Hangs
Check if dataset generation is stuck:
```bash
# Test dataset generation alone
npm run generate:datasets

# Monitor progress
tsx scripts/generate-datasets.ts 2>&1 | tee dataset-generation.log
```

### Inconsistent Builds
Ensure clean state:
```bash
npm run clean
rm -rf public/datasets
npm run build
```

### Missing Dependencies
Verify all required packages:
```bash
npm run check  # Runs dependency validation
npm ci         # Clean install from package-lock
```

## References

- Build scripts: `package.json`
- Dataset generation: `scripts/generate-datasets.ts`, `scripts/generate-settings-datasets.js`
- Validation: `scripts/validation/lib/run-content-validation.js`
- Deployment: `scripts/deployment/deploy.sh`
- Vercel config: `vercel.json`
- Tests: `tests/dataset-generation.test.js`
