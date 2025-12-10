# Naming Conventions - Z-Beam Project

**Last Updated**: December 6, 2025

## Purpose

Establish consistent naming patterns across files, functions, types, and documentation to improve maintainability and reduce cognitive load.

---

## File Naming Conventions

### General Rules
- **Lowercase with hyphens** for multi-word files
- **Descriptive names** that indicate purpose
- **Verb prefixes** for action-oriented scripts

### Patterns by Type

#### React Components
```
ComponentName.tsx       ✅ PascalCase
ComponentName.test.tsx  ✅ Test files match component name
```

#### Utilities
```
utility-name.ts         ✅ Lowercase with hyphens
seoMetadataFormatter.ts ✅ camelCase for long names (legacy)
```

#### Scripts
```
verb-noun-action.js     ✅ Action-verb prefix
generate-google-merchant-feed.js
validate-seo-infrastructure.js
```

#### Tests
```
feature-name.test.ts    ✅ Matches source file pattern
seo-metadata.test.ts
feed-generation.test.ts
```

#### Documentation
```
CATEGORY_TOPIC.md       ✅ UPPERCASE with underscores
SEO_INFRASTRUCTURE_OVERVIEW.md
GOOGLE_SHOPPING_SPEC.md
```

---

## Abbreviations & Acronyms

### Standardized Forms

| Context | Format | Example |
|---------|--------|---------|
| **Filenames** | lowercase | `seo/`, `jsonld-helper.ts` |
| **Code exports** | camelCase | `seoFormatter`, `jsonLdHelper` |
| **Documentation** | Proper caps | `SEO`, `JSON-LD`, `API` |
| **Comments** | Proper caps | `// SEO optimization`, `// JSON-LD schema` |

### Common Abbreviations

```
✅ CORRECT                    ❌ AVOID
seo                           Seo, SEO (in filenames)
jsonld                        json-ld, JSONLD (in filenames)
api                           Api, API (in filenames)
e2e                           E2E, e-2-e
```

---

## Function Naming

### Action-Verb Prefixes

```typescript
// ✅ GOOD: Clear action verbs
createMetadata()
generateSchema()
formatMaterialTitle()
validateFeeds()
fetchMaterialData()

// ❌ AVOID: Ambiguous verbs
processData()        // What kind of processing?
handleRequest()      // Handle how?
doValidation()       // Use validate()
```

### Common Verb Patterns

| Verb | Usage | Example |
|------|-------|---------|
| `create` | Instantiate new object | `createMetadata()` |
| `generate` | Produce output | `generateSchema()` |
| `format` | Transform for display | `formatTitle()` |
| `validate` | Check correctness | `validateFields()` |
| `fetch` | Retrieve data | `fetchMaterials()` |
| `parse` | Convert format | `parseYAML()` |
| `extract` | Pull specific data | `extractHeroImage()` |
| `normalize` | Standardize format | `normalizeString()` |

---

## Type & Interface Naming

### Patterns

```typescript
// ✅ GOOD: Descriptive interfaces
interface ArticleMetadata { }
interface SchemaData { }
interface MetadataConfig { }
interface ValidationResult { }

// ✅ GOOD: Type aliases
type SchemaGenerator = (...) => SchemaOrgBase;
type NextMetadata = any;

// ❌ AVOID: Generic names
interface Data { }
interface Config { }
interface Result { }
```

### Suffixes

```typescript
// Common suffixes by purpose
interface UserConfig { }        // Configuration
interface MetadataOptions { }   // Optional parameters
interface ValidationResult { }  // Return values
interface SchemaData { }        // Data objects
interface ComponentProps { }    // React props
```

---

## Variable Naming

### Casing by Scope

```typescript
// Constants: SCREAMING_SNAKE_CASE
const MAX_RETRIES = 3;
const BASE_URL = 'https://www.z-beam.com';
const SERVICE_PRICING = { /* ... */ };

// Variables: camelCase
let currentUser = null;
const materialData = getMaterial();
const isValid = validate(data);

// Private class members: _camelCase
class Example {
  private _cache: Map<string, any>;
  private _registry: Registry;
}

// Boolean: is/has/should prefix
const isEnabled = true;
const hasPermission = false;
const shouldValidate = checkCondition();
```

---

## Directory Naming

### Standard Structure

```
app/                    ✅ Singular, lowercase
├── components/         ✅ Plural for collections
├── utils/              ✅ Plural for collections
├── config/             ✅ Singular for category
└── api/                ✅ Singular for category

scripts/                ✅ Plural for collections
├── seo/                ✅ Lowercase abbreviation
├── validation/         ✅ Singular concept
└── deployment/         ✅ Singular concept

tests/                  ✅ Plural for collections
├── unit/               ✅ Singular category
├── integration/        ✅ Singular category
└── e2e/                ✅ Lowercase abbreviation

docs/                   ✅ Plural for collections
├── 01-core/            ✅ Numbered sections
├── seo/                ✅ Lowercase abbreviation
└── archive/            ✅ Singular category
    └── 2025-11/        ✅ Date-based organization
```

---

## Documentation Conventions

### File Naming

```
TOPIC_DESCRIPTION.md              ✅ Uppercase with underscores
SEO_INFRASTRUCTURE_OVERVIEW.md
GOOGLE_SHOPPING_SPEC.md
NAMING_CONVENTIONS.md

topic-description-date.md         ✅ Archive files with dates
audit-report-dec6-2025.md
session-summary-nov29-2025.md
```

### Header Hierarchy

```markdown
# Title (H1)                       ✅ One per document
## Major Section (H2)              ✅ Top-level divisions
### Subsection (H3)                ✅ Detailed topics
#### Minor Detail (H4)             ✅ Specific points
```

### Status Indicators

```markdown
✅ COMPLETE
🔄 IN PROGRESS
⚠️ NEEDS ATTENTION
❌ DEPRECATED
🆕 NEW (with date)
📊 METRICS
🎯 ACTION REQUIRED
```

---

## Schema & Feed Conventions

### Schema Type Names

```typescript
// ✅ Schema.org standard names (PascalCase)
Organization
TechnicalArticle
Product
Service
BreadcrumbList
FAQPage
HowTo
Dataset
```

### Feed Field Names

```xml
<!-- ✅ Google Merchant namespace (g: prefix) -->
<g:id>product-123</g:id>
<g:title>Product Title</g:title>
<g:description>Description</g:description>
<g:price>390 USD</g:price>
```

### SKU Format

```
ZB-{SERVICE}-{MATERIAL}           ✅ Standard pattern
Z-BEAM-CLEAN-ALUMINUM            ✅ Example
ZB-EQUIP-RENT-STAINLESS-STEEL     ✅ Example
```

---

## Examples by Context

### Script Files

```bash
✅ GOOD
scripts/seo/generate-google-merchant-feed.js
scripts/validation/post-deployment/validate-feeds.js
scripts/validation/seo/validate-lighthouse-metrics.js

❌ AVOID
scripts/seo/googleMerchantFeed.js     # Use hyphens, not camelCase
scripts/validation/modernSEO.js       # Too vague
scripts/validateFeeds.js              # Missing category folder
```

### Utility Files

```typescript
✅ GOOD
app/utils/seoMetadataFormatter.ts
app/utils/jsonld-helper.ts
app/utils/metadata.ts

❌ AVOID
app/utils/SEOFormatter.ts             # Use lowercase in filenames
app/utils/jsonLDHelper.ts             # Use jsonld not jsonLD
app/utils/meta.ts                     # Too abbreviated
```

### Test Files

```typescript
✅ GOOD
tests/seo/feed-generation.test.ts
tests/seo/seo-metadata.test.ts
tests/unit/metadata.test.ts

❌ AVOID
tests/seo/feedGenerationTest.ts      # Use .test.ts suffix
tests/seo/SEOMetadata.test.ts        # Avoid caps in filename
tests/seoMetadata.test.ts            # Missing category folder
```

---

## Migration Guide

### When Renaming Files

1. Update all imports
2. Update test references
3. Update package.json scripts
4. Update documentation references
5. Commit with descriptive message

```bash
# Example migration
git mv old-name.ts new-name.ts
# Update imports
# Update package.json
git commit -m "refactor: rename old-name to new-name for clarity"
```

### When Adding New Files

1. Check this guide first
2. Use existing patterns
3. Follow directory structure
4. Add tests matching naming
5. Document in appropriate README

---

## Enforcement

### Automated Checks

```json
// package.json
{
  "scripts": {
    "lint:filenames": "check-filename-conventions",
    "lint:exports": "check-export-naming"
  }
}
```

### Manual Reviews

- Code review checklist includes naming check
- New files reviewed for convention compliance
- Documentation updates reviewed for consistency

---

## References

- [Google Style Guide - Naming](https://google.github.io/styleguide/)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [TypeScript Naming Conventions](https://typescript-eslint.io/rules/naming-convention/)
- Project-specific: `.github/copilot-instructions.md`

---

## Questions?

If unclear which convention applies, follow this priority:

1. Check existing similar files
2. Consult this guide
3. Ask in code review
4. Document decision for future reference
