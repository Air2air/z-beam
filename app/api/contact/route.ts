// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ContactFormData } from '@/types';
import { SITE_CONFIG } from '@/app/config';
import { logger } from '@/app/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();
    
    // Validate required fields (only name, email, and message are required)
    const { name, email, subject, message, inquiryType, phone, company } = body;
    
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

    // Log form submission (handled by Workiz web form now)
    logger.info('Contact form submission received', { 
      name,
      email,
      subject,
      inquiryType,
      hasMessage: !!message,
      hasCompany: !!company,
      hasPhone: !!phone
    });
    
    return NextResponse.json({
      success: true,
      message: SITE_CONFIG.messages.contactSuccess
    });
    
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
