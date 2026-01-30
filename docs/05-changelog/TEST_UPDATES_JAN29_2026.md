# Test Updates for Breadcrumb Migration - January 29, 2026

## Overview

Test updates to reflect breadcrumb migration and navigation changes implemented on January 29, 2026.

---

## Changes Summary

### 1. Breadcrumb Coverage
- **Before**: Materials (0/153), Other domains (285/285)
- **After**: All domains (438/438) - 100% coverage

### 2. Navigation Structure
- Removed "About" page from dropdown menu
- Simplified navigation: Partners → Contact (About accessible via main link)

---

## Tests Requiring Updates

### ✅ No Updates Required

Most breadcrumb tests remain valid because they test the **functionality** (generation logic, schema output, priority system), not the **data presence**.

#### Tests That Are Still Valid:

1. **`tests/seo/schema-generators.test.ts`**
   - Tests `generateBreadcrumbSchema()` function
   - Tests BreadcrumbList structured data output
   - **No changes needed** - function behavior unchanged

2. **`tests/standards/HTMLStandards.comprehensive.test.tsx`**
   - Tests breadcrumb markup presence
   - Tests BreadcrumbList schema presence
   - **No changes needed** - tests confirm breadcrumbs exist (which they now do)

3. **`tests/standards/JSONLDComponent.test.tsx`**
   - Tests BreadcrumbList schema type validation
   - **No changes needed** - schema structure unchanged

4. **`tests/seo/schema-validator.test.ts`**
   - Tests BreadcrumbList required properties
   - **No changes needed** - validation rules unchanged

### ⚠️ Potential Updates Needed

#### Navigation Tests (If They Exist)

If there are tests checking the exact dropdown menu structure:

```typescript
// ❌ Old test (will fail)
it('should have About link in dropdown', () => {
  const dropdown = getDropdownItems('About Us');
  expect(dropdown).toContain('About');
});

// ✅ Updated test
it('should have Partners and Contact in dropdown', () => {
  const dropdown = getDropdownItems('About Us');
  expect(dropdown).toContain('Partners');
  expect(dropdown).toContain('Contact Us');
  expect(dropdown).not.toContain('About'); // Removed redundant link
});
```

**Action**: Search for navigation dropdown tests and update if they check for "About" in dropdown.

---

## New Tests to Consider

### Test: Breadcrumb Coverage Validation

Create test to ensure all domains maintain 100% breadcrumb coverage:

```typescript
// tests/integration/breadcrumb-coverage.test.ts

import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

describe('Breadcrumb Coverage', () => {
  const domains = ['materials', 'contaminants', 'compounds', 'settings'];
  
  domains.forEach(domain => {
    it(`should have breadcrumbs in all ${domain} files`, () => {
      const dir = path.join(process.cwd(), 'frontmatter', domain);
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.yaml'));
      
      files.forEach(file => {
        const content = fs.readFileSync(path.join(dir, file), 'utf-8');
        const data = yaml.parse(content);
        
        expect(data.breadcrumb).toBeDefined();
        expect(Array.isArray(data.breadcrumb)).toBe(true);
        expect(data.breadcrumb.length).toBeGreaterThan(0);
        
        // Validate structure
        data.breadcrumb.forEach(item => {
          expect(item.label).toBeDefined();
          expect(item.href).toBeDefined();
        });
      });
    });
  });
});
```

### Test: Generator Config Validation

Ensure `breadcrumb` stays out of deprecated fields:

```python
# z-beam-generator/tests/test_export_config_validation.py

def test_breadcrumb_not_deprecated():
    """Ensure breadcrumb is not in deprecated_fields list"""
    config_path = 'export/config/materials.yaml'
    with open(config_path) as f:
        config = yaml.safe_load(f)
    
    deprecated_fields = []
    for generator in config.get('generators', []):
        for task in generator.get('tasks', []):
            if task.get('type') == 'field_cleanup':
                deprecated_fields.extend(task.get('deprecated_fields', []))
    
    assert 'breadcrumb' not in deprecated_fields, \
        "breadcrumb should not be in deprecated_fields (would strip data on export)"
```

---

## Schema Validation

### Current Schema.org Structure

Breadcrumbs follow Schema.org BreadcrumbList specification:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.z-beam.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Materials",
      "item": "https://www.z-beam.com/materials"
    }
  ]
}
```

**Validation**: All existing schema tests remain valid. The structure hasn't changed, just the data presence.

---

## Test Execution Commands

### Run All Tests
```bash
# Full test suite
npm test

# Breadcrumb-specific tests
npm test -- --testPathPattern=breadcrumb

# Schema tests
npm test -- --testPathPattern=schema

# Navigation tests
npm test -- --testPathPattern=nav
```

### Validate Breadcrumb Data
```bash
# Count files with breadcrumbs
find frontmatter -name "*.yaml" -exec grep -l "^breadcrumb:" {} \; | wc -l
# Expected: 438

# Validate YAML structure
npm run validate:breadcrumbs
```

---

## Documentation References

- **Migration Details**: `/docs/05-changelog/BREADCRUMB_MIGRATION_JAN29_2026.md`
- **Implementation Summary**: `/docs/01-core/BREADCRUMB_IMPLEMENTATION_SUMMARY.md`
- **Generator Config**: `z-beam-generator/export/config/materials.yaml`

---

## Conclusion

✅ **Most tests remain unchanged** - Testing breadcrumb functionality, not data presence
⚠️ **Navigation tests may need updates** - If they check for "About" in dropdown
✅ **New tests recommended** - Coverage validation and config protection
✅ **All existing schema tests valid** - Structure unchanged

**Next Steps**:
1. Run full test suite: `npm test`
2. Check for navigation test failures
3. Consider adding coverage validation test
4. Update any failing tests to match new structure
