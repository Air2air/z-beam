// app/components/DiagnosticCenter/DiagnosticCenter.tsx
'use client';

import { PreventionPanel } from './PreventionPanel';
import { TroubleshootingPanel } from './TroubleshootingPanel';
import { QuickReferencePanel } from './QuickReferencePanel';
import { BaseSection } from '../BaseSection/BaseSection';
import { SectionTitle } from '../SectionTitle/SectionTitle';
import { Title } from '../Title/Title';
import { getSectionIcon } from '@/app/config/sectionIcons';
import { Wrench } from 'lucide-react';

interface DiagnosticCenterProps {
  materialName: string;
  challenges: any; // material_challenges from frontmatter
  issues: any[]; // common_issues from frontmatter
  heroImage?: string;
  materialLink?: string;
}

/**
 * DiagnosticCenter - Independent collapsible sections for material challenges and troubleshooting
 * 
 * Combines proactive prevention strategies with reactive problem-solving in a unified interface.
 * Three independent collapsible sections provide different mental models:
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
  // Safety check for materialName
  const safeMaterialName = materialName || 'material';
  
  return (
    <BaseSection className="mb-8">
      <SectionTitle
        title="Diagnostic & Prevention Center"
        icon={getSectionIcon('diagnostic')}
        sectionDescription={`Proactive strategies and reactive solutions for ${safeMaterialName.toLowerCase()}`}
      />
      
      {/* Independent Collapsible Sections */}
      <div className="space-y-4">
        <PreventionPanel challenges={challenges} />
        <TroubleshootingPanel issues={issues} />
        <QuickReferencePanel challenges={challenges} issues={issues} />
      </div>
    </BaseSection>
  );
}
