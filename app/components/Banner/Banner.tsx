// app/components/Banner/Banner.tsx
import './styles.scss';
import { useState } from 'react';

interface BannerProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  dismissible?: boolean;
  action?: {
    label: string;
    href: string;
  };
}

export function Banner({ 
  message, 
  type = 'info',
  dismissible = true,
  action
}: BannerProps) {
  const [dismissed, setDismissed] = useState(false);
  
  if (dismissed) return null;
  
  const typeClass = `banner-${type}`;
  
  return (
    <div className={`site-banner ${typeClass}`}>
      <div className="banner-content">
        <p className="banner-message">{message}</p>
        
        {action && (
          <a href={action.href} className="banner-action">
            {action.label}
          </a>
        )}
      </div>
      
      {dismissible && (
        <button 
          className="banner-close"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>
  );
}