// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { ContactFormData } from '@/types';
import { SITE_CONFIG } from '@/app/config';
import { logger } from '@/app/utils/logger';

// Initialize Nodemailer transporter with Google Workspace SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.GMAIL_USER, // Your info@z-beam.com email
    pass: process.env.GMAIL_APP_PASSWORD, // Google App Password
  },
});

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();
    
    // Validate required fields (only name, email, and message are required)
    const { name, email, subject, message, inquiryType } = body;
    
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: SITE_CONFIG.messages.formMissingFields },
        { status: 400 }
      );
    }
    
    // Validate email format
    if (!SITE_CONFIG.validation.emailRegex.test(email)) {
      return NextResponse.json(
        { error: SITE_CONFIG.messages.invalidEmail },
        { status: 400 }
      );
    }

    // Check if Gmail credentials are configured
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      logger.info('Gmail credentials not configured. Form submission received', { body });
      return NextResponse.json({
        success: true,
        message: SITE_CONFIG.messages.contactSuccess
      });
    }
    
    // Send email using Nodemailer with Google Workspace SMTP
    try {
      const mailOptions = {
        from: `"Z-Beam Contact Form" <${process.env.GMAIL_USER}>`,
        to: SITE_CONFIG.emailConfig.toAddresses.join(', '),
        subject: `New Contact: ${subject || 'No Subject'}`,
        replyTo: email,
        html: `
          <div style="max-width: 600px; margin: 0 auto;">
            <h2 style="color: ${SITE_CONFIG.emailConfig.brandColor}; border-bottom: 2px solid ${SITE_CONFIG.emailConfig.brandColor}; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            
            <div style="background-color: #f8fafc; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h3 style="margin-top: 0; color: #374151;">Contact Details</h3>
              ${inquiryType ? `<p><strong>Inquiry Type:</strong> <span style="background-color: #dbeafe; padding: 2px 8px; border-radius: 4px;">${inquiryType.charAt(0).toUpperCase() + inquiryType.slice(1)}</span></p>` : ''}
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}" style="color: ${SITE_CONFIG.emailConfig.brandColor};">${email}</a></p>
              ${body.company ? `<p><strong>Company:</strong> ${body.company}</p>` : ''}
              ${body.phone ? `<p><strong>Phone:</strong> <a href="tel:${body.phone}" style="color: ${SITE_CONFIG.emailConfig.brandColor};">${body.phone}</a></p>` : ''}
            </div>
            
            ${subject ? `<div style="margin: 20px 0;">
              <h3 style="color: #374151;">Subject</h3>
              <p style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; border-left: 4px solid ${SITE_CONFIG.emailConfig.brandColor};">
                ${subject}
              </p>
            </div>` : ''}
            
            <div style="margin: 20px 0;">
              <h3 style="color: #374151;">Message</h3>
              <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 6px; white-space: pre-wrap;">
${message}
              </div>
            </div>
            
            <div style="margin-top: 30px; padding: 15px; background-color: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e;">
                <strong>Response Required:</strong> ${SITE_CONFIG.messages.responseRequired}
              </p>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280; text-align: center;">
              ${SITE_CONFIG.emailConfig.replyToMessage}<br>
              Visit <a href="${SITE_CONFIG.url}" style="color: ${SITE_CONFIG.emailConfig.brandColor};">${SITE_CONFIG.url.replace('https://', '')}</a> for more information.
            </p>
          </div>
        `,
      };

      // Send email via Google Workspace SMTP
      const info = await transporter.sendMail(mailOptions);

      logger.info('Email sent successfully', { messageId: info.messageId });
      
      return NextResponse.json({
        success: true,
        message: SITE_CONFIG.messages.contactSuccess
      });

    } catch (emailError) {
      logger.error('Email sending failed', { error: emailError });
      return NextResponse.json(
        { error: SITE_CONFIG.messages.contactError },
        { status: 500 }
      );
    }
    
  } catch (error) {
    logger.error('Contact form error', { error });
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
