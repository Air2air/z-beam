# Filename Policy

## Overview

All filenames in the Z-Beam project must follow strict naming conventions to ensure consistency, URL safety, SEO optimization, and maintainability.

## Core Rules

### 1. **No Parentheses**
**Policy:** Parentheses are **prohibited** in all filenames.

**Rationale:**
- URL encoding issues (parentheses become `%28` and `%29`)
- Slug validation failures
- SEO penalties for complex URLs
- File system compatibility issues

**Examples:**
```bash
# ❌ WRONG
acrylic-(pmma)-laser-cleaning.yaml
titanium-alloy-(ti-6al-4v)-settings.yaml
silicon-carbide-(sic)-laser-cleaning.yaml

# ✅ CORRECT
acrylic-pmma-laser-cleaning.yaml
titanium-alloy-ti-6al-4v-settings.yaml
silicon-carbide-sic-laser-cleaning.yaml
```

### 2. **Lowercase Only**
All filenames must be lowercase.

```bash
# ❌ WRONG
Aluminum-Laser-Cleaning.yaml
Steel-Settings.yaml

# ✅ CORRECT
aluminum-laser-cleaning.yaml
steel-settings.yaml
```

### 3. **Hyphens for Word Separation**
Use hyphens (not underscores or spaces) to separate words.

```bash
# ❌ WRONG
aluminum_laser_cleaning.yaml
aluminum laser cleaning.yaml

# ✅ CORRECT
aluminum-laser-cleaning.yaml
```

### 4. **Alphanumeric Characters Only**
Only lowercase letters (a-z), numbers (0-9), and hyphens (-) are allowed.

```bash
# ❌ WRONG
aluminum&steel.yaml
copper@2024.yaml
brass#alloy.yaml

# ✅ CORRECT
aluminum-steel.yaml
copper-2024.yaml
brass-alloy.yaml
```

### 5. **No Leading/Trailing Hyphens**
Filenames must not start or end with a hyphen.

```bash
# ❌ WRONG
-aluminum-laser-cleaning.yaml
copper-laser-cleaning-.yaml

# ✅ CORRECT
aluminum-laser-cleaning.yaml
copper-laser-cleaning.yaml
```

### 6. **No Double Hyphens**
Avoid consecutive hyphens.

```bash
# ❌ AVOID
aluminum--laser--cleaning.yaml

# ✅ CORRECT
aluminum-laser-cleaning.yaml
```

## Validation Rules

### Regular Expression Pattern
```javascript
const VALID_FILENAME = /^[a-z0-9-]+\.(yaml|yml|ts|tsx|js|jsx|md|jpg|jpeg|png|webp|svg)$/;
```

### Validation Logic
1. Extract filename from path
2. Check against regex pattern
3. Fail if parentheses detected
4. Fail if uppercase letters found
5. Fail if underscores present
6. Fail if special characters detected

## File Type Specific Rules

### Frontmatter Files (YAML)
```bash
# Pattern: {material-name}-{type}.yaml
aluminum-laser-cleaning.yaml
steel-settings.yaml
copper-contaminant.yaml
```

### Image Files
```bash
# Pattern: {material-name}-laser-cleaning-{variant}.{ext}
aluminum-laser-cleaning-hero.jpg
steel-laser-cleaning-micro.webp
copper-laser-cleaning-micro-social.jpg
```

### TypeScript/JavaScript Files
```bash
# Pattern: {component-name}.{tsx|ts|js|jsx}
Card.tsx
MaterialsList.tsx
seoMetadataFormatter.ts
```

### Markdown Documentation
```bash
# Pattern: {DOCUMENT_NAME}.md (all caps for root docs)
# Pattern: {document-name}.md (kebab-case for subdirectories)
README.md
DEPLOYMENT.md
build-process.md
```

## Chemical Formula Handling

### Problem: Parentheses in Chemical Names
Chemical formulas often use parentheses for clarity (e.g., Ti-6Al-4V, PMMA, SiC).

### Solution: Remove Parentheses
Convert chemical abbreviations to slug-safe format:

```bash
# Chemical Formula → Slug Format
(PMMA)          → pmma
(Ti-6Al-4V)     → ti-6al-4v
(SiC)           → sic
(Al₂O₃)         → al2o3
(ZrO₂)          → zro2
```

### Examples:
```bash
# ❌ WRONG (parentheses)
acrylic-(pmma)-laser-cleaning.yaml
titanium-alloy-(ti-6al-4v)-laser-cleaning.yaml
silicon-carbide-(sic)-laser-cleaning.yaml

# ✅ CORRECT (parentheses removed)
acrylic-pmma-laser-cleaning.yaml
titanium-alloy-ti-6al-4v-laser-cleaning.yaml
silicon-carbide-sic-laser-cleaning.yaml
```

## Migration Guide

### Identifying Files to Rename

```bash
# Find all files with parentheses
find . -type f -name "*(*" ! -path "./node_modules/*" ! -path "./.next/*" ! -path "./coverage/*"
```

### Renaming Process

1. **Identify problematic files**
2. **Plan new names** (remove parentheses, preserve meaning)
3. **Update YAML content** (name field must match filename)
4. **Update references** (if any code references the old filename)
5. **Rename files**
6. **Test validation** (`npm run validate:naming`)
7. **Commit changes**

### Automated Renaming Script

```bash
# Example: Remove parentheses from filenames
for file in frontmatter/materials/*\(*; do
  newname=$(echo "$file" | sed 's/[(|)]//g')
  mv "$file" "$newname"
done
```

## Enforcement

### Pre-Push Validation
The naming convention is enforced via pre-push git hooks:

```bash
# .git/hooks/pre-push
npm run validate:naming
```

### Build-Time Validation
Validation runs before every deployment:

```json
{
  "prebuild": "npm run validate:naming && npm run validate:metadata",
  "vercel-build": "npm run validate:naming && next build"
}
```

### Validation Script
Location: `scripts/validation/content/validate-naming-e2e.js`

```javascript
// Validation rules
const RULES = {
  slug: /^[a-z0-9-]+$/,
  fileName: /^[a-z0-9-]+\.(yaml|yml|ts|tsx|js|jsx|md)$/,
  imagePath: /^\/images\/[a-z0-9/-]+\.(jpg|jpeg|png|webp|svg)$/,
  imageFileName: /^[a-z0-9-]+\.(jpg|jpeg|png|webp|svg)$/
};
```

## Benefits

### 1. **URL Safety**
- Clean, readable URLs
- No encoding issues
- Better SEO performance

### 2. **Cross-Platform Compatibility**
- Works on all file systems (Windows, macOS, Linux)
- No special character handling required
- Git-friendly

### 3. **Consistency**
- Predictable file naming
- Easy to find files
- Reduced errors

### 4. **Maintainability**
- Clear naming patterns
- Automated validation
- Early error detection

### 5. **SEO Optimization**
- Semantic URLs
- Better crawlability
- Improved rankings

## Common Violations

### Violation 1: Parentheses in Chemical Names
```bash
Error: Slug "titanium-alloy-(ti-6al-4v)-laser-cleaning" contains invalid characters
Fix: Remove parentheses → "titanium-alloy-ti-6al-4v-laser-cleaning"
```

### Violation 2: Uppercase Letters
```bash
Error: File "Aluminum-Laser-Cleaning.yaml" contains uppercase
Fix: Convert to lowercase → "aluminum-laser-cleaning.yaml"
```

### Violation 3: Underscores
```bash
Error: File "stainless_steel_304.yaml" contains underscores
Fix: Replace with hyphens → "stainless-steel-304.yaml"
```

### Violation 4: Spaces
```bash
Error: File "aluminum alloy.yaml" contains spaces
Fix: Replace with hyphens → "aluminum-alloy.yaml"
```

## FAQ

### Q: Why no parentheses?
**A:** Parentheses cause URL encoding issues, slug validation failures, and SEO problems. They're not URL-safe and complicate routing logic.

### Q: How do I represent chemical formulas?
**A:** Remove parentheses and keep the abbreviation. For example, `(Ti-6Al-4V)` becomes `ti-6al-4v`.

### Q: What about existing files with parentheses?
**A:** They must be renamed. The validation script will detect them and block deployment until fixed.

### Q: Can I use uppercase for proper nouns?
**A:** No. All filenames must be lowercase for consistency. Display names in frontmatter can use proper capitalization.

### Q: What about numbers in filenames?
**A:** Numbers are allowed (e.g., `stainless-steel-304.yaml`, `titanium-alloy-ti-6al-4v.yaml`).

### Q: How strict is the validation?
**A:** Very strict. Any violation will fail the validation script and block git push and deployment.

## Related Documentation

- [Image Naming Conventions](../reference/IMAGE_NAMING_CONVENTIONS.md)
- [Naming Validation E2E](./NAMING_VALIDATION_E2E.md)
- [Naming Quick Reference](../04-reference/NAMING_QUICK_REFERENCE.md)
- [Metadata Sync Strategy](./METADATA_SYNC_STRATEGY.md)

---

**Created:** November 26, 2025  
**Status:** Active Policy  
**Enforcement:** Automated (pre-push hooks, build-time validation)  
**Last Updated:** November 26, 2025
