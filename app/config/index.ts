// app/config/index.ts
// GROK-Compliant Centralized Configuration System
// Single source of truth for all application settings with fail-fast validation

import { ConfigurationError, validateEnvironment } from '../utils/errorSystem';
import { logger } from '../utils/logger';

// Application configuration interface
interface AppConfig {
  app: {
    name: string;
    version: string;
    environment: 'development' | 'production' | 'test';
    baseUrl: string;
    port: number;
  };
  content: {
    maxFileSize: number;
    allowedFormats: string[];
    defaultTTL: number;
    batchSize: number;
  };
  cache: {
    badges: { ttl: number; maxEntries: number };
    materials: { ttl: number; maxEntries: number };
    files: { ttl: number; maxEntries: number };
    colors: { ttl: number; maxEntries: number };
  };
  api: {
    timeout: number;
    retryAttempts: number;
    rateLimitWindow: number;
    maxRequestSize: string;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    structured: boolean;
    performance: boolean;
    maxLogFiles: number;
  };
  validation: {
    strictMode: boolean;
    failFast: boolean;
    validateOnStartup: boolean;
    contentIntegrityCheck: boolean;
  };
  build: {
    enableTypeChecking: boolean;
    enableLinting: boolean;
    minifyOutput: boolean;
    generateSourceMaps: boolean;
  };
}

// Default configuration values (fail-safe defaults)
const DEFAULT_CONFIG: AppConfig = {
  app: {
    name: 'Z-Beam Laser Cleaning',
    version: '1.0.0',
    environment: 'development',
    baseUrl: 'http://localhost:3000',
    port: 3000
  },
  content: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFormats: ['.md', '.yaml', '.yml'],
    defaultTTL: 30 * 60 * 1000,    // 30 minutes
    batchSize: 50
  },
  cache: {
    badges: { ttl: 30 * 60 * 1000, maxEntries: 1000 },
    materials: { ttl: 60 * 60 * 1000, maxEntries: 500 },
    files: { ttl: 15 * 60 * 1000, maxEntries: 200 },
    colors: { ttl: 2 * 60 * 60 * 1000, maxEntries: 100 }
  },
  api: {
    timeout: 30000,               // 30 seconds
    retryAttempts: 3,
    rateLimitWindow: 60000,       // 1 minute
    maxRequestSize: '10mb'
  },
  logging: {
    level: 'info',
    structured: true,
    performance: true,
    maxLogFiles: 10
  },
  validation: {
    strictMode: true,
    failFast: true,
    validateOnStartup: true,
    contentIntegrityCheck: true
  },
  build: {
    enableTypeChecking: true,
    enableLinting: true,
    minifyOutput: true,
    generateSourceMaps: false
  }
};

class ConfigurationManager {
  private static instance: ConfigurationManager;
  private config: AppConfig;
  private isValidated: boolean = false;

  constructor() {
    this.config = { ...DEFAULT_CONFIG };
  }

  static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  // Initialize and validate configuration (fail-fast)
  async initialize(): Promise<void> {
    const startTime = performance.now();
    
    try {
      logger.info('Initializing configuration system');

      // 1. Load environment-specific overrides
      this.loadEnvironmentOverrides();

      // 2. Validate configuration integrity
      this.validateConfiguration();

      // 3. Apply environment-specific adjustments
      this.applyEnvironmentAdjustments();

      // 4. Validate dependencies and external requirements
      await this.validateDependencies();

      this.isValidated = true;

      logger.performance('Configuration initialization completed', performance.now() - startTime, {
        environment: this.config.app.environment,
        configValidated: true
      });

    } catch (error) {
      throw new ConfigurationError(
        `Configuration initialization failed: ${error}`,
        { 
          configState: this.config,
          initializationTime: performance.now() - startTime,
          isValidated: false
        }
      );
    }
  }

  // Load environment-specific configuration overrides
  private loadEnvironmentOverrides(): void {
    const env = process.env.NODE_ENV || 'development';
    
    // Environment-specific overrides
    switch (env) {
      case 'production':
        this.config.app.environment = 'production';
        this.config.app.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://z-beam.vercel.app';
        this.config.logging.level = 'warn';
        this.config.validation.strictMode = true;
        this.config.build.generateSourceMaps = false;
        break;
        
      case 'test':
        this.config.app.environment = 'test';
        this.config.cache.badges.ttl = 1000; // Short TTL for tests
        this.config.logging.level = 'error';
        this.config.validation.validateOnStartup = false;
        break;
        
      case 'development':
      default:
        this.config.app.environment = 'development';
        this.config.logging.level = 'debug';
        this.config.validation.strictMode = false;
        this.config.build.generateSourceMaps = true;
        break;
    }

    // Environment variable overrides (fail-fast on invalid values)
    if (process.env.PORT) {
      const port = parseInt(process.env.PORT, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        throw new ConfigurationError(
          `Invalid PORT environment variable: ${process.env.PORT}`,
          { providedPort: process.env.PORT, validRange: '1-65535' }
        );
      }
      this.config.app.port = port;
    }

    if (process.env.LOG_LEVEL) {
      const validLevels = ['debug', 'info', 'warn', 'error'];
      if (!validLevels.includes(process.env.LOG_LEVEL)) {
        throw new ConfigurationError(
          `Invalid LOG_LEVEL environment variable: ${process.env.LOG_LEVEL}`,
          { providedLevel: process.env.LOG_LEVEL, validLevels }
        );
      }
      this.config.logging.level = process.env.LOG_LEVEL as any;
    }
  }

  // Validate configuration integrity (fail-fast)
  private validateConfiguration(): void {
    const errors: string[] = [];

    // Validate cache configuration
    for (const [cacheType, cacheConfig] of Object.entries(this.config.cache)) {
      if (cacheConfig.ttl <= 0) {
        errors.push(`Invalid TTL for ${cacheType} cache: ${cacheConfig.ttl}`);
      }
      if (cacheConfig.maxEntries <= 0) {
        errors.push(`Invalid maxEntries for ${cacheType} cache: ${cacheConfig.maxEntries}`);
      }
    }

    // Validate API configuration
    if (this.config.api.timeout <= 0) {
      errors.push(`Invalid API timeout: ${this.config.api.timeout}`);
    }
    if (this.config.api.retryAttempts < 0) {
      errors.push(`Invalid retry attempts: ${this.config.api.retryAttempts}`);
    }

    // Validate content configuration
    if (this.config.content.maxFileSize <= 0) {
      errors.push(`Invalid max file size: ${this.config.content.maxFileSize}`);
    }
    if (this.config.content.batchSize <= 0) {
      errors.push(`Invalid batch size: ${this.config.content.batchSize}`);
    }

    // Fail fast if any validation errors found
    if (errors.length > 0) {
      throw new ConfigurationError(
        `Configuration validation failed: ${errors.join(', ')}`,
        { validationErrors: errors, config: this.config }
      );
    }
  }

  // Apply environment-specific adjustments
  private applyEnvironmentAdjustments(): void {
    // Production optimizations
    if (this.config.app.environment === 'production') {
      // Increase cache sizes for production
      this.config.cache.badges.maxEntries *= 2;
      this.config.cache.materials.maxEntries *= 2;
      
      // Longer timeouts for production
      this.config.api.timeout *= 1.5;
    }

    // Development optimizations
    if (this.config.app.environment === 'development') {
      // Shorter cache TTLs for development
      Object.values(this.config.cache).forEach(cache => {
        cache.ttl = Math.min(cache.ttl, 5 * 60 * 1000); // Max 5 minutes
      });
    }
  }

  // Validate external dependencies and environment
  private async validateDependencies(): Promise<void> {
    // Validate environment using existing error system
    validateEnvironment();

    // Validate required directories exist
    const requiredDirs = [
      'content/components/frontmatter',
      'content/components/badgesymbol',
      'app/utils',
      'app/components'
    ];

    const fs = require('fs');
    const path = require('path');
    
    for (const dir of requiredDirs) {
      const fullPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(fullPath)) {
        throw new ConfigurationError(
          `Required directory missing: ${dir}`,
          { missingDirectory: fullPath, requiredDirectories: requiredDirs }
        );
      }
    }

    // Validate package.json exists and has required fields
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      throw new ConfigurationError(
        'package.json not found in project root',
        { expectedPath: packageJsonPath }
      );
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const requiredFields = ['name', 'version', 'scripts'];
      
      for (const field of requiredFields) {
        if (!packageJson[field]) {
          throw new ConfigurationError(
            `Missing required field in package.json: ${field}`,
            { missingField: field, requiredFields }
          );
        }
      }
    } catch (error) {
      if (error instanceof ConfigurationError) throw error;
      
      throw new ConfigurationError(
        `Invalid package.json: ${error}`,
        { packageJsonPath, originalError: error }
      );
    }
  }

  // Get configuration (ensure initialized first)
  getConfig(): AppConfig {
    if (!this.isValidated) {
      throw new ConfigurationError(
        'Configuration not initialized - call initialize() first',
        { isValidated: false }
      );
    }
    return { ...this.config };
  }

  // Get specific configuration section
  getSection<K extends keyof AppConfig>(section: K): AppConfig[K] {
    if (!this.isValidated) {
      throw new ConfigurationError(
        'Configuration not initialized - call initialize() first',
        { requestedSection: section, isValidated: false }
      );
    }
    return { ...this.config[section] };
  }

  // Update configuration (with validation)
  updateConfig<K extends keyof AppConfig>(section: K, updates: Partial<AppConfig[K]>): void {
    if (!this.isValidated) {
      throw new ConfigurationError(
        'Cannot update uninitialized configuration',
        { requestedSection: section, isValidated: false }
      );
    }

    // Apply updates
    this.config[section] = { ...this.config[section], ...updates };
    
    // Re-validate after updates
    this.validateConfiguration();
    
    logger.info(`Configuration section updated: ${section}`, { 
      section, 
      updates,
      timestamp: new Date().toISOString()
    });
  }

  // Get configuration summary for monitoring
  getConfigSummary(): {
    environment: string;
    isValidated: boolean;
    lastInitialized?: string;
    cacheConfig: Record<string, { ttl: number; maxEntries: number }>;
    apiConfig: { timeout: number; retryAttempts: number };
  } {
    return {
      environment: this.config.app.environment,
      isValidated: this.isValidated,
      cacheConfig: this.config.cache,
      apiConfig: {
        timeout: this.config.api.timeout,
        retryAttempts: this.config.api.retryAttempts
      }
    };
  }
}

// Export singleton instance and convenience functions
export const configManager = ConfigurationManager.getInstance();

// Convenience function to initialize configuration
export async function initializeConfig(): Promise<void> {
  return configManager.initialize();
}

// Convenience function to get configuration
export function getConfig(): AppConfig {
  return configManager.getConfig();
}

// Convenience function to get specific configuration section
export function getConfigSection<K extends keyof AppConfig>(section: K): AppConfig[K] {
  return configManager.getSection(section);
}

// Type-safe configuration getters for common sections
export const Config = {
  app: () => getConfigSection('app'),
  cache: () => getConfigSection('cache'),
  api: () => getConfigSection('api'),
  logging: () => getConfigSection('logging'),
  validation: () => getConfigSection('validation'),
  build: () => getConfigSection('build'),
  content: () => getConfigSection('content'),
} as const;

// Export types for external use
export type { AppConfig };
