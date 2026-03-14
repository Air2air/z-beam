'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#111827',
      padding: '1rem'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '42rem' }}>
        <h1 style={{ 
          marginBottom: '1rem', 
          fontSize: '6rem', 
          fontWeight: 'bold',
          color: '#ffffff'
        }}>
          404
        </h1>
        <h2 style={{ 
          marginBottom: '1.5rem', 
          fontSize: '2rem', 
          fontWeight: '600',
          color: '#f3f4f6'
        }}>
          Page Not Found
        </h2>
        <p style={{ 
          marginBottom: '2rem', 
          fontSize: '1.125rem',
          color: '#d1d5db'
        }}>
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/"
            style={{
              padding: '1rem 2rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontWeight: '500',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
            }}
          >
            Go to Home
          </Link>
          <Link
            href="/services"
            style={{
              padding: '1rem 2rem',
              backgroundColor: '#374151',
              color: '#ffffff',
              fontWeight: '500',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
            }}
          >
            Services
          </Link>
        </div>
      </div>
    </div>
  );
}
