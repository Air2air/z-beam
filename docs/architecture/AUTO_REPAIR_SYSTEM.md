# Automatic Validation Repair System

**Complete Documentation for Self-Healing Validation**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Auto-Repair Tools](#auto-repair-tools)
4. [Usage Guide](#usage-guide)
5. [Integration](#integration)
6. [What Gets Auto-Fixed](#what-gets-auto-fixed)
7. [Manual Review Required](#manual-review-required)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The Z-Beam Automatic Validation Repair System is a self-healing validation infrastructure that **detects, repairs, and validates** code issues automatically. Instead of just reporting problems, it fixes them.

### Key Principles

- **Detect First**: Run validations to identify issues
- **Repair Automatically**: Fix issues programmatically when safe
- **Re-Validate**: Confirm repairs worked
- **Block Only on Failure**: Only prevent commits if auto-fix fails
- **Report Transparently**: Show what was repaired

### Benefits

- ✅ **Zero-touch validation** for developers
- ✅ **Faster commits** with automatic fixes
- ✅ **Consistent quality** without manual intervention
- ✅ **Safe repairs** with validation confirmation
- ✅ **Clear reporting** of what was changed

---

## System Architecture

### Components

```
┌─────────────────────────────────────────────────────────┐
│              Validation Detection Layer                  │
├─────────────────────────────────────────────────────────┤
│  • Type checking (TypeScript)                           │
│  • Lint checking (ESLint)                               │
│  • Naming conventions                                   │
│  • Metadata sync                                        │
│  • SEO issues (canonical, HTTPS, alt text)             │
│  • Schema opportunities (FAQ, HowTo, Video)            │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│              Automatic Repair Layer                      │
├─────────────────────────────────────────────────────────┤
│  • auto-repair-validation.js (10 repair strategies)    │
│  • auto-fix-seo.js (SEO-specific repairs)              │
│  • auto-generate-schemas.js (Schema generation)        │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│              Re-Validation Layer                         │
├─────────────────────────────────────────────────────────┤
│  • Confirm repairs succeeded                            │
│  • Detect remaining issues                              │
│  • Report final status                                  │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│              Decision Layer                              │
├─────────────────────────────────────────────────────────┤
│  • Allow commit (all fixed)                             │
│  • Block commit (repairs failed)                        │
│  • Report manual actions needed                         │
└─────────────────────────────────────────────────────────┘
```

---

## Auto-Repair Tools

### 1. `scripts/auto-repair-validation.js`

**Purpose**: General-purpose validation repair  
**What it fixes**:
- ESLint errors (auto-fix)
- Code formatting (Prettier)
- Unused imports
- HTTP → HTTPS conversions
- Metadata synchronization

**Usage**:
```bash
# Standard mode
npm run validate:auto-fix

# Dry run (preview changes)
npm run validate:auto-fix:dry-run

# Aggressive mode (includes risky repairs)
npm run validate:auto-fix:aggressive
```

**Output Example**:
```
═══════════════════════════════════════════════════════════
  Automatic Validation Repair System
═══════════════════════════════════════════════════════════

🔧 Auto-fix ESLint errors...
  ✓ ESLint auto-fix applied

🔧 Auto-format code with Prettier...
  ✓ Code formatted with Prettier

🔧 Convert insecure HTTP references to HTTPS...
  ✓ Converted 3 file(s) to HTTPS

═══════════════════════════════════════════════════════════
  Auto-Repair Summary
═══════════════════════════════════════════════════════════

Mode: STANDARD
Repairs attempted: 10
Succeeded: 3
Failed: 0
Skipped: 7

✅ Auto-repair complete - review changes and commit
```

---

### 2. `scripts/auto-fix-seo.js`

**Purpose**: SEO-specific automatic repairs  
**What it fixes**:
- Missing canonical tags → Add to metadata
- HTTP references → Convert to HTTPS
- Generic alt text → Flag for improvement
- Missing meta descriptions → Flag for review
- Missing OpenGraph tags → Flag for review

**Usage**:
```bash
# Standard mode
npm run auto-fix:seo

# Dry run
npm run auto-fix:seo:dry-run
```

**Output Example**:
```
═══════════════════════════════════════════════════════════
  Automatic SEO Repair
═══════════════════════════════════════════════════════════

🔧 Fixing canonical tags...
  ✓ Added canonical to /booking
  ✓ Added canonical to /rental
  ✓ Added canonical to /services

🔧 Converting HTTP to HTTPS...
  ✓ Fixed 2 HTTP references in page.tsx
  ✓ Fixed 1 HTTP references in about.tsx

🔧 Improving alt text...
  ⚠ Found generic alt text in BookingHero.tsx

═══════════════════════════════════════════════════════════
  SEO Auto-Fix Summary
═══════════════════════════════════════════════════════════

Automatic fixes applied: 6
Requires manual review: 1

📋 Canonical Tags:
  ✓ /booking → https://www.z-beam.com/booking
  ✓ /rental → https://www.z-beam.com/rental
  ✓ /services → https://www.z-beam.com/services

💡 Recommendations:
  • Review changes and commit if satisfied
  • Re-run SEO validation to verify fixes

✅ SEO auto-fix complete
```

---

### 3. `scripts/auto-generate-schemas.js`

**Purpose**: Automatic structured data schema generation  
**What it generates**:
- **FAQPage schema** from Q&A content (dt/dd pairs, heading+paragraph)
- **HowTo schema** from step-by-step content (ordered lists, step headings)
- **VideoObject schema** from video embeds (YouTube, Vimeo, native video)

**Usage**:
```bash
# Generate schemas for all pages
npm run generate:schemas

# Dry run
npm run generate:schemas:dry-run

# Specific page
npm run generate:schemas -- --page=/booking
```

**Detection Strategies**:

**FAQ Content**:
1. Looks for `<dt>`/`<dd>` pairs (definition lists)
2. Looks for headings with `?` or "how/what/why" followed by paragraphs
3. Minimum 2 questions required

**HowTo Content**:
1. Looks for ordered lists (`<ol>` with ≥3 items)
2. Looks for headings with "step" or numeric patterns
3. Minimum 3 steps required

**Video Content**:
1. Detects `<video>` elements
2. Detects YouTube/Vimeo iframes
3. Extracts metadata (title, thumbnail, description)

**Output Example**:
```
═══════════════════════════════════════════════════════════
  Automatic Schema Generation
═══════════════════════════════════════════════════════════

🔍 Analyzing: http://localhost:3000/booking
  Found 12 FAQ items
  ✓ Generated FAQPage schema

🔍 Analyzing: http://localhost:3000/rental
  Found 12 how-to steps
  ✓ Generated HowTo schema

═══════════════════════════════════════════════════════════
  Schema Generation Summary
═══════════════════════════════════════════════════════════

Schemas generated: 2
Skipped: 0
Failed: 0

✓ Generated Schemas:
  • FAQPage for /booking
    File: /app/booking/page.tsx
  • HowTo for /rental
    File: /app/rental/page.tsx

✅ Schema generation complete - review changes and commit
```

**Generated Schema Structure**:
```javascript
// Auto-generated FAQPage Schema
const faqpageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I book Z-Beam equipment?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can book equipment through our online form..."
      }
    }
  ]
};

// Injected into page
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(faqpageSchema) }}
/>
```

---

### 4. `scripts/pre-commit-intelligent.sh`

**Purpose**: Intelligent pre-commit hook with auto-repair  
**Workflow**:

```
Commit Initiated
      ↓
Step 1: Detect Issues
  • Type checking
  • Lint checking
  • Naming conventions
  • Metadata sync
      ↓
Issues Found? → NO → ✅ Allow Commit
      ↓ YES
Step 2: Attempt Auto-Repair
  • Run validate:auto-fix
  • Track what was fixed
      ↓
Step 3: Re-Validate
  • Confirm repairs worked
  • Detect remaining issues
      ↓
All Fixed? → YES → ✅ Allow Commit (Report repairs)
      ↓ NO
❌ Block Commit (Manual intervention needed)
```

**Output Example**:
```
═══════════════════════════════════════════════════════════
  Z-Beam Intelligent Pre-Commit Auto-Repair
═══════════════════════════════════════════════════════════

🔍 Step 1: Detecting validation issues...
  • Type checking... ✓
  • Lint checking... ⚠ Issues detected
  • Naming conventions... ✓
  • Metadata sync... ✓

🔧 Step 2: Attempting automatic repair...
  ✓ Auto-fixed 1 issue(s)

🔍 Step 3: Re-validating after auto-repair...
  • Type checking... ✓
  • Lint checking... ✓
  • Naming conventions... ✓
  • Metadata sync... ✓

═══════════════════════════════════════════════════════════
✅ Auto-repair successful - commit proceeding

What was repaired:
  • ESLint errors

💡 Tip: Review auto-fixed changes before pushing
═══════════════════════════════════════════════════════════
```

---

## Usage Guide

### Basic Workflow

**1. Development → Commit**
```bash
git add .
git commit -m "feat: Add new feature"

# Intelligent pre-commit hook runs automatically:
# - Detects issues
# - Auto-repairs
# - Re-validates
# - Allows commit if successful
```

**2. Manual Auto-Fix**
```bash
# Fix all issues
npm run validate:auto-fix

# Preview what would be fixed
npm run validate:auto-fix:dry-run

# Aggressive mode (includes risky repairs)
npm run validate:auto-fix:aggressive
```

**3. SEO-Specific Fixes**
```bash
# Fix SEO issues
npm run auto-fix:seo

# Dry run
npm run auto-fix:seo:dry-run
```

**4. Schema Generation**
```bash
# Generate schemas for all pages
npm run generate:schemas

# Preview schema opportunities
npm run generate:schemas:dry-run

# Generate for specific page
npm run generate:schemas -- --page=/booking
```

---

## Integration

### Git Hooks

**Install Intelligent Pre-Commit Hook**:
```bash
# Copy to git hooks directory
cp scripts/pre-commit-intelligent.sh .git/hooks/pre-commit

# Make executable
chmod +x .git/hooks/pre-commit

# Test
git commit -m "test"
```

**Pre-Push Hook** (existing):
```bash
# Located at .git/hooks/pre-push
# Includes WCAG 2.2 validation, schema richness
# Runs after intelligent pre-commit
```

### CI/CD Integration

**Pre-Deployment** (existing):
```bash
# scripts/deployment/deploy-with-validation.sh includes:
# - Step 19-21: Phase 1 validations (WCAG, Core Web Vitals, A11y)
# - Step 22-23: Phase 2 validations (Modern SEO, Schema richness)

# Add auto-repair before deployment:
npm run validate:auto-fix || exit 1
npm run auto-fix:seo || exit 1
npm run generate:schemas
```

---

## What Gets Auto-Fixed

### ✅ Safe Automatic Repairs

| Issue | Tool | How |
|-------|------|-----|
| **ESLint errors** | `validate:auto-fix` | `eslint --fix` |
| **Code formatting** | `validate:auto-fix` | `prettier --write` |
| **Unused imports** | `validate:auto-fix` | ESLint auto-removal |
| **HTTP → HTTPS** | `validate:auto-fix` / `auto-fix:seo` | Regex replacement (excludes standards) |
| **Missing canonical tags** | `auto-fix:seo` | Add to metadata exports |
| **Missing schemas** | `generate:schemas` | Generate from content patterns |

### ⚠️ Semi-Automatic (Flagged for Review)

| Issue | Tool | Action |
|-------|------|--------|
| **Generic alt text** | `auto-fix:seo` | Flags for manual improvement |
| **Missing meta descriptions** | `auto-fix:seo` | Flags for content writing |
| **Missing OpenGraph tags** | `auto-fix:seo` | Flags for metadata updates |
| **Type errors** | `validate:auto-fix` | Attempts fix, may require manual |
| **Naming conventions** | `validate:auto-fix` | Reports only (file renames risky) |

---

## Manual Review Required

Some issues cannot be safely auto-fixed:

### 1. **Alt Text Quality**
- **Why**: Requires semantic understanding
- **Auto-fix**: Flags generic alt text ("image", "picture", "icon")
- **Manual action**: Write descriptive, contextual alt text

### 2. **Meta Descriptions**
- **Why**: Requires content expertise
- **Auto-fix**: Detects missing descriptions
- **Manual action**: Write compelling, unique descriptions

### 3. **Type Errors (Complex)**
- **Why**: May require architectural changes
- **Auto-fix**: Adds missing imports, suggests fixes
- **Manual action**: Review type system, fix complex errors

### 4. **File Naming Conventions**
- **Why**: File renames are risky (breaks imports)
- **Auto-fix**: Reports violations only
- **Manual action**: Rename files, update imports

### 5. **OpenGraph Tags**
- **Why**: Requires social media optimization strategy
- **Auto-fix**: Detects missing tags
- **Manual action**: Add og:image, og:description, etc.

---

## Troubleshooting

### Problem: "Auto-repair failed"

**Symptoms**:
```
❌ Commit blocked - auto-repair could not fix all issues
```

**Solution**:
1. Review the error log above the message
2. Fix remaining issues manually
3. Try committing again

**Common causes**:
- Complex type errors requiring manual fixes
- Lint errors that can't be auto-fixed (logic issues)
- Metadata sync requiring manual updates

---

### Problem: "Some repairs require manual intervention"

**Symptoms**:
```
⚠️  Issues found that require manual review
```

**Solution**:
1. Check the "Manual Review Required" section of the output
2. Address flagged issues:
   - Improve generic alt text
   - Write missing meta descriptions
   - Add missing OpenGraph tags
3. Re-run auto-fix to confirm

---

### Problem: "Schema generation finds no opportunities"

**Symptoms**:
```
  No schema opportunities detected
```

**Solution**:
1. **For FAQ content**: Use `<dt>`/`<dd>` pairs or headings with questions
2. **For HowTo content**: Use ordered lists (`<ol>`) with ≥3 steps
3. **For Video content**: Ensure videos have titles and are embedded properly

**Example FAQ structure**:
```tsx
<dl>
  <dt>How do I book equipment?</dt>
  <dd>You can book through our online form...</dd>
  
  <dt>What are your rates?</dt>
  <dd>Our rates vary by equipment type...</dd>
</dl>
```

**Example HowTo structure**:
```tsx
<ol>
  <li>Visit our booking page</li>
  <li>Select your equipment</li>
  <li>Choose dates and submit</li>
</ol>
```

---

### Problem: "HTTP references still detected after auto-fix"

**Symptoms**:
```
Found HTTP references after conversion
```

**Solution**:
1. Check if references are in excluded standards:
   - `xmlns="http://www.w3.org/2000/svg"` (correct, don't change)
   - `http://schema.org/` (correct, don't change)
   - `http://localhost` (correct for dev, don't change)
2. If not excluded, manually convert to HTTPS
3. Verify URL works with HTTPS before committing

---

### Problem: "Canonical tags not added"

**Symptoms**:
```
⚠ /booking needs canonical tag
```

**Solution**:
1. Check if page has `export const metadata`
2. If missing, add metadata export:
```tsx
export const metadata = {
  title: 'Booking',
  description: '...',
  alternates: {
    canonical: 'https://www.z-beam.com/booking',
  },
};
```
3. Re-run `npm run auto-fix:seo`

---

### Problem: "Dry run shows fixes but nothing changes"

**Symptoms**:
```
[DRY RUN] Would fix 5 issues
```

**Solution**:
- Remove `--dry-run` flag to apply fixes:
```bash
# Wrong (dry run)
npm run validate:auto-fix:dry-run

# Correct (apply fixes)
npm run validate:auto-fix
```

---

## Best Practices

### 1. **Run Auto-Fix Before Committing**
```bash
# Good workflow
npm run validate:auto-fix
git add .
git commit -m "feat: ..."
```

### 2. **Use Dry Run to Preview**
```bash
# Preview changes first
npm run validate:auto-fix:dry-run

# Review what would change
# Then apply if satisfied
npm run validate:auto-fix
```

### 3. **Review Auto-Fixed Changes**
```bash
# After auto-fix
git diff

# Verify changes are correct
# Commit if satisfied
```

### 4. **Generate Schemas After Content Changes**
```bash
# After adding FAQ/HowTo content
npm run generate:schemas

# Review generated schemas
# Adjust if needed
```

### 5. **Combine Auto-Repair with Validation**
```bash
# Full workflow
npm run validate:auto-fix
npm run auto-fix:seo
npm run generate:schemas
npm run validate:highest-scoring
git commit -m "feat: ..."
```

---

## Exit Codes

| Code | Meaning | Action |
|------|---------|--------|
| `0` | Success (all fixed or no issues) | Proceed with commit |
| `1` | Partial success (manual review needed) | Review flagged issues |
| `2` | Failure (system error) | Check logs, report bug |

---

## Configuration

### Environment Variables

```bash
# Base URL for schema generation (default: http://localhost:3000)
export BASE_URL=https://www.z-beam.com

# Dry run mode (default: false)
# Use --dry-run flag instead
```

### Excluded Directories

Auto-repair tools exclude:
- `node_modules/`
- `.next/`
- `coverage/`
- `.git/`
- `tests/`
- `docs/`

### Excluded File Types

Auto-repair only processes:
- `.tsx`, `.ts`, `.js`, `.jsx` (code)
- `.json`, `.yaml`, `.yml` (config)
- `.md` (documentation)

---

## Performance

### Execution Times

| Tool | Time | Context |
|------|------|---------|
| `validate:auto-fix` | ~10-20s | Full repair cycle |
| `auto-fix:seo` | ~5-10s | SEO-specific repairs |
| `generate:schemas` | ~15-30s | All pages (Puppeteer) |
| `pre-commit-intelligent.sh` | ~20-40s | Detection + repair + validation |

### Optimization Tips

1. **Use Targeted Schema Generation**:
```bash
# Faster (single page)
npm run generate:schemas -- --page=/booking

# Slower (all pages)
npm run generate:schemas
```

2. **Run Auto-Fix Before Schema Generation**:
```bash
# Correct order (fixes issues first)
npm run validate:auto-fix
npm run generate:schemas

# Wrong order (may generate schemas with issues)
npm run generate:schemas
npm run validate:auto-fix
```

---

## Changelog

### Phase 4 (Current)
- ✅ Auto-repair validation system
- ✅ SEO auto-fix
- ✅ Schema auto-generation
- ✅ Intelligent pre-commit hook

### Phase 2
- ✅ Modern SEO validation
- ✅ Schema richness validation

### Phase 1
- ✅ WCAG 2.2 validation
- ✅ Core Web Vitals validation
- ✅ Accessibility tree validation

---

## Support

**Documentation**:
- Main audit: `docs/MARKUP_VALIDATION_AUDIT.md`
- Phase 1: `docs/PHASE_1_IMPLEMENTATION_SUMMARY.md`
- Phase 2: `docs/PHASE_2_IMPLEMENTATION_SUMMARY.md`
- Phase 3 evaluation: `docs/PHASE_3_EVALUATION.md`

**Scripts**:
- Auto-repair: `scripts/auto-repair-validation.js`
- SEO fix: `scripts/auto-fix-seo.js`
- Schema generation: `scripts/auto-generate-schemas.js`
- Pre-commit: `scripts/pre-commit-intelligent.sh`

**Commands**:
```bash
npm run validate:auto-fix         # General auto-repair
npm run auto-fix:seo              # SEO auto-fix
npm run generate:schemas          # Schema generation
```

---

## Summary

The Z-Beam Automatic Validation Repair System transforms passive validation into active self-healing:

✅ **Detects** validation failures  
✅ **Repairs** issues automatically when safe  
✅ **Re-validates** to confirm fixes  
✅ **Reports** what was changed  
✅ **Blocks** only when auto-fix fails  

**Result**: Zero-touch validation that maintains code quality without developer friction.

