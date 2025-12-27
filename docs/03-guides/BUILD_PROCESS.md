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
```

**Critical Steps:**
- **Content Validation**: Validates YAML frontmatter structure, naming conventions, metadata consistency

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
- `vercel-build` explicitly includes validation
- Bypasses npm hooks to have full control over build order
- Ensures consistency between local and platform builds

### package.json Build Hooks
```json
{
  "scripts": {
    "prebuild": "npm run validate:content && npm run validate:naming:semantic && npm run validate:types",
    "build": "next build",
    "postbuild": "npm run validate:urls",
    "vercel-build": "npm run validate:content && next build"
  }
}
```

## Deployment Script Integration

### scripts/deployment/deploy.sh

Pre-flight validation includes:
1. Quality checks (`npm run check`)
2. Content validation (`npm run validate:content`)
3. Component tests (`npm run test:components`)

Only after all pre-flight checks pass:
- Deploys to Vercel
- Runs post-deployment validation

## Build Failures

### Common Issues

**Content Validation Errors**
- **Symptom**: Build stops before compilation
- **Cause**: Invalid YAML structure, missing fields, naming issues
- **Fix**: Run `npm run validate:content` locally to see errors
- **Prevention**: Pre-commit hooks, editor validation

**Build Timeout on Vercel**
- **Symptom**: Build exceeds time limit
- **Cause**: Build takes too long
- **Fix**: Consider caching strategies or optimization

## Testing Build Process

### Local Test
```bash
# Clean build from scratch
npm run clean
npm ci
npm run build
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
- Next.js build: ~2-3 minutes
- Total: ~2-4 minutes

### Caching Strategy
- Vercel caches node_modules and `.next` directory

### Future Improvements
1. **Parallel Processing**: Run validations concurrently
2. **Build Cache**: Skip validation for unchanged files
3. **Validation Cache**: Cache validation results for unchanged files

## Troubleshooting

### Build Hangs
Check if validation is stuck:
```bash
# Test validation alone
npm run validate:content
```

### Inconsistent Builds
Ensure clean state:
```bash
npm run clean
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
- Validation: `scripts/validation/lib/run-content-validation.js`
- Deployment: `scripts/deployment/deploy.sh`
- Vercel config: `vercel.json`
