// app/components/FadeInWrapper/FadeInWrapper.tsx
'use client';

import React from 'react';

interface FadeInWrapperProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export default function FadeInWrapper({ children, delay = 0, className = '' }: FadeInWrapperProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`${isVisible ? 'opacity-100' : 'opacity-0'} ${className}`}
    >
      {children}
    </div>
  );
}
