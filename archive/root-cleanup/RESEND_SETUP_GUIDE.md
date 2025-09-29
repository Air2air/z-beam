# Resend Email Configuration for Z-Beam Contact Form

## Current Status ✅
- ✅ Resend integration is working
- ✅ API key is configured
- ✅ Email sending is functional
- ⚠️ Currently using testing mode (sends to todd@dunningmarketing.com only)

## Production Setup Required

### Step 1: Verify Your Domain
To send emails to `info@z-beam.com`, you need to verify the `z-beam.com` domain:

1. Go to [Resend Domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter `z-beam.com`
4. Add the required DNS records to your domain:
   - SPF record
   - DKIM record
   - DMARC record (optional but recommended)

### Step 2: Update the API Route
Once domain is verified, update the email configuration in `/app/api/contact/route.ts`:

```typescript
const { data, error } = await resend.emails.send({
  from: 'Z-Beam Contact <noreply@z-beam.com>', // Use your verified domain
  to: ['info@z-beam.com'],                    // Your desired recipient
  subject: `New Contact: ${subject}`,
  // ... rest of configuration
});
```

### Step 3: Set Environment Variables in Vercel
For production deployment, add the environment variable in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add:
   - **Name:** `RESEND_API_KEY`
   - **Value:** `re_Ptxzqs75_DXVuPHntXMU5hak94zjaUcjv`
   - **Environments:** Production, Preview, Development

## DNS Records Needed (Example)

When you add the domain to Resend, you'll get specific DNS records. They'll look something like:

```
Type: TXT
Name: @
Value: "v=spf1 include:_spf.resend.com ~all"

Type: CNAME  
Name: resend._domainkey
Value: resend._domainkey.resend.com

Type: TXT
Name: _dmarc
Value: "v=DMARC1; p=none; rua=mailto:dmarc@z-beam.com"
```

## Testing Commands

Test the contact form locally:
```bash
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Email",
    "message": "Test message",
    "inquiryType": "general"
  }'
```

Test in production:
```bash
curl -X POST https://your-domain.vercel.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{ ... same data ... }'
```

## Current Temporary Configuration

**For testing purposes only**, the email is currently being sent to:
- **Recipient:** `todd@dunningmarketing.com` (your verified email)
- **From:** `Z-Beam Contact <onboarding@resend.dev>`

**After domain verification**, change back to:
- **Recipient:** `info@z-beam.com`
- **From:** `Z-Beam Contact <noreply@z-beam.com>`

## Features Implemented ✅

- ✅ Professional HTML email template
- ✅ All form fields included in email
- ✅ Reply-to set to customer's email
- ✅ Error handling and validation
- ✅ Responsive email design
- ✅ Inquiry type categorization
- ✅ Company and phone optional fields

The contact form is fully functional and ready for production once the domain is verified!
