// app/utils/stringHelpers.ts
// Utility functions for safe string handling, especially for nested objects from frontmatter

/**
 * Helper function to safely extract string values from nested frontmatter structures
 * Handles cases where YAML parser creates objects like { title: "value" } instead of "value"
 */
export function extractSafeValue(value: any): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    // Handle nested patterns like { title: "value" } or { formula: "value" }
    const keys = Object.keys(value);
    if (keys.length === 1) {
      const firstKey = keys[0];
      const nestedValue = value[firstKey];
      if (typeof nestedValue === 'string') return nestedValue;
    }
    // Fallback to converting the object to JSON string
    return JSON.stringify(value);
  }
  return String(value || '');
}

/**
 * Safely convert any value to string for use with string methods like .includes() or .match()
 */
export function toSafeString(value: any): string {
  return extractSafeValue(value);
}

/**
 * Safely call .includes() on a potentially nested object value
 */
export function safeIncludes(value: any, searchString: string): boolean {
  const str = extractSafeValue(value);
  return str.includes(searchString);
}

/**
 * Safely call .match() on a potentially nested object value
 */
export function safeMatch(value: any, regexp: RegExp): RegExpMatchArray | null {
  const str = extractSafeValue(value);
  return str.match(regexp);
}
