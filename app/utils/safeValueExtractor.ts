// app/utils/safeValueExtractor.ts
// Safe value extraction utilities

export function extractSafeValue(obj: any, key: string, defaultValue: any = null): any {
  if (!obj || typeof obj !== 'object') return defaultValue;
  return obj.hasOwnProperty(key) ? obj[key] : defaultValue;
}

export function getSafeString(value: any, fallback: string = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return fallback;
}

export function getSafeArray(value: any, fallback: any[] = []): any[] {
  return Array.isArray(value) ? value : fallback;
}