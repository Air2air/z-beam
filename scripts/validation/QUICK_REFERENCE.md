# Validation Quick Reference

## 🚀 Most Common Commands

```bash
# Before committing
npm run validate:fast              # Type check + unit tests (~30s)

# Before pushing
# (runs automatically via git hook)
npm run type-check                 # TypeScript
npm run lint                       # ESLint
npm run test:unit                  # Unit tests
npm run validate:naming            # File naming
npm run validate:metadata          # Metadata sync
npm run validate:wcag-2.2:static   # WCAG static
npm run validate:schema-richness   # Schema richness

# Full validation suite
npm run validate                   # Complete suite (~5min)

# Before deployment
npm run validate:deployment        # Type + tests + build
```

## 📁 Directory Structure

```
validation/
├── jsonld/              # Schema.org, rich snippets, structured data
├── accessibility/       # WCAG 2.2, ARIA, semantic HTML
├── seo/                # Meta tags, Core Web Vitals, redirects
└── content/            # Frontmatter, metadata, naming
```

## 🎯 By Category

### JSON-LD & Structured Data
```bash
npm run validate:jsonld                 # Jest tests (fast)
npm run validate:jsonld:comprehensive   # Complete validation
npm run validate:schema-richness        # Schema completeness
npm run validate:urls                   # URL consistency
```

### Accessibility
```bash
npm run validate:wcag-2.2              # Full WCAG 2.2 AA
npm run validate:wcag-2.2:static       # Static checks only (fast)
npm run validate:a11y-tree             # Accessibility tree
npm run validate:markup                # WCAG + A11y tree
```

### SEO & Performance
```bash
npm run validate:seo                   # Meta tags, OG, Twitter
npm run validate:core-web-vitals       # LCP, FID, CLS
npm run validate:redirects             # Redirect chains
npm run validate:performance           # All performance checks
```

### Content & Metadata
```bash
npm run validate:frontmatter           # YAML structure
npm run validate:metadata              # Metadata sync
npm run validate:naming                # File naming conventions
npm run validate:breadcrumbs           # Breadcrumb structure
```

## ⚡ By Speed

### Fast (<30s) - Use Frequently
- `validate:fast` - Type check + unit tests
- `validate:wcag-2.2:static` - Static accessibility
- `validate:metadata` - Metadata sync
- `validate:naming` - File naming

### Medium (30s-2min) - Pre-commit/Push
- `validate:jsonld` - Schema validation
- `validate:schema-richness` - Schema completeness
- `validate:a11y-tree` - Accessibility tree
- `type-check` + `lint` + `test:unit`

### Slow (2min+) - Pre-deployment Only
- `validate` - Full suite
- `validate:deployment` - With build
- `validate:all` - Every validator
- `validate:highest-scoring` - All quality checks

## 🔧 By Use Case

### Local Development
```bash
npm run dev                # Start dev server
npm run validate:fast      # Quick checks
npm run test:watch         # Watch mode
```

### Pre-Commit
```bash
npm run precommit          # Runs automatically
# or manually:
npm run validate:fast
```

### Pre-Push (Automatic)
Git hook runs:
1. Type checking
2. Linting
3. Unit tests
4. Naming conventions
5. Metadata sync
6. WCAG static checks
7. Schema richness

### Pre-Deployment
```bash
npm run validate:deployment    # Type + deploy tests + build
npm run validate:all          # Every validator
```

### Troubleshooting
```bash
# Isolate failures
npm run validate:frontmatter
npm run validate:naming
npm run validate:metadata
npm run validate:jsonld

# Verbose output
npm run validate:metadata:verbose
npm run validate:a11y-tree:report

# Specific checks
npm run validate:wcag-2.2:static
npm run validate:core-web-vitals:mobile
npm run validate:schema-richness:strict
```

## 📊 Exit Codes

- **0** = Success, validation passed
- **1** = Failure, validation failed (blocks deployment)

Warnings don't block builds/pushes, only errors do.

## 🎨 Output Symbols

- 🔍 = Starting validation
- ✅ = Passed
- ⚠️  = Warning (non-blocking)
- ❌ = Error (blocking)
- 📊 = Results summary
- ℹ️  = Information

## 🚨 Emergency Bypass

```bash
# Skip pre-push hook (use sparingly!)
git push --no-verify

# Skip pre-commit hook
git commit --no-verify -m "message"
```

**Note:** These should only be used in emergencies. Fix validation issues instead!

## 📝 Adding to Workflow

### CI/CD Pipeline
```yaml
- name: Validate
  run: npm run validate:deployment
```

### GitHub Actions
```yaml
- name: Pre-push validation
  run: |
    npm run type-check
    npm run lint
    npm run test:unit
    npm run validate:naming
    npm run validate:metadata
```

### Package.json Script
```json
{
  "scripts": {
    "my-workflow": "npm run validate:fast && npm run build && npm run deploy"
  }
}
```

## 🐛 Common Issues

### "Schema richness validation failed"
- **Cause:** Dev server not running
- **Fix:** `npm run dev` then run validation

### "Naming conventions failed"
- **Cause:** File uses camelCase instead of kebab-case
- **Fix:** Rename file to kebab-case

### "Metadata sync failed"
- **Cause:** Frontmatter doesn't match page metadata
- **Fix:** Update frontmatter or metadata to match

### "WCAG validation failed"
- **Cause:** Missing ARIA labels or color contrast issues
- **Fix:** Check output for specific issues

## 📚 More Information

- **Full docs:** `scripts/validation/README.md`
- **Script locations:** `scripts/validation/[category]/`
- **Test locations:** `tests/`
- **CI config:** `.git/hooks/pre-push`
