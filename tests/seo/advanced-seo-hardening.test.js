const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '../..');

describe('Advanced SEO hardening integration', () => {
  test('postdeploy orchestrator includes advanced SEO hardening category and checks', () => {
    const orchestratorPath = path.join(repoRoot, 'scripts/validation/post-deployment/run-all-validations.js');
    const orchestrator = fs.readFileSync(orchestratorPath, 'utf8');

    expect(orchestrator).toContain("'7. Advanced SEO Hardening'");
    expect(orchestrator).toContain('generate-delta-sitemap.js');
    expect(orchestrator).toContain('validate-crawl-budget-policy.js');
    expect(orchestrator).toContain('analyze-canonical-graph.js');
    expect(orchestrator).toContain('validate-entity-graph-consistency.js');
    expect(orchestrator).toContain('detect-soft404-orphans.js');
    expect(orchestrator).toContain('analyze-bot-logs.js');
    expect(orchestrator).toContain('monitor-serp-trends.js');
  });

  test('package scripts expose esoteric SEO validation entry points', () => {
    const packagePath = path.join(repoRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    expect(packageJson.scripts).toHaveProperty('validate:seo:esoteric');
    expect(packageJson.scripts).toHaveProperty('seo:entity-graph');
    expect(packageJson.scripts).toHaveProperty('seo:delta-sitemap');
    expect(packageJson.scripts).toHaveProperty('seo:crawl-budget');
  });
});

describe('Entity graph advisory/strict behavior', () => {
  const entityGraphPath = path.join(repoRoot, 'scripts/seo/advanced/validate-entity-graph-consistency.js');

  test('countBlockingFindings returns combined finding count', () => {
    const { countBlockingFindings } = require(entityGraphPath);

    const count = countBlockingFindings({
      parseErrors: [{ error: 'bad json' }],
      invalidIds: [{ id: 'bad-id' }],
      invalidSameAs: [{ sameAs: 'http://example.com' }],
      conflictingIds: [{ id: '#thing' }],
    });

    expect(count).toBe(4);
  });

  test('getOutcome fails only in strict mode when findings exist', () => {
    const { getOutcome } = require(entityGraphPath);

    const strict = getOutcome({ strictMode: true, blockingFindingCount: 2 });
    const advisory = getOutcome({ strictMode: false, blockingFindingCount: 2 });
    const clean = getOutcome({ strictMode: true, blockingFindingCount: 0 });

    expect(strict.shouldFail).toBe(true);
    expect(strict.message).toContain('Strict mode enabled');

    expect(advisory.shouldFail).toBe(false);
    expect(advisory.message).toContain('advisory mode');

    expect(clean.shouldFail).toBe(false);
    expect(clean.message).toContain('passed');
  });
});
