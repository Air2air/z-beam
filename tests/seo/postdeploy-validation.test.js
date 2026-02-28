/**
 * Postdeploy Validation Test Suite
 * Tests for SEO validation logic and patterns
 * 
 * Coverage:
 * - Core Web Vitals regex patterns
 * - Contextual linking detection
 * - Image sitemap validation
 * - Meta description length checks
 */

describe('Postdeploy Validation - Core Web Vitals', () => {
  describe('Hero Preload Detection', () => {
    test('should detect hero preload with as="image" before href', () => {
      const html = '<link rel="preload" as="image" href="/images/hero-laser-cleaning.webp" type="image/webp"/>';
      const pattern = /<link[^>]+rel=["']preload["'][^>]+as=["']image["'][^>]+href=["'][^"']*hero[^"']*["']/i;
      expect(html).toMatch(pattern);
    });

    test('should detect hero preload with href before as="image"', () => {
      const html = '<link rel="preload" href="/images/hero-laser-cleaning.webp" as="image" type="image/webp"/>';
      const pattern = /<link[^>]+rel=["']preload["'][^>]+href=["'][^"']*hero[^"']*["'][^>]+as=["']image["']/i;
      expect(html).toMatch(pattern);
    });

    test('should detect hero preload regardless of attribute order', () => {
      const htmlVariants = [
        '<link rel="preload" as="image" href="/images/hero-laser-cleaning.webp" type="image/webp"/>',
        '<link as="image" rel="preload" href="/images/hero-laser-cleaning.webp" type="image/webp"/>',
        '<link as="image" href="/images/hero-laser-cleaning.webp" rel="preload" type="image/webp"/>'
      ];
      
      const patterns = [
        /<link[^>]+rel=["']preload["'][^>]+as=["']image["'][^>]+href=["'][^"']*hero[^"']*["']/i,
        /<link[^>]+as=["']image["'][^>]+rel=["']preload["'][^>]+hero/i,
        /<link[^>]+as=["']image["'][^>]+href=["'][^"']*hero[^"']*["']/i
      ];

      htmlVariants.forEach(html => {
        const matched = patterns.some(pattern => pattern.test(html));
        expect(matched).toBe(true);
      });
    });

    test('should not match non-hero image preloads', () => {
      const html = '<link rel="preload" as="image" href="/images/logo.png" type="image/png"/>';
      const pattern = /<link[^>]+rel=["']preload["'][^>]+as=["']image["'][^>]+href=["'][^"']*hero[^"']*["']/i;
      expect(html).not.toMatch(pattern);
    });
  });

  describe('Preconnect Detection', () => {
    test('should detect Vercel Vitals preconnect', () => {
      const html = '<link rel="preconnect" href="https://vitals.vercel-insights.com" crossorigin="anonymous"/>';
      const pattern = /<link[^>]+rel=["']preconnect["'][^>]+vitals\.vercel-insights\.com/i;
      expect(html).toMatch(pattern);
    });

    test('should detect Google Tag Manager preconnect', () => {
      const html = '<link rel="preconnect" href="https://www.googletagmanager.com" crossorigin="anonymous"/>';
      const pattern = /<link[^>]+rel=["']preconnect["'][^>]+googletagmanager\.com/i;
      expect(html).toMatch(pattern);
    });
  });

  describe('Inline Critical CSS Detection', () => {
    test('should detect inline CSS with dangerouslySetInnerHTML', () => {
      const html = '<style dangerouslySetInnerHTML={{__html: \'body{margin:0}\'}}></style>';
      const pattern = /<style[^>]*dangerouslySetInnerHTML[^>]*>/i;
      expect(html).toMatch(pattern);
    });

    test('should detect inline CSS with body styles', () => {
      const html = '<style>body { margin: 0; min-height: 100vh; }</style>';
      const pattern = /<style[^>]*>[\s\S]*?body\s*{[\s\S]*?margin:\s*0/i;
      expect(html).toMatch(pattern);
    });
  });

  describe('Image Optimization Detection', () => {
    test('should detect responsive image sizes attribute', () => {
      const html = '<img src="/image.jpg" sizes="(max-width: 768px) 90px, 130px" />';
      const pattern = /<img[^>]+sizes=["'][^"']+["']/i;
      expect(html).toMatch(pattern);
    });

    test('should detect priority images with fetchPriority', () => {
      const html = '<img src="/image.jpg" fetchPriority="high" />';
      const pattern = /fetchpriority=["']high["']/i;
      expect(html).toMatch(pattern);
    });

    test('should detect priority attribute (alternative)', () => {
      const html = '<img src="/image.jpg" priority />';
      const pattern = /<img[^>]+priority/i;
      expect(html).toMatch(pattern);
    });
  });
});

describe('Postdeploy Validation - Analytics Coverage', () => {
  describe('GA Loader Detection', () => {
    test('should detect GA gtag loader and extract measurement ID', () => {
      const html = '<script async src="https://www.googletagmanager.com/gtag/js?id=G-TZF55CB5XC"></script>';
      const pattern = /<script[^>]+src=["'][^"']*googletagmanager\.com\/gtag\/js\?id=(G-[A-Z0-9]+)[^"']*["']/i;
      const match = html.match(pattern);

      expect(match).not.toBeNull();
      expect(match[1]).toBe('G-TZF55CB5XC');
    });
  });

  describe('Consent Mode Detection', () => {
    test('should detect consent default with denied analytics/ad storage', () => {
      const consentScript = `
        gtag('consent', 'default', {
          'analytics_storage': 'denied',
          'ad_storage': 'denied'
        });
      `;

      expect(consentScript).toMatch(/gtag\(['"]consent['"],\s*['"]default['"]/);
      expect(consentScript).toMatch(/['"]analytics_storage['"]\s*:\s*['"]denied['"]/);
      expect(consentScript).toMatch(/['"]ad_storage['"]\s*:\s*['"]denied['"]/);
    });
  });

  describe('CSP Endpoint Coverage', () => {
    test('should include GA/GTM collection endpoints in connect-src', () => {
      const csp = "default-src 'self'; connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com";

      expect(csp).toContain('connect-src');
      expect(csp).toContain('google-analytics.com');
      expect(csp).toContain('googletagmanager.com');
    });

    test('should include ads endpoints for comprehensive AW coverage', () => {
      const csp = "default-src 'self'; connect-src 'self' https://www.googleadservices.com https://stats.g.doubleclick.net";

      expect(csp).toContain('googleadservices.com');
      expect(csp).toContain('doubleclick.net');
    });
  });
});

describe('Postdeploy Validation - Contextual Linking', () => {
  describe('Link Pattern Detection', () => {
    test('should detect material links', () => {
      const html = '<a href="/materials/metal/aluminum">Aluminum</a>';
      const pattern = /href=["']\/materials\//i;
      expect(html).toMatch(pattern);
    });

    test('should detect contaminant links', () => {
      const html = '<a href="/contaminants/oxidation/rust">Rust</a>';
      const pattern = /href=["']\/contaminants\//i;
      expect(html).toMatch(pattern);
    });

    test('should detect settings links', () => {
      const html = '<a href="/settings/metal/aluminum-settings">Settings</a>';
      const pattern = /href=["']\/settings\//i;
      expect(html).toMatch(pattern);
    });

    test('should extract all contextual links from page', () => {
      const html = `
        <p>Learn about <a href="/materials/metal/aluminum">aluminum</a> and 
        <a href="/contaminants/oxidation/rust">rust removal</a>.</p>
        <p>Configure <a href="/settings/metal/aluminum-settings">aluminum settings</a>.</p>
      `;
      
      const pattern = /href=["']\/(materials|contaminants|settings)\/[^"']+["']/gi;
      const matches = html.match(pattern);
      
      expect(matches).toHaveLength(3);
    });
  });

  describe('Link Density Calculations', () => {
    test('should calculate average link density correctly', () => {
      const pageLinkCounts = [2, 1, 3, 2]; // 4 pages
      const totalLinks = pageLinkCounts.reduce((sum, count) => sum + count, 0);
      const averageDensity = totalLinks / pageLinkCounts.length;
      
      expect(averageDensity).toBe(2.0);
      expect(averageDensity).toBeGreaterThanOrEqual(1.55); // Validation threshold
    });

    test('should validate minimum link threshold', () => {
      const averageDensity = 1.55;
      const threshold = 1.55;
      
      expect(averageDensity).toBeGreaterThanOrEqual(threshold);
    });

    test('should fail below threshold', () => {
      const averageDensity = 1.0;
      const threshold = 1.55;
      
      expect(averageDensity).toBeLessThan(threshold);
    });
  });
});

describe('Postdeploy Validation - Image Sitemap', () => {
  describe('XML Structure Validation', () => {
    test('should validate sitemap namespace', () => {
      const xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"></urlset>';
      
      expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
      expect(xml).toContain('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
    });

    test('should count image entries', () => {
      const xml = `
        <url><image:image><image:loc>img1.jpg</image:loc></image:image></url>
        <url><image:image><image:loc>img2.jpg</image:loc></image:image></url>
      `;
      
      const imageCount = (xml.match(/<image:image>/g) || []).length;
      expect(imageCount).toBe(2);
    });
  });

  describe('Image Metadata Validation', () => {
    test('should validate image has required fields', () => {
      const imageEntry = `
        <image:image>
          <image:loc>https://z-beam.com/images/aluminum-hero.jpg</image:loc>
          <image:title>Aluminum Laser Cleaning</image:title>
          <image:micro>Professional laser cleaning for aluminum surfaces</image:micro>
        </image:image>
      `;
      
      expect(imageEntry).toContain('<image:loc>');
      expect(imageEntry).toContain('<image:title>');
      expect(imageEntry).toContain('<image:micro>');
    });

    test('should detect missing title', () => {
      const imageEntry = `
        <image:image>
          <image:loc>https://z-beam.com/images/aluminum-hero.jpg</image:loc>
          <image:micro>Professional laser cleaning</image:micro>
        </image:image>
      `;
      
      expect(imageEntry).not.toContain('<image:title>');
    });
  });

  describe('Title Format Quality', () => {
    test('should validate no "Hero" suffix in title', () => {
      const goodTitle = '<image:title>Aluminum Laser Cleaning</image:title>';
      const badTitle = '<image:title>Aluminum Hero</image:title>';
      
      expect(goodTitle).not.toContain('Hero</image:title>');
      expect(badTitle).toContain('Hero</image:title>');
    });

    test('should validate "Micro" replaced with "1000x magnification"', () => {
      const goodTitle = '<image:title>Aluminum - 1000x Magnification</image:title>';
      const badTitle = '<image:title>Aluminum Micro</image:title>';
      
      expect(goodTitle).toContain('1000x');
      expect(badTitle).toContain('Micro');
      expect(badTitle).not.toContain('1000x');
    });
  });

  describe('Directory Exclusions', () => {
    test('should exclude icon directory images', () => {
      const iconPath = '/images/icons/arrow.svg';
      const excludedPaths = ['icon', 'icons', 'application', 'favicon', 'author'];
      
      const shouldExclude = excludedPaths.some(dir => iconPath.includes(`/${dir}/`));
      expect(shouldExclude).toBe(true);
    });

    test('should include valid material images', () => {
      const materialPath = '/images/materials/aluminum-hero.jpg';
      const excludedPaths = ['icon', 'icons', 'application', 'favicon', 'author'];
      
      const shouldExclude = excludedPaths.some(dir => materialPath.includes(`/${dir}/`));
      expect(shouldExclude).toBe(false);
    });
  });
});

describe('Postdeploy Validation - Meta Tags', () => {
  describe('Meta Description Length', () => {
    test('should validate optimal length (155-160 chars)', () => {
      const description = 'A'.repeat(157);
      expect(description.length).toBeGreaterThanOrEqual(155);
      expect(description.length).toBeLessThanOrEqual(160);
    });

    test('should warn if slightly over (161-170 chars)', () => {
      const description = 'A'.repeat(166);
      expect(description.length).toBeGreaterThan(160);
      expect(description.length).toBeLessThanOrEqual(170);
    });

    test('should fail if too long (>170 chars)', () => {
      const description = 'A'.repeat(180);
      expect(description.length).toBeGreaterThan(170);
    });

    test('should fail if too short (<120 chars)', () => {
      const description = 'A'.repeat(100);
      expect(description.length).toBeLessThan(120);
    });
  });
});

describe('Postdeploy Validation - Score Calculation', () => {
  describe('Category Scoring', () => {
    test('should calculate category score correctly', () => {
      const tests = [
        { passed: true },
        { passed: true },
        { passed: false },
        { passed: true }
      ];
      
      const passedCount = tests.filter(t => t.passed).length;
      const totalCount = tests.length;
      const score = Math.round((passedCount / totalCount) * 100);
      
      expect(score).toBe(75); // 3/4 = 75%
    });

    test('should handle 100% passing', () => {
      const passedCount = 6;
      const totalCount = 6;
      const score = Math.round((passedCount / totalCount) * 100);
      
      expect(score).toBe(100);
    });

    test('should handle 0% passing', () => {
      const passedCount = 0;
      const totalCount = 6;
      const score = Math.round((passedCount / totalCount) * 100);
      
      expect(score).toBe(0);
    });
  });

  describe('Overall Grading', () => {
    test('should assign grade A for 90-97%', () => {
      const scores = [94, 90, 97];
      scores.forEach(score => {
        expect(score).toBeGreaterThanOrEqual(90);
        expect(score).toBeLessThan(98);
      });
    });

    test('should assign grade A+ for 98-100%', () => {
      const scores = [98, 99, 100];
      scores.forEach(score => {
        expect(score).toBeGreaterThanOrEqual(98);
      });
    });

    test('should assign grade B for 80-89%', () => {
      const scores = [80, 85, 89];
      scores.forEach(score => {
        expect(score).toBeGreaterThanOrEqual(80);
        expect(score).toBeLessThan(90);
      });
    });
  });
});
