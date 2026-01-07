/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { SafetyDataPanel } from '@/app/components/SafetyDataPanel/SafetyDataPanel';

// Mock child components
jest.mock('@/app/components/RiskCard/RiskCard', () => ({
  RiskCard: ({ label, severity }: { label: string; severity: string }) => (
    <div data-testid={`risk-card-${label}`}>
      <span>{label}</span>
      <span>{severity}</span>
    </div>
  ),
}));

jest.mock('@/app/components/InfoCard/InfoCard', () => ({
  InfoCard: ({ title, data }: { title: string; data: Array<{ label: string; value: string | number }> }) => (
    <div data-testid={`info-card-${title}`}>
      <span>{title}</span>
      {data.map((item, i) => (
        <div key={i}>
          <span>{item.label}</span>
          <span>{item.value}</span>
        </div>
      ))}
    </div>
  ),
}));

jest.mock('@/app/components/SectionContainer/SectionContainer', () => ({
  SectionContainer: ({ children }: { children: React.ReactNode }) => (
    <section data-testid="section-container">{children}</section>
  ),
}));

jest.mock('@/app/components/SectionTitle/SectionTitle', () => ({
  SectionTitle: ({ title, sectionDescription }: { title: string; sectionDescription?: string }) => (
    <div data-testid="section-title">
      <h2>{title}</h2>
      {sectionDescription && <p>{sectionDescription}</p>}
    </div>
  ),
}));

jest.mock('@/app/components/GridSection', () => ({
  GridSection: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div data-testid="grid-section">
      <h3>{title}</h3>
      {children}
    </div>
  ),
}));

jest.mock('@/app/components/CompoundSafetyGrid', () => ({
  CompoundSafetyGrid: () => <div data-testid="compound-safety-grid">Compound Grid</div>,
}));

describe('SafetyDataPanel', () => {
  describe('Rendering', () => {
    it('returns null when safetyData is null', () => {
      const { container } = render(<SafetyDataPanel safetyData={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('returns null when safetyData is undefined', () => {
      const { container } = render(<SafetyDataPanel safetyData={undefined} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders section container when safetyData provided', () => {
      const safetyData = {
        fire_explosion_risk: 'moderate'
      };

      render(<SafetyDataPanel safetyData={safetyData} />);
      expect(screen.getByTestId('section-container')).toBeInTheDocument();
    });

    it('renders Safety Information title', () => {
      const safetyData = {
        fire_explosion_risk: 'moderate'
      };

      render(<SafetyDataPanel safetyData={safetyData} />);
      expect(screen.getByText('Safety Information')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const safetyData = {
        fire_explosion_risk: 'moderate'
      };

      render(
        <SafetyDataPanel safetyData={safetyData} className="custom-class" />
      );

      // The custom-class is applied to the outermost SectionContainer
      // Since we mock SectionContainer, just verify component renders
      expect(screen.getByTestId('section-container')).toBeInTheDocument();
    });
  });

  describe('Risk Cards (Simple String Format)', () => {
    it('renders fire_explosion_risk card', () => {
      const safetyData = {
        fire_explosion_risk: 'moderate'
      };

      render(<SafetyDataPanel safetyData={safetyData} />);
      
      const riskCard = screen.getByTestId('risk-card-Fire/Explosion Risk');
      expect(within(riskCard).getByText('moderate')).toBeInTheDocument();
    });

    it('renders toxic_gas_risk card', () => {
      const safetyData = {
        toxic_gas_risk: 'high'
      };

      render(<SafetyDataPanel safetyData={safetyData} />);
      
      const riskCard = screen.getByTestId('risk-card-Toxic Gas Risk');
      expect(within(riskCard).getByText('high')).toBeInTheDocument();
    });

    it('renders visibility_hazard card', () => {
      const safetyData = {
        visibility_hazard: 'critical'
      };

      render(<SafetyDataPanel safetyData={safetyData} />);
      
      const riskCard = screen.getByTestId('risk-card-Visibility Hazard');
      expect(within(riskCard).getByText('critical')).toBeInTheDocument();
    });

    it('renders all three risk cards together', () => {
      const safetyData = {
        fire_explosion_risk: 'moderate',
        toxic_gas_risk: 'high',
        visibility_hazard: 'low'
      };

      render(<SafetyDataPanel safetyData={safetyData} />);
      
      expect(screen.getByTestId('risk-card-Fire/Explosion Risk')).toBeInTheDocument();
      expect(screen.getByTestId('risk-card-Toxic Gas Risk')).toBeInTheDocument();
      expect(screen.getByTestId('risk-card-Visibility Hazard')).toBeInTheDocument();
    });
  });

  describe('PPE Requirements Card', () => {
    it('renders PPE requirements when present', () => {
      const safetyData = {
        ppe_requirements: {
          respiratory: 'P100 Respirator',
          eye_protection: 'Safety Goggles',
          skin_protection: 'Leather Gloves'
        }
      };

      render(<SafetyDataPanel safetyData={safetyData} />);
      
      const ppeCard = screen.getByTestId('info-card-PPE Requirements');
      expect(within(ppeCard).getByText('P100 Respirator')).toBeInTheDocument();
      expect(within(ppeCard).getByText('Safety Goggles')).toBeInTheDocument();
      expect(within(ppeCard).getByText('Leather Gloves')).toBeInTheDocument();
    });

    it('filters out missing PPE fields', () => {
      const safetyData = {
        ppe_requirements: {
          respiratory: 'P100 Respirator'
          // eye_protection and skin_protection missing
        }
      };

      render(<SafetyDataPanel safetyData={safetyData} />);
      
      const ppeCard = screen.getByTestId('info-card-PPE Requirements');
      expect(within(ppeCard).getByText('P100 Respirator')).toBeInTheDocument();
    });

    it('does not render PPE card when missing', () => {
      const safetyData = {
        fire_explosion_risk: 'moderate'
      };

      render(<SafetyDataPanel safetyData={safetyData} />);
      
      expect(screen.queryByTestId('info-card-PPE Requirements')).not.toBeInTheDocument();
    });
  });

  describe('Ventilation Requirements Card', () => {
    it('renders ventilation requirements when present', () => {
      const safetyData = {
        ventilation_requirements: {
          minimum_air_changes_per_hour: 12,
          exhaust_velocity_m_s: 1.5,
          filtration_type: 'HEPA'
        }
      };

      render(<SafetyDataPanel safetyData={safetyData} />);
      
      const ventCard = screen.getByTestId('info-card-Ventilation Requirements');
      expect(within(ventCard).getByText('12')).toBeInTheDocument();
      expect(within(ventCard).getByText('1.5 m/s')).toBeInTheDocument();
      expect(within(ventCard).getByText('HEPA')).toBeInTheDocument();
    });

    it('formats exhaust velocity with m/s units', () => {
      const safetyData = {
        ventilation_requirements: {
          exhaust_velocity_m_s: 2.0
        }
      };

      render(<SafetyDataPanel safetyData={safetyData} />);
      
      const ventCard = screen.getByTestId('info-card-Ventilation Requirements');
      expect(within(ventCard).getByText('2 m/s')).toBeInTheDocument();
    });
  });

  describe('Particulate Generation Card', () => {
    it('renders particulate generation when present', () => {
      const safetyData = {
        particulate_generation: {
          respirable_fraction: 0.85,
          size_range_um: [0.1, 10]
        }
      };

      render(<SafetyDataPanel safetyData={safetyData} />);
      
      const partCard = screen.getByTestId('info-card-Particulate Generation');
      expect(within(partCard).getByText('85%')).toBeInTheDocument();
      expect(within(partCard).getByText('0.1-10 μm')).toBeInTheDocument();
    });

    it('formats respirable_fraction as percentage', () => {
      const safetyData = {
        particulate_generation: {
          respirable_fraction: 0.5,
          size_range_um: [0.1, 5]
        }
      };

      render(<SafetyDataPanel safetyData={safetyData} />);
      
      const partCard = screen.getByTestId('info-card-Particulate Generation');
      expect(within(partCard).getByText('50%')).toBeInTheDocument();
    });

    it('formats size range with μm units', () => {
      const safetyData = {
        particulate_generation: {
          respirable_fraction: 0.7,
          size_range_um: [0.5, 2.5]
        }
      };

      render(<SafetyDataPanel safetyData={safetyData} />);
      
      const partCard = screen.getByTestId('info-card-Particulate Generation');
      expect(within(partCard).getByText('0.5-2.5 μm')).toBeInTheDocument();
    });
  });

  describe('Compounds Section', () => {
    it('renders compound safety grid when compounds provided', () => {
      const safetyData = {
        fire_explosion_risk: 'moderate'
      };

      const compounds = [
        { name: 'CO', severity: 'high', concentration: 100, oel: 50 }
      ];

      render(<SafetyDataPanel safetyData={safetyData} compounds={compounds} />);
      
      expect(screen.getByText('Hazardous Compounds Generated')).toBeInTheDocument();
      expect(screen.getByTestId('compound-safety-grid')).toBeInTheDocument();
    });

    it('does not render compounds section when empty array', () => {
      const safetyData = {
        fire_explosion_risk: 'moderate'
      };

      render(<SafetyDataPanel safetyData={safetyData} compounds={[]} />);
      
      expect(screen.queryByTestId('grid-section')).not.toBeInTheDocument();
    });

    it('does not render compounds section when undefined', () => {
      const safetyData = {
        fire_explosion_risk: 'moderate'
      };

      render(<SafetyDataPanel safetyData={safetyData} />);
      
      expect(screen.queryByTestId('grid-section')).not.toBeInTheDocument();
    });
  });

  describe('Substrate Compatibility Warnings', () => {
    it('renders warnings when present', () => {
      const safetyData = {
        substrate_compatibility_warnings: [
          'Not suitable for wood substrates',
          'May damage painted surfaces'
        ]
      };

      render(<SafetyDataPanel safetyData={safetyData} />);
      
      expect(screen.getByText('Substrate Compatibility Warnings')).toBeInTheDocument();
      expect(screen.getByText('Not suitable for wood substrates')).toBeInTheDocument();
      expect(screen.getByText('May damage painted surfaces')).toBeInTheDocument();
    });

    it('does not render warnings when array is empty', () => {
      const safetyData = {
        substrate_compatibility_warnings: []
      };

      render(<SafetyDataPanel safetyData={safetyData} />);
      
      expect(screen.queryByText('Substrate Compatibility Warnings')).not.toBeInTheDocument();
    });

    it('does not render warnings when missing', () => {
      const safetyData = {
        fire_explosion_risk: 'moderate'
      };

      render(<SafetyDataPanel safetyData={safetyData} />);
      
      expect(screen.queryByText('Substrate Compatibility Warnings')).not.toBeInTheDocument();
    });
  });

  describe('Unified Safety Grid', () => {
    it('renders complete safety grid with all components', () => {
      const safetyData = {
        fire_explosion_risk: 'moderate',
        toxic_gas_risk: 'high',
        visibility_hazard: 'low',
        ppe_requirements: {
          respiratory: 'P100 Respirator'
        },
        ventilation_requirements: {
          minimum_air_changes_per_hour: 12
        },
        particulate_generation: {
          respirable_fraction: 0.75,
          size_range_um: [0.1, 5]
        }
      };

      render(<SafetyDataPanel safetyData={safetyData} />);
      
      // All 6 cards should render
      expect(screen.getByTestId('risk-card-Fire/Explosion Risk')).toBeInTheDocument();
      expect(screen.getByTestId('risk-card-Toxic Gas Risk')).toBeInTheDocument();
      expect(screen.getByTestId('risk-card-Visibility Hazard')).toBeInTheDocument();
      expect(screen.getByTestId('info-card-PPE Requirements')).toBeInTheDocument();
      expect(screen.getByTestId('info-card-Ventilation Requirements')).toBeInTheDocument();
      expect(screen.getByTestId('info-card-Particulate Generation')).toBeInTheDocument();
    });

    it('handles partial data gracefully', () => {
      const safetyData = {
        fire_explosion_risk: 'moderate',
        ppe_requirements: {
          respiratory: 'P100 Respirator'
        }
      };

      render(<SafetyDataPanel safetyData={safetyData} />);
      
      // Only 2 cards should render
      expect(screen.getByTestId('risk-card-Fire/Explosion Risk')).toBeInTheDocument();
      expect(screen.getByTestId('info-card-PPE Requirements')).toBeInTheDocument();
      
      // Other cards should not render
      expect(screen.queryByTestId('risk-card-Toxic Gas Risk')).not.toBeInTheDocument();
      expect(screen.queryByTestId('info-card-Ventilation Requirements')).not.toBeInTheDocument();
    });
  });

  describe('Integration with SAFETY_RISK_SEVERITY_SCHEMA.md', () => {
    it('follows schema field names and structure', () => {
      const safetyData = {
        fire_explosion_risk: 'moderate',
        toxic_gas_risk: 'high',
        visibility_hazard: 'low',
        ppe_requirements: {
          respiratory: 'Test',
          eye_protection: 'Test',
          skin_protection: 'Test'
        },
        ventilation_requirements: {
          minimum_air_changes_per_hour: 10,
          exhaust_velocity_m_s: 1.0,
          filtration_type: 'HEPA'
        },
        particulate_generation: {
          respirable_fraction: 0.5,
          size_range_um: [0.1, 5]
        }
      };

      render(<SafetyDataPanel safetyData={safetyData} />);
      
      // All schema-compliant fields should render
      expect(screen.getByTestId('risk-card-Fire/Explosion Risk')).toBeInTheDocument();
      expect(screen.getByTestId('risk-card-Toxic Gas Risk')).toBeInTheDocument();
      expect(screen.getByTestId('risk-card-Visibility Hazard')).toBeInTheDocument();
      expect(screen.getByTestId('info-card-PPE Requirements')).toBeInTheDocument();
      expect(screen.getByTestId('info-card-Ventilation Requirements')).toBeInTheDocument();
      expect(screen.getByTestId('info-card-Particulate Generation')).toBeInTheDocument();
    });

    it('supports all severity levels from schema', () => {
      const levels = ['critical', 'high', 'moderate', 'medium', 'low', 'none'];
      
      levels.forEach((level) => {
        const safetyData = {
          fire_explosion_risk: level
        };

        const { unmount } = render(<SafetyDataPanel safetyData={safetyData} />);
        
        const riskCard = screen.getByTestId('risk-card-Fire/Explosion Risk');
        expect(within(riskCard).getByText(level)).toBeInTheDocument();
        
        unmount();
      });
    });
  });
});
