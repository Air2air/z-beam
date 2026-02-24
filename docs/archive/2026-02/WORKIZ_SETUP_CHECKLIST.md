# Workiz Integration Checklist

## ✅ Completed Steps

1. ✅ Created `WorkizWidget.tsx` component
2. ✅ Updated booking page to use Workiz widget
3. ✅ Added environment variable support
4. ✅ Created documentation

## 🔧 Your Action Items

### Step 1: Get Workiz Credentials
- [ ] Log into https://app.workiz.com
- [ ] Go to Settings > Online Booking
- [ ] Copy your Company ID or booking URL
- [ ] Note: Your ID will look like a string of numbers/letters

### Step 2: Configure Environment
- [ ] Open `.env.local` (or create it if it doesn't exist)
- [ ] Add: `NEXT_PUBLIC_WORKIZ_COMPANY_ID=YOUR_ID_HERE`
- [ ] Save the file

### Step 3: Update Widget Component
- [ ] Open `app/components/Booking/WorkizWidget.tsx`
- [ ] Find line 85: `src={https://app.workiz.com/booking/${companyId || 'YOUR_COMPANY_ID'}}`
- [ ] Replace 'YOUR_COMPANY_ID' with your actual ID (or leave it if using env var)
- [ ] Check if Workiz gave you a different URL format (e.g., subdomain.workiz.com)

### Step 4: Test Locally
```bash
npm run dev
```
- [ ] Visit http://localhost:3000/booking
- [ ] Verify widget loads correctly
- [ ] Test booking flow end-to-end
- [ ] Check mobile responsiveness

### Step 5: Deploy
```bash
vercel --prod
```
Or push to GitHub if auto-deploying
- [ ] Add `NEXT_PUBLIC_WORKIZ_COMPANY_ID` to Vercel environment variables
- [ ] Deploy to production
- [ ] Test on live site

## 📋 Common Workiz URLs

Your booking URL might be one of these formats:
- `https://app.workiz.com/booking/COMPANY_ID`
- `https://YOURCOMPANY.workiz.com/booking`
- `https://booking.workiz.com/COMPANY_ID`

## 🎥 Virtual Consultations via Zoom

For video call consultations:
1. Customer books "Virtual Consultation" via Workiz widget
2. You manually create Zoom meeting for that time
3. Add Zoom link to Workiz job notes
4. Email customer with Zoom details 24hrs before meeting

**Full Process:** See `docs/WORKIZ_ZOOM_INTEGRATION.md`

## 🆘 Need Help?

- **Workiz not loading?** Check browser console for errors
- **Wrong company ID?** Verify in Workiz dashboard settings
- **Styling issues?** Adjust height prop in booking page.tsx
- **Virtual meetings?** See `docs/WORKIZ_ZOOM_INTEGRATION.md`
- **Full docs:** See `docs/WORKIZ_INTEGRATION.md`
