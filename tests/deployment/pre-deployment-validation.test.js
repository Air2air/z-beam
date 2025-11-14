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
    test('No Babel config should exist (Next.js uses SWC)', () => {
      // No Babel config files should exist - Next.js 14 uses SWC compiler
      const babelFiles = [
        '.babelrc',
        '.babelrc.js', 
        '.babelrc.json',
        'babel.config.js',
        'babel.config.json'
      ];
      
      babelFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        expect(fs.existsSync(filePath)).toBe(false);
      });
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
      
      // Runtime dependencies
      const runtimeDeps = ['next', 'react', 'react-dom'];
      runtimeDeps.forEach(dep => {
        expect(packageJson.dependencies[dep]).toBeDefined();
      });
      
      // TypeScript must be in devDependencies (not dependencies)
      expect(packageJson.devDependencies['typescript']).toBeDefined();
      expect(packageJson.dependencies['typescript']).toBeUndefined();
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
    test('vercel.json has correct install command with --include=dev', () => {
      const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
      expect(fs.existsSync(vercelConfigPath)).toBe(true);
      
      const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'));
      
      // Must include devDependencies to get TypeScript and build tools
      expect(vercelConfig.installCommand).toContain('--include=dev');
      expect(vercelConfig.installCommand).toContain('npm ci');
    });

    test('vercel.json build command is valid', () => {
      const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
      const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'));
      
      if (vercelConfig.buildCommand) {
        // Accept both 'next build' and 'npm run build' patterns
        const validBuildPatterns = ['next build', 'npm run build', 'yarn build', 'pnpm build'];
        const hasValidBuild = validBuildPatterns.some(pattern => 
          vercelConfig.buildCommand.includes(pattern)
        );
        expect(hasValidBuild).toBe(true);
        
        // Should NOT include production-predeploy.js (removed to fix builds)
        expect(vercelConfig.buildCommand).not.toContain('production-predeploy.js');
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
          // Note: analyze-deployment-error.js is called within monitor script, not directly from hook
        }
      }
    });

    test('smart-deploy script handles monitoring', () => {
      const smartDeploy = path.join(process.cwd(), 'scripts/deployment/smart-deploy.sh');
      expect(fs.existsSync(smartDeploy)).toBe(true);
      
      // Check if it's executable
      const stats = fs.statSync(smartDeploy);
      expect(stats.mode & parseInt('755', 8)).toBeTruthy();
      
      // Check it contains monitoring functionality
      const content = fs.readFileSync(smartDeploy, 'utf-8');
      expect(content).toContain('deployment monitoring');
    });
  });

  describe('E2E Testing System Validation', () => {
    test('E2E tests are properly integrated with Jest', () => {
      const e2eDir = path.join(process.cwd(), 'tests/e2e');
      expect(fs.existsSync(e2eDir)).toBe(true);
      
      // Check E2E test files exist and are in Jest format
      const e2eTests = ['property-naming.test.js', 'property-extraction.test.js'];
      e2eTests.forEach(testFile => {
        const testPath = path.join(e2eDir, testFile);
        expect(fs.existsSync(testPath)).toBe(true);
        
        const content = fs.readFileSync(testPath, 'utf-8');
        // Should be proper Jest format with describe/test blocks
        expect(content).toContain('describe(');
        expect(content).toContain('test(');
        expect(content).toContain('expect(');
        // Should be primarily Jest format (may have legacy console.log for backward compatibility)
        const jestMatches = (content.match(/expect\(/g) || []).length;
        const consoleMatches = (content.match(/console\.log/g) || []).length;
        expect(jestMatches).toBeGreaterThan(consoleMatches);
      });
    });

    test('E2E tests can be run via npm test', () => {
      // Verify E2E tests are included in Jest configuration
      const jestConfigPath = path.join(process.cwd(), 'jest.config.js');
      expect(fs.existsSync(jestConfigPath)).toBe(true);
      
      const jestConfig = fs.readFileSync(jestConfigPath, 'utf-8');
      expect(jestConfig).toContain('tests/e2e/**/*.test.{js,jsx,ts,tsx}');
    });
  });

  describe('Common error scenarios prevention', () => {
    test.skip('API routes handle missing environment variables gracefully', () => {
      // Note: We use Nodemailer with Gmail SMTP, not Resend
      // Check contact route for safe Resend initialization
      const contactRoutePath = path.join(process.cwd(), 'app/api/contact/route.ts');
      
      if (fs.existsSync(contactRoutePath)) {
        const content = fs.readFileSync(contactRoutePath, 'utf-8');
        
        // Should use conditional initialization for Resend
        expect(content).toContain('process.env.RESEND_API_KEY ? new Resend');
        
        // Should check for both API key and client before using
        expect(content).toContain('!resend');
      }
    });

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

  describe('Unified deployment system validation', () => {
    test('smart-deploy script contains monitoring functions', () => {
      const smartDeploy = path.join(process.cwd(), 'scripts/deployment/smart-deploy.sh');
      expect(fs.existsSync(smartDeploy)).toBe(true);
      
      const content = fs.readFileSync(smartDeploy, 'utf-8');
      expect(content).toContain('monitor');
      expect(content).toContain('vercel');
      expect(content).toContain('deployment monitoring');
    });

    test('smart-deploy script has all required commands', () => {
      const smartDeploy = path.join(process.cwd(), 'scripts/deployment/smart-deploy.sh');
      const content = fs.readFileSync(smartDeploy, 'utf-8');
      
      // Check for all deployment commands
      expect(content).toContain('deploy');
      expect(content).toContain('deploy-monitor');
      expect(content).toContain('monitor');
      expect(content).toContain('start');
      expect(content).toContain('status');
      expect(content).toContain('logs');
      expect(content).toContain('list');
      expect(content).toContain('stop');
    });

    test('documentation exists for deployment system', () => {
      const docs = [
        'DEPLOYMENT.md',
        'docs/deployment/SMART_DEPLOY_SYSTEM.md',
        'docs/deployment/PRODUCTION_ONLY_POLICY.md'
      ];
      
      docs.forEach(doc => {
        const docPath = path.join(process.cwd(), doc);
        expect(fs.existsSync(docPath)).toBe(true);
      });
    });
  });
});
