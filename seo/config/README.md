# SEO Configuration Files

This directory contains all SEO-related configuration files for the Z-Beam website.

## Files

### sitemap-config.json
**Status**: ⚠️ Legacy documentation-only (deprecated for runtime)

**Purpose**: Historical reference for prior SEO configuration patterns.

**Canonical runtime sitemap sources**:
- `app/sitemap.xml/route.ts` (main sitemap runtime generator)
- `seo/scripts/generate-image-sitemap.js` (image sitemap generator)
- `seo/scripts/generate-sitemap-index.js` (sitemap index generator)
- `app/robots.ts` (canonical robots sitemap directive)

**Key Sections**:
- `sitemaps`: Image sitemap configuration (scan paths, exclusions, templates)
- `robots`: robots.txt directives and sitemap references
- `pageSpeed`: Performance targets and Core Web Vitals thresholds
- `schema`: WebSite and ImageObject schema defaults
- `altText`: Alt text generation rules and forbidden values
- `monitoring`: Alert thresholds and monitoring frequency
- `deployment`: Pre/post-deployment checklists

**Legacy reference usage**:
```javascript
const config = require('./sitemap-config.json');
const scanDirs = config.sitemaps.images.scanDirectories;
```

Do not treat this file as runtime source of truth for sitemap behavior.

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

# Test active sitemap generation pipeline
npm run generate:sitemaps
```

## Updates

When updating configuration:
1. Update runtime sitemap sources first (`app/sitemap.xml/route.ts`, `app/robots.ts`, `seo/scripts/*`)
2. Update `sitemap-config.json` only if you want to keep historical/reference docs aligned
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
