# One-Off Fix Scripts Archive

This directory contains scripts that were used to fix specific issues or perform one-time data migrations. They are preserved for historical reference but are no longer actively used.

## 📋 Archived Scripts

### Frontmatter & Data Cleanup

- **fix-applications-property.py** - Removed deprecated `applications` field from frontmatter YAML files
- **fix-contaminant-underscores.js** - Fixed underscore issues in contaminant naming
- **fix-slug-fields.py** - Corrected slug field formatting across content files
- **analyze-frontmatter-normalization.js** - Analyzed frontmatter structure for normalization (Dec 2025)
- **cleanup-settings-duplicates.js** - Removed duplicate entries from settings files (Dec 2025)

### JSON-LD & Schema Fixes

- **fix-jsonld-structure.js** - Fixed JSON-LD schema structure issues
- **complete-jsonld-schema-fix.js** - Comprehensive JSON-LD schema corrections
- **comprehensive-jsonld-fix.js** - Additional JSON-LD fixes
- **comprehensive-jsonld-validation.js** - Validation of JSON-LD implementations
- **audit-jsonld-comprehensive.js** - Full audit of JSON-LD across site

### URL & Routing Fixes

- **fix-domain-linkage-urls.js** - Fixed domain linkage URL issues
- **fix-breadcrumb-plurals.sh** - Corrected plural forms in breadcrumb navigation
- **fix-parentheses-in-slugs.js** - Removed/fixed parentheses in URL slugs

### Type & Validation Fixes

- **fix-recurring-type-errors.js** - Fixed recurring TypeScript type errors
- **fix-unknown-regulatory-standards.js** - Corrected unknown regulatory standard references
- **final-material-type-fix.js** - Final corrections for material type definitions
- **auto-repair-validation.js** - Automated validation error repairs

### SEO & Metadata

- **auto-fix-seo.js** - Automated SEO metadata fixes
- **auto-generate-schemas.js** - Automated schema generation

### General Cleanup

- **automated-cleanup.js** - General automated cleanup operations
- **conservative-unused-cleaner.js** - Conservative removal of unused code/files
- **cleanup-root.js** - Root directory cleanup
- **cleanup-duplicate-content-type.sh** - Removed duplicate content type definitions
- **archive-cleanup.sh** - Archive directory maintenance
- **cleanup-backups.sh** - Backup file cleanup
- **cleanup-root-docs.sh** - Root documentation cleanup
- **consolidate-docs.sh** - Documentation consolidation (Dec 2025)

### Analysis Tools

- **analyze-image-paths.js** - Analyzed image path patterns (Dec 2025)
- **check-font-in-browser.js** - Browser font loading verification

## 📌 Note

These scripts were typically run once to fix a specific issue and then archived. They are kept for:
- Historical reference
- Understanding past architectural decisions
- Potential reuse patterns for future fixes
- Documentation of data transformations

**Do not run these scripts without understanding their purpose and checking if the issue still exists.**

## 🔄 Active Scripts

For currently-used scripts, see the main `scripts/` directory and its subdirectories:
- `scripts/validation/` - Content validation
- `scripts/deployment/` - Deployment utilities  
- `scripts/dev/` - Development tools
- `scripts/generate-*.ts` - Dataset generation
- `scripts/merge-*.js` - Data merging operations
