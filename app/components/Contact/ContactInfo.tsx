// app/components/Contact/ContactInfo.tsx
import React from 'react';
import { SITE_CONFIG } from '../../utils/constants';
import { Header } from '../Header';

export function ContactInfo() {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <Header level="section" title="Contact Information" />
      
      <div className="space-y-6">
        {/* Email Section */}
        <div>
          <Header level="card" title="General Inquiries" />
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Email:</strong>{' '}
              <a 
                href="mailto:info@z-beam.com" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                info@z-beam.com
              </a>
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Phone:</strong>{' '}
              <a 
                href="tel:+1-555-0123" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                +1 (555) 012-3456
              </a>
            </p>
          </div>
        </div>

        {/* Sales Section */}
        <div>
          <Header level="card" title="Sales & Consultations" />
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Sales Team:</strong>{' '}
              <a 
                href="mailto:sales@z-beam.com" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                sales@z-beam.com
              </a>
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Direct Line:</strong>{' '}
              <a 
                href="tel:+1-555-0124" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                +1 (555) 012-3457
              </a>
            </p>
          </div>
        </div>

        {/* Support Section */}
        <div>
          <Header level="card" title="Technical Support" />
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Support Email:</strong>{' '}
              <a 
                href="mailto:support@z-beam.com" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                support@z-beam.com
              </a>
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Support Hotline:</strong>{' '}
              <a 
                href="tel:+1-555-0125" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                +1 (555) 012-3458
              </a>
            </p>
          </div>
        </div>

        {/* Address Section */}
        <div>
          <Header level="card" title="Business Address" />
          <div className="text-gray-600 dark:text-gray-300">
            <p>Z-Beam Technologies</p>
            <p>123 Industrial Way</p>
            <p>Tech City, TC 12345</p>
            <p>United States</p>
          </div>
        </div>

        {/* Hours Section */}
        <div>
          <Header level="card" title="Office Hours" />
          <div className="space-y-1 text-gray-600 dark:text-gray-300">
            <p><strong>Monday - Friday:</strong> 8:00 AM - 6:00 PM EST</p>
            <p><strong>Saturday:</strong> 9:00 AM - 2:00 PM EST</p>
            <p><strong>Sunday:</strong> Closed</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Emergency support available 24/7 for existing customers
            </p>
          </div>
        </div>

        {/* Response Time */}
        <div>
          <Header level="card" title="Response Time" />
          <div className="space-y-1 text-gray-600 dark:text-gray-300">
            <p><strong>General Inquiries:</strong> Within 24 hours</p>
            <p><strong>Sales Questions:</strong> Within 4 hours (business days)</p>
            <p><strong>Technical Support:</strong> Within 2 hours (business days)</p>
            <p><strong>Emergency Support:</strong> Within 1 hour (24/7)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
