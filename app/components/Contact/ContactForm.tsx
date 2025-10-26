// app/components/Contact/ContactForm.tsx
'use client';

import { useState, useRef, useEffect, memo } from 'react';
import { ContactFormData, FormErrors } from '@/types';
import { Button } from '../ContactButton';

export const ContactForm = memo(function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    company: '',
    inquiryType: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const successMessageRef = useRef<HTMLDivElement>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Focus error summary for accessibility
      setTimeout(() => {
        errorSummaryRef.current?.focus();
      }, 100);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: result.message || 'Your message has been sent successfully!'
        });
        
        // Reset form on success
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          company: '',
          inquiryType: '',
        });
        
        // Focus success message for accessibility
        setTimeout(() => {
          successMessageRef.current?.focus();
        }, 100);
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.error || 'Failed to send message. Please try again.'
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <div
          ref={errorSummaryRef}
          tabIndex={-1}
          role="alert"
          aria-labelledby="error-summary-title"
          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <h3 id="error-summary-title" className="text-red-800 dark:text-red-300 mb-2">
            Please correct the following errors:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-400">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>
                <a href={`#${field}`} className="underline hover:no-underline">
                  {error}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Name and Email Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              Full Name <span aria-label="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              autoComplete="name"
              value={formData.name}
              onChange={handleInputChange}
              aria-required="true"
              aria-invalid={errors.name ? 'true' : 'false'}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent focus-visible:outline-none ${
                errors.name ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Your full name"
            />
            {errors.name && (
              <p id="name-error" role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              Email Address <span aria-label="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange}
              aria-required="true"
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent focus-visible:outline-none ${
                errors.email ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="your@email.com"
            />
            {errors.email && (
              <p id="email-error" role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.email}
              </p>
            )}
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phone" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
            Phone Number <span className="text-gray-500 text-xs">(optional)</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            autoComplete="tel"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent focus-visible:outline-none"
            placeholder="(650) 241-8510"
          />
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
            Message <span aria-label="required">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            rows={6}
            aria-required="true"
            aria-invalid={errors.message ? 'true' : 'false'}
            aria-describedby={errors.message ? 'message-error' : 'message-hint'}
            className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent focus-visible:outline-none ${
              errors.message ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Please provide details about your inquiry, including any specific requirements or questions you have about our laser cleaning solutions."
          />
          <p id="message-hint" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Minimum 10 characters required
          </p>
          {errors.message && (
            <p id="message-error" role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.message}
            </p>
          )}
        </div>

        {/* Submit Status */}
        {submitStatus.type && (
          <div
            ref={submitStatus.type === 'success' ? successMessageRef : undefined}
            tabIndex={-1}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            className={`p-4 rounded-lg ${
              submitStatus.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' 
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
            }`}
          >
            {submitStatus.message}
          </div>
        )}

        {/* Submit Button */}
        <div>
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="inverted"
            size="lg"
            fullWidth
            showIcon={false}
            aria-label={isSubmitting ? "Submitting form, please wait" : "Send message"}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          * Required fields. We typically respond within 24 hours during business days.
        </p>
      </form>
  );
});
