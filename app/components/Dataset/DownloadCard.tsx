// app/components/Dataset/DownloadCard.tsx
/**
 * @component DownloadCard
 * @purpose Reusable gradient card for dataset download sections
 * @pattern Base component with consistent styling, reduces 4-level div nesting
 */

import React from 'react';

interface DownloadCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export function DownloadCard({
  icon,
  title,
  subtitle,
  description,
  children,
  className = '',
}: DownloadCardProps) {
  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 md:p-8 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-600 rounded-md">
            {icon}
          </div>
          <div>
            <h3 className="text-xl text-secondary font-bold">
              {title}
            </h3>
            <p className="text-sm text-muted">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      <p className="text-muted mb-4">
        {description}
      </p>

      <div className="flex flex-wrap gap-3">
        {children}
      </div>
    </div>
  );
}
