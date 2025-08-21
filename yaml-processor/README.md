# Z-Beam YAML Processor System
========================================

A comprehensive YAML processing system for the Z-Beam project that automatically detects and fixes YAML frontmatter issues in markdown files.

## 🎯 Features

- **Simplified Usage**: One command for all YAML processing needs
- **Smart File Handling**: Automatically skips very small or blank files
- **Continuous Evolution**: Automatically improves to handle new YAML issues as they're discovered
- **Comprehensive Fixing**: Handles 8+ categories of YAML structural problems
- **Detailed Diagnostics**: Provides statistics and error reporting
- **Complete Coverage**: Recursively processes all subdirectories

## 📂 System Components

### Core Files
- **`yaml`** - The main entry point for all YAML processing
- **`yaml_processor.py`** - The definitive YAML processor (main engine)
- **`yaml_validator.py`** - Validation-only processor (no changes)
- **`tools/`** - Directory with specialized tools

### Tools
- **`tools/fix_badge_symbols.py`** - Fixes chemical symbol displays
- **`tools/check_file_completeness.py`** - Tool for checking individual files

## 🚀 Quick Start

### Basic Usage (from project root)
```bash
# Process all content files
npm run yaml

# Validate only (no changes)
npm run yaml:validate

# Process only material files
npm run yaml:materials

# Fix badge symbol display issues
npm run yaml:fix-badges

# Check a specific file
npm run yaml:check-file path/to/file.md
```

### Advanced Options
```bash
# Skip files smaller than 100 bytes (default is 50)
npm run yaml -- --skip-small=100

# Set a longer timeout for processing complex files
npm run yaml -- --timeout=20

# Check for specific required fields
npm run yaml -- --validate --required=name,description,applications
```

## 🔧 What It Fixes

The processor automatically detects and fixes:

1. **Duplicate Mapping Keys** - Removes duplicate YAML keys
2. **Bad Indentation** - Fixes nested structure indentation
3. **Missing Colons** - Adds missing colons in mappings
4. **Malformed Lists** - Corrects list formatting and indentation
5. **Unicode Issues** - Fixes encoding problems in formulas and values
6. **Empty Values** - Removes incomplete or empty entries
7. **Structural Issues** - Corrects general YAML structure problems
8. **Truncated Content** - Completes truncated sections
9. **Badge Symbol Issues** - Ensures proper chemical element symbols

## 📊 Processing Statistics

The processor provides detailed statistics:
- Files processed
- Files fixed
- Issues found by category
- Processing duration
- Files skipped (too small)

## 🛡️ Safety Features

- **Non-destructive**: Only processes files with YAML frontmatter
- **Error Handling**: Graceful handling of file access errors
- **Verbose Mode**: Detailed reporting for troubleshooting
- **Small File Skipping**: Automatically skips very small or blank files

## 🔄 Continuous Improvement

The processor is designed to evolve:
1. **New issues discovered** → Report to development team
2. **Processor enhanced** → New detection/fixing logic added
3. **Immediate testing** → Run processor and verify fixes
4. **Build verification** → Ensure Next.js builds successfully

## 📋 Integration

### In Development Workflow
```bash
# Before committing changes
npm run yaml
```

### In CI/CD Pipeline
```bash
npm run yaml -- --validate
```

## 🎛️ Configuration

### Command Line Options
- `--verbose`: Show detailed processing information
- `--validate`: Only validate, don't modify files
- `--required=FIELDS`: Comma-separated list of required fields
- `--timeout=SECONDS`: Maximum processing time per file
- `--skip-small=SIZE`: Skip files smaller than SIZE bytes
- `--help`: Show help message

## 🚨 Troubleshooting

### Common Issues

**"No files found to process"**
```bash
# Check that you're running from the project root
npm run yaml

# Or specify the correct content path
npm run yaml -- ../content
```

**"Processing took more than X seconds"**
```bash
# Increase the timeout for complex files
npm run yaml -- --timeout=30
```

**"Incomplete file: Missing frontmatter"**
```bash
# This is usually correct - the file has missing or invalid frontmatter
# Fix the file manually or use the processor to add the correct structure
```

## 📝 Version History

### v2.0.0 (August 2025)
- New simplified interface with `yaml` script
- Smart file handling (skip small/empty files)
- Improved processing efficiency
- Specialized badge symbol fixer
- Enhanced documentation

### v1.0.0 (August 2025)
- Initial definitive processor
- 8 categories of YAML fixes
- Comprehensive coverage verification
- Detailed statistics and reporting

---

**The definitive YAML processing solution for Z-Beam project! 🎯**
