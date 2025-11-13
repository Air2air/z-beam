# Pre-Deployment Validation Quick Reference

## 🚀 Quick Start

```bash
# Full validation + deploy (RECOMMENDED)
./scripts/deployment/deploy-with-validation.sh

# With monitoring
./scripts/deployment/deploy-with-validation.sh --monitor

# Emergency (skip all - NOT RECOMMENDED)
./scripts/deployment/deploy-with-validation.sh --skip-validation
```

## 📋 23-Point Validation Checklist

### ✅ FOUNDATION (5 checks)
- [ ] 1. Git status & commit info
- [ ] 2. File naming conventions ⚠️ CRITICAL
- [ ] 3. Metadata synchronization ⚠️ CRITICAL
- [ ] 4. TypeScript type checking ⚠️ CRITICAL
- [ ] 5. Code quality (ESLint)

### ✅ CONTENT & STRUCTURE (6 checks)
- [ ] 6. Sitemap verification ⚠️ CRITICAL
- [ ] 7. Content validation
- [ ] 8. JSON-LD architecture ⚠️ CRITICAL
- [ ] 9. JSON-LD rendering ⚠️ CRITICAL
- [ ] 10. JSON-LD syntax ⚠️ CRITICAL
- [ ] 11. JSON-LD URLs

### ✅ ARCHITECTURE & ROUTING (3 checks)
- [ ] 12. Component architecture audit
- [ ] 13. Grok validation
- [ ] 14. Redirects & routing

### ✅ TEST SUITES (5 checks)
- [ ] 15. Unit tests ⚠️ CRITICAL
- [ ] 16. Integration tests
- [ ] 17. Component tests
- [ ] 18. Sitemap tests ⚠️ CRITICAL
- [ ] 19. Deployment tests ⚠️ CRITICAL

### ✅ BUILD & ARTIFACTS (4 checks)
- [ ] 20. Production build ⚠️ CRITICAL
- [ ] 21. Build artifacts ⚠️ CRITICAL
- [ ] 22. Post-build URLs ⚠️ CRITICAL
- [ ] 23. Dataset generation

## ⚠️ Critical Checks (13 total)

**Deployment ABORTS if any fail:**

1. File naming conventions
2. Metadata synchronization
3. TypeScript type checking
4. Sitemap verification
5. JSON-LD architecture
6. JSON-LD rendering
7. JSON-LD syntax
8. Unit tests
9. Sitemap tests
10. Deployment tests
11. Production build
12. Build artifacts
13. Post-build URL validation

## 💡 Non-Critical Checks (10 total)

**Shows warnings, continues:**

1. Git status (informational)
2. Code linting
3. Content validation
4. JSON-LD URLs
5. Component architecture
6. Grok validation
7. Redirects validation
8. Integration tests
9. Component tests
10. Dataset generation

## ⏱️ Timing

- **Full validation**: 3-7 minutes
- **Quick validation** (skip non-critical): Not available
- **No validation** (--skip-validation): Instant (dangerous!)

## 🎯 What Gets Validated

### SEO & Rich Data ✅
- Sitemap structure & completeness
- JSON-LD schema patterns
- Schema rendering in HTML
- Syntax correctness
- URL validity
- Metadata consistency

### Code Quality ✅
- TypeScript type safety
- ESLint compliance
- Component patterns
- File naming standards

### Content ✅
- Content integrity
- Frontmatter validation
- URL structure
- Redirect rules
- Dataset generation

### Testing ✅
- Unit tests
- Integration tests
- Component tests
- Sitemap tests
- Deployment tests

### Build ✅
- Production build
- Build artifacts
- Static generation
- URL validation

## 🔧 Manual Validation (if needed)

```bash
# Individual checks
npm run validate:naming              # File naming
npm run validate:metadata            # Metadata sync
npm run type-check                   # TypeScript
npm run lint                         # Code quality
npm run validate:jsonld              # JSON-LD architecture
npm run test:unit                    # Unit tests
npm run test:deployment              # Deployment tests
npm run build                        # Production build
bash scripts/sitemap/verify-sitemap.sh  # Sitemap
node scripts/validate-jsonld-rendering.js  # JSON-LD render
```

## 📊 Output Example

```
═══════════════════════════════════════════════════════
  VALIDATION SUMMARY
═══════════════════════════════════════════════════════

  ✅ Passed:  20
  ❌ Failed:  0
  ⚠️  Warnings: 3

[20:45:45] ✅ SUCCESS: All pre-deployment validations PASSED!

═══════════════════════════════════════════════════════
  DEPLOYMENT CONFIRMATION
═══════════════════════════════════════════════════════

You are about to deploy to PRODUCTION.

Do you want to proceed? (yes/no):
```

## 🚨 If Validation Fails

1. **Read the error output** - Script shows which check failed
2. **Fix the issue** - Address the specific problem
3. **Re-run validation** - Test your fix
4. **Deploy** - Once all checks pass

### Common Failures

**TypeScript errors:**
```bash
npm run type-check  # See detailed errors
```

**Test failures:**
```bash
npm run test:deployment -- --verbose
```

**JSON-LD issues:**
```bash
node scripts/validate-jsonld-rendering.js
```

**Build failures:**
```bash
npm run build  # See build errors
```

## 💾 Git Workflow Integration

```bash
# 1. Make changes
git add .
git commit -m "feat: your changes"
git push

# 2. Validate & deploy
./scripts/deployment/deploy-with-validation.sh

# 3. Monitor (if using --monitor flag)
# Automatic monitoring starts
```

## 🆘 Emergency Override

⚠️ **Only use in genuine emergencies!**

```bash
# Skip ALL validation (dangerous!)
./scripts/deployment/deploy-with-validation.sh --skip-validation
```

**When to use:**
- Critical hotfix needed immediately
- Already validated manually
- Deployment blocking production issue

**When NOT to use:**
- Regular deployments
- Feature releases
- Any time you have 3-7 minutes

## 📚 More Info

- Full documentation: `scripts/deployment/README.md`
- Help: `./scripts/deployment/deploy-with-validation.sh --help`
- Manual validation: `npm run validate:all`

## 🎉 Success Indicators

✅ **All checks passed** = Ready to deploy
⚠️ **Warnings only** = Safe to deploy (review warnings)
❌ **Critical failure** = Fix before deploying

---

**Last Updated:** November 4, 2025
**Script Version:** 2.0 (Comprehensive)
