// app/components/SafetyWarning.tsx
'use client';

import Link from 'next/link';
import { AlertTriangleIcon } from '@/app/components/Buttons';
import { SectionContainer } from './SectionContainer';

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
      <SectionContainer
        title=""
        bgColor="body"
        radius={true}
        horizPadding={true}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            <div className="bg-red-900/30 p-3 rounded-full">
              <AlertTriangleIcon className="text-red-600400 text-2xl" aria-hidden="true" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-secondary font-bold text-lg text-secondary mb-2">
              Important Safety Notice
            </h3>
            <p className="text-red-800200 text-base mb-4">
              {warningText || defaultWarning}
            </p>
            <Link 
              href="/safety"
              className="inline-flex items-center gap-2 text-red-600400 hover:text-red-700:text-red-300 font-semibold underline transition-colors"
            >
              View Safety Guidelines
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </SectionContainer>
    </div>
  );
}
