// Server Component - no client-side interactivity
'use client';
// app/components/CTA/ConditionalCTA.tsx
// Conditional wrapper for CTA that hides on contact page

import { usePathname } from 'next/navigation';
import CallToAction from './CallToAction';

export function ConditionalCTA() {
  const pathname = usePathname();
  
  // Hide CTA on contact page
  if (pathname === '/contact') {
    return null;
  }
  
  return <CallToAction />;
}
