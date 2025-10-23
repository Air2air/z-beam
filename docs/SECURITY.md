# Security Implementation Guide

## Content Security Policy (CSP) - XSS Protection

### Overview
We use **CSP with nonces** to prevent Cross-Site Scripting (XSS) attacks while allowing legitimate inline scripts (JSON-LD schemas).

### How It Works

#### 1. **Middleware (`middleware.ts`)**
- Generates a unique cryptographic nonce for each request
- Sets CSP header with nonce value
- Passes nonce to components via headers

#### 2. **Layout (`app/layout.tsx`)**
- Retrieves nonce from request headers
- Applies nonce to inline `<script>` tags
- Only scripts with matching nonce can execute

#### 3. **Nonce Utility (`app/utils/csp.ts`)**
- Helper functions for nonce generation
- CSP policy builder
- Documentation of directives

### CSP Directives Explained

```
✅ SECURE (What we use):
├─ 'self'              → Only load from same origin
├─ 'nonce-xxx'         → Only inline scripts with matching nonce
├─ 'strict-dynamic'    → Trust scripts loaded by nonce scripts
└─ Specific domains    → Whitelisted external sources only

⚠️ REMOVED (Previously vulnerable):
├─ 'unsafe-inline'     → Would allow ANY inline script (XSS risk)
├─ 'unsafe-eval'       → Would allow eval(), Function() (XSS risk)
└─ https:              → Would allow ANY HTTPS source (too broad)
```

### Current CSP Policy

```
default-src 'self'
  → Default: only same origin

script-src 'self' 'nonce-RANDOM' 'strict-dynamic' https://vercel.live https://va.vercel-scripts.com
  → Scripts: same origin, nonce-approved inline scripts, Vercel analytics

style-src 'self' 'unsafe-inline'
  → Styles: same origin, inline styles (required for Tailwind CSS)

font-src 'self' data:
  → Fonts: same origin, data URIs

img-src 'self' data: blob: https://img.youtube.com https://i.ytimg.com
  → Images: same origin, data URIs, blobs, YouTube thumbnails only

media-src 'self' data: blob:
  → Media: same origin, data URIs, blobs

connect-src 'self' https://vercel.live https://vitals.vercel-insights.com https://va.vercel-scripts.com
  → AJAX: same origin, Vercel analytics endpoints

frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com
  → Iframes: same origin, YouTube embeds only

frame-ancestors 'none'
  → Cannot be embedded in iframes (clickjacking protection)

form-action 'self'
  → Forms: only submit to same origin

base-uri 'self'
  → Base tag: only same origin

object-src 'none'
  → No plugins (Flash, Java, etc.)

upgrade-insecure-requests
  → Upgrade HTTP to HTTPS automatically
```

### Adding New Inline Scripts

If you need to add a new inline script:

1. **Server Components** (preferred):
```tsx
import { getNonce } from '@/app/utils/csp';

export default async function MyComponent() {
  const nonce = await getNonce();
  
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

2. **Client Components**:
Pass nonce as prop from parent server component:
```tsx
// Parent (server component)
export default async function Page() {
  const nonce = await getNonce();
  return <ClientComponent nonce={nonce} />;
}

// Child (client component)
'use client';
export function ClientComponent({ nonce }: { nonce?: string }) {
  return <script nonce={nonce} {...} />;
}
```

### Testing CSP

#### 1. **Browser DevTools**
- Open Console
- Look for CSP violations: `Refused to execute inline script because it violates CSP`
- All violations should be from external sources, not your code

#### 2. **CSP Evaluator**
Test your CSP: https://csp-evaluator.withgoogle.com/

#### 3. **Security Headers**
Check headers: https://securityheaders.com/

Expected score: **A+**

### Additional Security Headers

#### **X-Frame-Options: DENY**
- Prevents clickjacking attacks
- Site cannot be embedded in iframes

#### **X-Content-Type-Options: nosniff**
- Prevents MIME-type sniffing
- Forces browser to respect declared content type

#### **Strict-Transport-Security (HSTS)**
- Forces HTTPS for all requests
- `max-age=31536000`: 1 year
- `includeSubDomains`: All subdomains
- `preload`: Submit to HSTS preload list

#### **Referrer-Policy: strict-origin-when-cross-origin**
- Sends full URL for same-origin requests
- Sends only origin for cross-origin requests
- Privacy protection

#### **X-XSS-Protection: 1; mode=block**
- Legacy XSS filter (older browsers)
- Blocks page if XSS detected

#### **Permissions-Policy**
- Disables unnecessary browser features
- Reduces attack surface
- Blocks: camera, microphone, geolocation, payment, USB

## XSS Attack Prevention

### What We're Protected Against

#### 1. **Inline Script Injection**
❌ Attacker tries: `<script>alert('XSS')</script>`
✅ Blocked: No nonce, CSP blocks execution

#### 2. **Event Handler Injection**
❌ Attacker tries: `<img src=x onerror="alert('XSS')">`
✅ Blocked: Inline handlers blocked by CSP

#### 3. **eval() Injection**
❌ Attacker tries: `eval(userInput)`
✅ Blocked: `'unsafe-eval'` removed from CSP

#### 4. **External Script Injection**
❌ Attacker tries: `<script src="https://evil.com/xss.js"></script>`
✅ Blocked: Domain not whitelisted in CSP

#### 5. **Data URI Scripts**
❌ Attacker tries: `<script src="data:text/javascript,alert('XSS')"></script>`
✅ Blocked: Data URIs not allowed for scripts

### What Users Still Need to Do

1. **Sanitize User Input**
   - Never trust user input
   - Use DOMPurify or similar for HTML content
   - Validate and escape all user data

2. **Parameterized Queries**
   - Use prepared statements for databases
   - Never concatenate SQL strings

3. **Output Encoding**
   - HTML encode: `< > & " '`
   - URL encode: query parameters
   - JavaScript encode: dynamic script content

4. **Validate All Data**
   - Server-side validation (never trust client)
   - Type checking
   - Length limits
   - Format validation (email, phone, etc.)

## Monitoring & Auditing

### 1. **CSP Reports** (Optional - Not yet implemented)
Add to CSP:
```
report-uri /api/csp-report
report-to csp-endpoint
```

### 2. **Regular Security Audits**
- Run Lighthouse security audit
- Check https://securityheaders.com/
- Review dependencies: `npm audit`
- Update packages regularly

### 3. **Browser Console**
Monitor for CSP violations during development

## Troubleshooting

### Issue: Script Blocked by CSP

**Symptom**: Console error: "Refused to execute inline script"

**Solutions**:
1. Add nonce to script tag: `<script nonce={nonce} ...>`
2. Move script to external file
3. Add domain to CSP whitelist (use sparingly)

### Issue: Styles Not Loading

**Symptom**: Inline styles blocked

**Solution**: Styles already allow `'unsafe-inline'` (required for Tailwind)

### Issue: Image Not Loading

**Symptom**: Image from new domain blocked

**Solution**: Add domain to `img-src` in `middleware.ts`:
```javascript
"img-src 'self' data: blob: https://img.youtube.com https://newdomain.com"
```

### Issue: Third-Party Script Blocked

**Symptom**: Analytics/tracking script blocked

**Solution**: Add domain to `script-src` in `middleware.ts`:
```javascript
"script-src 'self' 'nonce-${nonce}' https://newanalytics.com"
```

## Best Practices

1. ✅ **Always use nonces** for inline scripts
2. ✅ **Whitelist specific domains** instead of wildcards
3. ✅ **Test CSP in report-only mode** before enforcing
4. ✅ **Keep CSP as strict as possible**
5. ✅ **Review CSP regularly** when adding features
6. ✅ **Monitor CSP violations** in production
7. ✅ **Update security headers** with framework updates
8. ✅ **Run security audits** before deployments

## Resources

- [MDN CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Security Headers](https://securityheaders.com/)
- [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)

## Quick Reference

```bash
# Test CSP in browser
1. Open DevTools → Console
2. Look for CSP violations
3. All legitimate scripts should execute

# Check security headers
curl -I https://z-beam.com

# Test specific CSP
lighthouse https://z-beam.com --view --only-categories=security
```

---

**Last Updated**: October 22, 2025
**Status**: ✅ Secure - CSP with nonces, all security headers configured
