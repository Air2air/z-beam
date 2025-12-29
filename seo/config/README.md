# SEO Configuration Files

This directory contains all SEO-related configuration files for the Z-Beam website.

## Files

### sitemap-config.json
**Purpose**: Complete configuration for sitemap generation, robots.txt, PageSpeed monitoring, schema.org, and alt text generation.

**Key Sections**:
- `sitemaps`: Image sitemap configuration (scan paths, exclusions, templates)
- `robots`: robots.txt directives and sitemap references
- `pageSpeed`: Performance targets and Core Web Vitals thresholds
- `schema`: WebSite and ImageObject schema defaults
- `altText`: Alt text generation rules and forbidden values
- `monitoring`: Alert thresholds and monitoring frequency
- `deployment`: Pre/post-deployment checklists

**Usage**:
```javascript
const config = require('./sitemap-config.json');
const scanDirs = config.sitemaps.images.scanDirectories;
```

### robots.txt (template)
**Purpose**: Template for robots.txt generation

**Location in Production**: `public/robots.txt`

**Current Configuration**:
```plaintext
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/

Sitemap: https://www.z-beam.com/sitemap-index.xml
Sitemap: https://www.z-beam.com/sitemap.xml
Sitemap: https://www.z-beam.com/image-sitemap.xml
```

## Environment Variables

SEO configuration relies on the following environment variables:

### Required
- `PAGESPEED_API_KEY`: Google PageSpeed Insights API key

### Optional
- `NEXT_PUBLIC_SITE_URL`: Base URL for sitemap generation (defaults to https://www.z-beam.com)
- `SEO_MONITORING_ENABLED`: Enable/disable automated monitoring (defaults to true)

## Configuration Best Practices

1. **Sitemap Paths**: Use relative paths from project root
2. **Exclusions**: Add temporary/cache directories to excludeDirectories
3. **Thresholds**: Set realistic targets based on current performance
4. **Alt Text**: Keep minLength at 30 for accessibility compliance
5. **Monitoring**: Enable alerts for critical metrics only

## Validation

Validate configuration before deployment:

```bash
# Validate JSON structure
node -e "console.log(JSON.parse(require('fs').readFileSync('seo/config/sitemap-config.json')))"

# Test sitemap generation with config
npm run generate:sitemaps
```

## Updates

When updating configuration:
1. Update `sitemap-config.json`
2. Update relevant scripts if needed
3. Run validation
4. Test sitemap generation
5. Document changes in this README
6. Commit with descriptive message

## Version History

- **v1.0.0** (2025-12-28): Initial configuration
  - Image sitemap configuration (684 images)
  - PageSpeed API targets
  - Alt text generation rules
  - Schema.org defaults
