# Z-Beam YAML Processing Tools

This directory contains tools for processing and validating YAML frontmatter in markdown files.

## Tools

### 1. YAML Processor (`yaml-processor/yaml_processor.py`)

The main processor that fixes YAML formatting issues in markdown frontmatter.

Features:
- Fixes a wide range of YAML formatting issues
- Comprehensive error pattern detection
- Timeout protection for large files
- Detailed reporting of changes made
- File completeness checking

Usage:
```bash
cd yaml-processor
python3 yaml_processor.py ../content [external_directory] --verbose --timeout 10
```

### 2. YAML Validator (`yaml_validator.py`)

Validates YAML frontmatter without modifying files. Also checks for file completeness.

Features:
- Non-destructive validation
- Identifies files with issues
- Checks for file completeness
- Detailed reporting

Usage:
```bash
python3 yaml_validator.py [paths...] --verbose --timeout 10 --required-fields name,description
```

### 3. File Completeness Checker (`check_file_completeness.py`)

Utility to check if a single file is complete and ready for processing.

Usage:
```bash
python3 check_file_completeness.py path/to/file.md [required_fields]
```

## NPM Scripts

The following NPM scripts are available:

- `npm run yaml:process` - Process content files and fix YAML issues
- `npm run yaml:check` - Check files for YAML issues without modifying them
- `npm run yaml:completeness` - Check files for completeness
- `npm run yaml:materials-check` - Check material files with specific requirements
- `npm run yaml:test` - Run tests for the YAML validator
- `npm run yaml:check-file` - Check if a single file is complete

## Testing

A test suite is available in `tests/test_yaml_validator.py`. Run it with:

```bash
npm run yaml:test
```

## Documentation

For more information on file completeness checking, see [YAML_COMPLETENESS_CHECKING.md](docs/YAML_COMPLETENESS_CHECKING.md).
