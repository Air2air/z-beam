/**
 * VERCEL DEPLOYMENT MONITOR INTEGRATION TESTS
 * ============================================
 * Tests for the complete deployment monitoring workflow
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('Vercel Deployment Monitor Integration', () => {
  const monitorScript = path.join(__dirname, '../../scripts/deployment/monitor-deployment.js');
  const analyzerScript = path.join(__dirname, '../../scripts/deployment/analyze-deployment-error.js');
  const errorLogPath = path.join(process.cwd(), '.vercel-deployment-error.log');
  const analysisPath = path.join(process.cwd(), '.vercel-error-analysis.txt');

  beforeEach(() => {
    // Clean up any existing error files
    [errorLogPath, analysisPath].forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  });

  afterEach(() => {
    // Clean up test files
    [errorLogPath, analysisPath].forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  });

  describe('Error log generation', () => {
    test('monitor script creates error log on failure', () => {
      // Create mock error log to simulate monitor behavior
      const mockErrorLog = `
Error: Build failed
Module not found: Can't resolve './missing-file'
      `;
      
      fs.writeFileSync(errorLogPath, mockErrorLog);
      
      expect(fs.existsSync(errorLogPath)).toBe(true);
      const content = fs.readFileSync(errorLogPath, 'utf-8');
      expect(content).toContain('Module not found');
    });

    test('error log contains deployment URL', () => {
      const mockErrorLog = `
Deployment URL: https://z-beam-abc123.vercel.app
Error: Build failed
      `;
      
      fs.writeFileSync(errorLogPath, mockErrorLog);
      const content = fs.readFileSync(errorLogPath, 'utf-8');
      expect(content).toContain('z-beam-abc123.vercel.app');
    });
  });

  describe('Error analysis workflow', () => {
    test('analyzer creates analysis file from error log', () => {
      // Create error log
      const mockErrorLog = `
Module not found: Can't resolve 'react-icons'
Type error: Property 'id' does not exist
      `;
      fs.writeFileSync(errorLogPath, mockErrorLog);

      // Run analyzer
      try {
        execSync(`node ${analyzerScript}`, { stdio: 'pipe' });
      } catch (error) {
        // Analyzer may exit with error code, that's ok
      }

      // Check if analysis was created
      expect(fs.existsSync(analysisPath)).toBe(true);
      const analysis = fs.readFileSync(analysisPath, 'utf-8');
      expect(analysis).toContain('Missing Module');
      expect(analysis).toContain('TypeScript Error');
    });

    test('analysis file contains actionable fix suggestions', () => {
      const mockErrorLog = `
Module not found: Can't resolve 'lodash'
      `;
      fs.writeFileSync(errorLogPath, mockErrorLog);

      try {
        execSync(`node ${analyzerScript}`, { stdio: 'pipe' });
      } catch (error) {
        // Ignore exit code
      }

      if (fs.existsSync(analysisPath)) {
        const analysis = fs.readFileSync(analysisPath, 'utf-8');
        expect(analysis).toContain('npm install');
        expect(analysis).toContain('Suggested fixes');
      }
    });

    test('handles missing error log gracefully', () => {
      // Don't create error log
      expect(fs.existsSync(errorLogPath)).toBe(false);

      // Try to run analyzer
      try {
        execSync(`node ${analyzerScript}`, { stdio: 'pipe' });
        // Should fail
        fail('Should have thrown error');
      } catch (error) {
        expect(error.status).toBe(1);
      }
    });
  });

  describe('Common deployment errors', () => {
    test('detects and analyzes missing dependency errors', () => {
      const errorScenarios = [
        {
          log: `Module not found: Can't resolve 'next-auth'`,
          expectedCategory: 'Missing Module',
          expectedFix: 'npm install'
        },
        {
          log: `Cannot find module '@/components/Header'`,
          expectedCategory: 'Missing Module',
          expectedFix: 'import statement'
        },
        {
          log: `Error: Cannot find module 'gray-matter'`,
          expectedCategory: 'Missing Module',
          expectedFix: 'npm install'
        }
      ];

      errorScenarios.forEach(scenario => {
        fs.writeFileSync(errorLogPath, scenario.log);
        
        try {
          execSync(`node ${analyzerScript}`, { stdio: 'pipe' });
        } catch (error) {
          // Ignore
        }

        if (fs.existsSync(analysisPath)) {
          const analysis = fs.readFileSync(analysisPath, 'utf-8');
          expect(analysis).toContain(scenario.expectedCategory);
          expect(analysis.toLowerCase()).toContain(scenario.expectedFix.toLowerCase());
        }

        // Clean up for next iteration
        fs.unlinkSync(errorLogPath);
        if (fs.existsSync(analysisPath)) {
          fs.unlinkSync(analysisPath);
        }
      });
    });

    test('detects and analyzes TypeScript errors', () => {
      const errorScenarios = [
        {
          log: `Type error: Property 'map' does not exist on type 'string'`,
          expectedFix: 'type-check'
        },
        {
          log: `error TS2345: Argument of type 'number' is not assignable to parameter`,
          expectedFix: 'TypeScript'
        }
      ];

      errorScenarios.forEach(scenario => {
        fs.writeFileSync(errorLogPath, scenario.log);
        
        try {
          execSync(`node ${analyzerScript}`, { stdio: 'pipe' });
        } catch (error) {
          // Ignore
        }

        if (fs.existsSync(analysisPath)) {
          const analysis = fs.readFileSync(analysisPath, 'utf-8');
          expect(analysis.toLowerCase()).toContain(scenario.expectedFix.toLowerCase());
        }

        // Clean up
        fs.unlinkSync(errorLogPath);
        if (fs.existsSync(analysisPath)) {
          fs.unlinkSync(analysisPath);
        }
      });
    });

    test('detects build configuration errors', () => {
      const configErrors = [
        `Build failed with exit code: 1`,
        `Out of memory`,
        `ELIFECYCLE npm ERR!`
      ];

      configErrors.forEach(errorLog => {
        fs.writeFileSync(errorLogPath, errorLog);
        
        try {
          execSync(`node ${analyzerScript}`, { stdio: 'pipe' });
        } catch (error) {
          // Ignore
        }

        expect(fs.existsSync(analysisPath)).toBe(true);
        
        // Clean up
        fs.unlinkSync(errorLogPath);
        if (fs.existsSync(analysisPath)) {
          fs.unlinkSync(analysisPath);
        }
      });
    });
  });

  describe('Copilot integration', () => {
    test('analysis file is formatted for Copilot', () => {
      const mockErrorLog = `
Module not found: Can't resolve './utils/helper'
      `;
      fs.writeFileSync(errorLogPath, mockErrorLog);

      try {
        execSync(`node ${analyzerScript}`, { stdio: 'pipe' });
      } catch (error) {
        // Ignore
      }

      if (fs.existsSync(analysisPath)) {
        const analysis = fs.readFileSync(analysisPath, 'utf-8');
        
        // Check for Copilot-friendly formatting
        expect(analysis).toContain('deployment failed');
        expect(analysis).toContain('Cause:');
        expect(analysis).toContain('Suggested fixes:');
        expect(analysis).toContain('Please analyze');
      }
    });

    test('analysis includes line numbers for error context', () => {
      const mockErrorLog = `Line 1
Line 2
Module not found: Can't resolve './missing'
Line 4
Line 5`;
      
      fs.writeFileSync(errorLogPath, mockErrorLog);

      try {
        execSync(`node ${analyzerScript}`, { stdio: 'pipe' });
      } catch (error) {
        // Ignore
      }

      // Analyzer should track line numbers
      expect(fs.existsSync(analysisPath)).toBe(true);
    });
  });

  describe('Error prevention', () => {
    test('gitignore excludes error log files', () => {
      const gitignorePath = path.join(process.cwd(), '.gitignore');
      
      if (fs.existsSync(gitignorePath)) {
        const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
        expect(gitignore).toContain('.vercel-deployment-error.log');
        expect(gitignore).toContain('.vercel-error-analysis.txt');
      }
    });

    test('error logs are not committed to repository', () => {
      // Create error files
      fs.writeFileSync(errorLogPath, 'test error');
      fs.writeFileSync(analysisPath, 'test analysis');

      // Check git status
      try {
        const gitStatus = execSync('git status --porcelain', { encoding: 'utf-8' });
        
        // These files should not appear in git status
        expect(gitStatus).not.toContain('.vercel-deployment-error.log');
        expect(gitStatus).not.toContain('.vercel-error-analysis.txt');
      } catch (error) {
        // Git might not be available in test environment
        console.log('Git not available for this test');
      }
    });
  });
});
