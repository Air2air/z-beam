# Gmail SMTP Setup Guide

## Setup Steps

### 1. Generate Google App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Scroll down to **App passwords** or visit: https://myaccount.google.com/apppasswords
4. Select **Mail** and **Other (Custom name)**
5. Enter "Z-Beam Contact Form" as the name
6. Click **Generate**
7. Copy the 16-character password (no spaces)

### 2. Update Local Environment (.env.local)

Replace `your_app_password_here` with your generated app password:

```bash
GMAIL_USER=info@z-beam.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx  # 16 characters from Google
```

### 3. Update Vercel Environment Variables

1. Go to your Vercel project: https://vercel.com/your-username/z-beam
2. Navigate to **Settings** → **Environment Variables**
3. Add two new variables for **Production, Preview, and Development**:
   - **GMAIL_USER**: `info@z-beam.com`
   - **GMAIL_APP_PASSWORD**: `your_16_char_app_password`
4. Redeploy your application

### 4. Test Your Contact Form

1. Run dev server: `npm run dev`
2. Visit: http://localhost:3000/contact
3. Submit a test form
4. Check your `info@z-beam.com` inbox for the email

## Benefits Over Resend

✅ **No additional service** - Use existing Google Workspace  
✅ **No DNS setup** - Already configured  
✅ **See sent emails** - All emails appear in your Sent folder  
✅ **Better deliverability** - Sent from Google's servers  
✅ **No additional cost** - Included in Google Workspace  

## Troubleshooting

### "Invalid login" error
- Make sure 2-Step Verification is enabled
- Regenerate the App Password
- Remove any spaces from the password

### Emails not sending
- Verify environment variables are set in Vercel
- Check Google Workspace admin hasn't restricted SMTP
- Verify `info@z-beam.com` is your actual Google Workspace email

### Need help?
Contact your Google Workspace admin or check: https://support.google.com/mail/answer/185833

## Migration Complete

- ✅ Removed Resend dependency
- ✅ Installed Nodemailer
- ✅ Updated contact API route
- ✅ Updated environment files
- ✅ Ready to use Google Workspace SMTP
