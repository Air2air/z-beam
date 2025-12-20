/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { InfoCard } from '@/app/components/InfoCard/InfoCard';
import { Shield, Wind, AlertTriangle } from 'lucide-react';

describe('InfoCard', () => {
  describe('Rendering', () => {
    it('renders with required props', () => {
      const data = [
        { label: 'Test Label', value: 'Test Value' }
      ];

      render(
        <InfoCard
          icon={Shield}
          title="Test Title"
          data={data}
        />
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Label')).toBeInTheDocument();
      expect(screen.getByText('Test Value')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const data = [{ label: 'Label', value: 'Value' }];
      const { container } = render(
        <InfoCard
          icon={Shield}
          title="Title"
          data={data}
          className="custom-class"
        />
      );

      const card = container.querySelector('.custom-class');
      expect(card).toBeInTheDocument();
    });

    it('renders icon correctly', () => {
      const data = [{ label: 'Label', value: 'Value' }];
      const { container } = render(
        <InfoCard
          icon={Wind}
          title="Title"
          data={data}
        />
      );

      // Icon should be present and have aria-hidden
      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Data Handling', () => {
    it('renders single data item', () => {
      const data = [
        { label: 'Single Label', value: 'Single Value' }
      ];

      render(
        <InfoCard
          icon={Shield}
          title="Single Data"
          data={data}
        />
      );

      expect(screen.getByText('Single Label')).toBeInTheDocument();
      expect(screen.getByText('Single Value')).toBeInTheDocument();
    });

    it('renders multiple data items', () => {
      const data = [
        { label: 'Label 1', value: 'Value 1' },
        { label: 'Label 2', value: 'Value 2' },
        { label: 'Label 3', value: 'Value 3' }
      ];

      render(
        <InfoCard
          icon={Shield}
          title="Multiple Data"
          data={data}
        />
      );

      expect(screen.getByText('Label 1')).toBeInTheDocument();
      expect(screen.getByText('Value 1')).toBeInTheDocument();
      expect(screen.getByText('Label 2')).toBeInTheDocument();
      expect(screen.getByText('Value 2')).toBeInTheDocument();
      expect(screen.getByText('Label 3')).toBeInTheDocument();
      expect(screen.getByText('Value 3')).toBeInTheDocument();
    });

    it('handles string values', () => {
      const data = [
        { label: 'String Test', value: 'Text Value' }
      ];

      render(
        <InfoCard
          icon={Shield}
          title="String Values"
          data={data}
        />
      );

      expect(screen.getByText('Text Value')).toBeInTheDocument();
    });

    it('handles numeric values', () => {
      const data = [
        { label: 'Numeric Test', value: 42 }
      ];

      render(
        <InfoCard
          icon={Shield}
          title="Numeric Values"
          data={data}
        />
      );

      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('handles empty data array gracefully', () => {
      const data: Array<{ label: string; value: string | number }> = [];

      const { container } = render(
        <InfoCard
          icon={Shield}
          title="Empty Data"
          data={data}
        />
      );

      // Should still render title
      expect(screen.getByText('Empty Data')).toBeInTheDocument();

      // Data container should exist but be empty
      const spaceY = container.querySelector('.space-y-2');
      expect(spaceY).toBeInTheDocument();
      expect(spaceY?.children.length).toBe(0);
    });
  });

  describe('PPE Requirements Format', () => {
    it('renders PPE requirements correctly', () => {
      const data = [
        { label: 'Respiratory Protection', value: 'P100 Respirator' },
        { label: 'Eye Protection', value: 'Safety Goggles' },
        { label: 'Skin Protection', value: 'Leather Gloves' }
      ];

      render(
        <InfoCard
          icon={Shield}
          title="PPE Requirements"
          data={data}
        />
      );

      expect(screen.getByText('PPE Requirements')).toBeInTheDocument();
      expect(screen.getByText('Respiratory Protection')).toBeInTheDocument();
      expect(screen.getByText('P100 Respirator')).toBeInTheDocument();
      expect(screen.getByText('Eye Protection')).toBeInTheDocument();
      expect(screen.getByText('Safety Goggles')).toBeInTheDocument();
      expect(screen.getByText('Skin Protection')).toBeInTheDocument();
      expect(screen.getByText('Leather Gloves')).toBeInTheDocument();
    });
  });

  describe('Ventilation Requirements Format', () => {
    it('renders ventilation data correctly', () => {
      const data = [
        { label: 'Air Changes Per Hour', value: 12 },
        { label: 'Exhaust Velocity', value: '1.5 m/s' },
        { label: 'Filtration Type', value: 'HEPA' }
      ];

      render(
        <InfoCard
          icon={Wind}
          title="Ventilation Requirements"
          data={data}
        />
      );

      expect(screen.getByText('Ventilation Requirements')).toBeInTheDocument();
      expect(screen.getByText('Air Changes Per Hour')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('Exhaust Velocity')).toBeInTheDocument();
      expect(screen.getByText('1.5 m/s')).toBeInTheDocument();
      expect(screen.getByText('Filtration Type')).toBeInTheDocument();
      expect(screen.getByText('HEPA')).toBeInTheDocument();
    });
  });

  describe('Particulate Generation Format', () => {
    it('renders particulate data correctly', () => {
      const data = [
        { label: 'Respirable Fraction', value: '85%' },
        { label: 'Size Range', value: '0.1-10 μm' }
      ];

      render(
        <InfoCard
          icon={AlertTriangle}
          title="Particulate Generation"
          data={data}
        />
      );

      expect(screen.getByText('Particulate Generation')).toBeInTheDocument();
      expect(screen.getByText('Respirable Fraction')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('Size Range')).toBeInTheDocument();
      expect(screen.getByText('0.1-10 μm')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('has proper container structure', () => {
      const data = [{ label: 'Test', value: 'Value' }];
      const { container } = render(
        <InfoCard
          icon={Shield}
          title="Structure Test"
          data={data}
        />
      );

      // Should have bg-gray-800/50 rounded-md border
      const card = container.querySelector('.bg-gray-800\\/50.rounded-md.border');
      expect(card).toBeInTheDocument();
    });

    it('has icon and title header', () => {
      const data = [{ label: 'Test', value: 'Value' }];
      const { container } = render(
        <InfoCard
          icon={Shield}
          title="Header Test"
          data={data}
        />
      );

      // Should have flex items-center gap-2 header
      const header = container.querySelector('.flex.items-center.gap-2');
      expect(header).toBeInTheDocument();

      // Title should be h3 with proper classes
      const title = screen.getByText('Header Test');
      expect(title.tagName).toBe('H3');
      expect(title).toHaveClass('text-base', 'font-semibold', 'text-white');
    });

    it('renders data items with proper spacing', () => {
      const data = [
        { label: 'Item 1', value: 'Value 1' },
        { label: 'Item 2', value: 'Value 2' }
      ];

      const { container } = render(
        <InfoCard
          icon={Shield}
          title="Spacing Test"
          data={data}
        />
      );

      // Should have space-y-2 for data items
      const dataContainer = container.querySelector('.space-y-2');
      expect(dataContainer).toBeInTheDocument();
      expect(dataContainer?.children.length).toBe(2);
    });
  });

  describe('Styling', () => {
    it('applies correct label styling', () => {
      const data = [{ label: 'Styled Label', value: 'Value' }];

      render(
        <InfoCard
          icon={Shield}
          title="Styling Test"
          data={data}
        />
      );

      const label = screen.getByText('Styled Label');
      expect(label).toHaveClass('text-xs', 'text-gray-400');
    });

    it('applies correct value styling', () => {
      const data = [{ label: 'Label', value: 'Styled Value' }];

      render(
        <InfoCard
          icon={Shield}
          title="Styling Test"
          data={data}
        />
      );

      const value = screen.getByText('Styled Value');
      expect(value).toHaveClass('text-white', 'text-base', 'font-medium');
    });

    it('applies correct icon styling', () => {
      const data = [{ label: 'Label', value: 'Value' }];
      const { container } = render(
        <InfoCard
          icon={Shield}
          title="Icon Styling"
          data={data}
        />
      );

      const icon = container.querySelector('.text-blue-400');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('w-5', 'h-5');
    });
  });

  describe('Accessibility', () => {
    it('uses semantic HTML', () => {
      const data = [{ label: 'Label', value: 'Value' }];

      render(
        <InfoCard
          icon={Shield}
          title="Semantic Test"
          data={data}
        />
      );

      // Title should be h3
      const title = screen.getByText('Semantic Test');
      expect(title.tagName).toBe('H3');
    });

    it('icon has aria-hidden for screen readers', () => {
      const data = [{ label: 'Label', value: 'Value' }];
      const { container } = render(
        <InfoCard
          icon={Shield}
          title="Accessibility Test"
          data={data}
        />
      );

      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });

    it('has proper text hierarchy', () => {
      const data = [{ label: 'Small Label', value: 'Large Value' }];

      render(
        <InfoCard
          icon={Shield}
          title="Hierarchy Test"
          data={data}
        />
      );

      // Label should be smaller (text-xs)
      const label = screen.getByText('Small Label');
      expect(label).toHaveClass('text-xs');

      // Value should be larger (text-base)
      const value = screen.getByText('Large Value');
      expect(value).toHaveClass('text-base');
    });
  });

  describe('Integration with SAFETY_RISK_SEVERITY_SCHEMA.md', () => {
    it('supports PPE requirements structure', () => {
      const data = [
        { label: 'Respiratory Protection', value: 'P100 Respirator' },
        { label: 'Eye Protection', value: 'Safety Goggles' },
        { label: 'Skin Protection', value: 'Leather Gloves' }
      ];

      render(
        <InfoCard
          icon={Shield}
          title="PPE Requirements"
          data={data}
        />
      );

      // All three PPE fields should render
      expect(screen.getByText('Respiratory Protection')).toBeInTheDocument();
      expect(screen.getByText('Eye Protection')).toBeInTheDocument();
      expect(screen.getByText('Skin Protection')).toBeInTheDocument();
    });

    it('supports ventilation requirements structure', () => {
      const data = [
        { label: 'Air Changes Per Hour', value: 10 },
        { label: 'Exhaust Velocity', value: '1.2 m/s' },
        { label: 'Filtration Type', value: 'HEPA' }
      ];

      render(
        <InfoCard
          icon={Wind}
          title="Ventilation Requirements"
          data={data}
        />
      );

      // All three ventilation fields should render
      expect(screen.getByText('Air Changes Per Hour')).toBeInTheDocument();
      expect(screen.getByText('Exhaust Velocity')).toBeInTheDocument();
      expect(screen.getByText('Filtration Type')).toBeInTheDocument();
    });

    it('supports particulate generation structure', () => {
      const data = [
        { label: 'Respirable Fraction', value: '75%' },
        { label: 'Size Range', value: '0.1-5 μm' }
      ];

      render(
        <InfoCard
          icon={AlertTriangle}
          title="Particulate Generation"
          data={data}
        />
      );

      // Both particulate fields should render
      expect(screen.getByText('Respirable Fraction')).toBeInTheDocument();
      expect(screen.getByText('Size Range')).toBeInTheDocument();
    });
  });
});
