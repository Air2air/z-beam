// app/components/SafetyWarning.tsx
'use client';

import Link from 'next/link';
import { AlertTriangleIcon } from '@/app/components/Buttons';
import { BaseSection } from './BaseSection/BaseSection';
import { getSectionIcon } from '@/app/config/sectionIcons';

interface SafetyWarningProps {
  materialName?: string;
  warningText?: string;
  className?: string;
}

export function SafetyWarning({ 
  materialName = 'this material',
  warningText,
  className = ''
}: SafetyWarningProps) {
  const defaultWarning = `Laser cleaning of ${materialName} requires extreme caution due to potential release of toxic gases and hazardous byproducts. Contact our safety specialists for proper protocols and equipment requirements.`;
  
  return (
    <div className={className}>
      <BaseSection
        title="Important Safety Notice"
        icon={getSectionIcon('warning')}
        variant="default"
        className="bg-red-50 border-l-4 border-red-400"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            <div className="bg-red-900/30 p-3 rounded-full">
              <AlertTriangleIcon className="text-red-600 text-2xl" aria-hidden="true" />
            </div>
          </div>
          
          <div className="flex-1">
            <p className="text-red-800 text-base mb-4">
              {warningText || defaultWarning}
            </p>
            <Link 
              href="/contact"
              className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold underline transition-colors"
            >
              Contact Safety Specialists
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </BaseSection>
    </div>
  );
}
