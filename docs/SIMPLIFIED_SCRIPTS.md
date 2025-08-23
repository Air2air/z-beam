# Simplified Package.json Scripts

## Overview

The package.json scripts have been simplified and consolidated to focus on essential functionality and remove redundancy.

## Script Categories

### Core Development
- `dev` - Start development server
- `build` - Build for production
- `start` - Start production server
- `lint` - Run ESLint with auto-fix
- `type-check` - Run TypeScript type checking
- `ci` - Run full CI pipeline (type-check + lint + build)

### Utilities
- `clean` - Remove build artifacts and cache
- `kill-port` - Kill processes on port 3000

### Testing & Cleanup
- `test` - Run comprehensive test suite with cleanup analysis
- `test:cleanup` - Run dead file analysis only
- `cleanup` - Execute interactive cleanup script

### YAML Processing (Essential Only)
- `yaml:validate` - Validate YAML files
- `yaml:fix` - Apply common YAML fixes
- `yaml:monitor` - Monitor YAML files for changes

### Deployment
- `deploy:staging` - Deploy to staging environment
- `deploy:prod` - Deploy to production environment

## Removed Scripts (Consolidated/Redundant)

### Development Variants
- `dev:fast` - Redundant with `dev`
- `dev:direct` - Specific port variants not needed
- `ready` & `webpack:check` - Both were just `next -v`
- `build:skip-check` - Same as `build`

### YAML Processing (Redundant)
- `yaml` - Basic processing (use `yaml:validate` instead)
- `yaml:check-required` - Specific validation (use `yaml:validate`)
- `yaml:materials` - Subset of validation
- `yaml:check-file` - Manual file checking
- `yaml:fix-badges` - Specific fix (consolidated into `yaml:fix`)
- `yaml:fix-delimiters` - Specific fix (consolidated into `yaml:fix`)
- `yaml:monitor:execute` - Redundant variant
- `yaml:list-errors` - Debug tool
- `yaml:report` - Debug tool

### Component Management
- `enforce-components` - Not actively used
- `lint:components` - Redundant wrapper
- `create:component` - Manual tool

### Maintenance
- `cleanup:archive` - Manual cleanup (replaced with automated system)
- `docs:validate` - Basic echo command
- `kill` - Duplicate of `kill-port`

### Webpack Management
- `webpack:repair` - Same as partial `clean`
- `webpack:force` - Same as `clean`

## Benefits of Simplification

1. **Reduced Complexity**: 19 scripts down from 35+ scripts
2. **Clear Purpose**: Each script has a distinct, obvious function
3. **Better Organization**: Grouped by functionality
4. **Easier Maintenance**: Fewer scripts to maintain and document
5. **Focused Functionality**: Kept only actively used scripts

## Migration Guide

### If you were using removed scripts:

- `dev:fast` → `npm run dev`
- `webpack:repair` → `npm run clean`
- `yaml:fix-badges` → `npm run yaml:fix`
- `yaml:common-fixes` → `npm run yaml:fix`
- `cleanup:archive` → `npm run cleanup`
- `enforce-components` → Use test suite instead
- Multiple YAML tools → Use `yaml:validate` and `yaml:fix`

### New consolidated commands:

- `npm test` - Runs complete test suite with cleanup analysis
- `npm run cleanup` - Interactive cleanup of dead files
- `npm run clean` - Clean all build artifacts
- `npm run yaml:fix` - Apply all common YAML fixes

This simplification maintains all essential functionality while making the development workflow cleaner and more maintainable.
