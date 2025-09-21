// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  subject: string;
  message: string;
  inquiryType: 'general' | 'quote' | 'technical' | 'sales';
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();
    
    // Validate required fields
    const { name, email, subject, message, inquiryType } = body;
    
    if (!name || !email || !subject || !message || !inquiryType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.log('Resend API key not configured. Form submission:', body);
      return NextResponse.json({
        success: true,
        message: 'Your message has been received. We will get back to you within 24 hours.'
      });
    }
    
    // Send email using Resend
    try {
      const { data, error } = await resend.emails.send({
        from: 'Z-Beam Contact <onboarding@resend.dev>',
        to: ['todd@dunningmarketing.com'], // Temporary: using verified email for testing
        subject: `New Contact: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            
            <div style="background-color: #f8fafc; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h3 style="margin-top: 0; color: #374151;">Contact Details</h3>
              <p><strong>Inquiry Type:</strong> <span style="background-color: #dbeafe; padding: 2px 8px; border-radius: 4px;">${inquiryType.charAt(0).toUpperCase() + inquiryType.slice(1)}</span></p>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #1e40af;">${email}</a></p>
              ${body.company ? `<p><strong>Company:</strong> ${body.company}</p>` : ''}
              ${body.phone ? `<p><strong>Phone:</strong> <a href="tel:${body.phone}" style="color: #1e40af;">${body.phone}</a></p>` : ''}
            </div>
            
            <div style="margin: 20px 0;">
              <h3 style="color: #374151;">Subject</h3>
              <p style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; border-left: 4px solid #1e40af;">
                ${subject}
              </p>
            </div>
            
            <div style="margin: 20px 0;">
              <h3 style="color: #374151;">Message</h3>
              <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 6px; white-space: pre-wrap;">
${message}
              </div>
            </div>
            
            <div style="margin-top: 30px; padding: 15px; background-color: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e;">
                <strong>Response Required:</strong> Please respond to this inquiry within 24 hours during business days.
              </p>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280; text-align: center;">
              This email was sent from the Z-Beam website contact form.<br>
              Visit <a href="https://z-beam.com" style="color: #1e40af;">z-beam.com</a> for more information.
            </p>
          </div>
        `,
        replyTo: email, // Allow direct reply to the customer
      });

      if (error) {
        console.error('Resend error:', error);
        return NextResponse.json(
          { error: 'Failed to send email. Please try again.' },
          { status: 500 }
        );
      }

      console.log('Email sent successfully:', data);
      
      return NextResponse.json({
        success: true,
        message: 'Your message has been sent successfully. We will get back to you within 24 hours.'
      });

    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return NextResponse.json(
        { error: 'Failed to send email. Please try again later.' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
