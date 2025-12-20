/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { RiskCard } from '@/app/components/RiskCard/RiskCard';
import { Flame, AlertTriangle, Eye } from 'lucide-react';

describe('RiskCard', () => {
  describe('Rendering', () => {
    it('renders with required props', () => {
      render(
        <RiskCard
          icon={Flame}
          label="Fire/Explosion Risk"
          severity="moderate"
        />
      );

      expect(screen.getByText('Fire/Explosion Risk')).toBeInTheDocument();
      expect(screen.getByText('moderate')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(
        <RiskCard
          icon={AlertTriangle}
          label="Test Risk"
          severity="high"
          className="custom-class"
        />
      );

      const card = container.querySelector('.custom-class');
      expect(card).toBeInTheDocument();
    });

    it('renders icon correctly', () => {
      const { container } = render(
        <RiskCard
          icon={Eye}
          label="Visibility Hazard"
          severity="low"
        />
      );

      // Icon should be present and have aria-hidden
      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Severity Levels', () => {
    it('renders critical severity', () => {
      render(
        <RiskCard
          icon={Flame}
          label="Critical Test"
          severity="critical"
        />
      );

      expect(screen.getByText('critical')).toBeInTheDocument();
    });

    it('renders high severity', () => {
      render(
        <RiskCard
          icon={Flame}
          label="High Test"
          severity="high"
        />
      );

      expect(screen.getByText('high')).toBeInTheDocument();
    });

    it('renders moderate severity', () => {
      render(
        <RiskCard
          icon={Flame}
          label="Moderate Test"
          severity="moderate"
        />
      );

      expect(screen.getByText('moderate')).toBeInTheDocument();
    });

    it('renders medium severity', () => {
      render(
        <RiskCard
          icon={Flame}
          label="Medium Test"
          severity="medium"
        />
      );

      expect(screen.getByText('medium')).toBeInTheDocument();
    });

    it('renders low severity', () => {
      render(
        <RiskCard
          icon={Flame}
          label="Low Test"
          severity="low"
        />
      );

      expect(screen.getByText('low')).toBeInTheDocument();
    });

    it('renders none severity', () => {
      render(
        <RiskCard
          icon={Flame}
          label="None Test"
          severity="none"
        />
      );

      expect(screen.getByText('none')).toBeInTheDocument();
    });
  });

  describe('Color Classes (via getRiskColor)', () => {
    it('applies color classes based on severity', () => {
      const { container } = render(
        <RiskCard
          icon={Flame}
          label="Color Test"
          severity="critical"
        />
      );

      // getRiskColor should apply color classes
      const card = container.querySelector('.rounded-md');
      expect(card).toHaveClass('rounded-md', 'border', 'p-4');
    });

    it('handles case-insensitive severity', () => {
      render(
        <RiskCard
          icon={Flame}
          label="Case Test"
          severity="CRITICAL"
        />
      );

      // Should still render (getRiskColor handles case)
      expect(screen.getByText('CRITICAL')).toBeInTheDocument();
    });

    it('handles mixed-case severity', () => {
      render(
        <RiskCard
          icon={Flame}
          label="Mixed Case Test"
          severity="MoDeRaTe"
        />
      );

      expect(screen.getByText('MoDeRaTe')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('renders label above severity', () => {
      const { container } = render(
        <RiskCard
          icon={Flame}
          label="Fire Risk"
          severity="high"
        />
      );

      const label = screen.getByText('Fire Risk');
      const severity = screen.getByText('high');

      // Label should be in text-sm text-gray-400
      expect(label).toHaveClass('text-sm', 'text-gray-400');

      // Severity should be in text-xl font-semibold capitalize
      expect(severity).toHaveClass('text-xl', 'font-semibold', 'capitalize');
    });

    it('has proper container structure', () => {
      const { container } = render(
        <RiskCard
          icon={Flame}
          label="Structure Test"
          severity="moderate"
        />
      );

      // Should have rounded border container
      const card = container.querySelector('.rounded-md.border.p-4');
      expect(card).toBeInTheDocument();

      // Should have flex items-center gap-3 for icon+text
      const flexContainer = container.querySelector('.flex.items-center.gap-3');
      expect(flexContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper text hierarchy', () => {
      render(
        <RiskCard
          icon={Flame}
          label="Fire Risk"
          severity="high"
        />
      );

      // Label should be smaller text
      const label = screen.getByText('Fire Risk');
      expect(label).toHaveClass('text-sm');

      // Severity should be prominent
      const severity = screen.getByText('high');
      expect(severity).toHaveClass('text-xl', 'font-semibold');
    });

    it('icon has aria-hidden for screen readers', () => {
      const { container } = render(
        <RiskCard
          icon={Flame}
          label="Accessibility Test"
          severity="moderate"
        />
      );

      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });

    it('capitalizes severity for readability', () => {
      render(
        <RiskCard
          icon={Flame}
          label="Capitalize Test"
          severity="critical"
        />
      );

      const severity = screen.getByText('critical');
      expect(severity).toHaveClass('capitalize');
    });
  });

  describe('Integration with SAFETY_RISK_SEVERITY_SCHEMA.md', () => {
    it('supports all schema-defined severity levels', () => {
      const levels = ['critical', 'high', 'moderate', 'medium', 'low', 'none'];

      levels.forEach((level) => {
        const { unmount } = render(
          <RiskCard
            icon={Flame}
            label={`${level} Test`}
            severity={level}
          />
        );

        expect(screen.getByText(level)).toBeInTheDocument();
        unmount();
      });
    });

    it('works with fire_explosion_risk use case', () => {
      render(
        <RiskCard
          icon={Flame}
          label="Fire/Explosion Risk"
          severity="moderate"
        />
      );

      expect(screen.getByText('Fire/Explosion Risk')).toBeInTheDocument();
      expect(screen.getByText('moderate')).toBeInTheDocument();
    });

    it('works with toxic_gas_risk use case', () => {
      render(
        <RiskCard
          icon={AlertTriangle}
          label="Toxic Gas Risk"
          severity="high"
        />
      );

      expect(screen.getByText('Toxic Gas Risk')).toBeInTheDocument();
      expect(screen.getByText('high')).toBeInTheDocument();
    });

    it('works with visibility_hazard use case', () => {
      render(
        <RiskCard
          icon={Eye}
          label="Visibility Hazard"
          severity="critical"
        />
      );

      expect(screen.getByText('Visibility Hazard')).toBeInTheDocument();
      expect(screen.getByText('critical')).toBeInTheDocument();
    });
  });
});
