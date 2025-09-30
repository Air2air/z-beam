# YAML Processor File Completeness Checking

## Overview

The YAML processor has been enhanced to check for file completeness before processing. This ensures that only complete files with the necessary structure and required fields are processed, preventing errors and ensuring data quality.

## Completeness Criteria

A file is considered "complete" and ready for processing if it meets the following criteria:

1. **File Content**: The file must not be empty
2. **Frontmatter Structure**: The file must have proper frontmatter delimiters (`---` at start and end)
3. **Valid YAML**: The frontmatter must be valid YAML that can be parsed
4. **Required Fields**: All required fields must be present and non-empty
5. **Content After Frontmatter**: Most files should have content after the frontmatter, with exceptions for special file types like material components

## Implementation

### New Validator Script

A new validator script `yaml_validator_new.py` has been created to check file completeness without modifying files. The validator can be run with:

```bash
python3 yaml_validator_new.py [paths...] [options]
```

Options:
- `--verbose`: Show detailed processing information
- `--timeout`: Maximum time in seconds to process a single file (default: 10)
- `--required-fields`: Comma-separated list of required fields (default: name,description)

### File Completeness Checker

A standalone utility script `check_file_completeness.py` has been created to check if a single file is complete. This can be used in other scripts or from the command line:

```bash
python3 check_file_completeness.py path/to/file.md [required_fields]
```

### NPM Scripts

Several NPM scripts have been added:

1. **General Completeness Check**:
   ```bash
   npm run yaml:completeness
   ```
   Checks all content files for completeness with basic required fields.

2. **Materials-Specific Check**:
   ```bash
   npm run yaml:materials-check
   ```
   Checks material component files with stricter requirements for materials.

3. **Run Tests**:
   ```bash
   npm run yaml:test
   ```
   Runs the test suite for the YAML validator and completeness checking.

## Testing

A comprehensive test suite has been created to verify the functionality of the YAML validator and completeness checking:

1. **Test Files**: Various test files have been created in the `tests/yaml_validator` directory to test different scenarios:
   - Complete files with all required fields
   - Empty files
   - Files with missing frontmatter
   - Files with invalid YAML
   - Files with missing required fields
   - Material component files with no content

2. **Test Script**: The `tests/test_yaml_validator.py` script runs tests against all these scenarios to ensure the validator works correctly.

3. **GitHub Actions**: A GitHub Actions workflow has been set up to run the tests on every pull request that modifies the YAML validator code.

## Special Cases

- **Material Component Files**: Files in `content/components/frontmatter/` with `article_type: material` don't require content after frontmatter
- **Empty Files**: Files that are completely empty are skipped
- **Files with Invalid YAML**: Files with YAML that can't be parsed are skipped
- **Files Missing Required Fields**: Files without the specified required fields are skipped

## Example Usage

### Check all content files for basic completeness:
```bash
npm run yaml:completeness
```

### Check material files with material-specific requirements:
```bash
npm run yaml:materials-check
```

### Custom completeness check with specific required fields:
```bash
python3 yaml_validator_new.py path/to/files --required-fields field1,field2,field3
```

### Check a single file for completeness:
```bash
python3 check_file_completeness.py path/to/file.md name,description,applications
```

## Implementation Details

The completeness check is implemented in the `_is_file_complete()` method, which:

1. Checks if the file exists
2. Reads the file content
3. Checks if the file is empty
4. Verifies frontmatter delimiters
5. Parses YAML to check validity
6. Verifies all required fields are present
7. Handles special cases for certain file types

## Output

The validator produces detailed output showing:
- Total files processed
- Files with issues that would be fixed
- Files that are incomplete
- Files skipped due to errors

For each incomplete file, it shows the specific reason why it's considered incomplete.

## Next Steps

1. Add more specific completeness checks for different file types
2. Integrate completeness checking into the main YAML processor
3. Add automatic schema validation for different file types
4. Extend the test suite to cover more edge cases
