// app/utils/safeValueExtractor.ts
// Safe value extraction utilities

/**
 * Safely extract a value from an object with a default fallback
 * @param obj - Object to extract from
 * @param key - Property key to extract
 * @param defaultValue - Default value if key doesn't exist
 * @returns Extracted value or default
 */
export function extractSafeValue<T = unknown>(
  obj: Record<string, unknown> | null | undefined,
  key: string,
  defaultValue: T | null = null
): T | null {
  if (!obj || typeof obj !== 'object') return defaultValue;
  return obj.hasOwnProperty(key) ? (obj[key] as T) : defaultValue;
}

/**
 * Safely convert a value to string with fallback
 * @param value - Value to convert
 * @param fallback - Fallback string if conversion fails
 * @returns String representation or fallback
 */
export function getSafeString(value: unknown, fallback: string = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return fallback;
}

/**
 * Safely convert a value to array with fallback
 * @param value - Value to convert
 * @param fallback - Fallback array if value is not an array
 * @returns Array or fallback
 */
export function getSafeArray<T = unknown>(value: unknown, fallback: T[] = []): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}