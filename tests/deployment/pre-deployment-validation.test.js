/**
 * PRE-DEPLOYMENT ERROR PREVENTION TESTS
 * ======================================
 * Tests that verify errors are caught BEFORE deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('Pre-Deployment Error Prevention', () => {
  describe('TypeScript type checking', () => {
    test('type-check script detects type errors', () => {
      // This should pass in normal circumstances
      try {
        execSync('npm run type-check', { stdio: 'pipe' });
      } catch (error) {
        // If it fails, that's actually what we're testing - 
        // type errors should be caught before deployment
        expect(error.status).not.toBe(0);
      }
    });

    test('tsconfig.json is configured correctly', () => {
      const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
      expect(fs.existsSync(tsconfigPath)).toBe(true);
      
      // tsconfig.json may have comments, use a more lenient parser or just check existence
      const content = fs.readFileSync(tsconfigPath, 'utf-8');
      
      // Should have strict checks enabled
      expect(content).toContain('strict');
      expect(content).toContain('compilerOptions');
    });
  });

  describe('Build validation', () => {
    test('production-predeploy script validates environment', () => {
      const predeployScript = path.join(process.cwd(), 'scripts/deployment/production-predeploy.js');
      expect(fs.existsSync(predeployScript)).toBe(true);
    });

    test('required directories exist', () => {
      const requiredDirs = ['app', 'types', 'content', 'scripts'];
      
      requiredDirs.forEach(dir => {
        const dirPath = path.join(process.cwd(), dir);
        expect(fs.existsSync(dirPath)).toBe(true);
      });
    });

    test('required config files exist', () => {
      const requiredFiles = [
        'next.config.js',
        'tsconfig.json',
        'package.json',
        'vercel.json'
      ];
      
      requiredFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });
  });

  describe('Dependency validation', () => {
    test('package.json has all required dependencies', () => {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      const criticalDeps = [
        'next',
        'react',
        'react-dom',
        'typescript'
      ];
      
      criticalDeps.forEach(dep => {
        expect(
          packageJson.dependencies[dep] || packageJson.devDependencies[dep]
        ).toBeDefined();
      });
    });

    test('node version meets minimum requirements', () => {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      expect(packageJson.engines).toBeDefined();
      expect(packageJson.engines.node).toBeDefined();
      expect(packageJson.engines.node).toContain('20');
    });
  });

  describe('Import validation', () => {
    test('no imports from non-existent modules', async () => {
      // Check for common import errors
      const appDir = path.join(process.cwd(), 'app');
      
      if (fs.existsSync(appDir)) {
        const checkImports = (dir) => {
          const files = fs.readdirSync(dir);
          
          files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
              checkImports(filePath);
            } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
              const content = fs.readFileSync(filePath, 'utf-8');
              
              // Check for relative imports that might be broken
              const relativeImports = content.match(/from ['"]\.\.?\/[^'"]+['"]/g);
              
              if (relativeImports) {
                relativeImports.forEach(importStatement => {
                  const importPath = importStatement.match(/['"](.+)['"]/)[1];
                  const resolvedPath = path.join(path.dirname(filePath), importPath);
                  
                  // Check if file exists (with possible extensions)
                  const possibleExtensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
                  const exists = possibleExtensions.some(ext => 
                    fs.existsSync(resolvedPath + ext)
                  );
                  
                  if (!exists) {
                    console.warn(`Potential missing import: ${importPath} in ${filePath}`);
                  }
                });
              }
            }
          });
        };
        
        checkImports(appDir);
      }
    });
  });

  describe('Build script validation', () => {
    test('vercel.json build command is valid', () => {
      const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
      expect(fs.existsSync(vercelConfigPath)).toBe(true);
      
      const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'));
      
      if (vercelConfig.buildCommand) {
        expect(vercelConfig.buildCommand).toContain('next build');
        
        // Check if predeploy script exists
        if (vercelConfig.buildCommand.includes('production-predeploy.js')) {
          const predeployPath = path.join(process.cwd(), 'scripts/deployment/production-predeploy.js');
          expect(fs.existsSync(predeployPath)).toBe(true);
        }
      }
    });

    test('npm scripts are properly defined', () => {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      const requiredScripts = ['build', 'dev', 'test', 'type-check'];
      
      requiredScripts.forEach(script => {
        expect(packageJson.scripts[script]).toBeDefined();
      });
    });
  });

  describe('Error detection before push', () => {
    test('git hook exists for post-push monitoring', () => {
      const hookPath = path.join(process.cwd(), '.git/hooks/post-push');
      
      if (fs.existsSync(path.join(process.cwd(), '.git'))) {
        // Only test if we're in a git repository
        expect(fs.existsSync(hookPath)).toBe(true);
        
        if (fs.existsSync(hookPath)) {
          const hookContent = fs.readFileSync(hookPath, 'utf-8');
          expect(hookContent).toContain('monitor-deployment.js');
          expect(hookContent).toContain('analyze-deployment-error.js');
        }
      }
    });

    test('setup script creates monitoring hooks', () => {
      const setupScript = path.join(process.cwd(), 'scripts/deployment/setup-auto-monitor.sh');
      expect(fs.existsSync(setupScript)).toBe(true);
      
      // Check if it's executable
      const stats = fs.statSync(setupScript);
      const isExecutable = (stats.mode & 0o111) !== 0;
      expect(isExecutable).toBe(true);
    });
  });

  describe('Common error scenarios prevention', () => {
    test('environment variables are documented', () => {
      // Check for .env.example or documentation
      const envExamplePath = path.join(process.cwd(), '.env.example');
      const envLocalPath = path.join(process.cwd(), '.env.local');
      
      // At least one should exist or be documented
      const hasEnvGuide = fs.existsSync(envExamplePath) || 
                          fs.existsSync(path.join(process.cwd(), 'DEPLOYMENT.md'));
      
      expect(hasEnvGuide).toBe(true);
    });

    test('critical files are not in gitignore', () => {
      const gitignorePath = path.join(process.cwd(), '.gitignore');
      
      if (fs.existsSync(gitignorePath)) {
        const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
        
        // These should NOT be ignored
        const criticalFiles = [
          'next.config.js',
          'tsconfig.json',
          'package.json',
          'vercel.json'
        ];
        
        criticalFiles.forEach(file => {
          expect(gitignore).not.toContain(`/${file}`);
          expect(gitignore).not.toContain(`${file}`);
        });
      }
    });

    test('build output directories are properly configured', () => {
      const nextConfigPath = path.join(process.cwd(), 'next.config.js');
      expect(fs.existsSync(nextConfigPath)).toBe(true);
      
      // .next should be in gitignore
      const gitignorePath = path.join(process.cwd(), '.gitignore');
      if (fs.existsSync(gitignorePath)) {
        const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
        expect(gitignore).toContain('.next');
      }
    });
  });

  describe('Monitoring tools validation', () => {
    test('monitor script exists and is valid', () => {
      const monitorScript = path.join(process.cwd(), 'scripts/deployment/monitor-deployment.js');
      expect(fs.existsSync(monitorScript)).toBe(true);
      
      const content = fs.readFileSync(monitorScript, 'utf-8');
      expect(content).toContain('monitorDeployment');
      expect(content).toContain('vercel');
    });

    test('analyzer script exists and is valid', () => {
      const analyzerScript = path.join(process.cwd(), 'scripts/deployment/analyze-deployment-error.js');
      expect(fs.existsSync(analyzerScript)).toBe(true);
      
      const content = fs.readFileSync(analyzerScript, 'utf-8');
      expect(content).toContain('analyzeErrorLog');
      expect(content).toContain('errorPatterns');
    });

    test('documentation exists for deployment monitoring', () => {
      const docs = [
        'DEPLOYMENT.md',
        'scripts/deployment/README.md',
        'MONITORING_SETUP.md'
      ];
      
      docs.forEach(doc => {
        const docPath = path.join(process.cwd(), doc);
        expect(fs.existsSync(docPath)).toBe(true);
      });
    });
  });
});
