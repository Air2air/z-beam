// app/components/ContaminantsLayout/ContaminantsLayout.tsx
// Specialized layout for contaminant pages
// Contains all contaminant-specific components in proper order

import React from 'react';
import dynamic from 'next/dynamic';
import { Layout } from '../Layout/Layout';
import { RegulatoryStandards } from '../RegulatoryStandards';
import { ScheduleCards } from '../Schedule/ScheduleCards';
import { SafetyDataPanel } from '../SafetyDataPanel/SafetyDataPanel';
import type { LayoutProps } from '@/types';

const Micro = dynamic(() => import('../Micro/Micro').then(mod => ({ default: mod.Micro })), {
  ssr: true
});

interface ContaminantsLayoutProps extends LayoutProps {
  slug?: string;
  category?: string;
  subcategory?: string;
}

export function ContaminantsLayout(props: ContaminantsLayoutProps) {
  const { metadata, children, slug = '', category = '', subcategory = '' } = props;
  const contaminantName = (metadata?.title as string) || metadata?.name || slug;
  
  // Convert citations to regulatory standards format if they exist
  const citations = metadata?.eeat?.citations || [];
  const isBasedOn = metadata?.eeat?.isBasedOn;
  
  // Convert string citations to standard format
  const regulatoryStandards = citations
    .filter((citation: any) => typeof citation === 'string')
    .map((citation: string) => {
      // Extract name and description from citation string (e.g., "IEC 60825 - Safety of Laser Products")
      const parts = citation.split(' - ');
      const name = parts[0]?.trim() || citation;
      const description = parts[1]?.trim() || citation;
      
      return {
        name: name,
        description: description,
        longName: name,
        image: `/images/logo/logo-org-${name.toLowerCase().replace(/\s+/g, '-')}.png`,
        url: isBasedOn?.url || '#'
      };
    });
  
  return (
    <Layout {...props}>
      {/* Page-specific content passed from contaminants page */}
      {children}
      
      {/* Safety Data Panel */}
      {metadata?.laser_properties?.safety_data && (
        <div className="mb-16">
          <SafetyDataPanel
            safetyData={metadata.laser_properties.safety_data}
          />
        </div>
      )}
      
      {/* Micro - hidden if no micro image */}
      {metadata?.images?.micro?.url && (
        <div className="mb-16">
          <Micro 
            frontmatter={metadata}
            config={{}}
          />
        </div>
      )}
      
      {/* Regulatory Standards */}
      {regulatoryStandards.length > 0 && (
        <div className="mb-16">
          <RegulatoryStandards 
            standards={regulatoryStandards}
            heroImage={metadata?.images?.hero?.url}
            thumbnailLink={`/contaminants/${category}/${subcategory}/${slug}`}
          />
        </div>
      )}
      
      {/* Schedule Cards */}
      <div className="mb-16">
        <ScheduleCards />
      </div>
    </Layout>
  );
}

export default ContaminantsLayout;
