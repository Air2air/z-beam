# Z-Beam YAML Processing System

## Overview

The Z-Beam YAML processing system is a collection of tools and scripts designed to validate, process, and maintain YAML frontmatter in markdown files. The system ensures consistency and correctness of content metadata across the Z-Beam platform.

## System Components

### 1. YAML Validator (`yaml_validator.py`)

The validator checks YAML frontmatter in markdown files without modifying them.

**Features:**
- Validates YAML structure and syntax
- Identifies files with issues that would be fixed by the processor
- Checks for file completeness based on required fields
- Timeout protection for processing large files
- Detailed reporting of issues found

**Usage:**
```bash
python yaml_validator.py [paths...] [options]

Options:
  --timeout SECONDS      Set timeout for processing each file (default: 10)
  --verbose              Show detailed processing information
  --required-fields LIST Comma-separated list of required fields to check for
```

### 2. YAML Processor (`yaml-processor/yaml_processor.py`)

The processor applies automatic fixes and formatting to YAML frontmatter in markdown files.

**Features:**
- Normalizes YAML syntax
- Applies consistent formatting
- Can fix common issues with YAML structure
- Can be run in dry-run mode to preview changes
- Processes multiple files or directories

**Usage:**
```bash
cd yaml-processor
python yaml_processor.py [content_dir] [validator_dir] [options]

Options:
  --verbose              Show detailed processing information
  --timeout SECONDS      Set timeout for processing each file (default: 10)
```

### 3. File Completeness Checker (`check_file_completeness.py`)

Provides in-depth analysis of content files to ensure all required metadata fields are present and properly formatted.

**Usage:**
```bash
python check_file_completeness.py [options]
```

## NPM Scripts

The Z-Beam project includes several npm scripts for working with the YAML system:

```bash
# Process YAML files in the content directory
npm run yaml:process

# Check YAML files without making changes
npm run yaml:check

# Check for completeness of required fields
npm run yaml:completeness

# Run specific checks for material frontmatter
npm run yaml:materials-check

# Run YAML validator tests
npm run yaml:test

# Check completeness of a specific file
npm run yaml:check-file
```

## Best Practices

1. **Always validate before processing**: Run `npm run yaml:check` before making changes to ensure you understand what will be modified.

2. **Use version control**: Always commit your changes before running the processor to easily revert if needed.

3. **Regular validation**: Integrate validation into your workflow to catch issues early.

4. **Customized validation**: For specific content types, use the `--required-fields` option to enforce domain-specific requirements.

5. **Testing**: After significant changes to content structure, run the validator tests to ensure the system still works properly.

## Troubleshooting

### Common Issues

1. **Timeout errors**: For large files, increase the timeout value using the `--timeout` option.

2. **Import errors**: Ensure the yaml-processor directory is in the expected location relative to the script.

3. **Required field errors**: Check that all required fields are present and properly formatted in your content files.

### Getting Help

For more detailed information, refer to the docstrings in each script or run the scripts with the `--help` option.
