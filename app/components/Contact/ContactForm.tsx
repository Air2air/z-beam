// app/components/Contact/ContactForm.tsx
'use client';

import { useState, useRef, memo } from 'react';
import { ContactFormData, FormErrors } from '@/types';
import { Button } from '../Button';
import { getGridClasses } from '@/app/utils/gridConfig';

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
    if (errors[name as keyof FormErrors]) {
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
    } catch (_error) {
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
          className="p-4 bg-red-900/20 border border-red-800 rounded-md"
        >
          <h3 id="error-summary-title" className="text-secondary mb-2">
            Please correct the following errors:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-400">
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
        <div className={getGridClasses({ columns: 1, gap: 'md' })}>
          <div>
            <label htmlFor="name" className="block text-sm mb-2">
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
              className={`w-full px-4 py-2 border rounded-md bg-secondary placeholder-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent focus-visible:outline-none ${
                errors.name ? 'border-red-400' : 'border-gray-600'
              }`}
              placeholder="Your full name"
            />
            {errors.name && (
              <p id="name-error" role="alert" className="mt-1 text-sm text-red-400">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm mb-2">
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
              className={`w-full px-4 py-2 border rounded-md bg-secondary placeholder-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent focus-visible:outline-none ${
                errors.email ? 'border-red-400' : 'border-gray-600'
              }`}
              placeholder="your@email.com"
            />
            {errors.email && (
              <p id="email-error" role="alert" className="mt-1 text-sm text-red-400">
                {errors.email}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm mb-2">
            Phone Number <span className="text-muted text-xs">(optional)</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            autoComplete="tel"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-600 bg-secondary placeholder-gray-400 rounded-md focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent focus-visible:outline-none"
            placeholder="(650) 590-5040"
          />
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm mb-2">
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
            className={`w-full px-4 py-2 border rounded-md bg-secondary placeholder-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent focus-visible:outline-none ${
              errors.message ? 'border-red-400' : 'border-gray-600'
            }`}
            placeholder="Please provide details about your inquiry, including any specific requirements or questions you have about our laser cleaning solutions."
          />
          <p id="message-hint" className="mt-1 text-xs text-muted">
            Minimum 10 characters required
          </p>
          {errors.message && (
            <p id="message-error" role="alert" className="mt-1 text-sm text-red-400">
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
            className={`p-4 rounded-md ${
              submitStatus.type === 'success' 
                ? 'bg-green-900/20 border border-green-800 text-green-300' 
                : 'bg-red-900/20 border border-red-800 text-red-300'
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
            variant="primary"
            size="md"
            fullWidth
            showIcon={false}
            aria-label={isSubmitting ? "Submitting form, please wait" : "Send message"}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
        </div>

        <p className="text-sm text-muted text-center">
          * Required fields. We typically respond within 24 hours during business days.
        </p>
      </form>
  );
});
