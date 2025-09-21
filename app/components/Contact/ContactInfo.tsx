// app/components/Contact/ContactInfo.tsx
import React from 'react';

export function ContactInfo() {
  return (
    <div className="bg-gray-50 rounded-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
      
      <div className="space-y-8">
        {/* General Contact */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">General Inquiries</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <a href="mailto:info@z-beam.com" className="text-blue-600 hover:text-blue-800">
                info@z-beam.com
              </a>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <span className="text-gray-700">Call for immediate assistance</span>
            </div>
          </div>
        </div>

        {/* Sales & Consultations */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Sales & Consultations</h3>
          <p className="text-gray-600 mb-2">
            Interested in a consultation or quote for your specific application? 
            Our sales team specializes in laser cleaning solutions.
          </p>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <a href="mailto:info@z-beam.com" className="text-blue-600 hover:text-blue-800">
              info@z-beam.com
            </a>
          </div>
        </div>

        {/* Technical Support */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Technical Support</h3>
          <p className="text-gray-600 mb-2">
            Need technical assistance or have questions about existing equipment? 
            Our support team is ready to help.
          </p>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <a href="mailto:info@z-beam.com" className="text-blue-600 hover:text-blue-800">
              info@z-beam.com
            </a>
          </div>
        </div>

        {/* Office Hours */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Office Hours</h3>
          <div className="space-y-1 text-gray-600">
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
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Response Time</h3>
          <p className="text-gray-600">
            We typically respond to all inquiries within 24 hours during business days.
          </p>
        </div>

        {/* Additional Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">What to Include</h3>
          <ul className="text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Type of material you need to clean
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Current cleaning challenges
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Volume and frequency requirements
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Timeline for implementation
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
