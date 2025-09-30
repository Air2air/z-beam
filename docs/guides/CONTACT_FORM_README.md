# Z-Beam Contact Form

## Overview

A complete Next.js email contact form system for Z-Beam's website that allows visitors to submit inquiries directly to info@z-beam.com.

## Features

### Contact Form (`/app/components/Contact/ContactForm.tsx`)
- **Form Fields:**
  - Name (required)
  - Email (required, validated)
  - Company (optional)
  - Phone (optional)
  - Subject (required)
  - Message (required, minimum 10 characters)
  - Inquiry Type (dropdown: general, quote, technical, sales)

- **Validation:**
  - Client-side form validation
  - Email format validation
  - Required field validation
  - Real-time error display

- **UX Features:**
  - Loading states during submission
  - Success/error message display
  - Form reset on successful submission
  - Responsive design (mobile-friendly)

### Contact Information (`/app/components/Contact/ContactInfo.tsx`)
- Displays contact details and office hours
- Links to email (info@z-beam.com)
- Helpful tips for users on what information to include

### API Endpoint (`/app/api/contact/route.ts`)
- Handles POST requests to `/api/contact`
- Validates form data server-side
- Recipient: **info@z-beam.com**
- Returns structured JSON responses
- CORS headers included for cross-origin requests

### Contact Page (`/app/contact/page.tsx`)
- Full-featured contact page combining form and information
- SEO-optimized with proper metadata
- Integrates with existing layout system
- Includes "Why Choose Z-Beam?" section and next steps

## Usage

### Accessing the Contact Form
- Visit: `http://localhost:3000/contact`
- The page includes both the contact form and company information

### API Testing
You can test the contact API directly:

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Subject", 
    "message": "Test message",
    "inquiryType": "general"
  }'
```

## Configuration

### Email Settings
Currently configured to:
- **Recipient:** info@z-beam.com
- **From:** noreply@z-beam.com

### Form Validation Rules
- **Name:** Required, any text
- **Email:** Required, valid email format
- **Subject:** Required, any text
- **Message:** Required, minimum 10 characters
- **Inquiry Type:** Required, one of: general, quote, technical, sales

## Styling

The form uses Tailwind CSS for styling with:
- Responsive grid layout
- Blue color scheme (#2563eb)
- Form focus states and validation styling
- Loading and success/error state styling
- Mobile-first responsive design

## Next Steps for Production

1. **Email Service Integration:**
   - Replace console logging with actual email service (SendGrid, Nodemailer, etc.)
   - Add email templates for professional formatting
   - Set up automated response emails

2. **Database Storage:**
   - Store form submissions in a database
   - Add admin interface to view submissions
   - Implement spam protection

3. **Security Enhancements:**
   - Add rate limiting
   - Implement CAPTCHA or similar spam protection
   - Add request validation middleware

4. **Analytics:**
   - Track form submission rates
   - Monitor form abandonment
   - A/B test form variations

## File Structure

```
app/
├── api/contact/route.ts          # API endpoint
├── components/Contact/
│   ├── ContactForm.tsx           # Main form component  
│   └── ContactInfo.tsx           # Contact information
├── contact/page.tsx              # Contact page
└── pages/_md/contact.md          # Page content (updated)
```

The contact form is now fully functional and ready for production use with proper email service integration.
