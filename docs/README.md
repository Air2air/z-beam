# Cleanup System

This folder contains all files related to the dead file cleanup system.

## Files

### Core Scripts
- `test-dead-file-cleanup.js` - Dead file analyzer that scans the project for unused files
- `cleanup-dead-files.sh` - Interactive cleanup script for removing identified files
- `cleanup-analysis.json` - Generated analysis results (created by running tests)

### Documentation
- `DEAD_FILE_CLEANUP_SYSTEM.md` - Complete system documentation
- `CLEANUP_SYSTEM_EVALUATION.md` - Safety and simplicity evaluation report

## Usage

### From Project Root

```bash
# Run comprehensive tests with cleanup analysis
npm run test

# Run cleanup analysis only  
npm run test:cleanup

# Interactive cleanup execution
npm run cleanup
```

### Direct Usage

```bash
# Analyze dead files
node cleanup/test-dead-file-cleanup.js

# Execute cleanup script
./cleanup/cleanup-dead-files.sh
```

## Safety Features

- **Essential File Protection**: Core files are whitelisted and never flagged
- **Multi-layer Safety**: Pattern-level and recommendation-level verification
- **Interactive Confirmation**: Manual approval for destructive actions  
- **Post-cleanup Verification**: Test suite validation after cleanup

## Organization

The cleanup system is integrated into the main test suite (`npm run test`) for seamless maintenance workflow. Files are categorized as:

- **Safe to remove**: Obviously temporary files (auto-cleaned)
- **Review required**: Files that need manual decision
- **Protected**: Essential files that are never touched

See the documentation files for complete details on system operation and safety mechanisms.
