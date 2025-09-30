// app/utils/contentValidator.ts
// Simple performance logging
const logPerformance = (operation: string, duration: number, context?: any) => {
  if (duration > 1000) {
    console.warn(`🐌 Performance: ${operation} took ${duration}ms`, context);
  } else {
    console.debug(`⚡ Performance: ${operation} took ${duration}ms`, context);
  }
};
// Content validation utilities for ensuring article integrity
// Enhanced with fail-fast validation and detailed error reporting

import 'server-only';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigurationError, ValidationError, safeOperation } from './errorSystem';

interface ContentValidationResult {
  passed: boolean;
  errors: ContentError[];
  warnings: ContentWarning[];
  stats: ContentStats;
  validatedAt: string;
}

interface ContentError {
  file: string;
  type: 'missing_file' | 'invalid_yaml' | 'missing_required_field' | 'invalid_structure';
  message: string;
  line?: number;
  suggestion: string;
}

interface ContentWarning {
  file: string;
  type: 'missing_optional_field' | 'deprecated_field' | 'performance_hint';
  message: string;
  line?: number;
}

interface ContentStats {
  totalFiles: number;
  validFiles: number;
  errorFiles: number;
  warningFiles: number;
  emptyFiles: number;
  orphanedFiles: number;
}

interface RequiredFields {
  frontmatter: string[];
  badgesymbol: string[];
  metatags: string[];
  content: string[];
}

class ContentValidator {
  private static instance: ContentValidator;
  private contentDirs: Record<string, string>;
  private requiredFields: RequiredFields;

  constructor() {
    this.contentDirs = {
      frontmatter: path.join(process.cwd(), 'content', 'components', 'frontmatter'),
      badgesymbol: path.join(process.cwd(), 'content', 'components', 'badgesymbol'),
      metatags: path.join(process.cwd(), 'content', 'components', 'metatags'),
      content: path.join(process.cwd(), 'content', 'components', 'content'),
      bullets: path.join(process.cwd(), 'content', 'components', 'bullets'),
      caption: path.join(process.cwd(), 'content', 'components', 'caption'),
      table: path.join(process.cwd(), 'content', 'components', 'table'),
      author: path.join(process.cwd(), 'content', 'components', 'author'),
      tags: path.join(process.cwd(), 'content', 'components', 'tags'),
    };

    // Define required fields for each content type (fail-fast validation)
    this.requiredFields = {
      frontmatter: ['title', 'description', 'category', 'slug'],
      badgesymbol: ['material', 'symbol', 'description'],
      metatags: ['title', 'description'],
      content: ['title', 'slug']
    };
  }

  static getInstance(): ContentValidator {
    if (!ContentValidator.instance) {
      ContentValidator.instance = new ContentValidator();
    }
    return ContentValidator.instance;
  }

  // Comprehensive content validation (fail-fast on critical issues)
  async validateAllContent(): Promise<ContentValidationResult> {
    const startTime = performance.now();
    const errors: ContentError[] = [];
    const warnings: ContentWarning[] = [];
    let totalFiles = 0;
    let validFiles = 0;
    let emptyFiles = 0;

    try {
      console.info('Starting comprehensive content validation');

      // 1. Validate directory structure exists
      for (const [dirName, dirPath] of Object.entries(this.contentDirs)) {
        if (!fs.existsSync(dirPath)) {
          errors.push({
            file: dirPath,
            type: 'missing_file',
            message: `Required content directory missing: ${dirName}`,
            suggestion: `Create directory: mkdir -p ${dirPath}`
          });
        }
      }

      // Fail fast if critical directories are missing
      if (errors.length > 0) {
        const criticalDirs = ['frontmatter', 'badgesymbol', 'content'];
        const missingCritical = errors.filter(e => 
          criticalDirs.some(dir => e.file.includes(dir))
        );
        
        if (missingCritical.length > 0) {
          throw new ConfigurationError(
            `Critical content directories missing: ${missingCritical.map(e => e.file).join(', ')}`,
            { missingDirectories: missingCritical.map(e => e.file) }
          );
        }
      }

      // 2. Validate individual content files
      for (const [dirName, dirPath] of Object.entries(this.contentDirs)) {
        if (!fs.existsSync(dirPath)) continue;

        const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
        totalFiles += files.length;

        for (const file of files) {
          const filePath = path.join(dirPath, file);
          const result = await this.validateContentFile(filePath, dirName);
          
          if (result.errors.length > 0) {
            errors.push(...result.errors);
          }
          if (result.warnings.length > 0) {
            warnings.push(...result.warnings);
          }
          if (result.isEmpty) {
            emptyFiles++;
          }
          if (result.isValid) {
            validFiles++;
          }
        }
      }

      // 3. Validate cross-file relationships
      const orphanCheck = await this.validateCrossReferences();
      errors.push(...orphanCheck.errors);
      warnings.push(...orphanCheck.warnings);

      const stats: ContentStats = {
        totalFiles,
        validFiles,
        errorFiles: errors.length,
        warningFiles: warnings.length,
        emptyFiles,
        orphanedFiles: orphanCheck.orphanedFiles
      };

      const result: ContentValidationResult = {
        passed: errors.length === 0,
        errors,
        warnings,
        stats,
        validatedAt: new Date().toISOString()
      };

      // Log validation results
      logPerformance('Content validation completed', performance.now() - startTime, {
        totalFiles,
        validFiles,
        errorCount: errors.length,
        warningCount: warnings.length,
        overallStatus: result.passed ? 'PASS' : 'FAIL'
      });

      // Fail fast if critical errors found
      const criticalErrors = errors.filter(e => 
        e.type === 'missing_file' || e.type === 'invalid_structure'
      );
      
      if (criticalErrors.length > 0) {
        throw new ValidationError(
          `Content validation failed with ${criticalErrors.length} critical errors`,
          { criticalErrors, stats }
        );
      }

      return result;

    } catch (error) {
      if (error instanceof ValidationError || error instanceof ConfigurationError) {
        throw error;
      }
      
      throw new ValidationError(
        `Content validation system failure: ${error}`,
        { originalError: error, validationTime: performance.now() - startTime }
      );
    }
  }

  // Validate individual content file
  private async validateContentFile(filePath: string, contentType: string): Promise<{
    isValid: boolean;
    isEmpty: boolean;
    errors: ContentError[];
    warnings: ContentWarning[];
  }> {
    const errors: ContentError[] = [];
    const warnings: ContentWarning[] = [];
    const fileName = path.basename(filePath);

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Check for empty files
      if (content.trim().length === 0) {
        warnings.push({
          file: fileName,
          type: 'performance_hint',
          message: 'File is empty and may be unnecessary'
        });
        return { isValid: false, isEmpty: true, errors, warnings };
      }

      // Parse YAML frontmatter
      const matter = require('gray-matter');
      let frontmatter: any;
      
      try {
        const parsed = matter(content);
        frontmatter = parsed.data;
      } catch (yamlError) {
        errors.push({
          file: fileName,
          type: 'invalid_yaml',
          message: `YAML parsing failed: ${yamlError}`,
          suggestion: 'Check YAML syntax and formatting'
        });
        return { isValid: false, isEmpty: false, errors, warnings };
      }

      // Validate required fields based on content type
      const requiredFields = this.requiredFields[contentType as keyof RequiredFields] || [];
      
      for (const field of requiredFields) {
        if (!frontmatter[field]) {
          errors.push({
            file: fileName,
            type: 'missing_required_field',
            message: `Missing required field: ${field}`,
            suggestion: `Add "${field}: <value>" to YAML frontmatter`
          });
        }
      }

      // Content-specific validation
      if (contentType === 'frontmatter') {
        if (frontmatter.slug && !this.isValidSlug(frontmatter.slug)) {
          errors.push({
            file: fileName,
            type: 'invalid_structure',
            message: `Invalid slug format: ${frontmatter.slug}`,
            suggestion: 'Slug should be lowercase, hyphen-separated (e.g., "aluminum-oxide")'
          });
        }
      }

      if (contentType === 'badgesymbol') {
        if (frontmatter.symbol && frontmatter.symbol.length > 3) {
          warnings.push({
            file: fileName,
            type: 'performance_hint',
            message: `Symbol "${frontmatter.symbol}" is longer than 3 characters`
          });
        }
      }

      return {
        isValid: errors.length === 0,
        isEmpty: false,
        errors,
        warnings
      };

    } catch (error) {
      errors.push({
        file: fileName,
        type: 'invalid_structure',
        message: `File processing failed: ${error}`,
        suggestion: 'Check file encoding and format'
      });
      
      return { isValid: false, isEmpty: false, errors, warnings };
    }
  }

  // Validate cross-file relationships
  private async validateCrossReferences(): Promise<{
    errors: ContentError[];
    warnings: ContentWarning[];
    orphanedFiles: number;
  }> {
    const errors: ContentError[] = [];
    const warnings: ContentWarning[] = [];
    let orphanedFiles = 0;

    try {
      // Get all slugs from frontmatter files
      const frontmatterDir = this.contentDirs.frontmatter;
      if (!fs.existsSync(frontmatterDir)) return { errors, warnings, orphanedFiles };

      const frontmatterFiles = fs.readdirSync(frontmatterDir)
        .filter(f => f.endsWith('.md'))
        .map(f => f.replace('.md', ''));

      // Check for corresponding content files
      const contentDir = this.contentDirs.content;
      if (fs.existsSync(contentDir)) {
        const contentFiles = fs.readdirSync(contentDir)
          .filter(f => f.endsWith('.md'))
          .map(f => f.replace('.md', ''));

        // Find orphaned content files (no corresponding frontmatter)
        for (const contentFile of contentFiles) {
          if (!frontmatterFiles.includes(contentFile)) {
            warnings.push({
              file: `content/${contentFile}.md`,
              type: 'performance_hint',
              message: 'Content file has no corresponding frontmatter file'
            });
            orphanedFiles++;
          }
        }

        // Find missing content files (frontmatter exists but no content)
        for (const frontmatterFile of frontmatterFiles) {
          if (!contentFiles.includes(frontmatterFile)) {
            warnings.push({
              file: `frontmatter/${frontmatterFile}.md`,
              type: 'missing_optional_field',
              message: 'Frontmatter file has no corresponding content file'
            });
          }
        }
      }

      return { errors, warnings, orphanedFiles };

    } catch (error) {
      errors.push({
        file: 'cross-reference-validation',
        type: 'invalid_structure',
        message: `Cross-reference validation failed: ${error}`,
        suggestion: 'Check file system permissions and directory structure'
      });
      
      return { errors, warnings, orphanedFiles };
    }
  }

  // Utility function to validate slug format
  private isValidSlug(slug: string): boolean {
    return /^[a-z0-9-]+$/.test(slug) && !slug.startsWith('-') && !slug.endsWith('-');
  }

  // Get validation summary for monitoring
  async getValidationSummary(): Promise<{
    lastValidation?: string;
    totalFiles: number;
    healthScore: number;
    recommendations: string[];
  }> {
    try {
      let totalFiles = 0;
      const recommendations: string[] = [];

      // Quick file count
      for (const dirPath of Object.values(this.contentDirs)) {
        if (fs.existsSync(dirPath)) {
          const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
          totalFiles += files.length;
        }
      }

      // Generate recommendations based on file counts
      if (totalFiles < 10) {
        recommendations.push('Consider adding more content files for better coverage');
      }
      
      const healthScore = totalFiles > 0 ? Math.min(100, (totalFiles / 100) * 100) : 0;

      return {
        totalFiles,
        healthScore,
        recommendations
      };

    } catch (error) {
      return {
        totalFiles: 0,
        healthScore: 0,
        recommendations: ['Content validation system needs attention']
      };
    }
  }
}

// Export singleton instance and convenience functions
export const contentValidator = ContentValidator.getInstance();

export async function validateSystemContent(): Promise<ContentValidationResult> {
  return contentValidator.validateAllContent();
}

export async function getContentHealth(): Promise<{
  lastValidation?: string;
  totalFiles: number;
  healthScore: number;
  recommendations: string[];
}> {
  return contentValidator.getValidationSummary();
}
