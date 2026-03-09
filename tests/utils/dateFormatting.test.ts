/**
 * Tests for dateFormatting utility functions
 * Increases coverage for app/utils/dateFormatting.ts
 */

import {
  formatDate,
  getRelativeTime,
} from '@/app/utils/dateFormatting';

describe('dateFormatting utilities', () => {
  describe('formatDate', () => {
    it('should format date string to localized date', () => {
      const date = '2024-01-15';
      const formatted = formatDate(date);
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
      expect(formatted).toContain('2024');
      expect(formatted).toContain('Jan');
    });

    it('should handle empty string', () => {
      const formatted = formatDate('');
      expect(formatted).toBe('');
    });

    it('should handle undefined', () => {
      const formatted = formatDate(undefined);
      expect(formatted).toBe('');
    });

    it('should handle valid ISO date strings', () => {
      const date = '2024-01-15T10:30:00Z';
      const formatted = formatDate(date);
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });
  });

  describe('getRelativeTime', () => {
    const fixedNow = new Date('2026-03-09T12:00:00.000Z');

    beforeAll(() => {
      jest.useFakeTimers();
    });

    beforeEach(() => {
      jest.setSystemTime(fixedNow);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should return "Today" for current date', () => {
      const today = new Date().toISOString();
      const relative = getRelativeTime(today);
      expect(relative).toBe('Today');
    });

    it('should return "Yesterday" for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const relative = getRelativeTime(yesterday.toISOString());
      expect(relative).toBe('Yesterday');
    });

    it('should return days ago for recent dates', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const relative = getRelativeTime(threeDaysAgo.toISOString());
      expect(relative).toBe('3 days ago');
    });

    it('should return weeks ago for older dates', () => {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const relative = getRelativeTime(twoWeeksAgo.toISOString());
      expect(relative).toBe('2 weeks ago');
    });

    it('should return months ago for even older dates', () => {
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);
      const relative = getRelativeTime(twoMonthsAgo.toISOString());
      expect(relative).toContain('months ago');
    });

    it('should return years ago for very old dates', () => {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      const relative = getRelativeTime(twoYearsAgo.toISOString());
      expect(relative).toContain('years ago');
    });

    it('should handle empty string', () => {
      const relative = getRelativeTime('');
      expect(relative).toBe('');
    });

    it('should handle undefined', () => {
      const relative = getRelativeTime(undefined);
      expect(relative).toBe('');
    });
  });
});
