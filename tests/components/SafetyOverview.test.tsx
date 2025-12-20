/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { SafetyOverview } from '@/app/components/Contaminants/SafetyOverview';

// Mock child components to isolate SafetyOverview testing
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
  SectionContainer: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section data-testid="section-container">
      <h2>{title}</h2>
      {children}
    </section>
  ),
}));

describe('SafetyOverview', () => {
  describe('Rendering', () => {
    it('renders nothing when safetyData is null', () => {
      const { container } = render(<SafetyOverview safetyData={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when safetyData is undefined', () => {
      const { container } = render(<SafetyOverview safetyData={undefined} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders Safety Information section when data provided', () => {
      const safetyData = {
        fire_explosion_risk: 'moderate'
      };

      render(<SafetyOverview safetyData={safetyData} />);
      expect(screen.getByText('Safety Information')).toBeInTheDocument();
    });
  });

  describe('Simple String Risk Format (Materials)', () => {
    it('renders fire_explosion_risk as simple string', () => {
      const safetyData = {
        fire_explosion_risk: 'moderate'
      };

      render(<SafetyOverview safetyData={safetyData} />);
      
      const riskCard = screen.getByTestId('risk-card-Fire/Explosion Risk');
      expect(within(riskCard).getByText('moderate')).toBeInTheDocument();
    });

    it('renders toxic_gas_risk as simple string', () => {
      const safetyData = {
        toxic_gas_risk: 'high'
      };

      render(<SafetyOverview safetyData={safetyData} />);
      
      const riskCard = screen.getByTestId('risk-card-Toxic Gas Risk');
      expect(within(riskCard).getByText('high')).toBeInTheDocument();
    });

    it('renders visibility_hazard as simple string', () => {
      const safetyData = {
        visibility_hazard: 'critical'
      };

      render(<SafetyOverview safetyData={safetyData} />);
      
      const riskCard = screen.getByTestId('risk-card-Visibility Hazard');
      expect(within(riskCard).getByText('critical')).toBeInTheDocument();
    });

    it('renders all three risk types with simple strings', () => {
      const safetyData = {
        fire_explosion_risk: 'moderate',
        toxic_gas_risk: 'high',
        visibility_hazard: 'low'
      };

      render(<SafetyOverview safetyData={safetyData} />);
      
      expect(screen.getByTestId('risk-card-Fire/Explosion Risk')).toBeInTheDocument();
      expect(screen.getByTestId('risk-card-Toxic Gas Risk')).toBeInTheDocument();
      expect(screen.getByTestId('risk-card-Visibility Hazard')).toBeInTheDocument();
    });
  });

  describe('Nested Object Risk Format (Contaminants)', () => {
    it('extracts severity from fire_explosion_risk nested object', () => {
      const safetyData = {
        fire_explosion_risk: {
          severity: 'high',
          description: 'Explosive dust clouds can form',
          mitigation: 'Use explosion-proof equipment'
        }
      };

      render(<SafetyOverview safetyData={safetyData} />);
      
      const riskCard = screen.getByTestId('risk-card-Fire/Explosion Risk');
      expect(within(riskCard).getByText('high')).toBeInTheDocument();
    });

    it('extracts severity from toxic_gas_risk nested object', () => {
      const safetyData = {
        toxic_gas_risk: {
          severity: 'critical',
          description: 'Releases toxic fumes',
          mitigation: 'Ensure proper ventilation'
        }
      };

      render(<SafetyOverview safetyData={safetyData} />);
      
      const riskCard = screen.getByTestId('risk-card-Toxic Gas Risk');
      expect(within(riskCard).getByText('critical')).toBeInTheDocument();
    });

    it('extracts severity from visibility_hazard nested object', () => {
      const safetyData = {
        visibility_hazard: {
          severity: 'moderate',
          description: 'Dense smoke reduces visibility',
          mitigation: 'Use adequate lighting'
        }
      };

      render(<SafetyOverview safetyData={safetyData} />);
      
      const riskCard = screen.getByTestId('risk-card-Visibility Hazard');
      expect(within(riskCard).getByText('moderate')).toBeInTheDocument();
    });

    it('handles all three risk types with nested objects', () => {
      const safetyData = {
        fire_explosion_risk: { severity: 'moderate', description: 'Test', mitigation: 'Test' },
        toxic_gas_risk: { severity: 'high', description: 'Test', mitigation: 'Test' },
        visibility_hazard: { severity: 'low', description: 'Test', mitigation: 'Test' }
      };

      render(<SafetyOverview safetyData={safetyData} />);
      
      const fireCard = screen.getByTestId('risk-card-Fire/Explosion Risk');
      expect(within(fireCard).getByText('moderate')).toBeInTheDocument();
      
      const toxicCard = screen.getByTestId('risk-card-Toxic Gas Risk');
      expect(within(toxicCard).getByText('high')).toBeInTheDocument();
      
      const visibilityCard = screen.getByTestId('risk-card-Visibility Hazard');
      expect(within(visibilityCard).getByText('low')).toBeInTheDocument();
    });
  });

  describe('Dual Format Support (v1.2)', () => {
    it('handles mixed simple string and nested object formats', () => {
      const safetyData = {
        fire_explosion_risk: 'moderate',  // Simple string (materials)
        toxic_gas_risk: { severity: 'high', description: 'Test' },  // Nested object (contaminants)
        visibility_hazard: 'low'  // Simple string (materials)
      };

      render(<SafetyOverview safetyData={safetyData} />);
      
      const fireCard = screen.getByTestId('risk-card-Fire/Explosion Risk');
      expect(within(fireCard).getByText('moderate')).toBeInTheDocument();
      
      const toxicCard = screen.getByTestId('risk-card-Toxic Gas Risk');
      expect(within(toxicCard).getByText('high')).toBeInTheDocument();
      
      const visibilityCard = screen.getByTestId('risk-card-Visibility Hazard');
      expect(within(visibilityCard).getByText('low')).toBeInTheDocument();
    });
  });

  describe('PPE Requirements', () => {
    it('renders PPE requirements card when present', () => {
      const safetyData = {
        ppe_requirements: {
          respiratory: 'P100 Respirator',
          eye_protection: 'Safety Goggles',
          skin_protection: 'Leather Gloves'
        }
      };

      render(<SafetyOverview safetyData={safetyData} />);
      
      const ppeCard = screen.getByTestId('info-card-PPE Requirements');
      expect(ppeCard).toBeInTheDocument();
      expect(within(ppeCard).getByText('P100 Respirator')).toBeInTheDocument();
      expect(within(ppeCard).getByText('Safety Goggles')).toBeInTheDocument();
      expect(within(ppeCard).getByText('Leather Gloves')).toBeInTheDocument();
    });

    it('filters out missing PPE fields', () => {
      const safetyData = {
        ppe_requirements: {
          respiratory: 'P100 Respirator',
          // eye_protection and skin_protection missing
        }
      };

      render(<SafetyOverview safetyData={safetyData} />);
      
      const ppeCard = screen.getByTestId('info-card-PPE Requirements');
      expect(within(ppeCard).getByText('P100 Respirator')).toBeInTheDocument();
      // Should only show respiratory, not empty fields
    });

    it('does not render PPE card when missing', () => {
      const safetyData = {
        fire_explosion_risk: 'moderate'
      };

      render(<SafetyOverview safetyData={safetyData} />);
      
      expect(screen.queryByTestId('info-card-PPE Requirements')).not.toBeInTheDocument();
    });
  });

  describe('Ventilation Requirements', () => {
    it('renders ventilation requirements card when present', () => {
      const safetyData = {
        ventilation_requirements: {
          minimum_air_changes_per_hour: 12,
          exhaust_velocity_m_s: 1.5,
          filtration_type: 'HEPA'
        }
      };

      render(<SafetyOverview safetyData={safetyData} />);
      
      const ventCard = screen.getByTestId('info-card-Ventilation Requirements');
      expect(ventCard).toBeInTheDocument();
      expect(within(ventCard).getByText('12')).toBeInTheDocument();
      expect(within(ventCard).getByText('1.5 m/s')).toBeInTheDocument();
      expect(within(ventCard).getByText('HEPA')).toBeInTheDocument();
    });

    it('filters out missing ventilation fields', () => {
      const safetyData = {
        ventilation_requirements: {
          minimum_air_changes_per_hour: 10
          // other fields missing
        }
      };

      render(<SafetyOverview safetyData={safetyData} />);
      
      const ventCard = screen.getByTestId('info-card-Ventilation Requirements');
      expect(within(ventCard).getByText('10')).toBeInTheDocument();
    });
  });

  describe('Particulate Generation', () => {
    it('renders particulate generation card when present', () => {
      const safetyData = {
        particulate_generation: {
          respirable_fraction: 0.85,
          size_range_um: [0.1, 10]
        }
      };

      render(<SafetyOverview safetyData={safetyData} />);
      
      const partCard = screen.getByTestId('info-card-Particulate Generation');
      expect(partCard).toBeInTheDocument();
      expect(within(partCard).getByText('85%')).toBeInTheDocument();
      expect(within(partCard).getByText('0.1-10 μm')).toBeInTheDocument();
    });

    it('handles respirable_fraction of 0.0', () => {
      const safetyData = {
        particulate_generation: {
          respirable_fraction: 0.0,
          size_range_um: [1, 5]
        }
      };

      render(<SafetyOverview safetyData={safetyData} />);
      
      const partCard = screen.getByTestId('info-card-Particulate Generation');
      // 0.0 * 100 = 0%
      expect(within(partCard).getByText('0%')).toBeInTheDocument();
    });

    it('handles respirable_fraction of 1.0', () => {
      const safetyData = {
        particulate_generation: {
          respirable_fraction: 1.0,
          size_range_um: [0.1, 2.5]
        }
      };

      render(<SafetyOverview safetyData={safetyData} />);
      
      const partCard = screen.getByTestId('info-card-Particulate Generation');
      // 1.0 * 100 = 100%
      expect(within(partCard).getByText('100%')).toBeInTheDocument();
    });
  });

  describe('Substrate Compatibility Warnings', () => {
    it('renders warnings section when present', () => {
      const safetyData = {
        substrate_compatibility_warnings: [
          'Not suitable for wood substrates',
          'May damage painted surfaces'
        ]
      };

      render(<SafetyOverview safetyData={safetyData} />);
      
      expect(screen.getByText('Substrate Compatibility Warnings')).toBeInTheDocument();
      expect(screen.getByText('Not suitable for wood substrates')).toBeInTheDocument();
      expect(screen.getByText('May damage painted surfaces')).toBeInTheDocument();
    });

    it('does not render warnings section when array is empty', () => {
      const safetyData = {
        substrate_compatibility_warnings: []
      };

      render(<SafetyOverview safetyData={safetyData} />);
      
      expect(screen.queryByText('Substrate Compatibility Warnings')).not.toBeInTheDocument();
    });

    it('does not render warnings section when missing', () => {
      const safetyData = {
        fire_explosion_risk: 'moderate'
      };

      render(<SafetyOverview safetyData={safetyData} />);
      
      expect(screen.queryByText('Substrate Compatibility Warnings')).not.toBeInTheDocument();
    });
  });

  describe('Unified Safety Grid', () => {
    it('renders unified 3-column grid with all components', () => {
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

      render(<SafetyOverview safetyData={safetyData} />);
      
      // All 6 cards should render in unified grid
      expect(screen.getByTestId('risk-card-Fire/Explosion Risk')).toBeInTheDocument();
      expect(screen.getByTestId('risk-card-Toxic Gas Risk')).toBeInTheDocument();
      expect(screen.getByTestId('risk-card-Visibility Hazard')).toBeInTheDocument();
      expect(screen.getByTestId('info-card-PPE Requirements')).toBeInTheDocument();
      expect(screen.getByTestId('info-card-Ventilation Requirements')).toBeInTheDocument();
      expect(screen.getByTestId('info-card-Particulate Generation')).toBeInTheDocument();
    });

    it('handles partial data (only some cards present)', () => {
      const safetyData = {
        fire_explosion_risk: 'moderate',
        ppe_requirements: {
          respiratory: 'P100 Respirator'
        }
      };

      render(<SafetyOverview safetyData={safetyData} />);
      
      // Only 2 cards should render
      expect(screen.getByTestId('risk-card-Fire/Explosion Risk')).toBeInTheDocument();
      expect(screen.getByTestId('info-card-PPE Requirements')).toBeInTheDocument();
      
      // Other cards should not render
      expect(screen.queryByTestId('risk-card-Toxic Gas Risk')).not.toBeInTheDocument();
      expect(screen.queryByTestId('info-card-Ventilation Requirements')).not.toBeInTheDocument();
    });
  });

  describe('Integration with SAFETY_RISK_SEVERITY_SCHEMA.md', () => {
    it('supports all severity levels from schema', () => {
      const levels = ['critical', 'high', 'moderate', 'medium', 'low', 'none'];
      
      levels.forEach((level) => {
        const safetyData = {
          fire_explosion_risk: level
        };

        const { unmount } = render(<SafetyOverview safetyData={safetyData} />);
        
        const riskCard = screen.getByTestId('risk-card-Fire/Explosion Risk');
        expect(within(riskCard).getByText(level)).toBeInTheDocument();
        
        unmount();
      });
    });

    it('follows schema field names exactly', () => {
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

      render(<SafetyOverview safetyData={safetyData} />);
      
      // All schema-compliant fields should render
      expect(screen.getByTestId('risk-card-Fire/Explosion Risk')).toBeInTheDocument();
      expect(screen.getByTestId('risk-card-Toxic Gas Risk')).toBeInTheDocument();
      expect(screen.getByTestId('risk-card-Visibility Hazard')).toBeInTheDocument();
      expect(screen.getByTestId('info-card-PPE Requirements')).toBeInTheDocument();
      expect(screen.getByTestId('info-card-Ventilation Requirements')).toBeInTheDocument();
      expect(screen.getByTestId('info-card-Particulate Generation')).toBeInTheDocument();
    });
  });
});
