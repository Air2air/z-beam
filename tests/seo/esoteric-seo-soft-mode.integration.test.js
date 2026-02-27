const { execSync } = require('child_process');

describe('Esoteric SEO soft mode integration', () => {
  jest.setTimeout(300000);

  test('runs validate:seo:esoteric:soft without blocking', () => {
    const output = execSync('npm run validate:seo:esoteric:soft', {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: {
        ...process.env,
        STRICT_MODE: '0',
        MAX_URLS: '120',
      },
    });

    expect(output).toContain('seo:delta-sitemap');
    expect(output).toContain('seo:crawl-budget');
    expect(output).toContain('seo:canonical-graph');
    expect(output).toContain('seo:entity-graph');
    expect(output).toContain('seo:soft404-orphans');
  });
});
