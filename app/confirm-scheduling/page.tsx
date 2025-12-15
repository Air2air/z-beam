import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, Calendar, Mail, Phone, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Booking Confirmed | Z-Beam Laser Cleaning',
  description: 'Your visit with Z-Beam has been successfully scheduled. We look forward to meeting you.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ConfirmSchedulingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Success Icon */}
          <div className="mb-8 flex justify-center">
            <div className="rounded-full bg-green-100 p-6 dark:bg-green-900/30">
              <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
            </div>
          </div>

          {/* Main Message */}
          <div className="text-center mb-12">
            <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
              Thank You!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Your visit with Z-Beam has been successfully scheduled.
            </p>
          </div>

          {/* Information Cards */}
          <div className="space-y-6 mb-12">
            {/* Confirmation Email */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                  <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    Check Your Email
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    A confirmation email with all the details has been sent to your inbox. 
                    Please check your spam folder if you don't see it within a few minutes.
                  </p>
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                  <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    What's Next?
                  </h2>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start">
                      <ArrowRight className="mr-2 h-5 w-5 flex-shrink-0 text-purple-600 dark:text-purple-400" />
                      <span>We'll prepare for your visit and review your specific needs</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="mr-2 h-5 w-5 flex-shrink-0 text-purple-600 dark:text-purple-400" />
                      <span>You'll receive a reminder 24 hours before your appointment</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="mr-2 h-5 w-5 flex-shrink-0 text-purple-600 dark:text-purple-400" />
                      <span>For virtual consultations, you'll receive a video call link via email</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-orange-100 p-3 dark:bg-orange-900/30">
                  <Phone className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    Questions?
                  </h2>
                  <p className="mb-3 text-gray-600 dark:text-gray-300">
                    If you need to reschedule or have any questions, we're here to help.
                  </p>
                  <div className="space-y-2">
                    <a
                      href="tel:+15555551234"
                      className="block text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      📞 (555) 555-1234
                    </a>
                    <a
                      href="mailto:info@z-beam.com"
                      className="block text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      ✉️ info@z-beam.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Return to Home
            </Link>
            <Link
              href="/materials"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Explore Materials
            </Link>
          </div>

          {/* Learn More Section */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              While you wait, learn more about{' '}
              <Link href="/services" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                our services
              </Link>
              {' '}or explore our{' '}
              <Link href="/materials" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                material database
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
