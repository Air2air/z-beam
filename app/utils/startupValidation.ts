// app/utils/startupValidation.ts
// GROK-Compliant Startup Validation System
// Fails fast on configuration issues, validates dependencies upfront

import { ConfigurationError, validateEnvironment } from './errorSystem';
import { logger } from './logger';
import { initializeConfig, getConfig } from '../config';
import { contentValidator } from './contentValidator';

interface StartupCheckResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  validatedAt: string;
  duration?: number;
}

class StartupValidator {
  private static instance: StartupValidator;
  private validationResults: StartupCheckResult | null = null;
  private strictMode: boolean = true;

  static getInstance(): StartupValidator {
    if (!StartupValidator.instance) {
      StartupValidator.instance = new StartupValidator();
    }
    return StartupValidator.instance;
  }

  // Main validation function - fail fast on critical issues
  async validateSystem(): Promise<StartupCheckResult> {
    const startTime = performance.now();
    const result: StartupCheckResult = {
      passed: true,
      errors: [],
      warnings: [],
      duration: 0,
      validatedAt: new Date().toISOString()
    };

    try {
      logger.info('Starting GROK-compliant system validation');

      // 1. Initialize and validate configuration system (FAIL FAST)
      try {
        await initializeConfig();
        const config = getConfig();
        logger.info('Configuration system initialized', { environment: config.app.environment });
      } catch (error) {
        result.errors.push(`Configuration initialization failed: ${error}`);
        result.passed = false;
        
        // FAIL FAST - configuration is critical
        if (this.strictMode) {
          throw new ConfigurationError(
            'Critical configuration failure - cannot continue startup',
            { configError: error, timestamp: result.validatedAt }
          );
        }
      }

      // 2. Validate environment and dependencies
      try {
        validateEnvironment();
      } catch (error) {
        result.errors.push(`Environment validation failed: ${error}`);
        result.passed = false;
      }

      // 3. Validate content integrity (if validation is enabled)
      const config = getConfig();
      if (config.validation.validateOnStartup) {
        try {
          const contentResult = await contentValidator.validateAllContent();
          if (!contentResult.passed) {
            result.warnings.push(`Content validation issues found: ${contentResult.errors.length} errors`);
            if (config.validation.strictMode) {
              result.errors.push('Content validation failed in strict mode');
              result.passed = false;
            }
          }
        } catch (error) {
          result.warnings.push(`Content validation check failed: ${error}`);
        }
      }

      // 4. Check critical directories
      const criticalDirs = [
        'app',
        'app/components', 
        'app/utils',
        'content'
      ];

      for (const dir of criticalDirs) {
        if (!this.directoryExists(dir)) {
          result.errors.push(`Critical directory missing: ${dir}`);
          result.passed = false;
        }
      }

      // 5. Validate essential files
      const essentialFiles = [
        'package.json',
        'next.config.js',
        'app/layout.tsx'
      ];

      for (const file of essentialFiles) {
        if (!this.fileExists(file)) {
          result.errors.push(`Essential file missing: ${file}`);
          result.passed = false;
        }
      }

      result.duration = performance.now() - startTime;

      // Log validation results
      if (result.passed) {
        logger.info('System validation completed successfully', {
          duration: result.duration,
          warnings: result.warnings.length
        });
      } else {
        logger.error('System validation failed', {
          errors: result.errors.length,
          warnings: result.warnings.length,
          duration: result.duration
        });
      }

      return result;

    } catch (error) {
      result.duration = performance.now() - startTime;
      
      if (error instanceof ConfigurationError) {
        throw error; // Re-throw configuration errors as-is
      }
      
      throw new ConfigurationError(
        `System validation failed: ${error}`,
        { 
          validationResult: result,
          originalError: error,
          duration: result.duration
        }
      );
    }
  }

  // Helper method to check if directory exists
  private directoryExists(dirPath: string): boolean {
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.join(process.cwd(), dirPath);
    
    try {
      const stats = fs.statSync(fullPath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  // Helper method to check if file exists
  private fileExists(filePath: string): boolean {
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.join(process.cwd(), filePath);
    
    try {
      const stats = fs.statSync(fullPath);
      return stats.isFile();
    } catch {
      return false;
    }
  }

  // Quick health check for monitoring
  getLastValidationResult(): StartupCheckResult | null {
    return this.validationResults;
  }

  // Reset validation state (for testing)
  reset(): void {
    this.validationResults = null;
  }
}

// Export singleton instance
export const startupValidator = StartupValidator.getInstance();

// Convenience functions
export async function validateSystemStartup(): Promise<StartupCheckResult> {
  return startupValidator.validateSystem();
}

export function getStartupStatus(): StartupCheckResult | null {
  return startupValidator.getLastValidationResult();
}
