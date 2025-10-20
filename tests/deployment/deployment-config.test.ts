/**
 * Deployment Configuration Tests
 * Ensures production-only deployment policy is enforced
 */

import fs from 'fs';
import path from 'path';

describe('Deployment Configuration', () => {
  let vercelConfig: any;
  
  beforeAll(() => {
    const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
    const configContent = fs.readFileSync(vercelConfigPath, 'utf-8');
    vercelConfig = JSON.parse(configContent);
  });

  describe('Production-Only Policy', () => {
    test('vercel.json exists', () => {
      const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
      expect(fs.existsSync(vercelConfigPath)).toBe(true);
    });

    test('ignoreCommand uses VERCEL_ENV for production-only deployments', () => {
      expect(vercelConfig.ignoreCommand).toBeDefined();
      expect(vercelConfig.ignoreCommand).toContain('VERCEL_ENV');
      expect(vercelConfig.ignoreCommand).toContain('production');
    });

    test('ignoreCommand prevents non-production deployments', () => {
      const ignoreCmd = vercelConfig.ignoreCommand;
      // Should exit 1 (fail) if not production
      expect(ignoreCmd).toMatch(/exit 1/);
      // Should exit 0 (success) if production
      expect(ignoreCmd).toMatch(/exit 0/);
    });

    test('only main branch is enabled for deployment', () => {
      expect(vercelConfig.git?.deploymentEnabled?.main).toBe(true);
      
      // Verify no other branches are enabled
      const enabledBranches = Object.keys(vercelConfig.git?.deploymentEnabled || {});
      expect(enabledBranches).toEqual(['main']);
    });

    test('auto job cancelation is disabled', () => {
      expect(vercelConfig.github?.autoJobCancelation).toBe(false);
    });

    test('github integration is enabled', () => {
      expect(vercelConfig.github?.enabled).toBe(true);
    });

    test('autoAlias is disabled for explicit control', () => {
      expect(vercelConfig.github?.autoAlias).toBe(false);
    });
  });

  describe('Build Configuration', () => {
    test('buildCommand is defined', () => {
      expect(vercelConfig.buildCommand).toBeDefined();
      expect(vercelConfig.buildCommand).toBe('next build');
    });

    test('framework is set to nextjs', () => {
      expect(vercelConfig.framework).toBe('nextjs');
    });

    test('outputDirectory is configured', () => {
      expect(vercelConfig.outputDirectory).toBeDefined();
      expect(vercelConfig.outputDirectory).toBe('.next');
    });
  });

  describe('Region Configuration', () => {
    test('deployment region is specified', () => {
      expect(vercelConfig.regions).toBeDefined();
      expect(Array.isArray(vercelConfig.regions)).toBe(true);
      expect(vercelConfig.regions.length).toBeGreaterThan(0);
    });

    test('region is set to cle1', () => {
      expect(vercelConfig.regions).toContain('cle1');
    });
  });

  describe('Environment Configuration', () => {
    test('NODE_ENV is set to production', () => {
      // Check both possible locations for env vars
      const hasEnv = vercelConfig.env?.NODE_ENV === 'production' ||
                     vercelConfig.build?.env?.NODE_ENV === 'production';
      expect(hasEnv).toBe(true);
    });

    test('NEXT_TELEMETRY_DISABLED is set', () => {
      const hasTelemetryDisabled = 
        vercelConfig.env?.NEXT_TELEMETRY_DISABLED === '1' ||
        vercelConfig.build?.env?.NEXT_TELEMETRY_DISABLED === '1';
      expect(hasTelemetryDisabled).toBe(true);
    });
  });

  describe('Security Headers', () => {
    test('security headers are configured', () => {
      expect(vercelConfig.headers).toBeDefined();
      expect(Array.isArray(vercelConfig.headers)).toBe(true);
    });

    test('X-Content-Type-Options header is set', () => {
      const hasHeader = vercelConfig.headers?.some((h: any) => 
        h.headers?.some((header: any) => 
          header.key === 'X-Content-Type-Options' && 
          header.value === 'nosniff'
        )
      );
      expect(hasHeader).toBe(true);
    });

    test('X-Frame-Options header is set', () => {
      const hasHeader = vercelConfig.headers?.some((h: any) => 
        h.headers?.some((header: any) => 
          header.key === 'X-Frame-Options' && 
          header.value === 'DENY'
        )
      );
      expect(hasHeader).toBe(true);
    });
  });

  describe('Sitemap Configuration', () => {
    test('sitemap rewrite is configured', () => {
      expect(vercelConfig.rewrites).toBeDefined();
      const sitemapRewrite = vercelConfig.rewrites?.find(
        (r: any) => r.source === '/sitemap.xml'
      );
      expect(sitemapRewrite).toBeDefined();
      expect(sitemapRewrite?.destination).toBe('/api/sitemap');
    });
  });

  describe('Project Scope', () => {
    test('project scope is set', () => {
      expect(vercelConfig.scope).toBeDefined();
      expect(vercelConfig.scope).toBe('air2airs-projects');
    });
  });
});

describe('Deployment Documentation', () => {
  test('production-only policy documentation exists', () => {
    const docPath = path.join(
      process.cwd(), 
      'docs/deployment/PRODUCTION_ONLY_POLICY.md'
    );
    expect(fs.existsSync(docPath)).toBe(true);
  });

  test('deployment guide exists', () => {
    const docPath = path.join(
      process.cwd(), 
      'docs/deployment/DEPLOYMENT_GUIDE.md'
    );
    expect(fs.existsSync(docPath)).toBe(true);
  });

  test('production-only policy documentation is comprehensive', () => {
    const docPath = path.join(
      process.cwd(), 
      'docs/deployment/PRODUCTION_ONLY_POLICY.md'
    );
    const content = fs.readFileSync(docPath, 'utf-8');
    
    // Check for key sections
    expect(content).toContain('Production-Only Deployment Policy');
    expect(content).toContain('VERCEL_ENV');
    expect(content).toContain('ignoreCommand');
    expect(content).toContain('Troubleshooting');
    expect(content).toContain('Preview Deployments');
  });
});

describe('Deployment Scripts', () => {
  test('production deployment script exists', () => {
    const scriptPath = path.join(
      process.cwd(), 
      'scripts/deployment/prod-deploy.sh'
    );
    expect(fs.existsSync(scriptPath)).toBe(true);
  });

  test('production deployment script is executable', () => {
    const scriptPath = path.join(
      process.cwd(), 
      'scripts/deployment/prod-deploy.sh'
    );
    const stats = fs.statSync(scriptPath);
    const isExecutable = !!(stats.mode & fs.constants.S_IXUSR);
    expect(isExecutable).toBe(true);
  });

  test('package.json has deploy:prod script', () => {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    
    expect(packageJson.scripts?.['deploy:prod']).toBeDefined();
    expect(packageJson.scripts['deploy:prod']).toContain('prod-deploy.sh');
  });
});

describe('Environment Variables', () => {
  test('.vercel/project.json exists', () => {
    const projectJsonPath = path.join(process.cwd(), '.vercel/project.json');
    expect(fs.existsSync(projectJsonPath)).toBe(true);
  });

  test('.vercel/project.json has correct project configuration', () => {
    const projectJsonPath = path.join(process.cwd(), '.vercel/project.json');
    const projectJson = JSON.parse(fs.readFileSync(projectJsonPath, 'utf-8'));
    
    expect(projectJson.projectId).toBeDefined();
    expect(projectJson.orgId).toBeDefined();
    expect(projectJson.projectName).toBe('z-beam');
  });
});

describe('Deployment Prevention', () => {
  let vercelConfig: any;
  
  beforeAll(() => {
    const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
    const configContent = fs.readFileSync(vercelConfigPath, 'utf-8');
    vercelConfig = JSON.parse(configContent);
  });

  test('no preview deployment configuration exists', () => {
    // Ensure there are no preview-specific configurations
    expect(vercelConfig.git?.deploymentEnabled?.preview).toBeUndefined();
    expect(vercelConfig.git?.deploymentEnabled?.develop).toBeUndefined();
    expect(vercelConfig.git?.deploymentEnabled?.staging).toBeUndefined();
  });

  test('trailingSlash is configured', () => {
    expect(vercelConfig.trailingSlash).toBeDefined();
    expect(vercelConfig.trailingSlash).toBe(false);
  });

  test('cleanUrls is enabled', () => {
    expect(vercelConfig.cleanUrls).toBe(true);
  });
});
