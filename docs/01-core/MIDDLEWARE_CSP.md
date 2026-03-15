# Middleware Content Security Policy (CSP)

**Last Updated**: January 19, 2026  
**Status**: ✅ Active in production

---

## Overview

The Z-Beam application implements Content Security Policy (CSP) headers via Next.js middleware to protect against XSS, clickjacking, and other code injection attacks.

## File Location

`/middleware.ts`

## Architecture

### Environment-Based Configuration

The middleware implements different CSP rules for development vs production:

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
  // Permissive CSP for local development
} else {
  // Restrictive CSP for production
}
```

## Development Mode CSP

**Purpose**: Maximize developer productivity by allowing all necessary resources without configuration friction.

### Policy Details

```typescript
const csp = [
  "default-src 'self' https: http:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http:",
  "style-src 'self' 'unsafe-inline' https: http:",
  "font-src 'self' data: https: http:",
  "img-src 'self' data: blob: https: http:",
  "media-src 'self' https: http:",
  "connect-src 'self' https: http: ws: wss:",
  "frame-src 'self' https: http:",
  "form-action 'self' https: http:",
];
```

**Key Features**:
- ✅ Allows all HTTPS/HTTP sources
- ✅ Permits WebSocket connections (ws:, wss:)
- ✅ Enables inline scripts/styles
- ✅ Allows eval() for dev tools
- ✅ No CSP blocking during development

## Production Mode CSP

**Purpose**: Enforce strict security policies while allowing only trusted third-party integrations.

### Core Directives

#### default-src
```typescript
"default-src 'self'"
```
Fallback for all other directives.

#### script-src
```typescript
"script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://vercel.live https://www.googletagmanager.com"
```
- `'unsafe-inline'`: Required for Next.js inline scripts
- Vercel domains: Analytics and preview mode

#### style-src
```typescript
"style-src 'self' 'unsafe-inline'"
```
- `'unsafe-inline'`: Required for Tailwind CSS and dynamic styles

#### font-src
```typescript
"font-src 'self' data:"
```
- `data:`: For base64-encoded fonts

#### img-src
```typescript
"img-src 'self' data: blob: https: https://img.youtube.com https://i.ytimg.com"
```
- `data:`: For base64 images
- `blob:`: For dynamically generated images

#### connect-src
```typescript
"connect-src 'self' https://vercel.live https://vitals.vercel-insights.com https://va.vercel-scripts.com https://www.google-analytics.com https://www.googletagmanager.com https://www.googleadservices.com https://stats.g.doubleclick.net"
```
- Vercel analytics and preview mode
- Google analytics and ad conversion endpoints

#### frame-src
```typescript
"frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com"
```
**Critical**: Must include any third-party iframe origins the live site actually embeds.

#### form-action
```typescript
"form-action 'self'"
```
Limits form submissions to first-party endpoints.

## Third-Party Integrations

### Vercel Analytics

**Domains**:
- `https://va.vercel-scripts.com` - Analytics script
- `https://*.vercel-insights.com` - Data collection

**Required Directives**:
- `script-src`: For analytics tracking
- `connect-src`: For data transmission

### Google Fonts

**Domains**:
- `https://fonts.googleapis.com` - Font CSS
- `https://fonts.gstatic.com` - Font files

**Required Directives**:
- `style-src`: For font stylesheets
- `font-src`: For font file downloads

## Additional Security Headers

The middleware also sets complementary security headers:

```typescript
// Prevent clickjacking
response.headers.set('X-Frame-Options', 'SAMEORIGIN');

// XSS protection
response.headers.set('X-Content-Type-Options', 'nosniff');

// HTTPS enforcement (production only)
if (!isDevelopment) {
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
}

// Cross-Origin policies
response.headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
response.headers.set('Cross-Origin-Resource-Policy', 'cross-origin');

// Referrer policy
response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

// Permissions policy
response.headers.set(
  'Permissions-Policy',
  'camera=(), microphone=(), geolocation=()'
);
```

## Nonce Generation (Future)

The middleware includes nonce generation infrastructure for future use:

```typescript
const nonce = crypto.randomUUID();
```

This can be used to replace `'unsafe-inline'` with nonce-based inline script/style approval.

## Route Exclusions

The middleware matcher excludes certain paths:

```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

**Excluded**:
- Static files (`_next/static/`)
- Image optimization (`_next/image/`)
- Favicon
- All image assets (svg, png, jpg, etc.)

## Troubleshooting

### CSP Violation Errors

**Symptoms**:
```
Refused to load the script 'https://example.com/script.js' because it violates the following Content Security Policy directive: "script-src 'self' ..."
```

**Solutions**:
1. **Check browser console** (F12) for full CSP violation report
2. **Identify blocked domain** from error message
3. **Add domain to appropriate CSP directive** in middleware.ts
4. **Restart dev server** to apply changes
5. **Hard refresh browser** (Cmd+Shift+R) to clear cached headers

### Iframe Not Loading

**Common Causes**:
- Missing domain in `frame-src` directive
- Browser caching old CSP headers
- Ad blocker or privacy extension interference

**Fix**:
1. Add iframe domain to `frame-src`
2. Also add to `script-src`, `style-src`, `connect-src`
3. Test in incognito mode to bypass extensions

### Browser Caching CSP Headers

**Problem**: Changes to middleware.ts don't take effect immediately

**Solutions**:
- **Hard refresh**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- **Clear cache**: Browser settings → Clear browsing data
- **Incognito mode**: Test without cached headers
- **Disable cache**: DevTools Network tab → "Disable cache" checkbox

## Testing CSP Configuration

### Local Testing

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Check headers in browser:
   - Open DevTools → Network tab
   - Reload page
   - Click on document request
   - View Response Headers → `content-security-policy`

3. Look for violations:
   - DevTools → Console tab
   - Filter by "CSP" or "security"

### Production Testing

1. Deploy to production
2. Use browser or online CSP checker
3. Review `Content-Security-Policy` header
4. Test all third-party integrations (forms, analytics, fonts)

## Adding New Third-Party Services

When integrating a new external service:

1. **Identify required domains** from service documentation
2. **Test in development** (permissive CSP should allow it)
3. **Update production CSP** with specific domains:
   ```typescript
   // Example: Adding new analytics service
   "script-src": "... https://analytics.example.com",
   "connect-src": "... https://analytics.example.com",
   ```
4. **Test in incognito mode** to bypass cache
5. **Document in this file** under Third-Party Integrations

## Best Practices

### DO ✅
- Add only necessary domains to production CSP
- Use specific domains over wildcards when possible
- Document reason for each CSP directive
- Test CSP changes in production-like environment
- Monitor CSP violation reports in production

### DON'T ❌
- Don't use `'unsafe-inline'` for scripts unless absolutely necessary
- Don't use wildcards (`*`) in production CSP
- Don't rely solely on development testing
- Don't forget to update CSP when adding third-party services
- Don't ignore CSP violation warnings in console

## Security Considerations

### Risk Assessment

**Low Risk** (Development):
- Permissive CSP allows rapid iteration
- Only accessible on localhost

**High Risk** (Production):
- Public-facing application
- Must restrict to trusted domains
- Balance security with functionality

### Attack Vectors Mitigated

- ✅ **XSS (Cross-Site Scripting)**: Restricts inline script execution
- ✅ **Clickjacking**: X-Frame-Options prevents embedding
- ✅ **MIME sniffing attacks**: X-Content-Type-Options enforces strict types
- ✅ **Man-in-the-middle**: HSTS enforces HTTPS
- ✅ **Data injection**: form-action restricts form submissions

## Performance Impact

- **Minimal**: CSP headers add <1KB to each response
- **Browser caching**: CSP applied once, cached with response
- **No runtime overhead**: Security enforcement by browser

## Related Documentation

- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [MDN CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Content Security Policy (CSP) Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)

## Maintenance

### Regular Reviews
- **Quarterly**: Review CSP directives for unused domains
- **After new integrations**: Update CSP and test thoroughly
- **Security updates**: Monitor for new CSP best practices

### Change Log
- **2026-01-19**: Added Workiz sendajob.com domains for contact form
- **2026-01-19**: Separated development/production CSP configurations
- **2026-01-19**: Made development CSP fully permissive

## Support

For CSP-related issues, contact:
- **Development**: Review this documentation and test locally
- **Production**: Monitor Vercel logs for CSP violations
- **Emergency**: Temporarily use development CSP mode to debug (not recommended for production)
