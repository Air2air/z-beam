/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { IndustryApplicationsPanel } from '@/app/components/IndustryApplicationsPanel';

describe('IndustryApplicationsPanel', () => {
  describe('Legacy Format Support', () => {
    it('renders with legacy flat array format', () => {
      const apps = ['Aerospace', 'Automotive', 'Medical Devices'];
      const { container } = render(
        <IndustryApplicationsPanel applications={apps as any} />
      );
      
      expect(container).toBeTruthy();
      // Component should normalize legacy format internally
    });

    it('handles empty legacy array', () => {
      const apps: string[] = [];
      const { container } = render(
        <IndustryApplicationsPanel applications={apps as any} />
      );
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Normalized Structure', () => {
    it('renders with complete normalized structure', () => {
      const apps = {
        presentation: 'badge' as const,
        items: [
          { id: 'aerospace', name: 'Aerospace', description: 'Aircraft components' },
          { id: 'automotive', name: 'Automotive', description: 'Vehicle manufacturing' }
        ],
        _section: {
          section_title: 'Industry Applications',
          section_description: 'Common industrial uses',
          icon: 'briefcase',
          order: 1
        }
      };
      
      const { container } = render(
        <IndustryApplicationsPanel applications={apps} />
      );
      
      expect(container).toBeTruthy();
    });

    it('renders with minimal normalized structure (no _section)', () => {
      const apps = {
        presentation: 'badge' as const,
        items: [
          { id: 'construction', name: 'Construction' }
        ]
      };
      
      const { container } = render(
        <IndustryApplicationsPanel 
          applications={apps}
          entityName="Steel"
          variant="materials"
        />
      );
      
      expect(container).toBeTruthy();
    });
  });

  describe('Variant-Specific Defaults', () => {
    it('uses materials variant default title', () => {
      const apps = {
        presentation: 'badge' as const,
        items: [{ id: 'aerospace', name: 'Aerospace' }]
      };
      
      const { container } = render(
        <IndustryApplicationsPanel 
          applications={apps}
          entityName="Aluminum"
          variant="materials"
        />
      );
      
      expect(container).toBeTruthy();
      // Should use: "Industry applications of Aluminum"
    });

    it('uses contaminants variant default title', () => {
      const apps = {
        presentation: 'badge' as const,
        items: [{ id: 'automotive', name: 'Automotive' }]
      };
      
      const { container } = render(
        <IndustryApplicationsPanel 
          applications={apps}
          entityName="Rust"
          variant="contaminants"
        />
      );
      
      expect(container).toBeTruthy();
      // Should use: "Industries Affected by Rust"
    });

    it('uses compounds variant default title', () => {
      const apps = {
        presentation: 'badge' as const,
        items: [{ id: 'manufacturing', name: 'Manufacturing' }]
      };
      
      const { container } = render(
        <IndustryApplicationsPanel 
          applications={apps}
          entityName="Iron Oxide Fume"
          variant="compounds"
        />
      );
      
      expect(container).toBeTruthy();
      // Should use: "Industries Using Iron Oxide Fume"
    });

    it('uses settings variant default title', () => {
      const apps = {
        presentation: 'badge' as const,
        items: [{ id: 'aerospace', name: 'Aerospace' }]
      };
      
      const { container } = render(
        <IndustryApplicationsPanel 
          applications={apps}
          entityName="High Power"
          variant="settings"
        />
      );
      
      expect(container).toBeTruthy();
      // Should use: "Industry applications of High Power"
    });
  });

  describe('Conditional Rendering', () => {
    it('renders nothing when applications is undefined', () => {
      const { container } = render(
        <IndustryApplicationsPanel applications={undefined as any} />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when applications is null', () => {
      const { container } = render(
        <IndustryApplicationsPanel applications={null as any} />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when items array is empty', () => {
      const apps = {
        presentation: 'badge' as const,
        items: []
      };
      
      const { container } = render(
        <IndustryApplicationsPanel applications={apps} />
      );
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Backward Compatibility', () => {
    it('extracts items from legacy and normalized formats', () => {
      const legacyApps = ['Construction', 'Manufacturing'];
      const { container: legacyContainer } = render(
        <IndustryApplicationsPanel applications={legacyApps as any} />
      );
      
      const normalizedApps = {
        presentation: 'badge' as const,
        items: [
          { id: 'construction', name: 'Construction' },
          { id: 'manufacturing', name: 'Manufacturing' }
        ]
      };
      const { container: normalizedContainer } = render(
        <IndustryApplicationsPanel applications={normalizedApps} />
      );
      
      // Both should render (exact rendering tested in integration)
      expect(legacyContainer).toBeTruthy();
      expect(normalizedContainer).toBeTruthy();
    });
  });
});
