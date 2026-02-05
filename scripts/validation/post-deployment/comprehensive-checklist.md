# Post-Deployment Comprehensive Validation Checklist

**Purpose**: Ensure all critical functionality works correctly after deployment to production.

## 🔍 Automated Validation (Run via npm)

### Pre-Deployment Checks (Should already pass)
- [x] `npm run validate:content` - All content validation
- [x] `npm run validate:naming:semantic` - Naming conventions
- [x] `npm run validate:types` - Type imports from @/types
- [x] `npm run verify:sitemap:links` - Sitemap validation
- [x] `npm run test:ci` - All tests pass

### Post-Deployment Checks (Run after production deploy)
```bash
# Quick validation (5 minutes)
npm run validate:production:simple

# Full validation (15-20 minutes)
npm run validate:production:comprehensive

# With performance & accessibility (30+ minutes)
npm run validate:production:comprehensive --skip-external=false
```

## 🌐 Core Infrastructure Tests

### 1. Site Accessibility
- [ ] Homepage loads (https://www.z-beam.com)
- [ ] Returns 200 status code
- [ ] Loads within 3 seconds
- [ ] No console errors
- [ ] SSL certificate valid

### 2. Critical Pages Load
- [ ] `/materials/aluminum-laser-cleaning`
- [ ] `/materials/steel-laser-cleaning`
- [ ] `/materials/copper-laser-cleaning`
- [ ] `/datasets` (materials database)
- [ ] `/services`
- [ ] `/about`
- [ ] `/contact`

### 3. Navigation & Routing
- [ ] Internal links work (no 404s)
- [ ] Category pages render (`/materials?category=metals`)
- [ ] Search functionality works
- [ ] Breadcrumbs render correctly
- [ ] Back button works (no broken history)

## 📊 Content Validation

### 4. Frontmatter Data Integrity
- [ ] All 153 materials have complete metadata
- [ ] `pageTitle` field present (camelCase)
- [ ] `pageDescription` field present (camelCase)
- [ ] `pageDescription` field present (camelCase)
- [ ] Author data present
- [ ] Images load correctly

### 5. Material Pages Render Correctly
- [ ] Hero images display
- [ ] Machine settings table renders
- [ ] Properties display correctly
- [ ] Micro content (before/after) renders
- [ ] FAQ sections display
- [ ] Related materials show

### 6. Dataset Functionality
- [ ] CSV downloads work (materials/*.csv)
- [ ] JSON files accessible (materials/*.json)
- [ ] TXT files accessible (materials/*.txt)
- [ ] Dataset Schema.org JSON-LD validates
- [ ] All 153 materials included in exports

## 🎨 SEO & Metadata

### 7. Meta Tags
- [ ] Title tags present on all pages
- [ ] Meta descriptions present (150-160 chars)
- [ ] Open Graph tags present (og:title, og:description, og:image)
- [ ] Twitter Card tags present
- [ ] Canonical URLs correct
- [ ] No duplicate titles across pages

### 8. Schema.org JSON-LD
- [ ] Material pages have TechArticle schema
- [ ] Dataset page has Dataset schema
- [ ] Author schemas valid
- [ ] Organization schema present
- [ ] BreadcrumbList schema present
- [ ] All schemas pass Google validator

### 9. Sitemap & SEO
- [ ] `/sitemap.xml` accessible
- [ ] Contains all 153 material pages
- [ ] Static routes included (6 pages)
- [ ] Category pages included (10 categories)
- [ ] Valid XML format
- [ ] `robots.txt` accessible and correct
- [ ] No `noindex` on production pages

## 🖼️ Images & Assets

### 10. Image Loading
- [ ] Hero images load (153 materials)
- [ ] Micro images load (153 materials)
- [ ] Alt text present on all images
- [ ] Image dimensions specified
- [ ] Lazy loading works
- [ ] WebP format used where supported

### 11. Image Sitemap
- [ ] `/image-sitemap.xml` accessible
- [ ] Contains all material images
- [ ] Image URLs valid
- [ ] Image captions present
- [ ] License info included

## ⚡ Performance

### 12. Core Web Vitals
- [ ] LCP < 2.5s (Largest Contentful Paint)
- [ ] FID < 100ms (First Input Delay)
- [ ] CLS < 0.1 (Cumulative Layout Shift)
- [ ] TTFB < 600ms (Time to First Byte)
- [ ] FCP < 1.8s (First Contentful Paint)

### 13. Page Speed
- [ ] Mobile score > 90 (PageSpeed Insights)
- [ ] Desktop score > 95 (PageSpeed Insights)
- [ ] Time to Interactive < 3.8s
- [ ] Total Blocking Time < 200ms

### 14. Resource Optimization
- [ ] CSS minified
- [ ] JavaScript minified
- [ ] Images optimized
- [ ] Fonts optimized (preload critical fonts)
- [ ] No render-blocking resources

## ♿ Accessibility

### 15. WCAG 2.2 Level AA Compliance
- [ ] Color contrast ratios meet standards
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Screen reader compatibility
- [ ] ARIA labels present
- [ ] Form labels associated correctly

### 16. Semantic HTML
- [ ] Heading hierarchy correct (h1 → h6)
- [ ] Landmark regions defined (header, nav, main, footer)
- [ ] Skip links present
- [ ] Language attribute set
- [ ] Valid HTML5

## 🔒 Security

### 17. Security Headers
- [ ] HTTPS enforced (no mixed content)
- [ ] HSTS header present
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY or SAMEORIGIN
- [ ] Referrer-Policy set
- [ ] CSP header configured

### 18. External Resources
- [ ] All external scripts use SRI (Subresource Integrity)
- [ ] No vulnerable dependencies
- [ ] No exposed API keys in client code
- [ ] Environment variables secure

## 🧪 Functionality Tests

### 19. Forms
- [ ] Contact form submits successfully
- [ ] Validation errors display correctly
- [ ] Success messages show
- [ ] Form data logged (Nodemailer removed, logging only)

### 20. Search
- [ ] Search bar accessible
- [ ] Search returns results
- [ ] Filtering works
- [ ] No search functionality breaks

### 21. Dynamic Content
- [ ] Material data loads from YAML
- [ ] Property calculations correct
- [ ] Range displays accurate
- [ ] Machine settings accurate

## 📱 Responsive Design

### 22. Mobile Responsiveness
- [ ] Mobile menu works
- [ ] Touch targets adequate size (44px min)
- [ ] Text readable without zoom
- [ ] No horizontal scrolling
- [ ] Images scale correctly

### 23. Tablet & Desktop
- [ ] Layout adapts to screen sizes
- [ ] Navigation accessible at all breakpoints
- [ ] Content readable on all devices

## 🔄 Build Validation

### 24. Build Process
- [ ] `npm run build` succeeds locally
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] All tests pass
- [ ] No console warnings

### 25. Vercel Deployment
- [ ] Build succeeded on Vercel
- [ ] No build warnings
- [ ] Environment variables set correctly
- [ ] Deployment URL matches production
- [ ] Previous deployments available (rollback possible)

## 📈 Analytics & Monitoring

### 26. Error Tracking
- [ ] No JavaScript errors in console
- [ ] No 404 errors in Network tab
- [ ] No failed API requests
- [ ] No CORS errors

### 27. Monitoring (Optional - if configured)
- [ ] Error tracking active (e.g., Sentry)
- [ ] Analytics tracking (e.g., Google Analytics)
- [ ] Performance monitoring
- [ ] Uptime monitoring

## ✅ Quick Smoke Test Checklist

**Run these manually after every deployment (2-3 minutes):**

1. **Homepage**: Visit https://www.z-beam.com - loads in < 3s
2. **Material Page**: Visit `/materials/aluminum-laser-cleaning` - renders correctly
3. **Navigation**: Click "Materials" dropdown - shows categories
4. **Search**: Use search bar - returns results
5. **Images**: Check hero image loads - no broken images
6. **Console**: Open DevTools - no errors
7. **Mobile**: Resize to mobile - layout adapts
8. **Forms**: Test contact form - submits successfully

## 🚨 Critical Failure Indicators

**Immediate rollback required if:**
- Homepage returns 500 error
- Multiple pages return 404
- JavaScript console has critical errors
- Images don't load (missing CDN)
- Forms don't submit
- Core Web Vitals drop >50%
- SEO metadata missing
- Sitemap returns 404

## 📝 Documentation

**After successful validation:**
- [ ] Update CHANGELOG.md with deployment notes
- [ ] Document any issues found and resolved
- [ ] Update BACKEND_FRONTMATTER_REQUIREMENTS if schema changed
- [ ] Update docs/ if validation process changed

## 🛠️ Automated Scripts

### Run All Post-Deployment Checks
```bash
# Comprehensive validation (includes performance & accessibility)
npm run validate:production:comprehensive

# Skip external API calls (faster, for quick checks)
npm run validate:production:comprehensive -- --skip-external

# Simple validation (core checks only)
npm run validate:production:simple

# Output to JSON file
npm run validate:production:comprehensive -- --report=json --output=validation-report.json
```

### Individual Validation Scripts
```bash
npm run validate:seo-infrastructure  # SEO, meta tags, schemas
npm run validate:performance         # Core Web Vitals
npm run validate:a11y               # WCAG 2.2 compliance
npm run validate:urls               # All URLs accessible
```

## 📊 Success Criteria

**Deployment is successful when:**
- ✅ All automated tests pass (100%)
- ✅ Manual smoke test passes (8/8 checks)
- ✅ No critical errors in console
- ✅ Core Web Vitals meet thresholds (LCP < 2.5s, CLS < 0.1)
- ✅ SEO score > 95% (Schema.org, meta tags, sitemap)
- ✅ Accessibility score > 95% (WCAG 2.2 Level AA)
- ✅ All 153 material pages accessible
- ✅ No 404 errors on critical pages

## 🔄 Rollback Procedure

**If validation fails:**
1. Check Vercel deployment logs for specific errors
2. Identify failing tests/checks
3. If critical failure: `vercel rollback` to previous deployment
4. If minor issue: Create hotfix branch and redeploy
5. Re-run validation after fix

## 📞 Contact

**For deployment issues:**
- Check: `/docs/02-features/deployment/VALIDATION_GUIDE.md`
- Review: `tests/deployment/pre-deployment-validation.test.js`
- Logs: `npm run logs` (Vercel logs)
