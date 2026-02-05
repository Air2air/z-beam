# Frontend Utility Tools

General-purpose scripts for component analysis and development automation.

## Files

### consolidate-props.js
Analyzes and consolidates duplicate TypeScript prop definitions.
- Input: components/**/*.tsx files
- Output: Refactoring recommendations for duplicate interfaces
- Use case: Type consolidation, DRY principle enforcement

### batch-consolidate-props.js
Batch version of consolidate-props.js for processing entire directories.
- Input: Multiple component directories
- Output: Consolidated prop definitions
- Use case: Large-scale type cleanup

## Usage

```bash
# From repository root
node scripts/tools/consolidate-props.js components/sections/
node scripts/tools/batch-consolidate-props.js
```

## Dependencies
- Node.js standard modules (fs, path)
- TypeScript AST parsing libraries (optional)
