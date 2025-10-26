/**
 * @module unicodeNormalizer
 * @purpose Automatically converts unicode escape sequences to actual unicode characters
 * @dependencies None (pure function)
 * @usage Import normalizeUnicode or normalizeAllTextFields and apply to frontmatter
 */

const UNICODE_MAP: Record<string, string> = {
  '\\xB3': '³',  // superscript 3
  '\\xB2': '²',  // superscript 2
  '\\xB9': '¹',  // superscript 1
  '\\xB0': '°',  // degree symbol
  '\\xB5': 'µ',  // micro (mu) - alternative encoding
  '\\xB7': '·',  // middle dot
  '\\xD7': '×',  // multiplication sign
  '\\u03BC': 'μ', // micro (mu)
  '\\u03A9': 'Ω', // Omega (ohm)
  '\\u0394': 'Δ', // Delta
  '\\u221A': '√', // square root
  '\\u207B': '⁻', // superscript minus
  '\\u2070': '⁰', // superscript 0
  '\\u00B9': '¹', // superscript 1 (alternative)
  '\\u00B2': '²', // superscript 2 (alternative)
  '\\u00B3': '³', // superscript 3 (alternative)
  '\\u2074': '⁴', // superscript 4
  '\\u2075': '⁵', // superscript 5
  '\\u2076': '⁶', // superscript 6
  '\\u2077': '⁷', // superscript 7
  '\\u2078': '⁸', // superscript 8
  '\\u2079': '⁹', // superscript 9
};

/**
 * Normalize unicode escape sequences in a single string
 * @param text - Text potentially containing unicode escapes
 * @returns Text with unicode characters properly rendered
 */
export function normalizeUnicode(text: string | undefined): string {
  if (!text || typeof text !== 'string') return text || '';
  
  let normalized = text;
  
  for (const [escape, char] of Object.entries(UNICODE_MAP)) {
    if (normalized.includes(escape)) {
      normalized = normalized.split(escape).join(char);
    }
  }
  
  return normalized;
}

/**
 * Recursively normalize unicode in all text fields of an object
 * @param data - Data structure (string, array, or object)
 * @returns Data with all text fields normalized
 */
export function normalizeAllTextFields(data: any): any {
  // Handle strings
  if (typeof data === 'string') {
    return normalizeUnicode(data);
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(normalizeAllTextFields);
  }
  
  // Handle objects
  if (typeof data === 'object' && data !== null) {
    const result: any = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = normalizeAllTextFields(value);
    }
    return result;
  }
  
  // Return primitives as-is
  return data;
}
