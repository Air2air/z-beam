// app/components/DiagnosticCenter/DiagnosticCenter.tsx
'use client';

import { useState } from 'react';
import { PreventionTab } from './PreventionTab';
import { TroubleshootingTab } from './TroubleshootingTab';
import { QuickReferenceTab } from './QuickReferenceTab';
import { SectionContainer } from '../SectionContainer/SectionContainer';
import { SectionTitle } from '../SectionTitle/SectionTitle';
import { getSectionIcon } from '@/app/config/sectionIcons';

interface DiagnosticCenterProps {
  materialName: string;
  challenges: any; // material_challenges from frontmatter
  issues: any[]; // common_issues from frontmatter
  heroImage?: string;
  materialLink?: string;
}

/**
 * DiagnosticCenter - Consolidated tabbed interface for material challenges and troubleshooting
 * 
 * Combines proactive prevention strategies with reactive problem-solving in a unified,
 * user-journey-optimized interface. Three tabs provide different mental models:
 * 1. Prevention First - Proactive planning before starting work
 * 2. Fix Issues - Reactive diagnosis when problems occur
 * 3. Quick Reference - Combined overview and decision support
 */
export function DiagnosticCenter({ 
  materialName, 
  challenges, 
  issues,
  heroImage,
  materialLink 
}: DiagnosticCenterProps) {
  const [activeTab, setActiveTab] = useState<'prevention' | 'troubleshooting' | 'reference'>('prevention');
  
  // Safety check for materialName
  const safeMaterialName = materialName || 'material';
  
  return (
    <SectionContainer className="mb-8">
      <SectionTitle
        title="Diagnostic & Prevention Center"
        icon={getSectionIcon('diagnostic')}
        description={`Proactive strategies and reactive solutions for ${safeMaterialName.toLowerCase()}`}
        thumbnail={heroImage}
        thumbnailLink={materialLink}
      />
      
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-4 border-b">
        <button
          onClick={() => setActiveTab('prevention')}
          className={`px-4 py-2 font-medium transition-all min-h-[44px] ${
            activeTab === 'prevention'
              ? 'text-orange-400 border-b-2 border-orange-400 bg-orange-500/10'
              : 'text-tertiary hover:text-secondary hover:bg-secondary'
          }`}
          aria-pressed={activeTab === 'prevention'}
          aria-label="View prevention strategies"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Prevention First
          </span>
        </button>
        
        <button
          onClick={() => setActiveTab('troubleshooting')}
          className={`px-4 py-2 font-medium transition-all min-h-[44px] ${
            activeTab === 'troubleshooting'
              ? 'text-orange-400 border-b-2 border-orange-400 bg-orange-500/10'
              : 'text-tertiary hover:text-secondary hover:bg-secondary'
          }`}
          aria-pressed={activeTab === 'troubleshooting'}
          aria-label="View troubleshooting guide"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Fix Issues
          </span>
        </button>
        
        <button
          onClick={() => setActiveTab('reference')}
          className={`px-4 py-2 font-medium transition-all min-h-[44px] ${
            activeTab === 'reference'
              ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
              : 'text-tertiary hover:text-secondary hover:bg-secondary'
          }`}
          aria-pressed={activeTab === 'reference'}
          aria-label="View quick reference guide"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Quick Reference
          </span>
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="min-h-[400px]" role="tabpanel" aria-label={`${activeTab} content`}>
        {activeTab === 'prevention' && (
          <PreventionTab challenges={challenges} />
        )}
        {activeTab === 'troubleshooting' && (
          <TroubleshootingTab issues={issues} />
        )}
        {activeTab === 'reference' && (
          <QuickReferenceTab challenges={challenges} issues={issues} />
        )}
      </div>
    </SectionContainer>
  );
}
