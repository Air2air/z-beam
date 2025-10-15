/**
 * Search Utilities Tests
 * 
 * Tests for search URL generation functions extracted from MetricsCard
 */

import { generateSearchUrl, buildSearchUrl, buildPropertySearchUrl } from '../../app/utils/searchUtils';

describe('generateSearchUrl', () => {
  
  describe('Property Detection', () => {
    it('generates property search for temperature', () => {
      const url = generateSearchUrl('Temperature', 500);
      expect(url).toBe('/search?property=Temperature&value=500');
    });

    it('generates property search for pressure', () => {
      const url = generateSearchUrl('Pressure', 100);
      expect(url).toBe('/search?property=Pressure&value=100');
    });

    it('generates property search for density', () => {
      const url = generateSearchUrl('Density', 2.5);
      expect(url).toBe('/search?property=Density&value=2.5');
    });

    it('generates property search for conductivity', () => {
      const url = generateSearchUrl('Thermal Conductivity', 50);
      expect(url).toBe('/search?property=Thermal%20Conductivity&value=50');
    });

    it('generates property search for modulus', () => {
      const url = generateSearchUrl('Young Modulus', 200);
      expect(url).toBe('/search?property=Young%20Modulus&value=200');
    });

    it('generates property search for hardness', () => {
      const url = generateSearchUrl('Hardness', 7);
      expect(url).toBe('/search?property=Hardness&value=7');
    });
  });

  describe('Non-Property Detection', () => {
    it('generates general search for non-property terms', () => {
      const url = generateSearchUrl('Color', 'blue');
      expect(url).toBe('/search?q=blue');
    });

    it('generates general search for materials', () => {
      const url = generateSearchUrl('Material', 'Alumina');
      expect(url).toBe('/search?q=Alumina');
    });

    it('generates general search for names', () => {
      const url = generateSearchUrl('Name', 'Silicon Nitride');
      expect(url).toBe('/search?q=Silicon%20Nitride');
    });
  });

  describe('Full Property Name Override', () => {
    it('uses fullPropertyName when provided', () => {
      const url = generateSearchUrl('Temp', 500, 'thermal_conductivity_celsius');
      expect(url).toBe('/search?property=thermal_conductivity_celsius&value=500');
    });

    it('prioritizes fullPropertyName over title detection', () => {
      const url = generateSearchUrl('Some Title', 100, 'density_grams_per_cubic_cm');
      expect(url).toBe('/search?property=density_grams_per_cubic_cm&value=100');
    });

    it('encodes fullPropertyName correctly', () => {
      const url = generateSearchUrl('Title', 50, 'Young\'s Modulus (GPa)');
      expect(url).toContain('property=Young');
      expect(url).toContain('value=50');
    });
  });

  describe('Value Handling', () => {
    it('handles integer values', () => {
      const url = generateSearchUrl('Temperature', 500);
      expect(url).toContain('value=500');
    });

    it('handles decimal values', () => {
      const url = generateSearchUrl('Density', 2.75);
      expect(url).toContain('value=2.75');
    });

    it('handles string values', () => {
      const url = generateSearchUrl('Pressure', '100.5');
      expect(url).toContain('value=100.5');
    });

    it('cleans special characters from values', () => {
      const url = generateSearchUrl('Property', '100@#$%');
      // Property is not a known property keyword, so it uses general search
      expect(url).toBe('/search?q=100');
    });

    it('preserves dots and hyphens in values', () => {
      const url = generateSearchUrl('Property', '3.14-test');
      // Property is not a known property keyword, so it uses general search
      expect(url).toBe('/search?q=3.14-test');
    });
  });

  describe('URL Encoding', () => {
    it('encodes spaces in property names', () => {
      const url = generateSearchUrl('Thermal Expansion', 10);
      expect(url).toContain('property=Thermal%20Expansion');
    });

    it('encodes special characters in values', () => {
      const url = generateSearchUrl('Temperature', '100 °C');
      expect(url).toContain('value=100');
    });

    it('handles parentheses in titles', () => {
      const url = generateSearchUrl('Modulus (GPa)', 200);
      expect(url).toContain('property=Modulus');
    });
  });

  describe('Unit Detection', () => {
    it('detects MPa as property indicator', () => {
      const url = generateSearchUrl('Strength (MPa)', 100);
      expect(url).toContain('/search?property=');
    });

    it('detects GPa as property indicator', () => {
      const url = generateSearchUrl('Modulus (GPa)', 200);
      expect(url).toContain('/search?property=');
    });

    it('detects nm as property indicator', () => {
      const url = generateSearchUrl('Wavelength (nm)', 532);
      expect(url).toContain('/search?property=');
    });

    it('detects μm as property indicator', () => {
      const url = generateSearchUrl('Particle Size (μm)', 10);
      expect(url).toContain('/search?property=');
    });

    it('detects W/m as property indicator', () => {
      const url = generateSearchUrl('Conductivity (W/m·K)', 50);
      expect(url).toContain('/search?property=');
    });
  });

  describe('Abbreviated Forms', () => {
    it('detects "therm" as thermal property', () => {
      const url = generateSearchUrl('Therm Exp', 10);
      expect(url).toContain('/search?property=');
    });

    it('detects "cond" as conductivity', () => {
      const url = generateSearchUrl('Therm Cond', 50);
      expect(url).toContain('/search?property=');
    });

    it('detects "ten" as tensile', () => {
      const url = generateSearchUrl('Ten Strength', 300);
      expect(url).toContain('/search?property=');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty title', () => {
      const url = generateSearchUrl('', 100);
      expect(url).toContain('/search?q=100');
    });

    it('handles zero value', () => {
      const url = generateSearchUrl('Temperature', 0);
      expect(url).toContain('value=0');
    });

    it('handles negative values', () => {
      const url = generateSearchUrl('Temperature', -273);
      expect(url).toContain('value=-273');
    });

    it('handles very long titles', () => {
      const longTitle = 'Very Long Property Name That Contains Thermal Conductivity Information';
      const url = generateSearchUrl(longTitle, 50);
      expect(url).toContain('/search?property=');
    });
  });
});

describe('buildSearchUrl', () => {
  
  it('builds basic search URL', () => {
    const url = buildSearchUrl('alumina');
    expect(url).toBe('/search?q=alumina');
  });

  it('encodes spaces', () => {
    const url = buildSearchUrl('silicon nitride');
    expect(url).toBe('/search?q=silicon%20nitride');
  });

  it('encodes special characters', () => {
    const url = buildSearchUrl('laser & cleaning');
    expect(url).toBe('/search?q=laser%20%26%20cleaning');
  });

  it('handles empty query', () => {
    const url = buildSearchUrl('');
    expect(url).toBe('/search?q=');
  });

  it('handles multi-word queries', () => {
    const url = buildSearchUrl('precision laser ablation');
    expect(url).toBe('/search?q=precision%20laser%20ablation');
  });

  it('preserves hyphens', () => {
    const url = buildSearchUrl('silicon-carbide');
    expect(url).toBe('/search?q=silicon-carbide');
  });
});

describe('buildPropertySearchUrl', () => {
  
  it('builds property search URL', () => {
    const url = buildPropertySearchUrl('temperature', 500);
    expect(url).toBe('/search?property=temperature&value=500');
  });

  it('encodes property name with spaces', () => {
    const url = buildPropertySearchUrl('thermal conductivity', 50);
    expect(url).toBe('/search?property=thermal%20conductivity&value=50');
  });

  it('handles numeric values', () => {
    const url = buildPropertySearchUrl('density', 2.5);
    expect(url).toBe('/search?property=density&value=2.5');
  });

  it('handles string values', () => {
    const url = buildPropertySearchUrl('color', 'blue');
    expect(url).toBe('/search?property=color&value=blue');
  });

  it('handles negative values', () => {
    const url = buildPropertySearchUrl('temperature', -273);
    expect(url).toBe('/search?property=temperature&value=-273');
  });

  it('handles zero', () => {
    const url = buildPropertySearchUrl('offset', 0);
    expect(url).toBe('/search?property=offset&value=0');
  });

  it('encodes special characters in property names', () => {
    const url = buildPropertySearchUrl('Young\'s Modulus', 200);
    expect(url).toContain('property=Young');
  });

  it('encodes special characters in values', () => {
    const url = buildPropertySearchUrl('material', 'Al₂O₃');
    expect(url).toContain('value=Al');
  });

  it('handles units in property names', () => {
    const url = buildPropertySearchUrl('temperature (°C)', 25);
    expect(url).toContain('property=temperature');
  });
});
