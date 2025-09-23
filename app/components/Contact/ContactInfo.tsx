// app/components/Contact/ContactInfo.tsx
import React from 'react';
import { SITE_CONFIG } from '../../utils/constants';

export function ContactInfo() {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Contact Information</h2>
      
      <div className="space-y-8">
        {/* General Contact */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">General Inquiries</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <a href="mailto:info@z-beam.com" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                info@z-beam.com
              </a>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <a href={`tel:${SITE_CONFIG.phone}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                {SITE_CONFIG.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Sales & Consultations */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Sales & Consultations</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Interested in a consultation or quote for your specific application? 
            Our sales team specializes in laser cleaning solutions.
          </p>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <a href="mailto:info@z-beam.com" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
              info@z-beam.com
            </a>
          </div>
        </div>

        {/* Technical Support */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Technical Support</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Need technical assistance or have questions about existing equipment? 
            Our support team is ready to help.
          </p>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <a href="mailto:info@z-beam.com" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
              info@z-beam.com
            </a>
          </div>
        </div>

        {/* Office Hours */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Business Address</h3>
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <div className="text-gray-600 dark:text-gray-400">
              <div>{SITE_CONFIG.address.street}</div>
              <div>{SITE_CONFIG.address.city}, {SITE_CONFIG.address.state} {SITE_CONFIG.address.zipCode}</div>
              <div>{SITE_CONFIG.address.country}</div>
            </div>
          </div>
        </div>

        {/* Office Hours */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Office Hours</h3>
          <div className="space-y-1 text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Monday - Friday:</span>
              <span>8:00 AM - 6:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span>Saturday:</span>
              <span>9:00 AM - 3:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span>Sunday:</span>
              <span>Closed</span>
            </div>
          </div>
        </div>

        {/* Response Time */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Response Time</h3>
          <p className="text-gray-600 dark:text-gray-400">
            We typically respond to all inquiries within 24 hours during business days.
          </p>
        </div>


      </div>
    </div>
  );
}
