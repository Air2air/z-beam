# Sitemap Management Guide

**Last Updated:** October 20, 2025  
**Status:** ✅ Automated

---

## Overview

The sitemap is **automatically generated** and includes all pages dynamically. It requires no manual updates when adding new content.

---

## How It Works

### Dynamic Content Discovery

The sitemap (`app/sitemap.ts`) automatically:
1. ✅ Reads all files from `frontmatter/materials/`
2. ✅ Generates URLs from filenames (e.g., `aluminum-laser-cleaning.yaml` → `/aluminum`)
3. ✅ Uses file modification times for `lastModified` dates
4. ✅ Includes all static routes (home, about, services, etc.)
5. ✅ Includes all material category pages

### Current Coverage

| Route Type | Count | Priority | Change Frequency |
|------------|-------|----------|------------------|
| Home | 1 | 1.0 | daily |
| Static Pages | 6 | 0.7-0.9 | weekly-monthly |
| Material Categories | 9 | 0.7 | weekly |
| Article Pages | 120+ | 0.8 | weekly |
| **Total** | **~135+** | - | - |

---

## Adding New Content

### When You Add a New Article

**No action required!** The sitemap automatically includes it.

1. Create new file: `frontmatter/materials/titanium-laser-cleaning.yaml`
2. Deploy to production
3. Sitemap automatically includes `/titanium` with current modification date

### When You Add a New Static Page

Update `app/sitemap.ts`:

```typescript
{
  url: `${baseUrl}/new-page`,
  lastModified: new Date(),
  changeFrequency: 'weekly' as const,
  priority: 0.8,
}
```

### When You Add a New Material Category

Update the `materialCategories` array:

```typescript
const materialCategories = [
  'metal',
  'ceramic',
  // ... existing categories
  'new-category', // Add here
];
```

---

## Validation System

### Automated Tests

**Location:** `tests/sitemap/sitemap.test.ts`

**Run tests:**
```bash
npm test tests/sitemap/sitemap.test.ts
```

**Tests verify:**
- ✅ Sitemap file exists
- ✅ Dynamic article generation is implemented
- ✅ All static routes are present
- ✅ All material categories are included
- ✅ Frontmatter files follow naming convention
- ✅ Valid slugs are generated
- ✅ Proper error handling
- ✅ SEO best practices (priority, changeFrequency)
- ✅ TypeScript type safety

### Pre-commit Hook (Optional)

**Install:**
```bash
chmod +x scripts/hooks/pre-commit.sh
ln -sf ../../scripts/hooks/pre-commit.sh .git/hooks/pre-commit
```

**What it does:**
- Validates sitemap before each commit
- Checks for dynamic article generation
- Counts frontmatter files
- Runs sitemap tests
- Prevents commits if sitemap is broken

### CI/CD Verification Script

**Location:** `scripts/sitemap/verify-sitemap.sh`

**Run manually:**
```bash
chmod +x scripts/sitemap/verify-sitemap.sh
./scripts/sitemap/verify-sitemap.sh
```

**Add to CI/CD pipeline** (GitHub Actions, Vercel, etc.):
```yaml
# .github/workflows/deploy.yml
- name: Verify Sitemap
  run: |
    chmod +x scripts/sitemap/verify-sitemap.sh
    ./scripts/sitemap/verify-sitemap.sh
```

**What it checks:**
1. Sitemap file existence
2. Dynamic article generation
3. Article file count
4. Static routes presence
5. Material category routes
6. Runs automated tests
7. Provides detailed summary

---

## Monitoring & Maintenance

### Check Sitemap After Deployment

1. **View live sitemap:**
   ```
   https://z-beam.com/sitemap.xml
   ```

2. **Validate with Google:**
   - Go to [Google Search Console](https://search.google.com/search-console)
   - Submit sitemap: `https://z-beam.com/sitemap.xml`
   - Monitor indexing status

3. **Test locally:**
   ```bash
   npm run dev
   # Visit: http://localhost:3000/sitemap.xml
   ```

### Monthly Checklist

- [ ] Review sitemap in Search Console
- [ ] Check for any indexing errors
- [ ] Verify article count matches frontmatter files
- [ ] Ensure no 404s in submitted URLs
- [ ] Review coverage report

---

## Troubleshooting

### Sitemap Missing Articles

**Check:**
```bash
# Count frontmatter files
ls -1 frontmatter/materials/*.yaml | wc -l

# Run verification
./scripts/sitemap/verify-sitemap.sh
```

**Common causes:**
- Files don't end with `-laser-cleaning.yaml`
- Files are in wrong directory
- Build error (check Next.js logs)

### Sitemap Not Updating

**Solutions:**
1. Clear Next.js cache: `rm -rf .next`
2. Rebuild: `npm run build`
3. Check file permissions in `frontmatter/materials/`
4. Verify deployment completed successfully

### 404 Errors in Sitemap

**Check:**
1. Slug matches article route: `/aluminum` should have `aluminum-laser-cleaning.yaml`
2. Article page renders correctly: `http://localhost:3000/aluminum`
3. No typos in filename

---

## SEO Best Practices

### Priority Guidelines

| Page Type | Priority | Rationale |
|-----------|----------|-----------|
| Home | 1.0 | Most important page |
| Services/Rental | 0.9 | Core business pages |
| Articles | 0.8 | Main content |
| About/Contact/Partners | 0.8 | Important static pages |
| Categories | 0.7 | Navigation pages |
| Search | 0.5 | Utility page |

### Change Frequency Guidelines

| Page Type | Frequency | Rationale |
|-----------|-----------|-----------|
| Home | daily | Dynamic content/news |
| Services/Rental | weekly | Regular updates |
| Articles | weekly | Content improvements |
| Static Pages | monthly | Occasional updates |
| Search | daily | Dynamic results |

### Last Modified Dates

- **Static pages:** Use `new Date()` for current timestamp
- **Articles:** Use `stats.mtime` (file modification time)
- **Partners:** Use specific date when major updates occur

---

## Performance Considerations

### Build Time

- **~135+ pages** in sitemap
- **Build time:** < 1 second (sitemap generation is fast)
- **File size:** ~10-15KB (compressed)

### Caching

Next.js automatically caches the sitemap. To force regeneration:
```bash
# Development
rm -rf .next && npm run dev

# Production build
npm run build
```

---

## Integration with Deployment

### Vercel (Current Setup)

**Manual deployment required** (auto-deploy disabled)

**Sitemap is generated during build**:
1. Push changes to main branch
2. Deploy manually: `vercel --prod`
3. Vercel builds site
4. Sitemap generated with latest content
5. Deploy completes
6. Search engines fetch updated sitemap

### Adding Verification to Deployment

**Option 1: GitHub Actions**

Create `.github/workflows/verify.yml`:
```yaml
name: Verify Sitemap
on: [push, pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test tests/sitemap/sitemap.test.ts
      - run: ./scripts/sitemap/verify-sitemap.sh
```

**Option 2: Vercel Build Command**

Update `package.json`:
```json
{
  "scripts": {
    "build": "npm run verify:sitemap && next build",
    "verify:sitemap": "./scripts/sitemap/verify-sitemap.sh"
  }
}
```

---

## File Structure

```
z-beam/
├── app/
│   └── sitemap.ts                         # Dynamic sitemap generator
├── content/
│   └── components/
│       └── frontmatter/                   # Article source files (120+)
│           ├── aluminum-laser-cleaning.yaml
│           ├── steel-laser-cleaning.yaml
│           └── ...
├── tests/
│   └── sitemap/
│       └── sitemap.test.ts               # Automated tests
├── scripts/
│   ├── hooks/
│   │   └── pre-commit.sh                 # Git hook validator
│   └── sitemap/
│       └── verify-sitemap.sh             # CI/CD verification
└── docs/
    └── systems/
        └── SITEMAP_MANAGEMENT.md         # This file
```

---

## Quick Reference Commands

```bash
# View sitemap locally
npm run dev
# Visit: http://localhost:3000/sitemap.xml

# Run sitemap tests
npm test tests/sitemap/sitemap.test.ts

# Verify sitemap integrity
./scripts/sitemap/verify-sitemap.sh

# Count articles
ls -1 frontmatter/materials/*.yaml | wc -l

# Install pre-commit hook
chmod +x scripts/hooks/pre-commit.sh
ln -sf ../../scripts/hooks/pre-commit.sh .git/hooks/pre-commit

# Force rebuild
rm -rf .next && npm run build
```

---

## Success Metrics

**Current Status:**
- ✅ Fully automated article discovery
- ✅ Dynamic URL generation
- ✅ Automatic modification date tracking
- ✅ Comprehensive test coverage
- ✅ CI/CD verification available
- ✅ Zero manual updates required

**Next Steps:**
1. ✅ Add verification script to deployment pipeline
2. ✅ Monitor Search Console for indexing issues
3. ✅ Track organic traffic growth to article pages

---

## Support & Questions

**If sitemap seems incomplete:**
1. Run verification script: `./scripts/sitemap/verify-sitemap.sh`
2. Run tests: `npm test tests/sitemap/sitemap.test.ts`
3. Check deployment logs in Vercel
4. View live sitemap: `https://z-beam.com/sitemap.xml`

**For adding new content types:**
- Update `app/sitemap.ts` with new route patterns
- Add corresponding tests in `tests/sitemap/sitemap.test.ts`
- Update this documentation

---

**Maintained by:** Development Team  
**Review Frequency:** Quarterly or when adding new content types
