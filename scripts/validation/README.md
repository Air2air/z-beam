# Validation Scripts

Comprehensive validation tools for markup, semantics, accessibility, SEO, and structured data.

## Directory Structure

```
validation/
├── README.md                    # This file
├── jsonld/                      # JSON-LD & Structured Data validation
├── accessibility/               # WCAG & A11y compliance validation
├── seo/                        # SEO & Performance validation
└── content/                    # Content structure & metadata validation
```

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
| `validate-modern-seo.js` | Modern SEO best practices | `node scripts/validation/seo/validate-modern-seo.js` |
| `validate-core-web-vitals.js` | Core Web Vitals metrics | `node scripts/validation/seo/validate-core-web-vitals.js` |
| `validate-redirects.js` | Redirect chain validation | `node scripts/validation/seo/validate-redirects.js` |

### Key Features
- **Meta tags**: Validates titles, descriptions, Open Graph, Twitter Cards
- **Canonical URLs**: Ensures proper canonicalization
- **Core Web Vitals**: LCP, FID, CLS measurements
- **Redirect chains**: Validates 301/302 redirects are optimized
- **Mobile-first**: Tests mobile optimization

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

### Pre-build Validation
All critical validations run automatically before production builds:

```json
"prebuild": "npm run validate:frontmatter && npm run validate:naming && npm run validate:metadata && npm run verify:sitemap && npm run validate:jsonld && npm run validate:breadcrumbs && npm run generate:datasets"
```

### Pre-push Hook
Quick validation suite runs before git push (`.git/hooks/pre-push`):
1. TypeScript type checking
2. ESLint
3. Unit tests
4. Naming conventions
5. Metadata sync
6. WCAG 2.2 checks
7. Schema richness

### Post-build Validation
URL validation runs after build completes:

```json
"postbuild": "npm run validate:urls"
```

## NPM Scripts

Add these to your workflow:

```bash
# Complete validation suite
npm run validate

# Individual validations
npm run validate:jsonld        # JSON-LD comprehensive
npm run validate:wcag          # WCAG 2.2 accessibility
npm run validate:metadata      # Metadata sync
npm run validate:naming        # File naming
npm run validate:breadcrumbs   # Breadcrumb structure
npm run validate:urls          # JSON-LD URLs (post-build)

# Fast validation (pre-commit)
npm run validate:fast          # Type check + unit tests

# Deployment validation
npm run validate:deployment    # Type check + deployment tests + build
```

## Adding New Validators

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

## Best Practices

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
