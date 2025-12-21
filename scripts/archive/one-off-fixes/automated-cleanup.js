#!/usr/bin/env node

/**
 * AUTOMATED CLEANUP SYSTEM
 * ========================
 * 
 * Prevents future bloat accumulation by automatically cleaning:
 * - Old deployment logs (vercel-deployment-*.json)
 * - Outdated test result files (older than 30 days)
 * - Scattered backup files
 * - Temporary build artifacts
 * 
 * Follows GROK principles: minimal, safe, and surgical cleanup.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AutomatedCleanup {
  constructor() {
    this.cleaned = [];
    this.preserved = [];
    this.errors = [];
    this.dryRun = process.argv.includes('--dry-run');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '🧹';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async cleanDeploymentLogs() {
    this.log('Checking for deployment logs...');
    
    try {
      const files = fs.readdirSync('.');
      const deploymentLogs = files.filter(file => 
        file.startsWith('vercel-deployment-') && file.endsWith('.json')
      );

      if (deploymentLogs.length === 0) {
        this.log('No deployment logs found - good!');
        return;
      }

      if (!fs.existsSync('archive/deployment-logs')) {
        if (!this.dryRun) {
          fs.mkdirSync('archive/deployment-logs', { recursive: true });
        }
        this.log('Created archive/deployment-logs directory');
      }

      for (const log of deploymentLogs) {
        const stats = fs.statSync(log);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
        
        if (!this.dryRun) {
          fs.renameSync(log, path.join('archive/deployment-logs', log));
        }
        
        this.log(`${this.dryRun ? '[DRY RUN] Would move' : 'Moved'} ${log} (${sizeMB}MB) to archive`);
        this.cleaned.push(`${log} (${sizeMB}MB)`);
      }
    } catch (error) {
      this.log(`Error cleaning deployment logs: ${error.message}`, 'error');
      this.errors.push(error.message);
    }
  }

  async cleanOldTestResults() {
    this.log('Checking for old test results...');
    
    try {
      if (!fs.existsSync('tests')) return;
      
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const files = fs.readdirSync('tests');
      const resultFiles = files.filter(file => 
        file.endsWith('-results.json') || file.endsWith('-report.json')
      );

      if (!fs.existsSync('archive/old-test-results')) {
        if (!this.dryRun) {
          fs.mkdirSync('archive/old-test-results', { recursive: true });
        }
      }

      let oldCount = 0;
      for (const file of resultFiles) {
        const filePath = path.join('tests', file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime.getTime() < thirtyDaysAgo) {
          if (!this.dryRun) {
            fs.renameSync(filePath, path.join('archive/old-test-results', file));
          }
          this.log(`${this.dryRun ? '[DRY RUN] Would move' : 'Moved'} old test result: ${file}`);
          this.cleaned.push(file);
          oldCount++;
        } else {
          this.preserved.push(file);
        }
      }

      if (oldCount === 0) {
        this.log('No old test results found (all are recent)');
      }
    } catch (error) {
      this.log(`Error cleaning test results: ${error.message}`, 'error');
      this.errors.push(error.message);
    }
  }

  async cleanScatteredBackups() {
    this.log('Checking for scattered backup files...');
    
    try {
      const findBackups = () => {
        try {
          const output = execSync('find . -name "*.backup" -type f', { encoding: 'utf8' });
          return output.trim().split('\n').filter(line => line.length > 0);
        } catch (error) {
          return [];
        }
      };

      const backupFiles = findBackups();
      
      if (backupFiles.length === 0) {
        this.log('No scattered backup files found - good!');
        return;
      }

      if (!fs.existsSync('archive/backups')) {
        if (!this.dryRun) {
          fs.mkdirSync('archive/backups', { recursive: true });
        }
      }

      for (const backupFile of backupFiles) {
        // Skip if already in archive
        if (backupFile.startsWith('./archive/')) {
          this.preserved.push(backupFile);
          continue;
        }

        const fileName = path.basename(backupFile);
        const targetPath = path.join('archive/backups', fileName);
        
        if (!this.dryRun) {
          fs.renameSync(backupFile, targetPath);
        }
        
        this.log(`${this.dryRun ? '[DRY RUN] Would move' : 'Moved'} ${backupFile} to archive`);
        this.cleaned.push(backupFile);
      }
    } catch (error) {
      this.log(`Error cleaning backup files: ${error.message}`, 'error');
      this.errors.push(error.message);
    }
  }

  async cleanTempBuildArtifacts() {
    this.log('Checking for temporary build artifacts...');
    
    const tempDirs = ['.next', 'node_modules/.cache', '.vercel'];
    const tempFiles = ['tsconfig.tsbuildinfo'];
    
    let cleanedArtifacts = [];
    
    for (const dir of tempDirs) {
      if (fs.existsSync(dir)) {
        try {
          const stats = fs.statSync(dir);
          if (stats.isDirectory()) {
            // Only clean .vercel cache, not the whole .vercel directory
            if (dir === '.vercel') {
              const cacheDir = path.join(dir, 'cache');
              if (fs.existsSync(cacheDir)) {
                if (!this.dryRun) {
                  execSync(`rm -rf "${cacheDir}"`);
                }
                this.log(`${this.dryRun ? '[DRY RUN] Would clean' : 'Cleaned'} ${cacheDir}`);
                cleanedArtifacts.push(cacheDir);
              }
            } else {
              if (!this.dryRun) {
                execSync(`rm -rf "${dir}"`);
              }
              this.log(`${this.dryRun ? '[DRY RUN] Would clean' : 'Cleaned'} ${dir}`);
              cleanedArtifacts.push(dir);
            }
          }
        } catch (error) {
          this.log(`Could not clean ${dir}: ${error.message}`, 'warning');
        }
      }
    }
    
    for (const file of tempFiles) {
      if (fs.existsSync(file)) {
        if (!this.dryRun) {
          fs.unlinkSync(file);
        }
        this.log(`${this.dryRun ? '[DRY RUN] Would remove' : 'Removed'} ${file}`);
        cleanedArtifacts.push(file);
      }
    }
    
    if (cleanedArtifacts.length === 0) {
      this.log('No temporary build artifacts found');
    } else {
      this.cleaned.push(...cleanedArtifacts);
    }
  }

  async generateReport() {
    this.log('\n📊 CLEANUP REPORT');
    this.log('================');
    
    if (this.dryRun) {
      this.log('🔍 DRY RUN MODE - No files were actually moved or deleted');
    }
    
    this.log(`✅ Items cleaned: ${this.cleaned.length}`);
    this.log(`✅ Items preserved: ${this.preserved.length}`);
    this.log(`❌ Errors encountered: ${this.errors.length}`);
    
    if (this.cleaned.length > 0) {
      this.log('\nCleaned items:');
      this.cleaned.forEach(item => this.log(`  - ${item}`));
    }
    
    if (this.errors.length > 0) {
      this.log('\nErrors:', 'error');
      this.errors.forEach(error => this.log(`  - ${error}`, 'error'));
    }
    
    this.log(`\n🎯 Status: ${this.errors.length === 0 ? 'SUCCESS' : 'COMPLETED WITH ERRORS'}`);
  }

  async run() {
    this.log('🚀 AUTOMATED CLEANUP SYSTEM');
    this.log('============================');
    
    if (this.dryRun) {
      this.log('🔍 Running in DRY RUN mode - no files will be modified');
    }
    
    await this.cleanDeploymentLogs();
    await this.cleanOldTestResults();
    await this.cleanScatteredBackups();
    await this.cleanTempBuildArtifacts();
    await this.generateReport();
    
    return this.errors.length === 0;
  }
}

// CLI Usage
async function main() {
  const cleanup = new AutomatedCleanup();
  const success = await cleanup.run();
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = AutomatedCleanup;
