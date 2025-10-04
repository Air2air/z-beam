// app/components/Contact/ContactInfo.tsx
import React from 'react';
import { SITE_CONFIG } from '../../utils/constants';
import { Title } from '../Title';

export function ContactInfo() {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <Title level="section" title="Contact Information" />
      
      <div className="space-y-6">
        {/* Email Section */}
        <div>
          <Title level="card" title="General Inquiries" />
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Email:</strong>{' '}
              <a 
                href={`mailto:${SITE_CONFIG.contact.general.email}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {SITE_CONFIG.contact.general.email}
              </a>
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Phone:</strong>{' '}
              <a 
                href={SITE_CONFIG.contact.general.phoneHref}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {SITE_CONFIG.contact.general.phone}
              </a>
            </p>
          </div>
        </div>

        {/* Sales Section */}
        <div>
          <Title level="card" title="Sales & Consultations" />
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Sales Team:</strong>{' '}
              <a 
                href={`mailto:${SITE_CONFIG.contact.sales.email}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {SITE_CONFIG.contact.sales.email}
              </a>
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Direct Line:</strong>{' '}
              <a 
                href={SITE_CONFIG.contact.sales.phoneHref}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {SITE_CONFIG.contact.sales.phone}
              </a>
            </p>
          </div>
        </div>

        {/* Support Section */}
        <div>
          <Title level="card" title="Technical Support" />
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Support Email:</strong>{' '}
              <a 
                href={`mailto:${SITE_CONFIG.contact.support.email}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {SITE_CONFIG.contact.support.email}
              </a>
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Support Hotline:</strong>{' '}
              <a 
                href={SITE_CONFIG.contact.support.phoneHref}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {SITE_CONFIG.contact.support.phone}
              </a>
            </p>
          </div>
        </div>

        {/* Address Section */}
        <div>
          <Title level="card" title="Business Address" />
          <div className="text-gray-600 dark:text-gray-300">
            <p>{SITE_CONFIG.address.company}</p>
            <p>{SITE_CONFIG.address.street}</p>
            <p>{SITE_CONFIG.address.city}, {SITE_CONFIG.address.state} {SITE_CONFIG.address.zipCode}</p>
            <p>{SITE_CONFIG.address.country}</p>
          </div>
        </div>

        {/* Hours Section */}
        <div>
          <Title level="card" title="Office Hours" />
          <div className="space-y-1 text-gray-600 dark:text-gray-300">
            <p>{SITE_CONFIG.hours.weekday}</p>
            <p>{SITE_CONFIG.hours.saturday}</p>
            <p>{SITE_CONFIG.hours.sunday}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Emergency support available {SITE_CONFIG.contact.support.emergency}
            </p>
          </div>
        </div>

        {/* Response Time */}
        <div>
          <Title level="card" title="Response Time" />
          <div className="space-y-1 text-gray-600 dark:text-gray-300">
            <p><strong>General Inquiries:</strong> {SITE_CONFIG.responseTime.general}</p>
            <p><strong>Sales Questions:</strong> {SITE_CONFIG.responseTime.sales}</p>
            <p><strong>Technical Support:</strong> {SITE_CONFIG.responseTime.support}</p>
            <p><strong>Emergency Support:</strong> {SITE_CONFIG.responseTime.emergency}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
