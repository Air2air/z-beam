/**
 * Formatting Utilities Tests
 * 
 * Tests for cleanupFloat and formatWithUnit functions extracted from MetricsCard
 */

import { cleanupFloat, formatWithUnit } from '@/app/utils/formatting';

describe('cleanupFloat', () => {
  
  describe('Number Input', () => {
    it('rounds to 2 decimal places', () => {
      expect(cleanupFloat(3.14159)).toBe('3.14');
      expect(cleanupFloat(2.71828)).toBe('2.72');
      expect(cleanupFloat(1.999)).toBe('2');
    });

    it('removes unnecessary trailing zeros', () => {
      expect(cleanupFloat(3.10)).toBe('3.1');
      expect(cleanupFloat(5.00)).toBe('5');
      expect(cleanupFloat(10.50)).toBe('10.5');
    });

    it('handles whole numbers', () => {
      expect(cleanupFloat(42)).toBe('42');
      expect(cleanupFloat(100)).toBe('100');
      expect(cleanupFloat(0)).toBe('0');
    });

    it('handles negative numbers', () => {
      expect(cleanupFloat(-3.14159)).toBe('-3.14');
      expect(cleanupFloat(-5.00)).toBe('-5');
      expect(cleanupFloat(-0.005)).toBe('-0.01'); // Rounds to -0.01 (2 decimal places)
    });

    it('handles very small numbers', () => {
      expect(cleanupFloat(0.001)).toBe('0');
      expect(cleanupFloat(0.005)).toBe('0.01');
      expect(cleanupFloat(0.009)).toBe('0.01');
    });

    it('handles very large numbers', () => {
      expect(cleanupFloat(1000000.123456)).toBe('1.00M');  // Formatted with M suffix
      expect(cleanupFloat(999999.99)).toBe('1000.00K');  // Formatted with K suffix
    });

    it('handles zero', () => {
      expect(cleanupFloat(0)).toBe('0');
      expect(cleanupFloat(0.00)).toBe('0');
      expect(cleanupFloat(-0)).toBe('0');
    });
  });

  describe('String Input', () => {
    it('parses string numbers correctly', () => {
      expect(cleanupFloat('3.14159')).toBe('3.14');
      expect(cleanupFloat('42')).toBe('42');
      expect(cleanupFloat('100.00')).toBe('100');
    });

    it('handles strings with spaces', () => {
      expect(cleanupFloat('  3.14  ')).toBe('3.14');
    });

    it('handles negative string numbers', () => {
      expect(cleanupFloat('-5.55')).toBe('-5.55');
    });
  });

  describe('Invalid Input', () => {
    it('returns original value for NaN', () => {
      expect(cleanupFloat('not a number')).toBe('not a number');
      expect(cleanupFloat('abc')).toBe('abc');
      expect(cleanupFloat('')).toBe('');
    });

    it('handles undefined gracefully', () => {
      expect(cleanupFloat(undefined as any)).toBe('undefined');
    });

    it('handles null gracefully', () => {
      expect(cleanupFloat(null as any)).toBe('0'); // null converts to 0 via parseFloat
    });
  });

  describe('Edge Cases', () => {
    it('handles Infinity', () => {
      const result = cleanupFloat(Infinity);
      expect(result).toBe('Infinity');
    });

    it('handles -Infinity', () => {
      const result = cleanupFloat(-Infinity);
      expect(result).toBe('-Infinity');
    });

    it('handles scientific notation', () => {
      expect(cleanupFloat(1e-5)).toBe('0');
      expect(cleanupFloat(1e5)).toBe('100.00K');  // 100,000 formatted with K suffix
      expect(cleanupFloat(1.23e2)).toBe('123');
    });

    it('handles floating point precision issues', () => {
      expect(cleanupFloat(0.1 + 0.2)).toBe('0.3');  // JavaScript: 0.30000000000000004
    });
  });
});

describe('formatWithUnit', () => {
  
  describe('With Unit', () => {
    it('formats number with unit', () => {
      expect(formatWithUnit(42, 'kg')).toBe('42 kg');
      expect(formatWithUnit(3.14, 'm/s')).toBe('3.14 m/s');
      expect(formatWithUnit(100, '°C')).toBe('100 °C');
    });

    it('rounds to 2 decimal places', () => {
      expect(formatWithUnit(3.14159, 'MPa')).toBe('3.14 MPa');
      expect(formatWithUnit(2.71828, 'GPa')).toBe('2.72 GPa');
    });

    it('removes trailing zeros', () => {
      expect(formatWithUnit(5.00, 'nm')).toBe('5 nm');
      expect(formatWithUnit(10.50, 'μm')).toBe('10.5 μm');
    });

    it('handles negative values', () => {
      expect(formatWithUnit(-273.15, '°C')).toBe('-273.15 °C');
    });

    it('handles string numbers', () => {
      expect(formatWithUnit('42.5', 'kg')).toBe('42.5 kg');
    });
  });

  describe('Without Unit', () => {
    it('returns just the number when unit is empty string', () => {
      expect(formatWithUnit(42, '')).toBe('42');
      expect(formatWithUnit(3.14, '')).toBe('3.14');
    });

    it('returns just the number when unit is not provided', () => {
      expect(formatWithUnit(42)).toBe('42');
      expect(formatWithUnit(3.14)).toBe('3.14');
    });
  });

  describe('Special Units', () => {
    it('handles degree symbols', () => {
      expect(formatWithUnit(25, '°C')).toBe('25 °C');
      expect(formatWithUnit(77, '°F')).toBe('77 °F');
    });

    it('handles fraction bars', () => {
      expect(formatWithUnit(9.8, 'm/s²')).toBe('9.8 m/s²');
      expect(formatWithUnit(340, 'm/s')).toBe('340 m/s');
    });

    it('handles Greek letters', () => {
      expect(formatWithUnit(1.5, 'μm')).toBe('1.5 μm');
      expect(formatWithUnit(0.5, 'Ω')).toBe('0.5 Ω');
    });

    it('handles percentage', () => {
      expect(formatWithUnit(95.5, '%')).toBe('95.5 %');
    });
  });

  describe('Edge Cases', () => {
    it('handles zero', () => {
      expect(formatWithUnit(0, 'kg')).toBe('0 kg');
    });

    it('handles very large numbers', () => {
      // formatWithUnit uses cleanupFloat which formats millions with M suffix
      expect(formatWithUnit(1000000, 'Pa')).toBe('1.00M Pa');
    });

    it('handles very small numbers', () => {
      expect(formatWithUnit(0.001, 'mm')).toBe('0 mm');
      expect(formatWithUnit(0.01, 'mm')).toBe('0.01 mm');
    });

    it('handles invalid number input', () => {
      // Invalid strings are returned as-is by cleanupFloat
      expect(formatWithUnit('not a number', 'kg')).toBe('not a number kg');
    });
  });
});
