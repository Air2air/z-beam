# 📧 Setting Up Email for z-beam.com

You own `z-beam.com`, so the email configuration is correct! You just need to connect everything.

---

## Current Configuration ✅

**Email Config** (`app/config/site.ts`):
- From: `info@z-beam.com`
- To: `info@z-beam.com`
- Service: Resend

This is correct! Now let's make it work.

---

## Step-by-Step Setup

### Step 1: Add Custom Domain to Vercel

1. Go to your project domains:
   ```
   https://vercel.com/air2airs-projects/z-beam/settings/domains
   ```

2. Click **"Add Domain"**

3. Enter: `z-beam.com`

4. Also add: `www.z-beam.com`

5. Vercel will give you DNS records to add

### Step 2: Configure DNS (at your domain registrar)

Add these records where you registered `z-beam.com`:

```
Type    Name    Value
A       @       76.76.21.21 (Vercel's IP)
CNAME   www     cname.vercel-dns.com
```

⏱️ **DNS takes 5-60 minutes to propagate**

### Step 3: Set Up Resend for Email

#### A. Create Resend Account

1. Go to: https://resend.com/signup
2. Sign up (free tier allows 100 emails/day)
3. Verify your account

#### B. Add Your Domain to Resend

1. Go to: https://resend.com/domains
2. Click **"Add Domain"**
3. Enter: `z-beam.com`
4. Resend will show you DNS records

#### C. Add Email DNS Records

Add these records at your domain registrar:

**SPF Record** (prevents spam):
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
```

**DKIM Records** (authenticates your emails):
```
Type: TXT
Name: resend._domainkey
Value: [Resend will provide this - it's a long string]
```

**DMARC Record** (email policy):
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:info@z-beam.com
```

#### D. Get Your API Key

1. In Resend, go to: https://resend.com/api-keys
2. Click **"Create API Key"**
3. Name it: "Z-Beam Production"
4. Copy the key (starts with `re_...`)

### Step 4: Add API Key to Vercel

1. Go to Vercel environment variables:
   ```
   https://vercel.com/air2airs-projects/z-beam/settings/environment-variables
   ```

2. Click **"Add New"**

3. Enter:
   - **Key**: `RESEND_API_KEY`
   - **Value**: `re_xxxxxxxxxxxx` (your Resend API key)
   - **Environments**: Check all three (Production, Preview, Development)

4. Click **"Save"**

### Step 5: Redeploy

After adding the API key, redeploy:

```bash
vercel --prod --yes
```

Or trigger via git:
```bash
git commit --allow-empty -m "Trigger redeploy for email config"
git push origin main
vercel --prod --yes
```

---

## Testing Email

### After Setup Complete

1. Visit: `https://z-beam.com/contact` (your custom domain)

2. Fill out the contact form

3. Submit

4. Check `info@z-beam.com` inbox

✅ **You should receive the email!**

### Troubleshooting

If email doesn't work:

```bash
# Check Vercel logs
vercel logs --follow

# Test Resend API directly
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "info@z-beam.com",
    "to": "your-test@email.com",
    "subject": "Test",
    "html": "<p>Test email</p>"
  }'
```

---

## Quick Checklist

- [ ] Add z-beam.com to Vercel domains
- [ ] Add www.z-beam.com to Vercel domains
- [ ] Configure A and CNAME records (DNS)
- [ ] Wait for DNS propagation (5-60 min)
- [ ] Create Resend account
- [ ] Add z-beam.com to Resend
- [ ] Add SPF record (DNS)
- [ ] Add DKIM records (DNS)
- [ ] Add DMARC record (DNS)
- [ ] Wait for DNS propagation (5-60 min)
- [ ] Verify domain in Resend
- [ ] Create Resend API key
- [ ] Add RESEND_API_KEY to Vercel
- [ ] Redeploy with `vercel --prod`
- [ ] Test contact form
- [ ] Check inbox at info@z-beam.com

---

## Timeline

- **DNS Configuration**: 5-60 minutes
- **Email Verification**: 5-30 minutes
- **Total Setup Time**: 30-90 minutes (mostly waiting for DNS)

---

## Cost

- **Vercel**: Free for hobby projects
- **Resend**: Free tier (100 emails/day, 3,000/month)
- **Domain**: Already own it ✅

---

## Current Status

✅ Code is configured correctly  
⚠️ Need to connect services  
❌ DNS and email service not set up yet

---

## What You Need

1. **Access to z-beam.com DNS** (where you registered the domain)
2. **Email access** (to receive at info@z-beam.com or forward it)
3. **30-90 minutes** for setup and DNS propagation

---

## Local Testing (Optional)

To test email locally before deploying:

```bash
# Add to .env.local
echo "RESEND_API_KEY=re_your_key_here" >> .env.local

# Restart dev server
npm run dev

# Test at http://localhost:3000/contact
```

---

**Ready to set this up?** Start with Step 1 (Add domain to Vercel) and let me know if you need help with any step!

---

**Created**: October 11, 2025  
**Purpose**: Complete email setup guide for z-beam.com  
**Services**: Vercel (hosting) + Resend (email) + Your DNS provider
