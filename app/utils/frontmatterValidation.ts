/**
 * @file app/utils/frontmatterValidation.ts
 * @purpose Runtime validation for frontmatter structure
 * @created December 24, 2025
 * 
 * Provides dev-time validation to catch structural issues early.
 * Logs warnings for missing metadata, malformed items, etc.
 * Helps prevent runtime errors by catching issues at load time.
 */

import { validateRelationshipSection, getAllRelationshipSections } from './relationshipHelpers';

/**
 * Validation result for a single file
 */
export interface FileValidationResult {
  file: string;
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Validation error (blocking issue)
 */
export interface ValidationError {
  severity: 'error';
  path: string;
  message: string;
  suggestion?: string;
}

/**
 * Validation warning (non-blocking issue)
 */
export interface ValidationWarning {
  severity: 'warning';
  path: string;
  message: string;
  suggestion?: string;
}

/**
 * Validate all relationships in frontmatter data
 * 
 * @param frontmatter - The complete frontmatter object
 * @param filename - Name of the file being validated (for logging)
 * @returns Validation result with errors and warnings
 * 
 * @example
 * ```typescript
 * const result = validateFrontmatterRelationships(frontmatter, 'aluminum.yaml');
 * if (!result.valid) {
 *   console.error('Validation errors:', result.errors);
 * }
 * if (result.warnings.length > 0) {
 *   console.warn('Validation warnings:', result.warnings);
 * }
 * ```
 */
export function validateFrontmatterRelationships(
  frontmatter: any,
  filename: string
): FileValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!frontmatter) {
    errors.push({
      severity: 'error',
      path: filename,
      message: 'Frontmatter is null or undefined',
      suggestion: 'Check file parsing'
    });
    return { file: filename, valid: false, errors, warnings };
  }

  // Check if relationships exist
  if (!frontmatter.relationships) {
    warnings.push({
      severity: 'warning',
      path: filename,
      message: 'No relationships field found',
      suggestion: 'Add relationships field if this content type requires it'
    });
    return { file: filename, valid: true, errors, warnings };
  }

  // Get all sections and validate each
  const sections = getAllRelationshipSections(frontmatter.relationships);

  if (sections.length === 0) {
    warnings.push({
      severity: 'warning',
      path: filename,
      message: 'Relationships field exists but contains no sections with items',
      suggestion: 'Remove empty relationships field or add content'
    });
  }

  for (const section of sections) {
    const validation = validateRelationshipSection(
      frontmatter.relationships,
      section.path
    );

    if (!validation.valid) {
      for (const error of validation.errors) {
        // Missing _section is a warning, not error
        if (error.includes('Missing _section metadata')) {
          warnings.push({
            severity: 'warning',
            path: `${filename}:relationships.${section.path}`,
            message: error,
            suggestion: 'Add _section metadata for better UI display'
          });
        } 
        // Missing fields in _section are warnings
        else if (error.includes('Missing')) {
          warnings.push({
            severity: 'warning',
            path: `${filename}:relationships.${section.path}`,
            message: error,
            suggestion: 'Add required metadata fields'
          });
        } 
        // Other issues are errors
        else {
          errors.push({
            severity: 'error',
            path: `${filename}:relationships.${section.path}`,
            message: error,
            suggestion: 'Fix structural issue'
          });
        }
      }
    }

    // Validate items array structure
    if (section.items.length === 0) {
      warnings.push({
        severity: 'warning',
        path: `${filename}:relationships.${section.path}`,
        message: 'Section has empty items array',
        suggestion: 'Remove section if no items, or add items'
      });
    }

    // Check for common issues in items
    for (let i = 0; i < section.items.length; i++) {
      const item = section.items[i];
      
      // Check if item is null
      if (item === null || item === undefined) {
        errors.push({
          severity: 'error',
          path: `${filename}:relationships.${section.path}.items[${i}]`,
          message: 'Item is null or undefined',
          suggestion: 'Remove null items from array'
        });
      }
      
      // For card presentation, items should have id field
      if (section.presentation === 'card' && typeof item === 'object' && !item.id) {
        warnings.push({
          severity: 'warning',
          path: `${filename}:relationships.${section.path}.items[${i}]`,
          message: 'Card presentation item missing id field',
          suggestion: 'Add id field for proper card linking'
        });
      }
    }
  }

  return {
    file: filename,
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate multiple frontmatter files
 * Useful for batch validation during build/dev startup
 * 
 * @param files - Map of filename to frontmatter data
 * @returns Array of validation results
 * 
 * @example
 * ```typescript
 * const results = validateMultipleFrontmatter({
 *   'aluminum.yaml': aluminumData,
 *   'steel.yaml': steelData
 * });
 * 
 * const hasErrors = results.some(r => !r.valid);
 * ```
 */
export function validateMultipleFrontmatter(
  files: Record<string, any>
): FileValidationResult[] {
  return Object.entries(files).map(([filename, frontmatter]) =>
    validateFrontmatterRelationships(frontmatter, filename)
  );
}

/**
 * Log validation results to console
 * Color-coded output for errors/warnings
 * 
 * @param result - Validation result to log
 */
export function logValidationResult(result: FileValidationResult): void {
  if (result.valid && result.warnings.length === 0) {
    return; // Don't log perfect files
  }

  console.log(`\n📄 ${result.file}`);

  if (result.errors.length > 0) {
    console.log('  ❌ ERRORS:');
    for (const error of result.errors) {
      console.log(`    • ${error.path}: ${error.message}`);
      if (error.suggestion) {
        console.log(`      → ${error.suggestion}`);
      }
    }
  }

  if (result.warnings.length > 0) {
    console.log('  ⚠️  WARNINGS:');
    for (const warning of result.warnings) {
      console.log(`    • ${warning.path}: ${warning.message}`);
      if (warning.suggestion) {
        console.log(`      → ${warning.suggestion}`);
      }
    }
  }
}

/**
 * Log summary of validation results
 * 
 * @param results - Array of validation results
 */
export function logValidationSummary(results: FileValidationResult[]): void {
  const totalFiles = results.length;
  const filesWithErrors = results.filter(r => !r.valid).length;
  const filesWithWarnings = results.filter(r => r.warnings.length > 0).length;
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);

  console.log('\n' + '='.repeat(60));
  console.log('📊 FRONTMATTER VALIDATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total files: ${totalFiles}`);
  console.log(`Files with errors: ${filesWithErrors}`);
  console.log(`Files with warnings: ${filesWithWarnings}`);
  console.log(`Total errors: ${totalErrors}`);
  console.log(`Total warnings: ${totalWarnings}`);
  
  if (filesWithErrors === 0 && filesWithWarnings === 0) {
    console.log('✅ All files valid!');
  } else if (filesWithErrors === 0) {
    console.log('⚠️  No errors, but warnings found');
  } else {
    console.log('❌ Validation failed - fix errors before deployment');
  }
  console.log('='.repeat(60) + '\n');
}

/**
 * Run validation on frontmatter data (dev environment only)
 * Can be called during Next.js dev server startup
 * 
 * @param files - Map of filename to frontmatter data
 * @param verbose - Whether to log individual file results
 */
export function runFrontmatterValidation(
  files: Record<string, any>,
  verbose: boolean = false
): void {
  // Only run in development
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const results = validateMultipleFrontmatter(files);

  if (verbose) {
    results.forEach(logValidationResult);
  }

  logValidationSummary(results);
}
