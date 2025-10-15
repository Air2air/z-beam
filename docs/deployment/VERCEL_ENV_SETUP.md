# Environment Variables Setup for Vercel

## Required Environment Variables

### NEXT_PUBLIC_SITE_URL
**Purpose:** Used for generating absolute URLs in metadata, API routes, and sitemap generation.

**How to Set in Vercel:**
1. Go to https://vercel.com/air2airs-projects/z-beam
2. Click "Settings" in the top navigation
3. Click "Environment Variables" in the left sidebar
4. Click "Add New"
5. Set the following:
   - **Key:** `NEXT_PUBLIC_SITE_URL`
   - **Value:** `https://z-beam.com` (or your production domain)
   - **Environment:** Select all (Production, Preview, Development)
6. Click "Save"

### RESEND_API_KEY (Optional - for contact form emails)
**Purpose:** Enables sending emails from the contact form via Resend service.

**How to Set in Vercel:**
1. Get API key from https://resend.com/api-keys
2. In Vercel Settings > Environment Variables
3. Click "Add New"
4. Set the following:
   - **Key:** `RESEND_API_KEY`
   - **Value:** Your Resend API key (starts with `re_`)
   - **Environment:** Select Production (and Preview if needed)
5. Click "Save"

## Verification

After setting the environment variables:
1. Trigger a new deployment (push to main or redeploy)
2. Check build logs - health check should pass
3. Verify no "CONFIG_ERROR" messages in logs

## Current Status

✅ Local development configured (`.env.local`)
✅ API routes marked as dynamic to prevent static rendering errors
✅ Production template created (`.env.production`)
⚠️ **ACTION REQUIRED:** Set `NEXT_PUBLIC_SITE_URL` in Vercel dashboard

## Fixed Build Errors

1. ✅ `/api/debug` - Added `export const dynamic = 'force-dynamic'`
2. ✅ `/api/search` - Added `export const dynamic = 'force-dynamic'`
3. ✅ `/api/health` - Added `export const dynamic = 'force-dynamic'`
4. ⚠️ Health check CONFIG_ERROR - Will be fixed once `NEXT_PUBLIC_SITE_URL` is set in Vercel
